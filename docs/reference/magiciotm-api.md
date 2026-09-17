# Справочник API веб-панели magicIoTm

> **Reference**. Все маршруты — с префиксом `/api`. SSE-потоки отдают `text/event-stream`.
> Панель — локальный инструмент без аутентификации.

## Проекты и конфигурация

| Метод | Путь | Описание |
|---|---|---|
| GET | `/projects` | Дерево проектов + описания |
| GET | `/projects/data-svelte` | Проекты, у которых есть `data_svelte` (кроме PlatformIO) |
| POST | `/projects/category` | Создать категорию |
| DELETE | `/projects/category/<name>` | Удалить категорию |
| POST | `/projects/category/<name>/rename` | Переименовать категорию |
| POST | `/projects/create` | Создать проект |
| DELETE | `/projects/<cat>/<name>` | Удалить проект |
| POST | `/projects/<cat>/<name>/rename` | Переименовать проект |
| POST | `/projects/copy` | Копировать проект |
| POST | `/projects/move` | Перенести проект |
| POST | `/projects/<cat>/<name>/open` | Открыть проект |
| POST | `/platformio/open` | Открыть защищённый проект PlatformIO (корневой `myProfile.json`) |
| GET | `/projects/last` | Последний открытый |
| GET | `/projects/list-all` | Список всех (для копирования) |
| GET | `/projects/<cat>/<name>/settings` | `iotmSettings` проекта |
| POST | `/projects/copy-settings` | Копировать iotmSettings |
| POST | `/projects/copy-modules` | Копировать modules |
| POST | `/config/import-root` | Импорт из корневого `myProfile.json` в текущий проект |
| POST | `/projects/repair-data-dir` | Перезаписать `[platformio] data_dir` проекта на `<проект>/data_svelte` (`{category, name}`) |
| GET | `/projects/<cat>/<name>/tree/fs` | Дерево файлов FS проекта (`data_svelte`) |
| GET | `/projects/<cat>/<name>/file/fs?path=` | Содержимое файла из `data_svelte` проекта (`?meta=1` — только имя/размер, в т.ч. для бинарных `*.gz`/`favicon.ico`) |
| POST | `/projects/<cat>/<name>/file/fs` | Сохранить файл в `data_svelte` проекта (`{path, content}`; бинарные `*.gz`/`favicon.ico` не записываются) |
| GET | `/projects/<cat>/<name>/file/sources?mode=file\|all&path=` | Доступные источники «получить из устройства»: по каждому устройству — есть ли сохранённые RAM/FS (`ram_saved`/`fs_saved`) и в сети ли оно (`ram_live`/`fs_live`, можно тянуть напрямую; `ram_live` — только для файлов, которые прошивка отдаёт по WS из набора RAM: `config.json`, `items.json`, `widgets.json`, `scenario.txt`, `settings.json`, `ota.json`, `profile.json`) |
| POST | `/projects/<cat>/<name>/file/from-device` | Получить файл/файлы из устройства в `data_svelte` проекта (`{device_key, section, live, all, path}`) |
| GET | `/config` | Текущая конфигурация |
| POST | `/config/save` | Сохранить конфигурацию |
| POST | `/config/settings` | Сохранить настройки |
| POST | `/config/about` | Сохранить описание |
| GET | `/config/export` | Экспорт в JSON (имя файла `myProfile_<ts>.json`) |

## Платформы, модули, размеры

| Метод | Путь | Описание |
|---|---|---|
| GET | `/platforms` | Список платформ (env) + baseline_flash |
| POST | `/platform/change` | Смена платформы (автоотключение несовместимых) |
| GET | `/size` | Размеры FLASH/RAM/FS (проценты и байты) |
| POST | `/modules/toggle` | Включить/выключить модуль |
| POST | `/modules/sync` | Пакетное обновление активных модулей |
| GET | `/modules/compatibility` | Карта совместимости и статусов размеров модулей для текущей платформы (`sizeState`: `ok` / `error_platform` / `error_all` / `missing`) |
| POST | `/modules/reload` | Перезагрузить кэши modinfo и platforms (после замера размеров) |
| POST | `/modules/info` | Информация о модуле (about, usedLibs, usedFLASH, usedRAM) |

## Сборка и замер

| Метод | Путь | Описание |
|---|---|---|
| POST | `/build/start` | Запустить сборку (сохраняет конфиг) |
| GET | `/build/stream` | SSE-поток событий сборки |
| POST | `/measure/start` | Запустить замер размера (scope: all/module/baseline/profile/without) |
| GET | `/measure/stream` | SSE-поток событий замера |
| POST | `/measure/abort` | Мягко прервать замер |

## Валидация и инструменты

| Метод | Путь | Описание |
|---|---|---|
| GET | `/validate/name` | Валидация имени устройства |
| GET | `/validate/apssid` | Валидация AP SSID |
| GET | `/tools/esptool` | Статус esptool (установлен/версия/актуальность) |
| POST | `/tools/esptool/install` | Автоустановка esptool |
| POST | `/tools/esptool/update` | Обновление esptool |
| GET | `/tools/ports` | COM-порты с определённым ESP-чипом |
| GET | `/scenario/functions` | Списки функций для проверки scenario.txt (`reserved` + `bySubtype`) |

## Прошивка (USB и OTA)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/upload/status` | Готовность к USB-прошивке (собрана ли прошивка, семейство чипа) |
| POST | `/upload/detect` | Определить подключённый ESP-чип, проверить соответствие платформе |
| POST | `/upload/start` | Запустить USB-прошивку (`mode`: fs/firmware/full, `port`: COM) |
| GET | `/upload/stream` | SSE-поток USB-прошивки |
| GET | `/ota/candidates` | Список онлайн-устройств для OTA (совместимость платформ) |
| POST | `/ota/start` | Запустить OTA (`mode`: fs/firmware/full, `fs_method`: flash/copy) |
| GET | `/ota/stream` | SSE-поток OTA |

Особенности `POST /upload/start`:

- `mode`: `fs` | `firmware` | `full`; при `fs`/`full` образ LittleFS собирается из
  `[platformio] data_dir` проекта (`mklittlefs -c $PROJECT_DATA_DIR`).
- Если в `platformio.ini` указан устаревший/несуществующий `data_dir` (например, проект
  перенесли в другую категорию), ответ — `409` с `code: "data_dir"`, полями `ini_value`,
  `resolved`, `expected` и `project`. UI показывает модалку «Исправить и прошить» и
  вызывает `POST /projects/repair-data-dir`.

## Устройства

| Метод | Путь | Описание |
|---|---|---|
| GET | `/devices` | Список устройств со статусами (online/offline, цвет) |
| GET | `/devices/list-all` | Все папки устройств + наличие settings/profile в RAM/FS |
| GET | `/devices/stream` | SSE-поток изменений списка устройств |
| GET | `/devices/interfaces` | Сетевые интерфейсы для выбора подсети |
| POST | `/devices/scan` | Запустить сканирование сети (опц. `{"subnet": "..."}` или `"__all__"`) |
| GET | `/devices/scan/stream` | SSE-поток прогресса сканирования |
| POST | `/devices/add` | Добавить устройство по IP |
| DELETE | `/device/<device_key>` | Удалить устройство (папка + записи) |
| POST | `/device/<device_key>/copy-to-project` | Копировать устройство в проект (существующий или создаётся из шаблона): `{dst_cat, dst_name, section: ram\|fs}`; правила кнопок «⤵ Из устройства»: settings.json → iotmSettings (кроме id/ip/root), profile.json/flashProfile.json → платформа из default_envs (несовместимые модули отключаются) и активность модулей по path |
| GET | `/device/<device_key>/info` | Инфо устройства и путь к папке |
| POST | `/device/<device_key>/fetch/<ram\|fs>` | Скачать раздел RAM/FS в фоне |
| GET | `/device/<device_key>/fetch/<section>/status` | Статус/прогресс скачивания |
| GET | `/device/<device_key>/tree/<ram\|fs>` | Дерево файлов раздела |
| GET | `/device/<device_key>/file/<ram\|fs>?path=` | Содержимое файла (`?meta=1` — только имя/размер) |
| POST | `/device/<device_key>/file/<ram\|fs>` | Сохранить файл локально |
| POST | `/device/<device_key>/write/ram` | Записать файл обратно на устройство (обратные WS-команды; только поддерживаемые прошивкой файлы) |
| POST | `/device/<device_key>/fetch/<ram\|fs>/file` | Скачать один файл с устройства в папку устройства (`{path}`; RAM — по WS, FS — по HTTP) |
| POST | `/device/<device_key>/ping` | Ручной пинг устройства: `{success, online}` по ICMP (для устройств «не в сети» перед получением файлов); FSM-статус не меняет |
| GET | `/device/settings?key=&section=` | settings.json устройства (RAM/FS) |
| GET | `/device/profile?key=&section=` | Профиль устройства: modules + default_envs (RAM: profile.json, FS: flashProfile.json) |
| POST | `/device/<device_key>/reboot` | Перезагрузить устройство (WS `/reboot\|`) |