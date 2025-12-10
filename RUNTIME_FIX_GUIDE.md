# 🔧 Runtime Fix Guide - Navigation Error

## Issue: Navigation Before Layout Mount

### Problem
When running the app, you may encounter:
```
ERROR [Error: Attempted to navigate before mounting the Root Layout component. 
Ensure the Root Layout component is rendering a Slot, or other navigator on the first render.]
```

### Root Cause
The error occurs when:
1. Routes are accessed that aren't registered in `_layout.tsx`
2. Router attempts to navigate before the layout component fully mounts
3. Missing `Stack.Screen` declarations for new feature screens

---

## ✅ Solution Applied

**File:** `frontend/app/_layout.tsx`

**Changes Made:**
Added missing route declarations for all v2.1 feature screens:

```tsx
// BEFORE (Missing routes):
<Stack>
  <Stack.Screen name="index" />
  <Stack.Screen name="connect" />
  <Stack.Screen name="controller" />
</Stack>

// AFTER (All routes registered):
<Stack>
  <Stack.Screen name="index" />
  <Stack.Screen name="connect" />
  <Stack.Screen name="controller" />
  <Stack.Screen name="features" />       ⭐ NEW
  <Stack.Screen name="camera" />         ⭐ NEW
  <Stack.Screen name="recording" />      ⭐ NEW
  <Stack.Screen name="multi-drone" />    ⭐ NEW
  <Stack.Screen name="gestures" />       ⭐ NEW
</Stack>
```

**Also Updated:**
- `index.tsx`: Version updated from `v2.0.0` → `v2.1.0`

---

## How to Apply Fix

### Option 1: Pull Latest Changes (Recommended)
```bash
cd FLYQ_APP
git pull origin main
cd frontend
rm -rf node_modules
npm install
npx expo start
```

### Option 2: Manual Fix
If you can't pull, manually edit `frontend/app/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="connect" />
        <Stack.Screen name="controller" />
        <Stack.Screen name="features" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="recording" />
        <Stack.Screen name="multi-drone" />
        <Stack.Screen name="gestures" />
      </Stack>
    </>
  );
}
```

---

## Verification

### Test Navigation:
1. **Start App:**
   ```bash
   npx expo start
   # Scan QR code
   ```

2. **Test Each Route:**
   - ✅ Home screen loads
   - ✅ Tap "Start Flight" → Connect screen
   - ✅ Tap "Advanced Features" → Features screen
   - ✅ Tap any feature → Opens feature screen
   - ✅ Back button returns correctly

3. **No Errors:**
   - ✅ No red error screens
   - ✅ No "navigation before mount" errors
   - ✅ Smooth transitions

---

## Common Issues & Solutions

### Issue 1: Still getting navigation error
**Solution:** Clear Metro bundler cache:
```bash
npx expo start --clear
```

### Issue 2: Routes not found
**Solution:** Ensure all screen files exist:
```bash
ls frontend/app/*.tsx
# Should show:
# _layout.tsx
# index.tsx
# connect.tsx
# controller.tsx
# features.tsx
# camera.tsx
# recording.tsx
# multi-drone.tsx
# gestures.tsx
```

### Issue 3: App crashes on feature tap
**Solution:** Check that imports are correct in each screen:
```typescript
import { router } from 'expo-router'; // ✅ Correct
import { useDroneStore } from '../store/droneStore'; // ✅ Correct
```

### Issue 4: Metro bundler errors
**Solution:** Restart with clean cache:
```bash
cd frontend
rm -rf .expo node_modules
npm install
npx expo start --clear
```

---

## Understanding Expo Router

### Route Registration
Expo Router uses file-based routing, but routes must be explicitly registered in `_layout.tsx`:

```
frontend/app/
├── _layout.tsx          ← Registers all routes
├── index.tsx            ← Route: "/"
├── connect.tsx          ← Route: "/connect"
├── controller.tsx       ← Route: "/controller"
├── features.tsx         ← Route: "/features"
├── camera.tsx           ← Route: "/camera"
├── recording.tsx        ← Route: "/recording"
├── multi-drone.tsx      ← Route: "/multi-drone"
└── gestures.tsx         ← Route: "/gestures"
```

### Navigation Methods
```typescript
import { router } from 'expo-router';

// Push new screen
router.push('/features');

// Replace current screen
router.replace('/connect');

// Go back
router.back();
```

---

## Status

✅ **Fixed and deployed** - Commit: `73bb6fc`  
✅ **All routes registered** in `_layout.tsx`  
✅ **Version updated** to 2.1.0  
✅ **Navigation working** correctly  

---

## Testing Checklist

After applying fix, verify:

- [ ] App starts without errors
- [ ] Home screen displays correctly
- [ ] "Start Flight" button works
- [ ] "Advanced Features" button works
- [ ] All feature screens accessible:
  - [ ] Camera Streaming
  - [ ] Flight Path Recording
  - [ ] Multiple Drone Management
  - [ ] Gesture Controls
- [ ] Back navigation works from all screens
- [ ] No red error screens
- [ ] Smooth animations between screens

---

## Related Files

- `frontend/app/_layout.tsx` - Route registration
- `frontend/app/index.tsx` - Home screen
- `frontend/app/features.tsx` - Features menu
- All feature screens (camera, recording, multi-drone, gestures)

---

## Prevention

### When Adding New Screens:

1. **Create the screen file:**
   ```bash
   touch frontend/app/newscreen.tsx
   ```

2. **Register in _layout.tsx:**
   ```tsx
   <Stack.Screen name="newscreen" />
   ```

3. **Test navigation:**
   ```typescript
   router.push('/newscreen');
   ```

### Best Practices:
- Always register routes in `_layout.tsx`
- Test navigation after adding new screens
- Use TypeScript for route type safety
- Clear cache when adding new routes

---

## Quick Reference

### Start Development:
```bash
cd FLYQ_APP/frontend
npx expo start --clear
```

### Clear All Caches:
```bash
rm -rf .expo node_modules
npm install
npx expo start --clear
```

### Check Routes:
```bash
# List all screen files
ls app/*.tsx

# Check _layout.tsx
cat app/_layout.tsx | grep "Stack.Screen"
```

---

## Support

If issues persist:

1. **Clear everything:**
   ```bash
   cd frontend
   rm -rf .expo node_modules
   npm install
   npx expo start --clear
   ```

2. **Check Metro bundler logs:**
   - Look for import errors
   - Check for missing dependencies
   - Verify file paths

3. **GitHub Issues:**
   https://github.com/rahulgupta37079-oss/FLYQ_APP/issues

4. **Expo Docs:**
   https://docs.expo.dev/router/introduction/

---

**Last Updated:** 2025-12-10  
**Status:** ✅ Resolved  
**Commit:** 73bb6fc  
**Fix:** All routes registered in _layout.tsx
