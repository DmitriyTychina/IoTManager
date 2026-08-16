@echo off
chcp 65001 >nul
title magicIoTm - Restart
cd /d "%~dp0"
echo Restarting magicIoTm...
powershell -Command "Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.Path -like '*python*'} | Stop-Process -Force"
timeout /t 2 >nul
start "" "%~dp0run.bat"