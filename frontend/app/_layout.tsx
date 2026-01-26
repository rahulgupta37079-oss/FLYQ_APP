import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="connect" />
        <Stack.Screen name="controller" />
        <Stack.Screen name="features" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="recording" />
        <Stack.Screen name="multi-drone" />
        <Stack.Screen name="gestures" />
      </Stack>
    </>
  );
}
