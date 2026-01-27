import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Joystick from '../components/Joystick';
import { useDroneStore } from '../store/droneStore';
import { CRTPProtocol } from '../utils/CRTPProtocol';
import { getUDPClient } from '../utils/UDPClient';

const { width, height } = Dimensions.get('window');
const CONTROL_LOOP_HZ = 50; // 50Hz control loop
const CONTROL_INTERVAL = 1000 / CONTROL_LOOP_HZ;

export default function ControllerScreen() {
  const store = useDroneStore();
  const [leftX, setLeftX] = useState(0); // Yaw
  const [leftY, setLeftY] = useState(0); // Thrust
  const [rightX, setRightX] = useState(0); // Roll
  const [rightY, setRightY] = useState(0); // Pitch
  const [showSettings, setShowSettings] = useState(false);
  const controlLoopRef = useRef<NodeJS.Timeout | null>(null);
  const udpClient = getUDPClient();

  // Lock to landscape orientation
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Start control loop
  useEffect(() => {
    if (store.connected) {
      startControlLoop();
    }
    
    return () => {
      stopControlLoop();
    };
  }, [store.connected, store.armed, leftX, leftY, rightX, rightY, store.rollTrim, store.pitchTrim]);

  const startControlLoop = () => {
    if (controlLoopRef.current) return;
    
    controlLoopRef.current = setInterval(() => {
      sendControlPacket();
    }, CONTROL_INTERVAL);
  };

  const stopControlLoop = () => {
    if (controlLoopRef.current) {
      clearInterval(controlLoopRef.current);
      controlLoopRef.current = null;
    }
  };

  const sendControlPacket = async () => {
    if (!store.connected || !store.armed) {
      // Send zero values when disarmed
      const packet = CRTPProtocol.createCommanderPacket(0, 0, 0, 0);
      await udpClient.sendPacket(packet);
      return;
    }

    // Apply sensitivity and trim
    const sensitivity = store.joystickSensitivity / 100;
    
    // Calculate control values with trim
    const roll = (rightX * sensitivity) + store.rollTrim;
    const pitch = (rightY * sensitivity) + store.pitchTrim;
    const yaw = leftX * sensitivity;
    const thrust = Math.max(0, leftY); // Only positive thrust

    // Convert to CRTP values
    const rollAngle = CRTPProtocol.percentageToAngle(roll, 30);
    const pitchAngle = CRTPProtocol.percentageToAngle(pitch, 30);
    const yawRate = CRTPProtocol.percentageToYawRate(yaw, 200);
    const thrustValue = CRTPProtocol.percentageToThrust(thrust);

    // Update store
    store.setControlValues(thrust, yaw, roll, pitch);

    // Create and send packet
    const packet = CRTPProtocol.createCommanderPacket(
      rollAngle,
      pitchAngle,
      yawRate,
      thrustValue
    );
    
    await udpClient.sendPacket(packet);
  };

  const handleArm = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'ARM Drone',
      'Are you sure you want to ARM the motors? Make sure the area is clear.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'ARM',
          style: 'destructive',
          onPress: async () => {
            const packet = CRTPProtocol.createArmPacket(true);
            await udpClient.sendPacket(packet);
            store.setArmed(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleDisarm = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const packet = CRTPProtocol.createArmPacket(false);
    await udpClient.sendPacket(packet);
    store.setArmed(false);
    store.resetControlValues();
    
    // Reset joystick values
    setLeftX(0);
    setLeftY(0);
    setRightX(0);
    setRightY(0);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleEmergencyStop = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Immediately disarm and send zero packet
    const packet = CRTPProtocol.createArmPacket(false);
    await udpClient.sendPacket(packet);
    store.setArmed(false);
    store.resetControlValues();
    
    setLeftX(0);
    setLeftY(0);
    setRightX(0);
    setRightY(0);
    
    Alert.alert('Emergency Stop', 'Drone has been disarmed!');
  };

  const handleCalibrate = async () => {
    if (store.armed) {
      Alert.alert('Cannot Calibrate', 'Please disarm the drone first.');
      return;
    }
    
    Alert.alert(
      'Calibrate Drone',
      'Place the drone on a flat surface and keep it still for 5 seconds.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            const packet = CRTPProtocol.createCalibratePacket();
            await udpClient.sendPacket(packet);
            Alert.alert('Calibrating', 'Keep drone still for 5 seconds...');
            
            setTimeout(() => {
              Alert.alert('Calibration Complete', 'Drone is calibrated!');
            }, 5000);
          },
        },
      ]
    );
  };

  const handleHeightHold = () => {
    store.setHeightHold(!store.heightHoldEnabled, store.targetHeight);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>FLYQ</Text>
          <View style={[styles.statusBadge, store.armed && styles.statusBadgeArmed]}>
            <Text style={styles.statusText}>{store.armed ? 'ARMED' : 'DISARMED'}</Text>
          </View>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => router.push('/features' as any)} style={styles.iconButton}>
            <MaterialIcons name="stars" size={24} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconButton}>
            <MaterialIcons name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main control area */}
      <View style={styles.controlArea}>
        {/* Left joystick - Thrust/Yaw */}
        <View style={styles.joystickContainer}>
          <Text style={styles.telemetryLabel}>THRUST</Text>
          <Text style={styles.telemetryValue}>{store.thrust.toFixed(0)}%</Text>
          <Text style={styles.telemetryLabel}>YAW</Text>
          <Text style={styles.telemetryValue}>{store.yaw.toFixed(0)}°/s</Text>
          
          <Joystick
            onMove={(x, y) => {
              setLeftX(x);
              setLeftY(y);
            }}
            autoCenter={false}
            label="THRUST/YAW"
            disabled={!store.armed}
          />
        </View>
        
        {/* Center info */}
        <View style={styles.centerInfo}>
          <View style={styles.connectionInfo}>
            <MaterialIcons name="wifi" size={20} color="#4CAF50" />
            <Text style={styles.connectionText}>{store.droneSSID || 'Connected'}</Text>
          </View>
          
          {store.heightHoldEnabled && (
            <View style={styles.heightHoldInfo}>
              <Ionicons name="move" size={20} color="#2196F3" />
              <Text style={styles.heightText}>{store.targetHeight}cm</Text>
            </View>
          )}
          
          <View style={styles.batteryInfo}>
            <Ionicons name="battery-full" size={24} color="#4CAF50" />
            <Text style={styles.batteryText}>{store.batteryVoltage.toFixed(2)}V</Text>
          </View>
          
          {/* ARM/DISARM button */}
          {!store.armed ? (
            <TouchableOpacity style={styles.armButton} onPress={handleArm}>
              <Text style={styles.armButtonText}>ARM</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.disarmButton} onPress={handleDisarm}>
              <Text style={styles.disarmButtonText}>DISARM</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.debugButton} 
            onPress={() => store.setDebugMode(!store.debugMode)}
          >
            <Text style={styles.debugButtonText}>
              {store.debugMode ? 'Hide Debug' : 'Show Debug'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Right joystick - Roll/Pitch */}
        <View style={styles.joystickContainer}>
          <Text style={styles.telemetryLabel}>ROLL</Text>
          <Text style={styles.telemetryValue}>{store.roll.toFixed(0)}°</Text>
          <Text style={styles.telemetryLabel}>PITCH</Text>
          <Text style={styles.telemetryValue}>{store.pitch.toFixed(0)}°</Text>
          
          <Joystick
            onMove={(x, y) => {
              setRightX(x);
              setRightY(y);
            }}
            autoCenter={true}
            label="ROLL/PITCH"
            disabled={!store.armed}
          />
        </View>
      </View>
      
      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleHeightHold}>
          <Ionicons 
            name="move" 
            size={20} 
            color={store.heightHoldEnabled ? '#2196F3' : '#fff'} 
          />
          <Text style={[styles.controlButtonText, store.heightHoldEnabled && styles.activeText]}>
            Height Hold
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyStop}>
          <MaterialIcons name="stop" size={24} color="#fff" />
          <Text style={styles.emergencyButtonText}>EMERGENCY STOP</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleCalibrate} disabled={store.armed}>
          <MaterialIcons name="sync" size={20} color={store.armed ? '#666' : '#fff'} />
          <Text style={[styles.controlButtonText, store.armed && styles.disabledText]}>
            Calibrate
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Debug panel */}
      {store.debugMode && (
        <View style={styles.debugPanel}>
          <Text style={styles.debugText}>Left: X={leftX.toFixed(1)}, Y={leftY.toFixed(1)}</Text>
          <Text style={styles.debugText}>Right: X={rightX.toFixed(1)}, Y={rightY.toFixed(1)}</Text>
          <Text style={styles.debugText}>Sensitivity: {store.joystickSensitivity}</Text>
          <Text style={styles.debugText}>Trim: R={store.rollTrim}, P={store.pitchTrim}</Text>
        </View>
      )}
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
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeArmed: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  controlArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  joystickContainer: {
    alignItems: 'center',
  },
  telemetryLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginBottom: 2,
  },
  telemetryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  centerInfo: {
    alignItems: 'center',
    gap: 16,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connectionText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  heightHoldInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heightText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batteryText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  armButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  armButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disarmButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  disarmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugButton: {
    marginTop: 8,
    padding: 8,
  },
  debugButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  activeText: {
    color: '#2196F3',
  },
  disabledText: {
    color: '#666',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F44336',
    borderRadius: 16,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugPanel: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
  },
  debugText: {
    color: '#0f0',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
