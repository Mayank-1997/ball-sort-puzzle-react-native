# Running Android App on Device - Complete Guide

## Prerequisites

Before running the app, ensure your Gradle build is successful (✅ You've done this!)

---

## Option 1: Run on Physical Android Device (Recommended for Testing)

### Step 1: Enable Developer Options on Your Phone

1. **Open Settings** on your Android phone
2. Go to **About Phone** (or **About Device**)
3. Find **Build Number** (might be under "Software Information")
4. **Tap Build Number 7 times** rapidly
5. You'll see a message: "You are now a developer!"

### Step 2: Enable USB Debugging

1. Go back to **Settings**
2. Find **Developer Options** (usually under System or Additional Settings)
3. Enable **Developer Options** (toggle ON)
4. Scroll down and enable **USB Debugging**
5. Enable **Install via USB** (if available)

### Step 3: Connect Your Phone to Computer

1. **Connect phone via USB cable** to your laptop
2. On your phone, you'll see a popup: **"Allow USB debugging?"**
3. Check **"Always allow from this computer"**
4. Click **Allow** or **OK**

### Step 4: Verify Connection in Android Studio

1. In Android Studio, look at the **device dropdown** (top toolbar)
2. Click the dropdown next to the green "Run" button
3. You should see your device name (e.g., "Samsung Galaxy S21", "Pixel 7")

**If device doesn't appear:**
```powershell
# Open PowerShell and check connected devices
cd android
.\gradlew --stop
cd ..

# Check ADB connection
adb devices
```

**Expected output:**
```
List of devices attached
ABC123XYZ    device
```

**If shows "unauthorized":**
- Disconnect and reconnect USB cable
- Make sure you clicked "Allow" on phone popup
- Try running: `adb kill-server` then `adb start-server`

### Step 5: Run the App

**Method 1: Using Android Studio UI**
1. Select your device from the dropdown
2. Click the green **"Run"** button (▶️) or press **Shift + F10**
3. Wait for build to complete
4. App will install and launch on your phone automatically

**Method 2: Using Command Line**
```powershell
# Navigate to android folder
cd android

# Install and run debug build
.\gradlew installDebug

# Or install specific variant
.\gradlew installFreeDebug
.\gradlew installPaidDebug
```

### Step 6: Enable Metro Bundler (React Native)

Since this is a React Native app, you also need Metro bundler running:

**Terminal 1 (Metro Bundler):**
```powershell
# In project root (not android folder)
npx react-native start
```

**Terminal 2 (Install App):**
```powershell
# In project root
npx react-native run-android
```

OR if Metro is already running, just use Android Studio's Run button.

---

## Option 2: Run on Android Emulator (Virtual Device)

### Step 1: Create Android Virtual Device (AVD)

1. In Android Studio, click **Tools → Device Manager**
2. Click **Create Device** (+ button)
3. **Select Hardware:**
   - Choose a device (e.g., "Pixel 5" or "Pixel 7")
   - Click **Next**

4. **Select System Image:**
   - Choose Android version (recommend Android 13 - API 33 or Android 14 - API 34)
   - Click **Download** next to the image (if not already downloaded)
   - Wait for download to complete (~1-2 GB)
   - Click **Next**

5. **Verify Configuration:**
   - AVD Name: (e.g., "Pixel_5_API_33")
   - Click **Finish**

### Step 2: Start the Emulator

**Method 1: From Device Manager**
1. In Device Manager, find your AVD
2. Click the **Play** button (▶️)
3. Wait for emulator to boot (30-60 seconds)

**Method 2: From Command Line**
```powershell
# List available AVDs
emulator -list-avds

# Start specific AVD
emulator -avd Pixel_5_API_33
```

### Step 3: Run the App on Emulator

1. Once emulator is running, it will appear in the device dropdown
2. Select the emulator from dropdown
3. Click the green **"Run"** button (▶️)
4. App will install and launch on emulator

---

## Complete Workflow (Recommended)

### For Physical Device:

**One-time Setup:**
```powershell
# 1. Enable Developer Options + USB Debugging on phone
# 2. Connect phone via USB
# 3. Allow USB debugging on phone popup
```

**Every Time You Want to Run:**

**Terminal 1 - Start Metro Bundler:**
```powershell
# In project root
npx react-native start
```

**Terminal 2 - Run on Device:**
```powershell
# In project root
npx react-native run-android
```

OR just use Android Studio:
1. Click **Run** button (▶️)
2. Metro starts automatically
3. App installs and launches

---

## Troubleshooting

### Issue 1: Device Not Detected

**Solution:**
```powershell
# Kill and restart ADB server
adb kill-server
adb start-server

# Check devices again
adb devices
```

**If still not working:**
- Try different USB cable
- Try different USB port on laptop
- Enable **"Transfer Files"** mode on phone (not just charging)
- Install phone manufacturer's USB drivers (Samsung, Xiaomi, etc.)

### Issue 2: "App installation failed"

**Solution:**
```powershell
# Uninstall old version first
adb uninstall com.ballsortpuzzle

# Then reinstall
cd android
.\gradlew installDebug
```

### Issue 3: Metro Bundler Connection Failed

**On Phone:**
1. Shake the device (or press hardware menu button)
2. Tap **"Settings"**
3. Tap **"Dev Settings"**
4. Tap **"Debug server host & port for device"**
5. Enter: `YOUR_COMPUTER_IP:8081` (e.g., `192.168.1.100:8081`)

**Find Your Computer IP:**
```powershell
# Windows
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**Then reload:**
- Shake device again
- Tap **"Reload"**

### Issue 4: Red Screen Error on App Launch

**Common causes:**
- Metro bundler not running
- JavaScript bundle not loaded
- Network connection issue

**Solution:**
```powershell
# Clear React Native cache
npx react-native start --reset-cache

# Or
cd android
.\gradlew clean
cd ..
npx react-native run-android
```

### Issue 5: Emulator is Slow

**Solutions:**
1. **Enable Hardware Acceleration:**
   - Install Intel HAXM (Hardware Accelerated Execution Manager)
   - Or AMD Hypervisor (for AMD processors)

2. **Increase Emulator RAM:**
   - Device Manager → Edit AVD → Show Advanced Settings
   - Increase RAM to 2048 MB or 4096 MB

3. **Use Lighter Android Version:**
   - Use Android 10 (API 29) instead of Android 14

4. **Use Physical Device Instead:**
   - Much faster than emulator

---

## Build Variants Selection

Your app has multiple build variants:

```
Build Variants:
├── freeDebug       ← Free version with debug features
├── freeRelease     ← Free version for production
├── paidDebug       ← Paid version with debug features
└── paidRelease     ← Paid version for production
```

### How to Switch Variants in Android Studio:

1. Click **View → Tool Windows → Build Variants**
2. In the Build Variants panel, select desired variant from dropdown
3. Click **Run** button

### How to Install Specific Variant:

```powershell
# Free Debug
.\gradlew installFreeDebug

# Paid Debug
.\gradlew installPaidDebug

# Free Release (needs signing)
.\gradlew installFreeRelease

# Paid Release (needs signing)
.\gradlew installPaidRelease
```

---

## Testing Features

### View Logs in Android Studio:

1. Click **View → Tool Windows → Logcat**
2. Select your device/emulator
3. Filter by package: `com.ballsortpuzzle`
4. View all console.log() outputs and error messages

### View Logs via Command Line:

```powershell
# View all logs
adb logcat

# Filter by app
adb logcat | Select-String "ballsort"

# View React Native logs
adb logcat *:S ReactNative:V ReactNativeJS:V
```

### Debug JavaScript:

1. Shake the device (or Ctrl+M on emulator)
2. Tap **"Debug"**
3. Opens Chrome DevTools for debugging
4. Set breakpoints, inspect variables, etc.

### Hot Reload (Fast Refresh):

React Native supports hot reload:
- Make changes to JavaScript files
- Save the file
- App automatically reloads with changes (no reinstall needed!)

---

## Performance Tips

### For Faster Development:

1. **Use Physical Device** instead of emulator
2. **Enable Fast Refresh:**
   - Shake device → Settings → Enable Fast Refresh
3. **Use Debug Build** (much faster to compile than Release)
4. **Keep Metro Running** (don't stop/restart unless needed)

### Build Time Optimization:

```gradle
// Already configured in your gradle.properties
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.daemon=true
```

---

## Quick Reference Commands

```powershell
# Check connected devices
adb devices

# Install debug APK
cd android
.\gradlew installDebug

# Uninstall app
adb uninstall com.ballsortpuzzle

# Start Metro bundler
npx react-native start

# Run on Android (builds + installs + starts Metro)
npx react-native run-android

# View logs
adb logcat

# Clear app data
adb shell pm clear com.ballsortpuzzle

# Take screenshot
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png

# Record video
adb shell screenrecord /sdcard/demo.mp4
# (Press Ctrl+C to stop)
adb pull /sdcard/demo.mp4
```

---

## Complete Step-by-Step (First Time)

### If Using Physical Device:

```powershell
# 1. Enable USB Debugging on phone (see Step 1-2 above)

# 2. Connect phone to laptop via USB

# 3. Check connection
adb devices
# Should show: ABC123XYZ    device

# 4. Start Metro bundler in Terminal 1
npx react-native start

# 5. Run app in Terminal 2 (or use Android Studio Run button)
npx react-native run-android

# 6. Wait for app to install and launch on phone

# 7. App should open automatically!
```

### If Using Emulator:

```powershell
# 1. Create AVD in Android Studio (see Option 2 above)

# 2. Start emulator
emulator -avd Pixel_5_API_33

# 3. Wait for emulator to boot fully

# 4. Start Metro bundler
npx react-native start

# 5. Run app
npx react-native run-android

# 6. App installs and launches on emulator
```

---

## Expected Output

When everything works correctly:

```
Terminal (Metro):
✓ Metro bundler running on port 8081
✓ Fast Refresh enabled

Phone/Emulator:
✓ App installs
✓ Splash screen appears
✓ Menu screen loads
✓ Game is playable!

Android Studio Logcat:
✓ No red errors
✓ React Native initialized
✓ JavaScript bundle loaded
```

---

## Next Steps After Running

Once app is running on device:

1. ✅ **Test all screens** (Menu, Game, Settings, etc.)
2. ✅ **Test gameplay** (ball sorting mechanics)
3. ✅ **Test AdMob** (banner ads, rewarded ads)
4. ✅ **Test Google Play Games** (achievements, leaderboards)
5. ✅ **Test audio** (sound effects, music)
6. ✅ **Test different levels**
7. ✅ **Test persistence** (saved progress)

---

## Release Build (For Distribution)

When ready to share or publish:

```powershell
# Build release APK
cd android
.\gradlew assembleRelease

# Output location:
# android/app/build/outputs/apk/free/release/app-free-release.apk
# android/app/build/outputs/apk/paid/release/app-paid-release.apk

# Build AAB for Google Play Store
.\gradlew bundleRelease

# Output location:
# android/app/build/outputs/bundle/freeRelease/app-free-release.aab
# android/app/build/outputs/bundle/paidRelease/app-paid-release.aab
```

**Note:** Release builds need proper signing keys configured.

---

## Summary Checklist

For Physical Device:
- [ ] Enable Developer Options on phone
- [ ] Enable USB Debugging
- [ ] Connect phone via USB
- [ ] Allow USB debugging popup
- [ ] Verify `adb devices` shows device
- [ ] Start Metro: `npx react-native start`
- [ ] Run app: Click Run in Android Studio
- [ ] App launches on phone

For Emulator:
- [ ] Create AVD in Android Studio
- [ ] Start emulator
- [ ] Wait for emulator to boot
- [ ] Start Metro: `npx react-native start`
- [ ] Run app: Click Run in Android Studio
- [ ] App launches on emulator

---

## Need Help?

Common questions:
- **Q:** Do I need Metro running for release builds?
  - **A:** No, only for development (debug builds)

- **Q:** Can I run on multiple devices simultaneously?
  - **A:** Yes! Just connect multiple devices/start multiple emulators

- **Q:** How do I update the app after code changes?
  - **A:** Just click Run again, or use Fast Refresh for JS changes

- **Q:** The app crashes immediately after launch
  - **A:** Check Logcat for errors, ensure Metro is running, try `npx react-native start --reset-cache`

Good luck with your Ball Sort Puzzle game! 🎮🎉
