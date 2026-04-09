# 🚀 Build FLYQ APK - Step-by-Step Instructions

## ⚠️ IMPORTANT: Build on Your Windows PC

The APK build requires EAS authentication, which needs to be done on your local machine.

---

## 📋 Prerequisites

1. **Expo account** (you already have: professorhulk00@gmail.com)
2. **Node.js** installed
3. **Git** installed
4. **Project code** pulled from GitHub

---

## 🔧 Build Steps (Windows PowerShell)

### Step 1: Pull Latest Code
```powershell
cd C:\Users\PROFESSORHULK\FLYQ_APP
git pull origin main
```

**What was updated**:
- ✅ Real WiFi scanning (`WiFiScannerService.js`)
- ✅ Real UDP drone control (`RealDroneService.js`)
- ✅ Updated WiFi and Control screens
- ✅ New dependency: `react-native-wifi-reborn`
- ✅ New permissions: Location (for WiFi scanning)

### Step 2: Install Dependencies
```powershell
npm install
```

**This installs**:
- `react-native-wifi-reborn@4.12.0` (new - for WiFi scanning)
- All other existing dependencies

### Step 3: Prebuild Native Code (REQUIRED!)
```powershell
npx expo prebuild --clean
```

**Why this is required**:
- New native module (`react-native-wifi-reborn`) needs to be linked
- New Android permissions need to be added
- Native UDP socket module needs configuration
- Takes ~30 seconds

### Step 4: Login to EAS (First Time Only)
```powershell
npx eas-cli login
```

**Enter**:
- Email: `professorhulk00@gmail.com`
- Password: (your Expo account password)

**Alternative**: If you're already logged in, skip this step.

### Step 5: Build Production AAB
```powershell
npx eas-cli build --platform android --profile production
```

**What happens**:
1. EAS uploads your code to build servers
2. Builds Android App Bundle (.aab)
3. Takes ~15-20 minutes
4. You'll get a download link when done

**Monitor build at**: https://expo.dev/accounts/professorhulk0/projects/flyq-drone-controller/builds

---

## 🎯 Alternative: Build APK Instead of AAB

If you want an APK (easier for testing), use the **preview profile**:

```powershell
npx eas-cli build --platform android --profile preview
```

**Difference**:
- **AAB** (.aab): For Play Store upload only
- **APK** (.apk): Can install directly on phone for testing

**Recommendation**: 
- Use **preview (APK)** for testing the new WiFi features
- Use **production (AAB)** for Play Store submission

---

## 📱 After Build Completes

### 1. Download the File
- EAS will show download link in terminal
- Or go to: https://expo.dev → Your builds → Download

### 2. Install on Phone

**For APK (preview build)**:
```
1. Transfer APK to phone
2. Tap to install
3. Allow "Install unknown apps" if prompted
4. Open FLYQ app
```

**For AAB (production build)**:
```
1. Upload to Play Console
2. Create release
3. Submit for review
4. Install from Play Store after approval
```

### 3. Test Real Features

**WiFi Scanning**:
1. Open FLYQ → WiFi Connection
2. Tap "Scan for Networks"
3. Grant Location permission
4. **You'll see REAL networks from your area!**
5. Drone networks (LiteWing, FLYQ, ESP32) appear at top

**UDP Connection**:
1. Connect to drone WiFi (or test hotspot)
2. App attempts UDP connection to 192.168.4.1:2989
3. Sends PING, expects PONG response
4. If connected → Go to Control screen
5. Joysticks send real UDP packets at 50Hz!

---

## 🧪 Testing Without Real Drone

### Create Test Environment

**1. Create WiFi Hotspot on PC**:
```
Windows Settings → Mobile hotspot
Name: LiteWing-Test
Password: test1234
Start hotspot
```

**2. Run Python UDP Server**:
```python
# Save as test_drone.py
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('192.168.137.1', 2989))  # Windows hotspot IP

print("Fake drone listening on 192.168.137.1:2989")

while True:
    data, addr = sock.recvfrom(1024)
    msg = data.decode()
    print(f"Received: {msg}")
    
    if msg == "PING":
        sock.sendto(b"PONG", addr)
        print("→ Sent PONG")
    elif msg.startswith("CMD:"):
        print(f"→ Flight: {msg[4:]}")
        sock.sendto(b"ACK", addr)
    elif msg == "ARM":
        print("→ ARMED")
        sock.sendto(b"ACK", addr)
    elif msg == "DISARM":
        print("→ DISARMED")
        sock.sendto(b"ACK", addr)
    elif msg == "GET_TEL":
        tel = b'TEL:{"battery":87,"signal":4,"altitude":0.5,"pitch":2.1,"roll":-1.3,"yaw":45.2}'
        sock.sendto(tel, addr)
```

**3. Run Server**:
```powershell
python test_drone.py
```

**4. Connect Phone**:
- Connect phone to "LiteWing-Test" hotspot
- Open FLYQ → WiFi → Scan
- Connect to drone
- Control screen → Move joysticks
- **You'll see commands in Python terminal!**

---

## 📊 Build Time Estimates

| Step | Time |
|------|------|
| Pull code | 10 sec |
| npm install | 30 sec |
| expo prebuild | 30 sec |
| EAS build (APK) | 15-20 min |
| EAS build (AAB) | 15-20 min |
| Download | 1 min |
| **Total** | **~20 min** |

---

## ❓ Troubleshooting

### "expo prebuild failed"
**Solution**: Delete `android/` and `ios/` folders first:
```powershell
rm -r android, ios
npx expo prebuild --clean
```

### "EAS login failed"
**Solution**: 
1. Check email/password correct
2. Or use token: `EXPO_TOKEN=your_token npx eas-cli build ...`
3. Or run: `npx expo whoami` to check login status

### "Build failed - dependencies error"
**Solution**:
```powershell
rm -r node_modules
rm package-lock.json
npm install
npx expo prebuild --clean
```

### "Permission denied on phone"
**Solution**:
1. Settings → Apps → FLYQ → Permissions
2. Enable Location → "Allow all the time"
3. Enable WiFi access
4. Restart app

### "WiFi scan returns empty"
**Solution**:
- Grant Location permission (required on Android 6+)
- Enable WiFi on phone
- Move closer to WiFi networks
- Check Android version (6.0+ required)

---

## 🎉 What You'll See After Building

### WiFi Scanning
```
✅ REAL networks from your area
✅ Signal strength (e.g., -45 dBm, -67 dBm)
✅ Frequency (2.4 GHz / 5 GHz)
✅ Security (WPA/WPA2/Open)
✅ Drone networks highlighted at top
```

### UDP Communication
```
✅ Sends PING → Receives PONG
✅ Joystick sends CMD packets at 50Hz
✅ ARM/DISARM commands sent
✅ Emergency STOP works
✅ Telemetry requests sent
```

### Flight Control
```
✅ Left joystick → UDP: CMD:0,0,yaw,thrust
✅ Right joystick → UDP: CMD:roll,pitch,0,0
✅ Both together → UDP: CMD:roll,pitch,yaw,thrust
✅ 50Hz update rate (smooth!)
```

---

## 📞 Support

**If build fails**:
1. Check error message carefully
2. Read troubleshooting section above
3. Check: https://docs.expo.dev/build/setup/

**If WiFi/UDP doesn't work**:
1. Read: `REAL_IMPLEMENTATION_GUIDE.md`
2. Test with Python server first
3. Check drone firmware implements UDP protocol

**Repository**: https://github.com/rahulgupta37079-oss/FLYQ_APP  
**Latest commit**: `9f93df9` - REAL implementation

---

## ✅ Quick Command Summary

```powershell
# Full build process (copy-paste all at once)
cd C:\Users\PROFESSORHULK\FLYQ_APP
git pull origin main
npm install
npx expo prebuild --clean
npx eas-cli login  # First time only
npx eas-cli build --platform android --profile preview  # APK for testing
# OR
npx eas-cli build --platform android --profile production  # AAB for Play Store
```

**Monitor build**: https://expo.dev/accounts/professorhulk0/projects/flyq-drone-controller/builds

---

**Generated**: 2026-02-14  
**Version**: 2.1.0 Professional Edition - REAL Implementation  
**Status**: ✅ Ready to build on your Windows PC
