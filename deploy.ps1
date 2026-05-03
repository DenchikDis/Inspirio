Write-Host "Deploying to Vercel..." -ForegroundColor Green
Write-Host ""

# Check if vercel is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if ($vercelInstalled) {
    Write-Host "Using global Vercel CLI..." -ForegroundColor Cyan
    vercel --prod
} else {
    Write-Host "Vercel CLI not found globally, using npx..." -ForegroundColor Yellow
    npx --yes vercel --prod
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deployment successful!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Deployment failed. Please check the error messages above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
