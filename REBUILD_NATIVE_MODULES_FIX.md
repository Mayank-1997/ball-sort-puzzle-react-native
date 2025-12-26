# Fix Native Module Errors After npm Install + Gradle Build

## Problem
Even after reinstalling npm modules and running `gradlew installFreeDebug`, you're getting:
- `AsyncStorage is null`
- `RNSound.IsAndroid is null`
- `BallSortPuzzle has not been registered`

## Root Causes

### 1. Metro Cache Issue
Metro bundler caches JavaScript bundles. Even after Gradle rebuilds native code, Metro serves **old cached JavaScript** that references broken module paths.

### 2. Partial APK Install
`gradlew installFreeDebug` might do a **partial install** (patching) instead of full clean install, leaving old native module binaries in the APK.

### 3. Autolinking Configuration
React Native 0.73 autolinking might fail if:
- Node modules weren't fully extracted
- Gradle cache has stale entries
- `react-native.config.js` has issues

### 4. Product Flavor Mismatch
You have `free` and `premium` flavors. If Metro is bundling for one flavor but you're running another, package names won't match.

## Complete Solution

### Step 1: Complete Cleanup (On Other Laptop)
```powershell
# Navigate to project root
cd C:\Users\91858\Desktop\game-react-native\ball-sort-puzzle-react-native

# Stop Metro if running
# Press Ctrl+C in Metro terminal

# Uninstall ALL variants of the app
adb uninstall com.ballsortpuzzle
adb uninstall com.ballsortpuzzle.premium

# Clear Metro cache completely
npx react-native start --reset-cache
# Then stop it (Ctrl+C)

# Alternative: Delete Metro cache folder
Remove-Item -Path "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\react-native-*" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 2: Clean Gradle Build
```powershell
cd android

# Clean all build artifacts
.\gradlew clean

# Clear Gradle cache
.\gradlew cleanBuildCache

# Build and install with verbose logging
.\gradlew installFreeDebug --info --stacktrace

cd ..
```

### Step 3: Start Fresh Metro
```powershell
# Start Metro with full cache reset
npx react-native start --reset-cache
```

### Step 4: Verify Installation (In Another Terminal)
```powershell
# Check if APK installed correctly
adb shell pm list packages | Select-String "ballsort"

# Should see:
# package:com.ballsortpuzzle

# Launch the app
adb shell am start -n com.ballsortpuzzle/.MainActivity
```

## If Still Failing - Check Autolinking

### Verify Autolinking Configuration
```powershell
# Check if modules are being linked
cd android
.\gradlew :app:dependencies --configuration freeDebugRuntimeClasspath | Select-String "async-storage|react-native-sound"
cd ..
```

### Manual Verification - Check Build Output
Look for these in `gradlew installFreeDebug --info` output:

**✅ Good Signs:**
```
> Task :react-native-async-storage_async-storage:compileDebugJavaWithJavac
> Task :react-native-sound:compileDebugJavaWithJavac
```

**❌ Bad Signs (Missing):**
```
# If you DON'T see the above tasks, autolinking failed
```

## Alternative: Nuclear Option

If above steps don't work, do complete reset:

```powershell
# 1. Delete node_modules and reinstall
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
npm install

# 2. Delete all Android build folders
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Clear all caches
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Rebuild everything
cd android
.\gradlew clean
.\gradlew installFreeDebug --info
cd ..

# 5. Start Metro fresh
npx react-native start --reset-cache
```

## Diagnostic Script

Save this as `diagnose-native-modules.ps1`:

```powershell
# Ball Sort Puzzle - Native Module Diagnostic Script

Write-Host "`n=== NATIVE MODULE DIAGNOSTIC ===" -ForegroundColor Cyan

# 1. Check if modules exist in node_modules
Write-Host "`n1. Checking node_modules..." -ForegroundColor Yellow
$asyncStorage = Test-Path "node_modules\@react-native-async-storage\async-storage"
$sound = Test-Path "node_modules\react-native-sound"

Write-Host "   AsyncStorage: $asyncStorage" -ForegroundColor $(if($asyncStorage){'Green'}else{'Red'})
Write-Host "   react-native-sound: $sound" -ForegroundColor $(if($sound){'Green'}else{'Red'})

# 2. Check if native code exists
Write-Host "`n2. Checking native Android code..." -ForegroundColor Yellow
$asyncNative = Test-Path "node_modules\@react-native-async-storage\async-storage\android\build.gradle"
$soundNative = Test-Path "node_modules\react-native-sound\android\build.gradle"

Write-Host "   AsyncStorage Android: $asyncNative" -ForegroundColor $(if($asyncNative){'Green'}else{'Red'})
Write-Host "   Sound Android: $soundNative" -ForegroundColor $(if($soundNative){'Green'}else{'Red'})

# 3. Check installed APK
Write-Host "`n3. Checking installed APK..." -ForegroundColor Yellow
$apkInstalled = adb shell pm list packages | Select-String "ballsort"
if ($apkInstalled) {
    Write-Host "   Installed: $apkInstalled" -ForegroundColor Green
} else {
    Write-Host "   No APK installed!" -ForegroundColor Red
}

# 4. Check APK contents for native libraries
Write-Host "`n4. Checking APK native libraries..." -ForegroundColor Yellow
$apkPath = (Get-ChildItem -Path "android\app\build\outputs\apk\free\debug" -Filter "*.apk" | Select-Object -First 1).FullName

if (Test-Path $apkPath) {
    Write-Host "   APK found: $apkPath" -ForegroundColor Green
    
    # Check for native .so files
    $zipContent = & "C:\Program Files\7-Zip\7z.exe" l $apkPath 2>$null | Select-String "libreact|libasync|libsound"
    if ($zipContent) {
        Write-Host "   Native libraries found in APK:" -ForegroundColor Green
        $zipContent | ForEach-Object { Write-Host "     $_" }
    } else {
        Write-Host "   WARNING: No native libraries found in APK!" -ForegroundColor Red
    }
} else {
    Write-Host "   APK not found. Run build first!" -ForegroundColor Red
}

# 5. Check Gradle autolinking
Write-Host "`n5. Checking autolinking configuration..." -ForegroundColor Yellow
$settingsGradle = Get-Content "android\settings.gradle" -Raw
if ($settingsGradle -match "react-native") {
    Write-Host "   React Native gradle plugin: FOUND" -ForegroundColor Green
} else {
    Write-Host "   React Native gradle plugin: MISSING!" -ForegroundColor Red
}

Write-Host "`n=== DIAGNOSTIC COMPLETE ===" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. If any items are RED, check REBUILD_NATIVE_MODULES_FIX.md"
Write-Host "  2. Run: .\gradlew clean && .\gradlew installFreeDebug --info"
Write-Host "  3. Run: npx react-native start --reset-cache"
Write-Host ""
```

## Expected Behavior After Fix

### Gradle Output Should Show:
```
> Task :react-native-async-storage_async-storage:compileDebugJavaWithJavac
> Task :react-native-sound:compileDebugJavaWithJavac
> Task :react-native-google-signin_google-signin:compileDebugJavaWithJavac
...
BUILD SUCCESSFUL in 2m 34s
```

### Metro Output Should Show:
```
 BUNDLE  ./index.js

 LOG  Running "BallSortPuzzle" with {"rootTag":11}
```

### App Should Launch Without:
- ❌ "AsyncStorage is null"
- ❌ "RNSound.IsAndroid is null"  
- ❌ "BallSortPuzzle has not been registered"

## Common Pitfalls

### ❌ Don't Do This:
```powershell
# This only installs packages, doesn't compile native code
npm install

# This might patch instead of clean install
.\gradlew installFreeDebug  # without clean first
```

### ✅ Always Do This:
```powershell
# Uninstall old APK
adb uninstall com.ballsortpuzzle

# Clean Gradle
cd android && .\gradlew clean && cd ..

# Reset Metro cache
npx react-native start --reset-cache
# Stop it (Ctrl+C)

# Build and install fresh
cd android && .\gradlew installFreeDebug --info && cd ..

# Start Metro fresh
npx react-native start --reset-cache
```

## Still Not Working?

If you've tried everything above and still getting errors:

1. **Share the full Gradle build log:**
   ```powershell
   cd android
   .\gradlew installFreeDebug --info > ..\gradle-full-log.txt 2>&1
   cd ..
   ```

2. **Check if autolinking is actually running:**
   Look for "Autolinking" or "react-native-community/cli" in the log

3. **Verify React Native version:**
   ```powershell
   npx react-native --version
   # Should show 0.73.2
   ```

4. **Check for conflicting React Native installations:**
   ```powershell
   npm ls react-native
   # Should show only one version
   ```

## Quick Reference

| Problem | Solution |
|---------|----------|
| AsyncStorage is null | Clean Metro cache + Clean Gradle build |
| Module not registered | Uninstall APK + Full rebuild |
| Autolinking failed | Delete node_modules + npm install + rebuild |
| Wrong flavor running | Check `adb shell pm list packages` matches build variant |
| Stale cache | Delete `android/.gradle` + `$env:TEMP\metro-*` |

---

**Key Insight:** npm install downloads packages, Gradle compiles native code, Metro bundles JavaScript. All three must be clean for native modules to work!
