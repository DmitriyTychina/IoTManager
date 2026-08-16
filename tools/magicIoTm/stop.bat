@echo off
chcp 65001 >nul
title magicIoTm - Stop
cd /d "%~dp0"
echo Stopping magicIoTm...
powershell -Command "Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force"
echo Server stopped.
timeout /t 2 >nul
exit