import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDroneStore } from '../store/droneStore';

const { width } = Dimensions.get('window');

export default function FeaturesScreen() {
  const store = useDroneStore();
  
  // v2.1 Features State
  const [cameraStreaming, setCameraStreaming] = useState(false);
  const [flightRecording, setFlightRecording] = useState(false);
  const [multiDroneMode, setMultiDroneMode] = useState(false);
  const [gestureControl, setGestureControl] = useState(false);
  
  // v3.0 Features State (Future)
  const [fpvMode, setFpvMode] = useState(false);
  const [advancedGraphs, setAdvancedGraphs] = useState(false);
  const [autoFlight, setAutoFlight] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState(false);

  const handleFeatureToggle = (feature: string, enabled: boolean, setter: (val: boolean) => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (enabled) {
      Alert.alert(
        `Enable ${feature}?`,
        'This feature is currently in beta. Some functionality may be limited.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setter(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    } else {
      setter(false);
    }
  };

  const handleOpenFeature = (feature: string, route?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (route) {
      router.push(route as any);
    } else {
      Alert.alert(
        `${feature}`,
        'This feature will be available soon!\n\nStay tuned for the next update.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Features</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Version 2.1 Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>v2.1 Features</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BETA</Text>
            </View>
          </View>

          {/* Camera Streaming */}
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => handleOpenFeature('Camera Stream', '/camera')}
          >
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="video-wireless" size={32} color="#2196F3" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Camera Streaming</Text>
              <Text style={styles.featureDescription}>
                Live HD video feed from FLYQ Vision drone
              </Text>
              <View style={styles.featureDetails}>
                <Ionicons name="videocam" size={14} color="#4CAF50" />
                <Text style={styles.detailText}>720p @ 30fps</Text>
              </View>
            </View>
            <View style={styles.featureToggle}>
              <Switch
                value={cameraStreaming}
                onValueChange={(val) => handleFeatureToggle('Camera Streaming', val, setCameraStreaming)}
                trackColor={{ false: '#767577', true: '#2196F3' }}
                thumbColor={cameraStreaming ? '#fff' : '#f4f3f4'}
              />
            </View>
          </TouchableOpacity>

          {/* Flight Path Recording */}
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => handleOpenFeature('Flight Path Recording', '/recording')}
          >
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="map-marker-path" size={32} color="#FF9800" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Flight Path Recording</Text>
              <Text style={styles.featureDescription}>
                Record and replay flight patterns
              </Text>
              <View style={styles.featureDetails}>
                <Ionicons name="analytics" size={14} color="#FF9800" />
                <Text style={styles.detailText}>GPS tracking & telemetry</Text>
              </View>
            </View>
            <View style={styles.featureToggle}>
              <Switch
                value={flightRecording}
                onValueChange={(val) => handleFeatureToggle('Flight Recording', val, setFlightRecording)}
                trackColor={{ false: '#767577', true: '#FF9800' }}
                thumbColor={flightRecording ? '#fff' : '#f4f3f4'}
              />
            </View>
          </TouchableOpacity>

          {/* Multiple Drone Management */}
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => handleOpenFeature('Multi-Drone Manager', '/multi-drone')}
          >
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="quadcopter" size={32} color="#9C27B0" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Multiple Drone Management</Text>
              <Text style={styles.featureDescription}>
                Control up to 4 drones simultaneously
              </Text>
              <View style={styles.featureDetails}>
                <MaterialCommunityIcons name="devices" size={14} color="#9C27B0" />
                <Text style={styles.detailText}>Swarm coordination</Text>
              </View>
            </View>
            <View style={styles.featureToggle}>
              <Switch
                value={multiDroneMode}
                onValueChange={(val) => handleFeatureToggle('Multi-Drone Mode', val, setMultiDroneMode)}
                trackColor={{ false: '#767577', true: '#9C27B0' }}
                thumbColor={multiDroneMode ? '#fff' : '#f4f3f4'}
              />
            </View>
          </TouchableOpacity>

          {/* Gesture Controls */}
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => handleOpenFeature('Gesture Controls', '/gestures')}
          >
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="hand-wave" size={32} color="#00BCD4" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Gesture Controls</Text>
              <Text style={styles.featureDescription}>
                Control drone with hand gestures
              </Text>
              <View style={styles.featureDetails}>
                <Ionicons name="hand-left" size={14} color="#00BCD4" />
                <Text style={styles.detailText}>Shake, tilt & swipe</Text>
              </View>
            </View>
            <View style={styles.featureToggle}>
              <Switch
                value={gestureControl}
                onValueChange={(val) => handleFeatureToggle('Gesture Control', val, setGestureControl)}
                trackColor={{ false: '#767577', true: '#00BCD4' }}
                thumbColor={gestureControl ? '#fff' : '#f4f3f4'}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Version 3.0 Features (Future) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>v3.0 Features</Text>
            <View style={[styles.badge, styles.badgeFuture]}>
              <Text style={styles.badgeText}>COMING SOON</Text>
            </View>
          </View>

          {/* FPV Mode */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.featureCardDisabled]}
            onPress={() => handleOpenFeature('FPV Mode')}
          >
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="virtual-reality" size={32} color="#666" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, styles.featureTextDisabled]}>FPV Mode</Text>
              <Text style={[styles.featureDescription, styles.featureTextDisabled]}>
                First-person view with head tracking
              </Text>
              <View style={styles.featureDetails}>
                <Ionicons name="eye" size={14} color="#666" />
                <Text style={[styles.detailText, styles.featureTextDisabled]}>
                  Low latency immersive view
                </Text>
              </View>
            </View>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Advanced Telemetry Graphs */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.featureCardDisabled]}
            onPress={() => handleOpenFeature('Telemetry Graphs')}
          >
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="chart-line" size={32} color="#666" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, styles.featureTextDisabled]}>
                Advanced Telemetry Graphs
              </Text>
              <Text style={[styles.featureDescription, styles.featureTextDisabled]}>
                Real-time charts and analytics
              </Text>
              <View style={styles.featureDetails}>
                <Ionicons name="stats-chart" size={14} color="#666" />
                <Text style={[styles.detailText, styles.featureTextDisabled]}>
                  Performance metrics
                </Text>
              </View>
            </View>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Automated Flight Patterns */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.featureCardDisabled]}
            onPress={() => handleOpenFeature('Automated Flight')}
          >
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="robot" size={32} color="#666" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, styles.featureTextDisabled]}>
                Automated Flight Patterns
              </Text>
              <Text style={[styles.featureDescription, styles.featureTextDisabled]}>
                Pre-programmed flight routines
              </Text>
              <View style={styles.featureDetails}>
                <MaterialCommunityIcons name="orbit" size={14} color="#666" />
                <Text style={[styles.detailText, styles.featureTextDisabled]}>
                  Circle, waypoint & follow
                </Text>
              </View>
            </View>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Voice Commands */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.featureCardDisabled]}
            onPress={() => handleOpenFeature('Voice Commands')}
          >
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="microphone" size={32} color="#666" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, styles.featureTextDisabled]}>Voice Commands</Text>
              <Text style={[styles.featureDescription, styles.featureTextDisabled]}>
                Hands-free voice control
              </Text>
              <View style={styles.featureDetails}>
                <Ionicons name="mic" size={14} color="#666" />
                <Text style={[styles.detailText, styles.featureTextDisabled]}>
                  Natural language processing
                </Text>
              </View>
            </View>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Beta Features</Text>
            <Text style={styles.infoText}>
              v2.1 features are currently in beta testing. Enable them to try out new 
              functionality. Some features may require additional hardware or setup.
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
    fontSize: 20,
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
    marginBottom: 32,
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
  },
  badge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeFuture: {
    backgroundColor: '#666',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureCardDisabled: {
    opacity: 0.5,
  },
  featureIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  featureDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  featureTextDisabled: {
    color: '#666',
  },
  featureToggle: {
    justifyContent: 'center',
  },
  lockIcon: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
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
