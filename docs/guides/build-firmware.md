# Руководство: сборка прошивки и запуск панели

> How-to документ. Справочник платформ — [reference/platforms.md](../reference/platforms.md), порты/протоколы — [architecture.md](../architecture.md).

## Требования

- **Прошивка**: PlatformIO (VSCode + расширение или CLI).
- **Панель magicIoTm**: Python (в корне — `.venv/`), зависимости из `tools/magicIoTm/requirements.txt` (`flask>=3.0`, `flask-cors>=4.0`).

## Сборка прошивки (PlatformIO)

Конфигурация окружений — в `platformio.ini` (`default_envs` — `esp32s2_4mb`).
Полный список: [reference/platforms.md](../reference/platforms.md).

```bash
# Установить зависимости
pio pkg install

# Сборка по умолчанию (esp32s2_4mb)
pio run

# Сборка конкретной платы
pio run -e esp8266_1mb_ota
pio run -e esp32_4mb
pio run -e esp32c3m_4mb
pio run -e bk7231n

# Загрузка на устройство
pio run -e esp32s2_4mb --target upload

# Мониторинг порта
pio device monitor
```

Ручные шаги для конкретного окружения (например, `esp32_4mb`):

1. Подготовить проект: `python PrepareProject.py -p myProfile.json`.
2. Собрать файловую систему: `pio run -t buildfs -e esp32_4mb`.
3. Собрать прошивку: `pio run -e esp32_4mb`.
4. Записать на устройство (по USB/сети).

## Запуск веб-панели magicIoTm

Из каталога `tools/magicIoTm/`:

```
run.bat        # запуск сервера (python app.py)
restart.bat    # перезапуск
stop.bat       # остановка
stop.ps1       # остановка (PowerShell)
```

Либо вручную:

```bat
cd tools\magicIoTm
pip install -r requirements.txt
python app.py
```

Сервер доступен: **http://127.0.0.1:5005**

## Обычный рабочий цикл в панели

1. Открыть проект (автоматически открывается последний открытый).
2. Подготовить проект к сборке — этап «Подготовка профиля (PrepareProject)».
3. **Сборка**: сначала «Сборка файловой системы (buildfs)», затем «Сборка прошивки (build)».
4. Подключиться к устройству (раздел «Устройства»).
5. Записать файловую систему (FS) и/или прошивку (кнопка «🚀 Upload»).

## Замер размеров прошивки

```bash
# из папки measure_size с venv:
python measure.py --dry-run

# или из корня репозитория:
measure_size/venv/Scripts/python measure_size/measure.py --env esp32_4mb
```

Скрипт замеряет прирост размера прошивки (flash) для каждого модуля и пишет
результат в `about.size` файла `modinfo.json` (КБ по окружениям).