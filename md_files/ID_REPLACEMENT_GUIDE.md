# 🔧 Configuration Update Script for Real AdMob & Google Play IDs

## 📝 ID Replacement Checklist

When you're ready to use your real AdMob and Google Play Games IDs, use this checklist:

### 🎯 **Your AdMob Information**
```
Replace these placeholders with your actual IDs:

AdMob App ID: ca-app-pub-YOUR_PUBLISHER_ID~YOUR_APP_ID
Banner Ad Unit: ca-app-pub-YOUR_PUBLISHER_ID/YOUR_BANNER_UNIT_ID  
Interstitial Ad Unit: ca-app-pub-YOUR_PUBLISHER_ID/YOUR_INTERSTITIAL_UNIT_ID
Rewarded Ad Unit: ca-app-pub-YOUR_PUBLISHER_ID/YOUR_REWARDED_UNIT_ID
```

### 🎮 **Your Google Play Games Information**
```
Google Play Games App ID: YOUR_12_DIGIT_APP_ID
Achievement IDs: YOUR_ACHIEVEMENT_IDS
Leaderboard IDs: YOUR_LEADERBOARD_IDS
```

## 📂 **Files to Update (6 files total)**

### **File 1: `android/app/build.gradle`**
**Location:** Lines 42, 78-80
```gradle
// FIND:
admobAppId: "ca-app-pub-3940256099942544~3347511713"

// REPLACE WITH:
admobAppId: "YOUR_REAL_ADMOB_APP_ID"

// FIND:
buildConfigField "String", "ADMOB_BANNER_ID", "\"ca-app-pub-3940256099942544/6300978111\""
buildConfigField "String", "ADMOB_INTERSTITIAL_ID", "\"ca-app-pub-3940256099942544/1033173712\""  
buildConfigField "String", "ADMOB_REWARDED_ID", "\"ca-app-pub-3940256099942544/5224354917\""

// REPLACE WITH:
buildConfigField "String", "ADMOB_BANNER_ID", "\"YOUR_BANNER_UNIT_ID\""
buildConfigField "String", "ADMOB_INTERSTITIAL_ID", "\"YOUR_INTERSTITIAL_UNIT_ID\""
buildConfigField "String", "ADMOB_REWARDED_ID", "\"YOUR_REWARDED_UNIT_ID\""
```

### **File 2: `android/app/src/main/res/values/strings.xml`**
**Location:** Lines 16, 21-23
```xml
<!-- FIND: -->
<string name="google_play_games_app_id">123456789012</string>

<!-- REPLACE WITH: -->
<string name="google_play_games_app_id">YOUR_GOOGLE_PLAY_APP_ID</string>

<!-- FIND: -->
<string name="admob_banner_ad_unit_id">ca-app-pub-3940256099942544/6300978111</string>
<string name="admob_interstitial_ad_unit_id">ca-app-pub-3940256099942544/1033173712</string>
<string name="admob_rewarded_ad_unit_id">ca-app-pub-3940256099942544/5224354917</string>

<!-- REPLACE WITH: -->
<string name="admob_banner_ad_unit_id">YOUR_BANNER_UNIT_ID</string>
<string name="admob_interstitial_ad_unit_id">YOUR_INTERSTITIAL_UNIT_ID</string>
<string name="admob_rewarded_ad_unit_id">YOUR_REWARDED_UNIT_ID</string>
```

### **File 3: `android/gradle.properties`**
**Location:** Line 65
```properties
# FIND:
ADMOB_APP_ID=ca-app-pub-3940256099942544~3347511713

# REPLACE WITH:
ADMOB_APP_ID=YOUR_REAL_ADMOB_APP_ID
```

### **File 4: `src/services/AdMobManager.js`**
**Location:** Lines 29-39
```javascript
// FIND:
banner: __DEV__ ? TestIds.BANNER : Platform.select({
  ios: 'ca-app-pub-YOUR_PUBLISHER_ID/BANNER_AD_UNIT_ID',
  android: 'ca-app-pub-YOUR_PUBLISHER_ID/BANNER_AD_UNIT_ID',
}),

// REPLACE WITH:
banner: __DEV__ ? TestIds.BANNER : Platform.select({
  ios: 'YOUR_IOS_BANNER_UNIT_ID',
  android: 'YOUR_ANDROID_BANNER_UNIT_ID',
}),

// Repeat for interstitial and rewarded ads
```

### **File 5: `src/services/GooglePlayGamesManager.js`**
**Location:** Lines 34-60
```javascript
// FIND:
this.achievementIds = {
  first_level: 'CgkIw8CKkP0CEAIQAQ',
  level_10: 'CgkIw8CKkP0CEAIQBA',
  // ... other placeholder IDs
};

// REPLACE WITH:
this.achievementIds = {
  first_level: 'YOUR_FIRST_LEVEL_ACHIEVEMENT_ID',
  level_10: 'YOUR_LEVEL_10_ACHIEVEMENT_ID',
  // ... your real achievement IDs
};

// ADD your leaderboard IDs:
this.leaderboardIds = {
  high_scores: 'YOUR_HIGH_SCORE_LEADERBOARD_ID',
  most_levels: 'YOUR_LEVELS_LEADERBOARD_ID',
  // ... your real leaderboard IDs
};
```

## 🔍 **How to Find Your IDs**

### **AdMob IDs:**
1. Go to [AdMob Console](https://admob.google.com/)
2. Select your Ball Sort Puzzle app
3. **App ID:** Found in App Settings
4. **Ad Unit IDs:** Found in Ad Units section for each ad type

### **Google Play Games IDs:**
1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your Ball Sort Puzzle app
3. Go to "Play Games Services" section
4. **App ID:** Found in Configuration
5. **Achievement IDs:** Found in Achievements section
6. **Leaderboard IDs:** Found in Leaderboards section

## ⚠️ **Important Notes**

### **Test vs Production:**
- **Current Setup:** Uses Google test IDs (safe for testing)
- **After Update:** Uses your real IDs (will show real ads, connect to real services)

### **Testing Strategy:**
1. **First:** Test thoroughly with current test configuration
2. **Validate:** All features work properly
3. **Then:** Update to your real IDs for production testing
4. **Finally:** Build release version for app store

### **Rollback Safety:**
Keep a backup of the current test configuration in case you need to revert:
```bash
# Create backup before making changes
cp -r react-native react-native-backup-with-test-ids
```

## 🚀 **Quick Commands After ID Update**

```bash
# Clean and rebuild after updating IDs
cd react-native/android
./gradlew clean
cd ..
npm run android
```

## 🎯 **Expected Results After Update**

### **With Your Real IDs:**
- ✅ **Real Ads:** Your actual AdMob ads will display
- ✅ **Real Revenue:** Ad clicks will generate actual revenue  
- ✅ **Real Achievements:** Will sync with your Google Play Console
- ✅ **Real Leaderboards:** Scores will appear in your actual leaderboards
- ✅ **Analytics:** Real user data in your dashboards

The app is **fully configured and ready** - you can test everything with the current setup, then easily switch to your production IDs when ready!