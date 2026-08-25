"""
Запуск измерения размеров модулей (measure_size/measure.py) в фоновом потоке.

Модуль управляет состоянием замера (лог, результат), потоковым запуском
subprocess и отдачей событий по SSE — аналогично utils/build.py.

measure.py выполняет собственную файловую логировку и восстановление
platformio.ini, поэтому здесь достаточно запустить его как subprocess
и транслировать stdout построчно в события лога.

Запуск:
    measure_run.start(cfg)
    for chunk in measure_run.event_stream(): ...
"""

import os
import re
import json
import sys
import threading
import subprocess

_ANSI_RE = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")

_state = {
    "running": False,
    "success": None,          # None — не завершено, True/False — результат
    "lines": [],              # накопленный лог (без ANSI)
    "error": None,
    "label": "",
    "cond": threading.Condition(),
}

_lock = threading.Lock()


def _reset_state(label=""):
    with _state["cond"]:
        _state.update({
            "running": False,
            "success": None,
            "lines": [],
            "error": None,
            "label": label,
        })
        _state["cond"].notify_all()


def _append_line(text):
    text = _ANSI_RE.sub("", text).rstrip("\r\n")
    with _state["cond"]:
        _state["lines"].append(text)
        _state["cond"].notify_all()


def _set_running(flag):
    with _state["cond"]:
        _state["running"] = flag
        _state["cond"].notify_all()


def is_running():
    with _state["cond"]:
        return _state["running"]


def get_status():
    """Снимок состояния для отображения."""
    with _state["cond"]:
        return {
            "running": _state["running"],
            "success": _state["success"],
            "error": _state["error"],
            "label": _state["label"],
        }


def start(cfg):
    """Запуск замера в фоне.

    cfg — dict:
      script   — абсолютный путь к measure.py
      args     — список аргументов CLI (--env, --mode, --baseline, --module, ...)
      cwd      — рабочая директория (PROJECT_ROOT)
      label    — текстовая подпись (например, «Проект / Модуль»)
    """
    with _lock:
        if _state["running"]:
            return False
        _reset_state(cfg.get("label", ""))
        _set_running(True)
    t = threading.Thread(target=_worker, args=(cfg,), daemon=True)
    t.start()
    return True


def event_stream():
    """Генератор SSE-событий замера: log, done/error, finish."""
    idx = 0
    done_sent = False
    while True:
        with _state["cond"]:
            while idx < len(_state["lines"]):
                yield _sse("log", {"text": _state["lines"][idx]})
                idx += 1
            finished = not _state["running"]
            if finished and not done_sent:
                done_sent = True
                if _state["success"]:
                    yield _sse("done", {})
                else:
                    yield _sse("error", {"error": _state["error"]})
                yield _sse("finish", {})
            if finished:
                break
            _state["cond"].wait(timeout=1.0)


def _sse(event, data):
    return "event: {}\ndata: {}\n\n".format(event, json.dumps(data, ensure_ascii=False))


def _worker(cfg):
    script = cfg.get("script", "")
    args = cfg.get("args", []) or []
    cwd = cfg.get("cwd", os.getcwd())
    cmd = [sys.executable, script] + list(args)
    try:
        _append_line("Замер размера модулей: " + cfg.get("label", ""))
        _append_line("> " + " ".join(cmd))
        # Принудительно включаем UTF-8 у дочернего процесса: measure.py выводит
        # юникод-символы (✓/✗), которые при pipe в Windows могут кодироваться в cp1251.
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "utf-8"
        env["PYTHONUTF8"] = "1"
        p = subprocess.Popen(
            cmd,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
            env=env,
        )
        for raw in iter(p.stdout.readline, ""):
            _append_line(raw)
        p.stdout.close()
        rc = p.wait()
        if rc == 0:
            with _state["cond"]:
                _state["success"] = True
                _state["running"] = False
                _state["cond"].notify_all()
        else:
            with _state["cond"]:
                _state["success"] = False
                _state["error"] = f"Скрипт завершился с кодом {rc}"
                _state["running"] = False
                _state["cond"].notify_all()
    except FileNotFoundError as e:
        _append_line(f"[measure] Не удалось запустить команду: {e}")
        _fail(str(e))
    except Exception as e:  # noqa: BLE001
        _append_line(f"[measure] Внутренняя ошибка: {e}")
        _fail(str(e))


def _fail(message):
    with _state["cond"]:
        _state["success"] = False
        _state["error"] = message
        _state["running"] = False
        _state["cond"].notify_all()