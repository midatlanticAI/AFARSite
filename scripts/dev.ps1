Write-Host "Starting SitePro dev..."
$ErrorActionPreference = 'SilentlyContinue'
Get-Job | Remove-Job -Force
Get-Process -Name node,python -ErrorAction SilentlyContinue | Stop-Process -Force
$ErrorActionPreference = 'Continue'

$env:MONGO_URI = "mongodb://localhost:27017"
$env:MONGO_DB = "sitepro"
$env:REDIS_URI = "memory://"

Start-Job -Name api -ScriptBlock {
  Set-Location "$using:PWD" ; python -m uvicorn sitepro.main:app --reload --port 8000
} | Out-Null
Start-Sleep -Seconds 2
try { (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/healthz).Content | Out-Host } catch { Write-Warning "API not responding yet" }

Start-Job -Name web -ScriptBlock {
  Set-Location "$using:PWD\frontend" ; $env:VITE_API_URL = "http://127.0.0.1:8000" ; npm run dev
} | Out-Null

Write-Host "Dev started. API: http://127.0.0.1:8000  Web: http://localhost:5173"
Write-Host "Use 'Get-Job' to view jobs, 'Stop-Job -Name api,web' to stop."


