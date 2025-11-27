package com.ballsortpuzzle;

import android.app.Application;
import android.content.Context;
import android.util.Log;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactHost;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.react.flipper.ReactNativeFlipper;
import com.facebook.soloader.SoLoader;

import androidx.multidex.MultiDexApplication;

import java.util.List;

/**
 * Main Application class for Ball Sort Puzzle React Native App
 * Handles React Native initialization, performance optimization, and multi-dex support
 */
public class MainApplication extends MultiDexApplication implements ReactApplication {

    private static final String TAG = "BallSortPuzzle";

    private final ReactNativeHost mReactNativeHost =
            new DefaultReactNativeHost(this) {
                @Override
                public boolean getUseDeveloperSupport() {
                    return BuildConfig.DEBUG;
                }

                @Override
                protected List<ReactPackage> getPackages() {
                    @SuppressWarnings("UnnecessaryLocalVariable")
                    List<ReactPackage> packages = new PackageList(getApplication()).getPackages();
                    // Add custom packages here if needed
                    return packages;
                }

                @Override
                protected String getJSMainModuleName() {
                    return "index";
                }

                @Override
                protected boolean isNewArchEnabled() {
                    return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
                }

                @Override
                protected Boolean isHermesEnabled() {
                    return BuildConfig.IS_HERMES_ENABLED;
                }
            };

    private ReactHost mReactHost;

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public ReactHost getReactHost() {
        if (mReactHost == null) {
            mReactHost = DefaultReactHost.getDefaultReactHost(getApplicationContext(), mReactNativeHost);
        }
        return mReactHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        
        Log.d(TAG, "Ball Sort Puzzle Application starting...");
        
        // Initialize SoLoader for native library loading
        SoLoader.init(this, /* native exopackage */ false);
        
        // Initialize React Native New Architecture if enabled
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            DefaultNewArchitectureEntryPoint.load();
        }
        
        // Initialize Flipper for debug builds
        if (BuildConfig.DEBUG) {
            ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
        }
        
        Log.d(TAG, "Ball Sort Puzzle Application initialized successfully");
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        
        // Enable multi-dex support for older Android versions
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.LOLLIPOP) {
            androidx.multidex.MultiDex.install(this);
        }
    }
}