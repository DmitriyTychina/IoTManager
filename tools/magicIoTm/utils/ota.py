# -*- coding: utf-8 -*-
"""
ota — прошивка выбранного проекта на IoTManager-устройство по воздуху (Wi-Fi).

Отличие от flash.py: файлы отправляются НЕ по USB (через pio upload), а
непосредственно по сети на HTTP-эндпоинты прошивки устройства.

Два механизма записи (fs_method):
  * 'flash' — запись целого образа через POST /update:
        firmware.bin -> U_FLASH, littlefs.bin -> U_FS   (handleUpdateOTA)
  * 'copy'  — пофайловая загрузка из data_svelte проекта через POST /edit
        (handleFileUpload); при необходимости каталоги создаются через
        PUT /edit?path=/dir/  (handleFileCreate).

Режимы (mode), выбираемые в модалке, с учётом fs_method:
    'firmware'             — только прошивка               (firmware.bin)
    'fs'   + flash         — только ФС, записать образ     (littlefs.bin)
    'fs'   + copy          — только ФС, скопировать файлы  (data_svelte -> /edit)
    'full' + flash         — ФС(образ) затем прошивка
    'full' + copy          — ФС(копия) затем прошивка

Порядок 'full' важен: после записи прошивки устройство перезагружается
(Update.end(true) -> ESP.restart()), поэтому ФС пишем первой.

Во время OTA следует отключать фоновый пинг устройства (одинаковые IP могут
быть у разных устройств) — для этого есть busy_ip().

Модуль самодостаточен: пути .bin, data_dir и IP передаются в start(cfg)
из app.py (аналогично flash.py/build.py), циклических импортов нет.
Прогресс отдаётся по SSE через event_stream() (паттерн как в flash.py).
"""

import json
import os
import time
import threading
import uuid

import http.client
import urllib.parse


HTTP_PORT = 80
UPLOAD_UPDATE_PATH = "/update"   # POST multipart: firmware.bin / littlefs.bin
UPLOAD_EDIT_PATH = "/edit"       # POST multipart: произвольный файл FS
FIELD_NAME = "firmware"          # имя поля multipart (прошивка его игнорирует)
_CHUNK_SIZE = 32 * 1024
_BETWEEN_STEPS_DELAY = 1.5       # пауза между шагами, чтобы прошивка завершила запись


class OtaError(Exception):
    """Ошибка OTA-прошивки (пользовательское сообщение)."""


# ==================== Шаги ====================

def build_steps(mode, fs_method):
    """Список шагов для (mode, fs_method). Каждый шаг: {kind, label[, file]}.

    kind:
      'ota'  — POST /update с бинарником (file: 'firmware.bin' | 'littlefs.bin')
      'copy' — пофайловая загрузка data_svelte через POST /edit
    """
    steps = []
    if mode in ("fs", "full"):
        if fs_method == "copy":
            steps.append({"kind": "copy", "label": "Копирование файлов FS на устройство"})
        else:
            steps.append({"kind": "ota", "file": "littlefs.bin",
                          "label": "Загрузка файловой системы FS"})
    if mode in ("firmware", "full"):
        steps.append({"kind": "ota", "file": "firmware.bin", "label": "Загрузка прошивки"})
    return steps


# ==================== Состояние ====================

_state = {
    "running": False,
    "success": None,
    "mode": None,
    "fs_method": None,
    "steps": [],
    "lines": [],
    "error_step": None,
    "error": None,
    "project_label": "",
    "ip": None,
    "current_step": None,
    "progress": {"file": None, "done": 0, "total": 0},
    "cond": threading.Condition(),
}

_lock = threading.Lock()


def _notify():
    with _state["cond"]:
        _state["cond"].notify_all()


def _append_line(text):
    with _state["cond"]:
        _state["lines"].append(text)
        _state["cond"].notify_all()


def _set_running(flag):
    with _state["cond"]:
        _state["running"] = flag
        _state["cond"].notify_all()


def _reset_state(project_label="", mode="", fs_method="flash", ip=""):
    steps = []
    for i, st in enumerate(build_steps(mode, fs_method), start=1):
        steps.append({"id": i, "label": st["label"], "status": "pending"})
    with _state["cond"]:
        _state.update({
            "running": False,
            "success": None,
            "mode": mode,
            "fs_method": fs_method,
            "steps": steps,
            "lines": [],
            "error_step": None,
            "error": None,
            "project_label": project_label,
            "ip": ip,
            "current_step": None,
            "progress": {"file": None, "done": 0, "total": 0},
        })
        _state["cond"].notify_all()


def _fail(error_step, message):
    with _state["cond"]:
        _state["success"] = False
        _state["error_step"] = error_step
        _state["error"] = message
        _state["running"] = False
        _state["cond"].notify_all()


def _finish_success():
    with _state["cond"]:
        _state["success"] = True
        _state["running"] = False
        _state["cond"].notify_all()


# ==================== Публичный API ====================

def is_running():
    with _state["cond"]:
        return _state["running"]


def busy_ip():
    """IP устройства, которое сейчас прошивается, либо None."""
    with _state["cond"]:
        return _state["ip"] if _state["running"] else None


def get_status():
    """Снимок состояния OTA для UI."""
    with _state["cond"]:
        return {
            "running": _state["running"],
            "success": _state["success"],
            "mode": _state["mode"],
            "fs_method": _state["fs_method"],
            "steps": list(_state["steps"]),
            "error_step": _state["error_step"],
            "error": _state["error"],
            "project_label": _state["project_label"],
            "ip": _state["ip"],
            "progress": dict(_state["progress"]),
        }


def start(cfg):
    """Запуск OTA в фоне. cfg — dict с параметрами (см. app.py).

    Ключи cfg: mode, fs_method, ip, files, data_dir, project_label, timeout.

    Returns:
        bool: True если запущено, False если уже выполняется.
    """
    with _lock:
        if _state["running"]:
            return False
        mode = cfg.get("mode", "firmware")
        fs_method = cfg.get("fs_method", "flash")
        _reset_state(cfg.get("project_label", ""), mode, fs_method, cfg.get("ip", ""))
        _set_running(True)
    t = threading.Thread(target=_worker, args=(cfg,), daemon=True)
    t.start()
    return True


def event_stream():
    """Генератор SSE-событий OTA: log, step, progress, done/error, finish."""
    idx = 0
    emitted_step = {}
    done_sent = False
    last_progress = None
    while True:
        with _state["cond"]:
            while idx < len(_state["lines"]):
                yield _sse("log", {"text": _state["lines"][idx]})
                idx += 1
            for s in _state["steps"]:
                status = s["status"]
                if status != "pending" and emitted_step.get(s["id"]) != status:
                    emitted_step[s["id"]] = status
                    yield _sse("step", {"id": s["id"], "label": s["label"], "status": status})
            pr = _state["progress"]
            pkey = (pr["file"], pr["done"], pr["total"])
            if pkey != last_progress:
                last_progress = pkey
                yield _sse("progress", {"file": pr["file"], "done": pr["done"], "total": pr["total"]})
            finished = not _state["running"]
            if finished and not done_sent:
                done_sent = True
                if _state["success"]:
                    yield _sse("done", {})
                else:
                    yield _sse("error", {"step": _state["error_step"],
                                         "error": _state["error"],
                                         "label": _state["mode"]})
                yield _sse("finish", {})
            if finished:
                break
            _state["cond"].wait(timeout=1.0)


def _sse(event, data):
    return "event: {}\ndata: {}\n\n".format(event, json.dumps(data, ensure_ascii=False))


# ==================== Воркер ====================

def _worker(cfg):
    try:
        mode = cfg.get("mode", "firmware")
        fs_method = cfg.get("fs_method", "flash")
        ip = cfg.get("ip", "")
        files = cfg.get("files", {})
        data_dir = cfg.get("data_dir", "")
        timeout = int(cfg.get("timeout", 180))
        steps = build_steps(mode, fs_method)

        _append_line(f"OTA прошивка проекта: {cfg.get('project_label', '')}")
        _append_line(f"Режим: {mode} ({fs_method}) | Устройство: {ip}")
        _append_line("")

        for idx, st in enumerate(steps, start=1):
            step_id = idx
            label = st["label"]
            _set_current_step(step_id, label)
            _set_step_running(step_id)
            _append_line("")
            _append_line(f"=== Шаг {step_id}. {label} ===")

            if st["kind"] == "ota":
                fname = st["file"]
                path = files.get(fname)
                if not path or not os.path.isfile(path):
                    _set_step_error(step_id)
                    _fail(step_id, f"Не найден файл для отправки: {fname} ({path})")
                    return
                size = os.path.getsize(path)
                _append_line(f"> POST http://{ip}{UPLOAD_UPDATE_PATH}  ({fname}, {size} байт)")
                _post_file(ip, path, fname, size, timeout)
                _append_line(f"OK: {fname} записан на устройство")
            elif st["kind"] == "copy":
                _copy_fs(ip, data_dir, timeout)
                _append_line("OK: файлы FS скопированы")

            _set_step_done(step_id)
            if idx < len(steps):
                time.sleep(_BETWEEN_STEPS_DELAY)

        _append_line("")
        _append_line("=== Успех! OTA завершена ===")
        _finish_success()
    except OtaError as e:
        _set_current_error_step()
        _fail(_state["current_step"], str(e))
    except Exception as e:  # noqa: BLE001
        _append_line(f"[ota] Внутренняя ошибка: {e}")
        _fail(_state.get("current_step"), str(e))


def _set_current_step(step_id, label):
    with _state["cond"]:
        _state["current_step"] = step_id
        _state["progress"] = {"file": label, "done": 0, "total": 0}
        _state["cond"].notify_all()


def _set_current_error_step():
    sid = _state.get("current_step")
    if sid is None:
        return
    with _state["cond"]:
        for s in _state["steps"]:
            if s["id"] == sid and s["status"] == "running":
                s["status"] = "error"
        _state["cond"].notify_all()


def _set_step_running(step_id):
    with _state["cond"]:
        for s in _state["steps"]:
            if s["id"] == step_id:
                s["status"] = "running"
        _state["cond"].notify_all()


def _set_step_done(step_id):
    with _state["cond"]:
        for s in _state["steps"]:
            if s["id"] == step_id:
                s["status"] = "done"
        _state["cond"].notify_all()


def _set_step_error(step_id):
    with _state["cond"]:
        for s in _state["steps"]:
            if s["id"] == step_id:
                s["status"] = "error"
        _state["cond"].notify_all()


def _set_progress(file, done, total):
    with _state["cond"]:
        _state["progress"] = {"file": file, "done": done, "total": total}
        _state["cond"].notify_all()


# ==================== Загрузка бинарника (POST /update) ====================

def _post_file(ip, path, filename, total, timeout):
    """Отправляет один .bin файл на /update устройства (multipart).

    Стримит тело файла чанками, публикуя прогресс. Content-Length задаётся
    заранее (размер известен). При HTTP-ошибке (например 500 — недостаточно
    памяти) бросает OtaError.
    """
    boundary = "----MagicIoTmOta" + uuid.uuid4().hex
    part_head = (
        "--" + boundary + "\r\n"
        'Content-Disposition: form-data; name="' + FIELD_NAME +
        '"; filename="' + filename + '"\r\n'
        "Content-Type: application/octet-stream\r\n\r\n"
    ).encode("utf-8")
    closing = ("\r\n--" + boundary + "--\r\n").encode("utf-8")
    body_len = len(part_head) + total + len(closing)

    conn = http.client.HTTPConnection(ip, HTTP_PORT, timeout=timeout)
    try:
        conn.putrequest("POST", UPLOAD_UPDATE_PATH)
        conn.putheader("Content-Type", "multipart/form-data; boundary=" + boundary)
        conn.putheader("Content-Length", str(body_len))
        conn.endheaders()

        conn.send(part_head)
        sent = 0
        with open(path, "rb") as f:
            while True:
                chunk = f.read(_CHUNK_SIZE)
                if not chunk:
                    break
                conn.send(chunk)
                sent += len(chunk)
                _set_progress(filename, sent, total)
        conn.send(closing)
        resp = conn.getresponse()
        body = resp.read()
        if resp.status != 200:
            raise OtaError("Устройство ответило HTTP {}{}".format(
                resp.status, ": " + body[:200].decode("utf-8", "replace").strip() if body else ""))
    finally:
        try:
            conn.close()
        except Exception:  # noqa: BLE001
            pass


# ==================== Пофайловая загрузка ФС (POST /edit) ====================

def _copy_fs(ip, data_dir, timeout):
    """Копирует все файлы из data_dir (data_svelte) на устройство через /edit.

    Сначала создаёт недостающие каталоги (PUT /edit?path=/dir/), затем
    загружает каждый файл (POST /edit multipart, filename = путь от корня '/').
    """
    if not os.path.isdir(data_dir):
        raise OtaError(f"Не найден каталог data_svelte: {data_dir}")

    items = []  # (abs_path, rel_path)
    for base, _dirs, fnames in os.walk(data_dir):
        for fn in fnames:
            abs_path = os.path.join(base, fn)
            rel = os.path.relpath(abs_path, data_dir).replace("\\", "/")
            items.append((abs_path, rel))
    if not items:
        raise OtaError(f"Каталог data_svelte пуст: {data_dir}")
    items.sort(key=lambda x: x[1])

    # создаём каталоги (без ведущего '/' у самого корня)
    dirs = sorted({os.path.dirname(r) for _a, r in items if os.path.dirname(r)})
    for d in dirs:
        _ensure_edit_dir(ip, "/" + d, timeout)

    total = sum(os.path.getsize(a) for a, _r in items)
    sent = 0
    for i, (abs_path, rel) in enumerate(items, 1):
        _append_line(f"[{i}/{len(items)}] {rel}")
        _post_edit_file(ip, abs_path, "/" + rel, timeout)
        sent += os.path.getsize(abs_path)
        _set_progress(rel, sent, total)
    _append_line(f"Скопировано файлов FS: {len(items)}")


def _ensure_edit_dir(ip, dir_path, timeout):
    """Создаёт каталог dir_path (с '/') на устройстве через PUT /edit."""
    conn = http.client.HTTPConnection(ip, HTTP_PORT, timeout=timeout)
    try:
        # HTTP.arg("path") декодируется сервером, слэши в query допустимы
        conn.request("PUT", UPLOAD_EDIT_PATH + "?path=" + dir_path)
        resp = conn.getresponse()
        resp.read()
        # 400 "PATH FILE EXISTS" — каталог уже есть, это не ошибка
        if resp.status not in (200, 400):
            raise OtaError(f"Не удалось создать каталог {dir_path} (HTTP {resp.status})")
    finally:
        try:
            conn.close()
        except Exception:  # noqa: BLE001
            pass


def _post_edit_file(ip, path, filename, timeout):
    """Загружает один файл на /edit устройства (multipart). filename — '/...'."""
    boundary = "----MagicIoTmEdit" + uuid.uuid4().hex
    part_head = (
        "--" + boundary + "\r\n"
        'Content-Disposition: form-data; name="data"; filename="' + filename + '"\r\n'
        "Content-Type: application/octet-stream\r\n\r\n"
    ).encode("utf-8")
    closing = ("\r\n--" + boundary + "--\r\n").encode("utf-8")
    total = os.path.getsize(path)
    body_len = len(part_head) + total + len(closing)

    conn = http.client.HTTPConnection(ip, HTTP_PORT, timeout=timeout)
    try:
        conn.putrequest("POST", UPLOAD_EDIT_PATH)
        conn.putheader("Content-Type", "multipart/form-data; boundary=" + boundary)
        conn.putheader("Content-Length", str(body_len))
        conn.endheaders()
        conn.send(part_head)
        with open(path, "rb") as f:
            while True:
                chunk = f.read(_CHUNK_SIZE)
                if not chunk:
                    break
                conn.send(chunk)
        conn.send(closing)
        resp = conn.getresponse()
        body = resp.read()
        if resp.status != 200:
            raise OtaError("Не удалось записать {} (HTTP {}{})".format(
                filename, resp.status,
                ": " + body[:200].decode("utf-8", "replace").strip() if body else ""))
    finally:
        try:
            conn.close()
        except Exception:  # noqa: BLE001
            pass