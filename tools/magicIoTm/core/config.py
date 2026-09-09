"""
Конфигурация: платформы, модули, размеры, FS-использование.

Все функции, связанные с загрузкой/сохранением платформ, сканированием модулей,
расчётом размеров FLASH/RAM и FS-использования.
"""

import json
import os
import glob
import re
import shutil
import time
import logging

from utils import projects
import state.globals as globals_

# ==================== Логирование ====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
logger = logging.getLogger(__name__)

# ==================== Пути ====================
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(BASE_DIR)))
ROOT_CONFIG_FILE = os.path.join(PROJECT_ROOT, 'myProfile.json')
MODULES_SRC_DIR = os.path.join(PROJECT_ROOT, 'src', 'modules')
PLATFORMS_FILE = os.path.join(BASE_DIR, '..', '..', 'measure_size', 'platforms.json')
PLATFORMIO_INI_FILE = os.path.join(PROJECT_ROOT, 'platformio.ini')
MEASURE_SCRIPT = os.path.abspath(os.path.join(BASE_DIR, '..', '..', 'measure_size', 'measure.py'))


def load_platforms():
    """Загрузка platforms.json с baseline/total значениями"""
    globals_.platforms_cache.clear()
    try:
        with open(PLATFORMS_FILE, 'r', encoding='utf-8') as f:
            globals_.platforms_cache.update(json.load(f))
        logger.info(f"Загружено платформ: {len(globals_.platforms_cache)}")
    except Exception as e:
        logger.error(f"platforms.json: {e}")


def save_platform_fs_total(env, fs_total):
    """Сохраняет ёмкость ФС (total_fs) платформы в platforms.json.

    Запись происходит, если поля ещё нет ИЛИ текущее значение отличается от
    переданного размера (например, изменился раздел littlefs).
    """
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
    if env in globals_.platforms_cache:
        globals_.platforms_cache[env]["total_fs"] = entry.get("total_fs") or fs_total


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
    ini = get_project_platformio_path(globals_.current_project)
    return load_platformio_envs(ini)


def scan_modinfo():
    """Сканирование всех modinfo.json"""
    globals_.modinfo_cache.clear()
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
            globals_.modinfo_cache[name] = {
                "usedFLASH": used_flash,
                "usedRAM": used_ram,
                "usedLibs": info.get("usedLibs", {}),
                "about": about,
            }
        except Exception as e:
            logger.error(f"modinfo {fp}: {e}")
    logger.info(f"Кэш modinfo: {len(globals_.modinfo_cache)} модулей")


def is_compatible(platform, used_libs):
    if not used_libs:
        return True
    # список платформ — неперечисленные считаем совместимыми
    if isinstance(used_libs, list):
        return True
    if not isinstance(used_libs, dict):
        return True
    # структура вида {"exclude": [...], "platforms": [...]} и т.п.
    if "exclude" in used_libs or "platforms" in used_libs:
        excluded = set(used_libs.get("exclude") or [])
        included = set(used_libs.get("platforms") or [])
        if platform in excluded:
            return False
        if included and platform not in included:
            return False
        return True
    # обычный словарь: платформа → список библиотек (["exclude"] = запрет)
    if platform in used_libs:
        return used_libs[platform] != ["exclude"]
    for pattern, libs in used_libs.items():
        if pattern.endswith("*") and platform.startswith(pattern[:-1]):
            return libs != ["exclude"]
    # платформа не упомянута явно — считается НЕСОВМЕСТИМОЙ
    return False


def _lookup_platform_value(data, platform):
    """Поиск значения только по точной платформе, без фолбэков; '-' → 0"""
    if not data or not isinstance(data, dict):
        return 0
    v = data.get(platform)
    if v is None or v == "-":
        return 0
    return int(v) if isinstance(v, (int, float, str)) else 0


def _is_numeric_size(v):
    """True, если значение размера — число (0 — тоже измеренный размер)."""
    if isinstance(v, (int, float)):
        return True
    if isinstance(v, str):
        try:
            float(v)
            return True
        except (TypeError, ValueError):
            return False
    return False


def _module_size_state(used_flash, platform):
    """Статус размера модуля для платформы (по sizeInfo.usedFLASH).

    Возвращает:
      'ok'             — числовой размер для платформы есть;
      'error_platform' — значение "-" для текущей платформы, но для других
                         платформ есть размеры (ошибка компиляции именно
                         для этой платформы);
      'error_all'      — значение "-" для всех платформ (модуль не компилируется
                         ни для одной из замерявшихся платформ);
      'missing'        — нет записи для текущей платформы (размер не замерялся).
    """
    if not used_flash or not isinstance(used_flash, dict):
        return 'missing'
    val = used_flash.get(platform)
    if val is not None and _is_numeric_size(val):
        return 'ok'
    if val == "-":
        # Есть ли числовые размеры для других платформ
        for p, v in used_flash.items():
            if p != platform and _is_numeric_size(v):
                return 'error_platform'
        return 'error_all'
    return 'missing'


def get_module_flash(name, platform):
    """Размер FLASH модуля для платформы"""
    info = globals_.modinfo_cache.get(name, {})
    return _lookup_platform_value(info.get("usedFLASH", {}), platform)


def get_module_ram(name, platform):
    """Размер RAM модуля для платформы"""
    info = globals_.modinfo_cache.get(name, {})
    return _lookup_platform_value(info.get("usedRAM", {}), platform)


def get_platform_limits(platform):
    """Возвращает (baseline_flash, total_flash, baseline_ram, total_ram) из platforms.json"""
    p = globals_.platforms_cache.get(platform, {})
    return (
        p.get("baseline_flash", 0),
        p.get("total_flash", 0),
        p.get("baseline_ram", 0),
        p.get("total_ram", 0),
    )


def calc_size():
    """Расчёт заполнения FLASH и RAM: baseline + сумма активных модулей"""
    if not globals_.current_config:
        return 0, 0, 0, 0, 0, 0
    flash_total = 0
    ram_total = 0
    for mods in globals_.current_config.get("modules", {}).values():
        if not isinstance(mods, list):
            continue
        for m in mods:
            if m.get("active"):
                name = m.get("path", "").split("/")[-1]
                flash_total += get_module_flash(name, globals_.current_platform)
                ram_total += get_module_ram(name, globals_.current_platform)
    bf, tf, br, tr = get_platform_limits(globals_.current_platform)
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


def _find_data_svelte(proj_dir):
    """Путь к каталогу data_svelte внутри проекта (корень или iotm/<платформа>).

    Возвращает путь к папке data_svelte или None, если её нет.
    """
    root = os.path.join(proj_dir, "data_svelte")
    if os.path.isdir(root):
        return root
    iotm = os.path.join(proj_dir, "iotm")
    if os.path.isdir(iotm):
        for p in sorted(os.listdir(iotm)):
            cand = os.path.join(iotm, p, "data_svelte")
            if os.path.isdir(cand):
                return cand
    return None


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
    fs_used  — занятое: размер папки data_svelte проекта (в корне проекта).
    """
    fs_total = globals_.platforms_cache.get(globals_.current_platform, {}).get("total_fs", 0)
    if not fs_total:
        # Запасной источник ёмкости — свежесобранный образ файловой системы
        img_dir = os.path.join(PROJECT_ROOT, ".pio", "build", globals_.current_platform)
        for name in ("littlefs.bin", "spiffs.bin"):
            p = os.path.join(img_dir, name)
            if os.path.isfile(p):
                try:
                    fs_total = os.path.getsize(p)
                except OSError:
                    fs_total = 0
                break
    fs_used = 0
    if globals_.current_project:
        # data_svelte всегда лежит в корне проекта
        data_dir = os.path.join(_project_dir(globals_.current_project), "data_svelte")
        fs_used = _dir_size(data_dir)
    fs_pct = round(fs_used / fs_total * 100, 1) if fs_total > 0 else 0
    return fs_pct, fs_used, fs_total


def get_compat_map():
    if not globals_.current_config:
        return {}
    result = {}
    for section, mods in globals_.current_config.get("modules", {}).items():
        if not isinstance(mods, list):
            continue
        for m in mods:
            name = m.get("path", "").split("/")[-1]
            info = globals_.modinfo_cache.get(name, {})
            result[m.get("path", "")] = {
                "compatible": is_compatible(globals_.current_platform, info.get("usedLibs", {})),
                "size": get_module_flash(name, globals_.current_platform),
                "ram": get_module_ram(name, globals_.current_platform),
                # Статус размера: ok / error_platform / error_all / missing
                "sizeState": _module_size_state(info.get("usedFLASH", {}), globals_.current_platform),
            }
    return result
