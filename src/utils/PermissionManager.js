import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

class PermissionManager {
  constructor() {
    this.permissions = {
      location: false,
      bluetooth: false,
      wifi: false,
    };
  }

  /**
   * Request all necessary permissions for the app
   * Call this on app startup
   */
  async requestAllPermissions() {
    if (Platform.OS !== 'android') {
      return { success: true, message: 'iOS permissions handled by system' };
    }

    try {
      const permissions = [];
      
      // Location permissions (required for WiFi scanning)
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
      
      // WiFi permissions
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_WIFI_STATE);
      permissions.push(PermissionsAndroid.PERMISSIONS.CHANGE_WIFI_STATE);
      
      // Bluetooth permissions (Android 12+)
      if (Platform.Version >= 31) {
        permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
        permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      // Check results
      const locationGranted = 
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;
      
      let bluetoothGranted = true;
      if (Platform.Version >= 31) {
        bluetoothGranted = 
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;
      }

      this.permissions.location = locationGranted;
      this.permissions.bluetooth = bluetoothGranted;
      this.permissions.wifi = locationGranted; // WiFi scanning requires location

      if (!locationGranted || !bluetoothGranted) {
        return {
          success: false,
          permissions: this.permissions,
          message: this.getMissingPermissionsMessage(),
        };
      }

      return {
        success: true,
        permissions: this.permissions,
        message: 'All permissions granted',
      };
    } catch (err) {
      console.error('Permission request error:', err);
      return {
        success: false,
        permissions: this.permissions,
        message: `Error requesting permissions: ${err.message}`,
      };
    }
  }

  /**
   * Check if a specific permission is granted
   */
  async checkPermission(permission) {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.check(permission);
      return granted;
    } catch (err) {
      console.error('Permission check error:', err);
      return false;
    }
  }

  /**
   * Check all permissions status
   */
  async checkAllPermissions() {
    if (Platform.OS !== 'android') {
      return {
        location: true,
        bluetooth: true,
        wifi: true,
      };
    }

    const locationGranted = await this.checkPermission(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    let bluetoothGranted = true;
    if (Platform.Version >= 31) {
      const scanGranted = await this.checkPermission(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
      const connectGranted = await this.checkPermission(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
      bluetoothGranted = scanGranted && connectGranted;
    }

    this.permissions = {
      location: locationGranted,
      bluetooth: bluetoothGranted,
      wifi: locationGranted,
    };

    return this.permissions;
  }

  /**
   * Get user-friendly message about missing permissions
   */
  getMissingPermissionsMessage() {
    const missing = [];
    
    if (!this.permissions.location) {
      missing.push('Location (required for WiFi scanning)');
    }
    if (!this.permissions.bluetooth) {
      missing.push('Bluetooth (required for drone connection)');
    }

    if (missing.length === 0) {
      return 'All permissions granted';
    }

    return `Missing permissions:\n• ${missing.join('\n• ')}\n\nPlease enable these in Settings → Apps → FLYQ → Permissions`;
  }

  /**
   * Show permission dialog with option to open settings
   */
  showPermissionDialog(title, message) {
    Alert.alert(
      title || 'Permissions Required',
      message || this.getMissingPermissionsMessage(),
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => Linking.openSettings()
        },
      ]
    );
  }

  /**
   * Get current permissions status
   */
  getPermissions() {
    return this.permissions;
  }
}

// Export singleton instance
const permissionManager = new PermissionManager();
export default permissionManager;
