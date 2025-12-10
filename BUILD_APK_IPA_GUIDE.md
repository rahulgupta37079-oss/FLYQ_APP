# 📱 Complete APK/IPA Build Guide - FLYQ Drone Controller

**Version:** 2.0.0  
**Last Updated:** December 10, 2025

This guide will walk you through building production-ready Android APK and iOS IPA files for the FLYQ Drone Controller app.

---

## 🎯 Prerequisites

### Required Accounts
- ✅ **Expo Account** (free) - Sign up at https://expo.dev
- ✅ **GitHub Account** - Repository: https://github.com/rahulgupta37079-oss/FLYQ_APP

### Optional Accounts (for App Store publishing)
- 📱 **Google Play Console** ($25 one-time fee) - For Android publishing
- 🍎 **Apple Developer Program** ($99/year) - For iOS publishing

### Software Requirements
- ✅ **Node.js** 20.x or higher
- ✅ **npm** 10.x or higher
- ✅ **Git** (for cloning repository)
- ✅ **EAS CLI** (will be installed)

---

## 📦 Part 1: Building Android APK

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/rahulgupta37079-oss/FLYQ_APP.git

# Navigate to frontend directory
cd FLYQ_APP/frontend
```

### Step 2: Install Dependencies

```bash
# Install all npm dependencies
npm install

# This will install:
# - React Native 0.81.5
# - Expo SDK 54.0
# - All required libraries
```

**Expected output:**
```
added 697 packages in 2m
```

### Step 3: Install EAS CLI

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Verify installation
eas --version
```

**Expected output:**
```
eas-cli/x.x.x
```

### Step 4: Login to Expo

```bash
# Login to your Expo account
eas login

# Enter your credentials when prompted
# Email: your-email@example.com
# Password: ********
```

**Expected output:**
```
✔ Logged in as your-email@example.com
```

### Step 5: Configure EAS (First Time Only)

```bash
# Configure EAS for the project
eas build:configure
```

**Questions and Answers:**
```
? Generate a new Android Keystore? → Yes
? Would you like to set up Push Notifications? → No (unless you want notifications)
```

**Result:** This creates/updates `eas.json` configuration file.

### Step 6: Build Preview APK (Recommended for Testing)

```bash
# Build APK for testing
eas build --platform android --profile preview

# You'll be asked:
# ? Commit changes? → Yes
```

**What happens:**
1. ✅ Code is uploaded to Expo servers
2. ✅ Dependencies are installed
3. ✅ Native Android code is compiled
4. ✅ APK is generated
5. ✅ Download link is provided

**Build time:** ~15-20 minutes

**Expected output:**
```
✔ Build finished successfully
✔ Build URL: https://expo.dev/accounts/[username]/projects/flyq-drone-controller/builds/[id]
```

### Step 7: Download the APK

**Option A: Via Browser**
```
1. Click the build URL from terminal
2. Download APK when ready
3. Transfer to Android device
```

**Option B: Via CLI**
```bash
# Download directly
eas build:download --platform android --latest
```

**APK Location:**
```
./flyq-drone-controller-[build-id].apk
```

### Step 8: Install APK on Android Device

**Method 1: USB Transfer**
```
1. Connect Android device via USB
2. Enable "File Transfer" mode
3. Copy APK to device
4. On device: Settings → Security → Enable "Install from Unknown Sources"
5. Open APK file and install
```

**Method 2: Direct Download**
```
1. Share the Expo build URL with yourself
2. Open URL on Android device
3. Download APK directly
4. Install
```

### Step 9: Build Production APK (For Publishing)

```bash
# Build production app bundle for Google Play Store
eas build --platform android --profile production
```

**Output:**
```
✔ App Bundle (.aab) ready for Google Play Store upload
```

**Note:** Google Play Store requires `.aab` format, not `.apk`

---

## 🍎 Part 2: Building iOS IPA

### Step 1: Prerequisites for iOS Build

**You need:**
- ✅ Apple Developer Account ($99/year)
- ✅ Valid certificate and provisioning profile
- ⚠️ **OR** use Expo's Ad Hoc distribution (no Apple account needed for testing)

### Step 2: Build Preview IPA (Testing - No Apple Account Needed)

```bash
# Build IPA for testing on your devices
eas build --platform ios --profile preview
```

**Questions:**
```
? Do you have access to the Apple account that will be used for this build? → No
? Would you like to use Ad Hoc provisioning? → Yes
? Add device UDIDs? → Yes (if you know them) or No (to add later)
```

**Build time:** ~20-25 minutes

**Expected output:**
```
✔ Build finished successfully
✔ Build URL: https://expo.dev/accounts/[username]/projects/flyq-drone-controller/builds/[id]
```

### Step 3: Register iOS Device UDID (For Testing)

**Find your device UDID:**

**Method 1: iPhone Settings**
```
1. Open Settings
2. Go to General → About
3. Tap on "UDID" to copy
```

**Method 2: iTunes/Finder (Mac)**
```
1. Connect iPhone to Mac
2. Open Finder (macOS Catalina+) or iTunes
3. Select device
4. Click on Serial Number to show UDID
5. Copy UDID
```

**Register UDID with Expo:**
```bash
eas device:create
```

**Enter:**
```
? Device name: My iPhone 13
? Device UDID: [paste your UDID]
```

### Step 4: Rebuild with Device Registered

```bash
# Rebuild IPA with your device included
eas build --platform ios --profile preview
```

### Step 5: Install IPA on iPhone

**Option A: Via Expo Go (Easiest)**
```
1. Install Expo Go from App Store
2. Scan QR code from `npx expo start`
3. Test app directly
```

**Option B: Via TestFlight (Recommended)**
```
1. Submit build to TestFlight
2. Invite yourself as tester
3. Install via TestFlight app
```

**Option C: Direct Installation (Advanced)**
```
1. Download IPA from Expo
2. Use tools like Apple Configurator, Xcode, or Diawi
3. Install on registered device
```

### Step 6: Build Production IPA (For App Store)

```bash
# Build for App Store submission
eas build --platform ios --profile production
```

**Requirements:**
- ✅ Valid Apple Developer Account
- ✅ App Store Connect account configured
- ✅ Distribution certificate
- ✅ App Store provisioning profile

**Expected output:**
```
✔ IPA ready for App Store submission
```

---

## 🔧 Part 3: Configuration & Environment Variables

### Backend URL Configuration

**Before building APK/IPA, configure backend URL:**

**Create/Edit `.env` file:**
```bash
cd FLYQ_APP/frontend
nano .env
```

**Content:**
```bash
# For local testing (use your computer's IP)
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:8001

# For cloud backend (after deploying to Railway/Heroku)
# EXPO_PUBLIC_BACKEND_URL=https://your-backend.railway.app

# Or use Heroku
# EXPO_PUBLIC_BACKEND_URL=https://flyq-backend.herokuapp.com
```

**Important:**
- 🚫 **Don't use** `localhost` in mobile apps (won't work)
- ✅ **Use** your computer's local IP for testing
- ✅ **Use** production URL for production builds

**Find your local IP:**

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

### Rebuild After Changing Environment

```bash
# After changing .env, rebuild:
eas build --platform android --profile preview
# or
eas build --platform ios --profile preview
```

---

## 🚀 Part 4: Complete Build Workflow

### For Development/Testing

```bash
# 1. Clone repository
git clone https://github.com/rahulgupta37079-oss/FLYQ_APP.git
cd FLYQ_APP/frontend

# 2. Install dependencies
npm install

# 3. Configure backend URL
echo "EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP:8001" > .env

# 4. Install EAS CLI
npm install -g eas-cli

# 5. Login to Expo
eas login

# 6. Build Android APK
eas build --platform android --profile preview

# 7. Build iOS IPA (optional)
eas build --platform ios --profile preview

# 8. Wait 15-20 minutes

# 9. Download builds
eas build:download --platform android --latest
```

### For Production Release

```bash
# 1. Deploy backend to cloud first
# (Railway, Heroku, etc.)

# 2. Update .env with production backend URL
echo "EXPO_PUBLIC_BACKEND_URL=https://your-backend.railway.app" > .env

# 3. Build production Android AAB
eas build --platform android --profile production

# 4. Build production iOS IPA
eas build --platform ios --profile production

# 5. Submit to stores
eas submit --platform android
eas submit --platform ios
```

---

## 📊 Build Profiles Explained

### `eas.json` Configuration

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"  // Standalone APK for testing
      },
      "ios": {
        "simulator": false  // Build for real devices
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"  // AAB for Play Store
      },
      "ios": {
        "buildConfiguration": "Release"  // Optimized build
      }
    }
  }
}
```

**Profile Comparison:**

| Profile | Android Output | iOS Output | Use Case |
|---------|---------------|------------|----------|
| `preview` | APK (installable) | IPA (Ad Hoc) | Testing, sharing |
| `production` | AAB (Play Store) | IPA (App Store) | Store publishing |

---

## 🛠️ Troubleshooting

### Android Build Issues

**Issue: Build fails with "Invalid Keystore"**
```bash
# Solution: Generate new keystore
eas credentials -p android
# Select "Build credentials"
# Select "Generate new Android Keystore"
```

**Issue: APK won't install**
```
Solution:
1. Enable "Install from Unknown Sources"
2. Settings → Security → Unknown Sources → Enable
3. Try installing again
```

**Issue: App crashes on launch**
```bash
# Solution: Check backend URL in .env
# Make sure it's accessible from device
# Test: curl http://YOUR_BACKEND_URL/api/
```

### iOS Build Issues

**Issue: "No provisioning profile found"**
```bash
# Solution: Register device UDID
eas device:create
# Then rebuild
```

**Issue: "Apple Developer account required"**
```
Solution:
1. Use preview profile (Ad Hoc) for testing
2. Or sign up for Apple Developer Program
```

**Issue: IPA won't install**
```
Solution:
1. Ensure device UDID is registered
2. Use TestFlight for easier installation
3. Or install via Expo Go
```

### General Issues

**Issue: "EAS CLI not found"**
```bash
npm install -g eas-cli
# Or with sudo on Mac/Linux:
sudo npm install -g eas-cli
```

**Issue: "Build takes too long"**
```
Normal build times:
- Android: 15-20 minutes
- iOS: 20-25 minutes

If longer than 30 minutes, check Expo status page
```

**Issue: "Out of free builds"**
```
Expo Free Plan includes:
- Limited builds per month
- Upgrade to paid plan for unlimited builds
```

---

## 📈 Build Costs

### Expo Free Plan
- ✅ Limited free builds per month
- ✅ Perfect for testing and development

### Expo Paid Plans
- **Production Plan:** $29/month - Unlimited builds
- **Enterprise Plan:** Custom pricing

### Store Publishing Costs
- **Google Play:** $25 one-time registration fee
- **Apple App Store:** $99/year developer membership

---

## 🎯 Quick Commands Reference

```bash
# Setup
npm install -g eas-cli
eas login

# Build Android APK (testing)
eas build --platform android --profile preview

# Build Android AAB (production)
eas build --platform android --profile production

# Build iOS IPA (testing)
eas build --platform ios --profile preview

# Build iOS IPA (production)
eas build --platform ios --profile production

# Build both platforms
eas build --platform all --profile preview

# Download latest build
eas build:download --platform android --latest
eas build:download --platform ios --latest

# View build status
eas build:list

# Submit to stores
eas submit --platform android
eas submit --platform ios

# Manage credentials
eas credentials

# Register iOS device
eas device:create
```

---

## 🎉 Success Checklist

### Android APK Build
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] EAS CLI installed
- [ ] Logged into Expo
- [ ] `.env` file configured with backend URL
- [ ] APK build completed
- [ ] APK downloaded
- [ ] APK installed on device
- [ ] App launches successfully
- [ ] Can connect to backend
- [ ] Joysticks work
- [ ] ARM/DISARM functions
- [ ] Telemetry displays

### iOS IPA Build
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] EAS CLI installed
- [ ] Logged into Expo
- [ ] `.env` file configured
- [ ] Device UDID registered
- [ ] IPA build completed
- [ ] IPA installed on device
- [ ] App launches successfully
- [ ] All features working

---

## 📞 Support & Resources

### Official Documentation
- **Expo EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/introduction/
- **Expo Credentials:** https://docs.expo.dev/app-signing/app-credentials/

### Project Resources
- **GitHub Repository:** https://github.com/rahulgupta37079-oss/FLYQ_APP
- **README:** https://github.com/rahulgupta37079-oss/FLYQ_APP/blob/main/README.md
- **Action Plan:** https://github.com/rahulgupta37079-oss/FLYQ_APP/blob/main/ACTION_PLAN.md

### Getting Help
1. Check build logs on Expo dashboard
2. Review error messages carefully
3. Consult Expo documentation
4. Check GitHub issues

---

## 🚁 Next Steps After Building

1. **Test the APK/IPA thoroughly**
   - Test all joystick controls
   - Verify ARM/DISARM safety
   - Test emergency stop
   - Check battery monitoring
   - Test WiFi detection

2. **Deploy Backend to Cloud**
   - Railway.app (recommended)
   - Heroku
   - Your own VPS

3. **Update App with Production Backend URL**
   - Edit `.env` file
   - Rebuild APK/IPA
   - Redistribute to testers

4. **Test with Real Drone**
   - Follow safety checklist
   - Test in open outdoor space
   - Verify all controls work

5. **Prepare for Store Submission**
   - Create app screenshots
   - Write app description
   - Create promotional graphics
   - Submit to Google Play / App Store

---

## ✨ Congratulations!

You now have production-ready APK and IPA builds of the FLYQ Drone Controller!

**Ready to fly! 🚁✈️**

---

*FLYQ Drone Controller v2.0 - Professional Edition*  
*Built with React Native, Expo, and ❤️*
