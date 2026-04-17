// Real WiFi Scanner Service
// Uses react-native-wifi-reborn for actual WiFi network scanning on Android

import WifiManager from 'react-native-wifi-reborn';
import { Platform, PermissionsAndroid } from 'react-native';

class WiFiScannerService {
  constructor() {
    this.isScanning = false;
    this.networks = [];
  }

  /**
   * Request necessary permissions (Android only)
   */
  async requestPermissions() {
    if (Platform.OS !== 'android') {
      return true; // iOS handles permissions differently
    }

    try {
      // Check if permissions are already granted
      const fineLocationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (fineLocationGranted) {
        return true; // Already have permissions
      }

      // Request permissions
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_WIFI_STATE,
        PermissionsAndroid.PERMISSIONS.CHANGE_WIFI_STATE,
      ]);

      const hasAllPermissions = 
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.ACCESS_WIFI_STATE'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.CHANGE_WIFI_STATE'] === PermissionsAndroid.RESULTS.GRANTED;

      if (!hasAllPermissions) {
        console.warn('Not all WiFi permissions granted:', granted);
      }

      return hasAllPermissions;
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  }

  /**
   * Scan for WiFi networks
   * Returns array of networks with signal strength, security, etc.
   */
  async scanNetworks() {
    try {
      this.isScanning = true;

      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        this.isScanning = false;
        return {
          success: false,
          message: 'Location permission is required for WiFi scanning.\n\nPlease go to Settings → Apps → FLYQ → Permissions → Location → Allow',
          networks: [],
        };
      }

      // Check if WiFi is enabled
      let isEnabled = false;
      try {
        isEnabled = await WifiManager.isEnabled();
      } catch (err) {
        console.warn('Could not check WiFi status:', err);
        // Continue anyway - might still work
      }

      if (!isEnabled) {
        this.isScanning = false;
        return {
          success: false,
          message: 'WiFi is disabled. Please enable WiFi in device settings to scan for networks.',
          networks: [],
        };
      }

      // Scan for networks with timeout protection
      let networkList = [];
      try {
        const scanPromise = WifiManager.reScanAndLoadWifiList();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('WiFi scan timeout after 15 seconds')), 15000)
        );
        
        networkList = await Promise.race([scanPromise, timeoutPromise]);
      } catch (scanError) {
        console.error('WiFi scan failed:', scanError);
        this.isScanning = false;
        return {
          success: false,
          message: `WiFi scan failed: ${scanError.message}\n\nMake sure:\n✓ WiFi is ON\n✓ Location is ON\n✓ Location permission granted`,
          networks: [],
        };
      }

      // Validate scan results
      if (!Array.isArray(networkList)) {
        console.warn('Invalid network list:', networkList);
        networkList = [];
      }

      // Process and format networks
      this.networks = networkList
        .filter(network => network && network.SSID) // Filter out invalid entries
        .map((network, index) => ({
          id: `${network.BSSID || `network-${index}`}`,
          ssid: network.SSID || 'Unknown',
          bssid: network.BSSID || '',
          signal: network.level || -100, // Signal strength in dBm (-100 to 0)
          frequency: network.frequency ? `${(network.frequency / 1000).toFixed(1)} GHz` : '2.4 GHz',
          secured: (network.capabilities || '').includes('WPA') || (network.capabilities || '').includes('WEP'),
          capabilities: network.capabilities || '',
          isDrone: this.isDroneNetwork(network.SSID),
        }))
        .sort((a, b) => {
          // Sort: Drone networks first, then by signal strength
          if (a.isDrone && !b.isDrone) return -1;
          if (!a.isDrone && b.isDrone) return 1;
          return b.signal - a.signal;
        });

      this.isScanning = false;
      return {
        success: true,
        networks: this.networks,
        count: this.networks.length,
      };
    } catch (error) {
      console.error('WiFi scan error:', error);
      this.isScanning = false;
      
      return {
        success: false,
        message: `Unexpected error: ${error.message}\n\nPlease try again or restart the app.`,
        networks: [],
      };
    }
  }

  /**
   * Check if network name indicates it's a drone
   */
  isDroneNetwork(ssid) {
    if (!ssid) return false;
    
    const droneKeywords = [
      'litewing',
      'flyq',
      'drone',
      'esp32',
      'crazyflie',
      'ardupilot',
      'betaflight',
      'inav',
      'px4',
      'mavlink',
      'uav',
    ];

    const ssidLower = ssid.toLowerCase();
    return droneKeywords.some(keyword => ssidLower.includes(keyword));
  }

  /**
   * Get current WiFi SSID
   */
  async getCurrentSSID() {
    try {
      const ssid = await WifiManager.getCurrentWifiSSID();
      return {
        success: true,
        ssid: ssid || 'Unknown',
      };
    } catch (error) {
      console.error('Get current SSID error:', error);
      return {
        success: false,
        ssid: null,
        error: error.message,
      };
    }
  }

  /**
   * Connect to a WiFi network (Android only)
   * Note: This requires additional setup and may not work on all Android versions
   */
  async connectToNetwork(ssid, password = '', isWEP = false) {
    try {
      if (Platform.OS !== 'android') {
        throw new Error('Programmatic WiFi connection only supported on Android. Please connect manually in system settings.');
      }

      await WifiManager.connectToProtectedSSID(ssid, password, isWEP);
      
      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verify connection
      const currentSSID = await WifiManager.getCurrentWifiSSID();
      const connected = currentSSID === ssid;

      return {
        success: connected,
        message: connected 
          ? `Connected to ${ssid}` 
          : 'Connection failed - please connect manually',
        ssid: currentSSID,
      };
    } catch (error) {
      console.error('Connect to network error:', error);
      return {
        success: false,
        message: `Failed to connect: ${error.message}. Please connect manually in system WiFi settings.`,
        error: error.message,
      };
    }
  }

  /**
   * Get last scan results without re-scanning
   */
  getLastScanResults() {
    return {
      success: true,
      networks: this.networks,
      count: this.networks.length,
    };
  }

  /**
   * Format signal strength for display
   */
  getSignalInfo(signal) {
    // Signal strength in dBm: -30 (excellent) to -90 (poor)
    if (signal > -50) {
      return { 
        text: 'Excellent', 
        color: '#4CAF50', 
        bars: '▂▄▆█',
        percentage: 100,
      };
    } else if (signal > -60) {
      return { 
        text: 'Good', 
        color: '#8BC34A', 
        bars: '▂▄▆',
        percentage: 75,
      };
    } else if (signal > -70) {
      return { 
        text: 'Fair', 
        color: '#FFC107', 
        bars: '▂▄',
        percentage: 50,
      };
    } else if (signal > -80) {
      return { 
        text: 'Weak', 
        color: '#FF9800', 
        bars: '▂',
        percentage: 25,
      };
    } else {
      return { 
        text: 'Very Weak', 
        color: '#F44336', 
        bars: '▂',
        percentage: 10,
      };
    }
  }
}

// Export singleton instance
const wifiScanner = new WiFiScannerService();
export default wifiScanner;
