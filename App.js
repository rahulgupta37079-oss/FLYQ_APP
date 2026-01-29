import 'react-native-gesture-handler';
import React from 'react';
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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
  );
}
