# Changelog

Все заметные изменения репозитория IoTManager.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/).
Полная история: `git log --oneline`.

## [Не выпущено]

### Документация (реструктуризация)

- Корневой `README.md` переписан на русский: обзор, быстрый старт, карта репозитория.
- Документация структурирована в `docs/` по модели Diátaxis: архитектура
  (`architecture.md`), гайды (`guides/`), справочники (`reference/`), решения (`decisions/`, ADR).
- Добавлен `AGENTS.md` — контракт для AI-ассистентов и разработчиков
  (карта, команды, правила, известные риски). `KODA.md` и `.codeassistant/rules/rules.md`
  стали указателями на него.
- Удалены дубли-источники рассинхрона: корневые и локальные
  «Project Knowledge Base.md» и «Technical Description of the Project.md»;
  ценное перенесено в `AGENTS.md` и `docs/`.
- Добавлен `CHANGELOG.md`; `tools/magicIoTm/ToDo.txt` заменён Roadmap в `docs/README.md`.

## История

### 2026-09-09

- `f2dfa947` docs(magicIoTm): переписан README под актуальное состояние; добавлены маршруты `/write/ram` и `/reboot`
- `f28e7cf1` Рефакторинг MagicIoTm: разделение app.py на blueprint'ы (routes/core/state/static), обновление конфигов прошивки (ADR-0001)

### 2026-09-08

- `68d1d634` chore: оптимизация .gitignore
- `1201a5fe` fix(magicIoTm): мгновенное закрытие модалок ломало запуск OTA
- `4e019209` fix(magicIoTm): OTA не запускалась — гонка закрытия модалки выбора режима
- `e3e28a48` fix(magicIoTm): статус устройства при переименовании; ложный конфликт имени в проекте PlatformIO
- `12db0e8d` feat: копирование настроек и модулей из устройства; исправление рендера boolean-полей
- `2934cb5f` fix: иконка ⧉ → ⤵ у кнопок копирования из другого проекта
- `0713fba8` feat: модалки сканирования и получения файлов — галочка автозакрытия, блокировка оверлея
- `7bf49dd5` правка «display:none»

### 2026-09-07

- `2fe8336f` fix(magicIoTm): поиск run.bat по пути `\magicIoTm\` в командной строке
- `44b6b294` fix(magicIoTm): надёжное закрытие окна сервера при рестарте
- `e75500ed` fix(magicIoTm): функции и системные события не помечаются как неизвестные переменные config.json
- `76b7a0a0` feat(magicIoTm): строгая проверка встроенных функций в scenario.txt
- `470319f9` fix(magicIoTm): корректная проверка scenario.txt (скобки и if/then/else)
- `e52ab371` chore: игнорирование runtime-артефактов (log, pyc, projects, settings.json)
- `b05cf1fd` magicIoTm: логирование multicast и пингов; зелёный по ip+name+id; срыв соседа по IP
- `54b84146` feat(magicIoTm): OTA по воздуху через нативный pull

### 2026-09-06

- `561f9786` feat(magicIoTm): OTA-прошивка по воздуху
- `82dd4921` magicIoTm: esptool + прошивка по USB, проверка flash-памяти, разделение ESP8266/ESP8285, кнопка открытия веб-страницы устройства
- `cb2167ba` magicIoTm: проверка flash-памяти перед прошивкой; русские метки шагов
- `75852284` magicIoTm: ручной выбор порта при сбое автоопределения чипа
- `00be4449` magicIoTm: не подсвечивать устройство по multicast после переключения на проект
- `ac78f84f` magicIoTm: фиксы менеджера устройств (FS, проверка сценария)
- `61c5168e` magicIoTm: исправление парсера сценариев (зависание, неполный парсинг)
- `71d6fab1` magicIoTm: жёлтый статус только после зелёного
- `7ec62183` magicIoTm: кнопки удаления устройств в стиле проектов
- `c1e35a18` magicIoTm: правки стиля кнопок в менеджере устройств; .gitignore
- `e8108f1b` magicIoTm: статусы устройств (серый/зелёный/жёлтый/красный), фоновый пинг, модалки удаления

### 2026-09-02

- `ff0ac5c8` Документация: data_svelte в корне проекта; очистка iotm/ после сборки (ADR-0002)

### 2026-09-01

- `9c5ca7c0` Восстановление правок magicIoTm после rebase: прогресс чтения RAM/FS, фиксы fetch_ram (QUIET-break), dev_ip/is_compatible; добавлены Knowledge Base и Technical Description (впоследствии перенесены в `docs/`)

### 2026-08-31

- `d0da307c` Исправление редактора устройств: pretty-print всех JSON, box-sizing для длинных строк, идентичность устройства по имени+id

### 2026-08-30

- `882ff782` Обнаружение устройств · `c5b8d8f9` чтение файлов с RAM устройства · `ed4173a1` отображение FS · `e6f427a6` del logs

### Ранее (measure_size, platformio, tools)

- `86b8cb91` fix data_svelte для data_lite · `a6723b8b` modify all modinfo.json · `a17b49cd` fix WiFiUtils for bk7231n · `9965c5dd` create tools
- Развитие замеров размеров модулей и платформ (`452a8c75`, `cdaff640`, `edc67445`, `7657016f`, `51c050b3`, `206281ba`), платформы из `platformio.ini` (`43081282`, `627ea70b`), buttons build/upload/OTA (`dbba5da5`, `a07dbd00`), favicon/лого (`282a6dcf`, `7bb2e003`, `dcadc6d0`), fix AnalogADC (`80d112f2`), модуль «Счётчик электроэнергии Гран-Электро / SDM120» и базовый ключ модулей (`afe22aed`, `5de18aba`)