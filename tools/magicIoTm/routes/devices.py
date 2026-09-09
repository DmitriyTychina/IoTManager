import json
import os
import time
import threading
import logging

import state.globals as globals_
from flask import Blueprint, request, jsonify, Response

from core.devices import (
    get_device_folder,
    _build_devices_payload,
    _devices_signature,
    _scan_snapshot,
    _walk_tree,
    _safe_path,
    _rmtree_with_retry,
    _rmtree_background,
    add_device_by_ip,
    get_network_interfaces,
    scan_network_worker,
    _fetch_progress,
    ws_client,
)

# Import locks and state from state.globals
_device_folders_lock = globals_._device_folders_lock
_device_folders = globals_._device_folders
_devices_lock = globals_._devices_lock
_devices = globals_._devices
_device_states_lock = globals_._device_states_lock
_device_states = globals_._device_states
_scan_lock = globals_._scan_lock
_scan_state = globals_._scan_state

logger = logging.getLogger(__name__)

devices_bp = Blueprint("devices", __name__)


# ==================== Device List Routes ====================


@devices_bp.route("/devices", methods=["GET"])
def api_devices():
    """List of discovered devices with online/offline status."""
    return jsonify(_build_devices_payload())


@devices_bp.route("/devices/list-all", methods=["GET"])
def api_devices_list_all():
    """Returns list of ALL device folders with RAM/FS file presence."""
    from core.devices import DEVICE_DIR_ROOT, _load_folder_meta
    devices = []
    if not os.path.isdir(DEVICE_DIR_ROOT):
        return jsonify({"success": True, "devices": []})
    for folder_name in sorted(os.listdir(DEVICE_DIR_ROOT)):
        folder = os.path.join(DEVICE_DIR_ROOT, folder_name)
        if not os.path.isdir(folder):
            continue
        meta = _load_folder_meta(folder) or {}
        devices.append({
            "key": folder_name,
            "name": meta.get("name") or folder_name,
            "ip": meta.get("ip") or "",
            # settings.json — для копирования настроек
            "ram_settings": os.path.isfile(os.path.join(folder, "RAM", "settings.json")),
            "fs_settings": os.path.isfile(os.path.join(folder, "FS", "settings.json")),
            # profile.json (RAM) / flashProfile.json (FS) — для копирования модулей
            "ram_profile": os.path.isfile(os.path.join(folder, "RAM", "profile.json")),
            "fs_profile": os.path.isfile(os.path.join(folder, "FS", "flashProfile.json")),
        })
    return jsonify({"success": True, "devices": devices})


@devices_bp.route("/devices/stream")
def api_devices_stream():
    """SSE stream of device list changes (online/offline, new/updated)."""
    def gen():
        last_sig = None
        while True:
            sig = _devices_signature()
            if sig != last_sig:
                last_sig = sig
                yield f"data: {json.dumps(_build_devices_payload(), ensure_ascii=False)}\n\n"
            time.sleep(1)

    return Response(gen(), mimetype="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    })


# ==================== Device Management Routes ====================


@devices_bp.route("/device/<device_key>", methods=["DELETE"])
def api_device_delete(device_key):
    """Delete device: folder on disk and all records about it."""
    try:
        with _device_folders_lock:
            entry = _device_folders.get(device_key)
        if not entry:
            return jsonify({"success": False, "error": "Device not found"}), 404
        folder = entry["folder"]
        ip = entry.get("ip")
        with _device_folders_lock:
            _device_folders.pop(device_key, None)
        if ip:
            with _devices_lock:
                _devices.pop(ip, None)
            with _device_states_lock:
                _device_states.pop(device_key, None)
        if _rmtree_with_retry(folder):
            logger.info(f"Device deleted: {device_key} ({folder})")
            return jsonify({"success": True})
        logger.warning(f"Folder {folder} is busy; deletion deferred to background")
        threading.Thread(target=_rmtree_background, args=(folder,), daemon=True,
                         name="device-folder-cleanup").start()
        return jsonify({"success": True, "warning": "Folder is busy, will be deleted later"})
    except Exception as e:
        logger.error(f"Delete device error: {e}", exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500


@devices_bp.route("/device/<device_key>/info", methods=["GET"])
def api_device_info(device_key):
    """Device info and path to its folder on disk."""
    entry = get_device_folder(device_key)
    if not entry:
        return jsonify({"success": False, "error": "Device folder not yet created"}), 404
    return jsonify({"success": True, **entry})


@devices_bp.route("/devices/interfaces", methods=["GET"])
def api_devices_interfaces():
    """Returns list of network interfaces for selection."""
    interfaces = get_network_interfaces()
    return jsonify({"success": True, "interfaces": interfaces})


# ==================== Network Scan Routes ====================


@devices_bp.route("/devices/scan", methods=["POST"])
def api_devices_scan():
    """Start background network scan."""
    data = request.json or {}
    subnet_label = data.get("subnet", "")
    with _scan_lock:
        if _scan_state["running"]:
            if globals_._scan_thread and globals_._scan_thread.is_alive():
                return jsonify({"success": True, "already": True})
            logger.warning("Reset stuck scan state (thread dead)")
            _scan_state["running"] = False
        _scan_state.update({
            "total": 0, "done": 0, "subnet": "",
            "alive": [], "found": [], "failed": [], "error": None,
        })
        _scan_state["running"] = True
    globals_._scan_thread = threading.Thread(
        target=scan_network_worker, daemon=True,
        args=(subnet_label if subnet_label else None,),
        name="scan-network")
    globals_._scan_thread.start()
    return jsonify({"success": True})


@devices_bp.route("/devices/scan/stream")
def api_devices_scan_stream():
    """SSE stream of network scan progress."""
    def gen():
        try:
            while True:
                st = _scan_snapshot()
                yield f"data: {json.dumps(st, ensure_ascii=False)}\n\n"
                if not st["running"]:
                    break
                time.sleep(0.15)
        except GeneratorExit:
            pass
    return Response(gen(), mimetype="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    })


@devices_bp.route("/devices/add", methods=["POST"])
def api_devices_add():
    """Add device by IP."""
    data = request.json or {}
    return jsonify(add_device_by_ip(str(data.get("ip", ""))))


# ==================== Fetch Routes ====================


@devices_bp.route("/device/<device_key>/fetch/<section>", methods=["POST"])
def api_device_fetch(device_key, section):
    """Starts background download of RAM or FS section from device."""
    from core.devices import ws_client
    sec = section.lower()
    if sec not in ("ram", "fs"):
        return jsonify({"success": False, "error": "Unknown section"}), 400
    entry = get_device_folder(device_key)
    if not entry:
        return jsonify({"success": False, "error": "Device folder not yet created"}), 404
    dev_ip = entry.get("ip")
    if not dev_ip:
        return jsonify({"success": False, "error": "Device IP not specified"}), 400

    state = {"stage": "running", "done": 0, "total": 0,
             "name": "Connecting to device...", "files": [], "error": None,
             "ip": dev_ip}
    _fetch_progress[(device_key, sec)] = state

    def progress(fname, done, total):
        state["done"] = done
        state["total"] = total
        state["name"] = fname

    def worker():
        try:
            if sec == "ram":
                saved = ws_client.fetch_ram(dev_ip, entry["ram_dir"], progress=progress)
            else:
                saved = ws_client.fetch_fs(dev_ip, entry["fs_dir"], progress=progress)
            state["files"] = saved
            state["stage"] = "done"
        except Exception as e:
            logger.error(f"fetch {sec} {dev_ip}: {e}")
            state["stage"] = "error"
            state["error"] = str(e)

    threading.Thread(target=worker, daemon=True).start()
    return jsonify({"success": True})


@devices_bp.route("/device/<device_key>/fetch/<section>/status", methods=["GET"])
def api_device_fetch_status(device_key, section):
    """Returns current progress of background section download."""
    key = section.lower()
    state = _fetch_progress.get((device_key, key))
    if not state:
        return jsonify({"success": False, "error": "Download not started"}), 404
    if state["stage"] == "error":
        return jsonify({"success": False, "error": state.get("error") or "Download error"})
    return jsonify({
        "success": True,
        "stage": state["stage"],
        "done": state.get("done", 0),
        "total": state.get("total", 0),
        "name": state.get("name", ""),
        "files": state.get("files", []),
    })


# ==================== File Tree and File Routes ====================


@devices_bp.route("/device/<device_key>/tree/<section>", methods=["GET"])
def api_device_tree(device_key, section):
    """File tree of RAM or FS section (local device folder)."""
    entry = get_device_folder(device_key)
    if not entry:
        return jsonify({"success": False, "error": "Device folder not yet created"}), 404
    key = section.lower()
    if key not in ("ram", "fs"):
        return jsonify({"success": False, "error": "Unknown section"}), 400
    root = entry[f"{key}_dir"]
    dirs, files = _walk_tree(root)
    return jsonify({"success": True, "root": root, "dirs": dirs, "files": files})


@devices_bp.route("/device/<device_key>/file/<section>", methods=["GET"])
def api_device_read_file(device_key, section):
    """File content in RAM or FS section."""
    entry = get_device_folder(device_key)
    if not entry:
        return jsonify({"success": False, "error": "Device folder not yet created"}), 404
    key = section.lower()
    if key not in ("ram", "fs"):
        return jsonify({"success": False, "error": "Unknown section"}), 400
    root = entry[f"{key}_dir"]
    rel = request.args.get("path", "")
    abs_path = _safe_path(root, rel)
    if not abs_path or not os.path.isfile(abs_path):
        return jsonify({"success": False, "error": "File not found"}), 404
    try:
        with open(abs_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    return jsonify({
        "success": True,
        "path": rel,
        "name": os.path.basename(rel),
        "size": os.path.getsize(abs_path),
        "content": content,
    })


@devices_bp.route("/device/<device_key>/file/<section>", methods=["POST"])
def api_device_save_file(device_key, section):
    """Saves modified file locally to device folder."""
    entry = get_device_folder(device_key)
    if not entry:
        return jsonify({"success": False, "error": "Device folder not yet created"}), 404
    key = section.lower()
    if key not in ("ram", "fs"):
        return jsonify({"success": False, "error": "Unknown section"}), 400
    root = entry[f"{key}_dir"]
    data = request.json or {}
    rel = data.get("path", "")
    content = data.get("content", "")
    abs_path = _safe_path(root, rel)
    if not abs_path:
        return jsonify({"success": False, "error": "Invalid path"}), 400
    try:
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    return jsonify({"success": True, "path": rel})


@devices_bp.route("/device/<device_key>/write/ram", methods=["POST"])
def api_device_write_ram(device_key):
    """Writes a file back to the device RAM via reverse WebSocket command.

    Body: {path: <relative path>, content: <text>}
    Only files supported by the firmware (ws_client.WRITE_HEADERS) can be written.
    On success the local RAM copy is updated as well.
    """
    entry = get_device_folder(device_key)
    if not entry:
        return jsonify({"success": False, "error": "Device folder not yet created"}), 404
    dev_ip = entry.get("ip")
    if not dev_ip:
        return jsonify({"success": False, "error": "Device IP not specified"}), 400

    data = request.json or {}
    rel = data.get("path", "")
    content = data.get("content")
    if content is None:
        content = ""

    ram_dir = entry.get("ram_dir")
    abs_path = _safe_path(ram_dir, rel)
    if not abs_path:
        return jsonify({"success": False, "error": "Invalid path"}), 400

    filename = os.path.basename(abs_path)
    if filename not in ws_client.WRITE_HEADERS:
        return jsonify({
            "success": False,
            "error": (f"Файл '{filename}' не поддерживается прошивкой для записи обратно "
                      f"на устройство. Доступны: {', '.join(sorted(ws_client.WRITE_HEADERS))}.")
        }), 400

    try:
        ws_client.write_file(dev_ip, filename, content)
    except Exception as e:
        logger.error(f"Write to device {dev_ip} ({filename}): {e}", exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500

    # Обновляем локальную копию, чтобы не было рассинхрона с устройством
    try:
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
    except Exception as e:
        logger.warning(f"Could not update local copy {abs_path}: {e}")

    return jsonify({"success": True, "path": rel})


@devices_bp.route("/device/<device_key>/reboot", methods=["POST"])
def api_device_reboot(device_key):
    """Sends reboot command to the device via WebSocket (/reboot|)."""
    entry = get_device_folder(device_key)
    if not entry:
        return jsonify({"success": False, "error": "Device folder not yet created"}), 404
    dev_ip = entry.get("ip")
    if not dev_ip:
        return jsonify({"success": False, "error": "Device IP not specified"}), 400
    try:
        ok = ws_client.reboot(dev_ip)
    except Exception as e:
        logger.error(f"Reboot {dev_ip}: {e}", exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500
    if not ok:
        return jsonify({"success": False, "error": f"Не удалось отправить команду перезагрузки на {dev_ip}"}), 502
    logger.info(f"Reboot command sent to {dev_ip} ({device_key})")
    return jsonify({"success": True})


# ==================== Device Settings Routes ====================


def _device_section_json(device_key, section, filename):
    """Reads a JSON file from the RAM/FS folder of the device."""
    sec = (section or "").lower()
    if sec not in ("ram", "fs"):
        return jsonify({"success": False, "error": "Unknown section"}), 400
    entry = get_device_folder(device_key)
    if entry:
        base_dir = entry[f"{sec}_dir"]
    else:
        # Fallback: folder on disk (device not yet registered in memory)
        from core.devices import DEVICE_DIR_ROOT
        base_dir = os.path.join(DEVICE_DIR_ROOT, device_key, sec.upper())
    path = os.path.join(base_dir, filename)
    if not os.path.isfile(path):
        return jsonify({"success": False, "error": f"{filename} not found in {sec.upper()}"}), 404
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Read {path}: {e}", exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500


@devices_bp.route("/device/settings", methods=["GET"])
def api_device_settings():
    """Returns settings.json from the device RAM/FS folder."""
    key = request.args.get("key", "")
    section = request.args.get("section", "ram")
    data = _device_section_json(key, section, "settings.json")
    # _device_section_json returns (Response, status) on error
    if isinstance(data, tuple):
        return data
    return jsonify({"success": True, "settings": data})


@devices_bp.route("/device/profile", methods=["GET"])
def api_device_profile():
    """Returns modules and default_envs from profile.json (RAM) or flashProfile.json (FS)."""
    key = request.args.get("key", "")
    section = request.args.get("section", "ram")
    data = _device_section_json(key, section, "profile.json" if section == "ram" else "flashProfile.json")
    if isinstance(data, tuple):
        return data
    # default_envs: новый формат — projectProp.platformio.default_envs,
    # запасной — ключ default_envs верхнего уровня
    default_envs = (data.get("projectProp", {}).get("platformio", {}).get("default_envs")
                    or data.get("default_envs"))
    return jsonify({"success": True, "modules": data.get("modules", {}),
                    "default_envs": default_envs})
