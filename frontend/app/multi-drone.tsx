import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDroneStore, DroneConnection } from '../store/droneStore';

export default function MultiDroneScreen() {
  const store = useDroneStore();
  const [scanningDrones, setScanningDrones] = useState(false);

  const handleScanDrones = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanningDrones(true);

    // Simulate scanning for drones
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add simulated drones (in production, this would scan WiFi networks)
    const mockDrones: DroneConnection[] = [
      {
        id: 'drone-1',
        name: 'FLYQ Vision #1',
        ip: '192.168.4.1',
        ssid: 'FLYQ_Vision_01',
        model: 'FLYQ_Vision',
        connected: false,
        batteryPercentage: 85,
      },
      {
        id: 'drone-2',
        name: 'FLYQ Air #2',
        ip: '192.168.4.2',
        ssid: 'FLYQ_Air_02',
        model: 'FLYQ_Air',
        connected: false,
        batteryPercentage: 92,
      },
    ];

    mockDrones.forEach(drone => {
      if (!store.connectedDrones.find(d => d.id === drone.id)) {
        store.addDrone(drone);
      }
    });

    setScanningDrones(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Scan Complete', `Found ${mockDrones.length} drones`);
  };

  const handleConnectDrone = async (droneId: string) => {
    const drone = store.connectedDrones.find(d => d.id === droneId);
    if (!drone) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));

    store.updateDroneStatus(droneId, { connected: true });
    
    if (!store.activeDroneId) {
      store.setActiveDrone(droneId);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Connected', `Connected to ${drone.name}`);
  };

  const handleDisconnectDrone = (droneId: string) => {
    const drone = store.connectedDrones.find(d => d.id === droneId);
    if (!drone) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Disconnect Drone',
      `Disconnect from ${drone.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            store.updateDroneStatus(droneId, { connected: false });
            if (store.activeDroneId === droneId) {
              const nextDrone = store.connectedDrones.find(d => d.connected && d.id !== droneId);
              store.setActiveDrone(nextDrone?.id || null);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleSetActiveDrone = (droneId: string) => {
    const drone = store.connectedDrones.find(d => d.id === droneId);
    if (!drone || !drone.connected) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    store.setActiveDrone(droneId);
    Alert.alert('Active Drone', `${drone.name} is now active`);
  };

  const handleRemoveDrone = (droneId: string) => {
    const drone = store.connectedDrones.find(d => d.id === droneId);
    if (!drone) return;

    Alert.alert(
      'Remove Drone',
      `Remove ${drone.name} from list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            store.removeDrone(droneId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleSwarmMode = () => {
    const connectedDrones = store.connectedDrones.filter(d => d.connected);
    
    if (connectedDrones.length < 2) {
      Alert.alert('Swarm Mode', 'Connect at least 2 drones to enable swarm mode.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Swarm Mode',
      `Control ${connectedDrones.length} drones simultaneously?\n\nAll drones will respond to your commands in formation.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enable Swarm',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Swarm Active', `${connectedDrones.length} drones in formation`);
          },
        },
      ]
    );
  };

  const connectedCount = store.connectedDrones.filter(d => d.connected).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <MaterialCommunityIcons name="quadcopter" size={24} color="#9C27B0" />
          <Text style={styles.titleText}>Multi-Drone Manager</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>{store.connectedDrones.length}</Text>
              <Text style={styles.statusLabel}>Total Drones</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusValue, { color: '#4CAF50' }]}>{connectedCount}</Text>
              <Text style={styles.statusLabel}>Connected</Text>
            </View>
            <View style={styles.statusItem}>
              <MaterialCommunityIcons 
                name={store.activeDroneId ? "check-circle" : "minus-circle"} 
                size={32} 
                color={store.activeDroneId ? "#4CAF50" : "#666"} 
              />
              <Text style={styles.statusLabel}>Active</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleScanDrones} 
            style={styles.scanButton}
            disabled={scanningDrones}
          >
            <MaterialCommunityIcons 
              name={scanningDrones ? "radar" : "access-point-network"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.scanButtonText}>
              {scanningDrones ? 'Scanning...' : 'Scan for Drones'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Drone List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connected Drones</Text>
            {connectedCount >= 2 && (
              <TouchableOpacity onPress={handleSwarmMode} style={styles.swarmButton}>
                <MaterialCommunityIcons name="flag-triangle" size={16} color="#fff" />
                <Text style={styles.swarmButtonText}>Swarm Mode</Text>
              </TouchableOpacity>
            )}
          </View>

          {store.connectedDrones.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="quadcopter" size={64} color="#666" />
              <Text style={styles.emptyText}>No Drones Found</Text>
              <Text style={styles.emptySubtext}>Tap "Scan for Drones" to discover nearby drones</Text>
            </View>
          ) : (
            <View style={styles.dronesList}>
              {store.connectedDrones.map((drone) => (
                <View 
                  key={drone.id} 
                  style={[
                    styles.droneCard,
                    drone.id === store.activeDroneId && styles.droneCardActive
                  ]}
                >
                  {/* Active Indicator */}
                  {drone.id === store.activeDroneId && (
                    <View style={styles.activeIndicator}>
                      <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                    </View>
                  )}

                  {/* Drone Icon */}
                  <View style={styles.droneIcon}>
                    <MaterialCommunityIcons 
                      name="quadcopter" 
                      size={40} 
                      color={drone.connected ? "#9C27B0" : "#666"} 
                    />
                    {drone.connected && (
                      <View style={styles.connectedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      </View>
                    )}
                  </View>

                  {/* Drone Info */}
                  <View style={styles.droneContent}>
                    <Text style={styles.droneName}>{drone.name}</Text>
                    <Text style={styles.droneModel}>{drone.model}</Text>
                    <View style={styles.droneDetails}>
                      <View style={styles.droneDetailItem}>
                        <Ionicons name="wifi" size={14} color="#2196F3" />
                        <Text style={styles.droneDetailText}>{drone.ssid}</Text>
                      </View>
                      <View style={styles.droneDetailItem}>
                        <Ionicons name="battery-half" size={14} color="#4CAF50" />
                        <Text style={styles.droneDetailText}>{drone.batteryPercentage}%</Text>
                      </View>
                    </View>
                  </View>

                  {/* Drone Actions */}
                  <View style={styles.droneActions}>
                    {!drone.connected ? (
                      <TouchableOpacity
                        onPress={() => handleConnectDrone(drone.id)}
                        style={styles.connectButton}
                      >
                        <Ionicons name="link" size={18} color="#fff" />
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => handleSetActiveDrone(drone.id)}
                          style={[
                            styles.actionButton,
                            drone.id === store.activeDroneId && styles.actionButtonActive
                          ]}
                        >
                          <MaterialCommunityIcons 
                            name={drone.id === store.activeDroneId ? "star" : "star-outline"} 
                            size={20} 
                            color={drone.id === store.activeDroneId ? "#FFD700" : "#fff"} 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDisconnectDrone(drone.id)}
                          style={styles.disconnectButton}
                        >
                          <Ionicons name="close" size={18} color="#fff" />
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity
                      onPress={() => handleRemoveDrone(drone.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash" size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#9C27B0" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Multi-Drone Management</Text>
            <Text style={styles.infoText}>
              Connect and control up to 4 drones simultaneously. Set one as active for individual 
              control, or enable Swarm Mode to command all drones in formation. Each drone maintains 
              independent telemetry and battery monitoring.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statusItem: {
    alignItems: 'center',
    gap: 8,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C27B0',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  swarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  swarmButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  dronesList: {
    gap: 12,
  },
  droneCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  droneCardActive: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 6,
    borderRadius: 12,
  },
  droneIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  connectedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  droneContent: {
    flex: 1,
  },
  droneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  droneModel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  droneDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  droneDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  droneDetailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  droneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  disconnectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C27B0',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 20,
  },
});
