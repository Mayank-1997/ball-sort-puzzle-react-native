# 🔧 Fix: "gradlew.bat is not recognized" Error

## 🎯 Problem: gradlew.bat Command Not Found

This error occurs when React Native can't find the Android Gradle wrapper. Here are the solutions:

## 🚀 Solution 1: Check Your Current Directory (Most Common Fix)

### **Step 1: Verify You're in the Right Location**
```bash
# Check current directory
pwd

# You should see something like:
# C:\path\to\your\project\ball-sort-puzzle-react-native
# OR
# C:\path\to\your\project\react-native
```

### **Step 2: Navigate to React Native Root**
```bash
# If you're in Android Studio terminal and see "android" folder
cd ..

# Or navigate directly to your React Native project root
cd C:\path\to\your\ball-sort-puzzle-react-native
```

### **Step 3: Verify Android Folder Exists**
```bash
# Check if android folder exists
dir
# OR
ls

# You should see:
# android/
# src/
# package.json
# etc.
```

## 🚀 Solution 2: Install Dependencies First

### **Step 1: Install Node Dependencies**
```bash
npm install
```

### **Step 2: Check gradlew.bat Exists**
```bash
# Check if gradlew.bat exists in android folder
dir android\gradlew.bat
# OR
ls android/gradlew.bat

# Should show the file exists
```

## 🚀 Solution 3: Fix Gradle Wrapper Permissions (Windows)

### **Method A: Run as Administrator**
1. **Close Android Studio**
2. **Right-click Android Studio icon**
3. **Select "Run as Administrator"**
4. **Open your project**
5. **Try `npm run android` again**

### **Method B: Fix File Permissions**
```powershell
# In PowerShell (run as administrator)
cd your\project\path\android
icacls gradlew.bat /grant Everyone:F
icacls gradlew /grant Everyone:F
```

## 🚀 Solution 4: Manual Gradle Build

### **Step 1: Navigate to Android Folder**
```bash
cd android
```

### **Step 2: Run Gradle Commands Manually**
```bash
# Windows
.\gradlew.bat clean
.\gradlew.bat assembleDebug

# If above doesn't work, try:
gradlew clean
gradlew assembleDebug
```

### **Step 3: Install APK Manually**
```bash
# After successful build, install APK
adb install app\build\outputs\apk\debug\app-debug.apk
```

## 🚀 Solution 5: Alternative Build Methods

### **Method A: Use Android Studio GUI**
1. **Open Android Studio**
2. **Click "Build" → "Make Project"** (Ctrl+F9)
3. **After build completes, click Run button (▶️)**

### **Method B: Direct React Native Command**
```bash
# Try with full path specification
npx react-native run-android --verbose

# Or with reset cache
npx react-native run-android --reset-cache
```

## 🚀 Solution 6: Recreate gradlew Files

If gradlew.bat is missing or corrupted:

### **Step 1: Check if files exist**
```bash
cd android
dir gradlew*

# Should show:
# gradlew
# gradlew.bat
```

### **Step 2: If missing, regenerate**
```bash
# In android folder
gradle wrapper

# This recreates gradlew and gradlew.bat
```

## 🔍 **Troubleshooting Steps**

### **Step 1: Verify Project Structure**
Your project should look like this:
```
ball-sort-puzzle-react-native/
├── android/
│   ├── gradlew
│   ├── gradlew.bat          ← This file must exist
│   ├── build.gradle
│   └── app/
├── src/
├── package.json
└── node_modules/
```

### **Step 2: Environment Check**
```bash
# Verify these commands work:
java -version          # Should show Java 11 or newer
node --version         # Should show Node.js 18+
npm --version          # Should show npm version
adb devices           # Should show connected devices/emulators
```

### **Step 3: Clean Everything**
```bash
# Clean npm cache
npm start -- --reset-cache

# Clean Android build
cd android
.\gradlew.bat clean
cd ..

# Clean node modules
rm -rf node_modules
npm install

# Try build again
npm run android
```

## 🎯 **Quick Fix Commands (Try in Order)**

### **Option 1: Standard Fix**
```bash
# Ensure you're in project root
cd your-react-native-project
npm install
npm run android
```

### **Option 2: Manual Build**
```bash
# Navigate to android folder
cd android

# Clean build
.\gradlew.bat clean

# Build debug APK
.\gradlew.bat assembleDebug

# Go back to root
cd ..

# Start Metro bundler
npm start

# In another terminal, install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### **Option 3: Use Android Studio**
1. **Open your project in Android Studio**
2. **Wait for Gradle sync to complete**
3. **Build → Make Project**
4. **Click Run button**

## 🚨 **Common Mistakes to Avoid**

1. **Wrong Directory:** Running `npm run android` from inside `/android` folder
2. **Missing Dependencies:** Not running `npm install` first  
3. **No Emulator:** Not having device/emulator connected
4. **Permissions:** Not running as administrator on Windows
5. **Path Issues:** Spaces or special characters in folder path

## ✅ **Success Indicators**

When fixed, you should see:
```
> Configure project :app
> Task :app:generatePackageList
> Task :app:createBundleReleaseJsAndAssets
...
BUILD SUCCESSFUL
Installing APK 'app-debug.apk' on 'emulator-5554'
Starting the app...
```

Try these solutions in order, and let me know which one works for you! The most common fix is ensuring you're in the right directory and running as administrator. 🚀