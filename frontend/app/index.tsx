import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  
  const handleNavigation = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Logo and Title */}
      <View style={styles.header}>
        <Text style={styles.icon}>🚁</Text>
        <Text style={styles.title}>FLYQ</Text>
        <Text style={styles.subtitle}>Drone Controller</Text>
        <Text style={styles.version}>v2.1.0</Text>
      </View>

      {/* Main Menu */}
      <View style={styles.menu}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => handleNavigation('/connect')}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>✈️  Start Flight</Text>
            <Text style={styles.menuDescription}>Connect to your drone</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => handleNavigation('/features')}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>⭐  Advanced Features</Text>
            <Text style={styles.menuDescription}>Camera, recording & more</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => handleNavigation('/settings' as any)}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>⚙️  Settings</Text>
            <Text style={styles.menuDescription}>Trim, sensitivity & calibration</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.info}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            ℹ️  Ensure your device is connected to the drone WiFi network before starting.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>FLYQ Drone Controller</Text>
        <Text style={styles.footerSubtext}>Professional Edition</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  version: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 8,
  },
  menu: {
    paddingHorizontal: 20,
    gap: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  info: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  footerSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.2)',
    marginTop: 4,
  },
});
