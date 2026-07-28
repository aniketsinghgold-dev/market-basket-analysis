@echo off
echo ==============================================================
echo  Market Basket Intelligence Platform - Launching Platform
echo ==============================================================

start "FastAPI Python Backend Engine" cmd /k "cd /d "%~dp0" && .\venv\Scripts\python backend\main.py"
start "Vite Web Application Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo FastAPI Backend running at: http://127.0.0.1:8000
echo Frontend Web App running at: http://localhost:3000
echo ==============================================================
