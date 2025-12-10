# 🚁 FLYQ Drone Controller - Quick Start

## 🎯 What You Have

A complete, production-ready **React Native mobile drone controller app**:

✅ **Frontend**: React Native + Expo + TypeScript
✅ **Backend**: FastAPI + Python (UDP proxy for iOS)
✅ **Protocol**: CRTP (Crazyflie) over UDP
✅ **Features**: Dual joysticks, ARM/DISARM, telemetry, WiFi detection
✅ **Documentation**: Comprehensive README and deployment guides

---

## ⚡ Quick Start (3 Steps)

### 1. Start Backend (Terminal 1)
```bash
cd backend
python3 server.py
# ✅ Backend running on http://localhost:8001
```

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npx expo start --lan
# ✅ QR code will appear
```

### 3. Test on Mobile
- Install **Expo Go** on your phone
- Scan QR code
- App loads instantly!

---

## 📂 Project Structure

```
webapp/
├── frontend/          # React Native Expo app
│   ├── app/          # Screens (connect, controller)
│   ├── components/   # Joystick component
│   ├── store/        # Zustand state management
│   └── utils/        # CRTP protocol, UDP client
│
├── backend/          # FastAPI server
│   └── server.py    # UDP proxy for iOS
│
├── Documentation/
│   └── PROJECT_SUMMARY.md    # Full specs
│
├── README.md          # Main documentation
├── DEPLOYMENT.md      # Deploy to production
└── start.sh          # One-command startup
```

---

## 🎮 Using the App

### Connect
1. Power on FLYQ drone
2. Connect phone to drone WiFi (FLYQ_XXXXX)
3. Open app → Select model → Connect

### Fly
1. Tap ARM button (confirm dialog)
2. **Left stick**: Thrust (↕) + Yaw (↔)
3. **Right stick**: Pitch (↕) + Roll (↔)
4. Tap DISARM when done

### Emergency
- **Red button**: Instant motor cutoff

---

## 🚀 Current Status

✅ **Backend**: Running on http://localhost:8001
✅ **Frontend**: Running on http://localhost:3000
✅ **Git**: Initialized with 2 commits
✅ **Documentation**: Complete

**Test Backend:**
```bash
curl http://localhost:8001/api/
```

**Test Frontend:**
- Open Expo Go and scan QR code
- Or visit http://localhost:3000 in browser

---

## 📱 Build Mobile App

### Android APK (Easy)
```bash
cd frontend
npm install -g eas-cli
eas login
eas build --platform android --profile preview
# Wait 15 minutes → Download APK
```

### iOS IPA (Requires Apple Developer)
```bash
eas build --platform ios --profile preview
```

---

## 🔧 Configuration

### Backend: `backend/.env`
```bash
PORT=8001
CORS_ORIGINS=*
```

### Frontend: `frontend/.env`
```bash
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

**For production:**
```bash
EXPO_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

---

## 📚 Documentation

- **README.md** - Full documentation
- **DEPLOYMENT.md** - Production deployment guide
- **Documentation/PROJECT_SUMMARY.md** - Complete feature list

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port is in use
lsof -i :8001
# Kill process
kill -9 <PID>
```

### Frontend won't connect
1. Check backend is running: `curl http://localhost:8001/api/`
2. Update `.env` with correct backend URL
3. Restart Expo: `npx expo start --clear`

### Can't build APK
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Build
eas build --platform android --profile preview
```

---

## 🎯 Next Steps

1. **Test locally** with Expo Go
2. **Build APK/IPA** with EAS Build
3. **Deploy backend** to VPS/Heroku
4. **Publish to stores** (optional)

---

## 📞 Support

- **Backend Health**: http://localhost:8001/api/
- **Backend Status**: http://localhost:8001/api/drone/status
- **Frontend**: Expo Dev Tools

---

**Happy Flying! 🚁**

*Built with React Native + Expo + FastAPI*
*FLYQ Drone Controller v2.0 - Professional Edition*
