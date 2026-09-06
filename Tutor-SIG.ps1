# Tutor-SIG.ps1 — Lanzador local del copiloto docente (Universidad CESMAG)
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File .\Tutor-SIG.ps1
#      (o doble clic en Iniciar-Tutor-SIG.bat)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "  =============================================" -ForegroundColor DarkBlue
Write-Host "    Tutor-SIG  |  Universidad CESMAG" -ForegroundColor Yellow
Write-Host "  =============================================" -ForegroundColor DarkBlue
Write-Host ""

# 1. Verificar Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  [ERROR] Node.js no esta instalado o no esta en el PATH." -ForegroundColor Red
    Write-Host "          Instalalo desde https://nodejs.org y vuelve a intentar." -ForegroundColor Red
    Read-Host "  Presiona Enter para salir"
    exit 1
}

# 2. Crear .env en la primera ejecucion
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  [AVISO] Se creo .env a partir de .env.example." -ForegroundColor Yellow
    Write-Host "          Abrelo y pega tu OPENROUTER_API_KEY para que el chat responda." -ForegroundColor Yellow
    Write-Host ""
}

# 3. Instalar dependencias si faltan
if (-not (Test-Path "node_modules")) {
    Write-Host "  Primera ejecucion: instalando dependencias..." -ForegroundColor Cyan
    & npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Fallo la instalacion de dependencias." -ForegroundColor Red
        Read-Host "  Presiona Enter para salir"
        exit 1
    }
}

# 4. Si ya hay una instancia corriendo, solo abrir el navegador
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "  Tutor-SIG ya esta corriendo en http://localhost:3000" -ForegroundColor Yellow
    Write-Host "  Abriendo el navegador..." -ForegroundColor Yellow
    Start-Process "http://localhost:3000"
    Read-Host "  Presiona Enter para cerrar"
    exit 0
} catch {
    # Puerto libre: continuar con el arranque normal
}

# 5. Abrir el navegador y arrancar el servidor (Vite + Express en modo desarrollo)
Write-Host "  Iniciando Tutor-SIG en http://localhost:3000 ..." -ForegroundColor Green
Write-Host "  (cierra esta ventana para detener el servidor)" -ForegroundColor DarkGray
Write-Host ""

Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

& npm run dev

Write-Host ""
Write-Host "  Servidor detenido." -ForegroundColor DarkGray
Read-Host "  Presiona Enter para cerrar"
