import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function WiFiScreen({ navigation }) {
  const [isScanning, setIsScanning] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionInfo(state);
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setConnectionInfo(state);
    setIsConnected(state.isConnected);
  };

  const scanForNetworks = () => {
    setIsScanning(true);
    
    // Simulate network scanning (in real app, use native WiFi scanning module)
    setTimeout(() => {
      const mockNetworks = [
        { 
          id: '1', 
          ssid: 'FLYQ-Drone-001', 
          signal: -45, 
          secured: true,
          frequency: '2.4 GHz',
          isDrone: true,
        },
        { 
          id: '2', 
          ssid: 'FLYQ-Drone-002', 
          signal: -55, 
          secured: true,
          frequency: '5 GHz',
          isDrone: true,
        },
        { 
          id: '3', 
          ssid: 'Home-WiFi', 
          signal: -65, 
          secured: true,
          frequency: '2.4 GHz',
          isDrone: false,
        },
        { 
          id: '4', 
          ssid: 'Guest-Network', 
          signal: -75, 
          secured: false,
          frequency: '2.4 GHz',
          isDrone: false,
        },
      ];
      
      setNetworks(mockNetworks);
      setIsScanning(false);
    }, 2000);
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

  const attemptConnection = (network) => {
    Alert.alert(
      'Connecting...',
      `Attempting to connect to ${network.ssid}`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            // In real app, use native WiFi connection module
            Alert.alert(
              'Success!',
              `Connected to ${network.ssid}`,
              [
                { 
                  text: 'Go to Control', 
                  onPress: () => navigation.navigate('Control')
                },
              ]
            );
          }
        },
      ]
    );
  };

  const getSignalStrength = (signal) => {
    if (signal > -50) return { text: 'Excellent', color: '#4CAF50', bars: '▂▄▆█' };
    if (signal > -60) return { text: 'Good', color: '#8BC34A', bars: '▂▄▆' };
    if (signal > -70) return { text: 'Fair', color: '#FFC107', bars: '▂▄' };
    return { text: 'Weak', color: '#F44336', bars: '▂' };
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
        style={styles.scanButton}
        onPress={scanForNetworks}
        disabled={isScanning}
        activeOpacity={0.7}
      >
        {isScanning ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.scanButtonText}>
            📡 {networks.length > 0 ? 'Refresh Networks' : 'Scan for Networks'}
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
