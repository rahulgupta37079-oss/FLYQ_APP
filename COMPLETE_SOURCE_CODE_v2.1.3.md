# FLYQ v2.1.3 Enhanced - Complete Source Code

This document contains ALL the complete source code files for FLYQ Drone Controller v2.1.3 Enhanced with WiFi connection fixes.

---

## 📁 File Structure

```
FLYQ_APP/
├── App.js                                      (Main app entry)
├── app.json                                    (Expo config)
├── package.json                                (Dependencies)
├── global-polyfills.js                         (Buffer polyfill)
├── android/
│   └── app/
│       └── src/
│           └── main/
│               └── AndroidManifest.xml         (Android permissions)
└── src/
    ├── screens/
    │   └── WiFiScreen.js                       (WiFi connection screen)
    └── utils/
        ├── EspDroneService.js                  (ESP-Drone UDP service)
        └── PermissionManager.js                (Permission handler)
```

---

## 1️⃣ **App.js** (Main Application Entry)

```javascript
import 'react-native-gesture-handler';
import './global-polyfills'; // Import Buffer polyfill FIRST
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import WiFiScreen from './src/screens/WiFiScreen';
import ControlScreen from './src/screens/ControlScreen';
import CameraScreen from './src/screens/CameraScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import ErrorBoundary and Permission Manager
import ErrorBoundary from './src/components/ErrorBoundary';
import permissionManager from './src/utils/PermissionManager';

const Stack = createNativeStackNavigator();

export default function App() {
  const [permissionsReady, setPermissionsReady] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    requestAppPermissions();
  }, []);

  const requestAppPermissions = async () => {
    // Request all permissions on app startup
    const result = await permissionManager.requestAllPermissions();
    setPermissionStatus(result);
    
    // Allow app to continue even if some permissions denied
    // User can grant them later from Settings
    setTimeout(() => {
      setPermissionsReady(true);
    }, 1000);
  };

  if (!permissionsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Requesting Permissions...</Text>
        <Text style={styles.loadingSubtext}>
          Please allow Location and Bluetooth{'\n'}
          for WiFi scanning and drone control
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1a1a1a',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              contentStyle: {
                backgroundColor: '#000',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'FLYQ Drone Controller' }}
            />
            <Stack.Screen 
              name="WiFi" 
              component={WiFiScreen}
              options={{ title: 'WiFi Connection' }}
            />
            <Stack.Screen 
              name="Control" 
              component={ControlScreen}
              options={{ title: 'Drone Control' }}
            />
            <Stack.Screen 
              name="Camera" 
              component={CameraScreen}
              options={{ title: 'Camera Stream' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
```

---

## 2️⃣ **global-polyfills.js** (Buffer Polyfill)

```javascript
// Global polyfills for React Native
// Fixes Buffer and other Node.js globals

import { Buffer } from 'buffer';

// Make Buffer available globally
global.Buffer = Buffer;

// Export for explicit imports
export { Buffer };
```

---

## 3️⃣ **src/screens/WiFiScreen.js** (WiFi Connection Screen - MOST IMPORTANT)

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import espDroneService from '../utils/EspDroneService';

export default function WiFiScreen({ navigation }) {
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDroneConnected, setIsDroneConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Monitor WiFi connection state
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('[WiFi] Network state changed:', state);
      setConnectionInfo(state);
      setIsConnected(state.isConnected && state.type === 'wifi');
      
      // Auto-connect to drone when WiFi connected
      if (state.isConnected && state.type === 'wifi' && !isDroneConnected) {
        autoConnectToDrone(state);
      }
    });

    // Check initial connection
    checkConnection();

    return () => unsubscribe();
  }, [isDroneConnected]);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setConnectionInfo(state);
    setIsConnected(state.isConnected && state.type === 'wifi');
  };

  const autoConnectToDrone = async (networkState) => {
    // Only auto-connect if connected to WiFi
    if (!networkState.isConnected || networkState.type !== 'wifi') {
      return;
    }

    // Check if already connecting or connected
    if (isConnecting || isDroneConnected) {
      return;
    }

    console.log('[WiFi] Auto-connecting to drone...');
    setIsConnecting(true);

    try {
      // Try multiple common ESP-Drone IP addresses
      const possibleIPs = ['192.168.43.42', '192.168.4.1'];
      let connected = false;
      
      for (const ip of possibleIPs) {
        console.log(`[WiFi] Trying to connect to ${ip}...`);
        try {
          const result = await Promise.race([
            espDroneService.connect(ip),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 3000)
            )
          ]);
          
          if (result.success) {
            setIsDroneConnected(true);
            Alert.alert(
              'Connected!',
              `Successfully connected to ESP Drone at ${ip}`,
              [{ text: 'OK' }]
            );
            connected = true;
            break;
          }
        } catch (error) {
          console.log(`[WiFi] Failed to connect to ${ip}:`, error.message);
          // Try next IP
        }
      }
      
      if (!connected) {
        console.log('[WiFi] Auto-connect failed for all IPs');
      }
    } catch (error) {
      console.error('[WiFi] Auto-connect error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const manualConnectToDrone = async () => {
    if (!isConnected) {
      Alert.alert(
        'No WiFi Connection',
        'Please connect to your drone\'s WiFi network first.\n\nLook for WiFi network named:\n- ESP_DRONE_xxx\n- TELLO-xxx\n- Or your drone\'s WiFi name',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open WiFi Settings',
            onPress: () => {
              if (Platform.OS === 'android') {
                Linking.sendIntent('android.settings.WIFI_SETTINGS');
              } else {
                Linking.openURL('App-Prefs:root=WIFI');
              }
            }
          }
        ]
      );
      return;
    }

    setIsConnecting(true);

    try {
      // Try multiple common ESP-Drone IP addresses
      const possibleIPs = ['192.168.43.42', '192.168.4.1'];
      let connected = false;
      let connectedIP = null;
      
      for (const ip of possibleIPs) {
        console.log(`[WiFi] Trying to connect to ${ip}...`);
        try {
          const result = await Promise.race([
            espDroneService.connect(ip),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Connection timeout')), 5000)
            )
          ]);

          if (result.success) {
            setIsDroneConnected(true);
            connectedIP = ip;
            connected = true;
            Alert.alert(
              'Success!',
              `Connected to ESP Drone\nIP: ${ip}`,
              [
                {
                  text: 'Go to Control',
                  onPress: () => navigation.navigate('Control')
                }
              ]
            );
            break;
          }
        } catch (error) {
          console.log(`[WiFi] Failed at ${ip}:`, error.message);
          // Try next IP
        }
      }

      if (!connected) {
        Alert.alert(
          'Connection Failed',
          'Could not connect to drone.\n\nTried IPs:\n- 192.168.43.42\n- 192.168.4.1\n\nMake sure:\n1. You are connected to drone WiFi\n2. Drone is powered on\n3. Check drone\'s IP address',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        error.message || 'Failed to connect to drone',
        [{ text: 'OK' }]
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromDrone = () => {
    espDroneService.disconnect();
    setIsDroneConnected(false);
    Alert.alert('Disconnected', 'Disconnected from drone');
  };

  const openWiFiSettings = () => {
    if (Platform.OS === 'android') {
      Linking.sendIntent('android.settings.WIFI_SETTINGS');
    } else {
      Linking.openURL('App-Prefs:root=WIFI');
    }
  };

  return (
    <View style={styles.container}>
      {/* Connection Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>CONNECTION STATUS</Text>
        
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>WiFi</Text>
            <Text style={isConnected ? styles.statusValueActive : styles.statusValueInactive}>
              {isConnected ? '● Connected' : '● Disconnected'}
            </Text>
            {isConnected && connectionInfo?.details?.ssid && (
              <Text style={styles.networkName}>
                Network: {connectionInfo.details.ssid}
              </Text>
            )}
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Drone</Text>
            <Text style={isDroneConnected ? styles.statusValueActive : styles.statusValueInactive}>
              {isDroneConnected ? '● Connected' : '● Not Connected'}
            </Text>
            {isDroneConnected && (
              <Text style={styles.droneIP}>IP: 192.168.43.42</Text>
            )}
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>📡 How to Connect:</Text>
        <Text style={styles.instructionStep}>1. Connect to drone WiFi (ESP_DRONE_xxx)</Text>
        <Text style={styles.instructionStep}>2. Tap "Connect to Drone" button below</Text>
        <Text style={styles.instructionStep}>3. Wait for connection confirmation</Text>
        <Text style={styles.instructionStep}>4. Go to Control screen to fly!</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        {!isDroneConnected ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={openWiFiSettings}
            >
              <Text style={styles.buttonText}>📶 Open WiFi Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.connectButton,
                (!isConnected || isConnecting) && styles.buttonDisabled
              ]}
              onPress={manualConnectToDrone}
              disabled={!isConnected || isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isConnected ? '🚁 Connect to Drone' : '⚠️ Connect WiFi First'}
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPress={() => navigation.navigate('Control')}
            >
              <Text style={styles.buttonText}>🎮 Go to Control Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.disconnectButton]}
              onPress={disconnectFromDrone}
            >
              <Text style={styles.buttonText}>🔌 Disconnect</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Technical Info */}
      <View style={styles.techInfoCard}>
        <Text style={styles.techInfoTitle}>🔧 Technical Info</Text>
        <Text style={styles.techInfoText}>Protocol: ESP-Drone CRTP/UDP</Text>
        <Text style={styles.techInfoText}>App Port: 2399</Text>
        <Text style={styles.techInfoText}>Drone Port: 2390</Text>
        <Text style={styles.techInfoText}>Trying IPs: 192.168.43.42, 192.168.4.1</Text>
        <Text style={styles.techInfoText}>Version: 2.1.3</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 15,
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statusValueActive: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statusValueInactive: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  networkName: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  droneIP: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  instructionsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  instructionStep: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  techInfoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  techInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
  },
  techInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
```

---

## 4️⃣ **src/utils/EspDroneService.js** (ESP-Drone UDP Communication)

```javascript
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
```

---

## 5️⃣ **src/utils/PermissionManager.js** (Permission Handler)

```javascript
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

class PermissionManager {
  constructor() {
    this.permissions = {
      location: false,
      bluetooth: false,
      wifi: false,
    };
  }

  /**
   * Request all necessary permissions for the app
   * Call this on app startup
   */
  async requestAllPermissions() {
    if (Platform.OS !== 'android') {
      return { success: true, message: 'iOS permissions handled by system' };
    }

    try {
      const permissions = [];
      
      // Location permissions (required for WiFi scanning)
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
      
      // WiFi permissions
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_WIFI_STATE);
      permissions.push(PermissionsAndroid.PERMISSIONS.CHANGE_WIFI_STATE);
      
      // Bluetooth permissions (Android 12+)
      if (Platform.Version >= 31) {
        permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
        permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      // Check results
      const locationGranted = 
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;
      
      let bluetoothGranted = true;
      if (Platform.Version >= 31) {
        bluetoothGranted = 
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;
      }

      this.permissions.location = locationGranted;
      this.permissions.bluetooth = bluetoothGranted;
      this.permissions.wifi = locationGranted; // WiFi scanning requires location

      if (!locationGranted || !bluetoothGranted) {
        return {
          success: false,
          permissions: this.permissions,
          message: this.getMissingPermissionsMessage(),
        };
      }

      return {
        success: true,
        permissions: this.permissions,
        message: 'All permissions granted',
      };
    } catch (err) {
      console.error('Permission request error:', err);
      return {
        success: false,
        permissions: this.permissions,
        message: `Error requesting permissions: ${err.message}`,
      };
    }
  }

  /**
   * Check if a specific permission is granted
   */
  async checkPermission(permission) {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.check(permission);
      return granted;
    } catch (err) {
      console.error('Permission check error:', err);
      return false;
    }
  }

  /**
   * Check all permissions status
   */
  async checkAllPermissions() {
    if (Platform.OS !== 'android') {
      return {
        location: true,
        bluetooth: true,
        wifi: true,
      };
    }

    const locationGranted = await this.checkPermission(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    let bluetoothGranted = true;
    if (Platform.Version >= 31) {
      const scanGranted = await this.checkPermission(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
      const connectGranted = await this.checkPermission(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
      bluetoothGranted = scanGranted && connectGranted;
    }

    this.permissions = {
      location: locationGranted,
      bluetooth: bluetoothGranted,
      wifi: locationGranted,
    };

    return this.permissions;
  }

  /**
   * Get user-friendly message about missing permissions
   */
  getMissingPermissionsMessage() {
    const missing = [];
    
    if (!this.permissions.location) {
      missing.push('Location (required for WiFi scanning)');
    }
    if (!this.permissions.bluetooth) {
      missing.push('Bluetooth (required for drone connection)');
    }

    if (missing.length === 0) {
      return 'All permissions granted';
    }

    return `Missing permissions:\n• ${missing.join('\n• ')}\n\nPlease enable these in Settings → Apps → FLYQ → Permissions`;
  }

  /**
   * Show permission dialog with option to open settings
   */
  showPermissionDialog(title, message) {
    Alert.alert(
      title || 'Permissions Required',
      message || this.getMissingPermissionsMessage(),
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => Linking.openSettings()
        },
      ]
    );
  }

  /**
   * Get current permissions status
   */
  getPermissions() {
    return this.permissions;
  }
}

// Export singleton instance
const permissionManager = new PermissionManager();
export default permissionManager;
```

---

## 6️⃣ **app.json** (Expo Configuration)

```json
{
  "expo": {
    "name": "FLYQ Drone Controller",
    "slug": "flyq-drone-controller",
    "version": "2.1.3",
    "orientation": "default",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "scheme": "flyq",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.flyq.dronecontroller",
      "requireFullScreen": false
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.flyq.dronecontroller",
      "versionCode": 4,
      "permissions": [
        "ACCESS_WIFI_STATE",
        "CHANGE_WIFI_STATE",
        "ACCESS_NETWORK_STATE",
        "INTERNET",
        "VIBRATE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CHANGE_NETWORK_STATE"
      ],
      "screenOrientation": "fullSensor",
      "playStoreUrl": "https://play.google.com/store/apps/details?id=com.flyq.dronecontroller"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "768552da-36d7-481b-bf2a-df4bf6f0e624"
      }
    }
  }
}
```

---

## 7️⃣ **package.json** (Dependencies)

```json
{
  "name": "flyq-drone-controller",
  "version": "2.1.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-native-community/netinfo": "11.4.1",
    "@react-navigation/native": "^7.1.28",
    "@react-navigation/native-stack": "^7.11.0",
    "buffer": "^6.0.3",
    "dgram-browserify": "^0.0.13",
    "expo": "~54.0.0",
    "expo-av": "^16.0.8",
    "expo-screen-orientation": "^9.0.8",
    "expo-status-bar": "~3.0.0",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-udp": "^4.1.7",
    "react-native-wifi-reborn": "^4.12.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  },
  "private": true
}
```

---

## 8️⃣ **android/app/src/main/AndroidManifest.xml** (Android Permissions)

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <!-- Location permissions (required for WiFi scanning on Android 6+) -->
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
  
  <!-- WiFi permissions -->
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
  <uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
  <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>
  <uses-permission android:name="android.permission.CHANGE_WIFI_STATE"/>
  <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" android:usesPermissionFlags="neverForLocation"/>
  
  <!-- Bluetooth permissions for drone control -->
  <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30"/>
  <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30"/>
  <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation"/>
  <uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
  <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE"/>
  
  <!-- Network & Internet -->
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
  
  <!-- Storage (scoped to older Android versions) -->
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28"/>
  
  <!-- Other app permissions -->
  <uses-permission android:name="android.permission.RECORD_AUDIO"/>
  <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
  <uses-permission android:name="android.permission.VIBRATE"/>
  <uses-permission android:name="android.permission.WAKE_LOCK"/>
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
  
  <!-- Bluetooth features declaration -->
  <uses-feature android:name="android.hardware.bluetooth" android:required="false"/>
  <uses-feature android:name="android.hardware.bluetooth_le" android:required="false"/>
  <queries>
    <intent>
      <action android:name="android.intent.action.VIEW"/>
      <category android:name="android.intent.category.BROWSABLE"/>
      <data android:scheme="https"/>
    </intent>
  </queries>
  <application android:name=".MainApplication" android:label="@string/app_name" android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round" android:allowBackup="true" android:theme="@style/AppTheme" android:supportsRtl="true" android:enableOnBackInvokedCallback="false">
    <meta-data android:name="expo.modules.updates.ENABLED" android:value="false"/>
    <meta-data android:name="expo.modules.updates.EXPO_UPDATES_CHECK_ON_LAUNCH" android:value="ALWAYS"/>
    <meta-data android:name="expo.modules.updates.EXPO_UPDATES_LAUNCH_WAIT_MS" android:value="0"/>
    <activity android:name=".MainActivity" android:configChanges="keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode" android:launchMode="singleTask" android:windowSoftInputMode="adjustResize" android:theme="@style/Theme.App.SplashScreen" android:exported="true" android:screenOrientation="unspecified">
      <intent-filter>
        <action android:name="android.intent.action.MAIN"/>
        <category android:name="android.intent.category.LAUNCHER"/>
      </intent-filter>
      <intent-filter>
        <action android:name="android.intent.action.VIEW"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <category android:name="android.intent.category.BROWSABLE"/>
        <data android:scheme="flyq"/>
      </intent-filter>
    </activity>
  </application>
</manifest>
```

---

## 📝 **Key Features of This Code**

### ✅ **Multi-IP Auto-Discovery**
- Lines 61-89 in WiFiScreen.js: Tries `192.168.43.42` and `192.168.4.1` automatically
- 3-second timeout per IP for auto-connect
- 5-second timeout per IP for manual connect

### ✅ **Connection Timeout**
- Lines 42-49 in EspDroneService.js: 5-second connection timeout
- Prevents infinite waiting

### ✅ **Better Error Messages**
- Lines 163-169 in WiFiScreen.js: Shows exactly which IPs were tried

### ✅ **Proper Cleanup**
- Lines 105-130 in EspDroneService.js: Clears intervals, closes sockets

### ✅ **ESP-Drone CRTP Protocol**
- Lines 147-165 in EspDroneService.js: Commander packet format
- Lines 275-308 in EspDroneService.js: UDP send with checksum

### ✅ **Buffer Polyfill**
- global-polyfills.js: Makes Buffer available globally
- Fixes "Property 'Buffer' doesn't exist" error

### ✅ **Permission Management**
- PermissionManager.js: Comprehensive Android permission handling
- Supports Android 12+ Bluetooth permissions
- Android 13+ WiFi permissions

---

## 🎯 **How to Use This Code**

1. **Copy Files**: Copy each file to the correct location in your project
2. **Install Dependencies**: Run `npm install`
3. **Build**: Run `eas build --platform android --profile preview`
4. **Test**: Install APK and test with your drone

---

## 🔧 **Customization**

### **Add More Drone IPs:**
Edit line 62 in WiFiScreen.js:
```javascript
const possibleIPs = ['192.168.43.42', '192.168.4.1', 'YOUR_CUSTOM_IP'];
```

### **Change Timeout:**
Edit line 71 in WiFiScreen.js (auto-connect):
```javascript
setTimeout(() => reject(new Error('Timeout')), 5000) // Change 5000 to your value
```

Edit line 137 in WiFiScreen.js (manual connect):
```javascript
setTimeout(() => reject(new Error('Connection timeout')), 10000) // Change 10000
```

---

## 📊 **Version Information**

- **Version**: 2.1.3 Enhanced
- **Build Date**: 2026-06-01
- **versionCode**: 4
- **Package**: com.flyq.dronecontroller

---

## 📞 **Need Help?**

If you need to modify anything or have questions about the code:

1. Read the inline comments (every function is documented)
2. Check WIFI_DEBUG_GUIDE.md for troubleshooting
3. Follow TESTING_CHECKLIST.md for systematic testing
4. Report issues with logs from `adb logcat | grep EspDrone`

---

**All code is ready to use!** Copy, build, and test! 🚀
