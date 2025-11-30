# Fix for SSL Trust Store Error in Android Studio

## Error Description
When opening the Android folder in Android Studio on a new laptop, you get:
```
Could not determine the dependencies of task ':app:compileFreeDebugJavaWithJavac'.
> Could not resolve all task dependencies for configuration ':app:freeDebugCompileClasspath'.
   > Could not resolve org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.10.
     Required by:
         project :app
      > Could not resolve org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.10.
         > Could not get resource 'https://dl.google.com/dl/android/maven2/org/jetbrains/kotlin/kotlin-stdlib-jdk8/1.8.10/kotlin-stdlib-jdk8-1.8.10.pom'.
            > org.apache.http.ssl.SSLInitializationException: problem accessing trust store
```

Additional error: **"WINDOWS-ROOT keystore not available"**

---

## Solution Steps

### Step 1: Create Global Gradle Properties File

Open PowerShell and run these commands:

```powershell
# Create .gradle directory if it doesn't exist
New-Item -Path "$env:USERPROFILE\.gradle" -ItemType Directory -Force

# Create gradle.properties file with proper SSL configuration
@"
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
org.gradle.daemon=true
org.gradle.caching=true
"@ | Out-File -FilePath "$env:USERPROFILE\.gradle\gradle.properties" -Encoding UTF8
```

### Step 2: Clear Gradle Cache

Run these commands in PowerShell:

```powershell
# Navigate to android folder
cd android

# Clean the project
.\gradlew clean --no-daemon

# Clear Gradle cache (optional but recommended)
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 3: Configure Android Studio to Use Embedded JDK

This is the **MOST IMPORTANT** step:

1. Open Android Studio
2. Go to **File → Settings** (or **File → Project Structure**)
3. Navigate to **Build, Execution, Deployment → Build Tools → Gradle**
4. Under **Gradle JDK**, select one of these options:
   - **Embedded JDK** (recommended)
   - **jbr-17** (JetBrains Runtime)
   - Any JDK version 17 or higher that comes with Android Studio

**DO NOT** use system-installed Java/JDK as it may have certificate issues.

### Step 4: Invalidate Caches in Android Studio

1. In Android Studio, go to **File → Invalidate Caches**
2. Select **Invalidate and Restart**
3. Wait for Android Studio to restart and re-index the project

### Step 5: Sync Gradle

1. Click on **File → Sync Project with Gradle Files**
2. Or click the **Sync** button (elephant icon) in the toolbar
3. Wait for the sync to complete

---

## Alternative Solution: Use HTTP Repository (If Above Doesn't Work)

If the above steps don't work, you can configure Gradle to use alternative Maven repositories.

The project's `android/build.gradle` has already been updated with fallback repositories, but if you need to verify, check that these sections exist:

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
        maven { url "https://www.jitpack.io" }
        maven { 
            url "https://repo1.maven.org/maven2"
            allowInsecureProtocol = false
        }
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url "https://www.jitpack.io" }
        maven { url("https://repo.maven.apache.org/maven2") }
        maven { 
            url "https://repo1.maven.org/maven2"
            allowInsecureProtocol = false
        }
    }
}
```

---

## Additional Troubleshooting

### Check Internet Connection and Firewall

Some corporate networks or firewalls block Maven repository access:

```powershell
# Test connectivity to Maven Central
Test-NetConnection -ComputerName repo1.maven.org -Port 443

# Test connectivity to Google Maven
Test-NetConnection -ComputerName dl.google.com -Port 443
```

If these fail, you may need to:
- Configure proxy settings in Android Studio
- Contact your IT department
- Use a VPN

### Configure Proxy (If Behind Corporate Firewall)

If you're behind a corporate proxy, add these to `C:\Users\<YourUsername>\.gradle\gradle.properties`:

```properties
systemProp.http.proxyHost=your.proxy.host
systemProp.http.proxyPort=8080
systemProp.https.proxyHost=your.proxy.host
systemProp.https.proxyPort=8080
systemProp.http.nonProxyHosts=localhost|127.0.0.1
```

### Update Gradle Wrapper (Last Resort)

If nothing works, try updating the Gradle wrapper:

```powershell
cd android
.\gradlew wrapper --gradle-version=8.4 --distribution-type=all
```

---

## Verification

After completing the steps, you should see successful Gradle sync in Android Studio:

✅ No SSL errors
✅ Dependencies downloaded successfully
✅ Project builds without errors

---

## Quick Checklist

- [ ] Create global `gradle.properties` file (Step 1)
- [ ] Clear Gradle cache (Step 2)
- [ ] **Set Android Studio to use Embedded JDK** (Step 3) ⭐ MOST IMPORTANT
- [ ] Invalidate caches and restart Android Studio (Step 4)
- [ ] Sync project with Gradle files (Step 5)
- [ ] Verify build succeeds

---

## Notes

- The project files (`android/build.gradle` and `android/gradle.properties`) have already been updated with the necessary configurations
- The key issue is usually the JDK/certificate trust store, which is why using Android Studio's Embedded JDK is crucial
- If you continue to have issues, it's likely a network/firewall/proxy issue rather than a Gradle configuration issue

## Support

If you still encounter issues after following all steps, check:
1. Your internet connection
2. Firewall/antivirus settings
3. Corporate proxy requirements
4. VPN requirements
