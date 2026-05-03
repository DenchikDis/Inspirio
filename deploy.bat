@echo off
echo Deploying to Vercel...
echo.

REM Check if vercel is installed globally
where vercel >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using global Vercel CLI...
    vercel --prod
) else (
    echo Vercel CLI not found globally, using npx...
    npx --yes vercel --prod
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Deployment successful!
) else (
    echo.
    echo Deployment failed. Please check the error messages above.
    pause
)
