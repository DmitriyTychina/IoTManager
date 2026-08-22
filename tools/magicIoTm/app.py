"""
magicIoTm — Конфигуратор прошивок IoTmanager
Web-сервер на Flask для управления проектами и конфигурациями
"""

import json
import os
import glob
import re
import shutil
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
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
ROOT_CONFIG_FILE = os.path.join(PROJECT_ROOT, 'myProfile.json')
MODULES_SRC_DIR = os.path.join(PROJECT_ROOT, 'src', 'modules')
PLATFORMS_FILE = os.path.join(BASE_DIR, '..', 'measure_size', 'platforms.json')
PLATFORMIO_INI_FILE = os.path.join(PROJECT_ROOT, 'platformio.ini')

# ==================== Состояние ====================
current_project = None  # {"category": ..., "name": ...}
current_config = None
current_platform = "esp8266_4mb"
modinfo_cache = {}
platforms_cache = {}

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
    """Поиск значения по платформе с wildcard-фолбэком, '-' → 0"""
    if not data or not isinstance(data, dict):
        return 0
    v = data.get(platform)
    if v is not None and v != "-":
        return int(v) if isinstance(v, (int, float, str)) else 0
    # wildcard
    for pattern, value in data.items():
        if pattern.endswith("*") and platform.startswith(pattern[:-1]):
            if value != "-":
                return int(value) if isinstance(value, (int, float, str)) else 0
            return 0
    # кросс-платформенный фолбэк
    if platform.startswith("esp82"):
        v = data.get("esp32_4mb")
        if v and v != "-":
            return int(v)
    if platform.startswith("esp32"):
        v = data.get("esp8266_4mb")
        if v and v != "-":
            return int(v)
    return 0


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
    flash_pct = round(flash_used / tf * 100) if tf > 0 else 0
    ram_pct = round(ram_used / tr * 100) if tr > 0 else 0
    return flash_pct, flash_used, tf, ram_pct, ram_used, tr


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
    if projects.is_platformio(name):
        return jsonify({"success": False, "error": "Виртуальный проект PlatformIO нельзя удалить"}), 400
    ok, msg = projects.delete_project(category, name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@app.route('/api/projects/<category>/<name>/rename', methods=['POST'])
def api_rename_project(category, name):
    if projects.is_platformio(name):
        return jsonify({"success": False, "error": "Виртуальный проект PlatformIO нельзя переименовать"}), 400
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
        # Копирование проекта PlatformIO:
        # создаём обычный проект из корневого myProfile.json как шаблона
        ok, msg = projects.create_project(dst_cat, dst_name, "")
        if ok:
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
        return jsonify({"success": False, "error": "Виртуальный проект PlatformIO нельзя перенести"}), 400
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
    current_project = {"category": "__virtual__", "name": projects.PLATFORMIO_PROJECT}
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
    return jsonify({"success": True, "flash_pct": fp, "flash_used": fu, "flash_total": ft,
                     "ram_pct": rp, "ram_used": ru, "ram_total": rt})


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
    return jsonify({"success": True, "info": {"about": info.get("about", {}), "usedLibs": info.get("usedLibs", {}),
                                               "usedFLASH": info.get("usedFLASH", {}), "usedRAM": info.get("usedRAM", {})}})


# ==================== Маршруты: платформы ====================

@app.route('/api/platforms', methods=['GET'])
def api_platforms():
    # Список платформ загружаем только для проекта PlatformIO.
    # Для обычных проектов платформа фиксирована (из конфига) — менять её нельзя.
    if not current_project or not projects.is_platformio(current_project.get("name", "")):
        de = (current_config or {}).get("projectProp", {}).get("platformio", {}).get("default_envs", "")
        return jsonify({"success": True, "platforms": [{"name": de}] if de else []})
    platforms = [{"name": p} for p in get_platformio_platforms()]
    return jsonify({"success": True, "platforms": platforms})


@app.route('/api/platform/change', methods=['POST'])
def api_change_platform():
    global current_platform
    if not current_project:
        return jsonify({"success": False, "error": "Проект не открыт"}), 400
    if not projects.is_platformio(current_project.get("name", "")):
        return jsonify({"success": False, "error": "Смена платформы доступна только для проекта PlatformIO"}), 403
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
    logger.info(f"Платформа: {current_platform}, отключено: {disabled}")
    return jsonify({"success": True, "platform": current_platform, "flash_pct": fp, "flash_used": fu, "flash_total": ft,
                     "ram_pct": rp, "ram_used": ru, "ram_total": rt, "disabled_count": disabled})


@app.route('/api/size', methods=['GET'])
def api_size():
    fp, fu, ft, rp, ru, rt = calc_size()
    return jsonify({"flash_pct": fp, "flash_used": fu, "flash_total": ft,
                     "ram_pct": rp, "ram_used": ru, "ram_total": rt,
                     "platform": current_platform})


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
    load_platforms()
    scan_modinfo()
    logger.info("Готов к работе")
    logger.info("=" * 60)


if __name__ == '__main__':
    init()
    logger.info("Сервер: http://127.0.0.1:5005")
    app.run(debug=True, host='127.0.0.1', port=5005, threaded=True, use_reloader=False)
