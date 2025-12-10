#!/bin/bash

# FLYQ Drone Controller - Startup Script

echo "🚁 Starting FLYQ Drone Controller..."
echo ""

# Start backend in background
echo "📡 Starting backend server..."
cd backend
python3 server.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
cd ..

# Wait for backend to be ready
sleep 3

# Start frontend
echo ""
echo "📱 Starting frontend development server..."
cd frontend
npx expo start --tunnel
