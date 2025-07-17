# Git Setup Check Script for Fakturownia MCP Server

Write-Host "Checking Git Setup..." -ForegroundColor Cyan

# Check if Git is installed
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "Git is installed: $gitVersion" -ForegroundColor Green
    } else {
        throw "Git not found"
    }
} catch {
    Write-Host "Git is not installed!" -ForegroundColor Red
    Write-Host "Please download Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a Git repository
if (Test-Path ".git") {
    Write-Host "Git repository detected" -ForegroundColor Green
} else {
    Write-Host "Not a Git repository" -ForegroundColor Red
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git repository initialized" -ForegroundColor Green
}

# Check Git configuration
try {
    $gitUser = git config user.name 2>$null
    $gitEmail = git config user.email 2>$null

    if ($gitUser -and $gitEmail) {
        Write-Host "Git user configured: $gitUser [$gitEmail]" -ForegroundColor Green
    } else {
        Write-Host "Git user not configured" -ForegroundColor Yellow
        Write-Host "Please configure Git with your details:" -ForegroundColor Yellow
        Write-Host "   git config --global user.name 'Your Name'" -ForegroundColor Gray
        Write-Host "   git config --global user.email 'your.email@example.com'" -ForegroundColor Gray
    }
} catch {
    Write-Host "Could not check Git configuration" -ForegroundColor Red
}

# Check current branch
try {
    $currentBranch = git branch --show-current 2>$null
    if ($currentBranch) {
        Write-Host "Current branch: $currentBranch" -ForegroundColor Green
    } else {
        Write-Host "No commits yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not get current branch" -ForegroundColor Red
}

# Check for remote origin
try {
    $remoteUrl = git remote get-url origin 2>$null
    if ($remoteUrl) {
        Write-Host "Remote origin configured: $remoteUrl" -ForegroundColor Green
    } else {
        Write-Host "No remote origin configured" -ForegroundColor Yellow
        Write-Host "You'll need to add GitHub remote after creating repository:" -ForegroundColor Yellow
        Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/fakturownia-mcp-server.git" -ForegroundColor Gray
    }
} catch {
    Write-Host "No remote origin configured" -ForegroundColor Yellow
    Write-Host "You'll need to add GitHub remote after creating repository:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/fakturownia-mcp-server.git" -ForegroundColor Gray
}

# Check status
Write-Host ""
Write-Host "Git Status:" -ForegroundColor Cyan
try {
    git status --short
} catch {
    Write-Host "Unable to get git status" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create repository on GitHub: https://github.com/new" -ForegroundColor White
Write-Host "2. Add remote origin (if not already done)" -ForegroundColor White
Write-Host "3. Add and commit files: git add . && git commit -m ""Initial commit""" -ForegroundColor White
Write-Host "4. Push to GitHub: git push -u origin main" -ForegroundColor White
Write-Host "5. Deploy to Netlify: https://app.netlify.com" -ForegroundColor White

Write-Host ""
Write-Host "Ready to deploy your Fakturownia MCP Server!" -ForegroundColor Green
