@echo off
title Fixture del Mundial 2026 - Rodrigo Antunez
echo =======================================================
echo   Iniciando Fixture del Mundial 2026 de Rodrigo Antunez
echo =======================================================
echo.
echo 1. Instalando dependencias de desarrollo...
call npm install
echo.
echo 2. Iniciando servidor local...
echo Abriendo navegador en http://localhost:5173/
start http://localhost:5173/
echo.
call npm run dev
pause
