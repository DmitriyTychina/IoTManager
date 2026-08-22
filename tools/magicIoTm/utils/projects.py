"""
Управление проектами magicIoTm
Каждый проект = папка с data.json, about.txt, myProfile.json
Категории = папки верхнего уровня внутри projects/
"""

import json
import os
import shutil
import logging
from datetime import datetime
from threading import Lock

logger = logging.getLogger(__name__)

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECTS_DIR = os.path.join(PROJECT_ROOT, 'projects')
ROOT_CONFIG_FILE = os.path.join(PROJECT_ROOT, '..', '..', 'myProfile.json')
HISTORY_FILE = os.path.join(PROJECTS_DIR, '.history.json')
BACKUP_DIR = os.path.join(PROJECTS_DIR, '.backups')

CONFIG_FILENAME = 'myProfile.json'

# Виртуальный защищённый проект PlatformIO (нельзя переименовать, перенести, удалить).
# Его данные берутся напрямую из корневого myProfile.json, а список платформ — из platformio.ini.
PLATFORMIO_PROJECT = 'PlatformIO'


def is_platformio(name):
    """Проверка, является ли имя проекта виртуальным проектом PlatformIO"""
    return name == PLATFORMIO_PROJECT


_lock = Lock()


def ensure_dirs():
    """Создание служебных директорий"""
    os.makedirs(PROJECTS_DIR, exist_ok=True)
    os.makedirs(BACKUP_DIR, exist_ok=True)


def list_projects():
    """Получение дерева проектов: {category: [project_names]}"""
    tree = {}
    try:
        for entry in sorted(os.listdir(PROJECTS_DIR)):
            full = os.path.join(PROJECTS_DIR, entry)
            if not os.path.isdir(full) or entry.startswith('.'):
                continue
            # Категория (включая пустые)
            projects = []
            for proj in sorted(os.listdir(full)):
                proj_path = os.path.join(full, proj)
                if os.path.isdir(proj_path) and os.path.exists(os.path.join(proj_path, CONFIG_FILENAME)):
                    projects.append(proj)
            tree[entry] = projects
    except Exception as e:
        logger.error(f"Ошибка чтения дерева проектов: {e}")
    return tree


def create_category(name):
    """Создание папки-категории"""
    path = os.path.join(PROJECTS_DIR, name)
    if os.path.exists(path):
        return False, "Категория уже существует"
    os.makedirs(path, exist_ok=True)
    logger.info(f"Создана категория: {name}")
    return True, "OK"


def delete_category(name):
    """Удаление папки-категории с резервной копией"""
    path = os.path.join(PROJECTS_DIR, name)
    if not os.path.exists(path):
        return False, "Категория не найдена"
    # Резервная копия
    _backup(path, name)
    shutil.rmtree(path)
    logger.info(f"Удалена категория: {name}")
    return True, "OK"


def create_project(category, name, description=""):
    """Создание проекта внутри категории"""
    cat_path = os.path.join(PROJECTS_DIR, category)
    if not os.path.exists(cat_path):
        return False, "Категория не найдена"

    proj_path = os.path.join(cat_path, name)
    if os.path.exists(proj_path):
        return False, "Проект уже существует"

    os.makedirs(proj_path, exist_ok=True)

    # Копируем базовый myProfile.json из корня проекта как шаблон
    config = None
    if os.path.exists(ROOT_CONFIG_FILE):
        try:
            with open(ROOT_CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
            logger.info(f"Создан конфиг из шаблона {ROOT_CONFIG_FILE}")
        except Exception as e:
            logger.error(f"Ошибка чтения шаблона {ROOT_CONFIG_FILE}: {e}")
            config = None

    if config is None:
        # Структура по умолчанию
        config = {
            "iotmSettings": {
                "name": name,
                "apssid": "",
                "appass": "12341234",
                "timezone": 3,
                "ntp": "pool.ntp.org",
                "weblogin": "admin",
                "webpass": "admin",
                "mqttServer": "",
                "mqttPort": 8021,
                "mqttPrefix": "/" + name,
                "mqttUser": "",
                "mqttPass": "",
                "serverip": "http://iotmanager.org",
                "serverlocal": "",
                "log": 0,
                "mqttin": 0,
                "pinSCL": 0,
                "pinSDA": 0,
                "i2cFreq": 100000,
                "wg": "group1"
            },
            "projectProp": {"platformio": {"default_envs": "esp8266_4mb"}},
            "modules": {}
        }

    # Обновляем имя устройства в новом конфиге
    config.setdefault("iotmSettings", {})["name"] = name

    data = {"name": name, "category": category, "created": datetime.now().isoformat()}

    with open(os.path.join(proj_path, CONFIG_FILENAME), 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
    with open(os.path.join(proj_path, 'data.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(os.path.join(proj_path, 'about.txt'), 'w', encoding='utf-8') as f:
        f.write(description)

    logger.info(f"Создан проект: {category}/{name}")
    return True, "OK"


def delete_project(category, name):
    """Удаление проекта с резервной копией"""
    if is_platformio(name):
        return False, "Виртуальный проект PlatformIO нельзя удалить"
    proj_path = os.path.join(PROJECTS_DIR, category, name)
    if not os.path.exists(proj_path):
        return False, "Проект не найден"
    _backup(proj_path, f"{category}_{name}")
    shutil.rmtree(proj_path)
    logger.info(f"Удалён проект: {category}/{name}")
    return True, "OK"


def rename_project(category, old_name, new_name):
    """Переименование проекта"""
    if is_platformio(old_name):
        return False, "Виртуальный проект PlatformIO нельзя переименовать"
    cat_path = os.path.join(PROJECTS_DIR, category)
    old_path = os.path.join(cat_path, old_name)
    new_path = os.path.join(cat_path, new_name)
    if not os.path.exists(old_path):
        return False, "Проект не найден"
    if os.path.exists(new_path):
        return False, "Проект с таким именем уже существует"

    os.rename(old_path, new_path)

    # Обновляем data.json
    data_path = os.path.join(new_path, 'data.json')
    if os.path.exists(data_path):
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        data['name'] = new_name
        with open(data_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    logger.info(f"Переименован проект: {old_name} -> {new_name}")
    return True, "OK"


def copy_project(src_cat, src_name, dst_cat, dst_name):
    """Копирование проекта"""
    src_path = os.path.join(PROJECTS_DIR, src_cat, src_name)
    dst_cat_path = os.path.join(PROJECTS_DIR, dst_cat)
    dst_path = os.path.join(dst_cat_path, dst_name)
    if not os.path.exists(src_path):
        return False, "Исходный проект не найден"
    if os.path.exists(dst_path):
        return False, "Проект назначения уже существует"
    if not os.path.exists(dst_cat_path):
        return False, "Категория назначения не найдена"

    shutil.copytree(src_path, dst_path)

    # Обновляем data.json
    data_path = os.path.join(dst_path, 'data.json')
    if os.path.exists(data_path):
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        data['name'] = dst_name
        data['category'] = dst_cat
        data['created'] = datetime.now().isoformat()
        with open(data_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    logger.info(f"Скопирован проект: {src_cat}/{src_name} -> {dst_cat}/{dst_name}")
    return True, "OK"


def move_project(src_cat, src_name, dst_cat, dst_name=None):
    """Перенос проекта в другую категорию (с возможностью переименования)"""
    if is_platformio(src_name):
        return False, "Виртуальный проект PlatformIO нельзя перенести"
    src_path = os.path.join(PROJECTS_DIR, src_cat, src_name)
    dst_cat_path = os.path.join(PROJECTS_DIR, dst_cat)
    if not os.path.exists(src_path):
        return False, "Проект не найден"
    if not os.path.exists(dst_cat_path):
        return False, "Категория назначения не найдена"

    final_name = dst_name or src_name
    dst_path = os.path.join(dst_cat_path, final_name)

    if os.path.abspath(src_path) == os.path.abspath(dst_path):
        return False, "Проект уже находится в этой категории"
    if os.path.exists(dst_path):
        return False, "Проект с таким именем уже существует в категории назначения"

    shutil.move(src_path, dst_path)

    # Обновляем data.json
    data_path = os.path.join(dst_path, 'data.json')
    if os.path.exists(data_path):
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            data['name'] = final_name
            data['category'] = dst_cat
            with open(data_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Ошибка обновления data.json при переносе: {e}")

    logger.info(f"Перенесён проект: {src_cat}/{src_name} -> {dst_cat}/{final_name}")
    return True, "OK"


def load_project_config(category, name):
    """Загрузка myProfile.json проекта"""
    path = os.path.join(PROJECTS_DIR, category, name, CONFIG_FILENAME)
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_project_config(category, name, config):
    """Сохранение myProfile.json проекта"""
    if is_platformio(name):
        # Виртуальный проект PlatformIO пишет напрямую в корневой myProfile.json
        with open(ROOT_CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        return
    path = os.path.join(PROJECTS_DIR, category, name, CONFIG_FILENAME)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


def load_project_about(category, name):
    """Загрузка about.txt"""
    path = os.path.join(PROJECTS_DIR, category, name, 'about.txt')
    if not os.path.exists(path):
        return ""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def save_project_about(category, name, text):
    """Сохранение about.txt"""
    if is_platformio(name):
        # У виртуального проекта нет about.txt — игнорируем сохранение
        return
    path = os.path.join(PROJECTS_DIR, category, name, 'about.txt')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)


# ==================== История ====================

def save_history(category, name):
    """Сохранение последнего открытого проекта"""
    with _lock:
        hist = {"category": category, "name": name, "time": datetime.now().isoformat()}
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(hist, f, ensure_ascii=False, indent=2)


def load_history():
    """Загрузка последнего открытого проекта"""
    if not os.path.exists(HISTORY_FILE):
        return None
    try:
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


# ==================== Валидация ====================

def get_all_field_values(field, exclude_project=None):
    """Сбор значений поля из всех проектов (кроме текущего).

    Возвращает словарь {значение: [список проектов, использующих значение]}.
    """
    values = {}
    tree = list_projects()
    for cat, projects in tree.items():
        for proj in projects:
            if exclude_project and f"{cat}/{proj}" == exclude_project:
                continue
            config = load_project_config(cat, proj)
            if config:
                val = config.get("iotmSettings", {}).get(field, "")
                if val:
                    values.setdefault(val, []).append(f"{cat}/{proj}")
    # Виртуальный проект PlatformIO (данные берутся из корневого myProfile.json)
    if exclude_project not in (f"__virtual__/{PLATFORMIO_PROJECT}", PLATFORMIO_PROJECT) and os.path.exists(ROOT_CONFIG_FILE):
        try:
            with open(ROOT_CONFIG_FILE, 'r', encoding='utf-8') as f:
                pio_config = json.load(f)
            val = pio_config.get("iotmSettings", {}).get(field, "")
            if val:
                values.setdefault(val, []).append(PLATFORMIO_PROJECT)
        except Exception as e:
            logger.error(f"Ошибка чтения корневого конфига PlatformIO: {e}")
    return values


def validate_name(name, current_project=None):
    """Валидация имени устройства"""
    if not name:
        return False, "Имя не может быть пустым"
    if len(name) > 16:
        return False, "Имя не должно превышать 16 символов"
    if ' ' in name:
        return False, "Имя не должно содержать пробелы"
    # Проверка уникальности (текущий проект не участвует)
    all_names = get_all_field_values("name", exclude_project=current_project)
    owners = all_names.get(name)
    if owners:
        return False, f"Имя уже используется в проектах: {', '.join(owners)}"
    return True, "OK"


def validate_apssid(apssid, current_project=None):
    """Валидация apssid"""
    if not apssid:
        return True, "OK"  # Может быть пустым
    all_ssids = get_all_field_values("apssid", exclude_project=current_project)
    owners = all_ssids.get(apssid)
    if owners:
        return False, f"AP SSID уже используется в проектах: {', '.join(owners)}"
    return True, "OK"


# ==================== Резервное копирование ====================

def _backup(src_path, label):
    """Создание резервной копии перед удалением"""
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"{label}_{ts}"
    backup_path = os.path.join(BACKUP_DIR, backup_name)
    try:
        shutil.copytree(src_path, backup_path)
        logger.info(f"Резервная копия: {backup_path}")
    except Exception as e:
        logger.error(f"Ошибка резервного копирования: {e}")
