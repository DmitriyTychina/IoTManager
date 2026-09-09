"""
Builder — логика сборки прошивок.

Извлечено из app.py для разделения ответственности.
"""

import os
import logging
import shutil
import subprocess

from utils import projects, build
from state.globals import current_project, current_config
from core.config import (
    PROJECT_ROOT, ROOT_CONFIG_FILE, PLATFORMIO_INI_FILE,
    PLATFORMS_FILE, MEASURE_SCRIPT, BASE_DIR,
    get_project_platformio_path, _project_dir,
)

logger = logging.getLogger(__name__)


def get_platformio_path():
    """Путь к исполняемому файлу PlatformIO (pio/platformio).

    Сначала ищем команду в PATH, затем резервно — в стандартном каталоге установки.
    """
    # 1. Поиск в PATH (pio или platformio)
    for name in ('pio', 'platformio'):
        found = shutil.which(name)
        if found:
            return found
    # 2. Резерв: стандартный каталог установки PlatformIO
    if os.name == 'nt':
        exe_names = ['platformio.exe', 'pio.exe']
        base = os.path.join(os.environ['USERPROFILE'], '.platformio', 'penv', 'Scripts')
    else:
        exe_names = ['pio', 'platformio']
        base = os.path.join(os.environ.get('HOME', ''), '.platformio', 'penv', 'bin')
    for name in exe_names:
        candidate = os.path.join(base, name)
        if os.path.isfile(candidate):
            return candidate
    # Если ни один не найден — возвращаем дефолт, чтобы вызвать понятную ошибку запуска
    return os.path.join(base, exe_names[0])


def resolve_build_config(proj, config):
    """Формирует cfg для build.start() по текущему проекту."""
    if projects.is_platformio(proj.get("name", "")):
        profile = ROOT_CONFIG_FILE
        ini = PLATFORMIO_INI_FILE
    else:
        proj_dir = os.path.join(projects.PROJECTS_DIR, proj.get("category", ""), proj.get("name", ""))
        profile = os.path.join(proj_dir, projects.CONFIG_FILENAME)
        ini = os.path.join(proj_dir, "platformio.ini")
    if not os.path.isfile(profile):
        logger.error(f"Профиль не найден: {profile}")
        return None
    env = ""
    try:
        env = config.get("projectProp", {}).get("platformio", {}).get("default_envs", "")
    except AttributeError:
        env = ""
    # Скрипт подготовки профиля лежит в utils/ рядом с build.py
    prepare_script = os.path.join(os.path.dirname(os.path.abspath(build.__file__)), "PrepareProject.py")
    return {
        "profile": profile,
        "ini": ini,
        "env": env,
        "pio": get_platformio_path(),
        "prepare": prepare_script,
        "cwd": PROJECT_ROOT,
        # data_svelte всегда лежит в корне проекта (рядом с myProfile.json)
        "data_dir": os.path.join(os.path.dirname(profile), "data_svelte"),
        "project_label": f"{proj.get('category','')}/{proj.get('name','')}",
    }


# Re-export from utils.build
start = build.start
is_running = build.is_running
event_stream = build.event_stream
get_status = build.get_status
