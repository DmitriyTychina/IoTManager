#!/usr/bin/env python3
"""
Measure firmware (flash) size of each module by building with baseline vs baseline+module,
then update about.size in each module's modinfo.json.

Usage:
  From IoTManager root:  python measure_size/measure.py [--env esp32_4mb] [--dry-run]
  From measure_size:     python measure.py [--env esp32_4mb] [--dry-run]

Size is parsed from `pio run -e ENV -t size` (text + data = program/flash). about.size in KB per env.
"""

import argparse
import fnmatch
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# IoTManager project root (parent of this script's folder)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
os.chdir(PROJECT_ROOT)

# Log styling (ANSI; disabled if not TTY or --no-color)
USE_COLOR = sys.stdout.isatty()


def style(s, color=None, bold=False):
    if not USE_COLOR or not color:
        return s
    codes = []
    if bold:
        codes.append("1")
    if color == "green":
        codes.append("32")
    elif color == "red":
        codes.append("31")
    elif color == "yellow":
        codes.append("33")
    elif color == "cyan":
        codes.append("36")
    elif color == "dim":
        codes.append("2")
    return f"\033[{';'.join(codes)}m{s}\033[0m" if codes else s


def log_section(title):
    width = 60
    line = "─" * width
    print()
    print(style(f"  {title}", "cyan", bold=True))
    print(style(line, "dim"))


def log_ok(msg):
    print(style("  ✓ ", "green") + msg)


def log_fail(msg):
    print(style("  ✗ ", "red") + msg)


def log_step(msg):
    print(style("  ● ", "yellow") + msg)


def log_info(msg):
    print(style("    ", "dim") + msg)

# Minimal module set so API.cpp and build succeed (Variable provides getAPI_Variable)
BASELINE_MODULE_PATHS = ["src/modules/virtual/Variable"]

# Default envs to measure (can override via --env)
DEFAULT_ENVS = ["esp32_4mb", "esp8266_4mb"]


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4, sort_keys=False)


def collect_modules():
    """Return list of {path, moduleName, usedLibs, modinfo_path} for each module."""
    modules = []
    for root, _, names in os.walk(PROJECT_ROOT / "src" / "modules"):
        if "modinfo.json" not in names:
            continue
        path = Path(root).relative_to(PROJECT_ROOT)
        mod_path = path.as_posix()
        info_path = PROJECT_ROOT / path / "modinfo.json"
        info = load_json(info_path)
        about = info.get("about", {})
        modules.append({
            "path": mod_path,
            "moduleName": about.get("moduleName", path.name),
            "usedLibs": about.get("usedLibs", info.get("usedLibs", {})),
            "modinfo_path": info_path,
            "modinfo": info,
        })
    return modules


def module_supports_env(used_libs, env):
    """True if env is supported by usedLibs (supports esp32*, esp82*, etc.)."""
    if not used_libs:
        return False
    for pattern in used_libs:
        if fnmatch.fnmatch(env, pattern):
            return True
    return False


def build_profile_with_modules(prof_template, active_paths, env):
    """Return a new profile dict with only given module paths active for the given env."""
    prof = json.loads(json.dumps(prof_template))
    for section, mods in prof.get("modules", {}).items():
        for m in mods:
            m["active"] = m["path"] in active_paths
    prof["projectProp"]["platformio"]["default_envs"] = env
    return prof


def run_prepare_project(profile_path, env):
    """Run PrepareProject.py -p profile -b env. Returns success."""
    cmd = [sys.executable, "PrepareProject.py", "-p", str(profile_path), "-b", env]
    r = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, timeout=120)
    if r.returncode != 0:
        print(r.stderr or r.stdout, file=sys.stderr)
    return r.returncode == 0


def get_size_from_output(env):
    """
    Run `pio run -e ENV -t size` and parse program size = text + data (flash, bytes).
    Returns int or None on failure.
    """
    cmd = ["pio", "run", "-e", env, "-t", "size"]
    r = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, timeout=600)
    out = (r.stdout or "") + (r.stderr or "")
    if r.returncode != 0:
        return None
    # Standard: "  text   data    bss    dec   hex  filename" then line with firmware.elf
    for line in out.split("\n"):
        if "firmware.elf" in line:
            parts = line.split()
            if len(parts) >= 3:
                try:
                    text = int(parts[0])
                    data = int(parts[1])
                    return text + data  # program (flash) size
                except (ValueError, IndexError):
                    pass
    # Fallback: "Flash: ... (used XXXXX bytes ...)"
    match = re.search(r"used\s+(\d+)\s+bytes", out)
    if match:
        return int(match.group(1))
    return None


def main():
    global USE_COLOR
    ap = argparse.ArgumentParser(description="Measure module firmware size and update about.size in modinfo.json")
    ap.add_argument("--env", action="append", default=[], help="Platform env (e.g. esp32_4mb). Can repeat.")
    ap.add_argument("--profile", default="myProfile.json", help="Profile to use as template")
    ap.add_argument("--dry-run", action="store_true", help="Only list modules and envs, do not build")
    ap.add_argument("--no-color", action="store_true", help="Disable colored output")
    args = ap.parse_args()
    if args.no_color:
        USE_COLOR = False
    envs = args.env if args.env else DEFAULT_ENVS

    profile_path = PROJECT_ROOT / args.profile
    if not profile_path.is_file():
        profile_path = PROJECT_ROOT / "compilerProfile.json"
    if not profile_path.is_file():
        log_fail("Profile not found: myProfile.json or compilerProfile.json")
        sys.exit(1)

    prof_template = load_json(profile_path)
    modules = collect_modules()
    baseline_paths = set(BASELINE_MODULE_PATHS)
    modules_by_env = {e: [m for m in modules if module_supports_env(m["usedLibs"], e)] for e in envs}

    if args.dry_run:
        log_section("Dry run — modules per env")
        for e in envs:
            log_ok(f"{e}: {len(modules_by_env[e])} modules")
        log_info("Sample modules:")
        for m in modules[:5]:
            log_info(f"{m['path']} → {m['moduleName']}")
        print()
        return

    log_section("Measure module firmware size")
    log_step(f"Profile: {profile_path.name}")
    log_step(f"Envs: {', '.join(envs)}")
    total_modules = sum(len(modules_by_env[e]) for e in envs)
    log_step(f"Total builds: baseline×{len(envs)} + {total_modules} module builds")

    platformio_ini = PROJECT_ROOT / "platformio.ini"
    platformio_backup = PROJECT_ROOT / "platformio.ini.ram_measure.bak"
    shutil.copy(platformio_ini, platformio_backup)

    try:
        baseline_size = {}
        log_section("Baseline build (Variable only)")
        for env in envs:
            prof = build_profile_with_modules(prof_template, baseline_paths, env)
            with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
                save_json(f.name, prof)
                ok = run_prepare_project(f.name, env)
                os.unlink(f.name)
            if not ok:
                log_fail(f"PrepareProject failed for baseline env={env}")
                continue
            size = get_size_from_output(env)
            if size is None:
                log_fail(f"Could not get size for baseline env={env}")
                continue
            baseline_size[env] = size
            log_ok(f"{env}: {size:,} bytes ({size // 1024} KB)")

        results = {}
        for mod in modules:
            results[mod["modinfo_path"]] = {}

        idx = 0
        for env in envs:
            log_section(f"Measuring modules — {env}")
            mods = modules_by_env[env]
            for i, mod in enumerate(mods):
                idx += 1
                active_paths = baseline_paths | {mod["path"]}
                prof = build_profile_with_modules(prof_template, active_paths, env)
                with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
                    save_json(f.name, prof)
                    ok = run_prepare_project(f.name, env)
                    tf = f.name
                if not ok:
                    log_fail(f"[{idx}/{total_modules}] {mod['moduleName']} — PrepareProject failed")
                    continue
                size = get_size_from_output(env)
                os.unlink(tf)
                if size is None:
                    log_fail(f"[{idx}/{total_modules}] {mod['moduleName']} — size parse failed")
                    continue
                delta = size - baseline_size.get(env, 0)
                size_kb = max(0, round(delta / 1024))
                results[mod["modinfo_path"]][env] = size_kb
                log_ok(f"[{idx}/{total_modules}] {mod['moduleName']}: +{delta:,} B → {size_kb} KB")

        updated = 0
        log_section("Updating modinfo.json")
        for modinfo_path, env_size in results.items():
            if not env_size:
                continue
            info = load_json(modinfo_path)
            about = info.setdefault("about", {})
            if "size" not in about:
                about["size"] = {}
            current = about["size"]
            if isinstance(current, dict):
                current.update(env_size)
            else:
                about["size"] = env_size
            save_json(modinfo_path, info)
            rel = modinfo_path.relative_to(PROJECT_ROOT)
            log_ok(f"{rel}: {env_size}")
            updated += 1

        log_section("Summary")
        log_ok(f"Modinfo files updated: {updated}")
        log_ok("platformio.ini restored.")

    finally:
        shutil.copy(platformio_backup, platformio_ini)
        platformio_backup.unlink(missing_ok=True)
    print()


if __name__ == "__main__":
    main()
