// Real Drone Connection Service for LiteWing ESP32-S3
// Uses UDP protocol for actual drone control via WiFi

import dgram from 'react-native-udp';
import NetInfo from '@react-native-community/netinfo';
import { Buffer } from 'buffer';

class RealDroneService {
  constructor() {
    this.isConnected = false;
    this.droneIP = '192.168.4.1'; // Default ESP32 AP IP
    this.dronePort = 2989; // Standard CRTP UDP port
    this.socket = null;
    this.commandInterval = null;
    this.pingInterval = null;
    this.telemetryInterval = null;
    this.telemetryCallback = null;
    this.connectionCallback = null;
    this.lastCommand = { roll: 0, pitch: 0, yaw: 0, thrust: 0 };
    this.armed = false;
    this.telemetryData = {
      battery: 100,
      signal: 4,
      altitude: 0,
      pitch: 0,
      roll: 0,
      yaw: 0,
    };
  }

  /**
   * Check if connected to drone WiFi network
   */
  async checkDroneWiFi() {
    try {
      const state = await NetInfo.fetch();
      
      if (!state.isConnected || state.type !== 'wifi') {
        return {
          connected: false,
          message: 'Not connected to WiFi',
        };
      }

      const ssid = state.details?.ssid || '';
      const ipAddress = state.details?.ipAddress || '';
      
      // Check if connected to LiteWing/FLYQ/ESP32 drone network
      const isDroneNetwork = 
        ssid.includes('LiteWing') || 
        ssid.includes('FLYQ') ||
        ssid.includes('ESP32') ||
        ssid.includes('Crazyflie') ||
        ssid.includes('Drone');

      return {
        connected: isDroneNetwork,
        ssid,
        ipAddress,
        message: isDroneNetwork 
          ? `Connected to ${ssid}` 
          : `Connected to ${ssid} (not a drone network)`,
      };
    } catch (error) {
      console.error('WiFi check error:', error);
      return {
        connected: false,
        message: 'Error checking WiFi',
        error: error.message,
      };
    }
  }

  /**
   * Connect to drone via UDP
   */
  async connect(ip = this.droneIP, port = this.dronePort) {
    try {
      // Check WiFi first
      const wifiCheck = await this.checkDroneWiFi();
      if (!wifiCheck.connected) {
        throw new Error('Not connected to drone WiFi network. Please connect to the drone\'s WiFi (e.g., LiteWing-xxxx, FLYQ-Drone-xxx) first.');
      }

      this.droneIP = ip;
      this.dronePort = port;

      // Create UDP socket
      if (this.socket) {
        this.socket.close();
      }

      this.socket = dgram.createSocket({
        type: 'udp4',
        reuseAddr: true,
      });

      // Setup socket listeners
      this.socket.on('message', (data, rinfo) => {
        this.handleDroneMessage(data, rinfo);
      });

      this.socket.on('error', (err) => {
        console.error('Socket error:', err);
        this.handleDisconnection(err.message);
      });

      this.socket.on('close', () => {
        console.log('Socket closed');
        this.handleDisconnection('Socket closed');
      });

      // Bind socket to random port
      this.socket.bind(() => {
        console.log(`UDP socket bound to port ${this.socket.address().port}`);
      });

      // Test connection with ping
      const connected = await this.sendPing();
      
      if (connected) {
        this.isConnected = true;
        this.startCommandLoop();
        this.startPingLoop();
        this.startTelemetryLoop();
        
        if (this.connectionCallback) {
          this.connectionCallback({ connected: true });
        }
        
        return {
          success: true,
          message: `Connected to drone at ${ip}:${port}`,
        };
      } else {
        throw new Error('Failed to connect to drone - no response to ping');
      }
    } catch (error) {
      console.error('Connection error:', error);
      this.isConnected = false;
      
      if (this.connectionCallback) {
        this.connectionCallback({ connected: false, error: error.message });
      }
      
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Handle incoming drone messages
   */
  handleDroneMessage(data, rinfo) {
    try {
      // Parse drone response
      const message = data.toString();
      
      // Check if it's telemetry data
      if (message.startsWith('TEL:')) {
        const telemetryJson = message.substring(4);
        const telemetry = JSON.parse(telemetryJson);
        
        this.telemetryData = {
          ...this.telemetryData,
          ...telemetry,
        };
        
        if (this.telemetryCallback) {
          this.telemetryCallback(this.telemetryData);
        }
      }
      
      // Check if it's a ping response
      else if (message === 'PONG') {
        console.log('Received PONG from drone');
      }
      
      // Check if it's an ACK
      else if (message === 'ACK') {
        // Command acknowledged
      }
      
    } catch (error) {
      console.error('Error handling drone message:', error);
    }
  }

  /**
   * Handle disconnection
   */
  handleDisconnection(reason) {
    if (!this.isConnected) return;
    
    console.log('Drone disconnected:', reason);
    this.disconnect();
  }

  /**
   * Send ping to drone via UDP
   */
  async sendPing() {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        resolve(false);
        return;
      }

      const pingMessage = Buffer.from('PING');
      let timeout = null;
      let responded = false;

      // Setup one-time response handler
      const messageHandler = (data) => {
        const message = data.toString();
        if (message === 'PONG') {
          responded = true;
          clearTimeout(timeout);
          this.socket.removeListener('message', messageHandler);
          resolve(true);
        }
      };

      this.socket.on('message', messageHandler);

      // Send ping
      this.socket.send(pingMessage, 0, pingMessage.length, this.dronePort, this.droneIP, (err) => {
        if (err) {
          console.error('Ping send error:', err);
          clearTimeout(timeout);
          this.socket.removeListener('message', messageHandler);
          resolve(false);
        }
      });

      // Timeout after 2 seconds
      timeout = setTimeout(() => {
        this.socket.removeListener('message', messageHandler);
        if (!responded) {
          console.log('Ping timeout - no response from drone');
          resolve(false);
        }
      }, 2000);
    });
  }

  /**
   * Disconnect from drone
   */
  disconnect() {
    // Send stop command before disconnecting
    if (this.isConnected) {
      this.sendStopCommand();
    }

    this.stopCommandLoop();
    this.stopPingLoop();
    this.stopTelemetryLoop();
    this.isConnected = false;
    this.armed = false;
    
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        console.error('Error closing socket:', e);
      }
      this.socket = null;
    }
    
    if (this.connectionCallback) {
      this.connectionCallback({ connected: false });
    }
    
    return {
      success: true,
      message: 'Disconnected from drone',
    };
  }

  /**
   * Start command loop (sends commands at 50Hz = 20ms)
   */
  startCommandLoop() {
    if (this.commandInterval) return;
    
    this.commandInterval = setInterval(() => {
      if (this.isConnected && this.armed) {
        this.sendCommand(this.lastCommand);
      }
    }, 20); // 50Hz update rate
  }

  /**
   * Stop command loop
   */
  stopCommandLoop() {
    if (this.commandInterval) {
      clearInterval(this.commandInterval);
      this.commandInterval = null;
    }
  }

  /**
   * Start ping loop (keep-alive every 1s)
   */
  startPingLoop() {
    if (this.pingInterval) return;
    
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendPing();
      }
    }, 1000);
  }

  /**
   * Stop ping loop
   */
  stopPingLoop() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Start telemetry loop (request telemetry every 200ms)
   */
  startTelemetryLoop() {
    if (this.telemetryInterval) return;
    
    this.telemetryInterval = setInterval(() => {
      if (this.isConnected) {
        this.requestTelemetry();
      }
    }, 200);
  }

  /**
   * Stop telemetry loop
   */
  stopTelemetryLoop() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
  }

  /**
   * Request telemetry from drone
   */
  requestTelemetry() {
    if (!this.socket || !this.isConnected) return;

    const telemetryRequest = Buffer.from('GET_TEL');
    this.socket.send(
      telemetryRequest,
      0,
      telemetryRequest.length,
      this.dronePort,
      this.droneIP,
      (err) => {
        if (err) {
          console.error('Telemetry request error:', err);
        }
      }
    );
  }

  /**
   * Update flight command
   * @param {Object} command - {roll, pitch, yaw, thrust}
   */
  updateCommand(command) {
    try {
      if (!command || typeof command !== 'object') {
        console.warn('Invalid command object');
        return;
      }
      
      this.lastCommand = {
        roll: Math.max(-100, Math.min(100, command.roll || 0)),
        pitch: Math.max(-100, Math.min(100, command.pitch || 0)),
        yaw: Math.max(-100, Math.min(100, command.yaw || 0)),
        thrust: Math.max(0, Math.min(65535, command.thrust || 0)),
      };
    } catch (error) {
      console.error('updateCommand error:', error);
    }
  }

  /**
   * Send flight command to drone via UDP
   * Protocol: CMD:<roll>,<pitch>,<yaw>,<thrust>
   */
  sendCommand(command) {
    if (!this.socket || !this.isConnected || !this.armed) return;

    try {
      const { roll, pitch, yaw, thrust } = command;
      
      // Format: CMD:roll,pitch,yaw,thrust
      const commandString = `CMD:${roll.toFixed(2)},${pitch.toFixed(2)},${yaw.toFixed(2)},${Math.round(thrust)}`;
      const commandBuffer = Buffer.from(commandString);

      this.socket.send(
        commandBuffer,
        0,
        commandBuffer.length,
        this.dronePort,
        this.droneIP,
        (err) => {
          if (err) {
            console.error('Command send error:', err);
          }
        }
      );
    } catch (error) {
      console.error('sendCommand error:', error);
    }
  }

  /**
   * Send emergency stop command
   */
  sendStopCommand() {
    if (!this.socket) return;

    try {
      const stopCommand = Buffer.from('STOP');
      this.socket.send(
        stopCommand,
        0,
        stopCommand.length,
        this.dronePort,
        this.droneIP,
        (err) => {
          if (err) {
            console.error('Stop command error:', err);
          }
        }
      );
      
      // Reset command to zero
      this.lastCommand = { roll: 0, pitch: 0, yaw: 0, thrust: 0 };
      this.armed = false;
    } catch (error) {
      console.error('sendStopCommand error:', error);
    }
  }

  /**
   * Arm or disarm drone
   */
  async setArmed(armed) {
    try {
      if (!this.socket || !this.isConnected) {
        return { success: false, message: 'Not connected to drone' };
      }

      const armCommand = Buffer.from(armed ? 'ARM' : 'DISARM');
      
      this.socket.send(
        armCommand,
        0,
        armCommand.length,
        this.dronePort,
        this.droneIP,
        (err) => {
          if (err) {
            console.error('Arm command error:', err);
          }
        }
      );

      this.armed = armed;
      
      return { success: true, armed };
    } catch (error) {
      console.error('setArmed error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Send takeoff command
   */
  async takeoff(height = 0.5) {
    if (!this.socket || !this.isConnected) {
      return { success: false, message: 'Not connected' };
    }

    const takeoffCommand = Buffer.from(`TAKEOFF:${height}`);
    this.socket.send(
      takeoffCommand,
      0,
      takeoffCommand.length,
      this.dronePort,
      this.droneIP
    );

    return { success: true };
  }

  /**
   * Send land command
   */
  async land() {
    if (!this.socket || !this.isConnected) {
      return { success: false, message: 'Not connected' };
    }

    const landCommand = Buffer.from('LAND');
    this.socket.send(
      landCommand,
      0,
      landCommand.length,
      this.dronePort,
      this.droneIP
    );

    return { success: true };
  }

  /**
   * Set telemetry callback
   */
  onTelemetry(callback) {
    this.telemetryCallback = callback;
  }

  /**
   * Set connection state callback
   */
  onConnectionChange(callback) {
    this.connectionCallback = callback;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      droneIP: this.droneIP,
      dronePort: this.dronePort,
      armed: this.armed,
    };
  }

  /**
   * Get current telemetry
   */
  getTelemetry() {
    return this.telemetryData;
  }
}

// Export singleton instance
const realDroneService = new RealDroneService();
export default realDroneService;
