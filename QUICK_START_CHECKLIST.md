# ✅ QUICK START CHECKLIST - HARDWARE TESTING

## 🎯 **Your Mission: Get the Drone Flying!**

Follow this checklist in order. Check off each item as you complete it.

---

## 📋 **PHASE 1: FIRMWARE PREPARATION**

### **1. Install Arduino IDE & Libraries**
- [ ] Download Arduino IDE from https://arduino.cc
- [ ] Install ESP32 board support
- [ ] Install ArduinoJson library (Tools → Manage Libraries)

### **2. Prepare LiteWing Firmware**
- [ ] Extract LiteWing-main.rar
- [ ] Open main firmware file in Arduino IDE
- [ ] Locate the `setup()` function
- [ ] Locate the `loop()` function

### **3. Add HTTP Bridge**
- [ ] Copy `firmware_integration/http_bridge.cpp` content
- [ ] Paste into firmware (after includes, before setup)
- [ ] Add `setupHTTPServer();` to `setup()` function
- [ ] Add `processHTTPServer();` to `loop()` function
- [ ] Update function names if needed (see guide)

### **4. Configure WiFi**
- [ ] Set SSID: `LiteWing-001` (or your preferred name)
- [ ] Set password: `12345678` (or your preferred password)
- [ ] Verify IP: `192.168.4.1`

### **5. Flash Firmware**
- [ ] Connect ESP32-S3 via USB
- [ ] Select board: ESP32S3 Dev Module
- [ ] Select correct COM port
- [ ] Click Upload
- [ ] Wait for "Done uploading"

### **6. Verify Firmware**
- [ ] Open Serial Monitor (115200 baud)
- [ ] See "HTTP server started on port 80"
- [ ] See IP address: 192.168.4.1
- [ ] Power cycle drone to test

---

## 📋 **PHASE 2: TEST FIRMWARE (BEFORE MOBILE APP)**

### **7. Connect to Drone WiFi**
- [ ] Turn on LiteWing drone
- [ ] On your computer, connect to WiFi: LiteWing-001
- [ ] Password: 12345678
- [ ] Verify connected (WiFi icon should show connection)

### **8. Test Endpoints with curl**
- [ ] `curl http://192.168.4.1/ping` → Should return "PONG"
- [ ] `curl http://192.168.4.1/telemetry` → Should return JSON
- [ ] Verify battery value is reasonable
- [ ] Verify armed=false in response

### **9. Test ARM/DISARM**
- [ ] `curl -X POST http://192.168.4.1/arm -H "Content-Type: application/json" -d '{"armed":true}'`
- [ ] Check Serial Monitor → Should show "ARMED"
- [ ] Listen to motors → Should initialize
- [ ] Disarm: `curl -X POST http://192.168.4.1/arm -H "Content-Type: application/json" -d '{"armed":false}'`

### **10. Test Commands**
- [ ] Arm drone first
- [ ] `curl -X POST http://192.168.4.1/command -H "Content-Type: application/json" -d '{"roll":0,"pitch":0,"yaw":0,"thrust":30000}'`
- [ ] Motors should spin up slightly
- [ ] Test emergency stop: `curl -X POST http://192.168.4.1/stop`
- [ ] Motors should stop immediately

**✅ IF ALL TESTS PASS → Firmware is ready! Proceed to mobile app.**

**❌ IF ANY TEST FAILS → See troubleshooting in FIRMWARE_INTEGRATION_GUIDE.md**

---

## 📋 **PHASE 3: BUILD MOBILE APK**

### **11. Prepare Build Environment**
- [ ] Open Command Prompt (Windows) or Terminal (Mac/Linux)
- [ ] Navigate to project: `cd C:\Users\PROFESSORHULK\FLYQ_APP`
- [ ] Pull latest code: `git pull origin main`

### **12. Start EAS Build**
- [ ] Run: `eas build --platform android --profile preview`
- [ ] Wait for build to start
- [ ] Note the build URL provided

### **13. Monitor Build Progress**
- [ ] Open https://expo.dev/accounts/professorhulk0/projects/flyq-drone-controller/builds
- [ ] Find latest build
- [ ] Watch progress (15-20 minutes)
- [ ] Phases: Install deps → Build → Upload

### **14. Download APK**
- [ ] Build status shows "Finished"
- [ ] Click "Download" button
- [ ] APK saves to Downloads folder
- [ ] File size should be ~25-30 MB

---

## 📋 **PHASE 4: INSTALL & TEST MOBILE APP**

### **15. Install on Android Phone**
- [ ] Transfer APK to phone (USB, email, cloud, etc.)
- [ ] On phone: Settings → Security → Enable "Unknown Sources"
- [ ] Tap APK file to install
- [ ] Accept permissions
- [ ] See app icon: "FLYQ Drone Controller"

### **16. Connect Phone to Drone**
- [ ] Turn on LiteWing drone
- [ ] On phone: Settings → WiFi
- [ ] Connect to: LiteWing-001
- [ ] Password: 12345678
- [ ] Verify connected (WiFi icon shows connection)

### **17. Launch App**
- [ ] Tap FLYQ app icon
- [ ] Home screen loads
- [ ] See status cards: "Ready" and "Not Connected"

### **18. Test WiFi Screen**
- [ ] Tap "📡 WiFi Connection"
- [ ] See current connection status
- [ ] Tap "📡 Scan for Networks"
- [ ] Wait 2 seconds
- [ ] LiteWing-001 appears in list (with 🚁 icon)
- [ ] Network has green border (drone network)
- [ ] Tap LiteWing-001
- [ ] Alert: "Connecting..."
- [ ] Alert: "Success! Connected to LiteWing-001"
- [ ] Tap "Go to Control"

### **19. Test Control Screen**
- [ ] Status bar shows:
  - [ ] ✓ Connected (green)
  - [ ] ✗ DISARMED (red)
  - [ ] Battery: % (real value)
  - [ ] Signal: bars (should show)
- [ ] Telemetry displays:
  - [ ] Throttle: 0%
  - [ ] Yaw: 0°
  - [ ] Pitch: 0°
  - [ ] Roll: 0°

### **20. Test Joysticks**
- [ ] Move LEFT joystick UP → Throttle increases
- [ ] Move LEFT joystick DOWN → Throttle decreases
- [ ] Move LEFT joystick LEFT → Yaw shows negative
- [ ] Move LEFT joystick RIGHT → Yaw shows positive
- [ ] Move RIGHT joystick UP → Pitch increases
- [ ] Move RIGHT joystick DOWN → Pitch decreases
- [ ] Move RIGHT joystick LEFT → Roll shows negative
- [ ] Move RIGHT joystick RIGHT → Roll shows positive
- [ ] Values update in real-time

### **21. Test ARM/DISARM**
- [ ] Tap "🔒 ARM" button
- [ ] Alert: "Arm Drone? Make sure the area is clear..."
- [ ] Tap "ARM"
- [ ] Status changes to "✓ ARMED" (green)
- [ ] Motors should initialize
- [ ] Tap "🔓 DISARM" button
- [ ] Alert: "Disarm Drone? This will stop all motors..."
- [ ] Tap "DISARM"
- [ ] Status changes to "✗ DISARMED" (red)
- [ ] Motors stop

---

## 📋 **PHASE 5: FIRST FLIGHT! 🚁**

### **22. Pre-Flight Checks**
- [ ] Clear area around drone (3+ meters)
- [ ] Drone on flat, stable surface
- [ ] Battery fully charged
- [ ] Propellers attached correctly
- [ ] Phone connected to drone WiFi
- [ ] App shows "✓ Connected"

### **23. ARM and Test Motors**
- [ ] Tap "🔒 ARM"
- [ ] Confirm ARM
- [ ] Status: "✓ ARMED" (green)
- [ ] Move LEFT joystick UP slightly (10-20%)
- [ ] Motors should spin
- [ ] Move joystick DOWN → Motors slow
- [ ] Tap "🔓 DISARM" → Motors stop
- [ ] **✅ Motor test successful!**

### **24. First Hover**
- [ ] ARM drone
- [ ] Slowly move LEFT joystick UP
- [ ] Throttle at ~60-70%
- [ ] Drone should lift off ground
- [ ] Hold joystick steady
- [ ] Use RIGHT joystick to stabilize if needed
- [ ] **✅ DRONE IS FLYING!** 🎉

### **25. Test Flight Controls**
- [ ] While hovering:
  - [ ] LEFT joystick LEFT → Drone rotates left (yaw)
  - [ ] LEFT joystick RIGHT → Drone rotates right
  - [ ] RIGHT joystick UP → Drone moves forward (pitch)
  - [ ] RIGHT joystick DOWN → Drone moves backward
  - [ ] RIGHT joystick LEFT → Drone moves left (roll)
  - [ ] RIGHT joystick RIGHT → Drone moves right

### **26. Landing**
- [ ] Slowly move LEFT joystick DOWN
- [ ] Reduce throttle gradually
- [ ] Drone descends
- [ ] Lands on ground
- [ ] Tap "🔓 DISARM"
- [ ] Motors stop
- [ ] **✅ SUCCESSFUL FLIGHT!** 🎊

### **27. Emergency Stop Test** (Optional, but important)
- [ ] ARM drone
- [ ] Hover at low altitude (~0.5m)
- [ ] Tap "🛑 EMERGENCY"
- [ ] Confirm "STOP NOW"
- [ ] Motors should stop IMMEDIATELY
- [ ] Drone falls (expected)
- [ ] **✅ Emergency stop works!**

---

## 🎉 **MISSION COMPLETE!**

**If you reached this point, you have:**

✅ Built a complete React Native drone controller app  
✅ Integrated HTTP API into LiteWing firmware  
✅ Flashed custom firmware to ESP32-S3  
✅ Connected mobile app to real drone hardware  
✅ Controlled a flying drone with virtual joysticks  
✅ Tested ARM/DISARM and emergency stop  
✅ Successfully flew and landed!  

---

## 📊 **Flight Log Template**

Keep track of your flights:

```
Date: _____________
Flight #: _____
Duration: _____ minutes
Battery Start: _____%
Battery End: _____%

Tests Performed:
[ ] Hover
[ ] Forward/Backward
[ ] Left/Right
[ ] Rotation (yaw)
[ ] Emergency Stop

Issues/Notes:
_________________________________
_________________________________
_________________________________

Max Altitude: _____ meters
Total Flights: _____
```

---

## 💬 **What's Next?**

Now that you have a working drone controller, you can:

1. **Add Video Streaming** → FPV camera feed
2. **Add GPS Waypoints** → Autonomous missions
3. **Add Flight Recording** → Review flights later
4. **Tune PID Controllers** → Better flight stability
5. **Add Sensors** → Obstacle avoidance, altitude hold

**Tell me which feature you'd like to add next!** 🚀
