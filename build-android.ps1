# Build and Install Script for Ball Sort Puzzle
# Handles directory creation bug automatically

Write-Host "🔧 Setting up build directories..." -ForegroundColor Cyan

# Create all required directories
$directories = @(
    "android\app\build\generated\assets\createBundleFreeDebugJsAndAssets\assets",
    "android\app\build\generated\sourcemaps\react\freeDebug\assets",
    "android\app\build\generated\res\react\freeDebug"
)

foreach ($dir in $directories) {
    New-Item -Path $dir -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
}

Write-Host "✅ Directories created!" -ForegroundColor Green

# Check if Metro is running
Write-Host "🔍 Checking Metro bundler..." -ForegroundColor Cyan
$metroRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*Metro*" }

if (-not $metroRunning) {
    Write-Host "⚠️  Metro not running. Starting Metro in background..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx react-native start --reset-cache"
    Write-Host "⏳ Waiting 15 seconds for Metro to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

Write-Host "🔨 Building and installing app..." -ForegroundColor Cyan
cd android
.\gradlew installFreeDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ App installed successfully!" -ForegroundColor Green
    Write-Host "`n📱 Launch the app:" -ForegroundColor Cyan
    Write-Host "   1. Look at your emulator" -ForegroundColor White
    Write-Host "   2. Swipe up to open app drawer" -ForegroundColor White
    Write-Host "   3. Find 'Ball Sort Puzzle'" -ForegroundColor White
    Write-Host "   4. Tap to open`n" -ForegroundColor White
} else {
    Write-Host "`n❌ Build failed! Check errors above." -ForegroundColor Red
}

cd ..