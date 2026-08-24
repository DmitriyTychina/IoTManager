#!/usr/bin/env python3
"""
Измерение размера Flash / RAM для каждого модуля проекта IoTManager.

===============================================================================
ОБЩАЯ ЛОГИКА РАБОТЫ:
===============================================================================

1. СБОР МОДУЛЕЙ:
   Рекурсивно обходится папка src/modules/, находятся все modinfo.json,
   собираются сведения о каждом модуле (путь, имя, поддерживаемые платформы).

2. МЕНЮ ВЫБОРА РЕЖИМА:
   После запуска скрипт показывает меню:
     1 — обработка ВСЕХ модулей
     2 — обработка только модулей из myProfile.json
     3 — обработка только модулей без информации о размере

3. БАЗОВАЯ СБОРКА (baseline — без модулей):
   Для каждой целевой платформы собирается прошивка БЕЗ КАКИХ-ЛИБО модулей.
   Парсится из вывода PlatformIO:
     baseline_flash  — размер занятой Flash без модулей
     baseline_ram    — размер занятой RAM без модулей
     total_flash     — общий Flash платформы (характеристика платформы)
     total_ram       — общая RAM платформы (характеристика платформы)
   Результаты точечно записываются в src/modules/platforms.json.

4. ИЗМЕРЕНИЕ МОДУЛЕЙ:
   Для каждого модуля и каждой поддерживаемой платформы:
   - Собирается прошивка с базовым набором модулей + текущий модуль.
   - Парсится flash_used и ram_used из вывода pio.
   - Вычисляется дельта: flash_used - baseline_flash, ram_used - baseline_ram.
   - Дельта записывается в about.usedFLASH и about.usedRAM модуля в modinfo.json.
   - При ошибке компиляции ставится "-" и модуль добавляется в failed_modules.

5. ЛОГИРОВАНИЕ:
   Весь вывод скрипта сохраняется в measure_size/logs/[дата_время]/log.txt.

===============================================================================
АРХИТЕКТУРА:
===============================================================================

Профиль (myProfile.json / compilerProfile.json) содержит конфигурацию сборки,
включая список активных модулей для каждого раздела. Скрипт:
  1. Копирует профиль во временный файл.
  2. Меняет в нём список активных модулей.
  3. Запускает PrepareProject.py — генерирует временную конфигурацию проекта.
  4. Запускает PlatformIO для сборки и получения размеров.
  5. Записывает результаты в modinfo.json модулей и platforms.json платформ.

platformio.ini также временно сохраняется и восстанавливается.

===============================================================================
ИСПОЛЬЗОВАНИЕ:
===============================================================================

  # Из корня IoTManager:
  python measure_size/measure.py [--env esp32c6_4mb] [--dry-run]

  # Из папки measure_size:
  python measure.py [--env esp32c6_4mb] [--dry-run]

  # dry-run     — показать список модулей без сборки
  # --env       — указать платформу (можно повторять)
  # --no-color  — отключить цветовые коды ANSI
  # --limit N   — измерить только первые N модулей на платформу
  # --profile   — указать профиль (по умолчанию myProfile.json)
"""

import argparse
import fnmatch
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path

# IoTManager project root (parent of this script's folder)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
os.chdir(PROJECT_ROOT)

# Путь к platforms.json - tools\measure_size
PLATFORMS_JSON = PROJECT_ROOT / "tools" / "measure_size" / "platforms.json"

# Log styling (ANSI; disabled if not TTY or --no-color)
USE_COLOR = sys.stdout.isatty()

# ----------------------------------------------------------------------------
# ФУНКЦИИ ФОРМАТИРОВАНИЯ ВЫВОДА (ЛОГИРОВАНИЕ)
# ----------------------------------------------------------------------------
# Эти функции добавляют ANSI-коды цвета к строкам для удобного чтения в
# терминале. Если вывод перенаправлен в файл или используется --no-color,
# цвета отключаются.
# ----------------------------------------------------------------------------


def style(s, color=None, bold=False):
    if not USE_COLOR or not color:
        return s
    codes = []
    if bold:
        codes.append("1")
        # ANSI-код: 1 = полужирный
    if color == "green":
        codes.append("32")
        # ANSI-код: 32 = зелёный (успех)
    elif color == "red":
        codes.append("31")
        # ANSI-код: 31 = красный (ошибка)
    elif color == "yellow":
        codes.append("33")
        # ANSI-код: 33 = жёлтый (предупреждение / шаг)
    elif color == "cyan":
        codes.append("36")
        # ANSI-код: 36 = голубой (заголовок секции)
    elif color == "dim":
        codes.append("2")
        # ANSI-код: 2 = тусклый (дополнительная информация)
    return f"\033[{';'.join(codes)}m{s}\033[0m" if codes else s
    # Формируем ANSI-последовательность: \033[код1;код2...m текст \033[0m
    # Код 0 сбрасывает все стили.


def log_section(title):
    """
    Выводит заголовок секции с декоративной линией.
    Используется для визуального разделения этапов работы скрипта.
    """
    width = 60
    line = "─" * width
    print()
    print(style(f"  {title}", "cyan", bold=True))
    print(style(line, "dim"))


def log_ok(msg):
    """Вывод успешной операции (зелёная галочка)."""
    print(style("  ✓ ", "green") + msg)


def log_fail(msg):
    """Вывод ошибки или неудачи (красный крестик)."""
    print(style("  ✗ ", "red") + msg)


def log_step(msg):
    """Вывод текущего шага работы (жёлтая точка)."""
    print(style("  ● ", "yellow") + msg)


def log_info(msg):
    """Вывод дополнительной информации (серый / тусклый текст)."""
    print(style("    ", "dim") + msg)


# ----------------------------------------------------------------------------
# ЛОГИРОВАНИЕ В ФАЙЛ
# ----------------------------------------------------------------------------
# Класс TeeWriter дублирует весь вывод stdout в файл лога.
# Лог сохраняется в measure_size/logs/[дата_время]/log.txt
# ----------------------------------------------------------------------------

LOGS_DIR = Path(__file__).resolve().parent / "logs"
_log_file = None


class TeeWriter:
    """Дублирует вывод stdout в файл лога (эффект 'tee').
    ANSI-коды цветов вырезаются при записи в файл для читаемости."""

    # Регулярное выражение для удаления ANSI-кодов
    _ANSI_RE = re.compile(r"\033\[[0-9;]*m")

    def __init__(self, stream, log_file):
        self._stream = stream
        self._log_file = log_file

    def write(self, data):
        self._stream.write(data)
        if self._log_file:
            # Вырезаем ANSI-коды для читаемого лог-файла
            clean = self._ANSI_RE.sub("", data)
            self._log_file.write(clean)

    def flush(self):
        self._stream.flush()
        if self._log_file:
            self._log_file.flush()

    def isatty(self):
        return self._stream.isatty()

    def __getattr__(self, name):
        return getattr(self._stream, name)


def start_logging():
    """
    Создаёт папку logs/[дата_время] и начинает запись лога в log.txt.
    Перенаправляет stdout через TeeWriter для дублирования вывода.
    Возвращает путь к папке лога.
    """
    global _log_file

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_dir = LOGS_DIR / timestamp
    log_dir.mkdir(parents=True, exist_ok=True)

    _log_file = open(log_dir / "log.txt", "w", encoding="utf-8")
    sys.stdout = TeeWriter(sys.stdout, _log_file)

    return log_dir


def stop_logging():
    """Закрывает файл лога и восстанавливает stdout."""
    global _log_file
    if _log_file:
        _log_file.close()
        _log_file = None
    # Восстанавливаем оригинальный stdout
    if isinstance(sys.stdout, TeeWriter):
        sys.stdout = sys.stdout._stream


# ----------------------------------------------------------------------------
# БАЗОВЫЙ НАБОР МОДУЛЕЙ
# ----------------------------------------------------------------------------
# Базовая сборка теперь выполняется БЕЗ КАКИХ-ЛИБО модулей.
# Это даёт чистый размер ядра системы без вклада модулей.
# ----------------------------------------------------------------------------
BASELINE_MODULE_PATHS = []


# ----------------------------------------------------------------------------
# ПОДДЕРЖИВАЕМЫЕ ПЛАТФОРМЫ
# ----------------------------------------------------------------------------
# Список платформ (env) для измерения.
# По умолчанию используется esp32c6_4mb. Можно переопределить через --env.
# ----------------------------------------------------------------------------
# DEFAULT_ENVS = ["esp8266_4mb", "esp32_4mb", "esp32_4mb3f", "esp8266_16mb", "esp32cam_4mb", "esp32s2_4mb", "esp32s3_16mb", "esp32c3m_4mb", "esp8266_1mb", "esp8266_1mb_ota", "esp8266_2mb", "esp8266_2mb_ota", "esp8285_1mb", "esp8285_1mb_ota", "esp32c6_4mb", "esp32c6_8mb", "bk7231n"]
# DEFAULT_ENVS = ["esp32s3_16mb", "esp32c3m_4mb", "esp32c6_4mb", "esp32_wifirep"]
DEFAULT_ENVS = []

# ----------------------------------------------------------------------------
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ РАБОТЫ С JSON
# ----------------------------------------------------------------------------

def load_json(path):
    """
    Загружает и парсит JSON-файл.
    Возвращает десериализованный объект (dict, list и т.д.).
    """
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    """
    Сохраняет объект в JSON-файл.
    Форматирование: 4 пробела, сортировка ключей, поддержка Unicode.
    """
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4, sort_keys=False)


# ----------------------------------------------------------------------------
# СБОР МОДУЛЕЙ
# ----------------------------------------------------------------------------

def collect_modules():
    """
    Рекурсивно обходит папку src/modules/ и собирает информацию
    о каждом модуле, содержащем modinfo.json.

    Возвращает список словарей, каждый из которых содержит:
      - path:        относительный путь модуля
      - moduleName:  имя модуля из modinfo.json
      - usedLibs:    список поддерживаемых платформ
      - modinfo_path: абсолютный путь к modinfo.json
      - modinfo:     полный словарь modinfo.json (для записи изменений)
    """
    modules = []
    for root, _, names in os.walk(PROJECT_ROOT / "src" / "modules"):
        if "modinfo.json" not in names:
            continue
        path = Path(root).relative_to(PROJECT_ROOT)
        mod_path = path.as_posix()
        info_path = PROJECT_ROOT / path / "modinfo.json"
        info = load_json(info_path)
        about = info.get("about", {})
        modules.append({
            "path": mod_path,
            "moduleName": about.get("moduleName", path.name),
            "usedLibs": about.get("usedLibs", info.get("usedLibs", {})),
            "modinfo_path": info_path,
            "modinfo": info,
        })
    return modules


def filter_modules_by_profile(modules, prof_template):
    """
    Оставляет только те модули, которые АКТИВНЫ в профиле сборки (myProfile.json),
    т.е. у которых "active": true.

    Профиль содержит структуру:
      "modules": {
        "virtual_elments": [ {"path": "src/modules/virtual/Benchmark", "active": true}, ... ],
        ...
      }

    Возвращает новый список модулей, которые помечены active=true в профиле.
    """
    # Собираем множество путей АКТИВНЫХ модулей из всех секций профиля
    profile_paths = set()
    for section, mods in prof_template.get("modules", {}).items():
        for m in mods:
            # Учитываем только модули с "active": true
            if m.get("active"):
                path = m.get("path")
                if path:
                    profile_paths.add(path)

    # Оставляем только активные модули из профиля
    return [m for m in modules if m["path"] in profile_paths]


def filter_modules_without_size(modules, envs):
    """
    Оставляет только те модули, у которых НЕТ информации о размере
    (usedFLASH / usedRAM) для текущей версии модуля.

    Чтение происходит из массива sizeInfo:
      - Берётся moduleVersion из about.
      - Ищется запись в sizeInfo с matching moduleVersion.
      - Если запись найдена, проверяются usedFLASH / usedRAM для платформ.

    Модуль считается "без размера", если для всех env:
      - нет записи sizeInfo для текущей версии, ИЛИ
      - в usedFLASH/usedRAM нет ключа платформы, ИЛИ
      - значение равно "-" (не удалось скомпилировать ранее)

    Возвращает новый список модулей без информации о размере.
    """
    def has_size(mod):
        """True, если у модуля есть размер хотя бы для одной из платформ."""
        modinfo = mod.get("modinfo", {})
        about = modinfo.get("about", {})
        module_version = about.get("moduleVersion")
        size_info = modinfo.get("sizeInfo", [])

        # Ищем запись для текущей версии модуля
        entry = None
        for e in size_info:
            if isinstance(e, dict) and e.get("moduleVersion") == module_version:
                entry = e
                break

        if entry is None:
            return False

        used_flash = entry.get("usedFLASH", {})
        used_ram = entry.get("usedRAM", {})

        for env in envs:
            # Если в usedFLASH есть числовое значение для платформы — размер есть
            if env in used_flash:
                val = used_flash[env]
                if isinstance(val, (int, float)) or (isinstance(val, str) and val != "-"):
                    return True
            # Если в usedRAM есть числовое значение для платформы — размер есть
            if env in used_ram:
                val = used_ram[env]
                if isinstance(val, (int, float)) or (isinstance(val, str) and val != "-"):
                    return True

        return False

    # Оставляем только модули без размера
    return [m for m in modules if not has_size(m)]


def count_modules_for_envs(modules, envs):
    """
    Считает количество модулей, которые будут измеряться для указанных платформ.

    Модуль считается измеряемым, если он поддерживает ХОТЯ БЫ ОДНУ из платформ
    (module_supports_env). Такой модуль попадёт в модульную сборку.
    Модули, не поддерживающие ни одну платформу, в сборки не попадут.

    Возвращает количество модулей, участвующих в измерении.
    """
    count = 0
    for m in modules:
        for env in envs:
            if module_supports_env(m["usedLibs"], env):
                count += 1
                break  # модуль уже учтён для хотя бы одной платформы
    return count


def show_menu(total_modules, profile_modules_count, modules_without_size_count):
    """
    Показывает меню выбора режима обработки и ждёт ввода пользователя.

    Возвращает:
      1 — обработать все модули
      2 — только модули из myProfile.json
      3 — только модули без информации о размере
    """
    log_section("Выбор режима обработки")
    print()
    print(style("  Выберите режим обработки модулей:", "cyan", bold=True))
    print(style("    1", "green", bold=True) + f" — обработка ВСЕХ модулей ({total_modules})")
    print(style("    2", "green", bold=True) + f" — обработка только модулей из myProfile.json ({profile_modules_count})")
    print(style("    3", "green", bold=True) + f" — обработка только модулей без информации о размере ({modules_without_size_count})")
    print()

    while True:
        try:
            choice = input(style("  Ваш выбор (1/2/3): ", "yellow")).strip()
            if choice in ("1", "2", "3"):
                return int(choice)
            log_fail("Некорректный ввод. Введите 1, 2 или 3.")
        except (EOFError, KeyboardInterrupt):
            print()
            log_fail("Ввод прерван. Выход.")
            sys.exit(1)


# ----------------------------------------------------------------------------
# МЕНЮ ВЫБОРА ПЛАТФОРМЫ
# ----------------------------------------------------------------------------

def get_envs_from_platformio_ini():
    """
    Извлекает список платформ (env) из platformio.ini.

    Платформы задаются секциями вида "[env:имя]" (например, "[env:esp32_4mb]").
    Секции-шаблоны с суффиксом "_fromitems" (например, "[env:esp32_4mb_fromitems]")
    пропускаются — они содержат только расширения настроек для модулей
    и платформами не являются.

    Возвращает список имён платформ (list[str]) в порядке их появления в файле.
    """
    ini_path = PROJECT_ROOT / "platformio.ini"
    if not ini_path.is_file():
        log_fail(f"Не найден файл platformio.ini: {ini_path}")
        sys.exit(1)

    envs = []
    with open(ini_path, "r", encoding="utf-8") as f:
        for line in f:
            m = re.match(r"^\s*\[env:([^\]]+)\]\s*$", line)
            if m:
                name = m.group(1).strip()
                if not name.endswith("_fromitems"):
                    envs.append(name)
    return envs


def show_platform_menu(modules):
    """
    Показывает список платформ из platformio.ini
    и ждёт выбора пользователя по номеру.

    Для каждой платформы выводится:
      номер - имя_платформы обработано X из Y
    где X — количество модулей, поддерживающих эту платформу,
        Y — общее количество модулей.

    Параметры:
      modules: список всех модулей (от collect_modules)

    Возвращает: кортеж (envs, single_module_mode):
      envs — список выбранных платформ (list[str]);
      single_module_mode — True, если выбрана опция 0 (1 модуль для всех платформ).
    """
    # Извлекаем список платформ из platformio.ini
    platform_names = get_envs_from_platformio_ini()

    if not platform_names:
        log_fail("В platformio.ini не найдено ни одной платформы (секций [env:...])")
        sys.exit(1)

    total_modules = len(modules)

    # Загружаем platforms.json для получения failed_modules по платформам
    platforms_data = load_platforms_data()

    log_section("Выбор платформы")
    print()
    print(style("  Выберите платформу:", "cyan", bold=True))
    print()

    # Пункт 0 — измерение одного модуля на всех платформах
    print(
        style("    0", "green", bold=True) +
        " — " +
        style("1 модуль для всех платформ", "cyan")
    )
    print()

    for i, name in enumerate(platform_names):
        supported = count_modules_for_envs(modules, [name])
        # Количество модулей в ошибке (failed_modules) для данной платформы
        failed = len(platforms_data.get(name, {}).get("failed_modules", []))
        # Цвет имени платформы:
        #   red — платформа отсутствует в platforms.json или одно из значений
        #         (baseline_flash / baseline_ram / total_flash / total_ram) равно 0.
        name_color = "cyan"
        pdata = platforms_data.get(name)
        if pdata is None:
            name_color = "red"
        else:
            values = [
                pdata.get("baseline_flash"),
                pdata.get("baseline_ram"),
                pdata.get("total_flash"),
                pdata.get("total_ram"),
            ]
            # Значение 0 или отсутствующее (None) считается «не измеренным»
            if any(v is None or v == 0 for v in values):
                name_color = "red"
        print(
            style(f"    {i + 1}", "green", bold=True) +
            " — " +
            style(f"{name}", name_color) +
            f" обработано {supported} из {total_modules}, " +
            style(f"в ошибке {failed}", "red")
        )

    print()

    while True:
        try:
            choice = input(style("  Ваш выбор: ", "yellow")).strip()
            if choice == "0":
                log_ok("Выбрано: 1 модуль для всех платформ")
                return (platform_names, True)
            idx = int(choice) - 1
            if 0 <= idx < len(platform_names):
                selected = platform_names[idx]
                log_ok(f"Выбрана платформа: {selected}")
                return ([selected], False)
            log_fail("Некорректный номер. Попробуйте снова.")
        except (EOFError, KeyboardInterrupt):
            print()
            log_fail("Ввод прерван. Выход.")
            sys.exit(1)
        except ValueError:
            log_fail("Введите номер платформы.")


def show_module_menu(modules, envs):
    """
    Показывает перечень всех модулей (независимо от платформы)
    и ждёт выбора пользователя по номеру.

    Используется при выборе опции 0 «1 модуль для всех платформ»:
    меню выбора режима обработки пропускается, а здесь пользователю
    предлагается выбрать ОДИН модуль для измерения на всех платформах.

    Для каждого модуля выводится:
      номер - имя_модуля (путь) — красным: количество платформ, где модуль в ошибке

    Параметры:
      modules: список всех модулей (от collect_modules)
      envs:    список платформ

    Возвращает: список из одного выбранного модуля (list[dict]).
    """
    platforms_data = load_platforms_data()

    log_section("Выбор модуля для измерения")
    print()
    print(style("  Выберите модуль:", "cyan", bold=True))
    print()

    for i, mod in enumerate(modules):
        # Считаем количество платформ, где этот модуль записан в failed_modules
        failed_count = 0
        for env in envs:
            failed = platforms_data.get(env, {}).get("failed_modules", [])
            if mod["moduleName"] in failed:
                failed_count += 1
        err_str = style(f"в ошибке {failed_count}", "red") if failed_count else ""
        print(
            style(f"    {i + 1}", "green", bold=True) +
            " — " +
            style(f"{mod['moduleName']}", "cyan") +
            f" ({mod['path']})" +
            (f" — {err_str}" if err_str else "")
        )

    print()

    while True:
        try:
            choice = input(style("  Ваш выбор: ", "yellow")).strip()
            idx = int(choice) - 1
            if 0 <= idx < len(modules):
                selected = modules[idx]
                log_ok(f"Выбран модуль: {selected['moduleName']}")
                return [selected]
            log_fail("Некорректный номер. Попробуйте снова.")
        except (EOFError, KeyboardInterrupt):
            print()
            log_fail("Ввод прерван. Выход.")
            sys.exit(1)
        except ValueError:
            log_fail("Введите номер модуля.")


# ----------------------------------------------------------------------------
# ПРОВЕРКА ПОДДЕРЖКИ ПЛАТФОРМЫ МОДУЛЕМ
# ----------------------------------------------------------------------------

def module_supports_env(used_libs, env):
    """
    Определяет, поддерживает ли модуль данную платформу (env).

    used_libs — список шаблонов (pattern), например ["esp32*", "esp8266_4mb"].
    Используется fnmatch для совпадения по шаблону (glob-стиль).

    Примеры:
      used_libs = ["esp32*"]
        module_supports_env(used_libs, "esp32_4mb")  → True
        module_supports_env(used_libs, "esp8266_4mb") → False

      used_libs = [] → всегда False
    """
    if not used_libs:
        return False
    for pattern in used_libs:
        if fnmatch.fnmatch(env, pattern):
            return True
    return False


def env_to_base_from_module(used_libs, env):
    """
    Возвращает ключ платформы для записи в sizeInfo.usedFLASH / sizeInfo.usedRAM.
    В текущей реализации просто возвращает env как есть.
    """
    return env


# ----------------------------------------------------------------------------
# ОБНОВЛЕНИЕ sizeInfo В modinfo.json
# ----------------------------------------------------------------------------

def update_size_info(info, module_version, base, used_flash, used_ram):
    """
    Обновляет массив sizeInfo в modinfo.json для указанной версии модуля.

    Структура sizeInfo:
      "sizeInfo": [
        {
          "moduleVersion": "1.0",
          "usedFLASH": { "esp8266_1mb": 12345, ... },
          "usedRAM":   { "esp8266_1mb": 6789, ... }
        },
        ...
      ]

    Алгоритм:
      1. Гарантируем существование массива sizeInfo.
      2. Ищем запись с moduleVersion == module_version.
      3. Если найдена — обновляем usedFLASH[base] и usedRAM[base].
      4. Если не найдена — добавляем новую запись.

    Параметры:
      info:           словарь modinfo.json (изменяется in-place)
      module_version: версия модуля из about.moduleVersion
      base:           ключ платформы (env)
      used_flash:     значение Flash (int или "-")
      used_ram:       значение RAM (int или "-")
    """
    # Гарантируем существование массива sizeInfo
    if "sizeInfo" not in info or not isinstance(info["sizeInfo"], list):
        info["sizeInfo"] = []

    # Ищем запись с matching moduleVersion
    entry = None
    for e in info["sizeInfo"]:
        if isinstance(e, dict) and e.get("moduleVersion") == module_version:
            entry = e
            break

    # Если не найдена — создаём новую
    if entry is None:
        entry = {
            "moduleVersion": module_version,
            "usedFLASH": {},
            "usedRAM": {},
        }
        info["sizeInfo"].append(entry)

    # Гарантируем существование словарей usedFLASH / usedRAM
    if "usedFLASH" not in entry or not isinstance(entry["usedFLASH"], dict):
        entry["usedFLASH"] = {}
    if "usedRAM" not in entry or not isinstance(entry["usedRAM"], dict):
        entry["usedRAM"] = {}

    # Записываем значения для платформы
    entry["usedFLASH"][base] = used_flash
    entry["usedRAM"][base] = used_ram


# ----------------------------------------------------------------------------
# СОЗДАНИЕ ПРОФИЛЯ СБОРКИ
# ----------------------------------------------------------------------------

def build_profile_with_modules(prof_template, active_paths, env):
    """
    На основе шаблона профиля создаёт новую конфигурацию,
    в которой активны только указанные модули.

    Параметры:
      prof_template:  исходный словарь профиля (myProfile.json)
      active_paths:   множество путей модулей, которые должны быть активны
      env:            целевая платформа

    Алгоритм:
      1. Глубоко копируем шаблон (чтобы не мутировать оригинал).
      2. Проходим по всем разделам модулей в профиле.
      3. Для каждого модуля устанавливаем active=True, если его путь в active_paths.
      4. Устанавливаем default_envs = env для платформы.
      5. Возвращаем новый словарь профиля.
    """
    prof = json.loads(json.dumps(prof_template))
    for section, mods in prof.get("modules", {}).items():
        for m in mods:
            m["active"] = m["path"] in active_paths
    prof["projectProp"]["platformio"]["default_envs"] = env
    return prof


# ----------------------------------------------------------------------------
# ЗАПУСК PrepareProject.py
# ----------------------------------------------------------------------------

def run_prepare_project(profile_path, env):
    """
    Запускает PrepareProject.py для генерации конфигурации проекта
    на основе профиля и платформы.

    Параметры:
      profile_path: путь к JSON-файлу профиля
      env:          целевая платформа

    Возвращает: True если подготовка прошла успешно, False иначе.
    """
    cmd = [sys.executable, "PrepareProject.py", "-p", str(profile_path), "-b", env]
    r = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, timeout=120)
    if r.returncode != 0:
        print(r.stderr or r.stdout, file=sys.stderr)
    return r.returncode == 0


# ----------------------------------------------------------------------------
# ИЗМЕРЕНИЕ РАЗМЕРА ПРОШИВКИ (Flash + RAM)
# ----------------------------------------------------------------------------

def get_size_from_output(env, timeout=1800):
    """
    Запускает `pio run -e ENV` (полная сборка) и парсит размеры из вывода PlatformIO.

    ВАЖНО: строки сводки памяти "RAM:" / "Flash:" появляются ТОЛЬКО при обычной
    сборке (`pio run`). При `pio run -t size` их НЕТ — там только таблица размеров
    объектных секций (raw_firmware.elf). Поэтому используется полная сборка.

    Параметры:
      env:    целевая платформа (например, "bk7231n")
      timeout: таймаут в секундах (по умолчанию 30 минут)

    Возвращает:
      dict с ключами:
        flash_used  — размер занятой Flash (байты), или None
        flash_total — общий размер Flash платформы (байты), или None
        ram_used    — размер занятой RAM (байты), или None
        ram_total   — общий размер RAM платформы (байты), или None
      или None при ошибке.

    Алгоритм парсинга:
      1. Запускаем `pio run -e ENV` (полная сборка).
      2. ОСНОВНОЙ СПОСОБ — строки сводки памяти:
           RAM:   [====      ]  36.8% (used 96364 bytes from 262144 bytes)
           Flash: [========  ]  75.9% (used 822088 bytes from 1083136 bytes)
         Из них берутся used (занято) и from (всего) для RAM и Flash.
      3. РЕЗЕРВНЫЙ СПОСОБ — строка таблицы размеров .elf:
           Формат: "  text   data    bss    dec   hex  filename"
           Пример: " 823888	   2632	 107140	 933660	  e3f1c	...raw_firmware.elf"
         Flash = text + data, RAM = bss. Этот способ используется,
         если сводка RAM:/Flash: не найдена (другие платформы).
      4. ПОСЛЕДНИЙ РЕЗЕРВ — строка "used XXXXX bytes".
      5. Возвращаем словарь {flash_used, flash_total, ram_used, ram_total}.
    """
    cmd = ["pio", "run", "-e", env]
    r = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, timeout=timeout)
    out = (r.stdout or "") + (r.stderr or "")
    if r.returncode != 0:
        return None

    result = {"flash_used": None, "flash_total": None, "ram_used": None, "ram_total": None}

    # =========================================================================
    # ОСНОВНОЙ СПОСОБ: строки сводки памяти RAM: / Flash:
    # "Flash: [========  ]  75.9% (used 822088 bytes from 1083136 bytes)"
    # "RAM:   [====      ]  36.8% (used 96364 bytes from 262144 bytes)"
    # =========================================================================
    flash_match = re.search(r"Flash:.*used\s+(\d+)\s+bytes\s+from\s+(\d+)\s+bytes", out)
    if flash_match:
        result["flash_used"] = int(flash_match.group(1))
        result["flash_total"] = int(flash_match.group(2))

    ram_match = re.search(r"RAM:.*used\s+(\d+)\s+bytes\s+from\s+(\d+)\s+bytes", out)
    if ram_match:
        result["ram_used"] = int(ram_match.group(1))
        result["ram_total"] = int(ram_match.group(2))

    # =========================================================================
    # РЕЗЕРВНЫЙ СПОСОБ: таблица размеров .elf
    # "  text   data    bss    dec   hex  filename"
    # " 823888	   2632	 107140	 933660	  e3f1c	.pio\build\bk7231n\raw_firmware.elf"
    # =========================================================================
    if result["flash_used"] is None and result["ram_used"] is None:
        for line in out.split("\n"):
            if ".elf" not in line:
                continue
            parts = line.split()
            # Первый токен должен быть числом (text), отсекаем "Calculating size ..."
            if len(parts) >= 4:
                try:
                    text = int(parts[0])
                    data = int(parts[1])
                    bss = int(parts[2])
                except (ValueError, IndexError):
                    continue
                result["flash_used"] = text + data  # program (flash) size
                result["ram_used"] = bss
                break

    # =========================================================================
    # ПОСЛЕДНИЙ РЕЗЕРВ: строка "used XXXXX bytes"
    # =========================================================================
    if result["flash_used"] is None:
        match = re.search(r"used\s+(\d+)\s+bytes", out)
        if match:
            result["flash_used"] = int(match.group(1))

    # Если хотя бы одно значение не определено — заменяем на 0
    for key in result:
        if result[key] is None:
            result[key] = 0

    return result


# ----------------------------------------------------------------------------
# ЗАГРУЗКА / СОХРАНЕНИЕ platforms.json
# ----------------------------------------------------------------------------

def load_platforms_data():
    """
    Загружает данные о платформах из src/modules/platforms.json.
    Если файл не существует — возвращает пустой словарь.

    Структура:
      {
        "esp8266_1mb": {
          "baseline_flash": 448579,
          "baseline_ram": 37228,
          "total_flash": 761840,
          "total_ram": 81920,
          "failed_modules": [
            "GyverLAMP",
            ...
          ]
        },
        "bk7231n": { ... }
      }
    """
    if PLATFORMS_JSON.is_file():
        return load_json(PLATFORMS_JSON)
    return {}


def save_platforms_data(data):
    """
    Сохраняет данные о платформах в src/modules/platforms.json.
    Перезаписывает весь файл (для инициализации).
    """
    save_json(PLATFORMS_JSON, data)


def update_platforms_data(env, sizes):
    """
    Точечно обновляет данные платформы в src/modules/platforms.json.
    Не перезаписывает весь файл, а только обновляет нужные поля.
    Если файл не существует — создаёт его.

    Параметры:
      env:   ключ платформы (например, "bk7231n")
      sizes: словарь с полями {baseline_flash, baseline_ram, total_flash, total_ram}
    """
    platforms = load_platforms_data()

    # Если файл не существовал — создаём пустую структуру
    if not platforms:
        platforms = {}

    # Обновляем поля для данной платформы
    if env not in platforms:
        platforms[env] = {}

    platforms[env]["baseline_flash"] = sizes["baseline_flash"]
    platforms[env]["baseline_ram"] = sizes["baseline_ram"]
    platforms[env]["total_flash"] = sizes["total_flash"]
    platforms[env]["total_ram"] = sizes["total_ram"]

    # Гарантируем существование массива failed_modules (если его ещё нет)
    if "failed_modules" not in platforms[env] or not isinstance(platforms[env]["failed_modules"], list):
        platforms[env]["failed_modules"] = []

    save_json(PLATFORMS_JSON, platforms)


def record_failed_module(module_name, env):
    """
    Записывает имя модуля, который не удалось собрать/распарсить,
    в массив failed_modules платформы в platforms.json.

    Записи добавляются внутрь объекта платформы:
      "esp8266_1mb": {
        "baseline_flash": 448579,
        ...
        "failed_modules": [
          "GyverLAMP",
          ...
        ]
      }

    Параметры:
      module_name: имя модуля (moduleName)
      env:         платформа, на которой произошла ошибка
    """
    platforms = load_platforms_data()

    if not platforms:
        platforms = {}

    # Гарантируем существование записи платформы
    if env not in platforms or not isinstance(platforms[env], dict):
        platforms[env] = {}

    # Гарантируем существование массива failed_modules
    if "failed_modules" not in platforms[env] or not isinstance(platforms[env]["failed_modules"], list):
        platforms[env]["failed_modules"] = []

    # Добавляем имя модуля в массив (без дубликатов)
    failed = platforms[env]["failed_modules"]
    if module_name not in failed:
        failed.append(module_name)

    save_json(PLATFORMS_JSON, platforms)


def remove_failed_module(module_name, env):
    """
    Удаляет имя модуля из массива failed_modules платформы в platforms.json.
    Вызывается, когда модуль успешно скомпилировался/распарсился.

    Параметры:
      module_name: имя модуля (moduleName)
      env:         платформа, на которой модуль успешно собрался
    """
    platforms = load_platforms_data()

    if not platforms:
        return

    # Если платформы нет в файле — нечего удалять
    if env not in platforms or not isinstance(platforms[env], dict):
        return

    failed = platforms[env].get("failed_modules")
    if not isinstance(failed, list) or module_name not in failed:
        return

    # Удаляем имя модуля из массива
    failed.remove(module_name)

    # Если массив стал пустым — удаляем его (чтобы не хранить пустой список)
    if not failed:
        del platforms[env]["failed_modules"]

    save_json(PLATFORMS_JSON, platforms)


# ----------------------------------------------------------------------------
# ОСНОВНАЯ ФУНКЦИЯ
# ----------------------------------------------------------------------------

def main():
    global USE_COLOR
    ap = argparse.ArgumentParser(
        description="Измерение размера Flash/RAM модулей и запись в modinfo.json + platforms.json"
    )
    ap.add_argument("--env", action="append", default=[],
                    help="Платформа (например, esp32_4mb). Можно повторять.")
    ap.add_argument("--profile", default="myProfile.json",
                    help="Файл профиля сборки (по умолчанию myProfile.json)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Показать список модулей без сборки")
    ap.add_argument("--no-color", action="store_true",
                    help="Отключить цветной вывод")
    ap.add_argument("--limit", type=int, default=None, metavar="N",
                    help="Измерить только первые N модулей на платформу")
    args = ap.parse_args()

    if args.no_color:
        USE_COLOR = False

    # -------------------------------------------------------------------------
    # ОПРЕДЕЛЕНИЕ ПРОФИЛЯ: ищем профиль сборки в порядке приоритета:
    #   1. Файл, указанный через --profile (по умолчанию myProfile.json)
    #   2. compilerProfile.json (альтернативное имя)
    # -------------------------------------------------------------------------
    profile_path = PROJECT_ROOT / args.profile
    if not profile_path.is_file():
        profile_path = PROJECT_ROOT / "compilerProfile.json"
    if not profile_path.is_file():
        log_fail("Профиль не найден: myProfile.json или compilerProfile.json")
        sys.exit(1)

    prof_template = load_json(profile_path)
    modules = collect_modules()
    baseline_paths = set(BASELINE_MODULE_PATHS)  # пустое множество — без модулей

    # -------------------------------------------------------------------------
    # ОПРЕДЕЛЕНИЕ ПЛАТФОРМ:
    #   1. Если указан --env — используем его.
    #   2. Если DEFAULT_ENVS не пуст — используем его.
    #   3. Иначе — показываем меню выбора платформы из platformio.ini.
    # -------------------------------------------------------------------------
    single_module_mode = False
    if args.env:
        envs = args.env
    elif DEFAULT_ENVS:
        envs = DEFAULT_ENVS
    else:
        envs, single_module_mode = show_platform_menu(modules)

    # -------------------------------------------------------------------------
    # ЗАПУСК ЛОГИРОВАНИЯ В ФАЙЛ:
    #   Создаём папку measure_size/logs/[дата_время] и пишем туда весь вывод.
    # -------------------------------------------------------------------------
    log_dir = start_logging()
    print()
    log_ok(f"Лог запуска сохранён: {log_dir}")

    # -------------------------------------------------------------------------
    # МЕНЮ ВЫБОРА РЕЖИМА ОБРАБОТКИ:
    #   1 — обработка ВСЕХ модулей
    #   2 — обработка только модулей из myProfile.json (active=true)
    #   3 — обработка только модулей без информации о размере
    # -------------------------------------------------------------------------
    # Подсчёт с учётом поддержки платформы:
    #   Модуль учитывается, если он поддерживает хотя бы одну из платформ envs.
    profile_modules = filter_modules_by_profile(modules, prof_template)
    without_size = filter_modules_without_size(modules, envs)

    # -------------------------------------------------------------------------
    # МЕНЮ ВЫБОРА РЕЖИМА ОБРАБОТКИ:
    #   В режиме «1 модуль для всех платформ» (single_module_mode) меню пропускается —
    #   сразу показывается перечень всех модулей.
    # -------------------------------------------------------------------------
    if single_module_mode:
        log_step("Режим: 1 модуль для всех платформ")
    else:
        all_count = count_modules_for_envs(modules, envs)
        profile_count = count_modules_for_envs(profile_modules, envs)
        without_size_count = count_modules_for_envs(without_size, envs)

        choice = show_menu(all_count, profile_count, without_size_count)

        if choice == 1:
            # Все модули — ничего не фильтруем
            log_step("Режим 1: обработка ВСЕХ модулей")
        elif choice == 2:
            # Только модули из профиля
            modules = profile_modules
            log_step(f"Режим 2: обработка модулей из myProfile.json ({len(modules)})")
        elif choice == 3:
            # Только модули без размера
            modules = without_size
            log_step(f"Режим 3: обработка модулей без информации о размере ({len(modules)})")

    # -------------------------------------------------------------------------
    # Если выбрана опция 0 «1 модуль для всех платформ» —
    # показать перечень всех модулей и предложить выбрать один.
    # -------------------------------------------------------------------------
    if single_module_mode:
        modules = show_module_menu(modules, envs)
        log_step(f"Режим: 1 модуль ({modules[0]['moduleName']}) на всех платформах")

    # -------------------------------------------------------------------------
    # ГРУППИРОВКА МОДУЛЕЙ ПО ПЛАТФОРМАМ:
    #   Для каждой платформы определяем, какие модули её поддерживают.
    # -------------------------------------------------------------------------
    modules_by_env = {e: [m for m in modules if module_supports_env(m["usedLibs"], e)] for e in envs}

    # ОГРАНИЧЕНИЕ КОЛИЧЕСТВА МОДУЛЕЙ:
    #   Если указан --limit N, берём только первые N модулей на платформу.
    if args.limit is not None:
        modules_by_env = {e: mods[: args.limit] for e, mods in modules_by_env.items()}

    # -------------------------------------------------------------------------
    # DRY RUN — только показать информацию, не собирать
    # -------------------------------------------------------------------------
    if args.dry_run:
        log_section("Dry run — модули по платформам")
        for e in envs:
            log_ok(f"{e}: {len(modules_by_env[e])} модулей")
        log_info("Примеры модулей:")
        for m in modules[:5]:
            log_info(f"{m['path']} → {m['moduleName']}")
        print()
        stop_logging()
        return

    # -------------------------------------------------------------------------
    # НАЧАЛО ИЗМЕРЕНИЙ
    # -------------------------------------------------------------------------
    log_section("Измерение размера Flash/RAM модулей")
    log_step(f"Профиль: {profile_path.name}")
    log_step(f"Платформы: {', '.join(envs)}")
    total_modules = sum(len(modules_by_env[e]) for e in envs)
    limit_note = f" (первые {args.limit} на платформу)" if args.limit is not None else ""
    log_step(f"Всего сборок: baseline × {len(envs)} + {total_modules} модулей {limit_note}")

    # -------------------------------------------------------------------------
    # СОХРАНЕНИЕ platformio.ini — будет модифицироваться PrepareProject.py
    # -------------------------------------------------------------------------
    platformio_ini = PROJECT_ROOT / "platformio.ini"
    platformio_backup = PROJECT_ROOT / "platformio.ini.measure.bak"
    original_env = prof_template["projectProp"]["platformio"].get(
        "default_envs", envs[0] if envs else "esp32_4mb"
    )
    shutil.copy(platformio_ini, platformio_backup)

    try:
        # -------------------------------------------------------------------------
        # ЭТАП 1: БАЗОВЫЕ СБОРКИ (baseline — БЕЗ МОДУЛЕЙ)
        # -------------------------------------------------------------------------
        # Собираем прошивку БЕЗ КАКИХ-ЛИБО модулей для каждой платформы.
        # Парсим из вывода:
        #   baseline_flash = flash_used (занятая Flash без модулей)
        #   baseline_ram   = ram_used   (занятая RAM без модулей)
        #   total_flash    = flash_total (общий Flash платформы)
        #   total_ram      = ram_total   (общая RAM платформы)
        # -------------------------------------------------------------------------
        baseline_sizes = {}
        platforms_data = load_platforms_data()

        if single_module_mode:
            # -----------------------------------------------------------------
            # РЕЖИМ «1 МОДУЛЬ ДЛЯ ВСЕХ ПЛАТФОРМ»:
            #   Базовая сборка (без модулей) НЕ выполняется.
            #   Размеры базовых прошивок берутся напрямую из platforms.json.
            # -----------------------------------------------------------------
            log_section("Базовые размеры (из platforms.json)")
            for env in envs:
                pdata = platforms_data.get(env, {})
                baseline_sizes[env] = {
                    "baseline_flash": int(pdata.get("baseline_flash") or 0),
                    "baseline_ram": int(pdata.get("baseline_ram") or 0),
                    "total_flash": int(pdata.get("total_flash") or 0),
                    "total_ram": int(pdata.get("total_ram") or 0),
                }
                log_ok(
                    f"{env}: baseline взят из platforms.json "
                    f"(Flash={baseline_sizes[env]['baseline_flash']:,} B, "
                    f"RAM={baseline_sizes[env]['baseline_ram']:,} B)"
                )
        else:
            # -----------------------------------------------------------------
            # ОБЫЧНЫЙ РЕЖИМ: выполняется базовая сборка БЕЗ МОДУЛЕЙ.
            # -----------------------------------------------------------------
            log_section("Базовая сборка (без модулей)")
            for env in envs:
                prof = build_profile_with_modules(prof_template, baseline_paths, env)
                with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
                    save_json(f.name, prof)
                    ok = run_prepare_project(f.name, env)
                os.unlink(f.name)
                if not ok:
                    log_fail(f"PrepareProject не удался для baseline env={env}")
                    continue
                sizes = get_size_from_output(env)
                if sizes is None:
                    log_fail(f"Не удалось получить размер для baseline env={env}")
                    continue
                baseline_sizes[env] = {
                    "baseline_flash": sizes["flash_used"],
                    "baseline_ram": sizes["ram_used"],
                    "total_flash": sizes["flash_total"],
                    "total_ram": sizes["ram_total"],
                }
                log_ok(
                    f"{env}: baseline Flash={sizes['flash_used']:,} B, "
                    f"baseline RAM={sizes['ram_used']:,} B, "
                    f"total Flash={sizes['flash_total']:,} B, "
                    f"total RAM={sizes['ram_total']:,} B"
                )

        # -------------------------------------------------------------------------
        # СОХРАНЕНИЕ platforms.json сразу после базовой сборки
        # -------------------------------------------------------------------------
        # В режиме «1 модуль для всех платформ» обновление не имеет смысла:
        # размеры уже взяты из platforms.json, перезаписывать их не нужно.
        if not single_module_mode:
            for env in envs:
                if env in baseline_sizes:
                    update_platforms_data(env, baseline_sizes[env])
            log_ok(f"platforms.json обновлён: {PLATFORMS_JSON}")

        # -------------------------------------------------------------------------
        # ЭТАП 2: ИЗМЕРЕНИЕ МОДУЛЕЙ
        # -------------------------------------------------------------------------
        # Для каждого модуля и каждой платформы:
        #   1. Создаём профиль: базовые модули + текущий модуль.
        #   2. Строим прошивку, парсим flash_used и ram_used.
        #   3. Вычисляем дельту: (модуль) - baseline.
        #   4. Записываем about.usedFLASH и about.usedRAM в modinfo.json.
        # -------------------------------------------------------------------------
        updated = 0
        updated_paths = set()
        idx = 0

        for env in envs:
            log_section(f"Измерение модулей — {env}")
            mods = modules_by_env[env]
            for i, mod in enumerate(mods):
                idx += 1
                active_paths = baseline_paths | {mod["path"]}

                # Создаём профиль и запускаем подготовку
                prof = build_profile_with_modules(prof_template, active_paths, env)
                with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
                    save_json(f.name, prof)
                    ok = run_prepare_project(f.name, env)
                    tf = f.name

                if not ok:
                    log_fail(f"[{idx}/{total_modules}] {mod['moduleName']} — PrepareProject не удался")
                    record_failed_module(mod["moduleName"], env)
                    # Ставим прочерк в sizeInfo для данной платформы
                    base = env_to_base_from_module(mod["usedLibs"], env)
                    info = load_json(mod["modinfo_path"])
                    about = info.setdefault("about", {})
                    module_version = about.get("moduleVersion", "unknown")
                    update_size_info(info, module_version, base, "-", "-")
                    save_json(mod["modinfo_path"], info)
                    os.unlink(tf)
                    continue

                # Получаем размеры Flash и RAM
                sizes = get_size_from_output(env)
                os.unlink(tf)
                if sizes is None:
                    log_fail(f"[{idx}/{total_modules}] {mod['moduleName']} — не удалось распарсить размер")
                    record_failed_module(mod["moduleName"], env)
                    # Ставим прочерк в sizeInfo для данной платформы
                    base = env_to_base_from_module(mod["usedLibs"], env)
                    info = load_json(mod["modinfo_path"])
                    about = info.setdefault("about", {})
                    module_version = about.get("moduleVersion", "unknown")
                    update_size_info(info, module_version, base, "-", "-")
                    save_json(mod["modinfo_path"], info)
                    continue

                # Вычисляем дельту (вклад модуля)
                delta_flash = sizes["flash_used"] - baseline_sizes[env]["baseline_flash"]
                delta_ram = sizes["ram_used"] - baseline_sizes[env]["baseline_ram"]

                # Дельта не может быть отрицательной
                used_flash = max(0, round(delta_flash))
                used_ram = max(0, round(delta_ram))

                # Определяем ключ платформы
                base = env_to_base_from_module(mod["usedLibs"], env)

                # -------------------------------------------------------------------------
                # ОБНОВЛЕНИЕ modinfo.json
                # -------------------------------------------------------------------------
                # Записываем результаты в sizeInfo, привязанный к версии модуля:
                #   sizeInfo: [
                #     { "moduleVersion": "1.0",
                #       "usedFLASH": { "platform": bytes },
                #       "usedRAM":   { "platform": bytes } }
                #   ]
                # -------------------------------------------------------------------------
                info = load_json(mod["modinfo_path"])
                about = info.setdefault("about", {})
                module_version = about.get("moduleVersion", "unknown")

                update_size_info(info, module_version, base, used_flash, used_ram)

                save_json(mod["modinfo_path"], info)

                # Модуль успешно собрался — убираем его из failed_modules
                remove_failed_module(mod["moduleName"], env)

                if mod["modinfo_path"] not in updated_paths:
                    updated_paths.add(mod["modinfo_path"])
                    updated += 1

                log_ok(
                    f"[{idx}/{total_modules}] {mod['moduleName']} ({base}): "
                    f"+{delta_flash} B Flash, +{delta_ram} B RAM"
                )

        log_section("Итог")
        log_ok(f"Файлов modinfo.json обновлено: {updated}")
        log_ok("platformio.ini восстановлен.")

    # -------------------------------------------------------------------------
    # ВОССТАНОВЛЕНИЕ СОСТОЯНИЯ (finally)
    # -------------------------------------------------------------------------
    # Этот блок выполняется ВСЕГДА, даже при ошибке:
    #   1. Восстанавливаем platformio.ini из резервной копии.
    #   2. Удаляем резервную копию.
    #   3. Запускаем PrepareProject.py с оригинальным профилем,
    #      чтобы вернуть проект в исходное состояние.
    # -------------------------------------------------------------------------
    finally:
        shutil.copy(platformio_backup, platformio_ini)
        platformio_backup.unlink(missing_ok=True)

        log_section("Восстановление состояния проекта")
        if run_prepare_project(profile_path, original_env):
            log_ok(f"PrepareProject применён: {profile_path.name} (env={original_env})")
        else:
            log_fail(
                f"PrepareProject не удался — восстановите вручную: "
                f"python PrepareProject.py -p {profile_path.name} -b {original_env}"
            )

        # Завершаем логирование
        stop_logging()

    print()


if __name__ == "__main__":
    main()
