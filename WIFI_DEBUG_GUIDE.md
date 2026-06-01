# WiFi Connection Debugging Guide - FLYQ v2.1.3

## 🚨 **If App Is Not Connecting to Drone WiFi**

This guide will help you diagnose and fix WiFi connection issues.

---

## ✅ **What's Improved in v2.1.3 Enhanced**

### **New Features:**
1. ✅ **Multi-IP Auto-Discovery**: Tries multiple common ESP-Drone IPs automatically
   - `192.168.43.42` (ESP32 default)
   - `192.168.4.1` (Most common ESP32 AP mode)

2. ✅ **Connection Timeout**: 5-second timeout prevents infinite waiting

3. ✅ **Better Error Messages**: Shows which IPs were tried and why connection failed

4. ✅ **Auto-Reconnect Logic**: Disconnects old connection before trying new one

---

## 🔍 **Step-by-Step Debugging**

### **Step 1: Verify Drone WiFi Network**

**Check on your Android device:**
1. Go to WiFi Settings
2. Look for drone WiFi network:
   - `ESP_DRONE_xxx`
   - `TELLO-xxx`
   - Or your custom drone WiFi name
3. Connect to it (enter password if required)

**Expected Result:**
- ✅ WiFi icon appears in status bar
- ✅ Shows "Connected" in WiFi settings

---

### **Step 2: Find Your Drone's IP Address**

Most ESP32 drones use one of these IPs:

| IP Address | Usage |
|------------|-------|
| `192.168.4.1` | **Most common** - ESP32 SoftAP default |
| `192.168.43.42` | ESP-Drone example default |
| `192.168.0.1` | Some commercial drones |

**How to Find IP:**

#### **Method 1: Check Drone Documentation**
- Look in your drone's manual or datasheet

#### **Method 2: Use Network Scanner App**
1. Install "Fing" or "Network Scanner" from Play Store
2. Connect to drone WiFi
3. Scan network
4. Find device with open port `2390` (ESP-Drone UDP port)

#### **Method 3: Try Common IPs**
The app now automatically tries:
- `192.168.43.42`
- `192.168.4.1`

If your drone uses a different IP, **you need to add it to the code** (see Step 5).

---

### **Step 3: Test Connection in App**

1. **Open FLYQ App**
2. **Go to "WiFi Connection" screen**
3. **Check Status:**
   - WiFi status should show "● Connected"
   - Should show network name (e.g., "ESP_DRONE_xxx")

4. **Tap "Connect to Drone" button**
5. **Wait for connection attempt**
   - App will try `192.168.43.42` first (3-5 seconds)
   - If fails, tries `192.168.4.1` (3-5 seconds)
   - Shows success or error alert

---

### **Step 4: Check Logs for Errors**

**Using Android Studio Logcat:**

```bash
# Filter for FLYQ app logs
adb logcat | grep -E "EspDrone|WiFi"
```

**Look for these log messages:**

```
✅ GOOD LOGS (Connection Working):
[EspDrone] Connecting to 192.168.43.42:2390
[EspDrone] Socket listening on port 2399
[WiFi] Connected to ESP Drone at 192.168.43.42

❌ BAD LOGS (Connection Failing):
[EspDrone] Socket error: Network unreachable
[WiFi] Connection timeout
[WiFi] Failed at 192.168.43.42: Connection timeout
```

**Common Error Messages:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Connection timeout" | Drone not responding on that IP | Try different IP or check drone power |
| "Network unreachable" | Not connected to drone WiFi | Connect to drone WiFi in Android settings |
| "Failed for all IPs" | Wrong IP or drone not running UDP service | Check drone's actual IP address |
| "Socket error: Address already in use" | Port 2399 already in use | Restart app |

---

### **Step 5: Add Custom Drone IP (If Needed)**

If your drone uses a **different IP address**, you need to add it to the code:

**Edit:** `src/screens/WiFiScreen.js`

**Find this line (around line 61-62):**
```javascript
const possibleIPs = ['192.168.43.42', '192.168.4.1'];
```

**Add your drone's IP:**
```javascript
const possibleIPs = ['192.168.43.42', '192.168.4.1', '192.168.0.1']; // Added 192.168.0.1
```

**Then rebuild the app:**
```bash
eas build --platform android --profile preview
```

---

### **Step 6: Verify Drone UDP Service**

**Your drone MUST:**
1. ✅ Be powered on
2. ✅ Broadcasting WiFi network
3. ✅ Running UDP service on port `2390`
4. ✅ Listening for CRTP protocol packets

**Test if drone UDP service is running:**

```bash
# From your computer (connected to drone WiFi)
# Try to ping the drone
ping 192.168.4.1

# If ping works, try UDP packet test
echo "test" | nc -u 192.168.4.1 2390
```

If ping fails → **Drone WiFi is not working**
If UDP fails → **Drone software not running UDP service**

---

## 🛠️ **Advanced Troubleshooting**

### **Issue: App connects but drone doesn't respond to controls**

**Possible Causes:**
1. **Wrong Protocol**: Drone might not support CRTP protocol
2. **Wrong Port**: Drone might use different UDP port (not 2390)
3. **Firewall**: Drone firewall blocking packets
4. **Wrong Packet Format**: CRTP packet structure mismatch

**Solutions:**
- Check drone documentation for protocol details
- Use Wireshark to capture UDP packets and verify format
- Test with official drone app first to confirm drone works

---

### **Issue: Connection works sometimes but not always**

**Possible Causes:**
1. **WiFi interference**: Multiple devices on network
2. **Weak signal**: Too far from drone
3. **Android power saving**: Kills UDP socket
4. **Port conflict**: Another app using port 2399

**Solutions:**
```bash
# Check if port 2399 is free
adb shell netstat -an | grep 2399

# Force stop any apps using the port
# Then restart FLYQ app
```

---

### **Issue: Auto-connect doesn't work**

**Check:**
1. NetInfo is detecting WiFi change?
2. isDroneConnected state is false?
3. Not already connecting?

**Enable more logging:**

Edit `src/screens/WiFiScreen.js`:
```javascript
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    console.log('[WiFi] Network state changed:', JSON.stringify(state, null, 2));
    console.log('[WiFi] isConnecting:', isConnecting);
    console.log('[WiFi] isDroneConnected:', isDroneConnected);
    // ... rest of code
  });
}, [isDroneConnected]);
```

---

## 📊 **Connection Flow Diagram**

```
User Opens App
     ↓
NetInfo Monitors WiFi
     ↓
User Connects to Drone WiFi in Android Settings
     ↓
NetInfo Detects WiFi Connected
     ↓
Auto-Connect Triggered
     ↓
Try IP: 192.168.43.42 (5s timeout)
     ↓
  Success? → ✅ Connected!
     ↓ No
Try IP: 192.168.4.1 (5s timeout)
     ↓
  Success? → ✅ Connected!
     ↓ No
Show Error: "Connection Failed"
     ↓
User Can:
  - Check drone WiFi
  - Try manual connect
  - Check drone IP
  - Report issue
```

---

## 🔧 **Testing Checklist**

Before reporting connection issue, verify:

- [ ] Drone is powered on
- [ ] Drone WiFi network is broadcasting
- [ ] Android device connected to drone WiFi (not mobile data)
- [ ] WiFi shows "Connected" in Android settings
- [ ] Network name matches drone (ESP_DRONE_xxx)
- [ ] Tried "Connect to Drone" button in app
- [ ] Waited 10+ seconds for both IP attempts
- [ ] Checked logs with `adb logcat`
- [ ] Drone works with official app (if available)
- [ ] Tried restarting drone
- [ ] Tried restarting app
- [ ] Tried airplane mode on/off

---

## 📱 **How to Get Logs**

**Method 1: Android Studio**
1. Connect phone via USB
2. Open Android Studio → Logcat
3. Filter: "com.flyq.dronecontroller"
4. Reproduce issue
5. Copy logs

**Method 2: ADB Command**
```bash
# Start logging
adb logcat -c  # Clear old logs
adb logcat | grep -E "EspDrone|WiFi" > flyq_logs.txt

# Reproduce issue in app
# Press Ctrl+C to stop

# Send flyq_logs.txt for analysis
```

---

## 📞 **Getting Help**

If you still can't connect after following this guide:

**Provide this information:**

1. **Drone Model**: (e.g., ESP32-WROOM, Tello, Custom)
2. **Drone WiFi Name**: (e.g., ESP_DRONE_001)
3. **Drone IP Address**: (check with network scanner)
4. **Android Version**: (Settings → About Phone)
5. **FLYQ App Version**: 2.1.3
6. **Error Message**: (exact text from app)
7. **Logs**: (from adb logcat)
8. **Screenshots**: (WiFi settings + App screen)

---

## 🎯 **Expected Working Flow**

When everything works correctly:

```
1. User connects to drone WiFi in Android settings
   → WiFi status: "● Connected" (ESP_DRONE_xxx)

2. App detects WiFi connection
   → Console log: "[WiFi] Network state changed"

3. Auto-connect tries IPs
   → Console log: "[WiFi] Trying to connect to 192.168.43.42..."
   → Console log: "[EspDrone] Socket listening on port 2399"

4. Connection succeeds
   → Alert popup: "Connected! Successfully connected to ESP Drone at 192.168.43.42"
   → Drone status: "● Connected"
   → "Go to Control" button appears

5. User goes to Control screen
   → Can send commands to drone
   → Joysticks control drone movement
```

---

## 🔄 **What's Different from v2.1.2**

**v2.1.2** (Old):
- ❌ Only tried one IP: `192.168.43.42`
- ❌ No timeout (could wait forever)
- ❌ No retry logic
- ❌ Generic error messages

**v2.1.3 Enhanced** (New):
- ✅ Tries multiple IPs: `192.168.43.42`, `192.168.4.1`
- ✅ 5-second timeout per IP
- ✅ Auto-retry on failure
- ✅ Detailed error messages with IP list
- ✅ Better connection state management

---

## 📝 **Version History**

- **v2.1.0**: Initial release with permission fixes
- **v2.1.1**: Added Buffer polyfill
- **v2.1.2**: Implemented ESP-Drone CRTP protocol
- **v2.1.3**: Simplified WiFi connection flow
- **v2.1.3 Enhanced**: Multi-IP retry with timeout ⬅️ **Current**

---

**Last Updated**: 2026-06-01
**Author**: AI Assistant
**For**: FLYQ Drone Controller App
