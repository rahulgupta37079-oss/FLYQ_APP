# 🔧 Build Fix Guide - FLYQ Drone Controller

## Issue: React Version Dependency Conflict

### Problem
When building with EAS, you may encounter:
```
npm error ERESOLVE could not resolve
npm error While resolving: react-dom@19.2.1
npm error Found: react@19.1.0
```

### Root Cause
- `react-dom@19.2.1` requires `react@^19.2.1` as peer dependency
- Project was using `react@19.1.0`
- Version mismatch causes build failure

### ✅ Solution Applied

**Updated:** `frontend/package.json`

**Changes:**
1. Updated React version: `19.1.0` → `19.2.1`
2. Updated @types/react: `~19.1.0` → `~19.2.0`
3. Updated package version: `2.0.0` → `2.1.0`
4. Added overrides and resolutions for React version

**Result:**
```json
{
  "dependencies": {
    "react": "19.2.1",
    ...
  },
  "devDependencies": {
    "@types/react": "~19.2.0",
    ...
  },
  "overrides": {
    "react": "19.2.1"
  },
  "resolutions": {
    "react": "19.2.1"
  }
}
```

---

## How to Apply Fix Locally

### If you cloned before the fix:

1. **Pull latest changes:**
   ```bash
   cd FLYQ_APP
   git pull origin main
   ```

2. **Reinstall dependencies:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verify installation:**
   ```bash
   npm list react
   # Should show: react@19.2.1
   ```

---

## Build Commands

### EAS Build (Recommended)

**For Android APK:**
```bash
cd frontend
eas build --platform android --profile preview
```

**For iOS IPA:**
```bash
cd frontend
eas build --platform ios --profile preview
```

### Local Development
```bash
cd frontend
npm start
# Scan QR code with Expo Go
```

---

## Verification Checklist

✅ **Dependencies resolved correctly:**
```bash
cd frontend
npm install
# Should complete without ERESOLVE errors
```

✅ **React version correct:**
```bash
npm list react react-dom
# react@19.2.1
# react-dom@19.2.1 (if installed)
```

✅ **Build starts successfully:**
```bash
eas build --platform android --profile preview --no-wait
# Should start build without npm errors
```

---

## Alternative: Using --legacy-peer-deps

If you still encounter issues, you can use:

```bash
npm install --legacy-peer-deps
```

Or add to `.npmrc`:
```
legacy-peer-deps=true
```

**Note:** This is a workaround and not recommended for production.

---

## EAS Build Configuration

**File:** `frontend/eas.json`

Ensure your configuration matches:
```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## Common Build Issues & Solutions

### Issue 1: npm ci fails
**Solution:** Use `npm install` instead of `npm ci` during development, or ensure package-lock.json is up to date.

### Issue 2: Peer dependency warnings
**Solution:** This is normal with Expo. Use `--legacy-peer-deps` flag if needed.

### Issue 3: Build cache issues
**Solution:** Clear EAS build cache:
```bash
eas build --clear-cache --platform android
```

### Issue 4: Metro bundler issues
**Solution:** Clear local cache:
```bash
npx expo start --clear
```

---

## Status

✅ **Fixed and deployed** - Commit: `b266e0c`  
✅ **React version:** 19.2.1  
✅ **Package version:** 2.1.0  
✅ **All dependencies:** Resolved  

---

## Testing the Fix

### Quick Test:
```bash
# Clone fresh repo
git clone https://github.com/rahulgupta37079-oss/FLYQ_APP.git
cd FLYQ_APP/frontend

# Install dependencies
npm install

# Should complete without errors ✅
```

### Build Test:
```bash
# Start EAS build
cd frontend
eas build --platform android --profile preview

# Should start build successfully ✅
```

---

## Support

If you still encounter issues:

1. **Clear everything:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Verify Node/npm versions:**
   ```bash
   node --version  # Should be >= 18.0.0
   npm --version   # Should be >= 9.0.0
   ```

3. **Check GitHub Issues:**
   https://github.com/rahulgupta37079-oss/FLYQ_APP/issues

4. **View build logs:**
   - Go to https://expo.dev
   - View your build details
   - Check full logs for specific errors

---

## Related Files

- `frontend/package.json` - Dependency versions
- `frontend/eas.json` - EAS build configuration  
- `frontend/app.json` - Expo configuration
- `BUILD_APK_IPA_GUIDE.md` - Complete build guide

---

**Last Updated:** 2025-12-10  
**Status:** ✅ Resolved  
**Commit:** b266e0c
