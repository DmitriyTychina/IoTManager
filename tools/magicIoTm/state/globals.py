"""
Глобальное состояние приложения (синглтоны).

Все изменяемые глобальные переменные вынесены сюда для удобства
и предотвращения рассинхрона между модулями.
"""

import threading

# ==================== Проектное состояние ====================
current_project = None          # {"category": ..., "name": ...}
current_config = None           # dict — полная конфигурация проекта
current_platform = "esp8266_4mb"  # текущая платформа (env)

# ==================== Кэши ====================
modinfo_cache = {}              # module_name -> {usedFLASH, usedRAM, usedLibs, about}
platforms_cache = {}            # env -> {baseline_flash, total_flash, baseline_ram, total_ram, total_fs}

# ==================== Общеприменимые блокировки ====================
_lock = threading.Lock()        # для записи current_config

# ==================== Состояние сканирования ====================
_scan_lock = threading.Lock()
_scan_state = {
    "running": False,
    "total": 0,
    "done": 0,
    "subnet": "",
    "alive": [],
    "found": [],
    "failed": [],
    "error": None,
}

# ==================== Состояние устройств ====================
_devices_lock = threading.Lock()
_devices = {}                   # ip -> {ip, name, wg, id, status, fv, last_seen}

_device_folders_lock = threading.Lock()
_device_folders = {}            # key -> {folder, ram_dir, fs_dir, name, ip}

_device_states_lock = threading.Lock()
_device_states = {}             # key -> {state, fails, last_confirm}

# ==================== Потоки ====================
_device_thread = None           # multicast listener
_ping_thread = None             # ping worker
_scan_thread = None             # network scanner

# ==================== Скачивание разделов ====================
_fetch_progress = {}            # (device_key, section) -> {stage, done, total, name, files, error, ip}
