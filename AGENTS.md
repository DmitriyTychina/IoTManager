# AGENTS.md — Контракт репозитория IoTManager

> Правила для AI-ассистентов и разработчиков. Читается в начале каждой задачи.
> Заменяет старые `rules.md` и «Project Knowledge Base.md». Пользовательская документация — в `docs/`.
> `KODA.md` — указатель на этот файл.

## Коротко о проекте

Прошивка «умного дома» для **ESP8266 / ESP32 / BK7231N** (C++, PlatformIO)
и веб-конфигуратор прошивок **magicIoTm** (Python Flask).

- Устройство → Wi-Fi → MQTT-брокер. Управление: мобильное приложение (iOS/Android) и/или веб-браузер (все устройства на одной странице). Оба канала синхронизированы.
- Логика настраивается сценариями `scenario.txt` («событие → реакция»).
- magicIoTm: проекты, сборка через PlatformIO, замер размеров, прошивка USB/OTA, менеджер устройств (RAM/FS).

## Карта репозитория

| Путь | Назначение |
|---|---|
| `src/` | Прошивка: `src/*.cpp` (ядро), `src/classes/` (классы `IoT*`), `src/utils/`, `src/modules/<тип>/` (модули) |
| `include/` | Заголовки прошивки |
| `lib/` | Внешние библиотеки (не редактировать) |
| `data_svelte/` | Данные LittleFS: веб-интерфейс + JSON-конфиги устройства |
| `data_full/`, `data_lite/` | Альтернативные комплекты веб-данных |
| `iotm/` | Собранные прошивки (результат сборки) |
| `tools/magicIoTm/` | Веб-конфигуратор (Flask), SPA в `static/index.html` |
| `tools/measure_size/` | Замер размера прошивки по модулям |
| `docs/` | Пользовательская документация (Diátaxis) |
| `AGENTS.md` | Этот контракт |
| `KODA.md` | Указатель на контракт (читается инструментом KODA) |
| `CHANGELOG.md` | История изменений |
| `platformio.ini` | Окружения сборки PlatformIO (`[env:*]`) |
| `myProfile.json` | Эталонная конфигурация пользователя (шаблон проектов) |

## Основные команды

### Прошивка (PlatformIO)

```bash
pio pkg install            # установить зависимости
pio run                    # сборка по умолчанию (esp32s2_4mb)
pio run -e esp8266_1mb_ota # конкретная плата
pio run -e esp32_4mb --target upload
pio device monitor         # монитор порта
```

Список плат: `docs/reference/platforms.md`.

### Панель magicIoTm

```bash
cd tools/magicIoTm
run.bat            # Windows: запуск (python app.py)
restart.bat / stop.bat
# вручную: pip install -r requirements.txt && python app.py
```

Сервер: http://127.0.0.1:5005

### Замер размеров

```bash
measure_size/venv/Scripts/python measure_size/measure.py --dry-run
measure_size/venv/Scripts/python measure_size/measure.py --env esp32_4mb
```

## Правила работы (обязательные)

1. Думать (рассуждать) - на английском, а отвечать всегда на русском.
2. Структура ответа: **Вывод — Аргументы — Рекомендации**.
3. Приоритет языков кода: Python, C++, bash, PowerShell.
4. Если данных мало — явно указать, чего не хватает.
5. Перед изменением более 3 файлов — предложить план.
6. Код не удалять — помечать `[DEPRECATED]`.
7. После успешного шага спрашивать делать commit в git.
8. Спрашивать перед написанием тестов/проверочного кода.

## Конвенции кода

- **C++**: ядро `src/*.cpp` (~15 файлов), классы в `src/classes/`, утилиты в `src/utils/`, модули в `src/modules/<тип>/`. Комментарии на русском.
- **Python**: PEP8, комментарии на русском.
- **HTML/CSS**: CSS-переменные (`--panel`, `--accent`, `--danger`), минимальная структура.
- **Git**: `tools/magicIoTm/projects/`, `devices/`, `__pycache__/`, `*.log`, `.venv*/`, `.pio/`, `iotm/` — gitignored. Runtime-артефакты не коммитить.

## Модули прошивки

- Каталоги: `src/modules/exec` (исполнительные), `sensors`, `display`, `virtual`.
- Модуль = папка + `modinfo.json` (категория меню, конфигурируемый элемент, автор, версия, `usedLibs` по платформам, размеры flash/RAM по окружениям) + `.cpp`.
- Подключение — через `build_src_filter` в секциях `[env:*_fromitems]` `platformio.ini` (без правки ядра).
- Совместимость модуля с платформой — по `usedLibs` в `modinfo.json`.

## Важные механизмы (проверено кодом)

- **Обнаружение устройств**: multicast-UDP `239.255.255.255:4210`, пакет каждые 60 сек.
- **Статус устройства** — конечный автомат: 🟢 зелёный (подтверждение имени+id), ⚪ серый, 🟡 жёлтый (1–3 провала), 🔴 красный (>3). Пинг без подтверждения зелёного НЕ даёт. Детали: `docs/reference/device-status-fsm.md`.
- **Папка устройства**: `tools/magicIoTm/devices/<имя> <id>/` с `RAM/` и `FS/` (разделитель — пробел; легаси `_` продолжает работать).
- **Запись файлов на устройство**: только `config.json`, `scenario.txt`, `settings.json`, `layout.json`, `devlist.json` (обратные WS-команды `/gifnoc|`, `/oiranecs|`, `/sgnittes|`, `/tuoyal|`, `/tsil|`). Лимит 50 КБ на один WS-фрейм.
- **Конфигурация проекта**: `<проект>/myProfile.json` (`iotmSettings` + `modules`); каноническая `data_svelte/` — в корне проекта (ADR-0002).

## Известные проблемы и риски (аудит magicIoTm, авг 2026)

**Безопасность (высокий приоритет):** нет аутентификации на `/api/*`; CORS открыт; path traversal в путях категорий/проектов и `fetch_fs`; пароли (`mqttPass`, `webpass`) возвращаются в API-ответах; XSS во фронтенде (no-op `esc`); `debug=True` в проде; нет `MAX_CONTENT_LENGTH`/rate-limiting.

**Архитектура (средний):** гонки глобального состояния; рост `_devices`/`_fetch_progress` без TTL; нет таймаутов subprocess (build/measure); `PrepareProject` перезаписывает `items.json` и стирает комментарии `platformio.ini`; монолит `index.html` (2485 строк).

**Порядок исправлений:** высокий — санитизация путей, аутентификация+CORS, XSS, `debug=False`; средний — таймауты, атомарная запись, prune, rollback PrepareProject; низкий — рефакторинг `index.html`, ротация бэкапов.

## Документация

- `docs/README.md` — индекс и Roadmap; `docs/architecture.md` — архитектура; `docs/guides/` — инструкции; `docs/reference/` — справочники; `docs/decisions/` — ADR.
- Правило: меняя поведение/API — обновляйте соответствующие страницы `docs/` и `CHANGELOG.md`. Архитектурные решения фиксируйте как ADR в `docs/decisions/`.
- Старые «Project Knowledge Base.md» и «Technical Description…» удалены; ценное перенесено сюда и в `docs/`.