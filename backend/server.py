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
