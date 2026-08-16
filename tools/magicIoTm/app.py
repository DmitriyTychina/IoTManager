"""
magicIoTm — Конфигуратор прошивок IoTmanager
Web-сервер на Flask для управления проектами и конфигурациями
"""

import json
import os
import glob
import logging
import threading
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from utils import projects

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
PROJECT_ROOT = os.path.dirname(BASE_DIR)
ROOT_CONFIG_FILE = os.path.join(PROJECT_ROOT, 'myProfile.json')
MODULES_SRC_DIR = os.path.join(PROJECT_ROOT, 'src', 'modules')

# ==================== Состояние ====================
current_project = None  # {"category": ..., "name": ...}
current_config = None
current_platform = "esp8266_4mb"
modinfo_cache = {}

# ==================== modinfo кэш ====================

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
            modinfo_cache[name] = {
                "size": about.get("size", {}),
                "usedRam": about.get("usedRam", {}),
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


def get_module_size(name, platform):
    info = modinfo_cache.get(name, {})
    size_data = info.get("size", {})
    if isinstance(size_data, (int, float)):
        return size_data
    if isinstance(size_data, dict):
        if platform in size_data:
            return size_data[platform]
        for pattern, value in size_data.items():
            if pattern.endswith("*") and platform.startswith(pattern[:-1]):
                return value
        if platform.startswith("esp82"):
            v = size_data.get("esp32_4mb", 0)
            if v > 0:
                return v
        if platform.startswith("esp32"):
            v = size_data.get("esp8266_4mb", 0)
            if v > 0:
                return v
    if not size_data:
        ur = info.get("usedRam", {})
        if isinstance(ur, dict):
            if platform in ur:
                return ur[platform]
            if platform.startswith("esp32"):
                return ur.get("esp32_4mb", 0)
            if platform.startswith("esp82"):
                return ur.get("esp8266_4mb", 0)
    return 0


def get_max_size(platform):
    envs = (current_config or {}).get("projectProp", {}).get("platformio", {}).get("envs", [])
    for env in envs:
        if env.get("name") == platform:
            try:
                fw = int(env.get("firmware", "0x00000"), 16)
                fs = int(env.get("littlefs", "0x00000"), 16)
                return fs - fw
            except (ValueError, TypeError):
                return 0
    return 0


def calc_size():
    if not current_config:
        return 0, 0, 0
    total = 0
    for mods in current_config.get("modules", {}).values():
        if not isinstance(mods, list):
            continue
        for m in mods:
            if m.get("active"):
                total += get_module_size(m.get("path", "").split("/")[-1], current_platform)
    mx = get_max_size(current_platform)
    pct = round(total / mx * 100) if mx > 0 else 0
    return pct, total, mx


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
                "size": get_module_size(name, current_platform),
            }
    return result


# ==================== Маршруты: страницы ====================

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')


# ==================== Маршруты: проекты ====================

@app.route('/api/projects', methods=['GET'])
def api_list_projects():
    return jsonify({"success": True, "tree": projects.list_projects()})


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
    ok, msg = projects.delete_project(category, name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/<category>/<name>/rename', methods=['POST'])
def api_rename_project(category, name):
    new_name = request.json.get('name', '').strip()
    if not new_name:
        return jsonify({"success": False, "error": "Новое имя не указано"}), 400
    ok, msg = projects.rename_project(category, name, new_name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/copy', methods=['POST'])
def api_copy_project():
    data = request.json
    ok, msg = projects.copy_project(
        data.get('src_cat', ''), data.get('src_name', ''),
        data.get('dst_cat', ''), data.get('dst_name', '')
    )
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/move', methods=['POST'])
def api_move_project():
    data = request.json
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
    pct, total, mx = calc_size()
    return jsonify({"success": True, "size": pct, "total_bytes": total, "max_bytes": mx})


@app.route('/api/modules/compatibility', methods=['GET'])
def api_compat():
    return jsonify({"success": True, "compatibility": get_compat_map(), "platform": current_platform})


@app.route('/api/modules/info', methods=['POST'])
def api_module_info():
    path = request.json.get('path', '')
    if not path:
        return jsonify({"success": False, "error": "Путь не указан"}), 400
    name = path.split("/")[-1]
    info = modinfo_cache.get(name, {})
    if not info:
        return jsonify({"success": False, "error": "Информация не найдена"}), 404
    return jsonify({"success": True, "info": {"about": info.get("about", {}), "usedLibs": info.get("usedLibs", {}), "size": info.get("size", {})}})


# ==================== Маршруты: платформы ====================

@app.route('/api/platforms', methods=['GET'])
def api_platforms():
    envs = (current_config or {}).get("projectProp", {}).get("platformio", {}).get("envs", [])
    return jsonify({"success": True, "platforms": [{"name": e.get("name", "")} for e in envs if "name" in e]})


@app.route('/api/platform/change', methods=['POST'])
def api_change_platform():
    global current_platform
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    new_plat = request.json.get('platform', '')
    envs = current_config.get("projectProp", {}).get("platformio", {}).get("envs", [])
    names = [e.get("name") for e in envs]
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
    pct, total, mx = calc_size()
    logger.info(f"Платформа: {current_platform}, отключено: {disabled}")
    return jsonify({"success": True, "platform": current_platform, "size": pct, "disabled_count": disabled})


@app.route('/api/size', methods=['GET'])
def api_size():
    pct, total, mx = calc_size()
    return jsonify({"size": pct, "total_bytes": total, "max_bytes": mx, "platform": current_platform})


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


# ==================== Инициализация ====================

def init():
    logger.info("=" * 60)
    logger.info("magicIoTm запускается...")
    logger.info("=" * 60)
    projects.ensure_dirs()
    scan_modinfo()
    logger.info("Готов к работе")
    logger.info("=" * 60)


if __name__ == '__main__':
    init()
    logger.info("Сервер: http://127.0.0.1:5005")
    app.run(debug=True, host='127.0.0.1', port=5005, threaded=True, use_reloader=False)
