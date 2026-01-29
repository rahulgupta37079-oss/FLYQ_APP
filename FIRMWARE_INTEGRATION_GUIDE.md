# 🔧 LITEWING FIRMWARE INTEGRATION GUIDE

## 📋 **Prerequisites**

Before starting, make sure you have:
- ✅ Arduino IDE or PlatformIO installed
- ✅ ESP32 board support installed
- ✅ LiteWing firmware source code
- ✅ USB cable to flash ESP32-S3

---

## 🚀 **STEP-BY-STEP INTEGRATION**

### **Step 1: Install Required Libraries**

Open Arduino IDE → Tools → Manage Libraries, then install:

1. **WebServer** (built-in with ESP32 core)
2. **ArduinoJson** (version 6.x)
   - Search for "ArduinoJson" by Benoit Blanchon
   - Click Install

### **Step 2: Add HTTP Bridge to Your Firmware**

#### **Option A: Quick Integration (Recommended)**

1. **Open your main firmware file** (usually `main.cpp` or `LiteWing.ino`)

2. **Add these includes at the top:**
```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
```

3. **Copy the entire content from** `firmware_integration/http_bridge.cpp`
   - Location: `/home/user/webapp/firmware_integration/http_bridge.cpp`
   - OR get it from GitHub: https://github.com/rahulgupta37079-oss/FLYQ_APP/blob/main/firmware_integration/http_bridge.cpp

4. **Paste it into your firmware file** (after the includes, before setup())

5. **In your `setup()` function, add:**
```cpp
void setup() {
    // Your existing setup code...
    WiFi.softAP("LiteWing-001", "12345678");
    
    // ... other setup code ...
    
    // ADD THIS LINE:
    setupHTTPServer();
}
```

6. **In your `loop()` function, add:**
```cpp
void loop() {
    // Your existing loop code...
    
    // ADD THIS LINE:
    processHTTPServer();
}
```

#### **Option B: Separate File (Cleaner)**

1. **Create a new file** in your firmware folder: `http_bridge.h`

2. **Copy the HTTP bridge code** into `http_bridge.h`

3. **In your main file, add:**
```cpp
#include "http_bridge.h"
```

4. **Follow steps 5-6 from Option A above**

---

### **Step 3: Adapt to Your Existing Code**

The HTTP bridge calls these external functions - you need to map them to your actual function names:

```cpp
// In http_bridge.cpp, find these lines and update them:

extern void sendCRTPCommand(float roll, float pitch, float yaw, float thrust);
extern void stopMotors();
extern float getBatteryVoltage();
extern bool getConnectionStatus();
```

**Replace with your actual function names:**

For example, if your LiteWing firmware has:
- `commanderSetSetpoint()` → Rename to `sendCRTPCommand()` OR update the calls
- `motorsStop()` → Rename to `stopMotors()` OR update the calls
- `getBattery()` → Rename to `getBatteryVoltage()` OR update the calls

**Example adaptation:**
```cpp
// If your code has different function names:
void handleCommand() {
    // ... parse JSON ...
    
    if (isArmed) {
        // Instead of: sendCRTPCommand(...)
        // Use your actual function:
        commanderSetSetpoint(
            currentCommand.roll,
            currentCommand.pitch,
            currentCommand.yaw,
            currentCommand.thrust
        );
    }
}
```

---

### **Step 4: Configure WiFi Settings**

Make sure your WiFi AP is configured correctly:

```cpp
void setup() {
    // Set WiFi AP with these settings:
    WiFi.softAP("LiteWing-001", "12345678");  // SSID and password
    
    // Optional: Set static IP (recommended)
    IPAddress local_IP(192, 168, 4, 1);
    IPAddress gateway(192, 168, 4, 1);
    IPAddress subnet(255, 255, 255, 0);
    WiFi.softAPConfig(local_IP, gateway, subnet);
    
    Serial.print("AP IP address: ");
    Serial.println(WiFi.softAPIP());  // Should print 192.168.4.1
}
```

---

### **Step 5: Flash the Firmware**

1. **Connect ESP32-S3** to your computer via USB

2. **Select the correct board:**
   - Tools → Board → ESP32 Arduino → ESP32S3 Dev Module

3. **Select the correct port:**
   - Tools → Port → (your COM port)

4. **Click Upload** (or press Ctrl+U)

5. **Wait for upload to complete** (usually 30-60 seconds)

6. **Open Serial Monitor** (Tools → Serial Monitor or Ctrl+Shift+M)
   - Baud rate: 115200
   - You should see: "HTTP server started on port 80"

---

### **Step 6: Test the HTTP Bridge**

#### **Test from Computer (Before Mobile App)**

1. **Connect your computer** to the LiteWing WiFi network
   - SSID: `LiteWing-001`
   - Password: `12345678`

2. **Test endpoints with curl** (or use Postman/browser):

**Test 1: Ping**
```bash
curl http://192.168.4.1/ping
# Expected: PONG
```

**Test 2: Telemetry**
```bash
curl http://192.168.4.1/telemetry
# Expected: {"battery":87.5,"armed":false,"connected":true,...}
```

**Test 3: Arm/Disarm**
```bash
curl -X POST http://192.168.4.1/arm \
  -H "Content-Type: application/json" \
  -d '{"armed":true}'
# Expected: ARMED
```

**Test 4: Send Command**
```bash
curl -X POST http://192.168.4.1/command \
  -H "Content-Type: application/json" \
  -d '{"roll":0,"pitch":0,"yaw":0,"thrust":0}'
# Expected: OK
```

**Test 5: Emergency Stop**
```bash
curl -X POST http://192.168.4.1/stop
# Expected: STOPPED
```

#### **Expected Serial Monitor Output**
```
WiFi AP started
SSID: LiteWing-001
IP address: 192.168.4.1
HTTP server started on port 80
Endpoints:
  POST /ping       - Connection check
  POST /command    - Flight commands
  GET  /telemetry  - Drone status
  POST /arm        - Arm/Disarm
  POST /stop       - Emergency stop

[Client connected]
POST /ping - OK
GET /telemetry - OK
POST /arm - ARMED
POST /command - roll:5.0 pitch:0.0 yaw:10.0 thrust:30000
```

---

## 🐛 **Troubleshooting**

### **Issue 1: Compilation Errors**

**Error:** `'WebServer' was not declared`
**Fix:** Install ESP32 board support in Arduino IDE
```
File → Preferences → Additional Board Manager URLs:
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```
Then: Tools → Board → Boards Manager → Install "ESP32"

---

**Error:** `'ArduinoJson' was not declared`
**Fix:** Install ArduinoJson library
```
Tools → Manage Libraries → Search "ArduinoJson" → Install
```

---

**Error:** `'sendCRTPCommand' was not declared`
**Fix:** Update function names to match your firmware (see Step 3)

---

### **Issue 2: WiFi Not Starting**

**Check Serial Monitor for:**
```
WiFi AP started
IP address: 192.168.4.1
```

**If not showing:**
- Verify `WiFi.softAP()` is called in `setup()`
- Check WiFi antenna is connected
- Try different WiFi channel: `WiFi.softAP("LiteWing-001", "12345678", 6)`

---

### **Issue 3: HTTP Endpoints Not Responding**

**Check:**
- Is `processHTTPServer()` called in `loop()`?
- Is there a `delay()` blocking the loop?
- Can you ping `192.168.4.1`?

**Fix:**
- Remove long `delay()` calls (use millis() instead)
- Verify IP address with Serial Monitor

---

### **Issue 4: Motors Not Responding to Commands**

**Check:**
- Are you calling your actual motor control function?
- Is the drone ARMED?
- Is `isArmed` flag set to true?

**Debug:**
Add Serial.println() in handleCommand():
```cpp
void handleCommand() {
    // ... parse JSON ...
    
    Serial.print("Command received: ");
    Serial.print("roll="); Serial.print(currentCommand.roll);
    Serial.print(" pitch="); Serial.print(currentCommand.pitch);
    Serial.print(" yaw="); Serial.print(currentCommand.yaw);
    Serial.print(" thrust="); Serial.println(currentCommand.thrust);
    
    if (isArmed) {
        sendCRTPCommand(...);
        Serial.println("Command sent to motors");
    } else {
        Serial.println("Not armed - command ignored");
    }
}
```

---

## ✅ **Verification Checklist**

Before testing with the mobile app, verify:

- [ ] Firmware compiles without errors
- [ ] ESP32-S3 flashed successfully
- [ ] Serial Monitor shows "HTTP server started on port 80"
- [ ] Can connect to LiteWing WiFi network
- [ ] `curl http://192.168.4.1/ping` returns "PONG"
- [ ] `curl http://192.168.4.1/telemetry` returns JSON
- [ ] Telemetry shows realistic values
- [ ] POST /arm changes motor state
- [ ] POST /stop disarms immediately

---

## 📱 **Next: Mobile App Testing**

Once firmware is working, proceed to:

### **Build the APK**

On your Windows machine:

```powershell
cd C:\Users\PROFESSORHULK\FLYQ_APP
git pull origin main
eas build --platform android --profile preview
```

**Monitor build:** https://expo.dev/accounts/professorhulk0/projects/flyq-drone-controller/builds

**Download APK** when ready (15-20 minutes)

---

### **Test with Real Hardware**

1. **Install APK** on your Android phone
2. **Power on LiteWing** drone
3. **Connect phone** to LiteWing-001 WiFi
4. **Open FLYQ app**
5. **Go to WiFi screen** → Scan for networks
6. **Tap LiteWing-001** → Should show "Connected"
7. **Go to Control screen**
8. **Check status bar:**
   - Connection: ✓ Connected (green)
   - Status: ✗ DISARMED (red)
   - Battery: % (from telemetry)
9. **Move joysticks** → Values should update
10. **Tap ARM button** → Status changes to ✓ ARMED
11. **Move left joystick up** → Motors spin up! 🚁

---

## 🎯 **Success Criteria**

You'll know it's working when:

✅ App connects to drone (green "Connected" indicator)  
✅ Telemetry updates in real-time (battery, signal)  
✅ Joystick movements show in telemetry display  
✅ ARM button changes status to ARMED  
✅ Motor sounds change when moving joysticks  
✅ Emergency STOP immediately disarms  

---

## 📚 **Additional Resources**

**LiteWing Documentation:**
- Wiki: https://circuitdigest.com/wiki/litewing/
- GitHub: https://github.com/Circuit-Digest/LiteWing
- Betaflight Setup: https://circuitdigest.com/tutorial/how-to-connect-the-litewing-esp32-drone-betaflight

**FLYQ App Documentation:**
- Full Guide: [PHASE2_COMPLETE.md](PHASE2_COMPLETE.md)
- Project Status: [PROJECT_STATUS_FINAL.md](PROJECT_STATUS_FINAL.md)
- GitHub: https://github.com/rahulgupta37079-oss/FLYQ_APP

---

## 💬 **Need Help?**

If you get stuck at any step, let me know:

1. **Share the error message** from Arduino IDE or Serial Monitor
2. **Tell me which step** you're stuck on
3. **Share your LiteWing firmware version** if you know it

I'll help you debug and get it working! 🚀
