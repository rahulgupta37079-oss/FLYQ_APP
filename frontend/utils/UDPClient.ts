import axios from 'axios';
import { Platform } from 'react-native';

/**
 * UDP Client for communicating with drone via backend proxy
 * Uses FastAPI backend as a UDP proxy (iOS compatible)
 */
export class UDPClient {
  private backendURL: string;
  private connected: boolean = false;
  private droneIP: string = '';
  private dronePort: number = 2390;

  constructor(backendURL: string = 'http://localhost:8001') {
    this.backendURL = backendURL;
  }

  /**
   * Connect to drone via backend proxy
   */
  async connect(droneIP: string, port: number = 2390): Promise<boolean> {
    try {
      const response = await axios.post(`${this.backendURL}/api/drone/connect`, {
        ip: droneIP,
        port: port,
      }, {
        timeout: 5000,
      });

      if (response.data.status === 'connected') {
        this.connected = true;
        this.droneIP = droneIP;
        this.dronePort = port;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect to drone:', error);
      return false;
    }
  }

  /**
   * Send CRTP packet to drone via backend
   */
  async sendPacket(packet: Uint8Array): Promise<boolean> {
    if (!this.connected) {
      console.warn('Not connected to drone');
      return false;
    }

    try {
      // Convert packet to base64
      let binary = '';
      for (let i = 0; i < packet.length; i++) {
        binary += String.fromCharCode(packet[i]);
      }
      const base64Data = btoa(binary);

      const response = await axios.post(`${this.backendURL}/api/drone/send`, {
        data: base64Data,
      }, {
        timeout: 1000,
      });

      return response.data.status === 'sent';
    } catch (error) {
      console.error('Failed to send packet:', error);
      return false;
    }
  }

  /**
   * Disconnect from drone
   */
  async disconnect(): Promise<void> {
    try {
      await axios.post(`${this.backendURL}/api/drone/disconnect`, {}, {
        timeout: 2000,
      });
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
    this.connected = false;
    this.droneIP = '';
  }

  /**
   * Check connection status
   */
  async getStatus(): Promise<any> {
    try {
      const response = await axios.get(`${this.backendURL}/api/drone/status`, {
        timeout: 2000,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get status:', error);
      return { connected: false };
    }
  }

  /**
   * Get backend health
   */
  async getHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.backendURL}/api/`, {
        timeout: 2000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getDroneIP(): string {
    return this.droneIP;
  }

  getDronePort(): number {
    return this.dronePort;
  }

  setBackendURL(url: string): void {
    this.backendURL = url;
  }
}

// Singleton instance
let udpClientInstance: UDPClient | null = null;

export function getUDPClient(backendURL?: string): UDPClient {
  if (!udpClientInstance) {
    udpClientInstance = new UDPClient(backendURL);
  } else if (backendURL) {
    udpClientInstance.setBackendURL(backendURL);
  }
  return udpClientInstance;
}
