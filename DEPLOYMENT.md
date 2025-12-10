# 🚀 FLYQ Drone Controller - Deployment Guide

Complete guide for deploying the FLYQ Drone Controller application.

---

## 📋 Table of Contents

1. [Development Deployment](#development-deployment)
2. [Production Deployment](#production-deployment)
3. [Mobile App Build](#mobile-app-build)
4. [Backend Deployment](#backend-deployment)
5. [Troubleshooting](#troubleshooting)

---

## 🛠️ Development Deployment

### Local Development Setup

**1. Start Backend Server**

```bash
cd backend
python3 server.py
```

The backend will run on `http://localhost:8001`

**2. Start Frontend Development Server**

```bash
cd frontend
npx expo start --lan
```

**3. Test on Mobile Device**

- Install **Expo Go** app on your iOS/Android device
- Scan the QR code displayed in terminal
- App will load instantly

### Using the Development Environment

1. **Backend**: http://localhost:8001/api/
2. **Frontend**: Accessible via Expo Go QR code
3. **Hot Reload**: Both frontend and backend support hot reloading

---

## 🏭 Production Deployment

### Backend Deployment Options

#### Option 1: VPS/Cloud Server (Recommended)

**Deploy to DigitalOcean, AWS EC2, Google Cloud, etc.**

```bash
# 1. SSH into your server
ssh user@your-server.com

# 2. Clone repository
git clone https://github.com/yourusername/flyq-drone-controller.git
cd flyq-drone-controller/backend

# 3. Install dependencies
pip3 install -r requirements.txt

# 4. Set environment variables
nano .env
# Set: PORT=8001, CORS_ORIGINS=your-frontend-domain

# 5. Start with process manager
pm2 start server.py --name flyq-backend --interpreter python3

# 6. Save PM2 process list
pm2 save
pm2 startup
```

#### Option 2: Docker Deployment

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["python3", "server.py"]
```

Deploy:

```bash
# Build image
docker build -t flyq-backend .

# Run container
docker run -d -p 8001:8001 --name flyq-backend flyq-backend
```

#### Option 3: Heroku Deployment

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create flyq-backend

# Add Procfile
echo "web: python3 server.py" > backend/Procfile

# Deploy
git subtree push --prefix backend heroku main
```

### Frontend Configuration for Production

Update `frontend/.env`:

```bash
# Use your deployed backend URL
EXPO_PUBLIC_BACKEND_URL=https://your-backend.herokuapp.com

# Or your VPS URL
EXPO_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

---

## 📱 Mobile App Build

### EAS Build Setup

**1. Install EAS CLI**

```bash
npm install -g eas-cli
```

**2. Login to Expo**

```bash
eas login
```

**3. Configure EAS Build**

Create `frontend/eas.json`:

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

**4. Build Android APK (Preview)**

```bash
cd frontend
eas build --platform android --profile preview
```

Wait 10-20 minutes for build to complete. You'll receive a download link.

**5. Build iOS IPA (Preview)**

```bash
cd frontend
eas build --platform ios --profile preview
```

Requires Apple Developer account ($99/year).

**6. Build Production Apps**

```bash
# Android AAB (for Play Store)
eas build --platform android --profile production

# iOS IPA (for App Store)
eas build --platform ios --profile production
```

### Distribute to Users

**Internal Testing (No Store)**

1. Build with `--profile preview`
2. Download APK/IPA from build URL
3. Share link with testers
4. **Android**: Install APK directly
5. **iOS**: Use TestFlight or ad-hoc provisioning

**App Store Distribution**

**Google Play Store:**

```bash
# Build AAB
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

**Apple App Store:**

```bash
# Build IPA
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

---

## 🌐 Backend Deployment

### Production Backend Requirements

1. **HTTPS Required** - Mobile apps need secure connections
2. **CORS Configuration** - Allow your frontend domain
3. **Port Configuration** - Default 8001 or custom
4. **Process Management** - Use PM2 or systemd
5. **Firewall Rules** - Open port 8001 (or your custom port)

### Nginx Reverse Proxy (Recommended)

**Install Nginx:**

```bash
sudo apt update
sudo apt install nginx
```

**Configure Nginx:**

```nginx
# /etc/nginx/sites-available/flyq-backend

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

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/flyq-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Add SSL (Let's Encrypt):**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use**

```bash
# Find process using port 8001
lsof -i :8001

# Kill process
kill -9 <PID>
```

**CORS Errors**

Update `backend/.env`:

```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Connection Refused**

1. Check backend is running: `curl http://localhost:8001/api/`
2. Check firewall rules
3. Verify port is open: `netstat -tuln | grep 8001`

### Frontend Issues

**Build Failures**

```bash
# Clear cache
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
npx expo start --clear
```

**Backend Connection Fails**

1. Check `EXPO_PUBLIC_BACKEND_URL` in `.env`
2. Ensure backend is accessible from mobile network
3. Test backend health: `curl https://your-backend.com/api/`

### Mobile App Issues

**APK Won't Install (Android)**

1. Enable "Install Unknown Apps" in Android settings
2. Check APK is not corrupted
3. Ensure sufficient storage space

**IPA Won't Install (iOS)**

1. Use TestFlight for testing
2. Check provisioning profiles
3. Verify signing certificates

---

## 📊 Performance Optimization

### Backend Optimization

**1. Use Gunicorn (Production)**

```bash
pip install gunicorn

gunicorn server:app \
  --bind 0.0.0.0:8001 \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker
```

**2. Enable Compression**

```python
# server.py
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

**3. Add Caching**

```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
```

### Frontend Optimization

**1. Bundle Optimization**

Already configured in `app.json`:

- Uses Hermes engine
- Enables new architecture
- Optimized bundling

**2. Image Optimization**

```bash
# Install image optimization tools
npm install --save-dev sharp

# Optimize assets
npx expo-optimize
```

---

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Use HTTPS for backend
- [ ] Set proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Add authentication if needed
- [ ] Keep dependencies updated
- [ ] Use secure WebSocket if adding streaming
- [ ] Validate all input data
- [ ] Add request size limits
- [ ] Monitor for suspicious activity

### Example Rate Limiting

```python
# server.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/drone/send")
@limiter.limit("50/minute")
async def send_data(request: Request, data: SendDataRequest):
    # ... existing code
```

---

## 📈 Monitoring

### Backend Monitoring

**1. Add Health Check Endpoint** (Already implemented)

```bash
curl https://your-backend.com/api/
```

**2. Setup Uptime Monitoring**

- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com
- StatusCake: https://www.statuscake.com

**3. Log Management**

```bash
# View logs with PM2
pm2 logs flyq-backend

# Save logs to file
pm2 logs flyq-backend > logs.txt
```

### Mobile App Analytics

**Add Analytics (Optional)**

```bash
cd frontend
npx expo install expo-analytics
```

---

## 🎯 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Backend accessible via HTTPS
- [ ] CORS properly configured
- [ ] App icons and splash screens ready
- [ ] App store assets prepared (screenshots, description)

### Backend Deployment

- [ ] Backend code pushed to server
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Process manager configured (PM2/systemd)
- [ ] Nginx configured (if using)
- [ ] SSL certificate installed
- [ ] Firewall rules set
- [ ] Health check passing

### Mobile App Deployment

- [ ] Backend URL updated in `.env`
- [ ] EAS build configuration ready
- [ ] APK/IPA built successfully
- [ ] Tested on physical devices
- [ ] Store listings created (if publishing)
- [ ] Privacy policy and terms ready (if required)

---

## 🆘 Support

**Issues?** Check:

1. [README.md](README.md) - General documentation
2. [PROJECT_SUMMARY.md](Documentation/PROJECT_SUMMARY.md) - Complete project details
3. [GitHub Issues](https://github.com/yourusername/flyq-drone-controller/issues)

**Backend Health:** https://your-backend.com/api/

**Status Endpoint:** https://your-backend.com/api/drone/status

---

**Happy Flying! 🚁**

*FLYQ Drone Controller - Professional Edition*
