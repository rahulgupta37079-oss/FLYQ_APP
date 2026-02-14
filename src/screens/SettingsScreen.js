import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import AppFooter from '../components/AppFooter';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);
  const [saveFlightLogs, setSaveFlightLogs] = useState(true);

  const handleAbout = () => {
    Alert.alert(
      'About FLYQ',
      'FLYQ Drone Controller v2.1.0\nProfessional Edition\n\nDeveloped for professional drone operations by Passion 3D World.\n\n© 2026 FLYQ',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose a contact method:',
      [
        {
          text: 'Call +91 9137361474',
          onPress: () => Linking.openURL('tel:+919137361474').catch(() => 
            Alert.alert('Error', 'Could not open phone dialer')
          ),
        },
        {
          text: 'Email info@passion3dworld.com',
          onPress: () => Linking.openURL('mailto:info@passion3dworld.com').catch(() => 
            Alert.alert('Error', 'Could not open email client')
          ),
        },
        {
          text: 'Visit Website',
          onPress: () => Linking.openURL('https://passion3dworld.com').catch(() => 
            Alert.alert('Error', 'Could not open website')
          ),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setDarkMode(true);
            setNotifications(true);
            setHapticFeedback(true);
            setAutoConnect(false);
            setSaveFlightLogs(true);
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  const SettingItem = ({ title, subtitle, value, onValueChange, icon }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#333', true: '#4CAF50' }}
        thumbColor={value ? '#fff' : '#666'}
      />
    </View>
  );

  const ActionButton = ({ title, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.actionButton, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* App Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>🚁</Text>
        <Text style={styles.infoTitle}>FLYQ Drone Controller</Text>
        <Text style={styles.infoVersion}>Version 2.1.0</Text>
        <Text style={styles.infoEdition}>Professional Edition</Text>
      </View>

      {/* General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        
        <SettingItem
          icon="🌙"
          title="Dark Mode"
          subtitle="Use dark theme throughout the app"
          value={darkMode}
          onValueChange={setDarkMode}
        />
        
        <SettingItem
          icon="🔔"
          title="Notifications"
          subtitle="Receive alerts and updates"
          value={notifications}
          onValueChange={setNotifications}
        />
        
        <SettingItem
          icon="📳"
          title="Haptic Feedback"
          subtitle="Vibration for button presses"
          value={hapticFeedback}
          onValueChange={setHapticFeedback}
        />
      </View>

      {/* Connection Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection</Text>
        
        <SettingItem
          icon="📡"
          title="Auto-Connect"
          subtitle="Automatically connect to known drones"
          value={autoConnect}
          onValueChange={setAutoConnect}
        />
      </View>

      {/* Flight Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flight</Text>
        
        <SettingItem
          icon="📝"
          title="Save Flight Logs"
          subtitle="Record flight data and telemetry"
          value={saveFlightLogs}
          onValueChange={setSaveFlightLogs}
        />
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <ActionButton
          icon="📊"
          title="View Flight Logs"
          color="#2196F3"
          onPress={() => Alert.alert('Flight Logs', 'Flight log viewer coming soon!')}
        />
        
        <ActionButton
          icon="🔄"
          title="Check for Updates"
          color="#FF9800"
          onPress={() => Alert.alert('Updates', 'You are running the latest version!')}
        />
        
        <ActionButton
          icon="📞"
          title="Contact Support"
          color="#9C27B0"
          onPress={handleSupport}
        />
        
        <ActionButton
          icon="ℹ️"
          title="About"
          color="#4CAF50"
          onPress={handleAbout}
        />
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Text style={styles.dangerIcon}>⚠️</Text>
          <Text style={styles.dangerTitle}>Reset All Settings</Text>
        </TouchableOpacity>
      </View>

      {/* System Info */}
      <View style={styles.systemInfo}>
        <Text style={styles.systemInfoTitle}>System Information</Text>
        <View style={styles.systemInfoRow}>
          <Text style={styles.systemInfoLabel}>Build:</Text>
          <Text style={styles.systemInfoValue}>2024.01.29</Text>
        </View>
        <View style={styles.systemInfoRow}>
          <Text style={styles.systemInfoLabel}>Platform:</Text>
          <Text style={styles.systemInfoValue}>Android/iOS</Text>
        </View>
        <View style={styles.systemInfoRow}>
          <Text style={styles.systemInfoLabel}>React Native:</Text>
          <Text style={styles.systemInfoValue}>0.81.5</Text>
        </View>
      </View>

      {/* Footer with Contact Info */}
      <AppFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    marginTop: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  infoIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  infoVersion: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoEdition: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  actionArrow: {
    fontSize: 28,
    color: '#666',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  dangerIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F44336',
    flex: 1,
  },
  systemInfo: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  systemInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  systemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  systemInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  systemInfoValue: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '500',
  },
});
