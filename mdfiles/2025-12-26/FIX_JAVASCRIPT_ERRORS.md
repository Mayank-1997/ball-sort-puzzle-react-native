# Fix: JavaScript Errors - Missing Dependencies

**Date:** December 26, 2025  
**Issue:** App connects to Metro but crashes due to missing/unlinked native modules

---

## 🐛 Errors You're Seeing

```
TypeError: null is not an object (evaluating 'RNSound.IsAndroid')
TypeError: undefined is not an object (evaluating 'AudioManager')
ReferenceError: Can't find variable: LevelSelectScreen
```

---

## ✅ Root Cause

After `npm install --legacy-peer-deps` on new laptop:
1. ✅ Packages installed in `node_modules`
2. ❌ Native modules NOT linked (react-native-sound)
3. ❌ Missing screen component imports in App.js

---

## 🔧 Quick Fix (Temporary - Test Metro Connection)

### Option 1: Use Minimal Test App

```powershell
# On your other laptop:
# 1. Backup original
Copy-Item App.js App.backup.js

# 2. Use simple test version
Copy-Item App.simple.js App.js

# 3. Reload Metro
# Press Ctrl+C in Metro terminal
npx react-native start --reset-cache

# 4. In app on emulator, press R twice to reload
```

This will show a simple working app proving Metro connection works!

---

## 🔧 Permanent Fix (Rebuild Native Modules)

### Step 1: Clean Everything

```powershell
# Stop Metro
Ctrl+C

# Clean npm
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force

# Clean Android
cd android
.\gradlew clean
Remove-Item -Path "app\build", "build", ".gradle" -Recurse -Force -ErrorAction SilentlyContinue
cd ..
```

### Step 2: Reinstall Dependencies

```powershell
npm install --legacy-peer-deps
```

### Step 3: Link Native Modules (Auto-linking)

React Native 0.73 uses auto-linking, but you need to rebuild:

```powershell
cd android
.\gradlew clean
cd ..
```

### Step 4: Rebuild App

```powershell
# Terminal 1
npx react-native start --reset-cache

# Terminal 2
cd android
.\gradlew installFreeDebug
```

---

## 🎯 Alternative: Remove Problematic Imports Temporarily

Edit `App.js` and comment out failing imports:

```javascript
// Temporary: Comment these out
// import { AudioManager } from './src/services/AudioManager';
// import { AdMobManager } from './src/services/AdMobManager';
// import { GooglePlayGamesManager } from './src/services/GooglePlayGamesManager';

// Also comment out their initialization:
const initializeApp = async () => {
  try {
    console.log('🎮 App starting...');
    
    // await AudioManager.initialize();  // Commented out
    // await AdMobManager.initialize();   // Commented out
    // await GooglePlayGamesManager.initialize(); // Commented out
    
    setIsInitialized(true);
    console.log('✅ App ready');
  } catch (error) {
    console.error('Error:', error);
    setIsInitialized(true);
  }
};
```

---

## 📝 Missing Screen Imports

Add these imports to App.js (after line 20):

```javascript
// Import ALL screens
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen';      // ← Missing!
import SettingsScreen from './src/screens/SettingsScreen';            // ← Missing!
import AchievementsScreen from './src/screens/AchievementsScreen';    // ← Missing!
import LeaderboardScreen from './src/screens/LeaderboardScreen';      // ← Missing!
import StatisticsScreen from './src/screens/StatisticsScreen';        // ← Missing!
```

---

## 🚀 Recommended Approach (Other Laptop)

### Phase 1: Test Metro Connection (Use Simple App)

```powershell
# Use App.simple.js to verify Metro works
Copy-Item App.simple.js App.js
npx react-native start --reset-cache
# Reload app - should work!
```

### Phase 2: Fix Native Modules

```powershell
# Clean rebuild
Remove-Item node_modules, package-lock.json -Recurse -Force
npm install --legacy-peer-deps
cd android
.\gradlew clean
.\gradlew installFreeDebug
```

### Phase 3: Restore Full App

```powershell
# Restore original App.js
Copy-Item App.backup.js App.js

# Add missing imports at top:
# import LevelSelectScreen from './src/screens/LevelSelectScreen';
# import SettingsScreen from './src/screens/SettingsScreen';
# import AchievementsScreen from './src/screens/AchievementsScreen';
# import LeaderboardScreen from './src/screens/LeaderboardScreen';
# import StatisticsScreen from './src/screens/StatisticsScreen';

# Reload Metro
npx react-native start --reset-cache
```

---

## 🎓 What Happened

**Working laptop:**
- npm install ✅
- Native modules auto-linked ✅
- Gradle compiled native code ✅
- Everything bundled ✅

**New laptop:**
- npm install ✅
- Native modules installed in node_modules ✅
- BUT: Native code NOT compiled yet ❌
- Solution: Rebuild Android project ✅

---

## ✅ Success Indicators

After fixes, logs should show:

```
✅ Running "BallSortPuzzle" with {"rootTag":11}
✅ App is working!
✅ (No TypeError or ReferenceError)
```

---

**Try the simple app first to confirm Metro works, then fix the full app!** 🚀
