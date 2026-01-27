import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDroneStore } from '../store/droneStore';

export default function GesturesScreen() {
  const store = useDroneStore();
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [gesturesEnabled, setGesturesEnabled] = useState(false);
  
  // Individual gesture toggles
  const [shakeEnabled, setShakeEnabled] = useState(true);
  const [tiltEnabled, setTiltEnabled] = useState(true);
  const [rotateEnabled, setRotateEnabled] = useState(true);
  const [swipeEnabled, setSwipeEnabled] = useState(false);
  
  // Gesture detection simulation
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [gestureCount, setGestureCount] = useState(0);

  useEffect(() => {
    // Simulate gesture detection when enabled
    if (gesturesEnabled && store.connected) {
      const interval = setInterval(() => {
        // Random gesture detection simulation
        const gestures = ['shake', 'tilt-forward', 'tilt-back', 'rotate-left', 'rotate-right'];
        const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
        
        if (Math.random() > 0.7) { // 30% chance per second
          handleGestureDetected(randomGesture);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [gesturesEnabled, store.connected]);

  const handleGestureDetected = (gesture: string) => {
    setLastGesture(gesture);
    setGestureCount(prev => prev + 1);
    
    // Map gesture to drone action
    switch (gesture) {
      case 'shake':
        if (shakeEnabled) {
          Alert.alert('Gesture Detected', 'Shake - Emergency Stop');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        break;
      case 'tilt-forward':
        if (tiltEnabled) {
          console.log('Tilt Forward - Move Forward');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        break;
      case 'tilt-back':
        if (tiltEnabled) {
          console.log('Tilt Back - Move Backward');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        break;
      case 'rotate-left':
        if (rotateEnabled) {
          console.log('Rotate Left - Yaw Left');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        break;
      case 'rotate-right':
        if (rotateEnabled) {
          console.log('Rotate Right - Yaw Right');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        break;
    }
  };

  const handleToggleGestures = (enabled: boolean) => {
    if (enabled && !store.connected) {
      Alert.alert('Not Connected', 'Please connect to your drone first.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (enabled) {
      Alert.alert(
        'Enable Gesture Control',
        'Physical phone movements will control your drone. Make sure you have a firm grip!',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setGesturesEnabled(true);
              store.setGestureControlEnabled(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    } else {
      setGesturesEnabled(false);
      store.setGestureControlEnabled(false);
    }
  };

  const handleCalibrate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsCalibrating(true);

    // Simulate calibration
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsCalibrating(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Calibration Complete', 'Gesture sensors calibrated successfully');
  };

  const handleTestGesture = (gesture: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleGestureDetected(gesture);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <MaterialCommunityIcons name="hand-wave" size={24} color="#00BCD4" />
          <Text style={styles.titleText}>Gesture Controls</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Master Toggle */}
        <View style={styles.masterToggle}>
          <View style={styles.masterToggleInfo}>
            <MaterialCommunityIcons name="hand-wave" size={32} color="#00BCD4" />
            <View style={styles.masterToggleText}>
              <Text style={styles.masterToggleTitle}>Gesture Control</Text>
              <Text style={styles.masterToggleSubtitle}>
                {gesturesEnabled ? 'Active - Move phone to control' : 'Disabled'}
              </Text>
            </View>
          </View>
          <Switch
            value={gesturesEnabled}
            onValueChange={handleToggleGestures}
            trackColor={{ false: '#767577', true: '#00BCD4' }}
            thumbColor={gesturesEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Status Card */}
        {gesturesEnabled && (
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <MaterialCommunityIcons name="gesture" size={24} color="#00BCD4" />
                <Text style={styles.statusValue}>{gestureCount}</Text>
                <Text style={styles.statusLabel}>Gestures Detected</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="hand-left" size={24} color="#4CAF50" />
                <Text style={styles.statusValue}>{lastGesture || '—'}</Text>
                <Text style={styles.statusLabel}>Last Gesture</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gesture Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Gestures</Text>

          {/* Shake Emergency Stop */}
          <View style={styles.gestureCard}>
            <View style={styles.gestureIcon}>
              <MaterialCommunityIcons name="alarm-light" size={32} color="#F44336" />
            </View>
            <View style={styles.gestureContent}>
              <Text style={styles.gestureTitle}>Shake Emergency Stop</Text>
              <Text style={styles.gestureDescription}>
                Shake phone vigorously to trigger emergency stop
              </Text>
              <View style={styles.gestureDetails}>
                <Ionicons name="shield-checkmark" size={14} color="#F44336" />
                <Text style={styles.detailText}>Safety feature - Always enabled</Text>
              </View>
            </View>
            <View style={styles.gestureToggle}>
              <Switch
                value={shakeEnabled}
                onValueChange={setShakeEnabled}
                trackColor={{ false: '#767577', true: '#F44336' }}
                thumbColor={shakeEnabled ? '#fff' : '#f4f3f4'}
                disabled={!gesturesEnabled}
              />
            </View>
          </View>

          {/* Tilt Controls */}
          <View style={styles.gestureCard}>
            <View style={styles.gestureIcon}>
              <MaterialCommunityIcons name="axis-arrow" size={32} color="#2196F3" />
            </View>
            <View style={styles.gestureContent}>
              <Text style={styles.gestureTitle}>Tilt Controls</Text>
              <Text style={styles.gestureDescription}>
                Tilt phone forward/backward to move drone
              </Text>
              <View style={styles.gestureDetails}>
                <Ionicons name="trending-up" size={14} color="#2196F3" />
                <Text style={styles.detailText}>Pitch control - Sensitivity {store.gestureTiltSensitivity.toFixed(1)}x</Text>
              </View>
            </View>
            <View style={styles.gestureToggle}>
              <Switch
                value={tiltEnabled}
                onValueChange={setTiltEnabled}
                trackColor={{ false: '#767577', true: '#2196F3' }}
                thumbColor={tiltEnabled ? '#fff' : '#f4f3f4'}
                disabled={!gesturesEnabled}
              />
            </View>
          </View>

          {/* Rotate Controls */}
          <View style={styles.gestureCard}>
            <View style={styles.gestureIcon}>
              <MaterialCommunityIcons name="rotate-3d-variant" size={32} color="#9C27B0" />
            </View>
            <View style={styles.gestureContent}>
              <Text style={styles.gestureTitle}>Rotate Controls</Text>
              <Text style={styles.gestureDescription}>
                Rotate phone left/right to yaw drone
              </Text>
              <View style={styles.gestureDetails}>
                <Ionicons name="sync" size={14} color="#9C27B0" />
                <Text style={styles.detailText}>Yaw control</Text>
              </View>
            </View>
            <View style={styles.gestureToggle}>
              <Switch
                value={rotateEnabled}
                onValueChange={setRotateEnabled}
                trackColor={{ false: '#767577', true: '#9C27B0' }}
                thumbColor={rotateEnabled ? '#fff' : '#f4f3f4'}
                disabled={!gesturesEnabled}
              />
            </View>
          </View>

          {/* Swipe Controls */}
          <View style={styles.gestureCard}>
            <View style={styles.gestureIcon}>
              <MaterialCommunityIcons name="gesture-swipe" size={32} color="#FF9800" />
            </View>
            <View style={styles.gestureContent}>
              <Text style={styles.gestureTitle}>Swipe Controls</Text>
              <Text style={styles.gestureDescription}>
                Swipe screen to move drone left/right
              </Text>
              <View style={styles.gestureDetails}>
                <Ionicons name="swap-horizontal" size={14} color="#FF9800" />
                <Text style={styles.detailText}>Roll control - Experimental</Text>
              </View>
            </View>
            <View style={styles.gestureToggle}>
              <Switch
                value={swipeEnabled}
                onValueChange={setSwipeEnabled}
                trackColor={{ false: '#767577', true: '#FF9800' }}
                thumbColor={swipeEnabled ? '#fff' : '#f4f3f4'}
                disabled={!gesturesEnabled}
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calibration & Testing</Text>

          <TouchableOpacity
            onPress={handleCalibrate}
            style={[styles.actionButton, isCalibrating && styles.actionButtonDisabled]}
            disabled={isCalibrating}
          >
            <MaterialCommunityIcons 
              name={isCalibrating ? "refresh" : "tune"} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>
              {isCalibrating ? 'Calibrating...' : 'Calibrate Sensors'}
            </Text>
          </TouchableOpacity>

          {gesturesEnabled && (
            <View style={styles.testButtons}>
              <Text style={styles.testTitle}>Test Gestures:</Text>
              <View style={styles.testButtonsRow}>
                <TouchableOpacity
                  onPress={() => handleTestGesture('shake')}
                  style={styles.testButton}
                >
                  <MaterialCommunityIcons name="alarm-light" size={20} color="#F44336" />
                  <Text style={styles.testButtonText}>Shake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTestGesture('tilt-forward')}
                  style={styles.testButton}
                >
                  <Ionicons name="arrow-up" size={20} color="#2196F3" />
                  <Text style={styles.testButtonText}>Tilt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTestGesture('rotate-left')}
                  style={styles.testButton}
                >
                  <Ionicons name="sync" size={20} color="#9C27B0" />
                  <Text style={styles.testButtonText}>Rotate</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Safety First</Text>
            <Text style={styles.infoText}>
              Gesture controls use your phone's accelerometer and gyroscope. Always maintain 
              a firm grip on your device. Shake gesture is always active as an emergency stop 
              for safety. Practice in an open area before using near obstacles.
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
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  masterToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  masterToggleText: {
    flex: 1,
  },
  masterToggleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  masterToggleSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
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
  },
  statusItem: {
    alignItems: 'center',
    gap: 8,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  gestureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gestureIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gestureContent: {
    flex: 1,
  },
  gestureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  gestureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  gestureDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  gestureToggle: {
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButtons: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
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
