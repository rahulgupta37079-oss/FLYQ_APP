import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDroneStore } from '../store/droneStore';

const { width } = Dimensions.get('window');

export default function RecordingScreen() {
  const store = useDroneStore();
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Recording timer
    if (store.flightRecordingActive) {
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        
        // Add flight path point every second (simulated GPS data)
        const point = {
          timestamp: Date.now(),
          latitude: 37.7749 + (Math.random() - 0.5) * 0.001,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.001,
          altitude: 10 + Math.random() * 5,
          roll: store.roll,
          pitch: store.pitch,
          yaw: store.yaw,
          thrust: store.thrust,
          batteryVoltage: store.batteryVoltage,
        };
        store.addFlightPathPoint(point);
      }, 1000);
      
      setRecordingInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    } else {
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
      setRecordingTime(0);
    }
  }, [store.flightRecordingActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    if (!store.connected) {
      Alert.alert('Not Connected', 'Please connect to your drone first.');
      return;
    }

    if (!store.armed) {
      Alert.alert('Drone Not Armed', 'Please arm your drone before recording.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    store.startFlightRecording();
  };

  const handleStopRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.prompt(
      'Save Flight Path',
      'Enter a name for this flight recording',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            store.stopFlightRecording();
            store.clearCurrentFlightPath();
          },
        },
        {
          text: 'Save',
          onPress: (name) => {
            if (name && name.trim()) {
              store.saveCurrentFlightPath(name.trim());
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Saved', `Flight path "${name}" saved successfully`);
            } else {
              store.stopFlightRecording();
              store.clearCurrentFlightPath();
            }
          },
        },
      ],
      'plain-text',
      `Flight ${new Date().toLocaleTimeString()}`
    );
  };

  const handleLoadPath = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const path = store.savedFlightPaths.find(p => p.id === id);
    if (path) {
      Alert.alert(
        'Load Flight Path',
        `Load "${path.name}"?\n\n${path.points.length} waypoints\nDuration: ${Math.floor(path.points.length / 60)}m ${path.points.length % 60}s`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Load',
            onPress: () => {
              store.loadFlightPath(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    }
  };

  const handleDeletePath = (id: string) => {
    const path = store.savedFlightPaths.find(p => p.id === id);
    if (path) {
      Alert.alert(
        'Delete Flight Path',
        `Delete "${path.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              store.deleteFlightPath(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    }
  };

  const handleReplayPath = () => {
    if (store.currentFlightPath.length === 0) {
      Alert.alert('No Path', 'Load a flight path first to replay it.');
      return;
    }

    Alert.alert(
      'Replay Flight Path',
      `Replay loaded path with ${store.currentFlightPath.length} waypoints?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replay',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Replaying', 'Flight path replay started');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <MaterialCommunityIcons name="map-marker-path" size={24} color="#FF9800" />
          <Text style={styles.titleText}>Flight Recording</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Current Recording Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Recording</Text>
          
          <View style={styles.recordingCard}>
            {store.flightRecordingActive ? (
              <>
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>RECORDING</Text>
                </View>
                
                <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
                
                <View style={styles.recordingStats}>
                  <View style={styles.statBox}>
                    <Ionicons name="location" size={20} color="#FF9800" />
                    <Text style={styles.statValue}>{store.currentFlightPath.length}</Text>
                    <Text style={styles.statLabel}>Waypoints</Text>
                  </View>
                  
                  <View style={styles.statBox}>
                    <Ionicons name="battery-half" size={20} color="#4CAF50" />
                    <Text style={styles.statValue}>{store.batteryPercentage}%</Text>
                    <Text style={styles.statLabel}>Battery</Text>
                  </View>
                  
                  <View style={styles.statBox}>
                    <Ionicons name="trending-up" size={20} color="#2196F3" />
                    <Text style={styles.statValue}>{store.thrust.toFixed(0)}%</Text>
                    <Text style={styles.statLabel}>Thrust</Text>
                  </View>
                </View>
                
                <TouchableOpacity onPress={handleStopRecording} style={styles.stopRecordButton}>
                  <MaterialCommunityIcons name="stop-circle" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Stop & Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="map-marker-path" size={64} color="#666" />
                <Text style={styles.noRecordingText}>No Active Recording</Text>
                <Text style={styles.noRecordingSubtext}>
                  {store.connected ? 'Arm drone and start recording' : 'Connect to drone first'}
                </Text>
                
                <TouchableOpacity
                  onPress={handleStartRecording}
                  style={[
                    styles.startRecordButton,
                    (!store.connected || !store.armed) && styles.buttonDisabled
                  ]}
                  disabled={!store.connected || !store.armed}
                >
                  <MaterialCommunityIcons name="record-circle" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Start Recording</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Loaded Path Preview */}
          {!store.flightRecordingActive && store.currentFlightPath.length > 0 && (
            <View style={styles.loadedPathCard}>
              <View style={styles.loadedPathHeader}>
                <Ionicons name="documents" size={20} color="#2196F3" />
                <Text style={styles.loadedPathText}>
                  Loaded Path: {store.currentFlightPath.length} waypoints
                </Text>
              </View>
              <TouchableOpacity onPress={handleReplayPath} style={styles.replayButton}>
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={styles.replayButtonText}>Replay Path</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Saved Recordings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Recordings</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{store.savedFlightPaths.length}</Text>
            </View>
          </View>

          {store.savedFlightPaths.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="folder-open-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>No saved recordings</Text>
              <Text style={styles.emptySubtext}>Your recorded flights will appear here</Text>
            </View>
          ) : (
            <View style={styles.pathsList}>
              {store.savedFlightPaths.map((path) => (
                <View key={path.id} style={styles.pathCard}>
                  <View style={styles.pathIcon}>
                    <MaterialCommunityIcons name="map-marker-path" size={32} color="#FF9800" />
                  </View>
                  
                  <View style={styles.pathContent}>
                    <Text style={styles.pathName}>{path.name}</Text>
                    <Text style={styles.pathDate}>
                      {new Date(path.date).toLocaleString()}
                    </Text>
                    <View style={styles.pathDetails}>
                      <View style={styles.pathDetailItem}>
                        <Ionicons name="location" size={14} color="#FF9800" />
                        <Text style={styles.pathDetailText}>
                          {path.points.length} waypoints
                        </Text>
                      </View>
                      <View style={styles.pathDetailItem}>
                        <Ionicons name="time" size={14} color="#2196F3" />
                        <Text style={styles.pathDetailText}>
                          {Math.floor(path.points.length / 60)}m {path.points.length % 60}s
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.pathActions}>
                    <TouchableOpacity
                      onPress={() => handleLoadPath(path.id)}
                      style={styles.pathActionButton}
                    >
                      <Ionicons name="download" size={20} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletePath(path.id)}
                      style={styles.pathActionButton}
                    >
                      <Ionicons name="trash" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#FF9800" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Flight Path Recording</Text>
            <Text style={styles.infoText}>
              Records GPS coordinates, altitude, orientation, and control inputs during flight. 
              You can replay recorded paths or use them for automated flight patterns.
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recordingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F44336',
  },
  recordingText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recordingTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  recordingStats: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  noRecordingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  noRecordingSubtext: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  startRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  stopRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadedPathCard: {
    marginTop: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  loadedPathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  loadedPathText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  replayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#555',
  },
  pathsList: {
    gap: 12,
  },
  pathCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pathIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pathContent: {
    flex: 1,
  },
  pathName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  pathDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  pathDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  pathDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pathDetailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  pathActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pathActionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
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
