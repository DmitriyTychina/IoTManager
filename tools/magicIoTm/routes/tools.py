"""
Инструменты (esptool, порты) — маршруты Flask.
"""

import logging

from flask import Blueprint, request, jsonify
from core.flasher import status, ensure_installed, ensure_updated, list_esp_ports

logger = logging.getLogger(__name__)

bp = Blueprint('tools', __name__)


@bp.route('/tools/esptool', methods=['GET'])
def api_tools_esptool():
    """Статус проверки esptool: установлен ли, версия, актуальность."""
    return jsonify(status())


@bp.route('/tools/esptool/install', methods=['POST'])
def api_tools_esptool_install():
    """Автоматическая установка esptool (без подтверждения пользователя)."""
    try:
        st = ensure_installed()
        return jsonify({"success": st.get("available", False), "status": st})
    except Exception as e:  # noqa: BLE001
        logger.error(f"Не удалось установить esptool: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@bp.route('/tools/esptool/update', methods=['POST'])
def api_tools_esptool_update():
    """Обновление esptool (вызывается ТОЛЬКО после согласия пользователя)."""
    try:
        res = ensure_updated()
        return jsonify(res)
    except Exception as e:  # noqa: BLE001
        logger.error(f"Не удалось обновить esptool: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@bp.route('/tools/ports', methods=['GET'])
def api_tools_ports():
    """Список COM-портов, на которых определён ESP-чип (через esptool)."""
    ports = list_esp_ports()
    return jsonify({"success": True, "ports": ports})
