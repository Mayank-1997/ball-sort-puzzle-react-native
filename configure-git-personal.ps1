# Configure Git for Personal Account (This Repository Only)
# Date: December 26, 2025

Write-Host "🔧 Configuring Git for personal GitHub account..." -ForegroundColor Cyan

# Set local Git config (only for this repository)
git config --local user.name "Mayank-1997"
git config --local user.email "cu.16bcs1107@gmail.com"

# Set remote URL to HTTPS
git remote set-url origin https://github.com/Mayank-1997/ball-sort-puzzle-react-native.git

# Verify configuration
Write-Host "`n✅ Git Configuration:" -ForegroundColor Green
Write-Host "Name:  " -NoNewline; git config user.name
Write-Host "Email: " -NoNewline; git config user.email
Write-Host "`nRemote URL:" -ForegroundColor Green
git remote -v

Write-Host "`n📝 Note: This configuration is LOCAL to this repository only." -ForegroundColor Yellow
Write-Host "Your global Git config (corporate account) remains unchanged.`n" -ForegroundColor Yellow

# Check if there are commits to push
$status = git status --porcelain
$unpushed = git log origin/main..HEAD --oneline 2>$null

if ($unpushed) {
    Write-Host "📤 You have unpushed commits:" -ForegroundColor Cyan
    git log origin/main..HEAD --oneline
    Write-Host "`nRun this command to push:" -ForegroundColor Green
    Write-Host "git push origin main" -ForegroundColor White
} else {
    Write-Host "✅ All commits are pushed!" -ForegroundColor Green
}
