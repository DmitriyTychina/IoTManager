# Project Knowledge Base — magicIoTm

**Внутренняя база знаний ассистента о проекте magicIoTm (папка `tools/magicIoTm`)** · Обновлено: 2026-08-31 · Язык: русский

> Этот файл — рабочий конспект ассистента. Используется как основа для последующих задач по веб-инструменту magicIoTm. Дополняется по мере изучения кода. Пути внутри относительные к папке `tools/magicIoTm`.

---

# Проект: Веб-инструмент magicIoTm

## Назначение
Веб-инструмент (Flask) для прошивки IoT-устройств (ESP8266/ESP32) через PlatformIO:
управление проектами, сборка прошивок, замер размеров, обнаружение устройств по UDP multicast,
обмен файловыми системами с устройствами по WebSocket/HTTP.
Фронтенд — одностраничный `index.html`.

## Структура модулей
- `app.py` (~1727 строк) — монолит: Flask-маршруты + сетевой слой (multicast, ping, HTTP) + глобальное состояние + фоновые потоки/SSE. Запуск `debug=True` на порту 5005.
- `utils/projects.py` (~445) — управление категориями/проектами (create/delete/rename/copy/move), бэкапы `.backups`, валидация.
- `utils/build.py` (~441) — сборка прошивки через subprocess PlatformIO, чтение размеров из вывода `pio`.
- `utils/PrepareProject.py` (~405) — подготовка проекта: правка `platformio.ini`, генерация `API.cpp`, копирование `data_svelte`.
- `utils/measure_run.py` (~230) — запуск замера размеров через `measure.py`, потоковый прогресс, abort-файл.
- `utils/ws_client.py` (~365) — WS/HTTP клиент к устройствам: `fetch_fs` (скачивание ФС), `write_file`, `fetch_ram`.
- `index.html` (~2485 строк) — SPA-фронтенд (vanilla JS), редакторы config/scenario/settings, сборка/замер, работа с устройствами.

## Назначение ключевых констант/переменных (из app.py)
- `PORT=5005`, `DEVICES_TIMEOUT=90`, `HTTP_TIMEOUT=2.0`, `PING_CONCURRENCY=64`.
- `_lock` (threading) — защита глобального состояния.
- `_devices` (словарь устройств).
- `current_project` / `current_config` / `current_platform` — глобальное состояние.
- `_device_folders`, `_fetch_progress`.

## Известные проблемы и риски (по итогам аудита)

### 1. Безопасность
- Нет аутентификации на всех `/api/*` эндпоинтах; CORS открыт (`*`).
- Path traversal в именах категорий/проектов (`projects.py`) и в `fetch_fs` (`ws_client.py`) — произвольная запись/удаление файлов.
- Раскрытие паролей (`mqttPass`, `webpass` и др.) в API-ответах (`api_get_config`).
- Stored XSS во фронтенде: no-op `esc` в `highlightJson`/`highlightScenario`, `showModuleInfo` без экранирования.
- `debug=True` в проде; отсутствие `MAX_CONTENT_LENGTH`, rate-limiting.

### 2. Ошибки логики

### 3. Архитектура
- Гонки данных по глобальному состоянию при `threaded=True` (нет единой блокировки).
- Неограниченный рост `_devices` и `_fetch_progress` (нет TTL/prune).
- Нет таймаутов на `subprocess` в `build.py` и `measure_run.py` — зависший процесс блокирует повторный запуск.
- `PrepareProject` уничтожает комментарии `platformio.ini` (`configparser.write`) и перезаписывает пользовательские `items.json`.
- Монолит `app.py` — рекомендуется декомпозиция на модули `state/devices/network/metrics/catalog` и blueprints.

## Рекомендации по приоритету

### Высокий
- Санитизация путей (path traversal).
- Аутентификация + корректная настройка CORS.
- Исправление XSS (реальный `esc` во всех точках вывода).
- `debug=False` в проде, `MAX_CONTENT_LENGTH`, rate-limiting.

### Средний
- Таймауты на `subprocess`.
- Атомарная запись файлов (tmp + `os.replace`).
- Prune/TTL для словарей `_devices` и `_fetch_progress`.
- Rollback в `PrepareProject`.

### Низкий
- Рефакторинг `index.html` (делегирование событий, debounce подсветки).
- Вынос JS/CSP в отдельные ресурсы.
- Ротация бэкапов.

## Пользовательские правила работы
- Отвечать на русском, думать на английском.
- Лаконично, структурированно: **Вывод — Аргументы — Рекомендации**.
- Перед изменением более 3 файлов предлагать план.
- Не удалять код — помечать `[DEPRECATED]`.
- Приоритет языков: python, c++, bash, powershell.
- Предлагать commit в GIT после успешных шагов.
- Требовать подтверждение перед написанием кода для тестов/проверки.
- Заполнять «Project Knowledge Base.md» при изучении проекта и использовать её в следующих задачах.
- Поддерживать «Technical Description of the Project.md» (рус.) для пользователей.

---

## Журнал изменений
| Дата | Событие |
|------|---------|
| 2026-08-31 | Создание файла на основе полного аудита `tools/magicIoTm`. База знаний локализована в папке `tools/magicIoTm`. |
| 2026-08-31 | Исправлено: NameError ip→dev_ip; is_compatible — неперечисленные платформы теперь считаются несовместимыми; починен QUIET-break в fetch_ram. |