# 🚁 FLYQ Drone Controller

**Professional cross-platform mobile drone controller for FLYQ Air and FLYQ Vision ESP32-S3 drones**

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/flyq/drone-controller)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-green.svg)](https://expo.dev)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)](https://github.com/flyq/drone-controller)

---

## 📱 About

FLYQ Drone Controller is a feature-rich mobile application that replicates and enhances the LiteWing drone controller, specifically designed for FLYQ brand drones. It provides professional-grade flight controls with advanced features for both beginner and experienced pilots.

**⭐ NEW in v2.1:** Camera streaming, flight path recording, multi-drone management, and gesture controls!

### ✨ Core Features (v2.0)

- **🎮 Dual Virtual Joysticks** - Smooth touch controls with haptic feedback
- **📊 Real-Time Telemetry** - Live thrust, yaw, roll, pitch display at 50Hz
- **🔐 ARM/DISARM System** - Safety-first motor control with confirmations
- **📶 Smart WiFi Detection** - Auto-detect drone networks
- **🔋 Battery Monitoring** - Real-time voltage and percentage
- **🎯 Height Hold Mode** - Automatic altitude maintenance (20-150cm)
- **⚙️ Trim Controls** - Drift correction adjustments
- **🐛 Debug Mode** - View raw joystick values and angles
- **🔄 Screen Rotation** - Auto-landscape for optimal control
- **🛡️ Emergency Stop** - Instant motor cutoff

### 🚀 Advanced Features (v2.1) - **NOW AVAILABLE!**

- **🎥 Camera Streaming** - Live HD video feed from FLYQ Vision (720p@30fps)
- **🗺️ Flight Path Recording** - Record and replay flights with GPS tracking
- **🚁 Multiple Drone Management** - Control up to 4 drones with swarm mode
- **✋ Gesture Controls** - Control drone with phone movements and gestures

---

## 🏗️ Tech Stack

### Frontend
- **React Native 0.81.5** - Cross-platform mobile framework
- **Expo 54.0** - Development and build platform
- **Expo Router 6.0** - File-based navigation
- **Zustand 5.0** - State management
- **TypeScript** - Type safety

### Backend
- **FastAPI 0.115** - High-performance Python API
- **Uvicorn** - ASGI server
- **UDP Socket** - Direct drone communication

### Protocol
- **CRTP (Crazy Real Time Protocol)** - Industry-standard drone control
- **UDP Port 2390** - Low-latency communication
- **50Hz Control Loop** - Professional responsiveness

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **Python 3.12+** and **pip**
- **Expo CLI** (optional but recommended)
- **iOS device** with Expo Go app OR **Android device**
- **FLYQ Drone** powered on and broadcasting WiFi

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/flyq-drone-controller.git
cd flyq-drone-controller
```

2. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running Locally

**Terminal 1 - Start Backend Server**
```bash
cd backend
python3 server.py
# Server will run on http://localhost:8001
```

**Terminal 2 - Start Expo Development Server**
```bash
cd frontend
npx expo start --tunnel
```

**On Your Mobile Device**
1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Scan the QR code displayed in terminal
3. App will load on your device

---

## 📖 Usage Guide

### 1. Connect to Drone

1. **Power on your FLYQ drone** - Wait for WiFi network to appear
2. **Connect to drone WiFi** - Go to device WiFi settings
   - Network name: `FLYQ_XXXXXXX` or `LiteWing_XXXXXXX`
3. **Open FLYQ Controller app**
4. **Select drone model** - Choose FLYQ Air or FLYQ Vision
5. **Tap "Connect to Drone"** - Wait for connection confirmation

### 2. Flight Controls

**Left Joystick (THRUST/YAW)**
- **↕️ Vertical** - Thrust (altitude control)
- **↔️ Horizontal** - Yaw (rotation)
- **Not auto-centering** - Stays where you leave it

**Right Joystick (ROLL/PITCH)**
- **↕️ Vertical** - Pitch (forward/backward tilt)
- **↔️ Horizontal** - Roll (left/right tilt)
- **Auto-centering** - Returns to center when released

### 3. ARM/DISARM

**Before Flying:**
1. Place drone on flat surface
2. Tap **ARM** button
3. Confirm safety dialog
4. Motors will spin (status shows "ARMED")

**After Flying:**
1. Land the drone gently
2. Tap **DISARM** button
3. Motors will stop

### 4. Emergency Stop

**🔴 In Case of Emergency:**
- Tap **EMERGENCY STOP** button
- Drone will immediately disarm
- All motors stop instantly

---

## ⚙️ Configuration

### Backend Configuration

Edit `backend/.env`:
```bash
PORT=8001
LOG_LEVEL=info
CORS_ORIGINS=*
```

### Frontend Configuration

Edit `frontend/.env`:
```bash
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

**For tunnel/preview mode:**
```bash
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
EXPO_USE_FAST_RESOLVER=1
```

---

## 🏛️ Project Structure

```
flyq-drone-controller/
├── frontend/                 # React Native Expo App
│   ├── app/                 # Screens (Expo Router)
│   │   ├── index.tsx       # Entry point
│   │   ├── connect.tsx     # Connection screen
│   │   └── controller.tsx  # Flight controller
│   ├── components/         # Reusable components
│   │   └── Joystick.tsx    # Virtual joystick
│   ├── store/              # State management
│   │   └── droneStore.ts   # Zustand store
│   ├── utils/              # Utilities
│   │   ├── CRTPProtocol.ts # CRTP implementation
│   │   └── UDPClient.ts    # Backend proxy client
│   └── package.json
│
├── backend/                 # FastAPI Server
│   ├── server.py           # Main API server
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment config
│
├── Documentation/
│   └── PROJECT_SUMMARY.md  # Comprehensive documentation
│
└── README.md               # This file
```

---

## 🔧 Development

### Backend Development

```bash
cd backend
python3 server.py
# Auto-reloads on file changes
```

### Frontend Development

```bash
cd frontend
npx expo start
# Choose platform:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code for physical device
```

### Debug Mode

In the controller screen:
1. Tap **"Show Debug"** button
2. View raw joystick values
3. See calculated angles and percentages
4. Monitor sensitivity and trim settings

---

## 📡 API Endpoints

### Drone Control

**Connect to Drone**
```http
POST /api/drone/connect
Content-Type: application/json

{
  "ip": "192.168.4.1",
  "port": 2390
}
```

**Send Control Packet**
```http
POST /api/drone/send
Content-Type: application/json

{
  "data": "<base64_encoded_crtp_packet>"
}
```

**Disconnect**
```http
POST /api/drone/disconnect
```

**Get Status**
```http
GET /api/drone/status
```

---

## 🎯 CRTP Protocol Details

### Commander Packet (15 bytes)

| Byte | Field | Type | Description |
|------|-------|------|-------------|
| 0 | Header | uint8 | Port 0x03, Channel 0 |
| 1-4 | Roll | float32 | -30 to +30 degrees |
| 5-8 | Pitch | float32 | -30 to +30 degrees |
| 9-12 | Yaw | float32 | -200 to +200 °/s |
| 13-14 | Thrust | uint16 | 0-65535 |

### Platform Commands

**ARM/DISARM** - Port 0x0D, Channel 0
- `[0x0D, 0x01]` - ARM
- `[0x0D, 0x00]` - DISARM

**Calibrate** - Port 0x0D, Channel 1
- `[0x0D, 0x01]` - Start calibration

---

## 🔐 Safety Features

- ✅ **Confirmation dialogs** for arming
- ✅ **ARMED/DISARMED status** always visible
- ✅ **Zero packet** sent when disarmed
- ✅ **Emergency stop** button
- ✅ **Battery monitoring** with alerts
- ✅ **Calibration** only when disarmed
- ✅ **Control loop** at 50Hz for stability

---

## 📱 Supported Devices

### iOS
- iOS 13.0+
- iPhone, iPad, iPod Touch
- Requires backend proxy (uses fetch API)

### Android
- Android 8.0+ (API 26+)
- Phones and tablets
- Direct UDP support (best performance)

---

## 🐛 Troubleshooting

### Can't Connect to Drone

1. **Check WiFi connection** - Must be connected to drone network
2. **Verify backend is running** - Check `http://localhost:8001`
3. **Check drone power** - Ensure drone is on and WiFi is broadcasting
4. **Try different IP** - Some drones use 192.168.4.2

### Joysticks Not Responding

1. **Check ARM status** - Must ARM before flying
2. **Check debug mode** - Verify joystick values are updating
3. **Restart app** - Close and reopen the application

### Backend Not Starting

1. **Check port** - Ensure port 8001 is not in use
2. **Install dependencies** - Run `pip install -r requirements.txt`
3. **Check Python version** - Requires Python 3.12+

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LiteWing** - Original drone controller inspiration
- **FLYQ** - Drone hardware manufacturer ([flyqdrone.in](https://flyqdrone.in))
- **Crazyflie** - CRTP protocol specification
- **Expo Team** - Amazing React Native framework
- **FastAPI** - High-performance Python backend

---

## 📞 Support

- **Documentation**: See `/Documentation/PROJECT_SUMMARY.md`
- **Issues**: [GitHub Issues](https://github.com/yourusername/flyq-drone-controller/issues)
- **FLYQ Website**: [flyqdrone.in](https://flyqdrone.in)

---

## 🗺️ Roadmap

### v2.1 (Coming Soon)
- [ ] Camera streaming for FLYQ Vision
- [ ] Flight path recording
- [ ] Multiple drone management
- [ ] Gesture controls

### v3.0 (Future)
- [ ] FPV mode
- [ ] Advanced telemetry graphs
- [ ] Automated flight patterns
- [ ] Voice commands

---

**Built with ❤️ for safe and professional drone flying**

*FLYQ Drone Controller v2.0 - Professional Edition*
