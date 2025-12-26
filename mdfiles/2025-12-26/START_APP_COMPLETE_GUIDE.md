# Complete Guide: Starting Ball Sort Puzzle App (December 2025)

**Date:** December 26, 2025  
**Purpose:** Fresh start guide after 1 month break - Complete setup and run instructions

---

## 🚀 Complete Setup & Run Guide (Fresh Start)

### Prerequisites Check

Before starting, ensure you have:

1. ✅ **Android Studio** installed with an emulator set up
2. ✅ **Node.js** installed (check: `node --version`)
3. ✅ **Git** to pull latest code
4. ✅ **Android SDK** and environment variables set (`ANDROID_HOME`)

---

## 📥 Step 1: Get Latest Code

```powershell
# Navigate to your project
cd C:\Users\mayank_aggarwal2\ball_sort_game\react-native

# Pull latest changes (if any)
git pull origin main

# Check current branch
git status
```

**Expected Output:**
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

---

## 🧹 Step 2: Clean Install Dependencies

```powershell
# Install/update npm packages
npm install --legacy-peer-deps

# Verify installation
Test-Path "node_modules"  # Should return True
```

**Why `--legacy-peer-deps`?**  
React Native 0.73.2 has peer dependency conflicts with some packages. This flag resolves them.

**Expected Output:**
```
added 1250 packages in 2m
```

---

## 🤖 Step 3: Start Android Emulator

### Option A: From Android Studio (Recommended)

1. Open **Android Studio**
2. Click **Device Manager** (phone icon on right sidebar)
3. Click **▶️ Play** button on any emulator (Pixel 5, etc.)
4. **Wait until fully booted** (shows home screen with apps)

### Option B: From Command Line

```powershell
# List available emulators
emulator -list-avds

# Example output:
# Pixel_5_API_34
# Pixel_6_API_33

# Start one (replace with your emulator name)
emulator -avd Pixel_5_API_34
```

### Verify Emulator is Running

```powershell
adb devices
```

**Expected Output:**
```
List of devices attached
emulator-5554   device
```

**If you see `offline` or `unauthorized`:**
```powershell
adb kill-server
adb start-server
adb devices
```

---

## 📱 Step 4: Build & Run the App

### ⭐ Method 1: React Native CLI (Recommended - Easiest)

This is the **ONE-COMMAND** solution that does everything automatically!

**Terminal 1: Start Metro Bundler**
```powershell
npx react-native start --reset-cache
```

**Wait for this message:**
```
                Welcome to Metro v0.80.12
              Fast - Scalable - Integrated

Metro waiting on port 8081
```

**Terminal 2: Build, Install & Launch App**
```powershell
# Open a NEW terminal window
npx react-native run-android --mode=freeDebug

# Alternative (if above doesn't work):
npx react-native run-android --mode debug --appIdSuffix free
```

This single command will:
1. ✅ Build the JavaScript bundle
2. ✅ Compile the Android app
3. ✅ Create APK file
4. ✅ Install APK on emulator
5. ✅ Launch the app automatically

**Expected Output:**
```
info Running jetifier to migrate libraries to AndroidX
info Starting JS server...
info Building and installing the app on the device...
info Connecting to the development server...
info Starting the app on "emulator-5554"...
```

**Success:** App opens on emulator with your game UI!

---

### Method 2: Gradle (Manual Control)

Use this if React Native CLI has issues or you want more control.

**Terminal 1: Start Metro**
```powershell
npx react-native start --reset-cache
```

**Terminal 2: Build and Install**
```powershell
# Navigate to android folder
cd android

# Build and install FREE debug variant
.\gradlew installFreeDebug

# Go back to project root
cd ..
```

**Expected Output:**
```
BUILD SUCCESSFUL in 45s
Installing APK 'app-free-debug.apk' on 'Pixel_5_API_34(AVD) - 14'
Installed on 1 device.
```

**Launch App Manually:**
1. Look at your emulator screen
2. Swipe up to open app drawer
3. Find "Ball Sort Puzzle"
4. Tap it with your mouse

---

### Method 3: Complete Manual Control (For Troubleshooting)

**Step-by-step with full control:**

```powershell
# 1. Create JavaScript bundle manually
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/build/generated/assets/createBundleFreeDebugJsAndAssets/assets/index.android.bundle --assets-dest android/app/build/generated/res/react/freeDebug

# 2. Build APK with Gradle
cd android
.\gradlew assembleFreeDebug

# 3. Install APK with ADB
adb install -r "app\build\outputs\apk\free\debug\app-free-debug.apk"

# 4. Launch app
adb shell am start -n com.ballsortpuzzle/.MainActivity
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "ENOENT: no such file or directory" During Bundle Creation

**Error Message:**
```
Error: ENOENT: no such file or directory, open 'C:\...\android\app\build\generated\assets\createBundleFreeDebugJsAndAssets\assets\index.android.bundle'
```

**Root Cause:** Gradle fails to create directories before Metro tries to write bundle.

**Fix:** Manually create directories
```powershell
# Create assets directory
New-Item -Path "android\app\build\generated\assets\createBundleFreeDebugJsAndAssets\assets" -ItemType Directory -Force

# Create sourcemap directory
New-Item -Path "android\app\build\generated\sourcemaps\react\freeDebug\assets" -ItemType Directory -Force

# Now rebuild
cd android
.\gradlew installFreeDebug
```

---

### Issue 2: "Stuck at Starting the app on emulator-5554..."

**Symptom:** Command hangs for 15+ minutes at:
```
info Starting the app on "emulator-5554"...
```

**Root Cause:** ADB launch command hangs (known issue on some systems).

**Fix Option A: Launch Manually from Emulator**
```powershell
# Just install, don't try to launch
cd android
.\gradlew installFreeDebug

# Then manually open app:
# 1. Look at emulator screen
# 2. Swipe up to open app drawer
# 3. Find "Ball Sort Puzzle" icon
# 4. Tap it with your mouse
```

**Fix Option B: Use Direct ADB Command**
```powershell
# After installFreeDebug succeeds, try:
adb shell am start -n com.ballsortpuzzle/.MainActivity

# If that hangs, just launch manually from emulator
```

---

### Issue 3: Metro Port Already in Use (8081)

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::8081
```

**Root Cause:** Metro bundler from previous session still running.

**Fix:** Kill old processes
```powershell
# Kill all Node processes
Get-Process -Name "node" | Stop-Process -Force

# Restart Metro
npx react-native start --reset-cache
```

**Alternative Port:**
```powershell
# Use different port
npx react-native start --port 8082 --reset-cache
```

---

### Issue 4: App Crashes Immediately on Launch

**Symptom:** App opens briefly then closes, or red error screen appears.

**Fix:** Uninstall old versions and clean reinstall
```powershell
# 1. Uninstall any existing versions
adb uninstall com.ballsortpuzzle
adb uninstall com.ballsortpuzzle.premium

# 2. Clean build cache
cd android
.\gradlew clean
.\gradlew --stop
cd ..

# 3. Delete build folders
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Reinstall dependencies
npm install --legacy-peer-deps

# 5. Rebuild and reinstall
npx react-native run-android --mode=freeDebug
```

---

### Issue 5: Build Fails with Gradle Errors

**Common Error Messages:**
```
FAILURE: Build failed with an exception.
* What went wrong:
Execution failed for task ':app:...'
```

**Nuclear Option - Full Clean:**
```powershell
# 1. Stop all processes
Get-Process -Name "node" | Stop-Process -Force

# 2. Clean Gradle
cd android
.\gradlew clean --no-daemon
.\gradlew --stop
cd ..

# 3. Delete all build artifacts
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Delete node_modules
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# 5. Fresh install
npm install --legacy-peer-deps

# 6. Rebuild
npx react-native run-android --mode=freeDebug
```

---

### Issue 6: "Task installDebug is ambiguous"

**Error Message:**
```
Task 'installDebug' is ambiguous in root project 'BallSortPuzzle'
```

**Root Cause:** Multiple product flavors (free/premium) mean there's no single "Debug" variant.

**Fix:** Specify the exact variant
```powershell
# DON'T use:
.\gradlew installDebug  # ❌ Ambiguous

# USE instead:
.\gradlew installFreeDebug     # ✅ Specific
# or
.\gradlew installPremiumDebug  # ✅ Specific
```

---

### Issue 7: Red Screen Error in App

**Symptom:** App launches but shows red error screen with JavaScript errors.

**Fix:** Clear Metro cache and reload
```powershell
# Stop Metro (Ctrl+C)

# Restart with cleared cache
npx react-native start --reset-cache

# In app, press R twice to reload
# Or shake emulator (Ctrl+M) → Reload
```

---

## 🎯 Quick Start Script (Automated)

Save this as `start-app.ps1` in your project root:

```powershell
# Quick start script for Ball Sort Puzzle
# Date: December 26, 2025

Write-Host "🚀 Starting Ball Sort Puzzle..." -ForegroundColor Green

# Check if emulator is running
Write-Host "🔍 Checking for emulator..." -ForegroundColor Cyan
$devices = adb devices
if ($devices -notmatch "emulator") {
    Write-Host "⚠️  No emulator detected. Please start an emulator first." -ForegroundColor Yellow
    Write-Host "   Open Android Studio → Device Manager → Start Emulator" -ForegroundColor Yellow
    exit
}

Write-Host "✅ Emulator detected!" -ForegroundColor Green

# Kill old processes
Write-Host "🧹 Cleaning old processes..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Start Metro in background
Write-Host "📦 Starting Metro bundler..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx react-native start --reset-cache"

# Wait for Metro to start
Write-Host "⏳ Waiting for Metro to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Build and run
Write-Host "🔨 Building and installing app..." -ForegroundColor Cyan
npx react-native run-android --mode=freeDebug

Write-Host "✅ Done! Check your emulator." -ForegroundColor Green
```

**Run it:**
```powershell
.\start-app.ps1
```

---

## 📋 Success Checklist

After running the app, verify these points:

### Before Build:
- [ ] Emulator is running (`adb devices` shows `emulator-5554   device`)
- [ ] Node.js is installed (`node --version` shows v18+)
- [ ] Dependencies installed (`node_modules` folder exists)
- [ ] Android SDK set up (`echo $env:ANDROID_HOME` shows SDK path)

### During Build:
- [ ] Metro bundler shows "Metro waiting on port 8081"
- [ ] No red errors in Metro terminal
- [ ] Gradle build completes with "BUILD SUCCESSFUL"
- [ ] App installs on emulator (see "Installing APK..." message)

### After Launch:
- [ ] App appears in emulator app drawer as "Ball Sort Puzzle"
- [ ] App launches without crashing
- [ ] App shows your React Native UI (not red error screen)
- [ ] Can interact with app (tap, swipe works)
- [ ] Metro shows "Connected to React Native DevTools"

---

## 🔍 What Issues Were Fixed Previously?

Based on November 2025 session, these issues were already resolved in your code:

### ✅ Fixed Issues (Already in Code):

1. **SSL Trust Store Error**
   - **Problem:** `org.apache.http.ssl.SSLInitializationException: problem accessing trust store`
   - **Fix:** Removed WINDOWS-ROOT SSL config from `gradle.properties`
   - **Status:** ✅ Fixed

2. **MainActivity Not Found Error**
   - **Problem:** `Activity class {com.ballsortpuzzle/com.ballsortpuzzle.MainActivity} does not exist`
   - **Fix:** Changed from `applicationIdSuffix` to explicit `applicationId` in `build.gradle`
   - **Status:** ✅ Fixed

3. **App Crash on Launch (Exit Code 255)**
   - **Problem:** App crashed immediately due to non-existent services
   - **Fix:** Removed references to `GameBackupAgent`, `GameSyncService`, `NotificationReceiver` from `AndroidManifest.xml`
   - **Status:** ✅ Fixed

### ⚠️ Known Workarounds (May Still Occur):

4. **Directory Creation Bug**
   - **Problem:** Gradle doesn't create bundle asset directories
   - **Workaround:** Manually create directories before build
   - **Status:** ⚠️ Use workaround if needed

5. **Launch Command Hangs**
   - **Problem:** `adb shell am start` hangs indefinitely
   - **Workaround:** Launch app manually from emulator app drawer
   - **Status:** ⚠️ Use workaround if needed

All code fixes are already committed to your repository!

---

## 🎓 Project Information

### What You Have:

**Package Names:**
- **Free Version:** `com.ballsortpuzzle`
- **Premium Version:** `com.ballsortpuzzle.premium`

**Build Variants:**
- `freeDebug` - Free version for development
- `premiumDebug` - Premium version for development
- `freeRelease` - Free version for production
- `premiumRelease` - Premium version for production

**Technologies:**
- React Native 0.73.2
- Android Gradle Plugin 8.1.4
- Gradle 8.4
- Kotlin 1.8.10
- Metro Bundler 0.80.12

**Integrated Services:**
- Google AdMob (ads)
- Google Play Games Services (leaderboards, achievements)
- Google Sign-In
- React Native AsyncStorage (game progress)

### File Structure:

```
ball-sort-puzzle-react-native/
├── App.js                    # Main React component
├── index.js                  # Entry point
├── package.json              # Dependencies
├── android/                  # Native Android code
│   ├── app/
│   │   ├── build.gradle      # App build config
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── java/com/ballsortpuzzle/
│   │           ├── MainActivity.java
│   │           └── MainApplication.java
│   ├── build.gradle          # Project config
│   └── gradle.properties     # Build properties
├── src/                      # Your game code
│   ├── screens/              # UI screens
│   ├── components/           # Reusable components
│   ├── services/             # Business logic
│   └── utils/                # Helper functions
└── mdfiles/                  # Documentation
    ├── 2025-11-30/          # November fixes
    └── 2025-12-26/          # This guide
```

---

## 📚 Available Documentation

All guides are in `mdfiles/` folder:

### November 2025 Guides (mdfiles/2025-11-30/):
1. `PROJECT_FILES_GUIDE.md` - Detailed explanation of all project files
2. `CLEAN_BUILD_FRESH_START.md` - Complete cache cleaning procedure
3. `APP_LAUNCH_FAILED_FIX.md` - Fix for MainActivity not found error
4. `PRODUCTION_FREE_PREMIUM_SETUP.md` - Product flavor configuration
5. `SSL_TRUSTSTORE_FIX.md` - SSL error solutions
6. `REACT_NATIVE_TO_ANDROID_CONVERSION_GUIDE.md` - Architecture explanation
7. Plus 5 more troubleshooting guides

### December 2025 Guides (mdfiles/2025-12-26/):
1. `START_APP_COMPLETE_GUIDE.md` - **This guide**

### Quick Reference:
- **First time setup:** Read this guide
- **Build errors:** Check `CLEAN_BUILD_FRESH_START.md`
- **Understanding project:** Read `PROJECT_FILES_GUIDE.md`
- **Specific errors:** Search relevant guide in `mdfiles/`

---

## 🚨 Emergency Recovery Commands

If everything is broken and nothing works:

```powershell
# NUCLEAR OPTION - Start completely fresh

# 1. Stop everything
Get-Process -Name "node" | Stop-Process -Force
Get-Process -Name "java" | Stop-Process -Force

# 2. Uninstall app
adb uninstall com.ballsortpuzzle
adb uninstall com.ballsortpuzzle.premium

# 3. Kill ADB
adb kill-server

# 4. Delete all build artifacts
Remove-Item -Path "android\app\build", "android\build", "android\.gradle", "node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# 5. Fresh install
npm install --legacy-peer-deps

# 6. Restart ADB
adb start-server

# 7. Verify emulator
adb devices

# 8. Start Metro
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx react-native start --reset-cache"

# 9. Wait 10 seconds, then build
Start-Sleep -Seconds 10
npx react-native run-android --mode=freeDebug
```

---

## 🎯 Recommended Workflow

### Daily Development:

**First run of the day:**
```powershell
# 1. Start emulator (Android Studio)
# 2. Start Metro
npx react-native start --reset-cache

# 3. Build and run (new terminal)
npx react-native run-android --mode=freeDebug
```

**Making code changes:**
- Edit JavaScript files in `src/`
- App auto-reloads (Fast Refresh)
- No need to rebuild!

**For Android native changes:**
```powershell
# Rebuild when you edit:
# - AndroidManifest.xml
# - build.gradle
# - MainActivity.java
# - Any native code

cd android
.\gradlew installFreeDebug
```

**End of day:**
```powershell
# Stop Metro (Ctrl+C)
# Close emulator
# That's it!
```

---

## 💡 Pro Tips

1. **Keep Metro Running:** Don't stop Metro between builds - it's faster!

2. **Use Hot Reload:** Press `R` twice in app to reload JavaScript instantly

3. **Debug Menu:** Press `Ctrl+M` in emulator to open developer menu
   - Enable Fast Refresh
   - Toggle Inspector
   - Remote JS Debugging

4. **Check Logcat:** For native crashes, always check:
   ```powershell
   adb logcat *:E | Select-String "ballsort"
   ```

5. **Build Variants:** 
   - Use `freeDebug` for development (has debug tools)
   - Use `freeRelease` only for final testing (optimized, slower to build)

6. **Clean Regularly:** If builds get slow, clean once a week:
   ```powershell
   cd android
   .\gradlew clean
   ```

---

## 🎉 You're Ready!

**Quick start command:**
```powershell
# Method 1: Automated script
.\start-app.ps1

# Method 2: Manual (recommended for first time)
# Terminal 1:
npx react-native start --reset-cache

# Terminal 2:
npx react-native run-android --mode=freeDebug
```

**Expected result:**
- App opens on emulator
- Shows Ball Sort Puzzle game UI
- You can interact with it

**If you get errors:**
1. Check the "Common Issues" section above
2. Review relevant documentation in `mdfiles/`
3. Use the Emergency Recovery Commands if needed

---

**Happy Coding! 🎮🎨**

**Last Updated:** December 26, 2025  
**Version:** 1.0.0  
**Next Steps:** Start developing your game features in `src/` folder!
