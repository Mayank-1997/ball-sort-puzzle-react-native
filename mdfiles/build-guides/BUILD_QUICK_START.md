# Quick Start: Building Android APK

## ⚡ TL;DR - Fastest Path to Building

### If you have Android Studio installed:
```powershell
.\build-android.ps1
```
**Done!** APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

### If you DON'T have Android Studio:

**Option A: Install Android Studio (Recommended - 15 minutes)**
1. Download: https://developer.android.com/studio
2. Install and open Android Studio
3. Let it download SDK components (automatic)
4. Run: `.\build-android.ps1`

**Option B: Install SDK Only (Advanced - 30 minutes)**
1. Download Command Line Tools: https://developer.android.com/studio#command-tools
2. Extract to `C:\Android\Sdk`
3. Run:
   ```powershell
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\Sdk", "User")
   $env:ANDROID_HOME = "C:\Android\Sdk"
   ```
4. Restart PowerShell
5. Install SDK components:
   ```powershell
   cd C:\Android\Sdk\cmdline-tools\latest\bin
   .\sdkmanager.bat "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```
6. Run: `.\build-android.ps1`

---

## 🔄 Workflow: This Laptop → Other Laptop

### Scenario 1: Both laptops have Android SDK
```powershell
# This laptop
git add .
git commit -m "Your changes"
git push

# Other laptop
git pull
npm install
.\build-android.ps1
```

### Scenario 2: Only one laptop has Android SDK
```powershell
# On laptop WITH SDK:
.\build-android.ps1

# Copy this file to other laptop:
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📋 What We Fixed

✅ Created `android/settings.gradle` (was missing)
✅ Fixed SSL certificate errors in `gradle.properties`
✅ Created automated build script `build-android.ps1`
✅ Configured React Native Gradle plugin

---

## 🆘 Troubleshooting

### "SDK not found" error
→ Install Android Studio OR standalone SDK (see above)

### SSL/Certificate errors
→ Already fixed in `gradle.properties`

### "Gradle plugin not found"
→ Run `npm install` first

### Build takes forever
→ First build is slow (downloads dependencies)
→ Subsequent builds are faster

---

## 📞 Need Help?

See `BUILD_STATUS_REPORT.md` for detailed documentation.
