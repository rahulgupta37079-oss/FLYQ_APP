# 📱 Publishing FLYQ App to Google Play Store

**App**: FLYQ Drone Controller v2.1.0 Professional  
**Date**: 2026-04-17  
**GitHub**: https://github.com/rahulgupta37079-oss/FLYQ_APP

---

## 📋 Pre-Publishing Checklist

Before publishing, ensure you have:
- [ ] Google Play Console account ($25 one-time fee)
- [ ] App is fully tested and working
- [ ] All permissions are properly configured
- [ ] Privacy policy URL (required for apps requesting sensitive permissions)
- [ ] App icons in all required sizes
- [ ] Screenshots for store listing
- [ ] App description and marketing materials

---

## 🔑 Step 1: Create Google Play Console Account

1. Go to https://play.google.com/console
2. Sign in with Google account (professorhulk00@gmail.com)
3. Pay $25 one-time registration fee
4. Complete developer profile

---

## 🔐 Step 2: Generate Signed Release APK/AAB

### Create Upload Keystore (One-Time Setup)

```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP\android\app
keytool -genkeypair -v -storetype PKCS12 -keystore flyq-upload.keystore -alias flyq-upload-key -keyalg RSA -keysize 2048 -validity 10000
```

**Enter these details:**
- **Password**: `flyq2024secure` (remember this!)
- **First and last name**: `FLYQ Drone Controller`
- **Organizational unit**: `Development`
- **Organization**: `Passion3D World`
- **City**: `Mumbai`
- **State**: `Maharashtra`
- **Country code**: `IN`

**IMPORTANT:** Save this keystore file safely! You'll need it for all future updates.

### Configure Signing in build.gradle

Create `android/keystore.properties`:
```properties
storeFile=flyq-upload.keystore
storePassword=flyq2024secure
keyAlias=flyq-upload-key
keyPassword=flyq2024secure
```

Add to `android/app/build.gradle` (before `android {` block):
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android { buildTypes {` block, add:
```gradle
release {
    if (keystorePropertiesFile.exists()) {
        signingConfig signingConfigs.release
    }
    minifyEnabled true
    shrinkResources true
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
}

signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
```

### Build Signed AAB (Android App Bundle)

Google Play requires AAB format (not APK):

```cmd
cd C:\Users\PROFESSORHULK\FLYQ_APP
git pull origin main
npx expo prebuild --platform android --clean
cd android
gradlew bundleRelease
```

**Output location:**
`C:\Users\PROFESSORHULK\FLYQ_APP\android\app\build\outputs\bundle\release\app-release.aab`

File size: ~20-30 MB

---

## 📝 Step 3: Prepare Store Listing Assets

### Required Assets

#### 1. App Icon
- **Size**: 512×512 pixels
- **Format**: PNG (32-bit)
- **No transparency**
- **Location**: Use your existing app icon

#### 2. Feature Graphic
- **Size**: 1024×500 pixels
- **Format**: PNG or JPEG
- **Create**: Banner showcasing FLYQ app

#### 3. Screenshots (Minimum 2, Maximum 8)
- **Phone**: 16:9 or 9:16 aspect ratio
- **Min dimensions**: 320px
- **Max dimensions**: 3840px
- **Format**: PNG or JPEG

**Take screenshots of:**
1. Home screen with main features
2. WiFi scanning screen
3. Drone control screen
4. Camera stream screen
5. Settings screen

#### 4. Privacy Policy
**Required** because app requests Location and Bluetooth permissions.

**Quick Privacy Policy Template:**
```
FLYQ Drone Controller Privacy Policy

Last Updated: [Date]

1. Data Collection
   - Location: Used only for WiFi network scanning to connect to drones
   - Bluetooth: Used only for drone device connection
   - We do NOT collect, store, or transmit any personal data

2. Data Usage
   - All data stays on your device
   - No data is sent to external servers
   - No analytics or tracking

3. Data Sharing
   - We do not share any user data with third parties

4. Contact
   Email: info@passion3dworld.com
   Website: https://passion3dworld.com
```

**Host this on:**
- GitHub Pages (free)
- Your website
- Google Sites (free)

---

## 🚀 Step 4: Create App in Play Console

### 4.1 Create New App

1. Go to Google Play Console
2. Click **"Create app"**
3. Fill in details:
   - **App name**: FLYQ Drone Controller
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
4. Accept declarations
5. Click **"Create app"**

### 4.2 Complete Dashboard Tasks

#### Task 1: Set up your app

**App details:**
- **App name**: FLYQ Drone Controller
- **Short description** (80 chars):
  ```
  Professional drone controller app with WiFi/Bluetooth support and live camera
  ```
- **Full description** (4000 chars):
  ```
  FLYQ Drone Controller - Professional Edition
  
  Take complete control of your drone with FLYQ, the most advanced drone controller app available. Designed for pilots of all skill levels, FLYQ offers intuitive controls, real-time camera streaming, and seamless WiFi/Bluetooth connectivity.
  
  KEY FEATURES:
  
  ✈️ WiFi Network Scanning
  • Automatically detect drone WiFi networks
  • Smart drone identification with visual indicators
  • One-tap connection to your drone
  • Support for common drone protocols
  
  🎮 Intuitive Drone Control
  • Virtual joystick with precise control
  • ARM, TAKEOFF, LAND quick actions
  • Real-time flight status monitoring
  • Emergency stop functionality
  
  📷 Live Camera Stream
  • Real-time video feed from drone camera
  • High-quality streaming support
  • Capture photos and videos
  
  🔒 Smart Permissions
  • Location permission for WiFi scanning
  • Bluetooth permission for drone connectivity
  • All data stays on your device
  • No tracking or analytics
  
  🛠️ Advanced Settings
  • Customizable control sensitivity
  • Connection protocol selection
  • Network preferences
  • Debug mode for developers
  
  SUPPORTED DRONES:
  • LiteWing series
  • ESP32-based drones
  • MAVLink protocol drones
  • Custom UDP protocol drones
  
  REQUIREMENTS:
  • Android 6.0 or higher
  • WiFi capability
  • Bluetooth (optional, for enhanced connectivity)
  • Location services (for WiFi scanning)
  
  SUPPORT:
  Email: info@passion3dworld.com
  Phone: +91 9137361474
  Website: https://passion3dworld.com
  
  ABOUT PASSION3D WORLD:
  We are dedicated to creating innovative drone control solutions that make flying accessible to everyone. FLYQ represents years of development and testing to bring you the best drone control experience.
  
  Download FLYQ now and take your drone flying to the next level!
  ```

**App category**: Tools (or Games > Simulation)

**Contact details:**
- Email: info@passion3dworld.com
- Phone: +91 9137361474
- Website: https://passion3dworld.com

**Privacy policy URL**: [Your hosted privacy policy URL]

#### Task 2: Store settings

**App access:**
- [ ] All functionality is available without restrictions

**Ads:**
- [ ] No, this app does not contain ads

**Content rating:**
- Complete questionnaire (select "Everyone")

**Target audience:**
- Age group: 13+ (parental guidance)

**News app:**
- [ ] No

**COVID-19 contact tracing:**
- [ ] No

**Data safety:**
- [ ] Location collected (for WiFi scanning only)
- [ ] Not shared with third parties
- [ ] Not stored or transmitted

#### Task 3: Main store listing

**Upload assets:**
1. App icon (512×512)
2. Feature graphic (1024×500)
3. Phone screenshots (at least 2)

**Graphics:**
- Optional: Promotional graphics, TV banner, etc.

#### Task 4: Store presence

**Countries/regions:**
- Select countries where you want to distribute
- Recommended: Worldwide

**Pricing:**
- Free

---

## 📤 Step 5: Upload AAB and Release

### 5.1 Create Release

1. Go to **Production** → **Create new release**
2. **Upload AAB**:
   - Click "Upload"
   - Select `app-release.aab`
   - Wait for upload to complete
3. **Release name**: `2.1.0 (1)` (version name + version code)
4. **Release notes**:
   ```
   Initial release of FLYQ Drone Controller
   
   Features:
   • WiFi network scanning for drone connectivity
   • Intuitive virtual joystick controls
   • Real-time camera streaming
   • ARM, TAKEOFF, LAND quick actions
   • Bluetooth support for enhanced connectivity
   • Smart permission management
   • Support for multiple drone protocols
   ```

### 5.2 Review and Rollout

1. Click **"Review release"**
2. Review all warnings and errors
3. Fix any issues if needed
4. Click **"Start rollout to Production"**
5. Confirm rollout

---

## ⏱️ Review Timeline

**Google Play review typically takes:**
- First submission: 3-7 days
- Updates: 1-3 days

**After approval:**
- App appears in Play Store within a few hours
- Search indexing: 24-48 hours

---

## 🔍 Common Review Issues & Fixes

### Issue 1: Missing Privacy Policy
**Fix**: Add privacy policy URL in store listing

### Issue 2: Permissions Not Justified
**Fix**: In store listing, clearly explain why Location and Bluetooth are needed

### Issue 3: Icon Not Meeting Guidelines
**Fix**: Use 512×512 PNG with no transparency

### Issue 4: Minimum SDK Too High
**Fix**: Ensure minSdkVersion is 21 or lower in build.gradle

### Issue 5: Dangerous Permissions
**Fix**: Add permission declaration in Play Console Data Safety section

---

## 📱 After Publishing

### Monitor App Performance

1. **Play Console Dashboard**:
   - Installs
   - Ratings & reviews
   - Crashes & ANRs
   - User feedback

2. **Respond to Reviews**:
   - Reply to user feedback
   - Fix reported issues
   - Release updates

### Update Process

When releasing updates:

1. Increment version in `app.json`:
   ```json
   "version": "2.1.1",
   "android": {
     "versionCode": 2
   }
   ```

2. Build new AAB:
   ```cmd
   cd C:\Users\PROFESSORHULK\FLYQ_APP
   git pull origin main
   npx expo prebuild --platform android --clean
   cd android
   gradlew bundleRelease
   ```

3. Upload to Play Console
4. Add release notes
5. Roll out update

---

## 🎯 Quick Command Summary

```cmd
# Generate keystore (one-time)
cd C:\Users\PROFESSORHULK\FLYQ_APP\android\app
keytool -genkeypair -v -storetype PKCS12 -keystore flyq-upload.keystore -alias flyq-upload-key -keyalg RSA -keysize 2048 -validity 10000

# Build signed AAB
cd C:\Users\PROFESSORHULK\FLYQ_APP
git pull origin main
npx expo prebuild --platform android --clean
cd android
gradlew bundleRelease

# Output location
C:\Users\PROFESSORHULK\FLYQ_APP\android\app\build\outputs\bundle\release\app-release.aab
```

---

## 📞 Support

**Email**: info@passion3dworld.com  
**Phone**: +91 9137361474  
**Website**: https://passion3dworld.com

**Google Play Console**: https://play.google.com/console  
**Developer Support**: https://support.google.com/googleplay/android-developer

---

## ✅ Publishing Checklist

- [ ] Google Play Console account created ($25 paid)
- [ ] Upload keystore generated and saved safely
- [ ] Signed AAB built successfully
- [ ] App icon (512×512) prepared
- [ ] Feature graphic (1024×500) created
- [ ] Screenshots (minimum 2) captured
- [ ] Privacy policy created and hosted
- [ ] Store listing completed
- [ ] Content rating questionnaire completed
- [ ] Data safety form filled
- [ ] AAB uploaded to Production
- [ ] Release notes written
- [ ] Release reviewed and submitted

---

**Status**: Ready to publish! Follow the steps above to get FLYQ on Google Play Store. 🚀

**Estimated time to publish**: 1-2 hours (setup) + 3-7 days (review)
