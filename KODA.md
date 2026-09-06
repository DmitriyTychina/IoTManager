# Контракт проекта IoTManager

## Назначение

Прошивка для IoT-устройств на базе ESP8266/ESP32/BK7231N и конфигуратор прошивок (MagicIoTm) — web-приложение на Python Flask для управления проектами и конфигурациями.

Устройство подключается к WiFi-роутеру, затем к MQTT-брокеру. Данные отображаются в мобильном приложении (iOS/Android). Также есть управление через веб-браузер — все устройства на одной странице. Оба метода (приложение и веб) работают одновременно и синхронизируются.

**Управление логикой** — через сценарии (скрипты), создаваемые пользователем. Любое действие может вызвать любую реакцию.

---

## Архитектура

### Прошивка (src/)

| Файл | Роль |
|------|------|
| `Main.cpp` | Точка входа, `setup()`/`loop()` |
| `Global.cpp` | Глобальные объекты: `WiFiClient`, `PubSubClient`, `AsyncWebServer`, `WebSocketsServer` |
| `AsyncWebServer.cpp` | Асинхронный веб-сервер (статика из `data_svelte`) |
| `StandWebServer.cpp` | Стандартный веб-сервер (fallback) |
| `WsServer.cpp` | WebSocket-сервер (управление устройствами в реальном времени) |
| `MqttClient.cpp` | MQTT-клиент (подключение к брокеру) |
| `DeviceList.cpp` | Список устройств, discovery (HomeAssistant, HomeKit) |
| `EspFileSystem.cpp` | LittleFS — чтение/запись файловой системы |
| `EventsAndOrders.cpp` | Обработка событий и команд |
| `PeriodicTasks.cpp` | Периодические задачи (обновление, NTP) |
| `NTP.cpp` | Синхронизация времени |
| `UpgradeFirm.cpp` | OTA-обновление прошивки |
| `Buffers.cpp` | Буферы данных |
| `DebugTrace.cpp` | Отладочная трассировка |

### Модули (src/modules/)

| Каталог | Назначение | Примеры |
|---------|-----------|---------|
| `sensors/` | Датчики | BME280, DHT11/22, DS18B20, AHTxx, PZEM-004T, UART, NTC, Impulse |
| `exec/` | Исполнительные | Кнопки, энкодеры, PWM, зуммер, мультитач, Telegram, термостат |
| `virtual/` | Виртуальные | Переменные, таймеры, Cron, логгеры, Math, погода OWM |
| `display/` | Дисплеи | — |
| `API.cpp` | API-модуль | — |

Модули подключаются динамически через `build_src_filter` в `platformio.ini`.

### Конфигуратор (tools/magicIoTm/)

Web-приложение Flask для управления проектами:

| Компонент | Описание |
|-----------|----------|
| `app.py` | Бэкенд: проекты, устройства, PlatformIO, модули |
| `index.html` | Фронтенд (SPA): дерево проектов, редактор, менеджер устройств |
| `utils/projects.py` | CRUD проектов, категории, резервное копирование |
| `utils/ws_client.py` | WebSocket-клиент для устройств (чтение/запись RAM) |

### Конфигурация проекта (data_svelte/)

| Файл | Назначение |
|------|-----------|
| `items.json` | Элементы интерфейса (датчики, кнопки, виджеты) |
| `config.json` | Конфигурация MQTT, WiFi, AP |
| `settings.json` | Системные настройки |
| `values.json` | Значения элементов |
| `layout.json` | Макет интерфейса |
| `ota.json` | Настройки OTA |
| `flashProfile.json` | Профиль flash-памяти |

---

## Сборка и запуск

### Прошивка (PlatformIO)

```bash
# Установить зависимости
pio pkg install

# Сборка (по умолчанию esp32s2_4mb)
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

**Поддерживаемые платы:**

| Плата | Платформа | Flash | Примечания |
|-------|-----------|-------|-----------|
| `esp8266_1mb_ota` | NodeMCU v2 | 1MB | OTA, esp8266 @4.0.1 |
| `esp8266_2mb` | D1 WROOM | 2MB | 2MB flash / 1MB FS |
| `esp8266_4mb` | NodeMCU v2 | 4MB | 4MB flash / 2MB FS |
| `esp8266_16mb` | NodeMCU v2 | 16MB | 16MB flash / 14MB FS |
| `esp8285_1mb` | ESP8285 | 1MB | Встроенная flash |
| `esp32_4mb` | ESP32 Dev | 4MB | Default, debug_tool=esp-prog |
| `esp32_4mb3f` | ESP32 Dev | 4MB | Кастомные партиции (3F) |
| `esp32cam_4mb` | ESP32-CAM | 4MB | PSRAM |
| `esp32s2_4mb` | LOLIN S2 Mini | 4MB | USB CDC |
| `esp32c3m_4mb` | LOLIN C3 Mini | 4MB | — |
| `esp32s3_16mb` | ESP32-S3 DevKit | 16MB | Кастомные партиции |
| `esp32_16mb` | ESP32 Dev | 16MB | Кастомные партиции |
| `esp32_wifirep` | ESP32 Dev | 4MB | Tasmota platform |
| `esp32c6_4mb` | ESP32-C6 DevKit | 4MB | Arduino ESP32 3.0.1 |
| `esp32c6_8mb` | ESP32-C6 DevKit | 8MB | Кастомные партиции |
| `bk7231n` | BK7231N QFN32 | — | LibreTiny |

### Конфигуратор (MagicIoTm)

```bash
cd tools/magicIoTm
python app.py
# или через bat-скрипты:
run.bat    # запуск
restart.bat # перезапуск
stop.bat    # остановка
```

Сервер: http://127.0.0.1:5005

**Зависимости:** `Flask`, `Flask-SSE`, `psutil`, `ArduinoJson` (6.18.0), `PubSubClient`

---

## Правила разработки

### Структура исходников

- `src/*.cpp` — основные компоненты (монолитная структура, ~15 файлов)
- `src/classes/*.cpp` — классы (IoTgpio, IoTItem, IoTDiscovery и др.)
- `src/utils/*.cpp` — утилиты
- `src/modules/*/*.cpp` — модули (датчики, исполнительные, виртуальные)
- `data_svelte/` — статические файлы фронтенда (JSON-конфигурации)

### Компиляция модулей

Модули подключаются через `build_src_filter` в `[env:*_fromitems]` секциях `platformio.ini`. Это позволяет включать/выключать модули без пересборки основной логики.

### Конфигурация проекта

Каждый проект в `tools/magicIoTm/projects/<категория>/<проект>/` содержит:
- `myProfile.json` — полная конфигурация (копия `data_svelte/*`)
- `data.json` — метаданные проекта
- `about.txt` — описание

### Управление устройствами

- Обнаружение через multicast-рассылку (UDP 239.255.255.255:4210)
- Папка устройства: `tools/magicIoTm/devices/<имя>_<id>/` с подпапками `RAM/` и `FS/`
- Статусы: 🟢 зелёный (подтверждён), 🟡 жёлтый (1–5 пропусков), 🔴 красный (>5 пропусков), ⚪ серый (не подтверждён)
- Фоновый пинг раз в 60 сек (первый через 10 сек после старта)
- Удаление устройства через API (`DELETE /api/device/<key>`)

### Код-стайл

- C++: классы в `src/classes/`, модули в `src/modules/`
- Python: PEP8, комментарии на русском
- HTML/CSS: CSS-переменные (`--panel`, `--accent`, `--danger`), минимальная структура

### Git

- `tools/magicIoTm/projects/` — gitignored (локальные проекты)
- `tools/magicIoTm/devices/` — gitignored (файлы устройств)
- `__pycache__/` — gitignored
- `magicIoTm.log` — gitignored

---

## Ключевые зависимости

| Компонент | Версия | Назначение |
|-----------|--------|-----------|
| `ArduinoJson` | 6.18.0 | Парсинг JSON |
| `PubSubClient` | — | MQTT |
| `ESPAsyncUDP` | — | Асинхронный UDP |
| `AsyncWebServer` | — | Асинхронный веб-сервер |
| `WebSocketsServer` | — | WebSocket-сервер |
| `LT_WebSockets` | — | Для BK7231N |

Для BK7231N используется кастомная ветка `libretiny` и `LT_WebSockets`.

---

## Связь с мобильным приложением

Прошивка отправляет данные через MQTT на брокер (встроенный или облачный, например wqtt.ru). Мобильное приложение (iOS/Android) подключается к тому же брокеру для отображения данных и управления.

---

## TODO

- [ ] Добавить тесты для MagicIoTm
- [ ] Автоматизировать CI/CD для сборки прошивок
- [ ] Реализовать скачивание файлов из FS устройства (раздел FS пока каркас)
- [ ] Добавить документацию по API MagicIoTm
