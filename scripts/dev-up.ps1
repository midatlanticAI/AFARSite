Param(
  [switch]$Seed
)

Write-Host "Starting SitePro dev stack..."

# Kill stray dev processes (safe for local dev)
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start API
if (-not $env:MONGO_URI) { $env:MONGO_URI = "mongodb://localhost:27017" }
if (-not $env:MONGO_DB) { $env:MONGO_DB = "sitepro" }
$env:REDIS_URI = "memory://"

Write-Host "Launching API on http://127.0.0.1:8000 ..."
Start-Job -Name sitepro_api -ScriptBlock {
  Set-Location "$using:PSScriptRoot\.." ;
  $env:MONGO_URI = $env:MONGO_URI ;
  $env:MONGO_DB = $env:MONGO_DB ;
  $env:REDIS_URI = "memory://" ;
  python -m uvicorn sitepro.main:app --reload --port 8000
} | Out-Null

# Wait for API
$ok = $false
for ($i=0; $i -lt 30; $i++) {
  try { $r = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/healthz -TimeoutSec 2 ; if ($r.StatusCode -eq 200) { $ok = $true ; break } } catch { Start-Sleep -Seconds 1 }
}
if (-not $ok) { Write-Warning "API health check failed. Continuing anyway..." }

if ($Seed) {
  & "$PSScriptRoot/seed.ps1"
}

# Start Vite dev server
Write-Host "Launching frontend on http://localhost:5173 ..."
Start-Job -Name sitepro_web -ScriptBlock {
  Set-Location "$using:PSScriptRoot\..\frontend" ;
  $env:VITE_API_URL = "http://127.0.0.1:8000" ;
  $env:VITE_DEMO = "0" ;
  npm run dev
} | Out-Null

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173/login"
Write-Host "Dev stack started. API: http://127.0.0.1:8000 | Web: http://localhost:5173"


