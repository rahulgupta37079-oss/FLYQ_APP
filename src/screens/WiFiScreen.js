import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import realDroneService from '../utils/RealDroneService';
import wifiScanner from '../utils/WiFiScannerService';

export default function WiFiScreen({ navigation }) {
  const [isScanning, setIsScanning] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkConnection();
    requestPermissionsOnLoad();
    
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionInfo(state);
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const requestPermissionsOnLoad = async () => {
    if (Platform.OS !== 'android') {
      setHasPermission(true);
      return;
    }

    try {
      // Check if already granted
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted) {
        setHasPermission(true);
        return;
      }

      // Request permissions
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_WIFI_STATE,
        PermissionsAndroid.PERMISSIONS.CHANGE_WIFI_STATE,
      ]);

      const allGranted = 
        result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.ACCESS_WIFI_STATE'] === PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.CHANGE_WIFI_STATE'] === PermissionsAndroid.RESULTS.GRANTED;

      setHasPermission(allGranted);

      if (!allGranted) {
        Alert.alert(
          'Permissions Required',
          'WiFi scanning requires Location permission. Please grant permissions in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Linking.openSettings()
            },
          ]
        );
      }
    } catch (err) {
      console.error('Permission request error:', err);
      setHasPermission(false);
    }
  };

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setConnectionInfo(state);
    setIsConnected(state.isConnected);
  };

  const scanForNetworks = async () => {
    setIsScanning(true);
    
    try {
      // Use real WiFi scanner
      const result = await wifiScanner.scanNetworks();
      
      if (result.success) {
        setNetworks(result.networks);
        
        if (result.networks.length === 0) {
          Alert.alert(
            'No Networks Found',
            'No WiFi networks detected. Make sure your drone is powered on and broadcasting WiFi.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Scan Failed',
          result.message || 'Failed to scan for WiFi networks. Make sure Location and WiFi permissions are enabled.',
          [{ text: 'OK' }]
        );
        setNetworks([]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to scan for networks');
      setNetworks([]);
    } finally {
      setIsScanning(false);
    }
  };

  const connectToNetwork = (network) => {
    if (!network.isDrone) {
      Alert.alert(
        'Not a Drone Network',
        'This network is not a FLYQ drone. Connect anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Connect', 
            onPress: () => attemptConnection(network)
          },
        ]
      );
    } else {
      attemptConnection(network);
    }
  };

  const attemptConnection = async (network) => {
    try {
      // Show connecting dialog
      Alert.alert('Connecting...', `Connecting to ${network.ssid}`);
      
      // For Android: Try to connect programmatically (may not work on all devices)
      // For iOS: User must connect manually in Settings
      // const wifiResult = await wifiScanner.connectToNetwork(network.ssid, '', false);
      
      // Guide user to connect manually (more reliable)
      Alert.alert(
        'Connect to Drone WiFi',
        `Please connect to "${network.ssid}" in your device's WiFi settings, then tap "I'm Connected" to proceed with drone connection.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: "I'm Connected", 
            onPress: async () => {
              // Wait a bit for connection to establish
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Attempt drone connection
              const result = await realDroneService.connect();
              
              if (result.success) {
                Alert.alert(
                  'Success!',
                  `Connected to drone via ${network.ssid}\n\n${result.message}`,
                  [
                    { 
                      text: 'Go to Control', 
                      onPress: () => navigation.navigate('Control')
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Connection Failed',
                  result.message || 'Could not establish UDP connection to drone. Make sure you are connected to the drone WiFi and the drone is powered on.',
                  [{ text: 'Retry', onPress: () => attemptConnection(network) }, { text: 'Cancel' }]
                );
              }
            }
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Connection error occurred');
    }
  };

  const getSignalStrength = (signal) => {
    const signalInfo = wifiScanner.getSignalInfo(signal);
    return signalInfo;
  };

  const renderNetwork = ({ item }) => {
    const signal = getSignalStrength(item.signal);
    
    return (
      <TouchableOpacity
        style={[
          styles.networkItem,
          item.isDrone && styles.droneNetwork,
        ]}
        onPress={() => connectToNetwork(item)}
        activeOpacity={0.7}
      >
        <View style={styles.networkInfo}>
          <View style={styles.networkHeader}>
            <Text style={styles.networkName}>
              {item.isDrone && '🚁 '}
              {item.ssid}
            </Text>
            {item.secured && <Text style={styles.lockIcon}>🔒</Text>}
          </View>
          <View style={styles.networkDetails}>
            <Text style={styles.networkDetailText}>
              {item.frequency} • {signal.text}
            </Text>
            <Text style={[styles.signalBars, { color: signal.color }]}>
              {signal.bars}
            </Text>
          </View>
        </View>
        <Text style={styles.connectArrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Permission Status */}
      {!hasPermission && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionIcon}>⚠️</Text>
          <View style={styles.permissionTextContainer}>
            <Text style={styles.permissionTitle}>Location Permission Required</Text>
            <Text style={styles.permissionText}>
              WiFi scanning needs Location permission to work
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.permissionButtonText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Connection Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Connection</Text>
        {isConnected ? (
          <View style={styles.statusContent}>
            <Text style={styles.statusConnected}>
              <Text style={styles.statusDot}>●</Text> Connected
            </Text>
            {connectionInfo?.details && (
              <>
                <Text style={styles.statusDetail}>
                  Network: {connectionInfo.details.ssid || 'Unknown'}
                </Text>
                <Text style={styles.statusDetail}>
                  IP: {connectionInfo.details.ipAddress || 'N/A'}
                </Text>
              </>
            )}
          </View>
        ) : (
          <View style={styles.statusContent}>
            <Text style={styles.statusDisconnected}>
              <Text style={styles.statusDotInactive}>●</Text> Not Connected
            </Text>
            <Text style={styles.statusDetail}>
              Enable WiFi and scan for networks
            </Text>
          </View>
        )}
      </View>

      {/* Scan Button */}
      <TouchableOpacity
        style={[styles.scanButton, !hasPermission && styles.scanButtonDisabled]}
        onPress={scanForNetworks}
        disabled={isScanning || !hasPermission}
        activeOpacity={0.7}
      >
        {isScanning ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.scanButtonText}>
            {!hasPermission ? '⚠️ Grant Permission First' : 
             networks.length > 0 ? '📡 Refresh Networks' : '📡 Scan for Networks'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Networks List */}
      {isScanning && networks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Scanning for networks...</Text>
        </View>
      ) : networks.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            Available Networks ({networks.length})
          </Text>
          <FlatList
            data={networks}
            renderItem={renderNetwork}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📡</Text>
          <Text style={styles.emptyText}>No Networks Found</Text>
          <Text style={styles.emptySubtext}>
            Tap the scan button to search for WiFi networks
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff9800',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  permissionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 13,
    color: '#333',
  },
  permissionButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statusContent: {
    gap: 8,
  },
  statusConnected: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statusDisconnected: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  statusDot: {
    color: '#4CAF50',
    fontSize: 24,
  },
  statusDotInactive: {
    color: '#666',
    fontSize: 24,
  },
  statusDetail: {
    fontSize: 14,
    color: '#aaa',
    marginLeft: 24,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  droneNetwork: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#1a2a1a',
  },
  networkInfo: {
    flex: 1,
  },
  networkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  networkName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  lockIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  networkDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  networkDetailText: {
    fontSize: 14,
    color: '#888',
  },
  signalBars: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectArrow: {
    fontSize: 32,
    color: '#666',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
