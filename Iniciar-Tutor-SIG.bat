@echo off
:: Doble clic para iniciar Tutor-SIG en modo local (invoca Tutor-SIG.ps1 sin restricciones de politica de ejecucion)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Tutor-SIG.ps1"
