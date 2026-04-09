# 🏗️ Build FLYQ APK with Android Studio & CMD (Windows)

**Generated**: 2026-04-09  
**App**: FLYQ Drone Controller v2.1.0 Professional Edition  
**Repository**: https://github.com/rahulgupta37079-oss/FLYQ_APP

---

## ✅ Prerequisites

### 1. Install Android Studio
Download from: https://developer.android.com/studio

**During installation, make sure to install:**
- Android SDK Platform 34
- Android SDK Build-Tools
- Android Emulator
- Android SDK Platform-Tools

### 2. Install Java JDK 17
Download from: https://adoptium.net/

Verify installation:
```powershell
java -version
# Should show: openjdk version "17.x.x"
```

### 3. Set Environment Variables (PowerShell as Admin)

```powershell
# Set JAVA_HOME
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot", "Machine")

# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "Machine")

# Add to PATH
$oldPath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$newPath = "$oldPath;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\tools"
[System.Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
```

**Restart CMD/PowerShell after setting environment variables!**

---

## 🚀 Build Steps

### Step 1: Get Latest Code

```powershell
cd C:\Users\PROFESSORHULK\FLYQ_APP
git pull origin main
npm install
```

### Step 2: Generate Android Project (First Time Only)

```powershell
npx expo prebuild --platform android --clean
```

This creates the `android/` folder with native Android code.

### Step 3: Build APK with CMD

#### Option A: Debug APK (Quick Test - No Signing Required)

```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android
gradlew assembleDebug
```

**Output**: `android\app\build\outputs\apk\debug\app-debug.apk` (~30 MB)  
**Time**: ~3-5 minutes

#### Option B: Release APK (Optimized - Requires Signing)

First, create a keystore (one-time setup):

```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android\app
keytool -genkeypair -v -storetype PKCS12 -keystore flyq-release.keystore -alias flyq-key -keyalg RSA -keysize 2048 -validity 10000

# Enter these when prompted:
# Store password: flyq2024secure
# Key password: flyq2024secure
# First and Last Name: FLYQ Drone Controller
# Organization: Passion3D World
# City: Mumbai
# State: Maharashtra  
# Country: IN
```

Then build the release APK:

```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android
gradlew assembleRelease
```

**Output**: `android\app\build\outputs\apk\release\app-release.apk` (~25 MB)  
**Time**: ~5-7 minutes

---

## 📱 Install APK on Phone

### Method 1: Via USB Cable

1. Enable Developer Options on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. Connect phone via USB cable

3. Verify connection:
```cmd
adb devices
# Should show your device ID
```

4. Install APK:
```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android\app\build\outputs\apk\debug
adb install app-debug.apk

# Or for release APK:
cd ..\release
adb install app-release.apk
```

### Method 2: Share APK File

1. Copy APK from `android\app\build\outputs\apk\debug\app-debug.apk`
2. Transfer to phone via:
   - WhatsApp (send to yourself)
   - Google Drive
   - Email
   - USB cable (copy to phone storage)
3. On phone:
   - Enable "Install unknown apps" for your file manager
   - Tap the APK file to install

---

## 🏗️ Build with Android Studio (Alternative Method)

### Step 1: Open Project

1. Open Android Studio
2. Click "Open an Existing Project"
3. Navigate to `C:\Users\PROFESSORHULK\FLYQ_APP\android`
4. Click OK

### Step 2: Let Gradle Sync

Wait for "Gradle sync" to complete (may take 5-10 minutes first time).

### Step 3: Build APK

**In Android Studio:**

1. **For Debug APK:**
   - Click `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Wait ~3-5 minutes
   - Click "locate" in the popup notification
   - APK is at `app/build/outputs/apk/debug/app-debug.apk`

2. **For Release APK:**
   - Click `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Select "release" variant
   - Click Build

### Step 4: Run on Emulator or Device

1. **For Physical Device:**
   - Connect phone via USB
   - Enable USB Debugging
   - Click green ▶️ button in Android Studio
   - Select your device
   - App will install and launch automatically

2. **For Emulator:**
   - Tools → Device Manager
   - Create a new device (Pixel 5, API 34)
   - Click green ▶️ button
   - Select the emulator

---

## 🎯 Configure Signing for Release Builds

### Step 1: Create keystore.properties

Create `android/keystore.properties`:

```properties
storeFile=flyq-release.keystore
storePassword=flyq2024secure
keyAlias=flyq-key
keyPassword=flyq2024secure
```

**⚠️ Add to .gitignore!**

```cmd
echo keystore.properties >> android/.gitignore
echo *.keystore >> android/.gitignore
```

### Step 2: Update android/app/build.gradle

Add this BEFORE `android {`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add this INSIDE `android { buildTypes { release {`:

```gradle
signingConfig signingConfigs.release
```

Add this INSIDE `android {` block:

```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
}
```

---

## 📋 Build Commands Reference

### Clean Build

```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android
gradlew clean
```

### Build Debug APK

```cmd
gradlew assembleDebug
```

### Build Release APK

```cmd
gradlew assembleRelease
```

### Build Release AAB (for Play Store)

```cmd
gradlew bundleRelease
```

### View All Available Tasks

```cmd
gradlew tasks
```

### Build with Detailed Logs

```cmd
gradlew assembleDebug --info
gradlew assembleDebug --stacktrace
```

---

## 🧪 Test the APK

### 1. Test WiFi Scanning

- Open FLYQ app
- Go to WiFi Scan screen
- Click "Scan for Drones"
- Should show real WiFi networks
- Networks with "LiteWing", "FLYQ", "ESP32" in SSID will show drone icon

### 2. Test Drone Control (With Real Drone)

- Connect phone to drone's WiFi hotspot
- Open FLYQ app
- Go to WiFi Scan screen
- Tap on drone's network
- Tap "Connect to Drone"
- Should navigate to Control screen
- Test ARM → TAKEOFF → Joystick controls → LAND → DISARM

### 3. Test Drone Control (Without Real Drone)

Create a test UDP server on your PC:

**test_drone.py**:
```python
import socket
import json
import time

# Create UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('0.0.0.0', 2989))

print("Test Drone UDP Server Started on port 2989")
print("Create a mobile hotspot named 'LiteWing-Test' and connect your phone to it")
print("Then open FLYQ app and scan for drones\n")

while True:
    data, addr = sock.recvfrom(1024)
    message = data.decode('utf-8').strip()
    
    print(f"Received from {addr}: {message}")
    
    # Respond to commands
    if message == "PING":
        sock.sendto(b"PONG", addr)
    elif message.startswith("CMD:"):
        sock.sendto(b"ACK", addr)
        # Parse command
        parts = message.replace("CMD:", "").split(",")
        print(f"  Roll: {parts[0]}, Pitch: {parts[1]}, Yaw: {parts[2]}, Thrust: {parts[3]}")
    elif message == "ARM":
        sock.sendto(b"ACK:ARMED", addr)
        print("  Drone ARMED")
    elif message == "DISARM":
        sock.sendto(b"ACK:DISARMED", addr)
        print("  Drone DISARMED")
    elif message.startswith("TAKEOFF:"):
        height = message.split(":")[1]
        sock.sendto(b"ACK:TAKING_OFF", addr)
        print(f"  Taking off to {height}m")
    elif message == "LAND":
        sock.sendto(b"ACK:LANDING", addr)
        print("  Landing")
    elif message == "STOP":
        sock.sendto(b"ACK:STOPPED", addr)
        print("  Emergency STOP")
    elif message == "GET_TELEMETRY":
        telemetry = {
            "battery": 85.5,
            "altitude": 2.3,
            "speed": 1.2,
            "roll": 0.5,
            "pitch": 2.1,
            "yaw": 45.0
        }
        response = f"TEL:{json.dumps(telemetry)}"
        sock.sendto(response.encode('utf-8'), addr)
```

**Run the test server:**
```cmd
# 1. Create Windows mobile hotspot named "LiteWing-Test"
# 2. Run the Python server
python test_drone.py

# 3. Connect your phone to "LiteWing-Test" WiFi
# 4. Open FLYQ app and scan for drones
```

---

## 🔧 Troubleshooting

### Error: gradlew: command not found

**Solution**: You're not in the android folder.
```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android
```

### Error: JAVA_HOME not set

**Solution**: Set environment variables (see Prerequisites section).

Verify:
```cmd
echo %JAVA_HOME%
echo %ANDROID_HOME%
```

### Error: SDK location not found

**Solution**: Create `android/local.properties`:

```properties
sdk.dir=C:\\Users\\PROFESSORHULK\\AppData\\Local\\Android\\Sdk
```

### Error: Failed to install APK

**Solutions:**
1. Enable "USB Debugging" on phone
2. Enable "Install unknown apps" for file manager
3. Try uninstalling old version first:
   ```cmd
   adb uninstall com.flyq.dronecontroller
   ```

### Build is very slow

**Solutions:**
1. Close other apps to free RAM
2. Use `gradlew assembleDebug` instead of `assembleRelease` for testing
3. Add to `android/gradle.properties`:
   ```properties
   org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
   org.gradle.parallel=true
   org.gradle.configureondemand=true
   org.gradle.daemon=true
   ```

### Error: Execution failed for task ':app:packageDebug'

**Solution**: Clean and rebuild:
```cmd
gradlew clean
gradlew assembleDebug
```

---

## ⏱️ Build Time Comparison

| Method | Build Type | Time | Output Size | Notes |
|--------|-----------|------|-------------|-------|
| CMD | Debug | ~3 min | ~30 MB | Fast, for testing |
| CMD | Release | ~5 min | ~25 MB | Optimized |
| Android Studio | Debug | ~5 min | ~30 MB | GUI interface |
| Android Studio | Release | ~7 min | ~25 MB | GUI interface |
| Expo EAS | Cloud | ~20 min | ~25 MB | Requires internet |

**Recommendation**: Use `gradlew assembleDebug` for quick testing.

---

## 📁 Output Locations

After successful build, find your APK here:

```
C:\Users\PROFESSORHULK\FLYQ_APP\android\app\build\outputs\apk\
├── debug\
│   └── app-debug.apk          (Debug build - ~30 MB)
└── release\
    └── app-release.apk        (Release build - ~25 MB)
```

For AAB (Play Store):
```
C:\Users\PROFESSORHULK\FLYQ_APP\android\app\build\outputs\bundle\release\
└── app-release.aab            (Release bundle - ~20 MB)
```

---

## 🚀 Quick Command Summary

```powershell
# Get latest code
cd C:\Users\PROFESSORHULK\FLYQ_APP
git pull origin main
npm install

# Generate Android project (first time only)
npx expo prebuild --platform android

# Build Debug APK (fastest)
cd android
gradlew assembleDebug

# Build Release APK (optimized)
gradlew assembleRelease

# Install on connected phone
adb install app\build\outputs\apk\debug\app-debug.apk

# Open in Android Studio
# File → Open → C:\Users\PROFESSORHULK\FLYQ_APP\android
```

---

## 📞 Support

- **Email**: info@passion3dworld.com
- **Phone**: +91 9137361474
- **Website**: https://passion3dworld.com
- **Repository**: https://github.com/rahulgupta37079-oss/FLYQ_APP

---

**Generated**: 2026-04-09  
**Version**: 2.1.0 Professional Edition - REAL Implementation  
**Latest Commit**: dca11e9 - Build APK instructions
