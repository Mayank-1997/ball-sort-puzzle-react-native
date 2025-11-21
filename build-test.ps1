# Ball Sort Puzzle - Build and Test Scripts
# React Native Android Build and Testing Commands

# Development Commands
Write-Host "🎮 Ball Sort Puzzle - Build and Test Scripts" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Function to check prerequisites
function Test-Prerequisites {
    Write-Host "`n🔍 Checking Prerequisites..." -ForegroundColor Yellow
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js not found. Please install Node.js" -ForegroundColor Red
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ npm not found" -ForegroundColor Red
        return $false
    }
    
    # Check Java
    try {
        $javaVersion = java -version 2>&1 | Select-String "version"
        Write-Host "✅ Java: $javaVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Java not found. Please install Java JDK 17+" -ForegroundColor Red
        return $false
    }
    
    # Check Android SDK
    if ($env:ANDROID_HOME) {
        Write-Host "✅ Android SDK: $env:ANDROID_HOME" -ForegroundColor Green
    } else {
        Write-Host "❌ ANDROID_HOME not set. Please install Android SDK" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "`n📦 Installing Dependencies..." -ForegroundColor Yellow
    
    try {
        npm install
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        return $false
    }
}

# Function to start Metro bundler
function Start-Metro {
    Write-Host "`n🚀 Starting Metro Bundler..." -ForegroundColor Yellow
    
    try {
        Start-Process -FilePath "npx" -ArgumentList "react-native", "start", "--reset-cache" -NoNewWindow
        Write-Host "✅ Metro bundler started" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to start Metro bundler" -ForegroundColor Red
        return $false
    }
}

# Function to build Android debug APK
function Build-AndroidDebug {
    Write-Host "`n🔨 Building Android Debug APK..." -ForegroundColor Yellow
    
    try {
        Set-Location "android"
        .\gradlew assembleDebug
        Set-Location ".."
        
        Write-Host "✅ Android Debug APK built successfully" -ForegroundColor Green
        Write-Host "📱 APK Location: android/app/build/outputs/apk/debug/" -ForegroundColor Cyan
        return $true
    } catch {
        Write-Host "❌ Failed to build Android Debug APK" -ForegroundColor Red
        Set-Location ".."
        return $false
    }
}

# Function to build Android release APK
function Build-AndroidRelease {
    Write-Host "`n🔨 Building Android Release APK..." -ForegroundColor Yellow
    
    try {
        Set-Location "android"
        .\gradlew assembleRelease
        Set-Location ".."
        
        Write-Host "✅ Android Release APK built successfully" -ForegroundColor Green
        Write-Host "📱 APK Location: android/app/build/outputs/apk/release/" -ForegroundColor Cyan
        return $true
    } catch {
        Write-Host "❌ Failed to build Android Release APK" -ForegroundColor Red
        Set-Location ".."
        return $false
    }
}

# Function to run tests
function Run-Tests {
    Write-Host "`n🧪 Running Tests..." -ForegroundColor Yellow
    
    try {
        npm test
        Write-Host "✅ Tests completed successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Tests failed" -ForegroundColor Red
        return $false
    }
}

# Function to clean build artifacts
function Clean-Build {
    Write-Host "`n🧹 Cleaning Build Artifacts..." -ForegroundColor Yellow
    
    try {
        # Clean npm cache
        npm cache clean --force
        
        # Clean Metro cache
        npx react-native start --reset-cache &
        Start-Sleep -Seconds 2
        Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
        
        # Clean Android build
        Set-Location "android"
        .\gradlew clean
        Set-Location ".."
        
        # Clean node_modules
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
        
        Write-Host "✅ Build artifacts cleaned successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to clean build artifacts" -ForegroundColor Red
        Set-Location ".."
        return $false
    }
}

# Main execution
Write-Host "`n🎯 Select an option:" -ForegroundColor Cyan
Write-Host "1. Check Prerequisites" -ForegroundColor White
Write-Host "2. Install Dependencies" -ForegroundColor White
Write-Host "3. Start Metro Bundler" -ForegroundColor White
Write-Host "4. Build Android Debug" -ForegroundColor White
Write-Host "5. Build Android Release" -ForegroundColor White
Write-Host "6. Run Tests" -ForegroundColor White
Write-Host "7. Clean Build" -ForegroundColor White
Write-Host "8. Full Development Setup (1,2,3)" -ForegroundColor White
Write-Host "9. Full Build Test (1,2,4)" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1-9)"

switch ($choice) {
    "1" { Test-Prerequisites }
    "2" { Install-Dependencies }
    "3" { Start-Metro }
    "4" { Build-AndroidDebug }
    "5" { Build-AndroidRelease }
    "6" { Run-Tests }
    "7" { Clean-Build }
    "8" { 
        if (Test-Prerequisites -and Install-Dependencies) {
            Start-Metro
        }
    }
    "9" {
        if (Test-Prerequisites -and Install-Dependencies) {
            Build-AndroidDebug
        }
    }
    default { Write-Host "❌ Invalid choice" -ForegroundColor Red }
}

Write-Host "`n🎮 Script completed!" -ForegroundColor Green