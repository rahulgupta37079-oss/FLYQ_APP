import 'react-native-gesture-handler';
import './global-polyfills'; // Import Buffer polyfill FIRST
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import WiFiScreen from './src/screens/WiFiScreen';
import ControlScreen from './src/screens/ControlScreen';
import CameraScreen from './src/screens/CameraScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import ErrorBoundary and Permission Manager
import ErrorBoundary from './src/components/ErrorBoundary';
import permissionManager from './src/utils/PermissionManager';

const Stack = createNativeStackNavigator();

export default function App() {
  const [permissionsReady, setPermissionsReady] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    requestAppPermissions();
  }, []);

  const requestAppPermissions = async () => {
    // Request all permissions on app startup
    const result = await permissionManager.requestAllPermissions();
    setPermissionStatus(result);
    
    // Allow app to continue even if some permissions denied
    // User can grant them later from Settings
    setTimeout(() => {
      setPermissionsReady(true);
    }, 1000);
  };

  if (!permissionsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Requesting Permissions...</Text>
        <Text style={styles.loadingSubtext}>
          Please allow Location and Bluetooth{'\n'}
          for WiFi scanning and drone control
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1a1a1a',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              contentStyle: {
                backgroundColor: '#000',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'FLYQ Drone Controller' }}
            />
            <Stack.Screen 
              name="WiFi" 
              component={WiFiScreen}
              options={{ title: 'WiFi Connection' }}
            />
            <Stack.Screen 
              name="Control" 
              component={ControlScreen}
              options={{ title: 'Drone Control' }}
            />
            <Stack.Screen 
              name="Camera" 
              component={CameraScreen}
              options={{ title: 'Camera Stream' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
