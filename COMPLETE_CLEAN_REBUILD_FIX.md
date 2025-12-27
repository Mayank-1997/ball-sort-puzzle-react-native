# COMPLETE CLEAN REBUILD - AsyncStorage Missing from Autolinking

## Problem Identified

Your logs show AsyncStorage is **completely missing** from React Native's autolinking configuration:

```
Error: [@RNC/AsyncStorage]: NativeModule: AsyncStorage is null.
Invariant Violation: "BallSortPuzzle" has not been registered.
```

Running `npx react-native config` shows all other modules (react-native-sound, react-native-screens, etc.) **BUT NOT AsyncStorage**.

This means:
- ✅ AsyncStorage is in package.json  
- ✅ AsyncStorage is downloaded in node_modules
- ✅ AsyncStorage has proper codegenConfig
- ❌ **React Native CLI is NOT detecting it for autolinking**

## Root Cause

This happens when:
1. node_modules installed on different OS/Node version
2. Symlinks corrupted during folder copy/transfer
3. Gradle cache pointing to old/wrong module paths
4. Metro cache conflict with Gradle codegen

## Complete Fix (Run on Other Laptop)

### Step 1: NUCLEAR CLEAN
```powershell
# Navigate to project
cd C:\Users\91858\Desktop\game-react-native\ball-sort-puzzle-react-native

# Stop all Metro instances
# Press Ctrl+C in all Metro terminals

# Uninstall ALL app variants
adb uninstall com.ballsortpuzzle
adb uninstall com.ballsortpuzzle.premium
```

### Step 2: DELETE EVERYTHING
```powershell
# Delete node_modules COMPLETELY
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Delete ALL Android build artifacts
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue

# Delete Gradle cache (IMPORTANT!)
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:USERPROFILE\.gradle\wrapper" -Recurse -Force -ErrorAction SilentlyContinue

# Delete Metro cache
Remove-Item -Path "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\react-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\haste-map-*" -Recurse -Force -ErrorAction SilentlyContinue

# Delete React Native codegen cache
Remove-Item -Path "$env:APPDATA\Metro" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 3: REINSTALL FRESH
```powershell
# Install npm packages fresh
npm install

# Verify AsyncStorage is installed
Test-Path "node_modules\@react-native-async-storage\async-storage\android"
# Should show: True

# Verify autolinking can see it
npx react-native config | Select-String "async-storage" -Context 5,5
# Should show async-storage configuration
```

### Step 4: REBUILD FROM SCRATCH
```powershell
# Navigate to android folder
cd android

# Download Gradle wrapper fresh (if deleted)
.\gradlew --version

# Clean build (generates codegen)
.\gradlew clean

# Build with full logs to verify autolinking
.\gradlew installFreeDebug --info 2>&1 | Tee-Object -FilePath "..\gradle-autolinking-log.txt"

cd ..
```

### Step 5: VERIFY IN BUILD LOG

Open `gradle-autolinking-log.txt` and search for:

**✅ MUST SEE THIS:**
```
> Task :react-native-async-storage_async-storage:preBuild
> Task :react-native-async-storage_async-storage:compileDebugJavaWithJavac
> Task :react-native-async-storage_async-storage:generateDebugRFile
```

**✅ ALSO MUST SEE:**
```
> Task :app:generateCodegenArtifactsFromSchema
> Task :app:generateCodegenSchemaFromJavaScript
```

**❌ BAD - If you DON'T see async-storage tasks:**
Autolinking still failed. Go to Step 6.

### Step 6: MANUAL VERIFICATION

```powershell
# Check what modules autolinking detected
npx react-native config > autolinking-config.txt

# Open autolinking-config.txt and search for "async-storage"
# You MUST see this section:
```

```json
"@react-native-async-storage/async-storage": {
  "root": "C:\\...\\node_modules\\@react-native-async-storage\\async-storage",
  "name": "@react-native-async-storage/async-storage",
  "platforms": {
    "android": {
      "sourceDir": "C:\\...\\node_modules\\@react-native-async-storage\\async-storage\\android",
      "packageImportPath": "import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;",
      "packageInstance": "new AsyncStoragePackage()",
      ...
    }
  }
}
```

### Step 7: START METRO FRESH
```powershell
# Start Metro with complete cache reset
npx react-native start --reset-cache
```

### Step 8: LAUNCH APP
```powershell
# In another terminal
adb shell am start -n com.ballsortpuzzle/.MainActivity

# Watch logcat for errors
adb logcat | Select-String "ReactNativeJS|AsyncStorage|BallSortPuzzle"
```

## Expected Success Indicators

### ✅ Gradle Build Should Show:
```
> Task :react-native-async-storage_async-storage:compileDebugJavaWithJavac
> Task :react-native-sound:compileDebugJavaWithJavac
...
BUILD SUCCESSFUL in 3m 12s
```

### ✅ Metro Should Show:
```
 BUNDLE  ./index.js
 LOG  Running "BallSortPuzzle" with {"rootTag":11}
```

### ✅ Logcat Should NOT Show:
```
❌ Error: [@RNC/AsyncStorage]: NativeModule: AsyncStorage is null.
❌ Invariant Violation: "BallSortPuzzle" has not been registered.
```

## If Still Failing - Alternative Approaches

### Option 1: Check Node Version
```powershell
node --version
# Should be v18.x or v20.x (LTS)

npm --version
# Should be v9.x or v10.x
```

If using old Node version:
- Download Node 20 LTS from https://nodejs.org/
- Reinstall node_modules after updating Node

### Option 2: Check for Corrupted Symlinks
```powershell
# Check if async-storage folder is accessible
Get-ChildItem "node_modules\@react-native-async-storage\async-storage\android" | Select-Object Name

# Should list files like:
# build.gradle
# src
# etc.
```

If folder appears empty or errors:
- node_modules has corrupted symlinks
- Re-download project from GitHub fresh
- Or copy node_modules from main laptop

### Option 3: Use Main Laptop's node_modules
```powershell
# On main laptop (where it works)
cd C:\Users\mayank_aggarwal2\ball_sort_game\react-native

# Create archive of working node_modules
Compress-Archive -Path "node_modules" -DestinationPath "node_modules_working.zip"

# Copy to other laptop
# Extract on other laptop
# Then rebuild Android only
```

## Diagnostic Script

Save as `check-autolinking.ps1`:

```powershell
Write-Host "`n=== AUTOLINKING DIAGNOSTIC ===" -ForegroundColor Cyan

# 1. Check AsyncStorage package
Write-Host "`n1. Checking AsyncStorage installation..." -ForegroundColor Yellow
$exists = Test-Path "node_modules\@react-native-async-storage\async-storage\package.json"
Write-Host "   Package exists: $exists" -ForegroundColor $(if($exists){'Green'}else{'Red'})

if ($exists) {
    $version = (Get-Content "node_modules\@react-native-async-storage\async-storage\package.json" | ConvertFrom-Json).version
    Write-Host "   Version: $version" -ForegroundColor Green
}

# 2. Check Android native code
Write-Host "`n2. Checking Android native code..." -ForegroundColor Yellow
$androidExists = Test-Path "node_modules\@react-native-async-storage\async-storage\android\build.gradle"
Write-Host "   build.gradle exists: $androidExists" -ForegroundColor $(if($androidExists){'Green'}else{'Red'})

# 3. Check autolinking config
Write-Host "`n3. Checking autolinking..." -ForegroundColor Yellow
$config = npx react-native config 2>$null | ConvertFrom-Json
$hasAsyncStorage = $config.dependencies.PSObject.Properties.Name -contains "@react-native-async-storage/async-storage"
Write-Host "   AsyncStorage in config: $hasAsyncStorage" -ForegroundColor $(if($hasAsyncStorage){'Green'}else{'Red'})

if (-not $hasAsyncStorage) {
    Write-Host "`n   ❌ PROBLEM FOUND: Autolinking NOT detecting AsyncStorage!" -ForegroundColor Red
    Write-Host "   This is why you're getting 'AsyncStorage is null' error" -ForegroundColor Red
}

# 4. Check Gradle cache
Write-Host "`n4. Checking Gradle cache..." -ForegroundColor Yellow
$gradleCache = Test-Path "$env:USERPROFILE\.gradle\caches"
Write-Host "   Gradle cache exists: $gradleCache" -ForegroundColor Yellow
if ($gradleCache) {
    $cacheSize = (Get-ChildItem "$env:USERPROFILE\.gradle\caches" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   Cache size: $([math]::Round($cacheSize, 2)) MB" -ForegroundColor Yellow
}

# 5. Check Metro cache
Write-Host "`n5. Checking Metro cache..." -ForegroundColor Yellow
$metroFiles = Get-ChildItem "$env:TEMP\metro-*" -ErrorAction SilentlyContinue
if ($metroFiles) {
    Write-Host "   Metro cache files: $($metroFiles.Count)" -ForegroundColor Yellow
} else {
    Write-Host "   Metro cache: Clean" -ForegroundColor Green
}

Write-Host "`n=== DIAGNOSTIC COMPLETE ===" -ForegroundColor Cyan

if (-not $hasAsyncStorage) {
    Write-Host "`n📋 RECOMMENDED FIX:" -ForegroundColor Yellow
    Write-Host "   1. Delete node_modules and package-lock.json"
    Write-Host "   2. Delete android\.gradle and build folders"
    Write-Host "   3. Delete $env:USERPROFILE\.gradle\caches"
    Write-Host "   4. Run: npm install"
    Write-Host "   5. Run: cd android && .\gradlew clean && .\gradlew installFreeDebug"
    Write-Host "   6. Run: npx react-native start --reset-cache"
}
```

## Quick Reference

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `Remove-Item node_modules -Recurse -Force` | Delete corrupted modules |
| 2 | `Remove-Item android\.gradle -Recurse -Force` | Delete Gradle cache |
| 3 | `npm install` | Reinstall fresh |
| 4 | `npx react-native config` | Verify autolinking |
| 5 | `cd android && .\gradlew clean` | Clean build artifacts |
| 6 | `.\gradlew installFreeDebug --info` | Build with autolinking |
| 7 | `npx react-native start --reset-cache` | Fresh Metro |

---

**Critical Insight:** The issue is NOT with your code or configuration. AsyncStorage is simply **not being detected** by the autolinking system due to corrupted caches or installation issues. A complete clean reinstall will fix this.
