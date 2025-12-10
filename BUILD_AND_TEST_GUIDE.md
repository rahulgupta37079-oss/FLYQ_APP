# 🚀 FLYQ Drone Controller - Build, Deploy & Test Guide

Complete guide for building production APK, deploying backend, adding features, and testing with real drone.

---

## 📱 1. Building Production APK

### Prerequisites

- Expo account (free)
- EAS CLI installed
- Terminal access

### Step-by-Step: Build Android APK

**Step 1: Install EAS CLI**

```bash
npm install -g eas-cli
```

**Step 2: Login to Expo**

```bash
cd /home/user/webapp/frontend
eas login
```

Enter your Expo credentials (or create account at expo.dev)

**Step 3: Configure Project**

```bash
# Initialize EAS if needed
eas build:configure
```

**Step 4: Build Preview APK (Recommended for Testing)**

```bash
# Build APK (takes 15-20 minutes)
eas build --platform android --profile preview

# Or build locally (faster, but requires Android SDK)
eas build --platform android --profile preview --local
```

**Step 5: Build Production AAB (For Play Store)**

```bash
# Build App Bundle for Google Play Store
eas build --platform android --profile production
```

**What Happens During Build:**

1. ✅ Code uploaded to Expo servers
2. ✅ Dependencies installed
3. ✅ Native code compiled
4. ✅ APK/AAB generated
5. ✅ Download link provided

**After Build Completes:**

```bash
# You'll receive a URL like:
# https://expo.dev/accounts/YOUR_USERNAME/projects/flyq-drone-controller/builds/BUILD_ID

# Download APK from the URL
# Transfer to Android device
# Install and test!
```

### Alternative: Build Locally (Advanced)

If you have Android Studio installed:

```bash
cd /home/user/webapp/frontend

# Build locally
eas build --platform android --profile preview --local

# APK will be in: android/app/build/outputs/apk/
```

---

## ☁️ 2. Deploying Backend to Cloud Server

### Option A: Deploy to Heroku (Easiest)

**Step 1: Install Heroku CLI**

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

**Step 2: Prepare Backend for Heroku**

```bash
cd /home/user/webapp/backend

# Create Procfile
echo "web: uvicorn server:app --host 0.0.0.0 --port \$PORT" > Procfile

# Create runtime.txt
echo "python-3.12" > runtime.txt

# Commit changes
git add .
git commit -m "Prepare for Heroku deployment"
```

**Step 3: Deploy to Heroku**

```bash
# Create Heroku app
heroku create flyq-drone-backend

# Deploy
git push heroku main

# Open app
heroku open
```

**Step 4: Configure Environment Variables**

```bash
heroku config:set CORS_ORIGINS=*
heroku config:set LOG_LEVEL=info
```

**Your backend will be at:** `https://flyq-drone-backend.herokuapp.com`

### Option B: Deploy to DigitalOcean/VPS

**Step 1: SSH into Server**

```bash
ssh root@your-server-ip
```

**Step 2: Install Dependencies**

```bash
# Update system
apt update && apt upgrade -y

# Install Python
apt install python3.12 python3-pip -y

# Install PM2 for process management
apt install nodejs npm -y
npm install -g pm2
```

**Step 3: Clone & Setup**

```bash
# Clone repository
git clone https://github.com/yourusername/flyq-drone-controller.git
cd flyq-drone-controller/backend

# Install dependencies
pip3 install -r requirements.txt

# Create .env file
nano .env
# Add: PORT=8001, CORS_ORIGINS=*

# Start with PM2
pm2 start server.py --name flyq-backend --interpreter python3

# Save PM2 configuration
pm2 save
pm2 startup
```

**Step 4: Configure Nginx (Reverse Proxy)**

```bash
# Install Nginx
apt install nginx -y

# Create config
nano /etc/nginx/sites-available/flyq-backend
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/flyq-backend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install SSL (Let's Encrypt)
apt install certbot python3-certbot-nginx -y
certbot --nginx -d api.yourdomain.com
```

**Your backend will be at:** `https://api.yourdomain.com`

### Option C: Deploy to Railway.app (Recommended)

**Step 1: Sign up at railway.app**

Visit https://railway.app and sign up (free tier available)

**Step 2: Deploy via GitHub**

1. Push code to GitHub
2. Connect GitHub to Railway
3. Select repository
4. Railway auto-detects Python and deploys
5. Get deployment URL

**Step 3: Configure Environment**

In Railway dashboard:
- Add environment variable: `PORT=8001`
- Add environment variable: `CORS_ORIGINS=*`

**Your backend will be at:** `https://your-app.railway.app`

### Update Frontend After Backend Deployment

**Edit `frontend/.env`:**

```bash
# Update with your deployed backend URL
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

**Rebuild app:**

```bash
cd /home/user/webapp/frontend
eas build --platform android --profile preview
```

---

## ✨ 3. Adding More Features

Here are the top features to add next:

### Feature 1: Settings Screen (Trim & Sensitivity)

**Create `frontend/app/settings.tsx`:**

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useDroneStore } from '../store/droneStore';

export default function SettingsScreen() {
  const store = useDroneStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trim & Sensitivity</Text>
      
      {/* Roll Trim */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>Roll Trim: {store.rollTrim}</Text>
        <Slider
          style={styles.slider}
          minimumValue={-50}
          maximumValue={50}
          value={store.rollTrim}
          onValueChange={store.setRollTrim}
        />
      </View>

      {/* Pitch Trim */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>Pitch Trim: {store.pitchTrim}</Text>
        <Slider
          style={styles.slider}
          minimumValue={-50}
          maximumValue={50}
          value={store.pitchTrim}
          onValueChange={store.setPitchTrim}
        />
      </View>

      {/* Sensitivity */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>Sensitivity: {store.joystickSensitivity}</Text>
        <Slider
          style={styles.slider}
          minimumValue={50}
          maximumValue={200}
          value={store.joystickSensitivity}
          onValueChange={store.setJoystickSensitivity}
        />
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back to Controller</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  settingRow: {
    marginBottom: 30,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  backButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

**Install slider dependency:**

```bash
cd /home/user/webapp/frontend
npm install @react-native-community/slider
```

### Feature 2: Flight Path Recording

**Add to `droneStore.ts`:**

```typescript
interface FlightPathPoint {
  timestamp: number;
  thrust: number;
  yaw: number;
  roll: number;
  pitch: number;
}

// Add to store state:
flightPath: FlightPathPoint[]
isRecording: boolean

// Add actions:
startRecording: () => set({ isRecording: true, flightPath: [] })
stopRecording: () => set({ isRecording: false })
addPathPoint: (point: FlightPathPoint) => 
  set((state) => ({
    flightPath: [...state.flightPath, point]
  }))
```

### Feature 3: Battery Alert System

**Add to `controller.tsx`:**

```typescript
useEffect(() => {
  if (store.batteryPercentage < 20) {
    Alert.alert(
      '⚠️ Low Battery Warning',
      `Battery at ${store.batteryPercentage}%. Land drone soon!`,
      [{ text: 'OK' }]
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}, [store.batteryPercentage]);
```

### Feature 4: Camera Stream (FLYQ Vision)

**For future implementation:**

1. Add video streaming library
2. Create camera view component
3. Use WebRTC or RTSP for streaming
4. Display in controller screen

**Install dependencies:**

```bash
npm install react-native-webrtc
```

### Feature 5: Gesture Controls

**Add gesture recognition:**

```bash
npm install react-native-gesture-handler
```

**Implement shake to emergency stop:**

```typescript
import { Accelerometer } from 'expo-sensors';

useEffect(() => {
  const subscription = Accelerometer.addListener(({ x, y, z }) => {
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    if (acceleration > 3) { // Shake detected
      handleEmergencyStop();
    }
  });

  return () => subscription.remove();
}, []);
```

---

## 🚁 4. Testing with Actual FLYQ Drone

### Prerequisites

- ✅ FLYQ Air or FLYQ Vision drone
- ✅ Fully charged drone battery
- ✅ Open outdoor space (recommended)
- ✅ Mobile device with app installed
- ✅ Backend server running (local or cloud)

### Pre-Flight Checklist

**1. Hardware Setup**

- [ ] Drone battery fully charged
- [ ] Propellers attached correctly
- [ ] Drone placed on flat surface
- [ ] Safe flying area confirmed
- [ ] Emergency landing spot identified

**2. Software Setup**

- [ ] Backend server running and accessible
- [ ] Mobile app installed on phone
- [ ] WiFi working on phone
- [ ] App permissions granted (WiFi, location)

**3. Safety Checks**

- [ ] Clear of people and obstacles
- [ ] Weather conditions suitable (no rain/wind)
- [ ] Emergency stop button accessible
- [ ] Know how to disarm quickly

### Step-by-Step Flight Test

**Step 1: Power On Drone**

```
1. Insert fully charged battery into drone
2. Power on drone (switch on bottom)
3. Wait for WiFi network to appear (LED indicates ready)
4. Note the network name: FLYQ_XXXXXXX or LiteWing_XXXXXXX
```

**Step 2: Connect to Drone WiFi**

```
1. Open phone WiFi settings
2. Find drone network (FLYQ_XXXXXXX)
3. Connect to drone WiFi
4. Verify connection (check WiFi icon)
```

**Step 3: Open FLYQ Controller App**

```
1. Launch app
2. Should show "Drone Network Detected!" ✓
3. Select drone model (FLYQ Air or FLYQ Vision)
4. Tap "Connect to Drone" button
```

**Step 4: Initial System Check**

```
1. Verify backend connection status
2. Check battery voltage display (should show 4.2V if full)
3. Check all telemetry shows 0% (thrust, yaw, roll, pitch)
4. Test debug mode (optional)
```

**Step 5: Calibrate Drone (Critical!)**

```
1. Place drone on perfectly flat surface
2. Tap "Calibrate" button
3. Keep drone still for 5 seconds
4. Wait for confirmation
```

**Step 6: ARM Drone (Careful!)**

```
1. Ensure area is clear
2. Tap "ARM" button
3. Confirm dialog
4. Motors will spin slowly
5. Status changes to "ARMED" (green)
```

**Step 7: First Flight Test**

**Hover Test:**
```
1. Slowly push left stick up (thrust)
2. Drone should lift off ground (aim for 50cm)
3. Hold position
4. Use trim if drone drifts
5. Gently lower left stick to land
```

**Yaw Test:**
```
1. Hover at 50cm height
2. Move left stick left/right
3. Drone should rotate
4. Return to center
```

**Roll/Pitch Test:**
```
1. Hover at 50cm height
2. Move right stick gently
3. Drone should tilt and move
4. Return to center to stabilize
5. Land safely
```

**Step 8: DISARM After Flight**

```
1. Land drone gently
2. Tap "DISARM" button
3. Motors will stop
4. Status changes to "DISARMED" (red)
```

### Troubleshooting During Flight

**Problem: Drone drifts to one side**
- **Solution**: Use trim controls in settings
- Adjust roll trim or pitch trim
- Recalibrate if needed

**Problem: Controls not responding**
- **Solution**: Check backend connection
- Verify telemetry is updating
- Check debug mode for joystick values

**Problem: Drone unstable**
- **Solution**: Land immediately
- Recalibrate on flat surface
- Check propellers are secure

**Problem: Low battery warning**
- **Solution**: Land drone NOW
- Don't risk flying with low battery
- Battery can drop suddenly

**Emergency Situations:**

**Emergency Stop:**
```
1. Press red EMERGENCY STOP button
2. Motors will stop immediately
3. Drone will fall - keep clear
```

**Lost Connection:**
```
1. Try to reestablish connection
2. If fails, use emergency stop
3. Retrieve drone safely
```

### Data Collection During Testing

**Record the following:**

```
✓ Battery voltage before/after
✓ Flight time achieved
✓ Control responsiveness (1-10 rating)
✓ Any drift or instability
✓ Trim adjustments needed
✓ Latency observed (if any)
✓ Any errors or issues
```

### Post-Flight Analysis

```bash
# Check backend logs
tail -f /home/user/webapp/backend/server.log

# Look for:
# - Packet send success/failures
# - Connection stability
# - Any errors or warnings
```

### Safety Tips

**DO:**
- ✅ Test in open outdoor space first
- ✅ Start with small movements
- ✅ Keep drone close (5-10 meters)
- ✅ Practice emergency stop
- ✅ Fly in good lighting
- ✅ Monitor battery constantly

**DON'T:**
- ❌ Fly near people or animals
- ❌ Fly indoors initially
- ❌ Test in windy conditions
- ❌ Ignore low battery warnings
- ❌ Fly over water or hard surfaces
- ❌ Test new features while flying high

---

## 📊 Testing Checklist

### Backend Testing

```bash
# Test backend health
curl http://localhost:8001/api/

# Test connection endpoint
curl -X POST http://localhost:8001/api/drone/connect \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.4.1", "port": 2390}'

# Test status endpoint
curl http://localhost:8001/api/drone/status
```

### Frontend Testing

- [ ] App launches successfully
- [ ] Connection screen shows correct WiFi status
- [ ] Can detect drone network
- [ ] Connection to backend works
- [ ] Controller screen loads
- [ ] Joysticks respond to touch
- [ ] Haptic feedback works
- [ ] ARM/DISARM buttons work
- [ ] Emergency stop works
- [ ] Telemetry updates in real-time
- [ ] Debug mode toggles correctly
- [ ] Screen rotation to landscape works
- [ ] Battery indicator displays

### Integration Testing

- [ ] App connects to backend successfully
- [ ] Backend connects to drone
- [ ] Control packets sent successfully
- [ ] ARM/DISARM commands work
- [ ] Emergency stop cuts motors
- [ ] Telemetry displays correctly
- [ ] No lag in controls
- [ ] Battery monitoring accurate

---

## 🎉 Success Criteria

**Backend Deployment:**
- ✅ Backend accessible via HTTPS
- ✅ Health check returns 200 OK
- ✅ CORS configured correctly
- ✅ Logs show successful requests

**APK Build:**
- ✅ APK builds successfully
- ✅ App installs on Android device
- ✅ App launches without crashes
- ✅ All features work on device

**Feature Addition:**
- ✅ New feature integrated smoothly
- ✅ No breaking changes
- ✅ UI/UX consistent
- ✅ Performance maintained

**Drone Testing:**
- ✅ Drone responds to controls
- ✅ All control axes work correctly
- ✅ ARM/DISARM functions properly
- ✅ Emergency stop effective
- ✅ Flight stable and controllable
- ✅ No unexpected behavior

---

## 📞 Support

**Need Help?**

- Check logs: `tail -f backend/server.log`
- Test backend: `curl http://localhost:8001/api/`
- Debug app: Enable debug mode in controller
- Check connectivity: Verify WiFi connection

**Common Issues:**

1. **APK won't install**: Enable "Install from Unknown Sources"
2. **Backend unreachable**: Check firewall, use correct IP
3. **Drone won't connect**: Verify WiFi connection, check IP address
4. **Controls laggy**: Check network latency, reduce control loop frequency

---

**Ready to fly! 🚀🚁**

*FLYQ Drone Controller - Professional Edition*
