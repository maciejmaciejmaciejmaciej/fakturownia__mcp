@echo off
echo.
echo Checking Git Setup for Fakturownia MCP Server...
echo.

rem Check if Git is installed
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Git is installed
    git --version
) else (
    echo ✗ Git is not installed!
    echo Please download Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo.

rem Check if we're in a Git repository
if exist ".git" (
    echo ✓ Git repository detected
) else (
    echo ✗ Not a Git repository
    echo Initializing Git repository...
    git init
    echo ✓ Git repository initialized
)

echo.

rem Check Git configuration
for /f "tokens=*" %%i in ('git config user.name 2^>nul') do set gituser=%%i
for /f "tokens=*" %%i in ('git config user.email 2^>nul') do set gitemail=%%i

if defined gituser if defined gitemail (
    echo ✓ Git user configured: %gituser% [%gitemail%]
) else (
    echo ! Git user not configured
    echo Please configure Git with your details:
    echo    git config --global user.name "Your Name"
    echo    git config --global user.email "your.email@example.com"
)

echo.

rem Check for remote origin
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Remote origin configured
    git remote get-url origin
) else (
    echo ! No remote origin configured
    echo You'll need to add GitHub remote after creating repository:
    echo    git remote add origin https://github.com/YOUR_USERNAME/fakturownia-mcp-server.git
)

echo.
echo Git Status:
git status --short 2>nul

echo.
echo Next Steps:
echo 1. Create repository on GitHub: https://github.com/new
echo 2. Add remote origin (if not already done)
echo 3. Add and commit files: git add . ^&^& git commit -m "Initial commit"
echo 4. Push to GitHub: git push -u origin main
echo 5. Deploy to Netlify: https://app.netlify.com
echo.
echo Ready to deploy your Fakturownia MCP Server!
echo.
pause
