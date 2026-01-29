import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }) {
  const menuItems = [
    {
      id: 'wifi',
      title: 'WiFi Connection',
      icon: '📡',
      description: 'Connect to drone network',
      screen: 'WiFi',
      color: '#4CAF50',
    },
    {
      id: 'control',
      title: 'Drone Control',
      icon: '🎮',
      description: 'Control flight operations',
      screen: 'Control',
      color: '#2196F3',
    },
    {
      id: 'camera',
      title: 'Camera Stream',
      icon: '📷',
      description: 'View live video feed',
      screen: 'Camera',
      color: '#FF9800',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      description: 'App configuration',
      screen: 'Settings',
      color: '#9C27B0',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🚁</Text>
          <Text style={styles.heroTitle}>FLYQ Drone Controller</Text>
          <Text style={styles.heroVersion}>v2.1.0</Text>
          <Text style={styles.heroSubtitle}>Professional Edition</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusValue}>
                <Text style={styles.statusDot}>●</Text> Ready
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Connection</Text>
              <Text style={styles.statusValueInactive}>
                <Text style={styles.statusDotInactive}>●</Text> Not Connected
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { borderLeftColor: item.color }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Developed for professional drone operations
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  heroIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroVersion: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statusValueInactive: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  statusDot: {
    color: '#4CAF50',
    fontSize: 20,
  },
  statusDotInactive: {
    color: '#666',
    fontSize: 20,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 28,
  },
  menuTextContainer: {
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
    color: '#888',
  },
  menuArrow: {
    fontSize: 32,
    color: '#666',
    marginLeft: 8,
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
