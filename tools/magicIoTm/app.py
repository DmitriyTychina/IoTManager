"""
MagicIoTm — Конфигуратор прошивок IoTmanager
Web-сервер на Flask для управления проектами и конфигурациями
"""

import json
import os
import glob
import re
import shutil
import socket
import struct
import subprocess
import time
import logging
import threading
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS

from utils import projects, build, measure_run, ws_client

# ==================== Логирование ====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, 'magicIoTm.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOG_FILE, encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# ==================== Flask ====================
app = Flask(__name__)
CORS(app)
_lock = threading.Lock()

# ==================== Пути ====================
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
ROOT_CONFIG_FILE = os.path.join(PROJECT_ROOT, 'myProfile.json')
MODULES_SRC_DIR = os.path.join(PROJECT_ROOT, 'src', 'modules')
PLATFORMS_FILE = os.path.join(BASE_DIR, '..', 'measure_size', 'platforms.json')
PLATFORMIO_INI_FILE = os.path.join(PROJECT_ROOT, 'platformio.ini')
MEASURE_SCRIPT = os.path.abspath(os.path.join(BASE_DIR, '..', 'measure_size', 'measure.py'))

# ==================== Состояние ====================
current_project = None  # {"category": ..., "name": ...}
current_config = None
current_platform = "esp8266_4mb"
modinfo_cache = {}
platforms_cache = {}

# ==================== Обнаружение устройств (multicast) ====================
MULTICAST_GROUP = "239.255.255.255"
MULTICAST_PORT = 4210
DEVICES_TIMEOUT = 90  # секунды без пакета, после чего устройство считается offline

_devices = {}          # ip -> {ip, name, wg, id, status, fv, last_seen}
_devices_lock = threading.Lock()
_device_thread = None


def _device_listener():
    """Фоновый поток: приём multicast-пакетов от устройств IoTManager.

    Каждый пакет — JSON-массив объектов (wg, ip, id, name, status, fv).
    IP устройства берётся из заголовка пакета (addr[0]), name — из данных.
    """
    logger.info(f"Multicast слушатель: {MULTICAST_GROUP}:{MULTICAST_PORT}")
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
        logger.error(f"Не удалось настроить multicast-сокет: {e}")
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
    logger.info("Multicast слушатель остановлен")


def _ingest_payload(src_ip, text):
    """Разбор payload: JSON-массив или единичный объект. ip берём из заголовка пакета."""
    try:
        obj = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return
    items = obj if isinstance(obj, list) else [obj]
    now = time.time()
    with _devices_lock:
        for it in items:
            if not isinstance(it, dict):
                continue
            _devices[src_ip] = {
                "ip": src_ip,
                "name": str(it.get("name", "")),
                "wg": str(it.get("wg", "")),
                "id": str(it.get("id", "")),
                "status": bool(it.get("status", False)),
                "fv": it.get("fv", ""),
                "last_seen": now,
            }
            # создаём папку устройства <SSID>_<ip>_<name> с подпапками RAM и FS
            ensure_device_folder(src_ip, str(it.get("name", "")))


def _build_devices_payload():
    """Текущий список устройств с признаком online/offline, отсортированный."""
    now = time.time()
    with _devices_lock:
        devices = []
        for d in _devices.values():
            dev = dict(d)
            dev["online"] = (now - d["last_seen"]) <= DEVICES_TIMEOUT
            devices.append(dev)
    devices.sort(key=lambda x: (not x["online"], x["ip"]))
    return {"success": True, "devices": devices}


def _devices_signature():
    """Сигнатура набора устройств для детекции изменений в SSE-потоке."""
    now = time.time()
    with _devices_lock:
        return tuple(sorted(
            (d["ip"], round(d["last_seen"], 1), (now - d["last_seen"]) <= DEVICES_TIMEOUT)
            for d in _devices.values()
        ))


def start_device_listener():
    """Запуск фонового потока multicast-слушателя (идемпотентно)."""
    global _device_thread
    if _device_thread and _device_thread.is_alive():
        return
    _device_thread = threading.Thread(target=_device_listener, daemon=True,
                                      name="multicast-device-listener")
    _device_thread.start()

# ==================== Папки устройств на диске ====================
DEVICE_DIR_ROOT = os.path.join(BASE_DIR, 'devices')   # magicIoTm/devices

_ssid_cache = {"value": None, "ts": 0.0}
_SSID_TTL = 300              # кэш SSID на 5 минут

# карта ip -> {"folder": ..., "ram_dir": ..., "fs_dir": ..., "name": ...}
_device_folders = {}
_device_folders_lock = threading.Lock()


def _sanitize_name(name):
    """Санитизирует имя для использования в имени папки (без служебных символов)."""
    if not name:
        return "unnamed"
    s = re.sub(r'[\\/:*?"<>|]+', '_', str(name))
    s = re.sub(r'\s+', '_', s).strip('._ ')
    return s or "unnamed"


def _get_wifi_ssid():
    """Определяет SSID WiFi-сети ноутбука (netsh), с кэшем. Fallback: 'NET'."""
    now = time.time()
    if _ssid_cache["value"] and (now - _ssid_cache["ts"]) < _SSID_TTL:
        return _ssid_cache["value"]
    ssid = "NET"
    try:
        out = subprocess.run(
            ["netsh", "wlan", "show", "interfaces"],
            capture_output=True, text=True, timeout=5,
        ).stdout
        for line in out.splitlines():
            if "SSID" in line and "BSSID" not in line:
                val = line.split(":", 1)[-1].strip()
                if val:
                    ssid = val
                    break
    except Exception as e:
        logger.warning(f"Не удалось определить SSID ноутбука: {e}")
    _ssid_cache["value"] = ssid
    _ssid_cache["ts"] = now
    return ssid


def ensure_device_folder(ip, name):
    """Создаёт папку устройства <SSID>_<ip>_<name> с подпапками RAM и FS.

    Идемпотентна: если для ip папка уже создана, возвращает существующую запись.
    """
    with _device_folders_lock:
        if ip in _device_folders:
            return _device_folders[ip]
        ssid = _sanitize_name(_get_wifi_ssid())
        dname = _sanitize_name(name)
        folder = os.path.join(DEVICE_DIR_ROOT, f"{ssid}_{ip}_{dname}")
        ram_dir = os.path.join(folder, "RAM")
        fs_dir = os.path.join(folder, "FS")
        try:
            os.makedirs(ram_dir, exist_ok=True)
            os.makedirs(fs_dir, exist_ok=True)
        except Exception as e:
            logger.error(f"Не удалось создать папку устройства {folder}: {e}")
        entry = {"folder": folder, "ram_dir": ram_dir, "fs_dir": fs_dir, "name": dname}
        _device_folders[ip] = entry
        logger.info(f"Папка устройства: {folder}")
        return entry


def get_device_folder(ip):
    """Возвращает запись папки устройства или None."""
    with _device_folders_lock:
        return _device_folders.get(ip)


def _walk_tree(root):
    """Возвращает (dirs, files) — относительные пути каталогов и файлов в root."""
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
    """Безопасно резолвит относительный путь внутри root (защита от traversal).

    Возвращает абсолютный путь или None, если путь вне root.
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


# ==================== modinfo кэш ====================

def load_platforms():
    """Загрузка platforms.json с baseline/total значениями"""
    global platforms_cache
    platforms_cache = {}
    try:
        with open(PLATFORMS_FILE, 'r', encoding='utf-8') as f:
            platforms_cache = json.load(f)
        logger.info(f"Загружено платформ: {len(platforms_cache)}")
    except Exception as e:
        logger.error(f"platforms.json: {e}")


def save_platform_fs_total(env, fs_total):
    """Сохраняет ёмкость ФС (total_fs) платформы в platforms.json.

    Запись происходит, если поля ещё нет ИЛИ текущее значение отличается от
    переданного размера (например, изменился раздел littlefs).
    """
    global platforms_cache
    if not env or not fs_total:
        return
    try:
        with open(PLATFORMS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        data = {}
    entry = data.setdefault(env, {})
    current = entry.get("total_fs")
    if not current or current != fs_total:
        entry["total_fs"] = fs_total
        try:
            with open(PLATFORMS_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
        except Exception as e:
            logger.error(f"Не удалось сохранить total_fs в platforms.json: {e}")
    # Обновляем кэш для немедленного отображения
    if env in platforms_cache:
        platforms_cache[env]["total_fs"] = entry.get("total_fs") or fs_total


def load_platformio_envs(ini_path=None):
    """Получение списка платформ из platformio.ini (секции [env:*]).

    Исключаются вспомогательные секции вида *_fromitems.
    Возвращает список имён платформ в порядке появления в файле.
    """
    ini_path = ini_path or PLATFORMIO_INI_FILE
    envs = []
    try:
        with open(ini_path, 'r', encoding='utf-8') as f:
            for line in f:
                m = re.match(r'^\s*\[env:([^\]]+)\]\s*$', line)
                if m:
                    name = m.group(1).strip()
                    # Пропускаем вспомогательные секции-шаблоны от PreBuild
                    if name.endswith('_fromitems'):
                        continue
                    if name not in envs:
                        envs.append(name)
        logger.info(f"platformio.ini: загружено платформ: {len(envs)}")
    except Exception as e:
        logger.error(f"platformio.ini: {e}")
    return envs


def get_project_platformio_path(proj=None):
    """Путь к platformio.ini текущего проекта (из папки проекта).

    Если проект не открыт, является проектом PlatformIO или у проекта нет
    собственного platformio.ini — используется корневой platformio.ini.
    """
    if not proj:
        return PLATFORMIO_INI_FILE
    if projects.is_platformio(proj.get("name", "")):
        return PLATFORMIO_INI_FILE
    path = os.path.join(projects.PROJECTS_DIR, proj.get("category", ""), proj.get("name", ""), "platformio.ini")
    if os.path.exists(path):
        return path
    return PLATFORMIO_INI_FILE


def get_platformio_platforms():
    """Список платформ из platformio.ini текущего проекта (или корневого)"""
    ini = get_project_platformio_path(current_project)
    return load_platformio_envs(ini)


def scan_modinfo():
    """Сканирование всех modinfo.json"""
    global modinfo_cache
    modinfo_cache = {}
    pattern = os.path.join(MODULES_SRC_DIR, '**', 'modinfo.json')
    files = glob.glob(pattern, recursive=True)
    for fp in files:
        try:
            with open(fp, 'r', encoding='utf-8') as f:
                info = json.load(f)
            name = os.path.basename(os.path.dirname(fp))
            about = info.get("about", {})
            # sizeInfo — массив, берём первый элемент
            size_info_list = info.get("sizeInfo", [])
            used_flash = {}
            used_ram = {}
            if size_info_list and isinstance(size_info_list, list):
                si = size_info_list[0]
                used_flash = si.get("usedFLASH", {})
                used_ram = si.get("usedRAM", {})
            modinfo_cache[name] = {
                "usedFLASH": used_flash,
                "usedRAM": used_ram,
                "usedLibs": info.get("usedLibs", {}),
                "about": about,
            }
        except Exception as e:
            logger.error(f"modinfo {fp}: {e}")
    logger.info(f"Кэш modinfo: {len(modinfo_cache)} модулей")


def is_compatible(platform, used_libs):
    if not used_libs or not isinstance(used_libs, dict):
        return True
    if platform in used_libs:
        return used_libs[platform] != ["exclude"]
    for pattern, libs in used_libs.items():
        if pattern.endswith("*") and platform.startswith(pattern[:-1]):
            return libs != ["exclude"]
    return False


def _lookup_platform_value(data, platform):
    """Поиск значения только по точной платформе, без фолбэков; '-' → 0"""
    if not data or not isinstance(data, dict):
        return 0
    v = data.get(platform)
    if v is None or v == "-":
        return 0
    return int(v) if isinstance(v, (int, float, str)) else 0


def get_module_flash(name, platform):
    """Размер FLASH модуля для платформы"""
    info = modinfo_cache.get(name, {})
    return _lookup_platform_value(info.get("usedFLASH", {}), platform)


def get_module_ram(name, platform):
    """Размер RAM модуля для платформы"""
    info = modinfo_cache.get(name, {})
    return _lookup_platform_value(info.get("usedRAM", {}), platform)


def get_platform_limits(platform):
    """Возвращает (baseline_flash, total_flash, baseline_ram, total_ram) из platforms.json"""
    p = platforms_cache.get(platform, {})
    return (
        p.get("baseline_flash", 0),
        p.get("total_flash", 0),
        p.get("baseline_ram", 0),
        p.get("total_ram", 0),
    )


def calc_size():
    """Расчёт заполнения FLASH и RAM: baseline + сумма активных модулей"""
    if not current_config:
        return 0, 0, 0, 0, 0, 0
    flash_total = 0
    ram_total = 0
    for mods in current_config.get("modules", {}).values():
        if not isinstance(mods, list):
            continue
        for m in mods:
            if m.get("active"):
                name = m.get("path", "").split("/")[-1]
                flash_total += get_module_flash(name, current_platform)
                ram_total += get_module_ram(name, current_platform)
    bf, tf, br, tr = get_platform_limits(current_platform)
    flash_used = bf + flash_total
    ram_used = br + ram_total
    flash_pct = round(flash_used / tf * 100, 1) if tf > 0 else 0
    ram_pct = round(ram_used / tr * 100, 1) if tr > 0 else 0
    return flash_pct, flash_used, tf, ram_pct, ram_used, tr


def _project_dir(proj):
    """Каталог проекта (там, где лежат myProfile.json/platformio.ini)."""
    if projects.is_platformio(proj.get("name", "")):
        return PROJECT_ROOT
    return os.path.join(projects.PROJECTS_DIR, proj.get("category", ""), proj.get("name", ""))


def _dir_size(path):
    """Суммарный размер файлов в каталоге (байты)."""
    if not path or not os.path.isdir(path):
        return 0
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except OSError:
                pass
    return total


def get_fs_usage():
    """Возвращает (fs_pct, fs_used, fs_total) для текущей платформы.

    fs_total — ёмкость раздела ФС (total_fs из platforms.json; если его ещё нет —
               размер только что собранного образа .pio/build/<платформа>/littlefs.bin).
    fs_used  — занятое: размер папки data_svelte проекта (в iotm/<платформа> или в корне).
    """
    fs_total = platforms_cache.get(current_platform, {}).get("total_fs", 0)
    if not fs_total:
        # Запасной источник ёмкости — свежесобранный образ файловой системы
        img_dir = os.path.join(PROJECT_ROOT, ".pio", "build", current_platform)
        for name in ("littlefs.bin", "spiffs.bin"):
            p = os.path.join(img_dir, name)
            if os.path.isfile(p):
                try:
                    fs_total = os.path.getsize(p)
                except OSError:
                    fs_total = 0
                break
    fs_used = 0
    if current_project:
        if projects.is_platformio(current_project.get("name", "")):
            # Корневой PlatformIO-проект — data_svelte остаётся в корне проекта
            data_dir = os.path.join(_project_dir(current_project), "data_svelte")
        else:
            data_dir = os.path.join(_project_dir(current_project), "iotm", current_platform, "data_svelte")
        fs_used = _dir_size(data_dir)
    fs_pct = round(fs_used / fs_total * 100, 1) if fs_total > 0 else 0
    return fs_pct, fs_used, fs_total


def get_compat_map():
    if not current_config:
        return {}
    result = {}
    for section, mods in current_config.get("modules", {}).items():
        if not isinstance(mods, list):
            continue
        for m in mods:
            name = m.get("path", "").split("/")[-1]
            info = modinfo_cache.get(name, {})
            result[m.get("path", "")] = {
                "compatible": is_compatible(current_platform, info.get("usedLibs", {})),
                "size": get_module_flash(name, current_platform),
                "ram": get_module_ram(name, current_platform),
            }
    return result


# ==================== Маршруты: страницы ====================

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/favicon.png')
def favicon():
    return send_from_directory(BASE_DIR, 'favicon.png', mimetype='image/png')


# ==================== Маршруты: проекты ====================

@app.route('/api/projects', methods=['GET'])
def api_list_projects():
    return jsonify({
        "success": True,
        "tree": projects.list_projects(),
        "about": projects.get_all_abouts(),
    })


# ==================== Маршруты: устройства (multicast) ====================

@app.route('/api/devices', methods=['GET'])
def api_devices():
    """Список обнаруженных устройств с признаком online/offline."""
    return jsonify(_build_devices_payload())


@app.route('/api/devices/stream')
def api_devices_stream():
    """SSE-поток изменений списка устройств (online/offline, новые/обновлённые)."""
    def gen():
        last_sig = None
        while True:
            sig = _devices_signature()
            if sig != last_sig:
                last_sig = sig
                payload = json.dumps(_build_devices_payload(), ensure_ascii=False)
                yield f"data: {payload}\n\n"
            else:
                yield ": keepalive\n\n"
            time.sleep(2)
    return Response(gen(), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.route('/api/projects/category', methods=['POST'])
def api_create_category():
    name = request.json.get('name', '').strip()
    if not name:
        return jsonify({"success": False, "error": "Имя не указано"}), 400
    ok, msg = projects.create_category(name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/category/<name>', methods=['DELETE'])
def api_delete_category(name):
    ok, msg = projects.delete_category(name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/category/<name>/rename', methods=['POST'])
def api_rename_category(name):
    new_name = request.json.get('name', '').strip()
    if not new_name:
        return jsonify({"success": False, "error": "Новое имя не указано"}), 400
    ok, msg = projects.rename_category(name, new_name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/create', methods=['POST'])
def api_create_project():
    data = request.json
    cat = data.get('category', '').strip()
    name = data.get('name', '').strip()
    desc = data.get('description', '')
    if not cat or not name:
        return jsonify({"success": False, "error": "Категория и имя обязательны"}), 400
    ok, msg = projects.create_project(cat, name, desc)
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/<category>/<name>', methods=['DELETE'])
def api_delete_project(category, name):
    if projects.is_platformio(name):
        return jsonify({"success": False, "error": "Проект PlatformIO нельзя удалить"}), 400
    ok, msg = projects.delete_project(category, name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/<category>/<name>/rename', methods=['POST'])
def api_rename_project(category, name):
    if projects.is_platformio(name):
        return jsonify({"success": False, "error": "Проект PlatformIO нельзя переименовать"}), 400
    new_name = request.json.get('name', '').strip()
    if not new_name:
        return jsonify({"success": False, "error": "Новое имя не указано"}), 400
    ok, msg = projects.rename_project(category, name, new_name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/copy', methods=['POST'])
def api_copy_project():
    data = request.json
    src_cat = data.get('src_cat', '')
    src_name = data.get('src_name', '')
    dst_cat = data.get('dst_cat', '')
    dst_name = data.get('dst_name', '')
    if projects.is_platformio(src_name):
        # Сохраняем исходное имя устройства проекта PlatformIO,
        # чтобы не изменять его в копии.
        src_dev_name = None
        if os.path.exists(ROOT_CONFIG_FILE):
            with open(ROOT_CONFIG_FILE, 'r', encoding='utf-8') as f:
                src_dev_name = json.load(f).get("iotmSettings", {}).get("name")
        # Копирование проекта PlatformIO:
        # создаём обычный проект из корневого myProfile.json как шаблона
        ok, msg = projects.create_project(dst_cat, dst_name, "")
        if ok:
            # Восстанавливаем исходное имя устройства (create_project перезаписывает его именем проекта)
            if src_dev_name:
                cfg = projects.load_project_config(dst_cat, dst_name)
                if cfg is not None:
                    cfg.setdefault("iotmSettings", {})["name"] = src_dev_name
                    projects.save_project_config(dst_cat, dst_name, cfg)
            # Копируем и platformio.ini из корня в новый проект
            dst_dir = os.path.join(projects.PROJECTS_DIR, dst_cat, dst_name)
            if os.path.exists(PLATFORMIO_INI_FILE):
                shutil.copy(PLATFORMIO_INI_FILE, os.path.join(dst_dir, 'platformio.ini'))
    else:
        ok, msg = projects.copy_project(src_cat, src_name, dst_cat, dst_name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/move', methods=['POST'])
def api_move_project():
    data = request.json
    if projects.is_platformio(data.get('src_name', '')):
        return jsonify({"success": False, "error": "Проект PlatformIO нельзя перенести"}), 400
    ok, msg = projects.move_project(
        data.get('src_cat', ''), data.get('src_name', ''),
        data.get('dst_cat', ''), data.get('dst_name', '')
    )
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/<category>/<name>/open', methods=['POST'])
def api_open_project(category, name):
    global current_project, current_config
    config = projects.load_project_config(category, name)
    if config is None:
        return jsonify({"success": False, "error": "Проект не найден"}), 404
    current_project = {"category": category, "name": name}
    current_config = config
    projects.save_history(category, name)
    about = projects.load_project_about(category, name)
    # Определяем платформу из конфига
    global current_platform
    de = config.get("projectProp", {}).get("platformio", {}).get("default_envs", "")
    if de:
        current_platform = de
    logger.info(f"Открыт проект: {category}/{name}")
    return jsonify({"success": True, "config": config, "about": about, "platform": current_platform})


@app.route('/api/platformio/open', methods=['POST'])
def api_open_platformio():
    """Открытие проекта PlatformIO.

    Данные берутся напрямую из корневого myProfile.json,
    список платформ — из platformio.ini.
    """
    global current_project, current_config, current_platform
    if not os.path.exists(ROOT_CONFIG_FILE):
        return jsonify({"success": False, "error": "myProfile.json не найден"}), 404
    with open(ROOT_CONFIG_FILE, 'r', encoding='utf-8') as f:
        config = json.load(f)
    current_project = {"category": projects.PLATFORMIO_PROJECT, "name": projects.PLATFORMIO_PROJECT}
    current_config = config
    # Платформа по умолчанию из конфига
    de = config.get("projectProp", {}).get("platformio", {}).get("default_envs", "")
    if de:
        current_platform = de
    logger.info(f"Открыт проект: {projects.PLATFORMIO_PROJECT}")
    return jsonify({
        "success": True,
        "config": config,
        "about": "",
        "platform": current_platform,
        "protected": True,
    })


@app.route('/api/projects/last', methods=['GET'])
def api_last_project():
    hist = projects.load_history()
    if not hist:
        return jsonify({"success": True, "project": None})
    # Проверяем, существует ли ещё
    path = os.path.join(projects.PROJECTS_DIR, hist.get("category", ""), hist.get("name", ""))
    if not os.path.exists(os.path.join(path, projects.CONFIG_FILENAME)):
        return jsonify({"success": True, "project": None})
    return jsonify({"success": True, "project": hist})


# ==================== Маршруты: конфигурация ====================

@app.route('/api/config', methods=['GET'])
def api_get_config():
    return jsonify(current_config or {})


@app.route('/api/config/save', methods=['POST'])
def api_save_config():
    global current_config
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    data = request.json
    if "modules" not in data:
        return jsonify({"success": False, "error": "Неверный формат"}), 400
    with _lock:
        current_config = data
        projects.save_project_config(current_project["category"], current_project["name"], data)
    return jsonify({"success": True})


@app.route('/api/config/settings', methods=['POST'])
def api_save_settings():
    global current_config
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    settings = request.json
    with _lock:
        if "iotmSettings" not in current_config:
            current_config["iotmSettings"] = {}
        current_config["iotmSettings"].update(settings)
        projects.save_project_config(current_project["category"], current_project["name"], current_config)
    return jsonify({"success": True})


@app.route('/api/config/about', methods=['POST'])
def api_save_about():
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    text = request.json.get('text', '')
    projects.save_project_about(current_project["category"], current_project["name"], text)
    return jsonify({"success": True})


@app.route('/api/config/export', methods=['GET'])
def api_export():
    if not current_config:
        return jsonify({"success": False, "error": "Нет конфигурации"}), 400
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = f"myProfile_{ts}.json"
    return jsonify({"success": True, "data": json.dumps(current_config, ensure_ascii=False, indent=2), "filename": fname})


# ==================== Маршруты: модули ====================

@app.route('/api/modules/toggle', methods=['POST'])
def api_toggle_module():
    global current_config
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    data = request.json
    section = data.get('section', '')
    path = data.get('path', '')
    active = data.get('active', False)
    with _lock:
        if section in current_config.get("modules", {}):
            for m in current_config["modules"][section]:
                if m.get("path") == path:
                    m["active"] = active
                    break
        projects.save_project_config(current_project["category"], current_project["name"], current_config)
    fp, fu, ft, rp, ru, rt = calc_size()
    sp, su, st = get_fs_usage()
    return jsonify({"success": True, "flash_pct": fp, "flash_used": fu, "flash_total": ft,
                     "ram_pct": rp, "ram_used": ru, "ram_total": rt,
                     "fs_pct": sp, "fs_used": su, "fs_total": st})


@app.route('/api/modules/compatibility', methods=['GET'])
def api_compat():
    return jsonify({"success": True, "compatibility": get_compat_map(), "platform": current_platform})


@app.route('/api/modules/reload', methods=['POST'])
def api_modules_reload():
    """Перезагрузка кэша modinfo с диска (после замера размеров)."""
    scan_modinfo()
    return jsonify({"success": True})


@app.route('/api/modules/info', methods=['POST'])
def api_module_info():
    path = request.json.get('path', '')
    if not path:
        return jsonify({"success": False, "error": "Путь не указан"}), 400
    name = path.split("/")[-1]
    info = modinfo_cache.get(name, {})
    if not info:
        return jsonify({"success": False, "error": "Информация не найдена"}), 404
    return jsonify({"success": True, "info": {"about": info.get("about", {}), "usedLibs": info.get("usedLibs", {}),
                                               "usedFLASH": info.get("usedFLASH", {}), "usedRAM": info.get("usedRAM", {})}})


# ==================== Маршруты: платформы ====================

@app.route('/api/platforms', methods=['GET'])
def api_platforms():
    # Список платформ берём из platformio.ini текущего проекта (или корневого)
    platforms = []
    for p in get_platformio_platforms():
        pl = platforms_cache.get(p, {})
        platforms.append({
            "name": p,
            "baseline_flash": pl.get("baseline_flash", 0),
        })
    return jsonify({"success": True, "platforms": platforms})


@app.route('/api/platform/change', methods=['POST'])
def api_change_platform():
    global current_platform
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    new_plat = request.json.get('platform', '')
    names = get_platformio_platforms()
    if new_plat not in names:
        return jsonify({"success": False, "error": "Платформа не найдена"}), 400
    current_platform = new_plat
    # Отключаем несовместимые
    disabled = 0
    with _lock:
        for section, mods in current_config.get("modules", {}).items():
            if not isinstance(mods, list):
                continue
            for m in mods:
                name = m.get("path", "").split("/")[-1]
                libs = modinfo_cache.get(name, {}).get("usedLibs", {})
                if m.get("active") and not is_compatible(current_platform, libs):
                    m["active"] = False
                    disabled += 1
        # Сохраняем default_envs
        current_config.setdefault("projectProp", {}).setdefault("platformio", {})["default_envs"] = current_platform
        projects.save_project_config(current_project["category"], current_project["name"], current_config)
    fp, fu, ft, rp, ru, rt = calc_size()
    sp, su, st = get_fs_usage()
    logger.info(f"Платформа: {current_platform}, отключено: {disabled}")
    return jsonify({"success": True, "platform": current_platform, "flash_pct": fp, "flash_used": fu, "flash_total": ft,
                     "ram_pct": rp, "ram_used": ru, "ram_total": rt,
                     "fs_pct": sp, "fs_used": su, "fs_total": st, "disabled_count": disabled})


@app.route('/api/size', methods=['GET'])
def api_size():
    fp, fu, ft, rp, ru, rt = calc_size()
    sp, su, st = get_fs_usage()
    return jsonify({"flash_pct": fp, "flash_used": fu, "flash_total": ft,
                     "ram_pct": rp, "ram_used": ru, "ram_total": rt,
                     "fs_pct": sp, "fs_used": su, "fs_total": st,
                     "platform": current_platform})


# ==================== Сборка прошивки ====================

def _get_platformio_path():
    """Путь к исполняемому файлу PlatformIO (pio/platformio).

    Сначала ищем команду в PATH, затем резервно — в стандартном каталоге установки.
    """
    # 1. Поиск в PATH (pio или platformio)
    for name in ('pio', 'platformio'):
        found = shutil.which(name)
        if found:
            return found
    # 2. Резерв: стандартный каталог установки PlatformIO
    if os.name == 'nt':
        exe_names = ['platformio.exe', 'pio.exe']
        base = os.path.join(os.environ['USERPROFILE'], '.platformio', 'penv', 'Scripts')
    else:
        exe_names = ['pio', 'platformio']
        base = os.path.join(os.environ.get('HOME', ''), '.platformio', 'penv', 'bin')
    for name in exe_names:
        candidate = os.path.join(base, name)
        if os.path.isfile(candidate):
            return candidate
    # Если ни один не найден — возвращаем дефолт, чтобы вызвать понятную ошибку запуска
    return os.path.join(base, exe_names[0])


def _resolve_build_config(proj, config):
    """Формирует cfg для build.start() по текущему проекту."""
    if projects.is_platformio(proj.get("name", "")):
        profile = ROOT_CONFIG_FILE
        ini = PLATFORMIO_INI_FILE
    else:
        proj_dir = os.path.join(projects.PROJECTS_DIR, proj.get("category", ""), proj.get("name", ""))
        profile = os.path.join(proj_dir, projects.CONFIG_FILENAME)
        ini = os.path.join(proj_dir, "platformio.ini")
    if not os.path.isfile(profile):
        logger.error(f"Профиль не найден: {profile}")
        return None
    env = ""
    try:
        env = config.get("projectProp", {}).get("platformio", {}).get("default_envs", "")
    except AttributeError:
        env = ""
    # Скрипт подготовки профиля лежит в utils/ рядом с build.py
    prepare_script = os.path.join(os.path.dirname(os.path.abspath(build.__file__)), "PrepareProject.py")
    return {
        "profile": profile,
        "ini": ini,
        "env": env,
        "pio": _get_platformio_path(),
        "prepare": prepare_script,
        "cwd": PROJECT_ROOT,
        # Для корневого PlatformIO-проекта data_svelte в корне; для остальных — в iotm/<платформа>
        "data_dir": (os.path.join(os.path.dirname(profile), "data_svelte")
                     if projects.is_platformio(proj.get("name", ""))
                     else os.path.join(os.path.dirname(profile), "iotm", env, "data_svelte")),
        "project_label": f"{proj.get('category','')}/{proj.get('name','')}",
    }


@app.route('/api/build/start', methods=['POST'])
def api_build_start():
    """Запуск сборки в фоне. Перед сборкой сохраняем текущий конфиг."""
    global current_config
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    if build.is_running():
        return jsonify({"success": False, "error": "Сборка уже выполняется"}), 409
    if measure_run.is_running():
        return jsonify({"success": False, "error": "Замер размера уже выполняется — дождитесь его завершения"}), 409
    # Сохраняем последние правки конфигурации, чтобы сборка читала актуальный профиль
    if current_config:
        try:
            with _lock:
                projects.save_project_config(current_project["category"], current_project["name"], current_config)
        except Exception as e:
            logger.error(f"Не удалось сохранить конфиг перед сборкой: {e}")
    cfg = _resolve_build_config(current_project, current_config or {})
    if cfg is None:
        return jsonify({"success": False, "error": "Не удалось определить пути для сборки"}), 400
    build.start(cfg)
    logger.info(f"Сборка запущена: {cfg['project_label']}, env={cfg['env']}")
    return jsonify({"success": True})


@app.route('/api/build/stream')
def api_build_stream():
    """SSE-поток событий сборки (лог, шаги, финал)."""
    def gen():
        for chunk in build.event_stream():
            yield chunk
        # После успешной сборки сохраняем ёмкость ФС (total_fs) в platforms.json, если её ещё нет
        try:
            st = build.get_status()
            if st.get("success") and st.get("sizes") and st["sizes"].get("fs_total"):
                save_platform_fs_total(current_platform, st["sizes"]["fs_total"])
        except Exception as e:  # noqa: BLE001
            logger.error(f"Не удалось сохранить total_fs после сборки: {e}")
    return Response(gen(), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ==================== Маршруты: замер размера модулей ====================

@app.route('/api/measure/start', methods=['POST'])
def api_measure_start():
    """Запуск замера размера модулей (measure.py) в фоне."""
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    if build.is_running():
        return jsonify({"success": False, "error": "Сборка уже выполняется — дождитесь её завершения"}), 409
    if measure_run.is_running():
        return jsonify({"success": False, "error": "Замер размера уже выполняется"}), 409

    data = request.json or {}
    scope = data.get('scope', 'all')       # all | profile | without | module | baseline
    module_path = (data.get('module') or '').strip()
    platform = (data.get('platform') or '').strip() or current_platform

    args = ['--no-color', '--env', platform,
            '--pio', _get_platformio_path(), '--baseline', 'prev']
    label = f"{current_project.get('category', '')}/{current_project.get('name', '')}"

    if scope == 'module':
        if not module_path:
            return jsonify({"success": False, "error": "Модуль не указан"}), 400
        args += ['--module', module_path]
        label = f"{label} · модуль {module_path.split('/')[-1]}"
    elif scope == 'baseline':
        # Только базовая прошивка (без модулей) — нужна свежая baseline-сборка.
        args += ['--baseline', 'build', '--baseline-only']
        label = f"{label} · базовая прошивка"
    elif scope == 'profile':
        args += ['--mode', '2']
    elif scope == 'without':
        args += ['--mode', '3']
    else:
        args += ['--mode', '1']

    # Каталог выбранного проекта — для расчёта размера папки data_svelte в iotm/<платформа>
    args += ['--project-dir', _project_dir(current_project)]

    # Файл-флаг мягкого прерывания (для /api/measure/abort)
    abort_file = os.path.join(PROJECT_ROOT, '.measure_abort')
    cfg = {
        "script": MEASURE_SCRIPT,
        "args": args + ['--abort-file', abort_file],
        "cwd": PROJECT_ROOT,
        "label": label,
        "abort_file": abort_file,
    }
    if not measure_run.start(cfg):
        return jsonify({"success": False, "error": "Не удалось запустить замер"}), 409
    logger.info(f"Замер запущен: scope={scope}, platform={platform}, module={module_path}")
    return jsonify({"success": True})


@app.route('/api/measure/stream')
def api_measure_stream():
    """SSE-поток событий замера (лог, финал)."""
    def gen():
        for chunk in measure_run.event_stream():
            yield chunk
        # Замер завершён — обновляем кэши размеров для отображения в UI
        try:
            scan_modinfo()
            load_platforms()
            logger.info("Кэши modinfo/platforms обновлены после замера")
        except Exception as e:  # noqa: BLE001
            logger.error(f"Не удалось обновить кэши после замера: {e}")
    return Response(gen(), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.route('/api/measure/abort', methods=['POST'])
def api_measure_abort():
    """Мягкое прерывание текущего замера (measure.py восстановит состояние проекта)."""
    if not measure_run.is_running():
        return jsonify({"success": False, "error": "Замер не выполняется"}), 409
    if measure_run.stop():
        logger.info("Запрос на прерывание замера отправлен")
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Не удалось прервать замер"}), 409


# ==================== Маршруты: валидация ====================

@app.route('/api/validate/name', methods=['GET'])
def api_validate_name():
    val = request.args.get('value', '')
    cur = request.args.get('project', '')
    ok, msg = projects.validate_name(val, cur if cur else None)
    return jsonify({"valid": ok, "message": msg})


@app.route('/api/validate/apssid', methods=['GET'])
def api_validate_apssid():
    val = request.args.get('value', '')
    cur = request.args.get('project', '')
    ok, msg = projects.validate_apssid(val, cur if cur else None)
    return jsonify({"valid": ok, "message": msg})


# ==================== Маршруты: импорт базового конфига ====================

@app.route('/api/config/import-root', methods=['POST'])
def api_import_root():
    """Импорт myProfile.json из корня проекта как шаблона для нового проекта"""
    global current_config
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    if not os.path.exists(ROOT_CONFIG_FILE):
        return jsonify({"success": False, "error": "myProfile.json не найден"}), 404
    with open(ROOT_CONFIG_FILE, 'r', encoding='utf-8') as f:
        base = json.load(f)
    # Сохраняем имя устройства из текущего проекта
    dev_name = current_config.get("iotmSettings", {}).get("name", current_project["name"])
    base["iotmSettings"]["name"] = dev_name
    with _lock:
        current_config = base
        projects.save_project_config(current_project["category"], current_project["name"], base)
    logger.info(f"Импортирован базовый конфиг в {current_project['category']}/{current_project['name']}")
    return jsonify({"success": True, "config": base})


# ==================== Копирование настроек ====================

@app.route('/api/projects/list-all', methods=['GET'])
def api_list_all():
    """Список всех проектов для копирования настроек"""
    tree = projects.list_projects()
    flat = []
    for cat, projs in tree.items():
        for p in projs:
            flat.append({"category": cat, "name": p})
    return jsonify({"success": True, "projects": flat})


@app.route('/api/projects/<category>/<name>/settings', methods=['GET'])
def api_get_project_settings(category, name):
    """Получение сырых iotmSettings проекта (для копирования отдельных групп)"""
    config = projects.load_project_config(category, name)
    if config is None:
        return jsonify({"success": False, "error": "Проект не найден"}), 404
    return jsonify({"success": True, "settings": config.get("iotmSettings", {})})


@app.route('/api/projects/copy-settings', methods=['POST'])
def api_copy_settings():
    """Копирование iotmSettings из другого проекта"""
    global current_config
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    data = request.json
    src_cat = data.get('src_cat', '')
    src_name = data.get('src_name', '')
    src_config = projects.load_project_config(src_cat, src_name)
    if not src_config:
        return jsonify({"success": False, "error": "Исходный проект не найден"}), 404
    # Копируем iotmSettings, но НЕ трогаем name и apssid текущего устройства
    src_settings = dict(src_config.get("iotmSettings", {}))
    src_settings.pop("name", None)
    src_settings.pop("apssid", None)
    with _lock:
        current_config.setdefault("iotmSettings", {}).update(src_settings)
        projects.save_project_config(current_project["category"], current_project["name"], current_config)
    return jsonify({"success": True, "settings": current_config["iotmSettings"]})


@app.route('/api/projects/copy-modules', methods=['POST'])
def api_copy_modules():
    """Копирование modules из другого проекта"""
    global current_config
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    data = request.json
    src_cat = data.get('src_cat', '')
    src_name = data.get('src_name', '')
    src_config = projects.load_project_config(src_cat, src_name)
    if not src_config:
        return jsonify({"success": False, "error": "Исходный проект не найден"}), 404
    with _lock:
        current_config["modules"] = src_config.get("modules", {})
        projects.save_project_config(current_project["category"], current_project["name"], current_config)
    return jsonify({"success": True, "modules": current_config["modules"]})


# ==================== Устройства: API ====================

@app.route('/api/device/<ip>/info', methods=['GET'])
def api_device_info(ip):
    """Информация об устройстве и путь к его папке на диске."""
    entry = get_device_folder(ip)
    if not entry:
        return jsonify({"success": False, "error": "Папка устройства ещё не создана"}), 404
    return jsonify({"success": True, **entry})


@app.route('/api/device/<ip>/fetch/ram', methods=['POST'])
def api_device_fetch_ram(ip):
    """Скачивает файлы раздела RAM с устройства (команды /config| и /profile|)."""
    entry = get_device_folder(ip)
    if not entry:
        return jsonify({"success": False, "error": "Папка устройства ещё не создана"}), 404
    try:
        saved = ws_client.fetch_ram(ip, entry["ram_dir"])
        return jsonify({"success": True, "files": saved})
    except Exception as e:
        logger.error(f"fetch RAM {ip}: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/device/<ip>/tree/<section>', methods=['GET'])
def api_device_tree(ip, section):
    """Дерево файлов раздела RAM или FS (локальная папка устройства)."""
    entry = get_device_folder(ip)
    if not entry:
        return jsonify({"success": False, "error": "Папка устройства ещё не создана"}), 404
    key = section.lower()
    if key not in ("ram", "fs"):
        return jsonify({"success": False, "error": "Неизвестный раздел"}), 400
    root = entry[f"{key}_dir"]
    dirs, files = _walk_tree(root)
    return jsonify({"success": True, "root": root, "dirs": dirs, "files": files})


@app.route('/api/device/<ip>/file/<section>', methods=['GET'])
def api_device_read_file(ip, section):
    """Содержимое файла в разделе RAM или FS."""
    entry = get_device_folder(ip)
    if not entry:
        return jsonify({"success": False, "error": "Папка устройства ещё не создана"}), 404
    key = section.lower()
    if key not in ("ram", "fs"):
        return jsonify({"success": False, "error": "Неизвестный раздел"}), 400
    root = entry[f"{key}_dir"]
    rel = request.args.get('path', '')
    abs_path = _safe_path(root, rel)
    if not abs_path or not os.path.isfile(abs_path):
        return jsonify({"success": False, "error": "Файл не найден"}), 404
    try:
        with open(abs_path, 'r', encoding='utf-8', errors='replace') as f:
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


@app.route('/api/device/<ip>/file/<section>', methods=['POST'])
def api_device_save_file(ip, section):
    """Сохраняет изменённый файл локально в папку устройства."""
    entry = get_device_folder(ip)
    if not entry:
        return jsonify({"success": False, "error": "Папка устройства ещё не создана"}), 404
    key = section.lower()
    if key not in ("ram", "fs"):
        return jsonify({"success": False, "error": "Неизвестный раздел"}), 400
    root = entry[f"{key}_dir"]
    data = request.json or {}
    rel = data.get('path', '')
    content = data.get('content', '')
    abs_path = _safe_path(root, rel)
    if not abs_path:
        return jsonify({"success": False, "error": "Недопустимый путь"}), 400
    try:
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    return jsonify({"success": True, "path": rel})


@app.route('/api/device/<ip>/write/ram', methods=['POST'])
def api_device_write_ram(ip):
    """Записывает изменённый файл RAM обратно на устройство (обратная WS-команда).

    Локальная копия в папке устройства также обновляется.
    """
    entry = get_device_folder(ip)
    if not entry:
        return jsonify({"success": False, "error": "Папка устройства ещё не создана"}), 404
    data = request.json or {}
    rel = data.get('path', '')
    content = data.get('content', '')
    abs_path = _safe_path(entry["ram_dir"], rel)
    if not abs_path or not os.path.isfile(abs_path):
        return jsonify({"success": False, "error": "Файл не найден локально"}), 404
    fname = os.path.basename(rel)
    try:
        ws_client.write_file(ip, fname, content)
        with open(abs_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return jsonify({"success": True, "path": rel})
    except Exception as e:
        logger.error(f"write RAM {ip} {rel}: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# ==================== Инициализация ====================

def init():
    logger.info("=" * 60)
    logger.info("MagicIoTm запускается...")
    logger.info("=" * 60)
    projects.ensure_dirs()
    load_platforms()
    scan_modinfo()
    start_device_listener()
    logger.info("Готов к работе")
    logger.info("=" * 60)


if __name__ == '__main__':
    init()
    logger.info("Сервер: http://127.0.0.1:5005")
    app.run(debug=True, host='127.0.0.1', port=5005, threaded=True, use_reloader=False)
