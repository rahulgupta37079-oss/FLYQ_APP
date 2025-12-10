import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const JOYSTICK_SIZE = Math.min(width, height) * 0.35;
const STICK_SIZE = JOYSTICK_SIZE * 0.35;
const MAX_DISTANCE = (JOYSTICK_SIZE - STICK_SIZE) / 2;

interface JoystickProps {
  onMove: (x: number, y: number) => void;
  onRelease?: () => void;
  autoCenter?: boolean;
  label?: string;
  disabled?: boolean;
}

export default function Joystick({
  onMove,
  onRelease,
  autoCenter = true,
  label = '',
  disabled = false,
}: JoystickProps) {
  const [active, setActive] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const lastHapticTime = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      
      onPanResponderGrant: () => {
        if (disabled) return;
        
        setActive(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      
      onPanResponderMove: (_, gesture) => {
        if (disabled) return;
        
        // Calculate distance from center
        const distance = Math.sqrt(gesture.dx ** 2 + gesture.dy ** 2);
        
        // Limit movement to MAX_DISTANCE
        if (distance <= MAX_DISTANCE) {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
        } else {
          // Constrain to circle boundary
          const angle = Math.atan2(gesture.dy, gesture.dx);
          const constrainedX = MAX_DISTANCE * Math.cos(angle);
          const constrainedY = MAX_DISTANCE * Math.sin(angle);
          pan.setValue({ x: constrainedX, y: constrainedY });
          
          // Haptic feedback at boundary
          const now = Date.now();
          if (now - lastHapticTime.current > 100) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            lastHapticTime.current = now;
          }
        }
        
        // Normalize values to -100 to +100
        const currentX = pan.x._value;
        const currentY = pan.y._value;
        const normalizedX = (currentX / MAX_DISTANCE) * 100;
        const normalizedY = -(currentY / MAX_DISTANCE) * 100; // Invert Y axis
        
        onMove(normalizedX, normalizedY);
      },
      
      onPanResponderRelease: () => {
        if (disabled) return;
        
        setActive(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        pan.flattenOffset();
        
        if (autoCenter) {
          // Spring back to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            speed: 20,
            bounciness: 8,
          }).start();
          
          onMove(0, 0);
        }
        
        if (onRelease) {
          onRelease();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.joystickBase, disabled && styles.disabled]}>
        {/* Crosshair guides */}
        <View style={styles.crosshairHorizontal} />
        <View style={styles.crosshairVertical} />
        
        {/* Center dot */}
        <View style={styles.centerDot} />
        
        {/* Movable stick */}
        <Animated.View
          style={[
            styles.stick,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
              ],
            },
            active && styles.stickActive,
            disabled && styles.stickDisabled,
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.stickInner} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.7,
  },
  joystickBase: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  disabled: {
    opacity: 0.3,
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
  },
  stick: {
    width: STICK_SIZE,
    height: STICK_SIZE,
    borderRadius: STICK_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  stickActive: {
    backgroundColor: 'rgba(100, 150, 255, 0.8)',
    transform: [{ scale: 1.1 }],
  },
  stickDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stickInner: {
    width: STICK_SIZE * 0.4,
    height: STICK_SIZE * 0.4,
    borderRadius: (STICK_SIZE * 0.4) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
