# FIX: MainActivity Does Not Exist Error

## Problem
```
Error: Activity class {com.ballsortpuzzle/com.ballsortpuzzle.MainActivity} does not exist.
```

## Root Cause

Your app has **product flavors** (free and premium) that add suffixes to the package name:

- Free variant: `com.ballsortpuzzle.free`
- Premium variant: `com.ballsortpuzzle.premium`

But React Native is trying to launch `com.ballsortpuzzle` (without suffix), which doesn't exist!

---

## Solution 1: Remove applicationIdSuffix (Recommended for Development)

### Edit: `android/app/build.gradle`

Find the product flavors section (around line 110):

```gradle
productFlavors {
    free {
        dimension "version"
        applicationIdSuffix ".free"  // ← REMOVE THIS LINE
        versionNameSuffix "-free"
        buildConfigField "Boolean", "IS_PREMIUM", "false"
    }
    premium {
        dimension "version"
        applicationIdSuffix ".premium"  // ← REMOVE THIS LINE
        versionNameSuffix "-premium"
        buildConfigField "Boolean", "IS_PREMIUM", "true"
    }
}
```

**Change to:**

```gradle
productFlavors {
    free {
        dimension "version"
        // applicationIdSuffix ".free"  // ← COMMENTED OUT
        versionNameSuffix "-free"
        buildConfigField "Boolean", "IS_PREMIUM", "false"
    }
    premium {
        dimension "version"
        // applicationIdSuffix ".premium"  // ← COMMENTED OUT
        versionNameSuffix "-premium"
        buildConfigField "Boolean", "IS_PREMIUM", "true"
    }
}
```

Then run:

```powershell
# Clean and rebuild
cd android
.\gradlew clean
cd ..

# Uninstall old app
adb uninstall com.ballsortpuzzle.free
adb uninstall com.ballsortpuzzle.premium

# Run again
npx react-native run-android
```

---

## Solution 2: Keep Suffixes But Configure React Native Properly

If you want to keep the suffixes for different store distributions:

### Option A: Specify the Variant When Running

```powershell
# Run free variant
npx react-native run-android --variant=freeDebug --appIdSuffix free

# Run premium variant
npx react-native run-android --variant=premiumDebug --appIdSuffix premium
```

### Option B: Create react-native.config.js

Create this file in your project root:

**File: `react-native.config.js`**

```javascript
module.exports = {
  project: {
    android: {
      sourceDir: './android',
      manifestPath: './android/app/src/main/AndroidManifest.xml',
      packageName: 'com.ballsortpuzzle.free', // Use free by default
    },
  },
};
```

Then run:
```powershell
npx react-native run-android
```

---

## Solution 3: Use Android Studio to Run (Easiest)

1. Open `android` folder in Android Studio
2. Click **View → Tool Windows → Build Variants**
3. Select **freeDebug** from the dropdown
4. Click the **Run** button (green ▶️)
5. App will install and launch correctly!

---

## Solution 4: Rename Product Flavors (Better Approach)

Instead of using suffixes, use completely different package names:

### Edit: `android/app/build.gradle`

```gradle
productFlavors {
    free {
        dimension "version"
        applicationId "com.ballsortpuzzle"  // ← Base package for free
        versionNameSuffix "-free"
        buildConfigField "Boolean", "IS_PREMIUM", "false"
    }
    premium {
        dimension "version"
        applicationId "com.ballsortpuzzle.premium"  // ← Different package for premium
        versionNameSuffix "-premium"
        buildConfigField "Boolean", "IS_PREMIUM", "true"
    }
}
```

This way:
- Free version uses: `com.ballsortpuzzle` (matches React Native default)
- Premium version uses: `com.ballsortpuzzle.premium`

---

## Quick Fix Commands (Use Solution 1)

On your other laptop, run these commands:

### Step 1: Edit the build.gradle file

Open: `android/app/build.gradle`

Comment out or remove these two lines:
- Line ~112: `applicationIdSuffix ".free"`
- Line ~117: `applicationIdSuffix ".premium"`

### Step 2: Clean and reinstall

```powershell
# Navigate to project root
cd C:\path\to\ball_sort_game\react-native

# Clean build
cd android
.\gradlew clean
cd ..

# Uninstall all old versions
adb uninstall com.ballsortpuzzle
adb uninstall com.ballsortpuzzle.free
adb uninstall com.ballsortpuzzle.premium

# Fresh install
npx react-native run-android
```

### Step 3: Verify

You should see:
```
Starting: Intent { cmp=com.ballsortpuzzle/.MainActivity }
```

NOT:
```
Starting: Intent { cmp=com.ballsortpuzzle.free/.MainActivity }  ❌
```

---

## Why This Happens

When you have product flavors with `applicationIdSuffix`:

```gradle
free {
    applicationIdSuffix ".free"  // Creates com.ballsortpuzzle.free
}
```

The APK is built with package name `com.ballsortpuzzle.free`, but React Native CLI tries to launch `com.ballsortpuzzle` (without suffix), causing the error.

---

## Which Solution to Use?

### For Development/Testing:
✅ **Solution 1** (Remove suffixes) - Simplest

### For Production (Google Play):
✅ **Solution 4** (Different applicationId for premium) - Best practice

### If You Want Both Versions Simultaneously:
✅ **Solution 2** or **Solution 3** - Keep suffixes, configure properly

---

## Verification After Fix

After applying the fix, run diagnostic:

```powershell
# Check installed apps
adb shell pm list packages | Select-String "ballsort"

# Should show:
# package:com.ballsortpuzzle

# Try to launch
adb shell am start -n com.ballsortpuzzle/.MainActivity

# Should launch successfully!
```

---

## Complete Fix Script

Save this as `fix-package.ps1` and run it:

```powershell
Write-Host "=== Fixing MainActivity Error ===" -ForegroundColor Cyan

# Step 1: Clean
Write-Host "`n1. Cleaning build..." -ForegroundColor Yellow
cd android
.\gradlew clean
cd ..

# Step 2: Uninstall all versions
Write-Host "`n2. Uninstalling old versions..." -ForegroundColor Yellow
adb uninstall com.ballsortpuzzle 2>$null
adb uninstall com.ballsortpuzzle.free 2>$null
adb uninstall com.ballsortpuzzle.premium 2>$null

# Step 3: Check device
Write-Host "`n3. Checking device..." -ForegroundColor Yellow
adb devices

# Step 4: Reinstall
Write-Host "`n4. Installing app..." -ForegroundColor Yellow
npx react-native run-android

Write-Host "`n=== Done! ===" -ForegroundColor Green
```

---

## My Recommendation

**For now (development/testing):**

1. Open `android/app/build.gradle`
2. Comment out both `applicationIdSuffix` lines (lines ~112 and ~117)
3. Save the file
4. Run the clean and reinstall commands above
5. App should work!

**For production (later):**

When you're ready to publish, you can:
- Use different `applicationId` values (not suffixes)
- This allows free and premium versions on Play Store simultaneously
- They won't conflict because they have different package names

---

## Expected Output After Fix

```
info Installing the app...
Configuration on demand is an incubating feature.

> Task :app:installFreeDebug
Installing APK 'app-free-debug.apk' on 'Pixel_5_API_33(AVD) - 13'
Installed on 1 device.

> Task :app:startActivityForFreeDebug
Starting: Intent { cmp=com.ballsortpuzzle/.MainActivity }  ← Should see this!

BUILD SUCCESSFUL
```

Then the app should launch on your emulator! 🎉

---

## Still Not Working?

If you still get the error after removing suffixes:

```powershell
# Complete nuclear option
cd android
.\gradlew clean
Remove-Item -Path "build" -Recurse -Force
Remove-Item -Path "app\build" -Recurse -Force
cd ..

adb uninstall com.ballsortpuzzle

npx react-native run-android --reset-cache
```

Good luck! 🚀
