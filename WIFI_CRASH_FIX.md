# Fix WiFi Scanning Crash - FLYQ Drone Controller

**Problem**: App crashes when clicking "Scan for Networks" button.

**Root Causes**: 
1. Missing runtime permissions (Android 6+)
2. Location services disabled
3. WiFi scanning API compatibility issues
4. Missing error handling in WiFi scanner

---

## Quick Fix Steps

### Step 1: Add Safety Checks & Better Error Handling

The crash is likely happening because:
- **Location permission** not granted at runtime (required for WiFi scanning on Android 6+)
- **Location services** disabled on device
- **WiFi** is turned off

### Step 2: Update AndroidManifest.xml

Add `maxSdkVersion` to storage permissions (not needed for WiFi scanning):

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28"/>
```

Add Android 13+ WiFi permissions:

```xml
<!-- For Android 13+ (API 33+) -->
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" android:usesPermissionFlags="neverForLocation"/>
```

### Step 3: Rebuild & Test

```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android
gradlew clean
gradlew assembleDebug --no-daemon
cd app\build\outputs\apk\debug
adb install -r app-debug.apk
```

---

## User Instructions (When Using App)

**Before scanning for WiFi:**

1. **Enable Location Services**:
   - Settings → Location → Turn ON

2. **Enable WiFi**:
   - Settings → WiFi → Turn ON

3. **Grant Permissions**:
   - When app asks for Location permission, tap **"Allow"** or **"While using the app"**
   - If you accidentally denied: Settings → Apps → FLYQ → Permissions → Location → Allow

4. **Scan for Networks**:
   - Open FLYQ app → WiFi tab
   - Tap "📡 Scan for Networks"
   - Wait 2-5 seconds
   - Networks will appear (drone networks highlighted in green)

---

## Testing Without Real Drone

You can test WiFi scanning even without a drone:

1. Turn on WiFi and Location on your phone
2. Open FLYQ app
3. Tap "Scan for Networks"
4. You should see your home WiFi, phone hotspot, neighbor networks, etc.
5. Drone networks (with names like "LiteWing", "FLYQ", "ESP32") will show with a 🚁 icon

---

## Common Crash Scenarios & Fixes

### Crash 1: "Location permission denied"
**Fix**: Go to Settings → Apps → FLYQ → Permissions → Location → Allow

### Crash 2: "WiFi is disabled"
**Fix**: Enable WiFi in device settings

### Crash 3: "Location services disabled"
**Fix**: Settings → Location → Turn ON

### Crash 4: App crashes silently
**Fix**: 
```cmd
adb logcat | findstr "FLYQ\|WiFi\|ERROR\|FATAL"
```
Look for error messages and share them for detailed debugging.

---

## If Still Crashing

**Get debug logs**:

1. Connect phone via USB with USB Debugging enabled
2. Open app and try to scan WiFi
3. Run this command immediately after crash:
```cmd
adb logcat -d > C:\Users\PROFESSORHULK\flyq_crash_log.txt
```

4. Check the log file for errors:
```cmd
findstr /I "error fatal exception wifi" C:\Users\PROFESSORHULK\flyq_crash_log.txt
```

**Share the error messages** so I can provide a specific fix.

---

## Alternative: Use EAS Build for Safer APK

The cloud build may have better permission handling:

```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP
npx eas-cli build --platform android --profile preview
```

This creates a production-quality APK with proper permission setup.

---

## Quick Checklist Before Scanning

✅ WiFi is ON  
✅ Location is ON  
✅ Location permission granted to FLYQ app  
✅ Phone is not in Airplane Mode  
✅ Android version 6.0 or higher  

---

**Support**: info@passion3dworld.com | +91 9137361474  
**GitHub**: https://github.com/rahulgupta37079-oss/FLYQ_APP

Generated: 2026-04-17 | FLYQ v2.1.0 Professional
