# Android Build Script for Ball Sort Puzzle
# This script attempts to build the Android APK without Android Studio

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ball Sort Puzzle - Android Build     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Prerequisites
Write-Host "[1/6] Checking Prerequisites..." -ForegroundColor Yellow

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "  ✓ Java: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Java not found. Please install JDK 17 or higher." -ForegroundColor Red
    exit 1
}

# Check Node
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found." -ForegroundColor Red
    exit 1
}

# Step 2: Install Dependencies
Write-Host "`n[2/6] Checking npm dependencies..." -ForegroundColor Yellow
if (-not (Test-Path ".\node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "  ✓ Dependencies already installed" -ForegroundColor Green
}

# Step 3: Clean previous builds
Write-Host "`n[3/6] Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".\android\app\build") {
    Remove-Item ".\android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleaned app build directory" -ForegroundColor Green
}
if (Test-Path ".\android\build") {
    Remove-Item ".\android\build" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cleaned project build directory" -ForegroundColor Green
}

# Step 4: Check for Android SDK
Write-Host "`n[4/6] Checking Android SDK..." -ForegroundColor Yellow
$sdkLocations = @(
    "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk",
    "C:\Android\Sdk",
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT
)

$sdkFound = $false
foreach ($location in $sdkLocations) {
    if ($location -and (Test-Path $location)) {
        Write-Host "  ✓ Android SDK found at: $location" -ForegroundColor Green
        $env:ANDROID_HOME = $location
        $env:ANDROID_SDK_ROOT = $location
        $sdkFound = $true
        break
    }
}

if (-not $sdkFound) {
    Write-Host "  ⚠ Android SDK not found!" -ForegroundColor Red
    Write-Host "  You need to install either:" -ForegroundColor Yellow
    Write-Host "    1. Android Studio (includes SDK)" -ForegroundColor Yellow
    Write-Host "    2. Standalone Android SDK Command Line Tools" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  The build may fail without Android SDK." -ForegroundColor Red
    Write-Host "  Continue anyway? (Y/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        exit 1
    }
}

# Step 5: Build APK
Write-Host "`n[5/6] Building Android APK..." -ForegroundColor Yellow
Write-Host "  This may take several minutes..." -ForegroundColor Cyan
Write-Host ""

$buildStartTime = Get-Date

try {
    # Run gradle build with increased timeouts
    & .\android\gradlew.bat `
        --no-daemon `
        -Dorg.gradle.internal.http.connectionTimeout=120000 `
        -Dorg.gradle.internal.http.socketTimeout=120000 `
        -p android `
        assembleDebug
    
    $buildEndTime = Get-Date
    $buildDuration = $buildEndTime - $buildStartTime
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  Build time: $($buildDuration.Minutes)m $($buildDuration.Seconds)s" -ForegroundColor Cyan
        
        # Step 6: Locate the APK
        Write-Host "`n[6/6] Locating APK file..." -ForegroundColor Yellow
        $apkPath = ".\android\app\build\outputs\apk\debug\app-debug.apk"
        
        if (Test-Path $apkPath) {
            $apkSize = (Get-Item $apkPath).Length / 1MB
            Write-Host "  ✓ APK Location: $apkPath" -ForegroundColor Green
            Write-Host "  ✓ APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Green
            Write-Host ""
            Write-Host "You can now:" -ForegroundColor Cyan
            Write-Host "  1. Install on device: adb install $apkPath" -ForegroundColor White
            Write-Host "  2. Copy APK to another computer" -ForegroundColor White
            Write-Host "  3. Commit source code changes to Git (don't commit APK)" -ForegroundColor White
        } else {
            Write-Host "  ⚠ APK not found at expected location" -ForegroundColor Yellow
        }
    } else {
        throw "Gradle build failed with exit code $LASTEXITCODE"
    }
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ BUILD FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "  1. Install Android Studio from: https://developer.android.com/studio" -ForegroundColor White
    Write-Host "  2. Ensure ANDROID_HOME environment variable is set" -ForegroundColor White
    Write-Host "  3. Try building from Android Studio: File > Open > android folder" -ForegroundColor White
    exit 1
}

Write-Host ""
