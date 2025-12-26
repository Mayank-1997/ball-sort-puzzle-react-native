# Import React Native Project as Android Application (New Laptop Setup)

**Date:** December 26, 2025  
**Purpose:** Complete guide to import Ball Sort Puzzle React Native project on a new laptop and build it as a standalone Android application

---

## 🎯 Overview

This guide covers:
1. ✅ Setting up development environment on new laptop
2. ✅ Importing the React Native project
3. ✅ Building as Android application (APK/AAB)
4. ✅ Opening and working with project in Android Studio

---

## 📋 Prerequisites Installation (New Laptop)

### Step 1: Install Required Software

#### A. Install Node.js (Required for React Native)

1. Download from: https://nodejs.org/
2. Download **LTS version** (v18.x or v20.x)
3. Run installer with **default settings**
4. Verify installation:
```powershell
node --version
npm --version
```

**Expected output:**
```
v20.10.0
10.2.3
```

---

#### B. Install Git (Required for Version Control)

1. Download from: https://git-scm.com/download/win
2. Run installer with **default settings**
3. Verify installation:
```powershell
git --version
```

**Expected output:**
```
git version 2.43.0.windows.1
```

---

#### C. Install Android Studio (Required for Android Development)

1. **Download:** https://developer.android.com/studio
2. **Install** with these components:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device (AVD)
   - ✅ Performance (Intel® HAXM) - For emulator

3. **During first launch:**
   - Choose **Standard** installation
   - Accept licenses
   - Wait for SDK download (2-3 GB)

4. **Install Required SDK Components:**
   - Open Android Studio
   - Go to: **Tools → SDK Manager**
   - Under **SDK Platforms** tab, install:
     - ✅ Android 14.0 (API 34) - Latest
     - ✅ Android 13.0 (API 33)
     - ✅ Android 12.0 (API 31)
   - Under **SDK Tools** tab, install:
     - ✅ Android SDK Build-Tools 34
     - ✅ Android SDK Command-line Tools
     - ✅ Android Emulator
     - ✅ Android SDK Platform-Tools
     - ✅ Intel x86 Emulator Accelerator (HAXM installer)

---

#### D. Set Environment Variables (Critical!)

**For Windows:**

1. **Open System Environment Variables:**
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Click **Environment Variables**

2. **Add ANDROID_HOME:**
   - Click **New** under **User variables**
   - **Variable name:** `ANDROID_HOME`
   - **Variable value:** `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   - (Replace `YourUsername` with your actual username)

3. **Add to PATH:**
   - Find **Path** variable under **User variables**
   - Click **Edit**
   - Click **New** and add:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\emulator`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\tools\bin`

4. **Verify (open NEW PowerShell):**
```powershell
echo $env:ANDROID_HOME
adb --version
```

**Expected output:**
```
C:\Users\YourUsername\AppData\Local\Android\Sdk
Android Debug Bridge version 1.0.41
```

---

#### E. Install Java Development Kit (JDK)

**Option 1: Use Android Studio's Embedded JDK (Recommended)**
- Android Studio includes JDK
- Location: `C:\Program Files\Android\Android Studio\jbr`
- Set `JAVA_HOME` to this path

**Option 2: Install Separate JDK**
1. Download JDK 17: https://adoptium.net/
2. Install with default settings
3. Add `JAVA_HOME` environment variable
4. Add `%JAVA_HOME%\bin` to PATH

**Verify:**
```powershell
java -version
```

**Expected output:**
```
openjdk version "17.0.x"
```

---

### Step 2: Create Android Virtual Device (AVD)

1. Open **Android Studio**
2. Click **Device Manager** (phone icon on right)
3. Click **Create Device**
4. Select **Phone → Pixel 5** → Next
5. Download **System Image:**
   - Select **API 34** (Android 14)
   - Click **Download** (wait for completion)
   - Click **Next**
6. Name: `Pixel_5_API_34`
7. Click **Finish**

**Test emulator:**
```powershell
emulator -list-avds
# Should show: Pixel_5_API_34
```

---

## 📥 Import Project on New Laptop

### Step 1: Clone Repository from GitHub

```powershell
# Navigate to desired location
cd C:\Users\YourUsername\Desktop

# Create project folder
New-Item -Path "game-projects" -ItemType Directory -Force
cd game-projects

# Clone repository
git clone https://github.com/Mayank-1997/ball-sort-puzzle-react-native.git

# Navigate to project
cd ball-sort-puzzle-react-native
```

**Verify project structure:**
```powershell
Get-ChildItem
```

You should see:
- `android/` folder
- `src/` folder
- `package.json`
- `App.js`
- `index.js`

---

### Step 2: Install Project Dependencies

```powershell
# Install Node.js dependencies
npm install --legacy-peer-deps
```

**This will take 5-10 minutes!** It downloads ~1250 packages.

**Why `--legacy-peer-deps`?**  
React Native 0.73.2 has peer dependency conflicts. This flag resolves them.

**Expected output:**
```
added 1250 packages in 8m
```

**Verify:**
```powershell
Test-Path "node_modules"  # Should return True
```

---

### Step 3: Configure Git for This Project (Optional)

If you want to commit changes:

```powershell
# Set your Git credentials for this repository
git config --local user.name "Your Name"
git config --local user.email "your.email@gmail.com"

# Verify
git config user.name
git config user.email
```

---

## 🏗️ Building the Android Application

### Option 1: Build Debug APK (For Testing)

This creates an installable APK file for testing.

#### Step 1: Start Metro Bundler
```powershell
# Terminal 1
npx react-native start --reset-cache
```

Wait for: **"Metro waiting on port 8081"**

#### Step 2: Build Debug APK
```powershell
# Terminal 2 (new terminal window)
cd android

# Build FREE Debug APK
.\gradlew assembleFreeDebug

# Or build PREMIUM Debug APK
.\gradlew assemblePremiumDebug
```

**Build time:** 2-5 minutes (first time), 30 seconds (subsequent builds)

**Output location:**
```
android/app/build/outputs/apk/free/debug/app-free-debug.apk
```

**File size:** ~50-80 MB

#### Step 3: Install on Device/Emulator
```powershell
# Start emulator first
emulator -avd Pixel_5_API_34

# Install APK
adb install -r "app\build\outputs\apk\free\debug\app-free-debug.apk"
```

**Success message:**
```
Success
```

---

### Option 2: Build Release APK (For Distribution)

This creates an optimized, signed APK for distribution.

#### Step 1: Generate Signing Key (First Time Only)

```powershell
# Navigate to android/app
cd android\app

# Generate release keystore
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# You'll be asked:
# - Keystore password: [CREATE STRONG PASSWORD]
# - Key password: [SAME PASSWORD]
# - Your name: [Your Name]
# - Organization: [Your Company/Name]
# - City, State, Country: [Your Info]
```

**IMPORTANT:** Save this information securely!
- Keystore file: `my-release-key.keystore`
- Keystore password: [Your password]
- Key alias: `my-key-alias`
- Key password: [Your password]

**⚠️ WARNING:** Never lose this keystore! You need it for all app updates.

#### Step 2: Configure Gradle for Release Signing

Create file: `android/gradle.properties` (add to existing file)

```properties
# Release signing configuration
MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=YourKeystorePassword
MYAPP_UPLOAD_KEY_PASSWORD=YourKeyPassword
```

**⚠️ NEVER commit this file with passwords to Git!**

Add to `.gitignore`:
```
# Signing credentials
gradle.properties
*.keystore
```

#### Step 3: Build Release APK

```powershell
# Navigate to android folder
cd android

# Clean previous builds
.\gradlew clean

# Build FREE Release APK
.\gradlew assembleFreeRelease

# Or build PREMIUM Release APK
.\gradlew assemblePremiumRelease
```

**Build time:** 5-10 minutes (includes ProGuard optimization)

**Output location:**
```
android/app/build/outputs/apk/free/release/app-free-release.apk
```

**File size:** ~15-25 MB (optimized with ProGuard)

---

### Option 3: Build AAB (For Google Play Store)

Android App Bundle is the recommended format for Play Store.

```powershell
cd android

# Build FREE Release AAB
.\gradlew bundleFreeRelease

# Or build PREMIUM Release AAB
.\gradlew bundlePremiumRelease
```

**Output location:**
```
android/app/build/outputs/bundle/freeRelease/app-free-release.aab
```

**File size:** ~10-15 MB

**Use AAB for:**
- ✅ Google Play Store uploads
- ✅ Smaller download size (Google generates optimized APKs)
- ✅ Dynamic delivery

---

## 🔨 Opening Project in Android Studio

### Method 1: Open as React Native Project

1. Open **Android Studio**
2. Click **Open**
3. Navigate to: `ball-sort-puzzle-react-native\android`
4. Click **OK**
5. Wait for Gradle sync (2-3 minutes)

**Android Studio will show:**
- `app` module (your app code)
- Gradle scripts
- Java/Kotlin files
- AndroidManifest.xml

---

### Method 2: Import Existing Project

1. Open **Android Studio**
2. Click **File → Open**
3. Select the **`android`** folder
4. Click **OK**
5. Android Studio will:
   - ✅ Detect Gradle project
   - ✅ Sync dependencies
   - ✅ Index files
   - ✅ Build project configuration

---

### What You Can Do in Android Studio

#### A. Edit Native Android Code
- **MainActivity.java:** Main entry point
- **MainApplication.java:** App initialization
- **AndroidManifest.xml:** Permissions, activities
- **build.gradle:** Build configuration
- **res/:** Resources (icons, strings, layouts)

#### B. Run on Emulator
1. Select **app** from run configuration dropdown
2. Select build variant: **freeDebug** or **premiumDebug**
3. Click ▶️ **Run**
4. Select emulator
5. App builds and launches

#### C. Debug Native Code
1. Set breakpoints in Java/Kotlin files
2. Click 🐛 **Debug**
3. App runs in debug mode
4. Inspect variables, stack traces

#### D. Build APK/AAB
1. **Build → Build Bundle(s) / APK(s)**
2. Select:
   - **Build APK(s)** - For testing
   - **Build Bundle(s)** - For Play Store
3. Wait for build
4. Click **locate** to find output file

---

## 🔄 Complete Workflow: From Import to APK

### Fresh Setup on New Laptop

```powershell
# === STEP 1: Install Prerequisites ===
# (Install Node.js, Git, Android Studio, Java)
# (Set ANDROID_HOME environment variable)
# (Create Android emulator)

# === STEP 2: Clone Repository ===
cd C:\Users\YourUsername\Desktop
mkdir game-projects
cd game-projects
git clone https://github.com/Mayank-1997/ball-sort-puzzle-react-native.git
cd ball-sort-puzzle-react-native

# === STEP 3: Install Dependencies ===
npm install --legacy-peer-deps

# === STEP 4: Start Metro Bundler ===
# Terminal 1:
npx react-native start --reset-cache

# === STEP 5: Build and Test (Terminal 2) ===
# Option A: Run on emulator directly
npx react-native run-android --mode=freeDebug

# Option B: Build APK manually
cd android
.\gradlew assembleFreeDebug
adb install -r "app\build\outputs\apk\free\debug\app-free-debug.apk"

# === STEP 6: Build Release APK (For Distribution) ===
cd android
.\gradlew assembleFreeRelease
# APK at: android/app/build/outputs/apk/free/release/app-free-release.apk
```

---

## 🎯 Build Variants Explained

Your project has **4 build variants**:

| Variant | Description | Use Case | Output |
|---------|-------------|----------|--------|
| **freeDebug** | Free version with debug tools | Development, testing | `app-free-debug.apk` |
| **premiumDebug** | Premium version with debug tools | Premium features testing | `app-premium-debug.apk` |
| **freeRelease** | Free version optimized | Production, Play Store | `app-free-release.apk` |
| **premiumRelease** | Premium version optimized | Premium Play Store | `app-premium-release.apk` |

**Package names:**
- Free: `com.ballsortpuzzle`
- Premium: `com.ballsortpuzzle.premium`

---

## 🐛 Common Issues When Importing on New Laptop

### Issue 1: "ANDROID_HOME is not set"

**Error:**
```
SDK location not found. Define location with an ANDROID_SDK_ROOT environment variable
```

**Fix:**
```powershell
# Set environment variable
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\YourUsername\AppData\Local\Android\Sdk', 'User')

# Restart PowerShell and verify
echo $env:ANDROID_HOME
```

---

### Issue 2: "npm install" fails with peer dependency errors

**Error:**
```
ERESOLVE unable to resolve dependency tree
```

**Fix:**
```powershell
# Use legacy peer deps flag
npm install --legacy-peer-deps

# Or use --force (if above fails)
npm install --force
```

---

### Issue 3: Gradle sync fails in Android Studio

**Error:**
```
Could not determine the dependencies of task ':app:compileDebugJavaWithJavac'
```

**Fix:**
```powershell
# Clean Gradle cache
cd android
.\gradlew clean
.\gradlew --stop

# Delete gradle cache
Remove-Item -Path ".gradle" -Recurse -Force

# Sync again in Android Studio:
# File → Sync Project with Gradle Files
```

---

### Issue 4: "Unable to locate adb"

**Error:**
```
adb: command not found
```

**Fix:**
```powershell
# Add platform-tools to PATH
$env:Path += ";C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools"

# Or permanently add to system PATH (see environment variables section)
```

---

### Issue 5: Build fails with "ENOENT: no such file or directory"

**Error:**
```
Error: ENOENT: no such file or directory, open '...\index.android.bundle'
```

**Fix:**
```powershell
# Create missing directories
New-Item -Path "android\app\build\generated\assets\createBundleFreeDebugJsAndAssets\assets" -ItemType Directory -Force

# Then rebuild
cd android
.\gradlew assembleFreeDebug
```

---

### Issue 6: "Java version is not compatible"

**Error:**
```
Unsupported class file major version 65
```

**Fix:**
```powershell
# Use Java 17 (required for Android Gradle Plugin 8.x)
# Set JAVA_HOME to JDK 17 location

# Verify Java version
java -version
# Should show: openjdk version "17.0.x"
```

---

## 📦 APK File Locations & Sizes

After successful builds, find your APK files here:

```
android/app/build/outputs/apk/
├── free/
│   ├── debug/
│   │   └── app-free-debug.apk           (~60 MB)
│   └── release/
│       └── app-free-release.apk         (~20 MB, optimized)
└── premium/
    ├── debug/
    │   └── app-premium-debug.apk        (~60 MB)
    └── release/
        └── app-premium-release.apk      (~20 MB, optimized)
```

**AAB files:**
```
android/app/build/outputs/bundle/
├── freeRelease/
│   └── app-free-release.aab             (~15 MB)
└── premiumRelease/
    └── app-premium-release.aab          (~15 MB)
```

---

## 🚀 Distribution Options

### Option 1: Direct APK Installation (Testing)

**Share APK file via:**
- USB transfer
- Email (if < 25 MB)
- Google Drive / Dropbox
- File sharing apps

**Install on device:**
1. Enable **Settings → Security → Unknown Sources**
2. Transfer APK to device
3. Open APK file
4. Tap **Install**

---

### Option 2: Google Play Store (Production)

**Required files:**
- ✅ AAB file: `app-free-release.aab`
- ✅ App icon: 512x512 PNG
- ✅ Screenshots: Various sizes
- ✅ Privacy Policy URL
- ✅ App description
- ✅ Store listing graphics

**Steps:**
1. Create Google Play Console account ($25 one-time fee)
2. Create new app
3. Upload AAB file
4. Complete store listing
5. Submit for review
6. Wait 1-3 days for approval

---

### Option 3: Internal Testing

**For testing with team:**

1. Build release APK
2. Use distribution platforms:
   - **Firebase App Distribution** (free)
   - **TestFlight** (iOS only)
   - **App Center** (Microsoft)

3. Share download link with testers

---

## 📝 Checklist: New Laptop Setup

Print this and check off as you complete each step:

### Environment Setup:
- [ ] Node.js installed and verified (`node --version`)
- [ ] Git installed and verified (`git --version`)
- [ ] Android Studio installed
- [ ] Android SDK installed (API 34, 33, 31)
- [ ] ANDROID_HOME environment variable set
- [ ] PATH updated with Android SDK tools
- [ ] Java JDK 17 installed
- [ ] Android emulator created and tested

### Project Import:
- [ ] Repository cloned from GitHub
- [ ] npm dependencies installed (`npm install --legacy-peer-deps`)
- [ ] node_modules folder exists
- [ ] Git configured (name and email)

### Build Verification:
- [ ] Metro bundler starts successfully
- [ ] Debug APK builds without errors
- [ ] App installs on emulator
- [ ] App launches without crashes
- [ ] App shows game UI correctly

### Android Studio:
- [ ] Project opens in Android Studio
- [ ] Gradle sync completes successfully
- [ ] No red errors in editor
- [ ] Can run app from Android Studio
- [ ] Can build APK from Android Studio menu

### Release Build (Optional):
- [ ] Keystore generated and saved securely
- [ ] gradle.properties configured with signing keys
- [ ] Release APK builds successfully
- [ ] Release APK installs and runs on device

---

## 🎓 Understanding the Build Process

### What Happens When You Build?

```
1. Metro Bundler
   ├─ Reads index.js
   ├─ Transforms JSX → JavaScript (Babel)
   ├─ Bundles all JS files
   └─ Creates: index.android.bundle

2. Gradle Build System
   ├─ Compiles Java/Kotlin code
   ├─ Processes AndroidManifest.xml
   ├─ Bundles resources (icons, strings)
   ├─ Links native libraries
   ├─ Embeds JavaScript bundle
   ├─ [Release only] ProGuard optimization
   ├─ [Release only] Signs APK with keystore
   └─ Creates: app-free-debug.apk

3. Output
   ├─ Installable APK file
   └─ Ready to run on Android devices!
```

---

## 💡 Pro Tips for New Laptop Setup

1. **Install everything in order** - Don't skip prerequisites
2. **Use legacy-peer-deps** - Always use this flag with npm install
3. **Close and reopen terminals** - After setting environment variables
4. **First build takes time** - 5-10 minutes is normal
5. **Keep keystore safe** - Store in password manager + cloud backup
6. **Use release builds sparingly** - They take much longer to build
7. **Test on real device** - Emulator doesn't always match real performance
8. **Keep Android Studio updated** - Update when prompted
9. **Use Gradle offline mode** - If internet is slow (File → Settings → Gradle → Offline work)
10. **Clean regularly** - Run `gradlew clean` if builds act weird

---

## 🆘 Quick Recovery Script (New Laptop)

Save as `setup-new-laptop.ps1`:

```powershell
# Setup script for new laptop
Write-Host "🚀 Setting up Ball Sort Puzzle on new laptop..." -ForegroundColor Green

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node.js installed: " -NoNewline
    node --version
} else {
    Write-Host "❌ Node.js not found! Install from nodejs.org" -ForegroundColor Red
    exit
}

# Check Git
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "✅ Git installed: " -NoNewline
    git --version
} else {
    Write-Host "❌ Git not found! Install from git-scm.com" -ForegroundColor Red
    exit
}

# Check Android SDK
if ($env:ANDROID_HOME) {
    Write-Host "✅ ANDROID_HOME: $env:ANDROID_HOME"
} else {
    Write-Host "❌ ANDROID_HOME not set! Configure environment variables" -ForegroundColor Red
    exit
}

# Check ADB
if (Get-Command adb -ErrorAction SilentlyContinue) {
    Write-Host "✅ ADB available"
} else {
    Write-Host "⚠️  ADB not in PATH. Add platform-tools to PATH" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "`n📦 Installing npm dependencies..." -ForegroundColor Cyan
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit
}

Write-Host "`n🎉 Setup complete! You can now build the app." -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Start Metro: npx react-native start --reset-cache"
Write-Host "2. Build app: npx react-native run-android --mode=freeDebug"
```

**Run it:**
```powershell
.\setup-new-laptop.ps1
```

---

## 📚 Related Documentation

- **Fresh start guide:** `mdfiles/2025-12-26/START_APP_COMPLETE_GUIDE.md`
- **Project files explanation:** `mdfiles/2025-11-30/PROJECT_FILES_GUIDE.md`
- **Clean build procedure:** `mdfiles/2025-11-30/CLEAN_BUILD_FRESH_START.md`
- **Troubleshooting:** `mdfiles/2025-11-30/APP_LAUNCH_FAILED_FIX.md`

---

**You're all set! Happy building! 🎉📱**

**Last Updated:** December 26, 2025  
**Version:** 1.0.0  
**Next:** Start building and testing your Ball Sort Puzzle game!
