# magicIoTm — Конфигуратор прошивок IoTmanager

Web-приложение на Python Flask для управления проектами и конфигурациями IoT-устройств.

## Возможности

- **Управление проектами**: категории, создание/удаление/переименование/копирование
- **Конфигурация**: редактирование iotmSettings, управление модулями через галочки
- **Валидация**: уникальность имени устройства (макс. 16 символов, без пробелов), уникальность AP SSID
- **Совместимость платформ**: автоматическое отключение несовместимых модулей при смене платформы
- **Индикатор памяти**: расчёт заполненности прошивки на основе данных из modinfo.json
- **Копирование настроек**: импорт iotmSettings и modules из других проектов
- **Резервное копирование**: автоматический бэкап перед удалением
- **История**: автооткрытие последнего проекта при запуске
- **Экспорт**: выгрузка конфигурации в JSON
- **Импорт базового конфига**: загрузка myProfile.json из корня проекта как шаблона

## Запуск

```bat
run.bat
```

Сервер: http://127.0.0.1:5005

## Структура проекта

```
magicIoTm/
├── app.py              # Flask backend
├── index.html          # Frontend (SPA)
├── run.bat             # Запуск сервера
├── restart.bat         # Перезапуск
├── stop.bat            # Остановка
├── requirements.txt    # Зависимости
├── projects/           # Проекты пользователя (gitignored)
│   └── [категория]/
│       └── [проект]/
│           ├── myProfile.json   # Полная конфигурация (копия из корня при создании)
│           ├── data.json        # Метаданные проекта
│           └── about.txt        # Описание
├── utils/
│   └── projects.py     # Логика управления проектами
└── assets/
    ├── css/
    ├── js/
    └── img/
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/projects` | Дерево проектов |
| POST | `/api/projects/category` | Создать категорию |
| DELETE | `/api/projects/category/<name>` | Удалить категорию |
| POST | `/api/projects/create` | Создать проект |
| DELETE | `/api/projects/<cat>/<name>` | Удалить проект |
| POST | `/api/projects/<cat>/<name>/rename` | Переименовать |
| POST | `/api/projects/copy` | Копировать проект |
| POST | `/api/projects/move` | Перенести проект |
| POST | `/api/projects/<cat>/<name>/open` | Открыть проект |
| GET | `/api/projects/last` | Последний открытый |
| GET | `/api/projects/list-all` | Список всех (для копирования) |
| POST | `/api/projects/copy-settings` | Копировать iotmSettings |
| POST | `/api/projects/copy-modules` | Копировать modules |
| GET | `/api/config` | Текущая конфигурация |
| POST | `/api/config/save` | Сохранить конфигурацию |
| POST | `/api/config/settings` | Сохранить настройки |
| POST | `/api/config/about` | Сохранить описание |
| POST | `/api/config/import-root` | Импорт из ../myProfile.json |
| GET | `/api/config/export` | Экспорт в JSON |
| POST | `/api/modules/toggle` | Включить/выключить модуль |
| GET | `/api/modules/compatibility` | Совместимость модулей |
| POST | `/api/modules/info` | Информация о модуле |
| GET | `/api/platforms` | Список платформ |
| POST | `/api/platform/change` | Смена платформы |
| GET | `/api/size` | Размер прошивки |
| GET | `/api/validate/name` | Валидация имени |
| GET | `/api/validate/apssid` | Валидация AP SSID |
