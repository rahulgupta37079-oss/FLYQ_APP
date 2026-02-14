import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

/**
 * Custom hook to detect and respond to orientation changes
 * Returns current orientation and screen dimensions
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    // Set initial orientation
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({ width, height });
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    // Initial check
    updateOrientation();

    // Listen for dimension changes
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    orientation,
    width: dimensions.width,
    height: dimensions.height,
    dimensions,
  };
};

/**
 * Lock orientation to specific mode
 */
export const lockOrientation = async (mode = 'ALL') => {
  try {
    const modes = {
      'PORTRAIT': ScreenOrientation.OrientationLock.PORTRAIT,
      'LANDSCAPE': ScreenOrientation.OrientationLock.LANDSCAPE,
      'LANDSCAPE_LEFT': ScreenOrientation.OrientationLock.LANDSCAPE_LEFT,
      'LANDSCAPE_RIGHT': ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT,
      'ALL': ScreenOrientation.OrientationLock.ALL,
    };
    
    await ScreenOrientation.lockAsync(modes[mode] || modes.ALL);
  } catch (error) {
    console.warn('Failed to lock orientation:', error);
  }
};

/**
 * Unlock orientation (allow all)
 */
export const unlockOrientation = async () => {
  try {
    await ScreenOrientation.unlockAsync();
  } catch (error) {
    console.warn('Failed to unlock orientation:', error);
  }
};
