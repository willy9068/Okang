@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo Starting the dialogue/UI editor...
python tools\editor_server.py
if errorlevel 1 (
  echo.
  echo Python is needed. Install Python 3 and try again.
)
pause
