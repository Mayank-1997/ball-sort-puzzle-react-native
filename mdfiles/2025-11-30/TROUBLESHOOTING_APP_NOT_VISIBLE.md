# Troubleshooting: App Not Showing on Android Emulator

## Problem: App doesn't appear on the emulator after running

This guide will help you diagnose and fix the issue.

---

## Step 1: Verify Emulator is Running and Connected

Open PowerShell and run:

```powershell
adb devices
```

**Expected Output:**
```
List of devices attached
emulator-5554    device
```

**If you see:**
- ❌ **Empty list** → Emulator is not running or not detected
- ❌ **"offline"** → Restart emulator
- ❌ **"unauthorized"** → Wait a few seconds and check again
- ✅ **"device"** → Emulator is connected properly

**If emulator not detected:**
```powershell
# Restart ADB
adb kill-server
adb start-server

# Check again
adb devices
```

---

## Step 2: Check if App Was Actually Installed

```powershell
# List all installed packages and search for your app
adb shell pm list packages | Select-String "ballsort"
```

**Expected Output:**
```
package:com.ballsortpuzzle
```

**If nothing appears:**
- App was NOT installed
- Installation failed silently
- Continue to Step 3

**If app appears:**
- App IS installed
- Continue to Step 4

---

## Step 3: Check Build and Installation Logs

### Option A: Check Android Studio Build Output

1. Look at the **Build** panel (bottom of Android Studio)
2. Check for errors in red
3. Look for the final message - should say "BUILD SUCCESSFUL"

### Option B: Install Manually and Watch for Errors

```powershell
# Navigate to android folder
cd android

# Try to install debug build
.\gradlew installDebug

# Watch for errors
```

**Common Installation Errors:**

#### Error 1: "INSTALL_FAILED_INSUFFICIENT_STORAGE"
```
Solution: Free up space on emulator or create new AVD with more storage
```

#### Error 2: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
```powershell
# Uninstall old version first
adb uninstall com.ballsortpuzzle

# Then reinstall
.\gradlew installDebug
```

#### Error 3: "Execution failed for task ':app:installDebug'"
```
Solution: Make sure emulator is fully booted and unlocked
```

#### Error 4: Build fails with compilation errors
```
Solution: Check the error messages, likely a code issue
```

---

## Step 4: App Installed But Not Visible in App Drawer

If the app installed successfully but you can't find it:

### Check 1: Look in App Drawer

1. On emulator, swipe up from bottom (or click the apps icon)
2. Look for **"Ball Sort Puzzle"** or **"BallSortPuzzle"**
3. Check alphabetically - it might be under "B"

### Check 2: Search for the App

1. On emulator home screen
2. Pull down from top to open search
3. Type "ball" or "sort"
4. App should appear in search results

### Check 3: Launch App via Command Line

```powershell
# Force launch the app
adb shell am start -n com.ballsortpuzzle/.MainActivity
```

**If you see error:**
```
Error: Activity class {com.ballsortpuzzle/com.ballsortpuzzle.MainActivity} does not exist.
```

This means the app didn't install properly or there's a configuration issue.

---

## Step 5: Check App Name and Icon Configuration

The app might be installed but with wrong name/no icon.

### Verify AndroidManifest.xml

Check the file at: `android/app/src/main/AndroidManifest.xml`

Should have:
```xml
<application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    ...>
    
    <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        ...>
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

**Key points:**
- ✅ `android:label="@string/app_name"` → App name
- ✅ `android:icon="@mipmap/ic_launcher"` → App icon
- ✅ `action.MAIN` and `category.LAUNCHER` → Makes app appear in launcher

### Check strings.xml

Check: `android/app/src/main/res/values/strings.xml`

Should have:
```xml
<resources>
    <string name="app_name">Ball Sort Puzzle</string>
</resources>
```

---

## Step 6: Verify You're Running the Correct Command

### If Using Android Studio:

1. Make sure you selected the **emulator** in the device dropdown (top toolbar)
2. Click the green **Run** button (▶️)
3. Watch the **Run** panel at bottom for output
4. Should see "Installing APK" then "Launching activity"

### If Using Command Line:

**DON'T use this for React Native app:**
```powershell
cd android
.\gradlew installDebug  # ❌ This only installs, doesn't start Metro
```

**USE THIS instead (from project root, NOT android folder):**
```powershell
# Make sure you're in project root
cd C:\Users\<your-username>\...\ball_sort_game\react-native

# Run React Native command
npx react-native run-android
```

This will:
1. ✅ Start Metro bundler
2. ✅ Build the app
3. ✅ Install on emulator
4. ✅ Launch the app
5. ✅ Connect to Metro

---

## Step 7: Check Metro Bundler

React Native apps need Metro bundler running!

### Start Metro Separately:

**Terminal 1:**
```powershell
# In project root
npx react-native start
```

**Terminal 2:**
```powershell
# In project root
npx react-native run-android
```

**If Metro shows errors:**
```powershell
# Clear Metro cache
npx react-native start --reset-cache
```

---

## Step 8: Check Build Variant

You might be building the wrong variant!

### Check Current Build Variant:

In Android Studio:
1. Go to **View → Tool Windows → Build Variants**
2. Check what's selected (should be **freeDebug** or **paidDebug**)
3. Make sure it's a **Debug** variant (not Release)

### Install Specific Variant:

```powershell
cd android

# Install Free Debug (recommended for testing)
.\gradlew installFreeDebug

# OR Install Paid Debug
.\gradlew installPaidDebug
```

---

## Step 9: Complete Clean and Reinstall

If nothing else works, do a complete clean:

```powershell
# Stop all Gradle daemons
cd android
.\gradlew --stop

# Clean build
.\gradlew clean

# Go back to project root
cd ..

# Clear Metro cache
Remove-Item -Path ".\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Clear React Native temp files
Remove-Item -Path "$env:TEMP\react-*" -Recurse -Force -ErrorAction SilentlyContinue

# Uninstall app from emulator
adb uninstall com.ballsortpuzzle

# Fresh install
npx react-native run-android
```

---

## Step 10: Check Emulator Logs

View real-time logs to see what's happening:

```powershell
# View all logs
adb logcat

# Filter for your app
adb logcat | Select-String "ballsort"

# Filter for errors
adb logcat *:E

# View React Native specific logs
adb logcat ReactNative:V ReactNativeJS:V *:S
```

Look for errors in red!

---

## Common Scenarios and Solutions

### Scenario 1: Build Successful But App Doesn't Launch

**Symptoms:**
- ✅ Gradle build completes
- ✅ "BUILD SUCCESSFUL" message
- ❌ App doesn't open on emulator

**Solution:**
```powershell
# Launch app manually
adb shell am start -n com.ballsortpuzzle/.MainActivity

# If that fails, check if app is installed
adb shell pm list packages | Select-String "ballsort"
```

---

### Scenario 2: Red Screen Error After Launch

**Symptoms:**
- ✅ App installs
- ✅ App opens
- ❌ Red screen with error message

**Common Errors:**
1. **"Unable to load script"**
   - Metro bundler not running
   - Solution: Start Metro in separate terminal

2. **"Connection to Metro failed"**
   - Network issue
   - Solution: Restart Metro and app

3. **JavaScript error (syntax/runtime)**
   - Code issue
   - Check the error message and fix the code

**Solution:**
```powershell
# Restart Metro with cache clear
npx react-native start --reset-cache

# In another terminal, reinstall
npx react-native run-android
```

---

### Scenario 3: White/Blank Screen

**Symptoms:**
- ✅ App installs and opens
- ❌ Shows white/blank screen
- ❌ Nothing happens

**Possible Causes:**
1. JavaScript bundle not loading
2. React Native bridge not initialized
3. App crash on startup

**Solution:**
```powershell
# Check logs
adb logcat ReactNativeJS:V *:E

# Look for JavaScript errors or crashes
```

---

### Scenario 4: App Not in Launcher But Installed

**Symptoms:**
- ✅ `adb shell pm list packages` shows app
- ❌ Can't find in app drawer

**Solution:**

Check if MainActivity has launcher intent:

```powershell
# Check app activities
adb shell dumpsys package com.ballsortpuzzle | Select-String "MainActivity"
```

Should show `android.intent.action.MAIN` and `android.intent.category.LAUNCHER`

If missing, check `AndroidManifest.xml` (see Step 5)

---

## Quick Diagnostic Command

Run this all-in-one diagnostic:

```powershell
Write-Host "`n=== DIAGNOSTIC REPORT ===" -ForegroundColor Cyan

Write-Host "`n1. Checking connected devices..." -ForegroundColor Yellow
adb devices

Write-Host "`n2. Checking if app is installed..." -ForegroundColor Yellow
adb shell pm list packages | Select-String "ballsort"

Write-Host "`n3. Checking app info..." -ForegroundColor Yellow
adb shell dumpsys package com.ballsortpuzzle | Select-String "version|enabled"

Write-Host "`n4. Trying to launch app..." -ForegroundColor Yellow
adb shell am start -n com.ballsortpuzzle/.MainActivity

Write-Host "`n5. Checking recent errors..." -ForegroundColor Yellow
adb logcat -d *:E | Select-String "ballsort" | Select-Object -Last 10

Write-Host "`n=== END REPORT ===" -ForegroundColor Cyan
```

---

## Most Likely Issues (In Order of Probability)

### Issue #1: Metro Bundler Not Running ⚡ (80% of cases)

**Solution:**
```powershell
# Start Metro first
npx react-native start

# Then in another terminal
npx react-native run-android
```

---

### Issue #2: Using Wrong Command ⚡ (15% of cases)

**Wrong:**
```powershell
cd android
.\gradlew installDebug  # ❌ React Native needs Metro!
```

**Correct:**
```powershell
# From project root
npx react-native run-android  # ✅ This starts Metro + installs + runs
```

---

### Issue #3: Emulator Not Fully Booted (3% of cases)

**Solution:**
- Wait for emulator to fully boot (see Android home screen)
- Unlock the emulator screen
- Then run the app

---

### Issue #4: App Installed with Different Package Name (1% of cases)

**Check:**
```powershell
# List ALL packages (look manually)
adb shell pm list packages | Sort-Object
```

Look for anything that might be your app.

---

### Issue #5: App Crashes on Startup (1% of cases)

**Check crash logs:**
```powershell
adb logcat -d *:E | Select-String -Context 5 "FATAL"
```

---

## Step-by-Step Checklist

Run through this checklist on your other laptop:

- [ ] Emulator is running
- [ ] `adb devices` shows emulator as "device"
- [ ] You're in the **project root** folder (not android folder)
- [ ] Terminal 1: `npx react-native start` (Metro bundler running)
- [ ] Terminal 2: `npx react-native run-android`
- [ ] Wait for "BUILD SUCCESSFUL" message
- [ ] Wait for "Installing APK" message
- [ ] Wait for "Starting activity" message
- [ ] Check emulator screen - app should launch
- [ ] If not visible, check app drawer (swipe up)
- [ ] If still not visible, run diagnostic commands above

---

## What to Send If Still Not Working

If you still can't see the app, collect this info:

```powershell
# 1. Device check
adb devices

# 2. Installation check
adb shell pm list packages | Select-String "ballsort"

# 3. Build output
cd android
.\gradlew installFreeDebug

# 4. Launch attempt
adb shell am start -n com.ballsortpuzzle/.MainActivity

# 5. Recent logs
adb logcat -d | Select-Object -Last 100
```

Save all outputs and error messages!

---

## Quick Fix (Works 90% of the Time)

```powershell
# Clean everything
cd android
.\gradlew clean
cd ..

# Uninstall if exists
adb uninstall com.ballsortpuzzle

# Fresh start with Metro
npx react-native start --reset-cache
```

Then in another terminal:
```powershell
npx react-native run-android
```

Wait patiently - first build takes 2-5 minutes!

---

## Success Indicators

You'll know it worked when you see:

✅ **Terminal output:**
```
> Task :app:installFreeDebug
Installing APK 'app-free-debug.apk' on 'Pixel_5_API_33(AVD) - 13'
Installed on 1 device.

> Task :app:startActivityForFreeDebug
Starting: Intent { cmp=com.ballsortpuzzle/.MainActivity }
```

✅ **Emulator screen:**
- App icon appears (or app launches directly)
- You see your app's splash screen or menu

✅ **Metro bundler:**
```
BUNDLE  ./index.js
BUNDLE  [==========================================================] 100.0%
```

Good luck! 🚀
