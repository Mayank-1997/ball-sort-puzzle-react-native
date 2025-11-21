# Ball Sort Puzzle Game - ProGuard Configuration
# Optimized for React Native 0.73.2 with AdMob and Google Play Games Services
# Ensures compatibility with Android API 21+ while maintaining performance

# Basic ProGuard settings
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose
-dontoptimize
-dontpreverify

# Keep all annotations
-keepattributes *Annotation*

# Keep line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# React Native specific rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep React components and their props
-keep class * extends com.facebook.react.bridge.ReactContextBaseJavaModule { *; }
-keep class * extends com.facebook.react.bridge.BaseJavaModule { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }
-keep class * extends com.facebook.react.uimanager.SimpleViewManager { *; }

# Keep JSI/TurboModule interfaces
-keep class com.facebook.react.turbomodule.** { *; }
-keep class * extends com.facebook.react.turbomodule.core.interfaces.TurboModule { *; }

# Keep Fabric/Codegen generated classes
-keep class com.facebook.react.viewmanagers.** { *; }
-keep class * extends com.facebook.react.fabric.ComponentFactory { *; }

# AdMob and Google Mobile Ads SDK
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }
-keep class com.google.android.gms.common.** { *; }

# Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Google Play Games Services
-keep class com.google.android.gms.games.** { *; }
-keep class com.google.android.gms.auth.** { *; }
-keep class com.google.android.gms.signin.** { *; }

# Google Sign In
-keep class com.google.android.gms.auth.api.signin.** { *; }
-keep class com.google.android.gms.common.api.** { *; }

# Firebase (if used)
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Material Design Components
-keep class com.google.android.material.** { *; }
-dontwarn com.google.android.material.**

# AndroidX and Support Libraries
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-dontwarn androidx.**

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep setters in Views so that animations can still work
-keepclassmembers public class * extends android.view.View {
   void set*(***);
   *** get*();
}

# Keep Activity subclasses and their methods
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.app.backup.BackupAgentHelper
-keep public class * extends android.preference.Preference

# Keep Activity lifecycle methods
-keepclassmembers class * extends android.app.Activity {
   public void *(android.view.View);
}

# Keep the BuildConfig
-keep class **.BuildConfig { *; }

# Keep R class and its inner classes
-keep class **.R
-keep class **.R$* {
    <fields>;
}

# Parcelable implementations
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Serializable classes
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Enumerations
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# JavaScript Interface classes
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# OkHttp and networking
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# Retrofit and Gson (if used)
-keep class com.google.gson.** { *; }
-keep class retrofit2.** { *; }
-dontwarn retrofit2.**

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# Keep custom Application class if present
-keep public class * extends android.app.Application {
    public void attachBaseContext(android.content.Context);
    public void onCreate();
}

# Keep WebView-related classes
-keep class android.webkit.** { *; }
-dontwarn android.webkit.**

# Sound and audio related classes
-keep class javax.sound.** { *; }
-keep class android.media.** { *; }

# AsyncStorage and React Native storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# React Native SVG
-keep class com.horcrux.svg.** { *; }

# React Native Linear Gradient
-keep class com.BV.LinearGradient.** { *; }

# React Native Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# React Navigation
-keep class com.swmansion.** { *; }
-keep class com.th3rdwave.** { *; }

# Flipper (development only)
-keep class com.facebook.flipper.** { *; }
-keep class com.facebook.soloader.** { *; }

# SoLoader native library loading
-keep class com.facebook.soloader.** { *; }

# Fresco image loading library
-keep class com.facebook.fresco.** { *; }
-keep class com.facebook.imagepipeline.** { *; }
-keep class com.facebook.drawee.** { *; }

# Hermes JavaScript engine
-keep class com.facebook.hermes.** { *; }

# Yoga layout engine
-keep class com.facebook.yoga.** { *; }

# Custom game classes - adjust package name as needed
-keep class com.ballsortpuzzle.** { *; }

# Keep custom native modules
-keep class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
    public <init>(...);
    public *** get*();
    public void set*(***);
    @android.webkit.JavascriptInterface public <methods>;
    @com.facebook.react.bridge.ReactMethod public <methods>;
}

# SQLite database
-keep class org.sqlite.** { *; }
-keep class org.sqlite.database.** { *; }

# Additional rules for newer Android versions
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# Keep BuildConfig fields
-keepclassmembers class **.BuildConfig {
    public static <fields>;
}

# Crashlytics (if used)
-keep class com.crashlytics.** { *; }
-keep class com.google.firebase.crashlytics.** { *; }
-dontwarn com.crashlytics.**