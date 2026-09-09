# Справочник поддерживаемых платформ

> **Reference**. Окружения заданы в секциях `[env:*]` файла `platformio.ini`.
> Окружение по умолчанию (`default_envs`) — `esp32s2_4mb`.

## Платы

| Плата | Платформа | Flash | Примечания |
|---|---|---|---|
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

## По семействам

- **ESP8266**: `esp8266_1mb`, `esp8266_1mb_ota`, `esp8266_2mb`, `esp8266_2mb_ota`,
  `esp8266_4mb`, `esp8266_16mb`, `esp8285_1mb`, `esp8285_1mb_ota`.
- **ESP32**: `esp32_4mb`, `esp32_4mb3f`, `esp32_16mb`, `esp32cam_4mb`, `esp32s2_4mb`,
  `esp32c3m_4mb`, `esp32s3_16mb`, `esp32_wifirep`, `esp32c6_4mb`, `esp32c6_8mb`.
- **BK7231N**: `bk7231n` (LibreTiny, имя прошивки `iotm_tiny`), кастомная ветка `libretiny` и `LT_WebSockets`.

## Примечания

- Сборка: `pio run -e <плата>`; загрузка: `pio run -e <плата> --target upload`.
- Файловая система: LittleFS (`platformio.ini`: `filesystem = littlefs`, `data_dir = data_svelte`).
- После успешной сборки в `iotm/` остаётся только одна папка с прошивками (текущей платформы) — см. [ADR-0002](../decisions/0002-data-svelte-canonical-path.md).