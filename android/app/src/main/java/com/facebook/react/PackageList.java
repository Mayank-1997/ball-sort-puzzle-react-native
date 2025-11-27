package com.facebook.react;

import android.app.Application;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

/**
 * Temporary PackageList - React Native autolinking will handle packages automatically
 */
public class PackageList {
    private Application application;
    
    public PackageList(Application application) {
        this.application = application;
    }
    
    public List<ReactPackage> getPackages() {
        // Start with core packages
        List<ReactPackage> packages = new ArrayList<>();
        packages.add(new MainReactPackage());
        
        // Additional packages will be autolinked by React Native Gradle plugin
        // This includes: AdMob, Gesture Handler, Reanimated, SVG, etc.
        
        return packages;
    }
}
