"""
??????? вЂ” ???????? Flask ??? ?????????? ?????????.
"""

import json
import os
import logging
import shutil

import state.globals as globals_
from flask import Blueprint, request, jsonify
from utils import projects, build, measure_run
from core.config import PROJECT_ROOT, ROOT_CONFIG_FILE, PLATFORMIO_INI_FILE, _project_dir, _find_data_svelte

logger = logging.getLogger(__name__)

bp = Blueprint('projects', __name__)


# ==================== ??????????????? ??????? ====================

def _dir_size(path):
    """????????? ?????? ?????? ? ???????? (?????)."""
    if not path or not os.path.isdir(path):
        return 0
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except OSError:
                pass
    return total


# ==================== ????????: ??????? ====================

@bp.route('/projects', methods=['GET'])
def api_list_projects():
    return jsonify({
        "success": True,
        "tree": projects.list_projects(),
        "about": projects.get_all_abouts(),
    })


@bp.route('/projects/data-svelte', methods=['GET'])
def api_projects_with_data_svelte():
    """???????, ? ??????? ???? ????? data_svelte (????? PlatformIO).

    ???????????? ??? ???????? ???????? ? ????????? ????????? ? ??????????? ??????.
    """
    result = []
    tree = projects.list_projects()
    for cat, projs in tree.items():
        for name in projs:
            if projects.is_platformio(name):
                continue
            dsv = _find_data_svelte(os.path.join(projects.PROJECTS_DIR, cat, name))
            if dsv:
                result.append({"category": cat, "name": name, "path": dsv})
    result.sort(key=lambda p: (p["category"], p["name"]))
    return jsonify({"success": True, "projects": result})


@bp.route('/projects/category', methods=['POST'])
def api_create_category():
    name = request.json.get('name', '').strip()
    if not name:
        return jsonify({"success": False, "error": "??? ?? ???????"}), 400
    ok, msg = projects.create_category(name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@bp.route('/projects/category/<name>', methods=['DELETE'])
def api_delete_category(name):
    ok, msg = projects.delete_category(name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@bp.route('/projects/category/<name>/rename', methods=['POST'])
def api_rename_category(name):
    new_name = request.json.get('name', '').strip()
    if not new_name:
        return jsonify({"success": False, "error": "????? ??? ?? ???????"}), 400
    ok, msg = projects.rename_category(name, new_name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@bp.route('/projects/create', methods=['POST'])
def api_create_project():
    data = request.json
    cat = data.get('category', '').strip()
    name = data.get('name', '').strip()
    desc = data.get('description', '')
    if not cat or not name:
        return jsonify({"success": False, "error": "????????? ? ??? ???????????"}), 400
    ok, msg = projects.create_project(cat, name, desc)
    return jsonify({"success": ok, "error": msg if not ok else None})


@bp.route('/projects/<category>/<name>', methods=['DELETE'])
def api_delete_project(category, name):
    if projects.is_platformio(name):
        return jsonify({"success": False, "error": "?????? PlatformIO ?????? ???????"}), 400
    ok, msg = projects.delete_project(category, name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@bp.route('/projects/<category>/<name>/rename', methods=['POST'])
def api_rename_project(category, name):
    if projects.is_platformio(name):
        return jsonify({"success": False, "error": "?????? PlatformIO ?????? ?????????????"}), 400
    new_name = request.json.get('name', '').strip()
    if not new_name:
        return jsonify({"success": False, "error": "????? ??? ?? ???????"}), 400
    ok, msg = projects.rename_project(category, name, new_name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@bp.route('/projects/copy', methods=['POST'])
def api_copy_project():
    data = request.json
    src_cat = data.get('src_cat', '')
    src_name = data.get('src_name', '')
    dst_cat = data.get('dst_cat', '')
    dst_name = data.get('dst_name', '')
    if projects.is_platformio(src_name):
        src_dev_name = None
        if os.path.exists(ROOT_CONFIG_FILE):
            with open(ROOT_CONFIG_FILE, 'r', encoding='utf-8') as f:
                src_dev_name = json.load(f).get("iotmSettings", {}).get("name")
        ok, msg = projects.create_project(dst_cat, dst_name, "")
        if ok:
            if src_dev_name:
                cfg = projects.load_project_config(dst_cat, dst_name)
                if cfg is not None:
                    cfg.setdefault("iotmSettings", {})["name"] = src_dev_name
                    projects.save_project_config(dst_cat, dst_name, cfg)
            dst_dir = os.path.join(projects.PROJECTS_DIR, dst_cat, dst_name)
            if os.path.exists(PLATFORMIO_INI_FILE):
                shutil.copy(PLATFORMIO_INI_FILE, os.path.join(dst_dir, 'platformio.ini'))
    else:
        ok, msg = projects.copy_project(src_cat, src_name, dst_cat, dst_name)
    return jsonify({"success": ok, "error": msg if not ok else None})


@bp.route('/projects/move', methods=['POST'])
def api_move_project():
    data = request.json
    if projects.is_platformio(data.get('src_name', '')):
        return jsonify({"success": False, "error": "?????? PlatformIO ?????? ?????????"}), 400
    ok, msg = projects.move_project(
        data.get('src_cat', ''), data.get('src_name', ''),
        data.get('dst_cat', ''), data.get('dst_name', '')
    )
    return jsonify({"success": ok, "error": msg if not ok else None})


@bp.route('/projects/<category>/<name>/open', methods=['POST'])
def api_open_project(category, name):
    config = projects.load_project_config(category, name)
    if config is None:
        return jsonify({"success": False, "error": "?????? ?? ??????"}), 404
    globals_.current_project = {"category": category, "name": name}
    globals_.current_config = config
    projects.save_history(category, name)
    about = projects.load_project_about(category, name)
    de = config.get("projectProp", {}).get("platformio", {}).get("default_envs", "")
    if de:
        globals_.current_platform = de
    logger.info(f"?????? ??????: {category}/{name}")
    return jsonify({"success": True, "config": config, "about": about, "platform": globals_.current_platform})


@bp.route('/platformio/open', methods=['POST'])
def api_open_platformio():
    """???????? ??????? PlatformIO.

    ?????? ??????? ???????? ?? ????????? myProfile.json,
    ?????? ???????? вЂ” ?? platformio.ini.
    """
    if not os.path.exists(ROOT_CONFIG_FILE):
        return jsonify({"success": False, "error": "myProfile.json ?? ??????"}), 404
    with open(ROOT_CONFIG_FILE, 'r', encoding='utf-8') as f:
        config = json.load(f)
    globals_.current_project = {"category": projects.PLATFORMIO_PROJECT, "name": projects.PLATFORMIO_PROJECT}
    globals_.current_config = config
    de = config.get("projectProp", {}).get("platformio", {}).get("default_envs", "")
    if de:
        globals_.current_platform = de
    logger.info(f"?????? ??????: {projects.PLATFORMIO_PROJECT}")
    return jsonify({
        "success": True,
        "config": config,
        "about": "",
        "platform": globals_.current_platform,
        "protected": True,
    })


@bp.route('/projects/last', methods=['GET'])
def api_last_project():
    hist = projects.load_history()
    if not hist:
        return jsonify({"success": True, "project": None})
    path = os.path.join(projects.PROJECTS_DIR, hist.get("category", ""), hist.get("name", ""))
    if not os.path.exists(os.path.join(path, projects.CONFIG_FILENAME)):
        return jsonify({"success": True, "project": None})
    return jsonify({"success": True, "project": hist})


@bp.route('/projects/list-all', methods=['GET'])
def api_list_all():
    """?????? ???? ???????? ??? ??????????? ????????"""
    tree = projects.list_projects()
    flat = []
    for cat, projs in tree.items():
        for p in projs:
            flat.append({"category": cat, "name": p})
    return jsonify({"success": True, "projects": flat})


@bp.route('/projects/<category>/<name>/settings', methods=['GET'])
def api_get_project_settings(category, name):
    """????????? ????? iotmSettings ??????? (??? ??????????? ????????? ?????)"""
    config = projects.load_project_config(category, name)
    if config is None:
        return jsonify({"success": False, "error": "?????? ?? ??????"}), 404
    return jsonify({"success": True, "settings": config.get("iotmSettings", {})})


@bp.route('/projects/copy-settings', methods=['POST'])
def api_copy_settings():
    """??????????? iotmSettings ?? ??????? ???????"""
    if not globals_.current_project:
        return jsonify({"success": False, "error": "?????? ?? ??????"}), 400
    data = request.json
    src_cat = data.get('src_cat', '')
    src_name = data.get('src_name', '')
    src_config = projects.load_project_config(src_cat, src_name)
    if not src_config:
        return jsonify({"success": False, "error": "???????? ?????? ?? ??????"}), 404
    src_settings = dict(src_config.get("iotmSettings", {}))
    src_settings.pop("name", None)
    src_settings.pop("apssid", None)
    with globals_._lock:
        globals_.current_config.setdefault("iotmSettings", {}).update(src_settings)
        projects.save_project_config(globals_.current_project["category"], globals_.current_project["name"], globals_.current_config)
    return jsonify({"success": True, "settings": globals_.current_config["iotmSettings"]})


@bp.route('/projects/copy-modules', methods=['POST'])
def api_copy_modules():
    """??????????? modules ?? ??????? ???????"""
    if not globals_.current_project:
        return jsonify({"success": False, "error": "?????? ?? ??????"}), 400
    data = request.json
    src_cat = data.get('src_cat', '')
    src_name = data.get('src_name', '')
    src_config = projects.load_project_config(src_cat, src_name)
    if not src_config:
        return jsonify({"success": False, "error": "???????? ?????? ?? ??????"}), 404
    with globals_._lock:
        globals_.current_config["modules"] = src_config.get("modules", {})
        projects.save_project_config(globals_.current_project["category"], globals_.current_project["name"], globals_.current_config)
    return jsonify({"success": True, "modules": globals_.current_config["modules"]})


@bp.route('/config/import-root', methods=['POST'])
def api_import_root():
    """?????? myProfile.json ?? ????? ??????? ??? ??????? ??? ?????? ???????"""
    if not globals_.current_project:
        return jsonify({"success": False, "error": "?????? ?? ??????"}), 400
    if not os.path.exists(ROOT_CONFIG_FILE):
        return jsonify({"success": False, "error": "myProfile.json ?? ??????"}), 404
    with open(ROOT_CONFIG_FILE, 'r', encoding='utf-8') as f:
        base = json.load(f)
    dev_name = globals_.current_config.get("iotmSettings", {}).get("name", globals_.current_project["name"])
    base["iotmSettings"]["name"] = dev_name
    with globals_._lock:
        globals_.current_config = base
        projects.save_project_config(globals_.current_project["category"], globals_.current_project["name"], base)
    logger.info(f"???????????? ??????? ?????? ? {globals_.current_project['category']}/{globals_.current_project['name']}")
    return jsonify({"success": True, "config": base})
