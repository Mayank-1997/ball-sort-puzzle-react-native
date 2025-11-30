# Clean Build and Fresh Start Guide

This guide will help you completely clean all caches and start fresh with your React Native project.

---

## When to Use This

Use this complete clean when you encounter:
- ❌ Persistent build errors
- ❌ "Unable to resolve module" errors
- ❌ Metro bundler stuck or not updating
- ❌ Gradle build failures
- ❌ App showing old cached code
- ❌ Strange behavior after pulling new code

---

## Complete Clean Build Script

Run these commands in PowerShell:

### Step 1: Stop All Node/Metro Processes

```powershell
# Kill all running Node.js processes (Metro bundler)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

### Step 2: Navigate to Project Root

```powershell
# Replace with your actual project path
cd C:\Users\91858\Desktop\game-react-native\ball-sort-puzzle-react-native
```

---

### Step 3: Clean Android Build

```powershell
# Navigate to android folder
cd android

# Clean all build artifacts
.\gradlew clean

# Stop all Gradle daemon processes
.\gradlew --stop

# Go back to project root
cd ..
```

**What this does:**
- Deletes `android/app/build` and `android/build` folders
- Removes all compiled code and generated files
- Stops background Gradle processes

---

### Step 4: Delete All Cache Folders

```powershell
# Remove node_modules (JavaScript dependencies)
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# Remove Android build folders
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue

# Remove React Native temp files
Remove-Item -Path "$env:TEMP\react-*" -Recurse -Force -ErrorAction SilentlyContinue

# Remove Metro bundler cache
Remove-Item -Path "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue

# Remove additional temp files
Remove-Item -Path "$env:LOCALAPPDATA\Temp\react-*" -Recurse -Force -ErrorAction SilentlyContinue
```

**What this deletes:**
- `node_modules/` - All JavaScript packages (~500 MB)
- `android/app/build/` - Compiled Android code
- `android/build/` - Gradle build cache
- React Native temp files
- Metro bundler cache

---

### Step 5: Clear Gradle Cache (Optional but Thorough)

```powershell
# Remove Gradle cache (downloaded dependencies)
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
```

**Warning:** This deletes ~1-2 GB of cached Gradle dependencies. They will be re-downloaded on next build (takes 5-10 minutes).

**Skip this step** if you want faster rebuild and your Gradle cache is fine.

---

### Step 6: Fresh npm Install

```powershell
# Install all JavaScript dependencies fresh
npm install --legacy-peer-deps
```

**What this does:**
- Downloads all packages from `package.json`
- Recreates `node_modules/` folder
- Uses `--legacy-peer-deps` to avoid React version conflicts

**Time:** 2-5 minutes depending on internet speed

---

### Step 7: Uninstall App from Emulator

```powershell
# Remove the app from connected device/emulator
adb uninstall com.ballsortpuzzle
```

**Note:** This command will fail if:
- No device/emulator is connected (that's OK, ignore it)
- App isn't installed (that's OK, ignore it)

---

### Step 8: Start Metro Bundler with Clean Cache

```powershell
# Start Metro with cache reset
npx react-native start --reset-cache
```

**What this does:**
- Starts Metro bundler (JavaScript packager)
- Resets Metro's internal cache
- Watches for file changes
- Enables Fast Refresh

**Leave this terminal running!**

---

### Step 9: Build and Run (New Terminal)

Open a **new terminal** and run:

```powershell
# Navigate to project
cd C:\Users\91858\Desktop\game-react-native\ball-sort-puzzle-react-native

# Run the app
npx react-native run-android
```

---

## Complete Script (Copy-Paste All)

Save this as `clean-and-run.ps1`:

```powershell
Write-Host "=== Starting Complete Clean Build ===" -ForegroundColor Cyan

# 1. Stop all Node/Metro processes
Write-Host "`n[1/9] Stopping Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Navigate to project root
Write-Host "`n[2/9] Navigating to project..." -ForegroundColor Yellow
cd C:\Users\91858\Desktop\game-react-native\ball-sort-puzzle-react-native

# 3. Clean Android build
Write-Host "`n[3/9] Cleaning Android build..." -ForegroundColor Yellow
cd android
.\gradlew clean
.\gradlew --stop
cd ..

# 4. Delete all cache folders
Write-Host "`n[4/9] Deleting cache folders..." -ForegroundColor Yellow
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\react-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\Temp\react-*" -Recurse -Force -ErrorAction SilentlyContinue

# 5. Clear Gradle cache (optional)
Write-Host "`n[5/9] Clearing Gradle cache..." -ForegroundColor Yellow
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue

# 6. Fresh npm install
Write-Host "`n[6/9] Installing npm packages..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# 7. Check if emulator is running
Write-Host "`n[7/9] Checking for connected devices..." -ForegroundColor Yellow
adb devices

# 8. Uninstall app from emulator
Write-Host "`n[8/9] Uninstalling old app..." -ForegroundColor Yellow
adb uninstall com.ballsortpuzzle 2>$null

# 9. Instructions for next steps
Write-Host "`n[9/9] Clean complete! Next steps:" -ForegroundColor Green
Write-Host "  Terminal 1: npx react-native start --reset-cache" -ForegroundColor Cyan
Write-Host "  Terminal 2: npx react-native run-android" -ForegroundColor Cyan

Write-Host "`n=== Clean Build Complete ===" -ForegroundColor Green
Write-Host "Now run Metro bundler in this terminal:" -ForegroundColor Yellow
Write-Host "npx react-native start --reset-cache" -ForegroundColor Cyan
```

Then run:
```powershell
.\clean-and-run.ps1
```

---

## What Gets Deleted

| Item | Size | Rebuild Time |
|------|------|--------------|
| `node_modules/` | ~500 MB | 2-5 min (npm install) |
| `android/app/build/` | ~200 MB | Included in build |
| `android/build/` | ~100 MB | Included in build |
| Gradle cache | ~1-2 GB | 5-10 min (re-download) |
| Metro cache | ~50 MB | Instant (regenerates) |
| React Native temp | ~100 MB | Instant (regenerates) |
| **TOTAL** | **~3 GB** | **10-20 min** |

---

## After Clean Build

Once everything is clean, your first build will take longer:

```
First build after clean: 5-10 minutes
Subsequent builds: 30 seconds - 1 minute ✅
```

---

## Troubleshooting

### Issue: "adb: command not found"

**Solution:**
```powershell
# Add Android SDK to PATH or use full path
$env:PATH += ";C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools"
```

---

### Issue: npm install fails with ERESOLVE

**Solution:**
```powershell
# Use --legacy-peer-deps flag (already in script)
npm install --legacy-peer-deps

# OR use --force
npm install --force
```

---

### Issue: Gradle cache deletion takes too long

**Solution:**
Skip step 5 (Gradle cache clearing) - it's optional:

```powershell
# Comment out this line:
# Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force
```

---

### Issue: Still getting errors after clean

**Nuclear option - Delete everything:**

```powershell
# WARNING: This deletes EVERYTHING including your changes!
# Make sure you've committed your code to Git first!

# Delete entire project
cd ..
Remove-Item -Path "ball-sort-puzzle-react-native" -Recurse -Force

# Re-clone from Git
git clone <your-repo-url>
cd ball-sort-puzzle-react-native
npm install --legacy-peer-deps
npx react-native run-android
```

---

## Quick Clean (Faster Alternative)

If you don't want a complete clean, try this faster version:

```powershell
# Just clear Metro and React Native cache
npx react-native start --reset-cache

# In another terminal
cd android
.\gradlew clean
cd ..
npx react-native run-android
```

This takes only 1-2 minutes!

---

## Summary

**Full clean:** Use when nothing else works (~10-20 min)
**Quick clean:** Use for most build issues (~2 min)

The full clean script deletes everything and starts completely fresh - it's the nuclear option that solves 99% of build/cache issues! 🧹✨
