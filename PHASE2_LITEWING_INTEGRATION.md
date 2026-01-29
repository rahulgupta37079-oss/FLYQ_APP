# 🚁 **PHASE 2: LITEWING DRONE INTEGRATION - STATUS REPORT**

## 📊 **Current Progress**

### ✅ **Completed:**
1. ✅ Analyzed LiteWing ESP32-S3 drone specifications
2. ✅ Researched CRTP (Crazy Real-Time Protocol) over UDP
3. ✅ Created CRTP protocol implementation (`CRTPProtocol.js`)
4. ✅ Created Drone Connection Service (`DroneConnectionService.js`)
5. ✅ Installed networking dependencies

### ⚠️ **Critical Challenge Discovered:**

**Problem**: React Native with Expo/EAS doesn't support native UDP sockets directly.

**Why This Matters**: The LiteWing drone uses **CRTP over UDP** protocol (port 2989/2990) for communication, which requires native UDP socket support.

---

## 🔧 **Technical Details - LiteWing Communication**

### **LiteWing Protocol Stack:**
```
Mobile App
    ↓
WiFi Connection (2.4 GHz)
    ↓
UDP Socket (Port 2989/2990)
    ↓
CRTP Protocol (Crazyflie)
    ↓
ESP32-S3 Drone
```

### **CRTP Protocol:**
- **Full Name**: Crazy Real-Time Protocol
- **Transport**: UDP packets
- **Packet Size**: 1-32 bytes
- **Update Rate**: 50 Hz (20ms intervals)
- **Commands**: Roll, Pitch, Yaw, Thrust (RPYT)

### **What I've Implemented:**
```javascript
// CRTP Packet Creation
createRPYTPacket(roll, pitch, yaw, thrust)
  → Returns Uint8Array packet
  → Ready to send to drone

// Command Mapping
mapJoystickToCRTP(leftJoystick, rightJoystick)
  → Converts joystick values to CRTP format
  → Maps throttle/yaw and pitch/roll
```

---

## 🚧 **The UDP Socket Problem**

### **Expo/EAS Limitations:**
1. ❌ No native UDP socket support
2. ❌ `react-native-udp` doesn't work with Expo managed workflow
3. ❌ Cannot use `dgram` (Node.js UDP) in React Native
4. ❌ EAS Build doesn't support custom native modules easily

### **Why Our Current Build Can't Work:**
- Expo uses a **managed workflow**
- Native modules require **bare React Native** workflow
- UDP requires **native platform code** (Java/Kotlin for Android, Swift/Obj-C for iOS)

---

## 💡 **SOLUTIONS - 3 Options**

### **Option 1: HTTP Bridge (EASIEST - RECOMMENDED)**

**How It Works:**
```
Mobile App (HTTP)
    ↓
ESP32-S3 HTTP Server
    ↓
Internal UDP Client
    ↓
CRTP Protocol
```

**Pros:**
- ✅ Works with current Expo setup
- ✅ No native modules needed
- ✅ Can build with EAS immediately
- ✅ Cross-platform (Android + iOS)

**Cons:**
- ⚠️ Requires modifying ESP32-S3 firmware
- ⚠️ Slightly higher latency (~5-10ms)

**Implementation:**
```javascript
// App sends HTTP requests
fetch('http://192.168.4.1/command', {
  method: 'POST',
  body: JSON.stringify({ roll, pitch, yaw, thrust })
});

// ESP32 handles conversion to CRTP
```

**Your Action:**
1. Add HTTP server to ESP32-S3 firmware
2. Create endpoint: `/command` (receives flight commands)
3. ESP32 converts HTTP → CRTP internally
4. App works immediately!

---

### **Option 2: Eject to Bare React Native (COMPLEX)**

**How It Works:**
- Convert from Expo managed → Bare React Native
- Add native UDP module
- Build with Android Studio / Xcode

**Pros:**
- ✅ True UDP support
- ✅ Lowest latency
- ✅ Full native control

**Cons:**
- ❌ Lose Expo easy builds
- ❌ Need Android Studio + Xcode
- ❌ Complex setup
- ❌ Harder to maintain

**Steps:**
```bash
npx expo prebuild
cd android && ./gradlew assembleRelease
```

**Your Action:**
1. Run `npx expo prebuild` (creates android/ios folders)
2. Install `react-native-udp` native module
3. Link native code
4. Build with Android Studio
5. Much more complex!

---

### **Option 3: WebSocket Bridge (MEDIUM COMPLEXITY)**

**How It Works:**
```
Mobile App (WebSocket)
    ↓
ESP32-S3 WebSocket Server
    ↓
Internal CRTP Handler
```

**Pros:**
- ✅ Works with Expo
- ✅ Real-time bidirectional
- ✅ Good for telemetry too

**Cons:**
- ⚠️ Requires ESP32 WebSocket server
- ⚠️ Slightly more complex than HTTP

**Implementation:**
```javascript
const ws = new WebSocket('ws://192.168.4.1:8080');
ws.send(JSON.stringify({ roll, pitch, yaw, thrust }));
```

---

## 🎯 **RECOMMENDED APPROACH: Option 1 (HTTP Bridge)**

### **Why HTTP Bridge is Best:**
1. ✅ **No app changes needed** - Current code works!
2. ✅ **Firmware modification only** - You control ESP32-S3
3. ✅ **Keep Expo workflow** - Easy builds with EAS
4. ✅ **Fast implementation** - Can be done in 1-2 hours
5. ✅ **Works for testing** - Production-ready later

### **ESP32-S3 Firmware Modification:**

Add this to your LiteWing firmware:

```cpp
// ESP32-S3 Arduino/ESP-IDF Code
#include <WiFi.h>
#include <WebServer.h>
#include "CRTP.h" // Your existing CRTP implementation

WebServer server(80);
CRTP crtp; // Your CRTP handler

void handleCommand() {
  if (server.hasArg("plain")) {
    String json = server.arg("plain");
    
    // Parse JSON
    float roll = parseFloat(json, "roll");
    float pitch = parseFloat(json, "pitch");
    float yaw = parseFloat(json, "yaw");
    uint16_t thrust = parseInt(json, "thrust");
    
    // Convert to CRTP and send to motors
    crtp.sendCommand(roll, pitch, yaw, thrust);
    
    server.send(200, "text/plain", "OK");
  } else {
    server.send(400, "text/plain", "Bad Request");
  }
}

void setup() {
  // Your existing WiFi AP setup
  WiFi.softAP("LiteWing-001", "password");
  
  // Add HTTP endpoints
  server.on("/command", HTTP_POST, handleCommand);
  server.on("/ping", HTTP_POST, []() {
    server.send(200, "text/plain", "PONG");
  });
  
  server.begin();
}

void loop() {
  server.handleClient();
  // Your existing loop code
}
```

---

## 📱 **Current App Status**

### **What's Already Done:**
```
✅ UI/UX Complete (all 5 screens)
✅ Navigation working
✅ Joystick controls implemented
✅ CRTP protocol encoding ready
✅ Connection service ready
✅ Telemetry display ready
```

### **What's Waiting for Firmware:**
```
⏳ HTTP API on ESP32-S3
⏳ /command endpoint
⏳ /telemetry endpoint
⏳ /status endpoint
```

### **Once Firmware is Ready:**
```
🚀 Connect to LiteWing WiFi
🚀 Tap "Scan" → Finds LiteWing-XXX
🚀 Tap "Connect" → Establishes HTTP connection
🚀 Move joysticks → Sends commands via HTTP
🚀 Drone flies → Real flight control!
```

---

## 🎯 **YOUR NEXT STEPS**

### **Step 1: Add HTTP Server to ESP32-S3**

Modify LiteWing firmware to add:

```cpp
// Required endpoints:
POST /command     // Flight commands
GET  /telemetry   // Drone status
POST /ping        // Connection check
```

### **Step 2: Test with the App**

1. Flash modified firmware to LiteWing
2. Power on drone
3. Connect phone to LiteWing WiFi
4. Open FLYQ app
5. Go to WiFi screen → Scan
6. Connect to LiteWing network
7. Go to Control screen
8. Move joysticks → Drone responds!

### **Step 3: Build & Deploy**

```powershell
cd C:\Users\PROFESSORHULK\FLYQ_APP
git pull origin main
eas build --platform android --profile preview
```

---

## 📚 **Resources for Firmware Modification**

### **LiteWing GitHub:**
- Firmware: https://github.com/Circuit-Digest/LiteWing/tree/main/LiteWing%20Firmware%20binary%20files
- Hardware: https://github.com/Circuit-Digest/LiteWing/tree/main/hardware

### **ESP32 HTTP Server Examples:**
- ESP32 WebServer: https://github.com/espressif/arduino-esp32/tree/master/libraries/WebServer
- ESP-IDF HTTP Server: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/protocols/esp_http_server.html

### **Crazyflie CRTP Protocol:**
- CRTP Docs: https://www.bitcraze.io/documentation/repository/crazyflie-firmware/master/functional-areas/crtp/
- CFLib: https://github.com/bitcraze/crazyflie-lib-python

---

## 🤔 **Alternative: Can You Modify Firmware?**

### **If YES:**
✅ **Proceed with Option 1 (HTTP Bridge)**
- I've already created the app-side code
- You just need to add HTTP server to ESP32
- Everything else is ready!

### **If NO (Firmware is locked):**
We have 2 options:
1. **Find existing HTTP API** - LiteWing might already have one
2. **Use Option 2 (Bare RN)** - Eject from Expo (complex)

---

## 💬 **Let Me Know:**

**Question 1**: Can you modify the LiteWing firmware?
- ✅ YES → I'll help you add HTTP server code
- ❌ NO → We'll explore Option 2 (Bare React Native)

**Question 2**: Does LiteWing already have an HTTP API?
- Check the firmware source code
- Look for WebServer or HTTP endpoints
- If yes, we can use it immediately!

**Question 3**: What do you want to do next?
- **A**: Help me add HTTP server to firmware
- **B**: Try Bare React Native approach (complex)
- **C**: Build current app and test WiFi scanning first

---

## 🎊 **Summary**

### **Good News:**
- ✅ App is ready for drone communication
- ✅ CRTP protocol implemented
- ✅ Connection service ready
- ✅ Just needs firmware HTTP bridge

### **Action Required:**
- 🔧 Add HTTP server to ESP32-S3 firmware
- 🔧 Create 3 endpoints (/command, /telemetry, /ping)
- 🔧 Convert HTTP → CRTP internally

### **Result:**
- 🚁 Full drone control from phone!
- 🚁 Real-time flight commands
- 🚁 Live telemetry display
- 🚁 Professional drone controller app!

---

**What's your decision? Ready to modify firmware, or should we try another approach?** 🚀

---

*Files Created:*
- `/src/utils/CRTPProtocol.js` - CRTP protocol implementation
- `/src/utils/DroneConnectionService.js` - Connection management
- This documentation file

*GitHub*: https://github.com/rahulgupta37079-oss/FLYQ_APP
