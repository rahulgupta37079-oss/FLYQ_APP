import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import droneService from '../utils/DroneConnectionService';
import VideoBackground from '../components/VideoBackground';
import { useOrientation } from '../hooks/useOrientation';

const { width } = Dimensions.get('window');
const JOYSTICK_SIZE = 120;
const JOYSTICK_INNER_SIZE = 60;
const JOYSTICK_RANGE = 50;

function Joystick({ label, position, onMove }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      const x = Math.max(-JOYSTICK_RANGE, Math.min(JOYSTICK_RANGE, e.translationX));
      const y = Math.max(-JOYSTICK_RANGE, Math.min(JOYSTICK_RANGE, e.translationY));
      
      translateX.value = x;
      translateY.value = y;
      
      // Normalized values (-1 to 1)
      const normalizedX = x / JOYSTICK_RANGE;
      const normalizedY = -y / JOYSTICK_RANGE; // Invert Y axis
      
      // CRITICAL FIX: Use runOnJS to safely call JS functions from worklet
      if (onMove) {
        runOnJS(onMove)({ x: normalizedX, y: normalizedY });
      }
    })
    .onEnd(() => {
      'worklet';
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      
      // CRITICAL FIX: Use runOnJS for end callback
      if (onMove) {
        runOnJS(onMove)({ x: 0, y: 0 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={[styles.joystickContainer, position === 'left' ? styles.joystickLeft : styles.joystickRight]}>
      <Text style={styles.joystickLabel}>{label}</Text>
      <View style={styles.joystickOuter}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.joystickInner, animatedStyle]} />
        </GestureDetector>
      </View>
    </View>
  );
}

export default function ControlScreen() {
  const [isArmed, setIsArmed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [throttle, setThrottle] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [battery, setBattery] = useState(87);
  const [signal, setSignal] = useState(4);
  
  // Detect orientation changes
  const { isLandscape, isPortrait, width, height } = useOrientation();

  useEffect(() => {
    try {
      // Check connection status
      const status = droneService.getStatus();
      setIsConnected(status.isConnected);

      // Set up connection callback
      droneService.onConnectionChange((status) => {
        setIsConnected(status.connected);
      });

      // Set up telemetry callback
      droneService.onTelemetry((data) => {
        if (data) {
          setBattery(data.battery || 87);
          setSignal(data.signal || 4);
        }
      });

      // Start polling telemetry if connected
      const telemetryInterval = setInterval(async () => {
        try {
          if (droneService.getStatus().isConnected) {
            await droneService.getTelemetry();
          }
        } catch (error) {
          console.log('Telemetry poll error:', error);
        }
      }, 200); // 5Hz telemetry updates

      return () => {
        clearInterval(telemetryInterval);
      };
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert('Initialization Error', 'Failed to initialize drone controls');
    }
  }, []);

  const handleLeftJoystick = ({ x, y }) => {
    try {
      const throttleValue = Math.max(0, Math.min(1, (y + 1) / 2)); // 0 to 1
      const yawValue = x * 100; // -100 to 100
      
      setThrottle(throttleValue);
      setYaw(yawValue);
      
      // Update drone command
      if (isConnected && isArmed) {
        droneService.updateCommand({
          roll,
          pitch,
          yaw: yawValue,
          thrust: throttleValue * 65535, // Convert to 16-bit value
        });
      }
    } catch (error) {
      console.log('Left joystick error:', error);
    }
  };

  const handleRightJoystick = ({ x, y }) => {
    try {
      const rollValue = x * 30; // -30 to 30 degrees
      const pitchValue = y * 30; // -30 to 30 degrees
      
      setRoll(rollValue);
      setPitch(pitchValue);
      
      // Update drone command
      if (isConnected && isArmed) {
        droneService.updateCommand({
          roll: rollValue,
          pitch: pitchValue,
          yaw,
          thrust: throttle * 65535,
        });
      }
    } catch (error) {
      console.log('Right joystick error:', error);
    }
  };

  const handleArm = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to the drone first.');
      return;
    }

    Alert.alert(
      isArmed ? 'Disarm Drone?' : 'Arm Drone?',
      isArmed 
        ? 'This will stop all motors and disable flight controls.'
        : 'Make sure the area is clear before arming the drone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: isArmed ? 'Disarm' : 'Arm',
          style: isArmed ? 'default' : 'destructive',
          onPress: async () => {
            const result = await droneService.setArmed(!isArmed);
            if (result.success) {
              setIsArmed(!isArmed);
            } else {
              Alert.alert('Error', result.message || 'Failed to change arm state');
            }
          },
        },
      ]
    );
  };

  const handleTakeoff = () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to the drone first.');
      return;
    }
    if (!isArmed) {
      Alert.alert('Drone Not Armed', 'Please arm the drone before takeoff.');
      return;
    }
    Alert.alert('Takeoff', 'Initiating automated takeoff sequence...');
    // TODO: Implement auto-takeoff command
  };

  const handleLand = () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to the drone first.');
      return;
    }
    if (!isArmed) {
      Alert.alert('Drone Not Armed', 'Drone is already landed.');
      return;
    }
    Alert.alert('Landing', 'Initiating automated landing sequence...');
    // TODO: Implement auto-land command
  };

  const handleEmergencyStop = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Drone is not connected.');
      return;
    }

    Alert.alert(
      'Emergency Stop',
      'This will immediately stop all motors! Use only in emergencies.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'STOP NOW',
          style: 'destructive',
          onPress: async () => {
            await droneService.sendStopCommand();
            setIsArmed(false);
            setThrottle(0);
            setYaw(0);
            setPitch(0);
            setRoll(0);
            Alert.alert('Emergency Stop', 'All motors stopped!');
          },
        },
      ]
    );
  };

  const getSignalBars = () => {
    if (!isConnected) return '';
    if (signal >= 4) return '▂▄▆█';
    if (signal >= 3) return '▂▄▆';
    if (signal >= 2) return '▂▄';
    return '▂';
  };

  return (
    <VideoBackground 
      source={require('../../assets/drone_background.mp4')}
      opacity={0.15}
    >
      <GestureHandlerRootView style={styles.container}>
      {/* Status Bar */}
      <View style={[
        styles.statusBar, 
        isLandscape && styles.statusBarLandscape
      ]}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={[styles.statusValue, { color: isArmed ? '#4CAF50' : '#F44336' }]}>
            {isArmed ? '✓ ARMED' : '✗ DISARMED'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Connection</Text>
          <Text style={[styles.statusValue, { color: isConnected ? '#4CAF50' : '#666' }]}>
            {isConnected ? '✓ Connected' : '✗ Not Connected'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Battery</Text>
          <Text style={styles.statusValue}>{battery}%</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Signal</Text>
          <Text style={styles.statusValue}>{getSignalBars()}</Text>
        </View>
      </View>

      {/* Main Content - Different layout for landscape */}
      {isLandscape ? (
        // LANDSCAPE LAYOUT - Optimized for horizontal viewing
        <View style={styles.landscapeContainer}>
          {/* Left Side - Telemetry & Controls */}
          <View style={styles.landscapeLeftPanel}>
            {/* Telemetry Display */}
            <View style={styles.telemetryContainerLandscape}>
              <View style={styles.telemetryRow}>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>Throttle</Text>
                  <Text style={styles.telemetryValue}>
                    {(throttle * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>Yaw</Text>
                  <Text style={styles.telemetryValue}>
                    {yaw.toFixed(0)}°
                  </Text>
                </View>
              </View>
              <View style={styles.telemetryRow}>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>Pitch</Text>
                  <Text style={styles.telemetryValue}>
                    {pitch.toFixed(0)}°
                  </Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>Roll</Text>
                  <Text style={styles.telemetryValue}>
                    {roll.toFixed(0)}°
                  </Text>
                </View>
              </View>
            </View>

            {/* Control Buttons - Vertical in landscape */}
            <View style={styles.controlButtonsLandscape}>
              <TouchableOpacity
                style={[styles.controlButton, styles.takeoffButton]}
                onPress={handleTakeoff}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>🚀</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.landButton]}
                onPress={handleLand}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>🛬</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.armButton, isArmed && styles.armButtonActive]}
                onPress={handleArm}
                activeOpacity={0.7}
              >
                <Text style={styles.armButtonText}>
                  {isArmed ? '🔓' : '🔒'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emergencyButton}
                onPress={handleEmergencyStop}
                activeOpacity={0.7}
              >
                <Text style={styles.emergencyButtonText}>🛑</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Side - Joysticks */}
          <View style={styles.landscapeRightPanel}>
            <Joystick 
              label="Throttle / Yaw" 
              position="left"
              onMove={handleLeftJoystick}
            />
            <Joystick 
              label="Pitch / Roll" 
              position="right"
              onMove={handleRightJoystick}
            />
          </View>
        </View>
      ) : (
        // PORTRAIT LAYOUT - Original vertical layout
        <>
          {/* Telemetry Display */}
          <View style={styles.telemetryContainer}>
        <View style={styles.telemetryRow}>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>Throttle</Text>
            <Text style={styles.telemetryValue}>
              {(throttle * 100).toFixed(0)}%
            </Text>
          </View>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>Yaw</Text>
            <Text style={styles.telemetryValue}>
              {yaw.toFixed(0)}°
            </Text>
          </View>
        </View>
        <View style={styles.telemetryRow}>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>Pitch</Text>
            <Text style={styles.telemetryValue}>
              {pitch.toFixed(0)}°
            </Text>
          </View>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>Roll</Text>
            <Text style={styles.telemetryValue}>
              {roll.toFixed(0)}°
            </Text>
          </View>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        <TouchableOpacity
          style={[styles.controlButton, styles.takeoffButton]}
          onPress={handleTakeoff}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>🚀 TAKEOFF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.landButton]}
          onPress={handleLand}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>🛬 LAND</Text>
        </TouchableOpacity>
      </View>

      {/* Joysticks */}
      <View style={styles.joysticksContainer}>
        <Joystick 
          label="Throttle / Yaw" 
          position="left"
          onMove={handleLeftJoystick}
        />
        <Joystick 
          label="Pitch / Roll" 
          position="right"
          onMove={handleRightJoystick}
        />
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.armButton, isArmed && styles.armButtonActive]}
          onPress={handleArm}
          activeOpacity={0.7}
        >
          <Text style={styles.armButtonText}>
            {isArmed ? '🔓 DISARM' : '🔒 ARM'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyStop}
          activeOpacity={0.7}
        >
          <Text style={styles.emergencyButtonText}>🛑 EMERGENCY</Text>
        </TouchableOpacity>
      </View>
        </>
      )}
    </GestureHandlerRootView>
    </VideoBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Changed from '#000' to transparent for video
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  telemetryContainer: {
    padding: 16,
    backgroundColor: '#0a0a0a',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  telemetryItem: {
    alignItems: 'center',
    flex: 1,
  },
  telemetryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  telemetryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  takeoffButton: {
    backgroundColor: '#2196F3',
  },
  landButton: {
    backgroundColor: '#FF9800',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  joysticksContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  joystickContainer: {
    alignItems: 'center',
  },
  joystickLeft: {
    alignItems: 'flex-start',
  },
  joystickRight: {
    alignItems: 'flex-end',
  },
  joystickLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  joystickOuter: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickInner: {
    width: JOYSTICK_INNER_SIZE,
    height: JOYSTICK_INNER_SIZE,
    borderRadius: JOYSTICK_INNER_SIZE / 2,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#2E7D32',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  armButton: {
    flex: 1,
    backgroundColor: '#666',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  armButtonActive: {
    backgroundColor: '#4CAF50',
  },
  armButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // LANDSCAPE MODE STYLES
  statusBarLandscape: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapeLeftPanel: {
    width: '35%',
    padding: 12,
    justifyContent: 'space-between',
  },
  landscapeRightPanel: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  telemetryContainerLandscape: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  controlButtonsLandscape: {
    gap: 8,
  },
});
