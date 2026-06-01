/**
 * ESP Drone Service for React Native
 * Based on ESP-Drone-Android implementation
 * Uses react-native-udp with proper configuration
 */

import dgram from 'react-native-udp';

class EspDroneService {
  constructor() {
    this.APP_PORT = 2399;
    this.DEVICE_PORT = 2390;
    this.DEVICE_ADDRESS = '192.168.43.42'; // ESP32 default AP address
    
    this.socket = null;
    this.isConnected = false;
    this.connectionCallback = null;
    this.telemetryCallback = null;
    this.receiveQueue = [];
    this.sendQueue = [];
  }

  /**
   * Connect to ESP Drone via UDP
   */
  async connect(droneIP = null) {
    return new Promise((resolve, reject) => {
      try {
        // If already connected, disconnect first
        if (this.socket) {
          console.log('[EspDrone] Disconnecting existing connection');
          this.disconnect();
        }

        // Use provided IP or default
        if (droneIP) {
          this.DEVICE_ADDRESS = droneIP;
        }

        console.log(`[EspDrone] Connecting to ${this.DEVICE_ADDRESS}:${this.DEVICE_PORT}`);

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.log('[EspDrone] Connection timeout');
            this.disconnect();
            reject({ success: false, error: 'Connection timeout' });
          }
        }, 5000);

        // Create UDP socket
        this.socket = dgram.createSocket({
          type: 'udp4',
          reuseAddr: true, // Important for ESP-Drone protocol
        });

        // Bind to app port
        this.socket.bind(this.APP_PORT);

        // Socket opened successfully
        this.socket.once('listening', () => {
          clearTimeout(connectionTimeout);
          console.log('[EspDrone] Socket listening on port', this.APP_PORT);
          this.isConnected = true;
          
          // Start receive loop
          this._startReceiveLoop();
          
          // Start send loop
          this._startSendLoop();
          
          // Send initial ping
          this.sendPing();
          
          if (this.connectionCallback) {
            this.connectionCallback({ connected: true });
          }
          
          resolve({ success: true, message: 'Connected to ESP Drone' });
        });

        // Handle incoming messages
        this.socket.on('message', (data, rinfo) => {
          this._handleReceive(data, rinfo);
        });

        // Handle errors
        this.socket.on('error', (err) => {
          clearTimeout(connectionTimeout);
          console.error('[EspDrone] Socket error:', err);
          this.disconnect();
          reject({ success: false, error: err.message });
        });

      } catch (error) {
        console.error('[EspDrone] Connect error:', error);
        reject({ success: false, error: error.message });
      }
    });
  }

  /**
   * Disconnect from ESP Drone
   */
  disconnect() {
    // Clear send interval
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
    }

    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        console.warn('[EspDrone] Close error:', e);
      }
      this.socket = null;
    }
    
    this.isConnected = false;
    this.receiveQueue = [];
    this.sendQueue = [];
    
    if (this.connectionCallback) {
      this.connectionCallback({ connected: false });
    }
    
    console.log('[EspDrone] Disconnected');
  }

  /**
   * Send CRTP packet to drone
   */
  sendPacket(packet) {
    if (!this.isConnected || !this.socket) {
      console.warn('[EspDrone] Not connected, cannot send packet');
      return;
    }

    this.sendQueue.push(packet);
  }

  /**
   * Send commander packet (flight control)
   */
  sendCommander(roll, pitch, yaw, thrust) {
    // CRTP Commander packet format
    const packet = {
      port: 0x07, // Commander port
      channel: 0,
      data: [
        roll & 0xFF,
        (roll >> 8) & 0xFF,
        pitch & 0xFF,
        (pitch >> 8) & 0xFF,
        yaw & 0xFF,
        (yaw >> 8) & 0xFF,
        thrust & 0xFF,
        (thrust >> 8) & 0xFF,
      ]
    };

    this.sendPacket(packet);
  }

  /**
   * Send ping packet
   */
  sendPing() {
    const packet = {
      port: 0x00, // Console port (used for ping)
      channel: 0,
      data: [0xFF] // Ping byte
    };
    
    this.sendPacket(packet);
  }

  /**
   * Handle received data
   */
  _handleReceive(data, rinfo) {
    try {
      // Convert to byte array
      const bytes = Array.from(data);
      
      // ESP-Drone adds checksum as last byte
      if (bytes.length < 2) {
        console.warn('[EspDrone] Invalid packet length');
        return;
      }

      // Validate checksum
      const receivedData = bytes.slice(0, -1);
      const receivedChecksum = bytes[bytes.length - 1];
      
      let calculatedChecksum = 0;
      for (let b of receivedData) {
        calculatedChecksum += b & 0xFF;
      }
      calculatedChecksum = calculatedChecksum & 0xFF;

      if (receivedChecksum !== calculatedChecksum) {
        console.warn('[EspDrone] Invalid checksum');
        return;
      }

      // Parse CRTP packet
      const packet = this._parseCrtpPacket(receivedData);
      
      // Handle packet based on port
      this._handlePacket(packet);

    } catch (error) {
      console.error('[EspDrone] Receive error:', error);
    }
  }

  /**
   * Parse CRTP packet from bytes
   */
  _parseCrtpPacket(bytes) {
    if (bytes.length === 0) {
      return null;
    }

    const header = bytes[0];
    const port = (header >> 4) & 0x0F;
    const channel = header & 0x03;
    const data = bytes.slice(1);

    return { port, channel, data };
  }

  /**
   * Handle parsed packet
   */
  _handlePacket(packet) {
    if (!packet) return;

    // Port 0x02 - Parameters
    // Port 0x05 - Logging
    // Port 0x07 - Commander
    // etc.

    if (this.telemetryCallback) {
      this.telemetryCallback(packet);
    }
  }

  /**
   * Start receive loop
   */
  _startReceiveLoop() {
    // Packets are handled by 'message' event
    console.log('[EspDrone] Receive loop started');
  }

  /**
   * Start send loop
   */
  _startSendLoop() {
    this.sendInterval = setInterval(() => {
      if (this.sendQueue.length > 0 && this.isConnected && this.socket) {
        const packet = this.sendQueue.shift();
        this._sendPacketNow(packet);
      }
    }, 10); // Send at ~100Hz
  }

  /**
   * Actually send packet via UDP
   */
  _sendPacketNow(packet) {
    try {
      // Build CRTP packet bytes
      const header = ((packet.port & 0x0F) << 4) | (packet.channel & 0x03);
      const bytes = [header, ...(packet.data || [])];

      // Calculate checksum
      let checksum = 0;
      for (let b of bytes) {
        checksum += b & 0xFF;
      }
      bytes.push(checksum & 0xFF);

      // Convert to Buffer (if needed)
      const buffer = new Uint8Array(bytes);

      // Send UDP packet
      this.socket.send(
        buffer,
        undefined,
        undefined,
        this.DEVICE_PORT,
        this.DEVICE_ADDRESS,
        (err) => {
          if (err) {
            console.error('[EspDrone] Send error:', err);
          }
        }
      );

    } catch (error) {
      console.error('[EspDrone] Send packet error:', error);
    }
  }

  /**
   * Register connection state callback
   */
  onConnectionChange(callback) {
    this.connectionCallback = callback;
  }

  /**
   * Register telemetry callback
   */
  onTelemetry(callback) {
    this.telemetryCallback = callback;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      deviceAddress: this.DEVICE_ADDRESS,
      devicePort: this.DEVICE_PORT,
      appPort: this.APP_PORT
    };
  }
}

// Export singleton instance
export default new EspDroneService();
