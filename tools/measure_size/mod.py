#!/usr/bin/env python3
"""
===============================================================================
Скрипт для исправления структуры modinfo.json всех модулей проекта IoTManager.
===============================================================================

Выполняет несколько операций для каждого modinfo.json в src/modules/:

  1. УДАЛЕНИЕ поля "size":
     - Удаляет "size" с верхнего уровня модуля (если есть).
     - Удаляет "size" внутри блока "about" (если есть).
     - Поля "size" внутри configItem (например, размер экрана) НЕ затрагиваются.

  2. УДАЛЕНИЕ поля "usedRam" внутри блока "about" (если есть).

  3. ПЕРЕНОС полей "usedFLASH" и "usedRAM" в массив "sizeInfo":
     - Данные размеров (из "about" и/или с верхнего уровня) переносятся
       в массив "sizeInfo", привязанный к версии модуля:
         "sizeInfo": [
           { "moduleVersion": "1.0",
             "usedFLASH": { "esp8266_1mb": 12345 },
             "usedRAM":   { "esp8266_1mb": 6789 } }
         ]
     - "moduleVersion" берётся из "about.moduleVersion".
     - Старые поля usedFLASH/usedRAM удаляются из about и верхнего уровня.

Использование:
  Из корня IoTManager:  python measure_size/mod.py [--dry-run] [--no-color]
  Из папки measure_size: python mod.py [--dry-run] [--no-color]

  --dry-run    — показать, что было бы изменено, без записи в файлы.
  --no-color   — отключить цветной вывод.
"""

import argparse
import json
import os
import sys
from pathlib import Path

# IoTManager project root (parent of this script's folder)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
os.chdir(PROJECT_ROOT)

# Log styling (ANSI; disabled if not TTY or --no-color)
USE_COLOR = sys.stdout.isatty()


# ----------------------------------------------------------------------------
# ФУНКЦИИ ФОРМАТИРОВАНИЯ ВЫВОДА
# ----------------------------------------------------------------------------

def style(s, color=None, bold=False):
    if not USE_COLOR or not color:
        return s
    codes = []
    if bold:
        codes.append("1")
    if color == "green":
        codes.append("32")
    elif color == "red":
        codes.append("31")
    elif color == "yellow":
        codes.append("33")
    elif color == "cyan":
        codes.append("36")
    elif color == "dim":
        codes.append("2")
    return f"\033[{';'.join(codes)}m{s}\033[0m" if codes else s


def log_section(title):
    width = 60
    line = "─" * width
    print()
    print(style(f"  {title}", "cyan", bold=True))
    print(style(line, "dim"))


def log_ok(msg):
    print(style("  ✓ ", "green") + msg)


def log_fail(msg):
    print(style("  ✗ ", "red") + msg)


def log_step(msg):
    print(style("  ● ", "yellow") + msg)


def log_info(msg):
    print(style("    ", "dim") + msg)


# ----------------------------------------------------------------------------
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ РАБОТЫ С JSON
# ----------------------------------------------------------------------------

def load_json(path):
    """Загружает и парсит JSON-файл."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    """Сохраняет объект в JSON-файл (4 пробела, Unicode)."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4, sort_keys=False)


# ----------------------------------------------------------------------------
# СБОР МОДУЛЕЙ
# ----------------------------------------------------------------------------

def collect_modinfo_files():
    """
    Рекурсивно обходит папку src/modules/ и возвращает список
    путей к файлам modinfo.json.
    """
    files = []
    for root, _, names in os.walk(PROJECT_ROOT / "src" / "modules"):
        if "modinfo.json" not in names:
            continue
        files.append(Path(root) / "modinfo.json")
    return files


# ----------------------------------------------------------------------------
# ОБРАБОТКА ОДНОГО modinfo.json
# ----------------------------------------------------------------------------

def process_modinfo(info, dry_run=False):
    """
    Обрабатывает один словарь modinfo.json и возвращает:
      - изменённый словарь (с применёнными правками)
      - список строк с описанием изменений (для лога)

    Правила:
      1. Удаляет "size" с верхнего уровня (если есть).
      2. Удаляет "size" внутри "about" (если есть).
      3. Удаляет "usedRam" внутри "about" (если есть).
      4. Переносит "usedFLASH" / "usedRAM" (из "about" или с верхнего уровня)
         в массив "sizeInfo", привязанный к версии модуля (about.moduleVersion).
    """
    changes = []

    # -------------------------------------------------------------------------
    # 1. УДАЛЕНИЕ "size" с верхнего уровня
    # -------------------------------------------------------------------------
    if "size" in info:
        changes.append("удалено поле \"size\" с верхнего уровня")
        if not dry_run:
            del info["size"]

    # -------------------------------------------------------------------------
    # 2. РАБОТА С БЛОКОМ "about"
    # -------------------------------------------------------------------------
    # Гарантируем существование блока "about"
    if "about" not in info or not isinstance(info["about"], dict):
        info["about"] = {}

    about = info["about"]

    # 2a. Удаляем "size" внутри about
    if "size" in about:
        changes.append("удалено поле \"size\" внутри about")
        if not dry_run:
            del about["size"]

    # 2b. Удаляем "usedRam" внутри about
    if "usedRam" in about:
        changes.append("удалено поле \"usedRam\" внутри about")
        if not dry_run:
            del about["usedRam"]

    # -------------------------------------------------------------------------
    # 3. ПЕРЕНОС "usedFLASH" / "usedRAM" В sizeInfo
    # -------------------------------------------------------------------------
    # Собираем данные размеров из старого расположения:
    #   - внутри about (текущая структура)
    #   - с верхнего уровня (старая структура)
    old_flash = None
    old_ram = None

    # Из about
    if isinstance(about.get("usedFLASH"), dict):
        old_flash = about["usedFLASH"]
    if isinstance(about.get("usedRAM"), dict):
        old_ram = about["usedRAM"]

    # Из верхнего уровня (top-level) — приоритет выше
    if isinstance(info.get("usedFLASH"), dict):
        if old_flash is None:
            old_flash = {}
        old_flash.update(info["usedFLASH"])
    if isinstance(info.get("usedRAM"), dict):
        if old_ram is None:
            old_ram = {}
        old_ram.update(info["usedRAM"])

    if old_flash is not None or old_ram is not None:
        # Определяем версию модуля
        module_version = about.get("moduleVersion", "unknown")

        # Гарантируем существование массива sizeInfo
        if "sizeInfo" not in info or not isinstance(info["sizeInfo"], list):
            info["sizeInfo"] = []

        # Ищем запись для текущей версии
        entry = None
        for e in info["sizeInfo"]:
            if isinstance(e, dict) and e.get("moduleVersion") == module_version:
                entry = e
                break

        if entry is None:
            entry = {
                "moduleVersion": module_version,
                "usedFLASH": {},
                "usedRAM": {},
            }
            info["sizeInfo"].append(entry)

        # Переносим данные в sizeInfo
        if old_flash is not None:
            if not isinstance(entry.get("usedFLASH"), dict):
                entry["usedFLASH"] = {}
            entry["usedFLASH"].update(old_flash)
            changes.append(
                f"usedFLASH перенесён в sizeInfo (версия {module_version})"
            )
        if old_ram is not None:
            if not isinstance(entry.get("usedRAM"), dict):
                entry["usedRAM"] = {}
            entry["usedRAM"].update(old_ram)
            changes.append(
                f"usedRAM перенесён в sizeInfo (версия {module_version})"
            )

        # Удаляем старые поля
        if not dry_run:
            about.pop("usedFLASH", None)
            about.pop("usedRAM", None)
            info.pop("usedFLASH", None)
            info.pop("usedRAM", None)

    return info, changes


# ----------------------------------------------------------------------------
# ОСНОВНАЯ ФУНКЦИЯ
# ----------------------------------------------------------------------------

def main():
    global USE_COLOR
    ap = argparse.ArgumentParser(
        description="Миграция modinfo.json: size → sizeInfo с привязкой к версии модуля"
    )
    ap.add_argument("--dry-run", action="store_true",
                    help="Показать изменения без записи в файлы")
    ap.add_argument("--no-color", action="store_true",
                    help="Отключить цветной вывод")
    args = ap.parse_args()

    if args.no_color:
        USE_COLOR = False

    files = collect_modinfo_files()

    log_section("Исправление modinfo.json")
    log_step(f"Найдено файлов: {len(files)}")
    log_step(f"Режим: {'dry-run (без записи)' if args.dry_run else 'запись в файлы'}")

    changed_count = 0
    skipped_count = 0

    for modinfo_path in files:
        rel_path = modinfo_path.relative_to(PROJECT_ROOT)

        try:
            info = load_json(modinfo_path)
        except (json.JSONDecodeError, OSError) as e:
            log_fail(f"{rel_path} — ошибка чтения: {e}")
            skipped_count += 1
            continue

        # Обрабатываем и получаем список изменений
        info, changes = process_modinfo(info, dry_run=args.dry_run)

        if not changes:
            skipped_count += 1
            continue

        # Сохраняем файл (если не dry-run)
        if not args.dry_run:
            save_json(modinfo_path, info)

        changed_count += 1
        log_ok(f"{rel_path}")
        for ch in changes:
            log_info(ch)

    log_section("Итог")
    log_ok(f"Изменено: {changed_count}")
    log_ok(f"Без изменений: {skipped_count}")
    print()


if __name__ == "__main__":
    main()
