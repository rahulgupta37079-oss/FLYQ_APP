# FLYQ App Testing Checklist - v2.1.3 Enhanced

## 🎯 Quick Test Guide

Use this checklist to test the WiFi connection fix.

---

## ✅ **Pre-Testing Setup**

- [ ] Drone is powered on and working
- [ ] Drone WiFi is broadcasting (check in Android WiFi settings)
- [ ] FLYQ v2.1.3 APK installed on Android device
- [ ] Developer Options enabled on Android (for logs)
- [ ] USB Debugging enabled (for logs)

---

## 📱 **Test 1: WiFi Detection**

### **Steps:**
1. Open Android WiFi Settings
2. Connect to drone WiFi (e.g., ESP_DRONE_xxx)
3. Open FLYQ app
4. Go to "WiFi Connection" screen

### **Expected Result:**
- [ ] WiFi status shows: **"● Connected"**
- [ ] Network name displayed: **"ESP_DRONE_xxx"**
- [ ] "Connect to Drone" button is **enabled** (not grayed out)

### **If Failed:**
- Check if actually connected to drone WiFi in Android settings
- Try disconnecting and reconnecting to drone WiFi
- Check if WiFi permissions are granted (Settings → Apps → FLYQ → Permissions)

---

## 🔗 **Test 2: Auto-Connect (Default IP)**

### **Steps:**
1. Already connected to drone WiFi (from Test 1)
2. Wait 2-3 seconds after opening WiFi Connection screen
3. Watch for auto-connect attempt

### **Expected Result:**
- [ ] Loading indicator appears briefly
- [ ] Alert popup shows: **"Connected! Successfully connected to ESP Drone at 192.168.43.42"** (or 192.168.4.1)
- [ ] Drone status shows: **"● Connected"**
- [ ] IP address displayed: **"IP: 192.168.43.42"** (or the working IP)

### **If Failed:**
- Check logs: `adb logcat | grep EspDrone`
- Look for error: "Connection timeout" or "Failed at 192.168.43.42"
- Your drone might use different IP (see Test 4)

---

## 🔗 **Test 3: Manual Connect**

### **Steps:**
1. If auto-connect didn't work, tap **"🚁 Connect to Drone"** button
2. Wait for connection attempt (up to 10 seconds)
3. Watch for alerts

### **Expected Result:**
- [ ] Loading indicator shows
- [ ] Console logs show trying both IPs:
  ```
  [WiFi] Trying to connect to 192.168.43.42...
  [WiFi] Trying to connect to 192.168.4.1...
  ```
- [ ] Alert shows success or detailed error message

### **If Failed:**
- **Error: "Connection Failed - Could not connect to drone. Tried IPs: 192.168.43.42, 192.168.4.1"**
  - Your drone uses different IP → See Test 4
  - Drone UDP service not running → Check drone software

---

## 🔍 **Test 4: Find Drone IP (If Tests 2-3 Failed)**

### **Method A: Network Scanner App**
1. Install "Fing" from Play Store
2. Connect to drone WiFi
3. Open Fing and scan network
4. Look for device with open port 2390

### **Method B: From Computer**
1. Connect computer to drone WiFi
2. Open terminal/cmd
3. Try common IPs:
   ```bash
   ping 192.168.4.1
   ping 192.168.43.42
   ping 192.168.0.1
   ```
4. Whichever responds → That's your drone IP

### **Result:**
- [ ] Found drone IP: **_______________**

### **Next Steps:**
If drone IP is different from `192.168.43.42` or `192.168.4.1`:
1. Note the IP address
2. Add it to the code (see WIFI_DEBUG_GUIDE.md Step 5)
3. Rebuild app
4. Re-test

---

## 🎮 **Test 5: Control Screen Navigation**

### **Steps:**
1. After successful connection (drone status: "● Connected")
2. Tap **"🎮 Go to Control Screen"** button
3. Verify control screen opens

### **Expected Result:**
- [ ] Control screen opens successfully
- [ ] Joysticks are visible
- [ ] Status bar shows "Connected"

---

## 🎮 **Test 6: Drone Control**

### **Steps:**
1. On Control screen
2. Move left joystick (throttle/yaw)
3. Move right joystick (pitch/roll)
4. Check if drone responds

### **Expected Result:**
- [ ] Drone responds to controls
- [ ] No lag or freeze
- [ ] Telemetry updates (if applicable)

### **If Failed:**
- Connection might be working but drone not responding to CRTP commands
- Check drone supports CRTP protocol
- Check logs for packet send errors

---

## 🔌 **Test 7: Disconnect**

### **Steps:**
1. Tap **"🔌 Disconnect"** button
2. Check status

### **Expected Result:**
- [ ] Alert shows: **"Disconnected from drone"**
- [ ] Drone status changes to: **"● Not Connected"**
- [ ] Buttons change back to "Connect to Drone"

---

## 🔄 **Test 8: Reconnect**

### **Steps:**
1. After disconnect (Test 7)
2. Tap **"🚁 Connect to Drone"** again
3. Check if reconnects

### **Expected Result:**
- [ ] Reconnects successfully
- [ ] Same or faster than first connect

---

## 📊 **Test Results Summary**

Fill this out after testing:

| Test | Status | Notes |
|------|--------|-------|
| Test 1: WiFi Detection | ✅ / ❌ | |
| Test 2: Auto-Connect | ✅ / ❌ | |
| Test 3: Manual Connect | ✅ / ❌ | |
| Test 4: Find Drone IP | IP: _______ | |
| Test 5: Control Screen | ✅ / ❌ | |
| Test 6: Drone Control | ✅ / ❌ | |
| Test 7: Disconnect | ✅ / ❌ | |
| Test 8: Reconnect | ✅ / ❌ | |

---

## 🐛 **Known Issues**

### **Issue 1: Auto-connect triggers multiple times**
- **Symptom**: Multiple connection attempts when WiFi state changes
- **Cause**: NetInfo fires multiple events
- **Fixed in**: v2.1.3 Enhanced (added `isConnecting` check)

### **Issue 2: Connection timeout too short**
- **Symptom**: "Connection timeout" even though drone is working
- **Solution**: Timeout set to 5 seconds per IP (10 seconds total)
- **If still timing out**: Check network latency, might need to increase timeout

### **Issue 3: Port already in use**
- **Symptom**: "Socket error: Address already in use"
- **Solution**: Restart app or device
- **Prevention**: Improved disconnect logic in v2.1.3 Enhanced

---

## 📝 **Log Collection**

If any tests fail, collect logs:

```bash
# Start logging
adb logcat -c
adb logcat | grep -E "EspDrone|WiFi|FLYQ" > test_logs.txt

# Reproduce the issue
# Then press Ctrl+C to stop logging

# Check test_logs.txt for errors
```

**Attach test_logs.txt when reporting issues**

---

## 🎯 **Success Criteria**

App is working correctly if:

- ✅ Tests 1-3 pass (WiFi detection and connection)
- ✅ Test 5 passes (Control screen navigation)
- ✅ Tests 7-8 pass (Disconnect/Reconnect)
- ✅ Test 6 passes (Bonus: actual drone control)

**Minimum requirement**: Tests 1-3 must pass for basic functionality.

---

## 📞 **Reporting Issues**

If tests fail, provide:

1. **Which test(s) failed**: (e.g., "Test 3 failed")
2. **Error message**: (exact text)
3. **Drone model**: (e.g., "ESP32-WROOM")
4. **Drone IP**: (from Test 4)
5. **Logs**: (test_logs.txt)
6. **Screenshots**: (WiFi settings + App screen)

---

**Version**: 2.1.3 Enhanced  
**Last Updated**: 2026-06-01  
**For**: FLYQ Drone Controller Testing
