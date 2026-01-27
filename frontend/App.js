import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🚁</Text>
      <Text style={styles.title}>FLYQ Drone Controller</Text>
      <Text style={styles.version}>v2.1.0</Text>
      <Text style={styles.subtitle}>Professional Edition</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  version: {
    fontSize: 18,
    color: '#00bfff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
});
