@echo off
title Push LuxeStay to GitHub
echo ===================================================
echo     Push LuxeStay Project to GitHub
echo ===================================================
echo.
set "PATH=C:\Users\himan\AppData\Local\Programs\Git\cmd;%PATH%"

echo Checking GitHub CLI login status...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Please log in to GitHub:
    gh auth login --web -h github.com
)

echo.
echo Creating repository 'luxestay-hotel-booking' and pushing...
gh repo create luxestay-hotel-booking --public --source=. --remote=origin --push

echo.
echo ===================================================
echo Done! Your repository is live on GitHub.
echo ===================================================
pause

