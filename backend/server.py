#!/usr/bin/env python3
"""
FLYQ Drone Controller - FastAPI Backend
Provides UDP proxy for iOS devices to communicate with ESP32 drones via CRTP protocol
"""

import os
import socket
import base64
import logging
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global UDP socket
udp_socket: Optional[socket.socket] = None
drone_address: Optional[tuple] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    logger.info("Starting FLYQ Drone Controller Backend")
    yield
    # Cleanup
    if udp_socket:
        udp_socket.close()
    logger.info("Shutting down FLYQ Drone Controller Backend")


# Initialize FastAPI app
app = FastAPI(
    title="FLYQ Drone Controller API",
    description="UDP proxy for iOS/Android drone control",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class ConnectRequest(BaseModel):
    ip: str = "192.168.4.1"
    port: int = 2390


class SendDataRequest(BaseModel):
    data: str  # Base64 encoded CRTP packet


class StatusUpdate(BaseModel):
    client_name: str = "FLYQ_Controller"


# v2.1 Feature Models
class FlightPathPoint(BaseModel):
    timestamp: int
    latitude: float
    longitude: float
    altitude: float
    roll: float
    pitch: float
    yaw: float
    thrust: float
    batteryVoltage: float


class SaveFlightPathRequest(BaseModel):
    name: str
    points: list[FlightPathPoint]


class CameraStreamRequest(BaseModel):
    drone_ip: str
    quality: str = "720p"
    fps: int = 30


# API endpoints
@app.get("/")
@app.get("/api/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "FLYQ Drone Controller API",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/drone/connect")
async def connect_drone(request: ConnectRequest):
    """
    Connect to drone via UDP
    Creates a UDP socket and stores the drone address
    """
    global udp_socket, drone_address
    
    try:
        # Close existing socket if any
        if udp_socket:
            udp_socket.close()
        
        # Create new UDP socket
        udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        udp_socket.settimeout(2.0)  # 2 second timeout
        
        # Store drone address
        drone_address = (request.ip, request.port)
        
        logger.info(f"Connected to drone at {request.ip}:{request.port}")
        
        return {
            "status": "connected",
            "ip": request.ip,
            "port": request.port,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Failed to connect to drone: {e}")
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(e)}")


@app.post("/api/drone/send")
async def send_data(request: SendDataRequest):
    """
    Send CRTP packet to drone via UDP
    Expects base64 encoded packet data
    """
    global udp_socket, drone_address
    
    if not udp_socket or not drone_address:
        raise HTTPException(status_code=400, detail="Not connected to drone")
    
    try:
        # Decode base64 data
        packet_data = base64.b64decode(request.data)
        
        # Send via UDP
        bytes_sent = udp_socket.sendto(packet_data, drone_address)
        
        return {
            "status": "sent",
            "bytes": bytes_sent,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Failed to send data: {e}")
        raise HTTPException(status_code=500, detail=f"Send failed: {str(e)}")


@app.post("/api/drone/disconnect")
async def disconnect_drone():
    """
    Disconnect from drone
    Closes the UDP socket
    """
    global udp_socket, drone_address
    
    try:
        if udp_socket:
            udp_socket.close()
            udp_socket = None
        
        drone_address = None
        
        logger.info("Disconnected from drone")
        
        return {
            "status": "disconnected",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Failed to disconnect: {e}")
        raise HTTPException(status_code=500, detail=f"Disconnect failed: {str(e)}")


@app.get("/api/drone/status")
async def get_drone_status():
    """
    Get current drone connection status
    """
    global udp_socket, drone_address
    
    if udp_socket and drone_address:
        return {
            "connected": True,
            "address": drone_address[0],
            "port": drone_address[1],
            "timestamp": datetime.now().isoformat()
        }
    else:
        return {
            "connected": False,
            "timestamp": datetime.now().isoformat()
        }


@app.get("/api/status")
async def get_status():
    """
    Get backend status (compatibility with existing clients)
    """
    return [{
        "id": "backend-1",
        "client_name": "FLYQ_Backend",
        "timestamp": datetime.now().isoformat(),
        "status": "running"
    }]


@app.post("/api/status")
async def post_status(status: StatusUpdate):
    """
    Post status update (compatibility with existing clients)
    """
    return {
        "id": "status-1",
        "client_name": status.client_name,
        "timestamp": datetime.now().isoformat()
    }


# ========================================
# v2.1 FEATURES API ENDPOINTS
# ========================================

# Flight Path Recording
@app.post("/api/flight-path/save")
async def save_flight_path(request: SaveFlightPathRequest):
    """
    Save a recorded flight path
    """
    try:
        logger.info(f"Saving flight path: {request.name} with {len(request.points)} points")
        
        # In production, this would save to database
        # For now, just return success
        return {
            "status": "saved",
            "id": f"path-{datetime.now().timestamp()}",
            "name": request.name,
            "points_count": len(request.points),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to save flight path: {e}")
        raise HTTPException(status_code=500, detail=f"Save failed: {str(e)}")


@app.get("/api/flight-path/list")
async def list_flight_paths():
    """
    Get list of saved flight paths
    """
    # In production, this would query from database
    return {
        "paths": [],
        "count": 0,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/flight-path/{path_id}")
async def get_flight_path(path_id: str):
    """
    Get a specific flight path by ID
    """
    # In production, this would query from database
    return {
        "id": path_id,
        "name": "Sample Path",
        "points": [],
        "timestamp": datetime.now().isoformat()
    }


@app.delete("/api/flight-path/{path_id}")
async def delete_flight_path(path_id: str):
    """
    Delete a flight path
    """
    logger.info(f"Deleting flight path: {path_id}")
    return {
        "status": "deleted",
        "id": path_id,
        "timestamp": datetime.now().isoformat()
    }


# Camera Streaming
@app.post("/api/camera/start-stream")
async def start_camera_stream(request: CameraStreamRequest):
    """
    Initialize camera stream from FLYQ Vision drone
    """
    try:
        logger.info(f"Starting camera stream from {request.drone_ip} at {request.quality}@{request.fps}fps")
        
        # In production, this would:
        # 1. Establish WebRTC or RTSP connection
        # 2. Configure stream parameters
        # 3. Return stream URL
        
        stream_url = f"rtsp://{request.drone_ip}:8554/stream"
        
        return {
            "status": "streaming",
            "stream_url": stream_url,
            "quality": request.quality,
            "fps": request.fps,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to start camera stream: {e}")
        raise HTTPException(status_code=500, detail=f"Stream start failed: {str(e)}")


@app.post("/api/camera/stop-stream")
async def stop_camera_stream():
    """
    Stop camera stream
    """
    logger.info("Stopping camera stream")
    return {
        "status": "stopped",
        "timestamp": datetime.now().isoformat()
    }


# Multi-Drone Management
@app.get("/api/drones/scan")
async def scan_drones():
    """
    Scan for available drones on network
    """
    try:
        logger.info("Scanning for drones")
        
        # In production, this would:
        # 1. Scan WiFi networks for FLYQ SSIDs
        # 2. Ping drone IPs to check availability
        # 3. Query drone info
        
        # Return mock data for now
        mock_drones = [
            {
                "id": "drone-1",
                "name": "FLYQ Vision #1",
                "ip": "192.168.4.1",
                "ssid": "FLYQ_Vision_01",
                "model": "FLYQ_Vision",
                "available": True
            },
            {
                "id": "drone-2",
                "name": "FLYQ Air #2",
                "ip": "192.168.4.2",
                "ssid": "FLYQ_Air_02",
                "model": "FLYQ_Air",
                "available": True
            }
        ]
        
        return {
            "drones": mock_drones,
            "count": len(mock_drones),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to scan drones: {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@app.post("/api/drones/{drone_id}/connect")
async def connect_to_drone(drone_id: str):
    """
    Connect to a specific drone
    """
    logger.info(f"Connecting to drone: {drone_id}")
    return {
        "status": "connected",
        "drone_id": drone_id,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/drones/{drone_id}/disconnect")
async def disconnect_from_drone(drone_id: str):
    """
    Disconnect from a specific drone
    """
    logger.info(f"Disconnecting from drone: {drone_id}")
    return {
        "status": "disconnected",
        "drone_id": drone_id,
        "timestamp": datetime.now().isoformat()
    }


# Gesture Controls
@app.post("/api/gesture/calibrate")
async def calibrate_gesture_sensors():
    """
    Calibrate gesture sensors
    """
    logger.info("Calibrating gesture sensors")
    
    # Simulate calibration
    import asyncio
    await asyncio.sleep(1)
    
    return {
        "status": "calibrated",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/gesture/command")
async def send_gesture_command(command: dict):
    """
    Send command triggered by gesture
    """
    logger.info(f"Gesture command: {command}")
    return {
        "status": "executed",
        "command": command,
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8001"))
    
    logger.info(f"Starting server on port {port}")
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
