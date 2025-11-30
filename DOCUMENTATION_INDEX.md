# Quick Reference - Documentation Index

## 📚 All Documentation by Category

### 🔥 Most Important (Start Here!)

1. **[Production Setup](mdfiles/2025-11-30/PRODUCTION_FREE_PREMIUM_SETUP.md)** - Production-ready Free/Premium configuration
2. **[Run on Device](mdfiles/2025-11-30/RUN_ON_ANDROID_DEVICE_GUIDE.md)** - How to run app on Android device/emulator
3. **[SSL Trust Store Fix](mdfiles/2025-11-30/SSL_TRUSTSTORE_FIX.md)** - Fix SSL errors in Android Studio

### 🐛 Troubleshooting

- **[App Not Visible](mdfiles/2025-11-30/TROUBLESHOOTING_APP_NOT_VISIBLE.md)** - App doesn't show on device
- **[MainActivity Error](mdfiles/2025-11-30/FIX_MAINACTIVITY_ERROR.md)** - MainActivity does not exist error
- **[All Build Fixes](mdfiles/build-guides/)** - Legacy build error fixes

### 📖 Learning & Understanding

- **[React Native to Android](mdfiles/2025-11-30/REACT_NATIVE_TO_ANDROID_CONVERSION_GUIDE.md)** - How React Native relates to Android
- **[Behind the Scenes](mdfiles/2025-11-30/ANDROID_STUDIO_BEHIND_THE_SCENES.md)** - What happens when Android Studio loads

### ⚙️ Configuration

- **[AdMob & Play Games](mdfiles/2025-11-30/ADMOB_GOOGLEPLAY_CONFIG_STATUS.md)** - AdMob and Google Play Games setup
- **[ID Replacement](mdfiles/2025-11-30/ID_REPLACEMENT_GUIDE.md)** - Replace package IDs
- **[File Transfer](mdfiles/2025-11-30/FILE_TRANSFER_CHECKLIST.md)** - Transfer checklist

---

## 📁 Full Documentation Structure

All documentation is organized in the `mdfiles/` folder:

```
mdfiles/
├── README.md                    # Full index with descriptions
├── 2025-11-30/                 # Latest guides (Nov 30, 2025)
│   └── (10 comprehensive guides)
└── build-guides/               # Legacy build/setup guides
    └── (11 build fix guides)
```

**See [mdfiles/README.md](mdfiles/README.md) for complete listing.**

---

## 🚀 Quick Commands

### Run the App
```powershell
npx react-native run-android
```

### Build for Production
```powershell
cd android
.\gradlew bundleFreeRelease      # Free version AAB
.\gradlew bundlePremiumRelease   # Premium version AAB
```

### Troubleshoot
```powershell
adb devices                      # Check connected devices
adb logcat                       # View logs
cd android && .\gradlew clean    # Clean build
```

---

For detailed instructions on any topic, check the appropriate guide in the `mdfiles/` folder!
