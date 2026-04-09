# 📱 How to Run FLYQ App on Android Phone

**App**: FLYQ Drone Controller v2.1.0 Professional Edition  
**Repository**: https://github.com/rahulgupta37079-oss/FLYQ_APP  
**Generated**: 2026-04-09

---

## 🎯 Two Methods to Run on Android

### **Method 1: Install APK File (Recommended - Easy)**
- Build APK on PC → Transfer to phone → Install
- ⏱️ Time: 5-10 minutes
- ✅ Best for: Testing and daily use

### **Method 2: Direct USB Run (For Development)**
- Connect phone via USB → Run directly from Android Studio/CMD
- ⏱️ Time: Instant (after setup)
- ✅ Best for: Active development and debugging

---

## 📲 Method 1: Install APK File (Recommended)

### Step 1: Build the APK on Your PC

**Prerequisites:**
- ✅ Java JDK 17 installed
- ✅ JAVA_HOME set
- ✅ Android SDK installed

**Build command:**
```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP
git pull origin main
npm install
cd android
gradlew assembleDebug
```

**APK Location:**
```
C:\Users\PROFESSORHULK\FLYQ_APP\android\app\build\outputs\apk\debug\app-debug.apk
```

**Size**: ~30 MB  
**Build Time**: 3-5 minutes

---

### Step 2: Transfer APK to Your Phone

#### **Option A: WhatsApp (Easiest)**

1. Open WhatsApp on PC (WhatsApp Web or Desktop app)
2. Send the APK file to **yourself** or **any contact**
3. Open WhatsApp on your phone
4. Download the APK file
5. Tap the downloaded file to install

#### **Option B: USB Cable**

1. Connect phone to PC via USB cable
2. On your phone:
   - Swipe down → Tap USB notification
   - Select **"File Transfer"** or **"MTP"**
3. On your PC:
   - Open **File Explorer**
   - Find your phone under **"This PC"**
   - Navigate to **Phone → Download** folder
   - Copy `app-debug.apk` to this folder
4. On your phone:
   - Open **File Manager** app
   - Go to **Downloads** folder
   - Tap `app-debug.apk`

#### **Option C: Google Drive**

1. Upload `app-debug.apk` to Google Drive from PC
2. Open Google Drive on your phone
3. Find and tap `app-debug.apk`
4. Tap **"Download"**
5. After download, tap the file to install

#### **Option D: Email**

1. Email the APK to yourself
2. Open email on your phone
3. Download the attachment
4. Tap the downloaded APK file

---

### Step 3: Enable "Install Unknown Apps" on Phone

**When you tap the APK file, Android will ask for permission:**

#### **For Android 8.0 and above:**

1. Tap the APK file
2. You'll see: **"For your security, your phone is not allowed to install unknown apps from this source"**
3. Tap **"Settings"**
4. Enable **"Allow from this source"**
5. Tap **Back** button
6. Tap **"Install"**

#### **For Android 7.1 and below:**

1. Go to **Settings** → **Security**
2. Enable **"Unknown sources"**
3. Confirm **"OK"**
4. Now tap the APK file to install

---

### Step 4: Install the App

1. Tap the APK file
2. Tap **"Install"**
3. Wait for installation (~10 seconds)
4. Tap **"Open"** or find **"FLYQ"** icon in app drawer

---

## 🔌 Method 2: Direct USB Run (For Development)

### Step 1: Enable Developer Options on Phone

1. Go to **Settings** → **About Phone**
2. Find **"Build Number"**
3. Tap **"Build Number" 7 times**
4. You'll see: **"You are now a developer!"**

### Step 2: Enable USB Debugging

1. Go to **Settings** → **Developer Options**
2. Enable **"USB Debugging"**
3. Connect phone to PC via USB cable
4. On your phone, you'll see: **"Allow USB debugging?"**
5. Check **"Always allow from this computer"**
6. Tap **"OK"**

### Step 3: Verify Connection

**In CMD on your PC:**
```cmd
adb devices
```

**Should show:**
```
List of devices attached
ABCD1234567890  device
```

If it shows **"unauthorized"**, disconnect USB and reconnect, then tap **"OK"** on phone.

### Step 4: Install APK via USB

**After building APK:**
```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android\app\build\outputs\apk\debug
adb install app-debug.apk
```

**Or install and launch:**
```cmd
adb install app-debug.apk
adb shell am start -n com.flyq.dronecontroller/.MainActivity
```

### Step 5: Run Directly from Android Studio

1. Open Android Studio
2. **File** → **Open** → `C:\Users\PROFESSORHULK\FLYQ_APP\android`
3. Wait for Gradle sync
4. Connect phone via USB
5. Click green **▶️ Run** button
6. Select your device
7. App will install and launch automatically

---

## 🧪 Test the App on Your Phone

### 1. Open FLYQ App

- Find **"FLYQ"** icon in app drawer
- Tap to open

### 2. Navigate to WiFi Scan Screen

- Tap **"WiFi Scan"** button on home screen

### 3. Scan for Drones

- Tap **"Scan for Drones"** button
- Wait 2-3 seconds
- Should show list of nearby WiFi networks
- Networks with **"LiteWing"**, **"FLYQ"**, **"ESP32"** in name show drone icon 🚁

### 4. Connect to Drone

**Without Real Drone (Testing):**
- Just browse the network list
- See signal strength, frequency (2.4GHz/5GHz), security

**With Real Drone:**
1. **First**, connect your phone to drone's WiFi hotspot using Android WiFi settings:
   - Settings → WiFi → Find drone network (e.g., "LiteWing-001")
   - Connect and enter password if needed
2. **Then**, open FLYQ app
3. Tap **WiFi Scan**
4. Tap on the drone network in the list
5. Tap **"Connect to Drone"**
6. Should navigate to **Control Screen**

### 5. Test Drone Controls

**Control Screen features:**
- **Joysticks**: Left (thrust/yaw), Right (pitch/roll)
- **Buttons**: ARM, DISARM, TAKEOFF, LAND, STOP
- **Telemetry**: Battery, altitude, speed, orientation
- **Camera**: Live video stream (if drone supports it)

**Test sequence:**
1. ARM → Drone arms motors
2. TAKEOFF → Drone takes off to hover
3. Use joysticks to control flight
4. LAND → Drone lands
5. DISARM → Motors stop

---

## 🎮 Test Without Real Drone

You can test the app without a real drone using a simulated UDP server:

### Step 1: Create Mobile Hotspot on PC

**Windows 10/11:**
1. Settings → Network & Internet → Mobile hotspot
2. Turn ON **"Share my Internet connection"**
3. Set network name: **"LiteWing-Test"**
4. Set password: **"test1234"**

### Step 2: Run Test Drone Server on PC

Create `test_drone.py`:
```python
import socket
import json

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('0.0.0.0', 2989))

print("Test Drone UDP Server Started on port 2989")
print("Waiting for commands from FLYQ app...\n")

while True:
    data, addr = sock.recvfrom(1024)
    message = data.decode('utf-8').strip()
    print(f"Received: {message}")
    
    if message == "PING":
        sock.sendto(b"PONG", addr)
    elif message.startswith("CMD:"):
        sock.sendto(b"ACK", addr)
        parts = message.replace("CMD:", "").split(",")
        print(f"  Roll: {parts[0]}, Pitch: {parts[1]}, Yaw: {parts[2]}, Thrust: {parts[3]}")
    elif message == "ARM":
        sock.sendto(b"ACK:ARMED", addr)
        print("  ✅ Drone ARMED")
    elif message == "DISARM":
        sock.sendto(b"ACK:DISARMED", addr)
        print("  ❌ Drone DISARMED")
    elif message.startswith("TAKEOFF:"):
        sock.sendto(b"ACK:TAKING_OFF", addr)
        print(f"  🚁 Taking off")
    elif message == "LAND":
        sock.sendto(b"ACK:LANDING", addr)
        print("  🛬 Landing")
    elif message == "GET_TELEMETRY":
        telemetry = {"battery": 85.5, "altitude": 2.3, "speed": 1.2}
        sock.sendto(f"TEL:{json.dumps(telemetry)}".encode('utf-8'), addr)
```

**Run the server:**
```cmd
python test_drone.py
```

### Step 3: Connect Phone to Hotspot

1. On your phone: Settings → WiFi
2. Connect to **"LiteWing-Test"**
3. Enter password: **"test1234"**

### Step 4: Test in FLYQ App

1. Open FLYQ app
2. Go to WiFi Scan
3. Tap "Scan for Drones"
4. Find **"LiteWing-Test"** in list (shows drone icon)
5. Tap on it → "Connect to Drone"
6. Test ARM, TAKEOFF, controls, LAND, DISARM
7. Watch commands appear in PC terminal running the Python server

---

## 🐛 Troubleshooting

### Issue 1: APK won't install - "App not installed"

**Solutions:**
1. **Uninstall old version first:**
   - Settings → Apps → FLYQ → Uninstall
   - Then install new APK
2. **Or via ADB:**
   ```cmd
   adb uninstall com.flyq.dronecontroller
   adb install app-debug.apk
   ```
3. **Check storage space:**
   - Need at least 50 MB free space
4. **Try Release APK:**
   ```cmd
   cd C:\Users\PROFESSORHULK\FLYQ_APP\android
   gradlew assembleRelease
   ```

### Issue 2: "Parse error - There was a problem parsing the package"

**Solutions:**
1. APK file is corrupted - rebuild it
2. Transfer method corrupted the file - try different method
3. Phone architecture incompatible - check if phone is ARM64

### Issue 3: App crashes immediately after opening

**Solutions:**
1. **Check logs via USB:**
   ```cmd
   adb logcat | findstr FLYQ
   ```
2. **Clear app data:**
   - Settings → Apps → FLYQ → Storage → Clear Data
3. **Reinstall app:**
   ```cmd
   adb uninstall com.flyq.dronecontroller
   adb install app-debug.apk
   ```

### Issue 4: WiFi scan shows no networks

**Solutions:**
1. **Grant location permission:**
   - Android requires location permission for WiFi scanning
   - Settings → Apps → FLYQ → Permissions → Location → Allow
2. **Enable location services:**
   - Settings → Location → Turn ON
3. **Check phone's WiFi is enabled:**
   - Settings → WiFi → Turn ON

### Issue 5: Can't connect to drone

**Solutions:**
1. **First connect to drone WiFi manually:**
   - Settings → WiFi → Connect to drone network
   - THEN open FLYQ app
2. **Check drone IP address:**
   - Default: 192.168.4.1:2989
   - May need to modify in app settings
3. **Verify drone is powered on and WiFi hotspot is active**

### Issue 6: ADB device not found

**Solutions:**
1. **Enable USB Debugging:**
   - Settings → Developer Options → USB Debugging → ON
2. **Change USB mode:**
   - Swipe down → USB notification → File Transfer (not Charging only)
3. **Install USB drivers:**
   - Download from phone manufacturer website
4. **Try different USB cable:**
   - Some cables are charge-only, need data cable
5. **Authorize PC:**
   - Disconnect and reconnect USB
   - Tap "OK" on "Allow USB debugging?" popup

### Issue 7: "Gradle build failed"

**Solution:** See `FIX_JAVA_ERROR.md` guide in your project folder

---

## 📋 Quick Command Reference

### Build APK
```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android
gradlew assembleDebug
```

### Check Connected Devices
```cmd
adb devices
```

### Install APK via USB
```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android\app\build\outputs\apk\debug
adb install app-debug.apk
```

### Uninstall App
```cmd
adb uninstall com.flyq.dronecontroller
```

### Install and Launch
```cmd
adb install -r app-debug.apk
adb shell am start -n com.flyq.dronecontroller/.MainActivity
```

### View Logs
```cmd
adb logcat | findstr FLYQ
```

### Clear App Data
```cmd
adb shell pm clear com.flyq.dronecontroller
```

### Screenshot from Phone
```cmd
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

---

## 📁 File Locations

### APK Location on PC
```
C:\Users\PROFESSORHULK\FLYQ_APP\android\app\build\outputs\apk\debug\app-debug.apk
```

### App Data on Phone
```
/data/data/com.flyq.dronecontroller/
```

### Logs on Phone
```
/sdcard/Android/data/com.flyq.dronecontroller/files/
```

---

## 🎯 Summary

### **Quick Install (Easiest):**
1. Build APK on PC: `gradlew assembleDebug`
2. Send APK to phone via WhatsApp
3. Download on phone
4. Tap APK → Install
5. Open FLYQ app

### **USB Install (Fastest):**
1. Enable USB Debugging on phone
2. Connect via USB
3. Run: `adb install app-debug.apk`
4. Open FLYQ app

### **Direct Run (Development):**
1. Open Android Studio
2. Connect phone via USB
3. Click Run ▶️ button
4. App installs and launches automatically

---

## 📞 Support

- **Email**: info@passion3dworld.com
- **Phone**: +91 9137361474
- **Website**: https://passion3dworld.com
- **Repository**: https://github.com/rahulgupta37079-oss/FLYQ_APP

---

## ✅ Checklist for First Run

Before running on phone:
- [ ] Java JDK 17 installed on PC
- [ ] JAVA_HOME environment variable set
- [ ] Android SDK installed
- [ ] APK built successfully
- [ ] Phone developer mode enabled
- [ ] USB debugging enabled (if using USB)
- [ ] Phone connected and authorized (if using USB)
- [ ] Location permission granted on phone
- [ ] WiFi enabled on phone

---

**Generated**: 2026-04-09  
**Version**: 2.1.0 Professional Edition - REAL Implementation  
**Latest Commit**: 664513a - Java fix guide
