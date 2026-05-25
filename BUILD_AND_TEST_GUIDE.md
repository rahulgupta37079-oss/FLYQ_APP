# 🚀 Build APK with Buffer Fix & Get QR Code

## Quick Build Instructions

### Step 1: Open Terminal/Command Prompt on Your Computer

Navigate to your project folder or run these commands:

```bash
# Login to Expo
npx eas-cli login
```

Enter your Expo credentials when prompted.

### Step 2: Build APK with the Fix

```bash
# Build APK (for testing on device)
npx eas-cli build --platform android --profile preview
```

**Or build AAB (for Play Store):**
```bash
npx eas-cli build --platform android --profile production
```

### Step 3: Get Download Link & QR Code

After build completes (~5-7 minutes), EAS will display:
- ✅ Download URL
- 📱 QR Code (scan with your phone to install)

Example output:
```
✔ Build finished

🎉 APK: https://expo.dev/artifacts/eas/abc123...
📱 Scan QR code to download on your device
```

---

## Alternative: Use Expo Website (No Command Line)

1. Go to: https://expo.dev
2. Login
3. Projects → flyq-drone-controller → Builds
4. Click "Create a build"
5. Platform: Android
6. Build type: **APK** (for testing)
7. Wait for build
8. Download or scan QR code

---

## What's Different in v2.1.1?

✅ Fixed: "Property 'Buffer' doesn't exist" error
✅ WiFi scanning now works
✅ UDP drone communication functional
✅ All network operations stable

---

## Testing Checklist

After installing new APK:
- [ ] App launches without errors
- [ ] Navigate to WiFi Connection screen
- [ ] Tap "Scan for Networks"
- [ ] No "Buffer" error appears
- [ ] Networks scan completes successfully
- [ ] Try connecting to drone WiFi

