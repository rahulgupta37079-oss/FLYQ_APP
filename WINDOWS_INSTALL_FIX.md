# 🪟 Windows Installation Fix Guide

## Issue: npm install fails on Windows

If you're getting `ERESOLVE could not resolve` errors on Windows when running `npm install`, use this guide.

---

## ✅ Quick Fix (Recommended)

Open PowerShell in the `frontend` directory and run:

```powershell
npm install --legacy-peer-deps
```

This will install all dependencies while ignoring peer dependency conflicts.

---

## 🔧 Complete Fix (If Quick Fix Doesn't Work)

### Step 1: Pull Latest Changes
```powershell
# Make sure you're in FLYQ_APP directory
cd C:\Users\PROFESSORHULK\FLYQ_APP

# Pull latest changes from GitHub
git pull origin main
```

### Step 2: Clean Installation
```powershell
# Navigate to frontend
cd frontend

# Remove old files (PowerShell)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Install with legacy peer deps
npm install --legacy-peer-deps
```

### Step 3: Verify Installation
```powershell
# Check React version
npm list react

# Should show: react@19.2.1
```

---

## 🚀 Start the App

```powershell
# Start Expo
npx expo start

# Or use npm script
npm start
```

Then:
1. Scan QR code with Expo Go app on your phone
2. Or press `a` for Android emulator
3. Or press `i` for iOS simulator

---

## 🐛 Alternative Solutions

### Solution 1: Force Install
```powershell
npm install --force
```

### Solution 2: Clear npm Cache
```powershell
npm cache clean --force
npm install --legacy-peer-deps
```

### Solution 3: Delete Everything and Reinstall
```powershell
# In frontend directory
Remove-Item -Recurse -Force node_modules, package-lock.json, .expo -ErrorAction SilentlyContinue
npm install --legacy-peer-deps
```

---

## 📝 Why --legacy-peer-deps?

The `--legacy-peer-deps` flag tells npm to:
- Ignore peer dependency version conflicts
- Use the legacy (npm 6) installation behavior
- Install packages even with version mismatches

This is **safe** for Expo projects because Expo manages compatibility internally.

---

## ✅ Verification Checklist

After installation, verify:

```powershell
# 1. Check React version
npm list react
# Should show: react@19.2.1

# 2. Check expo-router
npm list expo-router
# Should show: expo-router@6.0.17

# 3. Try starting the app
npx expo start
# Should start without errors
```

---

## 🎯 Expected Output

After successful installation, you should see:

```
added 795 packages, and audited 795 packages in 30s

62 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

---

## 🔍 Troubleshooting

### Error: "Cannot find module 'react'"
**Solution:**
```powershell
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
```

### Error: "Metro bundler failed to start"
**Solution:**
```powershell
npx expo start --clear
```

### Error: "Unable to resolve module"
**Solution:**
```powershell
Remove-Item -Recurse -Force .expo
npx expo start --clear
```

---

## 📱 Running on Physical Device

### Android:
1. Install **Expo Go** from Google Play Store
2. Run `npx expo start` in PowerShell
3. Scan QR code with Expo Go app

### iOS:
1. Install **Expo Go** from App Store
2. Run `npx expo start` in PowerShell
3. Scan QR code with Camera app (it will open Expo Go)

---

## 🖥️ Running on Emulator

### Android Emulator:
```powershell
# Make sure Android Studio is installed
npx expo start
# Press 'a' to open in Android emulator
```

### iOS Simulator (macOS only):
```powershell
npx expo start
# Press 'i' to open in iOS simulator
```

---

## 🔄 Complete Reinstall Script

Copy and paste this entire block into PowerShell:

```powershell
# Navigate to frontend directory
cd C:\Users\PROFESSORHULK\FLYQ_APP\frontend

# Pull latest changes
git pull origin main

# Clean everything
Remove-Item -Recurse -Force node_modules, package-lock.json, .expo -ErrorAction SilentlyContinue

# Install dependencies
npm install --legacy-peer-deps

# Clear cache and start
npx expo start --clear
```

---

## ✅ Quick Commands Reference

```powershell
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npx expo start

# Start with cleared cache
npx expo start --clear

# Check installed packages
npm list react
npm list expo

# Clean installation
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
```

---

## 📞 Still Having Issues?

### Check Node/npm Versions:
```powershell
node --version
# Should be >= 18.0.0

npm --version
# Should be >= 9.0.0
```

### Update npm if needed:
```powershell
npm install -g npm@latest
```

### Check Git:
```powershell
git --version
# Make sure Git is installed
```

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ `npm install --legacy-peer-deps` completes without errors
- ✅ `npx expo start` opens Metro bundler
- ✅ QR code appears in terminal
- ✅ App loads on your device without red error screens
- ✅ Navigation works (Home → Features → Camera, etc.)

---

## 📚 Additional Resources

- **Expo Docs:** https://docs.expo.dev/
- **GitHub Repo:** https://github.com/rahulgupta37079-oss/FLYQ_APP
- **Issue Tracker:** https://github.com/rahulgupta37079-oss/FLYQ_APP/issues

---

## 🏁 Final Notes

The `--legacy-peer-deps` flag is the **recommended approach** for this project because:
1. It's faster than waiting for package authors to update
2. Expo handles compatibility automatically
3. All packages are tested and working together
4. It's the official Expo recommendation for peer dependency warnings

**This is a safe and standard practice for Expo projects.**

---

**Last Updated:** 2025-12-10  
**Status:** Tested on Windows 10/11  
**Working Solution:** `npm install --legacy-peer-deps`
