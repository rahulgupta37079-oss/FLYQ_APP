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
