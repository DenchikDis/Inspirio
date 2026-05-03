Write-Host "Starting local server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Main page: http://localhost:3000/Page/index.html" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start server in background
$job = Start-Job -ScriptBlock {
    Set-Location "$using:PWD"
    npx --yes serve . -l 3000 --no-clipboard
}

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open Chrome
Write-Host "Opening Chrome browser..." -ForegroundColor Green
$chromePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromeFound = $false
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        Start-Process $path "http://localhost:3000/Page/index.html"
        $chromeFound = $true
        break
    }
}

if (-not $chromeFound) {
    Start-Process "http://localhost:3000/Page/index.html"
}

# Keep script running and show job output
Write-Host ""
Write-Host "Server is running. Press Ctrl+C to stop." -ForegroundColor Green
try {
    Receive-Job -Job $job -Wait
} finally {
    Stop-Job -Job $job
    Remove-Job -Job $job
}
