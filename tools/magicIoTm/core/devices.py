"""
Business logic for IoTManager device management.

All functions previously in app.py have been extracted here for modularity.
Global state is stored in state/globals.py.
"""

import json
import os
import re
import shutil
import socket
import struct
import subprocess
import time
import threading
import ipaddress
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

from utils import ws_client, ota
import state.globals as globals_
from state.globals import (
    _device_folders_lock, _device_folders,
    _devices_lock, _devices,
    _device_states_lock, _device_states,
    _scan_lock, _scan_state,
    _fetch_progress,
)

# ==================== Constants ====================
MULTICAST_GROUP = "239.255.255.255"
MULTICAST_PORT = 4210
DEVICES_TIMEOUT = 90
PING_SKIP_AFTER_MULTICAST = 70.0
HTTP_TIMEOUT = 2.0
PING_TIMEOUT_MS = 700
PING_CONCURRENCY = 64
PING_INTERVAL = 60.0
FAILS_YELLOW = 3
FAILS_RED = 3

# ==================== Device States ====================
STATE_GREEN = "green"
STATE_YELLOW = "yellow"
STATE_RED = "red"
STATE_GREY = "grey"

# ==================== Paths ====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEVICE_DIR_ROOT = os.path.normpath(os.path.join(BASE_DIR, "..", "devices"))

_ssid_cache = {"value": None, "ts": 0.0}
_SSID_TTL = 300


# ==================== Logging ====================
import logging
logger = logging.getLogger(__name__)


# ==================== Multicast Device Detection ====================
_devices = {}  # ip -> {ip, name, wg, id, status, fv, last_seen}
_device_thread = None


def _mark_device_seen(ip, name=""):
    """Marks multicast packet arrival from IP (updates device attributes)."""
    now = time.time()
    with _devices_lock:
        old = _devices.get(ip)
        _devices[ip] = {
            "ip": ip,
            "name": name or (old or {}).get("name", ""),
            "wg": (old or {}).get("wg", ""),
            "id": (old or {}).get("id", ""),
            "status": bool((old or {}).get("status", False)),
            "fv": (old or {}).get("fv", ""),
            "last_seen": now,
        }


def _get_state(key):
    """Returns state-machine record for folder key (creates on first access)."""
    with _device_states_lock:
        st = _device_states.get(key)
        if st is None:
            st = {"state": STATE_GREY, "fails": 0, "last_confirm": 0.0}
            _device_states[key] = st
        return st


def _confirm_device(key, now=None):
    """Confirms device (multicast or ping+settings): sets green, resets counter."""
    with _device_states_lock:
        st = _device_states.setdefault(
            key, {"state": STATE_GREY, "fails": 0, "last_confirm": 0.0})
        st["state"] = STATE_GREEN
        st["fails"] = 0
        st["last_confirm"] = now or time.time()


def _next_state(cur, fails, confirmed, ping_ok):
    """Computes next state of the device status state machine.

    Args:
      cur       - current state ("grey"/"green"/"yellow"/"red")
      fails     - current ping failure counter
      confirmed - identity confirmed (multicast or ping+settings)
      ping_ok   - ping succeeded

    Returns: (new_state, new_fails).
    """
    if confirmed:
        return STATE_GREEN, 0
    if ping_ok:
        return STATE_GREY, 0
    f = fails + 1
    if cur == STATE_GREEN:
        return (STATE_YELLOW if f <= FAILS_YELLOW else STATE_RED), f
    if cur == STATE_YELLOW:
        return (STATE_RED if f > FAILS_RED else STATE_YELLOW), f
    return cur, f


def _enforce_single_green(ip, keys, confirmed_here):
    """Ensures only one device can be green per IP address."""
    with _device_states_lock:
        green_here = [k for k in keys
                      if _device_states.get(k, {}).get("state") == STATE_GREEN]
        if len(green_here) > 1:
            keep = confirmed_here[0] if confirmed_here else green_here[0]
            for k in green_here:
                if k != keep:
                    st = _device_states[k]
                    st["state"] = STATE_GREY
                    st["fails"] = 0
                    logger.warning(f"One green on IP {ip}: {keep} stays, {k} -> grey")
            green_here = [keep]
    return list(green_here)


def _fetch_settings_identity(ip):
    """Downloads settings.json from device and returns (name, id) or None.

    Used as identity confirmation via ping when multicast is unavailable.
    """
    if _device_busy_fetching(ip) or ota.busy_ip() == ip:
        return None
    try:
        data = ws_client.fetch_settings(ip)
    except Exception:
        logger.warning(f"Could not get settings.json from {ip}")
        return None
    if not data:
        return None
    return str(data.get("name", "")), str(data.get("id", ""))


def _device_busy_fetching(ip):
    """True if a section fetch is currently active for this IP."""
    return any(
        st.get("stage") == "running" and st.get("ip") == ip
        for st in _fetch_progress.values()
    )


def _ping_cycle():
    """One cycle of background device checks (ping + identity confirmation)."""
    now = time.time()
    with _device_folders_lock:
        entries = [(e["key"], e.get("ip")) for e in _device_folders.values() if e.get("ip")]

    by_ip = {}
    for key, ip in entries:
        if _device_busy_fetching(ip) or ota.busy_ip() == ip:
            continue
        by_ip.setdefault(ip, []).append(key)

    for ip, keys in by_ip.items():
        with _devices_lock:
            live = _devices.get(ip)
        confirmed_here = []
        live_name = str(live.get("name", "")) if live else ""
        live_id = str(live.get("id", "")) if live else ""
        mc_fresh = bool(live) and (now - live["last_seen"]) <= DEVICES_TIMEOUT
        mc_no_ping = bool(live) and (now - live["last_seen"]) <= PING_SKIP_AFTER_MULTICAST
        pending = []
        for key in keys:
            if mc_fresh and key in _folder_key_candidates(
                    str(live.get("name", "")), str(live.get("id", "")), ip):
                _confirm_device(key, now)
                confirmed_here.append(key)
            else:
                pending.append(key)
        if pending and not mc_no_ping:
            if _host_pingable(ip):
                logger.info(f"Ping OK: {ip}")
                sj = _fetch_settings_identity(ip)
                sj_name, sj_id = (sj[0], sj[1]) if sj else ("", "")
                sj_keys = set(_folder_key_candidates(sj[0], sj[1], ip)) if sj else set()
                for key in pending:
                    if key in sj_keys:
                        _confirm_device(key, now)
                        confirmed_here.append(key)
                        logger.info(f"Ping+settings OK: {ip} ({key})")
                    else:
                        with _device_states_lock:
                            st = _device_states.setdefault(
                                key, {"state": STATE_GREY, "fails": 0, "last_confirm": 0.0})
                            st["state"], st["fails"] = _next_state(
                                st["state"], st["fails"], False, True)
                        logger.info(f"Ping OK, no identity confirmation: {ip} ({key})")
            else:
                logger.info(f"Ping fail (no response): {ip}")
                for key in pending:
                    with _device_states_lock:
                        st = _device_states.setdefault(
                            key, {"state": STATE_GREY, "fails": 0, "last_confirm": 0.0})
                        st["state"], st["fails"] = _next_state(
                            st["state"], st["fails"], False, False)
                    logger.info(f"Ping fail: {ip} ({key}), fails: {st['fails']}")
        elif pending and mc_no_ping:
            logger.info(f"Ping skipped for {ip}: fresh multicast "
                        f"({now - live['last_seen']:.0f} sec ago)")
        _enforce_single_green(ip, keys, confirmed_here)
        logger.info(f"Status cycle IP={ip} keys={keys} "
                    f"live='{live_name}/{live_id}' confirmed={confirmed_here}")


def _ping_worker():
    """Background thread: ping devices every PING_INTERVAL seconds."""
    time.sleep(1)
    while True:
        try:
            _ping_cycle()
        except Exception as e:
            logger.error(f"Ping cycle error: {e}")
        time.sleep(PING_INTERVAL)


def start_ping_worker():
    """Start background device ping (idempotent). First cycle starts immediately."""
    if globals_._ping_thread and globals_._ping_thread.is_alive():
        return
    globals_._ping_thread = threading.Thread(target=_ping_worker, daemon=True,
                                     name="device-ping-worker")
    globals_._ping_thread.start()


def _grey_peers_on_ip(src_ip, mc_candidates, confirmed_keys):
    """Moves to grey folders sharing the same IP but not matching by name+id."""
    with _device_folders_lock:
        peers = [k for k, e in _device_folders.items() if e.get("ip") == src_ip]
    with _device_states_lock:
        for key in peers:
            if key in confirmed_keys or key in mc_candidates:
                continue
            st = _device_states.setdefault(
                key, {"state": STATE_GREY, "fails": 0, "last_confirm": 0.0})
            if st["state"] != STATE_GREY:
                st["state"] = STATE_GREY
                st["fails"] = 0
                logger.info(f"Multicast {src_ip}: {key} -> grey (no name+id match)")


def _ingest_payload(src_ip, text):
    """Parse payload: JSON array or single object. IP taken from packet header."""
    try:
        obj = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        logger.warning(f"Multicast from {src_ip}: not JSON ({text[:120]!r})")
        return
    items = obj if isinstance(obj, list) else [obj]
    logger.info(f"Multicast from {src_ip}, objects: {len(items)}, data: {text}")
    mc_candidates = set()
    confirmed_keys = []
    for it in items:
        if not isinstance(it, dict):
            continue
        name = str(it.get("name", ""))
        dev_id = str(it.get("id", ""))
        mc_candidates.update(_folder_key_candidates(name, dev_id, src_ip))
        _mark_device_seen(src_ip, name=name)
        with _devices_lock:
            live = _devices.get(src_ip)
            if live:
                live["wg"] = str(it.get("wg", ""))
                live["id"] = dev_id
                live["status"] = bool(it.get("status", False))
                live["fv"] = it.get("fv", "")
        entry = ensure_device_folder(src_ip, name, dev_id)
        if entry and entry["key"] in mc_candidates:
            _confirm_device(entry["key"])
            confirmed_keys.append(entry["key"])
    _grey_peers_on_ip(src_ip, mc_candidates, confirmed_keys)


def _build_devices_payload():
    """Current device list with network status, sorted.

    Source is device folders: key = base folder name (unique on disk),
    so EVERY folder is displayed as a separate device.
    """
    now = time.time()
    with _device_folders_lock:
        folder_entries = list(_device_folders.values())
    devices = []
    for e in folder_entries:
        ip = e.get("ip")
        dev = {
            "key": e["key"],
            "ip": ip or "",
            "name": e["name"],
            "wg": "",
            "id": "",
            "status": False,
            "fv": "",
            "online": False,
            "missed": 0,
            "net": "grey",
        }
        live = None
        if ip:
            with _devices_lock:
                live = _devices.get(ip)
        if live:
            dev["wg"] = live["wg"]
            dev["id"] = live["id"]
            dev["status"] = bool(live["status"])
            dev["fv"] = live["fv"]
        st = _get_state(e["key"])
        dev["net"] = st["state"]
        dev["missed"] = st["fails"]
        dev["online"] = st["state"] == STATE_GREEN
        devices.append(dev)
    with _devices_lock:
        known_ips = {d["ip"] for d in devices}
        for src_ip, d in _devices.items():
            if src_ip in known_ips:
                continue
            online = (now - d["last_seen"]) <= DEVICES_TIMEOUT
            devices.append({
                "key": src_ip,
                "ip": src_ip,
                "name": d["name"],
                "wg": d["wg"],
                "id": d["id"],
                "status": bool(d["status"]),
                "fv": d["fv"],
                "online": online,
                "missed": 0,
                "net": "green" if online else "grey",
            })
    devices.sort(key=lambda x: (not x["online"], x["ip"], x["key"]))
    return {"success": True, "devices": devices}


def _devices_signature():
    """Signature of device set for change detection in SSE stream."""
    now = time.time()
    with _device_folders_lock:
        folder_keys = tuple(sorted(_device_folders.keys()))
    with _devices_lock:
        online = tuple(sorted(
            (d["ip"], round(d["last_seen"], 1), (now - d["last_seen"]) <= DEVICES_TIMEOUT)
            for d in _devices.values()))
    with _device_states_lock:
        states = tuple(sorted(
            (k, v["state"], v["fails"])
            for k, v in _device_states.items()
            if k in folder_keys))
    return (folder_keys, online, states)


def _device_listener():
    """Background thread: receive multicast packets from IoTManager devices."""
    logger.info(f"Multicast listener: {MULTICAST_GROUP}:{MULTICAST_PORT}")
    sock = None
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        if hasattr(socket, "SO_REUSEPORT"):
            try:
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
            except OSError:
                pass
        sock.bind(("", MULTICAST_PORT))
        mreq = struct.pack("=4s4s", socket.inet_aton(MULTICAST_GROUP),
                           socket.inet_aton("0.0.0.0"))
        sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
        sock.settimeout(0.5)
    except OSError as e:
        logger.error(f"Could not setup multicast socket: {e}")
        return

    while True:
        try:
            data, addr = sock.recvfrom(65535)
        except socket.timeout:
            continue
        except OSError:
            break
        try:
            text = data.decode("utf-8")
        except UnicodeDecodeError:
            text = data.decode("latin-1", errors="replace")
        _ingest_payload(addr[0], text)

    if sock:
        sock.close()
    logger.info("Multicast listener stopped")


def start_device_listener():
    """Start multicast listener thread (idempotent)."""
    if globals_._device_thread and globals_._device_thread.is_alive():
        return
    globals_._device_thread = threading.Thread(target=_device_listener, daemon=True,
                                      name="device-multicast-listener")
    globals_._device_thread.start()


# ==================== Device Folders on Disk ====================


def _sanitize_name(name):
    """Sanitizes name for use as folder name (no special characters)."""
    if not name:
        return "unnamed"
    s = re.sub(r"[\\\\/:*?\"<>|]+", "_", str(name))
    s = re.sub(r"\\s+", "_", s).strip("._ ")
    return s or "unnamed"


def _get_wifi_ssid():
    """[DEPRECATED] Gets laptop WiFi SSID (netsh), cached. Fallback: 'NET'."""
    now = time.time()
    if _ssid_cache["value"] and (now - _ssid_cache["ts"]) < _SSID_TTL:
        return _ssid_cache["value"]
    ssid = "NET"
    try:
        out = subprocess.run(
            ["netsh", "wlan", "show", "interfaces"],
            capture_output=True, text=True,
            encoding="cp1251", errors="replace", timeout=5,
        ).stdout or ""
        for line in out.splitlines():
            if "SSID" in line and "BSSID" not in line:
                val = line.split(":", 1)[-1].strip()
                if val:
                    ssid = val
                    break
    except Exception as e:
        logger.warning(f"Could not determine laptop SSID: {e}")
    _ssid_cache["value"] = ssid
    _ssid_cache["ts"] = now
    return ssid


def _folder_base_name(name, dev_id, ip):
    """Canonical base folder name: <name> <id>, or <name> <ip>."""
    return _folder_key_candidates(name, dev_id, ip)[0]


def _folder_key_candidates(name, dev_id, ip):
    """Possible folder keys for (name, id/ip): new separator ' ' and legacy '_'.

    Backward compatibility: folders created with separator '_' must continue
    to match, so no duplicates after update.
    """
    base = _sanitize_name(name)
    if dev_id:
        return [f"{base} {dev_id}", f"{base}_{dev_id}"]
    return [f"{base} {ip}", f"{base}_{ip}"]


def _device_meta_path(folder):
    """Path to device meta file inside device folder."""
    return os.path.join(folder, ".device.json")


def _load_folder_meta(folder):
    """Reads .device.json from device folder (ip/name/id)."""
    try:
        with open(_device_meta_path(folder), "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def _save_folder_meta(entry):
    """Saves ip/name/id device tuple to folder meta file."""
    try:
        with open(_device_meta_path(entry["folder"]), "w", encoding="utf-8") as f:
            json.dump({
                "key": entry["key"],
                "ip": entry.get("ip"),
                "name": entry.get("name"),
                "id": entry.get("id", ""),
                "wg": entry.get("wg", ""),
            }, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.warning(f"Could not save device meta {entry['folder']}: {e}")


def _register_folder_entry(key, ip=None, name=None, create=True):
    """Registers device folder entry in _device_folders.

    Key = base folder name (unique on disk). IP is just an attribute.
    """
    folder = os.path.join(DEVICE_DIR_ROOT, key)
    ram_dir = os.path.join(folder, "RAM")
    fs_dir = os.path.join(folder, "FS")
    if create:
        try:
            os.makedirs(ram_dir, exist_ok=True)
            os.makedirs(fs_dir, exist_ok=True)
        except Exception as e:
            logger.error(f"Could not prepare device folder {folder}: {e}")
    entry = {
        "key": key,
        "folder": folder,
        "ram_dir": ram_dir,
        "fs_dir": fs_dir,
        "name": name if name is not None else key,
        "ip": ip,
    }
    with _device_folders_lock:
        _device_folders[key] = entry
    _save_folder_meta(entry)
    logger.info(f"Device folder: {folder}")
    return entry


def ensure_device_folder(ip, name, dev_id=""):
    """Creates/returns device folder with key <name> <id> (separator is space).

    Idempotent: if folder with this name already exists in memory or on disk,
    not recreated. On repeated discovery by broadcast, UPDATES
    the current IP record (otherwise device forever stays offline).
    """
    base = _folder_base_name(name, dev_id, ip)
    with _device_folders_lock:
        for cand in _folder_key_candidates(name, dev_id, ip):
            entry = _device_folders.get(cand)
            if entry is None:
                continue
            if entry.get("ip") != ip:
                entry["ip"] = ip
                logger.info(f"Updated IP for device '{cand}': {ip}")
                _save_folder_meta(entry)
            return entry
    return _register_folder_entry(base, ip=ip, name=base)


def get_device_folder(key):
    """Returns device folder entry by key (base name) or None."""
    with _device_folders_lock:
        e = _device_folders.get(key)
        if e:
            return e
        for ek, e in _device_folders.items():
            if e.get("ip") == key:
                return e
        key_normalized = key.replace(" ", "_")
        for ek, e in _device_folders.items():
            if ek == key_normalized or ek.replace(" ", "_") == key_normalized:
                return e
    return None


def _scan_device_folders():
    """Registers entries for ALL folders from DEVICE_DIR_ROOT."""
    if not os.path.isdir(DEVICE_DIR_ROOT):
        return
    with _device_folders_lock:
        known = set(_device_folders.keys())
    for folder_name in sorted(os.listdir(DEVICE_DIR_ROOT)):
        if folder_name in known:
            continue
        folder = os.path.join(DEVICE_DIR_ROOT, folder_name)
        if not os.path.isdir(folder):
            continue
        meta = _load_folder_meta(folder)
        if meta:
            ip = meta.get("ip") or None
            name = meta.get("name") or folder_name
            dev_id = meta.get("id", "")
        else:
            m = re.search(r"\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}", folder_name)
            ip = m.group(0) if m else None
            name = folder_name
            dev_id = ""
        _register_folder_entry(folder_name, ip=ip, name=name)
        if dev_id and meta is None:
            with _device_folders_lock:
                _device_folders[folder_name]["id"] = dev_id


# ==================== Network Scanning ====================


def _is_useful_interface(ip):
    """Checks that interface may contain IoT devices."""
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return False
    if addr.is_loopback:
        return False
    if addr.is_link_local:
        return False
    return True


def _get_wifi_ssids():
    """Map of WiFi interface name -> network SSID (netsh, cached 30 sec)."""
    cache = getattr(_get_wifi_ssids, "_cache", None)
    now = time.time()
    if cache and (now - cache[0]) < 30:
        return cache[1]

    result = {}
    if os.name == "nt":
        try:
            raw = subprocess.run(
                ["netsh", "wlan", "show", "interfaces"],
                capture_output=True, timeout=5,
            ).stdout or b""
            out = None
            for enc in ("utf-8", "cp1251"):
                try:
                    out = raw.decode(enc)
                    break
                except UnicodeDecodeError:
                    continue
            if out is None:
                out = raw.decode("utf-8", errors="replace")
            iface_name = None
            for line in out.splitlines():
                m = re.match(r"\\s*(?:Name)\\s*:\\s*(.+)$", line)
                if m:
                    iface_name = m.group(1).strip()
                    continue
                m = re.match(r"\\s*SSID\\s*:\\s*(.+)$", line)
                if m and iface_name:
                    ssid = m.group(1).strip()
                    if ssid:
                        result[iface_name] = ssid
        except Exception as e:
            logger.warning(f"Could not get WiFi interface SSIDs: {e}")

    _get_wifi_ssids._cache = (now, result)
    return result


def get_network_interfaces():
    """Returns list of network interfaces where ESP devices may be."""
    try:
        import psutil
    except ImportError:
        ip = _get_local_ip()
        if _is_useful_interface(ip):
            return [{"ip": ip, "label": f"{ip} (auto-detect)"}]
        return []

    wifi_ssids = _get_wifi_ssids()

    addrs = []
    for iface, addr_list in psutil.net_if_addrs().items():
        for addr in addr_list:
            if addr.family == socket.AF_INET and _is_useful_interface(addr.address):
                iface_label = wifi_ssids.get(iface, iface)
                addrs.append({"ip": addr.address, "label": f"{addr.address} - {iface_label}"})

    seen = set()
    unique = []
    for a in addrs:
        if a["ip"] not in seen:
            seen.add(a["ip"])
            unique.append(a)

    def sort_key(item):
        ip_str = item["ip"]
        try:
            addr = ipaddress.ip_address(ip_str)
            if addr.is_private:
                return 0
        except ValueError:
            pass
        return 1

    unique.sort(key=sort_key)
    return unique


def scan_network_worker(subnet_label=None):
    """Background subnet scanning: ping -> identify -> add.

    If subnet_label is specified, only that /24 subnet is scanned.
    If subnet_label == '__all__', all detected subnets are scanned.
    Otherwise, the active subnet is automatically determined.
    """
    try:
        if subnet_label == "__all__":
            hosts = _get_all_subnet_hosts()
            local_ip = "all interfaces"
        elif subnet_label:
            hosts = _get_subnet_hosts(subnet_label)
            local_ip = subnet_label
        else:
            hosts = _get_local_subnet()
            local_ip = _get_local_ip()

        with _scan_lock:
            _scan_state.update({
                "total": len(hosts),
                "done": 0,
                "subnet": (subnet_label if subnet_label == "__all__" else f"{local_ip}/24") if hosts else "",
                "alive": [],
                "found": [],
                "failed": [],
                "error": None if hosts else "Could not determine local subnet",
            })
        if not hosts:
            return

        with ThreadPoolExecutor(max_workers=PING_CONCURRENCY) as ex:
            futures = {ex.submit(_host_pingable, ip): ip for ip in hosts}
            for fut in as_completed(futures):
                ip = futures[fut]
                try:
                    ok = bool(fut.result())
                except Exception:
                    ok = False
                with _scan_lock:
                    _scan_state["done"] += 1
                    if ok:
                        _scan_state["alive"].append(ip)
                if ok:
                    res = add_device_by_ip(ip)
                    with _scan_lock:
                        if res["success"]:
                            _scan_state["found"].append(res["device"])
                        else:
                            _scan_state["failed"].append({"ip": ip, "error": res["error"]})
    except Exception as e:
        logger.error(f"Network scan error: {e}")
        with _scan_lock:
            _scan_state["error"] = f"Scan error: {e}"
    finally:
        with _scan_lock:
            _scan_state["running"] = False
        globals_._scan_thread = None


def _get_all_subnet_hosts():
    """Collects all /24 subnets from all useful interfaces."""
    all_hosts = []
    seen = set()
    try:
        import psutil
    except ImportError:
        ip = _get_local_ip()
        if _is_useful_interface(ip):
            for h in _get_subnet_hosts(ip):
                if h not in seen:
                    seen.add(h)
                    all_hosts.append(h)
        return all_hosts

    for iface, addr_list in psutil.net_if_addrs().items():
        for addr in addr_list:
            if addr.family == socket.AF_INET and _is_useful_interface(addr.address):
                for h in _get_subnet_hosts(addr.address):
                    if h not in seen:
                        seen.add(h)
                        all_hosts.append(h)

    return all_hosts


def _get_subnet_hosts(ip_label):
    """Returns list of /24 subnet IPs for the given IP."""
    try:
        net = ipaddress.ip_network(f"{ip_label}/24", strict=False)
        return [str(h) for h in net.hosts()]
    except ValueError:
        return []


def _get_local_ip():
    """Local IPv4 address of the laptop."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


def _get_local_subnet():
    """Local /24 subnet address range (list of strings)."""
    ip = _get_local_ip()
    if ip.startswith("127."):
        return []
    try:
        net = ipaddress.ip_network(f"{ip}/24", strict=False)
        return [str(h) for h in net.hosts()]
    except ValueError:
        return []


def _host_pingable(ip):
    """Checks host liveness via system ping (Windows/Unix)."""
    if os.name == "nt":
        args = ["ping", "-n", "1", "-w", str(PING_TIMEOUT_MS), ip]
    else:
        args = ["ping", "-c", "1", "-W", str(max(1, PING_TIMEOUT_MS // 1000)), ip]
    try:
        r = subprocess.run(
            args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            timeout=(PING_TIMEOUT_MS / 1000) + 1,
        )
        return r.returncode == 0
    except Exception:
        return False


def _http_get(ip, path, timeout=HTTP_TIMEOUT):
    """Simple GET to device; returns (status, text) or (None, '')."""
    try:
        with urllib.request.urlopen(f"http://{ip}{path}", timeout=timeout) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except Exception:
        return None, ""


def _parse_devlist(text):
    """Extract info from devlist.json (JSON array of IoTManager objects)."""
    try:
        data = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return None
    items = data if isinstance(data, list) else [data]
    for it in items:
        if isinstance(it, dict) and ("name" in it or "wg" in it):
            return {
                "name": str(it.get("name", "")),
                "wg": str(it.get("wg", "")),
                "id": str(it.get("id", "")),
                "fv": it.get("fv", ""),
            }
    return None


def identify_device(ip):
    """Accurate identification of IoTManager device by IP.

    Primary sign: /devlist.json response is valid JSON array.
    Fallback: standard ESP FS editor (GET /status with isOk and type).
    Returns dict {kind, name, wg, id, fv} or None.
    """
    status, text = _http_get(ip, "/devlist.json")
    if status == 200:
        info = _parse_devlist(text)
        if info:
            return {"kind": "iotmanager", **info}
    status, text = _http_get(ip, "/status")
    if status == 200 and '"isOk"' in text and '"type"' in text:
        return {"kind": "esp", "name": "", "wg": "", "id": "", "fv": ""}
    return None


def add_device_by_ip(ip):
    """Add device by IP. Returns result dict."""
    ip = (ip or "").strip()
    try:
        ipaddress.ip_address(ip)
    except ValueError:
        return {"success": False, "error": "Invalid IP address"}
    ident = identify_device(ip)
    if not ident:
        return {"success": False,
                "error": "Could not recognize IoTManager device at this IP"}
    name = ident.get("name") or ip
    entry = ensure_device_folder(ip, name, ident.get("id", ""))
    return {"success": True, "device": {
        "key": entry["key"],
        "ip": ip,
        "name": name,
        "wg": ident.get("wg", ""),
        "id": ident.get("id", ""),
        "fv": ident.get("fv", ""),
        "kind": ident["kind"],
        "folder": entry["folder"],
    }}


# ==================== Fetch Progress ====================
_fetch_progress = {}  # (device_key, section) -> {stage, done, total, name, files, error, ip}


# ==================== Utility Functions ====================


def _scan_snapshot():
    """Snapshot of scan state."""
    with _scan_lock:
        return dict(_scan_state)


def _walk_tree(root):
    """Returns (dirs, files) - relative paths to dirs and files in root."""
    dirs, files = [], []
    if not os.path.isdir(root):
        return dirs, files
    for base, subdirs, filenames in os.walk(root):
        for d in subdirs:
            dirs.append(os.path.relpath(os.path.join(base, d), root))
        for fn in filenames:
            files.append(os.path.relpath(os.path.join(base, fn), root))
    dirs.sort()
    files.sort()
    return dirs, files


def _safe_path(root, rel):
    """Safely resolves relative path within root (protection from traversal).

    Returns absolute path or None if path is outside root.
    """
    if not rel:
        return None
    norm = os.path.normpath(rel)
    if norm.startswith("..") or os.path.isabs(norm):
        return None
    root_real = os.path.realpath(root)
    candidate = os.path.realpath(os.path.join(root_real, norm))
    if candidate != root_real and not candidate.startswith(root_real + os.sep):
        return None
    return candidate


def _rmtree_with_retry(folder, attempts=5, delay=0.5):
    """Tries to delete folder multiple times. True on success."""
    for attempt in range(attempts):
        try:
            shutil.rmtree(folder)
            return True
        except OSError as e:
            logger.warning(f"Delete {folder}: attempt {attempt+1}/{attempts} failed: {e}")
            time.sleep(delay)
    return False


def _rmtree_background(folder, max_minutes=10):
    """Background deletion of 'stuck' folder: retries every 5 sec.

    Folder may be blocked by another process (e.g., acrotray.exe holds it
    as working directory). When the block goes away - folder will be deleted.
    """
    deadline = time.time() + max_minutes * 60
    while time.time() < deadline:
        try:
            shutil.rmtree(folder)
            logger.info(f"Device folder deleted (delayed): {folder}")
            return
        except OSError:
            pass
        time.sleep(5)
    logger.error(f"Could not delete device folder in {max_minutes} min: {folder}")
