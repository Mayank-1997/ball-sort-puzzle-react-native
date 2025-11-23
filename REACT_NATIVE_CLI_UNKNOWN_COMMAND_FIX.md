# 🔧 Fix: "unknown command: @react-native-community/cli" Error

## 🎯 Problem: React Native CLI Not Found

This error occurs when the React Native CLI isn't installed globally or the npx command can't find it.

## 🚀 Solution 1: Install React Native CLI Globally

### **Step 1: Install React Native CLI**
```powershell
# Install the React Native CLI globally
npm install -g @react-native-community/cli

# Wait for installation to complete
```

### **Step 2: Verify Installation**
```powershell
# Check if CLI is installed
npx react-native --version

# Should show React Native CLI version
```

### **Step 3: Try Running Again**
```powershell
# Navigate to your project root
cd C:\path\to\your\ball-sort-puzzle-react-native

# Try the command again
npx @react-native-community/cli run-android --verbose
```

## 🚀 Solution 2: Use Standard React Native Command

### **Instead of the long CLI command, use:**
```powershell
# Navigate to project root
cd C:\path\to\your\ball-sort-puzzle-react-native

# Use standard React Native command
npx react-native run-android --verbose
```

## 🚀 Solution 3: Manual Step-by-Step Setup

Since CLI has issues, let's do it manually:

### **Step 1: Install Dependencies**
```powershell
# Make sure you're in project root
cd C:\path\to\your\ball-sort-puzzle-react-native

# Install all dependencies
npm install
```

### **Step 2: Create Missing Gradle Files Manually**

#### **Create gradle-wrapper.properties**
Create file: `android/gradle/wrapper/gradle-wrapper.properties`
```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.0.1-bin.zip
networkTimeout=10000
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

#### **Download gradle-wrapper.jar**
```powershell
# Create wrapper directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "android\gradle\wrapper"

# Download gradle wrapper jar
Invoke-WebRequest -Uri "https://services.gradle.org/distributions/gradle-8.0.1-wrapper.jar" -OutFile "android\gradle\wrapper\gradle-wrapper.jar"
```

#### **Create gradlew.bat**
Create file: `android/gradlew.bat`
```batch
@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem

@if "%DEBUG%"=="" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%"=="0" goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:execute
@rem Setup the command line

set CLASSPATH=%APP_HOME%\gradle\wrapper\gradle-wrapper.jar


@rem Execute Gradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

:end
@rem End local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" endlocal

:fail
rem Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd_ return code
if not "" == "%GRADLE_EXIT_CONSOLE%" exit 1
exit /b 1
```

### **Step 3: Test Gradle Wrapper**
```powershell
cd android
.\gradlew.bat --version
cd ..
```

### **Step 4: Build Manually**
```powershell
# Start Metro bundler first
npm start

# In another terminal, try standard React Native command
npx react-native run-android
```

## 🚀 Solution 4: Use Android Studio (Most Reliable)

### **Step 1: Start Metro Bundler**
```powershell
cd C:\path\to\your\ball-sort-puzzle-react-native
npm start
```

### **Step 2: Open in Android Studio**
1. **Open Android Studio**
2. **File → Open**
3. **Select your `android` folder**
4. **Wait for Gradle sync**
5. **Click Run button (▶️)**

This bypasses all CLI issues and uses Android Studio's build system.

## 🚀 Solution 5: Copy Working Files (Fastest)

### **From Your Working Laptop:**
1. **Copy these files:**
   ```
   android/gradlew
   android/gradlew.bat
   android/gradle/wrapper/gradle-wrapper.jar
   android/gradle/wrapper/gradle-wrapper.properties
   ```

2. **Transfer to second laptop**
3. **Place in same directory structure**
4. **Then run:**
   ```powershell
   npm install
   npm run android
   ```

## 🔍 **Check Your Environment**

### **Verify Node.js and npm**
```powershell
node --version    # Should be 18.x or newer
npm --version     # Should be recent version
```

### **Check if npm global packages work**
```powershell
npm list -g --depth=0
# Should show globally installed packages
```

## 🎯 **Recommended Approach**

### **Option A: Android Studio (Most Reliable)**
1. Install dependencies: `npm install`
2. Start Metro: `npm start`
3. Open Android Studio → Open `android` folder
4. Click Run button

### **Option B: Copy Working Files**
1. Copy gradle wrapper files from working laptop
2. `npm install`
3. `npm run android`

### **Option C: Manual Setup**
1. `npm install`
2. Create gradle wrapper files manually (as shown above)
3. `npm run android`

## ✅ **Success Test**

After fixing, you should be able to run:
```powershell
cd android
.\gradlew.bat --version
# Shows Gradle version

cd ..
npm run android
# Builds and launches Ball Sort Puzzle
```

**I recommend using Android Studio approach since it's the most reliable and bypasses CLI issues completely. Your Ball Sort Puzzle game is ready to run - we just need to get the build working!** 🎮

Which approach would you like to try first?