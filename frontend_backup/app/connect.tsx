import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useDroneStore } from '../store/droneStore';
import { getUDPClient } from '../utils/UDPClient';

const DRONE_MODELS = [
  {
    id: 'FLYQ_Air',
    name: 'FLYQ Air',
    description: 'Basic flight control',
    icon: '✈️',
  },
  {
    id: 'FLYQ_Vision',
    name: 'FLYQ Vision',
    description: 'HD camera + streaming',
    icon: '📹',
  },
];

export default function ConnectScreen() {
  const store = useDroneStore();
  const [currentSSID, setCurrentSSID] = useState<string>('');
  const [isConnectedToWiFi, setIsConnectedToWiFi] = useState(false);
  const [isDroneNetwork, setIsDroneNetwork] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('FLYQ_Air');
  
  const udpClient = getUDPClient('http://localhost:8001'); // Will be updated with actual backend URL

  useEffect(() => {
    checkWiFiConnection();
    
    const unsubscribe = NetInfo.addEventListener(state => {
      checkWiFiConnection();
    });
    
    return () => unsubscribe();
  }, []);

  const checkWiFiConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      
      setIsConnectedToWiFi(state.isConnected === true && state.type === 'wifi');
      
      if (state.type === 'wifi' && state.details) {
        // @ts-ignore - WiFi details available on mobile
        const ssid = state.details.ssid || '';
        setCurrentSSID(ssid);
        
        // Check if it's a FLYQ/LiteWing drone network
        const isDrone = ssid.includes('FLYQ') || ssid.includes('LiteWing') || ssid.includes('Crazyflie');
        setIsDroneNetwork(isDrone);
        
        if (isDrone) {
          store.setDroneSSID(ssid);
        }
      } else {
        setCurrentSSID('');
        setIsDroneNetwork(false);
      }
    } catch (error) {
      console.error('Failed to check WiFi:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkWiFiConnection();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleConnect = async () => {
    if (!isDroneNetwork) {
      Alert.alert(
        'Not Connected to Drone',
        'Please connect to your FLYQ drone WiFi network first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'WiFi Settings', onPress: () => {
            // Platform-specific WiFi settings
            Alert.alert('WiFi Settings', 'Please go to your device WiFi settings and connect to your FLYQ drone network.');
          }},
        ]
      );
      return;
    }
    
    setConnecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Try to connect to drone
      const success = await udpClient.connect(store.droneIP, 2390);
      
      if (success) {
        store.setConnected(true);
        store.setDroneModel(selectedModel as any);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Navigate to controller
        router.push('/controller');
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Connection Failed',
        'Could not connect to drone. Make sure:\n\n' +
        '1. You are connected to the drone WiFi\n' +
        '2. The backend server is running\n' +
        '3. The drone is powered on\n\n' +
        'Error: ' + (error as Error).message
      );
    } finally {
      setConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="flight" size={48} color="#2196F3" />
          </View>
          <Text style={styles.title}>FLYQ Drone</Text>
          <Text style={styles.subtitle}>Controller</Text>
        </View>
        
        {/* WiFi Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="wifi" size={24} color="#fff" />
            <Text style={styles.sectionTitle}>WiFi Status</Text>
          </View>
          
          <View style={[styles.statusCard, isConnectedToWiFi && styles.statusCardConnected]}>
            {isConnectedToWiFi ? (
              <>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Connected to:</Text>
                  <Text style={styles.statusValue}>{currentSSID || 'Unknown'}</Text>
                </View>
                
                {isDroneNetwork && (
                  <View style={styles.droneDetectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.droneDetectedText}>Drone Network Detected!</Text>
                  </View>
                )}
                
                {!isDroneNetwork && (
                  <View style={styles.warningBadge}>
                    <MaterialIcons name="warning" size={20} color="#FF9800" />
                    <Text style={styles.warningText}>
                      Not a drone network. Connect to your FLYQ drone WiFi.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.statusRow}>
                <MaterialIcons name="wifi-off" size={24} color="#F44336" />
                <Text style={styles.statusValue}>Not connected to WiFi</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Available Networks (Simulated) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="router" size={24} color="#fff" />
            <Text style={styles.sectionTitle}>Available Drone Networks</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>
          
          {isDroneNetwork ? (
            <View style={styles.networkCard}>
              <MaterialIcons name="flight" size={32} color="#2196F3" />
              <View style={styles.networkInfo}>
                <Text style={styles.networkName}>{currentSSID}</Text>
                <Text style={styles.networkDescription}>FLYQ Drone</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.3)" />
            </View>
          ) : (
            <Text style={styles.noNetworksText}>
              No drone networks detected. Make sure your drone is powered on.
            </Text>
          )}
        </View>
        
        {/* Drone Model Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="category" size={24} color="#fff" />
            <Text style={styles.sectionTitle}>Select Drone Model</Text>
          </View>
          
          {DRONE_MODELS.map((model) => (
            <TouchableOpacity
              key={model.id}
              style={[
                styles.modelCard,
                selectedModel === model.id && styles.modelCardSelected,
              ]}
              onPress={() => {
                setSelectedModel(model.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.modelIcon}>{model.icon}</Text>
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>{model.name}</Text>
                <Text style={styles.modelDescription}>{model.description}</Text>
              </View>
              {selectedModel === model.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Connect Button */}
        <TouchableOpacity
          style={[styles.connectButton, !isDroneNetwork && styles.connectButtonDisabled]}
          onPress={handleConnect}
          disabled={!isDroneNetwork || connecting}
        >
          {connecting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="flight-takeoff" size={24} color="#fff" />
              <Text style={styles.connectButtonText}>Connect to Drone</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FLYQ Drone Controller v2.0</Text>
          <Text style={styles.footerSubtext}>Professional Edition</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  refreshButton: {
    padding: 4,
  },
  statusCard: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  statusCardConnected: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  droneDetectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 8,
  },
  droneDetectedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    color: '#FF9800',
    fontSize: 12,
  },
  networkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  networkDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  noNetworksText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    padding: 20,
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  modelCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  modelIcon: {
    fontSize: 32,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  modelDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 16,
    marginTop: 8,
  },
  connectButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
  },
});
