@echo off
chcp 65001 >nul
title magicIoTm - Stop
cd /d "%~dp0"
echo Stopping magicIoTm...

rem [1] Kill ONLY the python process launched from this folder (app.py).
rem     Do NOT kill other python processes on the system.
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*%~dp0*app.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

rem [2] Close the OLD server window (cmd running run.bat) by its title.
rem     Without this the cmd stays open hanging on 'pause' after python is killed.
powershell -NoProfile -Command "Get-Process | Where-Object { $_.MainWindowTitle -like 'magicIoTm - Configurator*' } | Stop-Process -Force -ErrorAction SilentlyContinue"

rem [3] Make sure nothing still listens on the server port (5005) before restart.
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 5005 -State Listen -ErrorAction SilentlyContinue; if ($c) { $c.OwningProcess | Select-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }"

timeout /t 2 >nul
exit /b