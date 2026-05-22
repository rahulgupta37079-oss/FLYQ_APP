# How to Build APK for FLYQ Drone Controller

## Option 1: Build APK using EAS (Recommended)

### Step 1: Login to Expo
```bash
cd /home/user/webapp
npx eas-cli login
```
Enter your Expo account credentials.

### Step 2: Build APK
```bash
npx eas-cli build --platform android --profile preview
```

The preview profile is configured to build APK format (not AAB).

### Step 3: Download APK
After build completes, EAS will provide a download link. The APK will be signed with your keystore and ready to install.

---

## Option 2: Convert AAB to APK (Quick Alternative)

If you need APK immediately from the existing AAB file:

### Download bundletool:
```bash
wget https://github.com/google/bundletool/releases/download/1.15.6/bundletool-all-1.15.6.jar
```

### Convert AAB to APK:
```bash
java -jar bundletool-all-1.15.6.jar build-apks \
  --bundle=flyq-drone-controller.aab \
  --output=flyq-drone-controller.apks \
  --mode=universal \
  --ks=android/app/flyq-upload.keystore \
  --ks-pass=pass:YOUR_KEYSTORE_PASSWORD \
  --ks-key-alias=flyq-upload-key \
  --key-pass=pass:YOUR_KEY_PASSWORD
```

### Extract Universal APK:
```bash
unzip -p flyq-drone-controller.apks universal.apk > FLYQ-v2.1.0.apk
```

---

## Option 3: Use Expo's Website

1. Go to: https://expo.dev/accounts/YOUR_USERNAME/projects/flyq-drone-controller/builds
2. Click "Build" button
3. Select "Android"
4. Choose "APK" build type
5. Wait for build to complete
6. Download the APK

---

## APK vs AAB

- **AAB (Android App Bundle)**: Required for Google Play Store upload
- **APK (Android Package)**: For direct installation on devices, testing, or distribution outside Play Store

You already have the AAB file ready for Play Store. The APK is optional and mainly for:
- Testing on devices before Play Store submission
- Direct distribution (sideloading)
- Sharing with beta testers

