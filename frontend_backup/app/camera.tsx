import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useDroneStore } from '../store/droneStore';

const { width, height } = Dimensions.get('window');

export default function CameraStreamScreen() {
  const store = useDroneStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamQuality, setStreamQuality] = useState<'720p' | '480p' | '360p'>('720p');
  const [fps, setFps] = useState(30);
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    // Lock to landscape mode
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
      if (isStreaming) {
        handleStopStream();
      }
    };
  }, []);

  const handleStartStream = async () => {
    if (store.droneModel !== 'FLYQ_Vision') {
      Alert.alert(
        'Camera Not Available',
        'Camera streaming is only available on FLYQ Vision drones.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!store.connected) {
      Alert.alert(
        'Not Connected',
        'Please connect to your drone first.',
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      // Simulate camera stream initialization
      // In production, this would establish WebRTC or RTSP connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      const streamUrl = `rtsp://${store.droneIP}:8554/stream`;
      store.setCameraStreamUrl(streamUrl);
      store.setCameraStreamEnabled(true);
      setIsStreaming(true);

      // Simulate FPS counter
      const fpsInterval = setInterval(() => {
        setFps(Math.floor(25 + Math.random() * 10));
        setLatency(Math.floor(50 + Math.random() * 100));
      }, 1000);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      Alert.alert('Stream Error', 'Failed to start camera stream.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopStream = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    store.setCameraStreamEnabled(false);
    store.setCameraStreamUrl(null);
    setIsStreaming(false);
    setFps(30);
    setLatency(0);
  };

  const handleQualityChange = () => {
    const qualities: Array<'720p' | '480p' | '360p'> = ['720p', '480p', '360p'];
    const currentIndex = qualities.indexOf(streamQuality);
    const nextQuality = qualities[(currentIndex + 1) % qualities.length];
    setStreamQuality(nextQuality);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTakePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Photo Captured', 'Photo saved to gallery');
  };

  const handleRecordVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Recording', 'Video recording started');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <MaterialCommunityIcons name="video-wireless" size={24} color="#2196F3" />
          <Text style={styles.titleText}>Camera Stream</Text>
        </View>
        <View style={styles.headerRight}>
          {isStreaming && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
      </View>

      {/* Video Stream Area */}
      <View style={styles.videoContainer}>
        {!isStreaming && !isLoading && (
          <View style={styles.noStreamContainer}>
            <MaterialCommunityIcons name="video-wireless-outline" size={80} color="#666" />
            <Text style={styles.noStreamText}>No Active Stream</Text>
            <Text style={styles.noStreamSubtext}>
              {store.droneModel === 'FLYQ_Vision' 
                ? 'Tap Start Stream to begin'
                : 'Connect to a FLYQ Vision drone'}
            </Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Initializing Camera...</Text>
          </View>
        )}

        {isStreaming && (
          <View style={styles.streamContainer}>
            {/* Simulated video feed */}
            <View style={styles.videoPlaceholder}>
              <MaterialCommunityIcons name="quadcopter" size={120} color="#333" />
              <Text style={styles.placeholderText}>Live Camera Feed</Text>
              <Text style={styles.placeholderSubtext}>{streamQuality} @ {fps}fps</Text>
            </View>

            {/* Stream Overlay Info */}
            <View style={styles.streamOverlay}>
              <View style={styles.streamStats}>
                <View style={styles.statItem}>
                  <Ionicons name="videocam" size={16} color="#4CAF50" />
                  <Text style={styles.statText}>{streamQuality}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="speedometer" size={16} color="#FF9800" />
                  <Text style={styles.statText}>{fps} FPS</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color="#2196F3" />
                  <Text style={styles.statText}>{latency}ms</Text>
                </View>
              </View>
            </View>

            {/* Camera Controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity onPress={handleTakePhoto} style={styles.photoButton}>
                <Ionicons name="camera" size={32} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRecordVideo} style={styles.recordButton}>
                <MaterialCommunityIcons name="record-circle" size={48} color="#F44336" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleQualityChange} style={styles.qualityButton}>
                <Text style={styles.qualityText}>{streamQuality}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={18} color="#2196F3" />
          <Text style={styles.infoText}>
            {store.connected ? `Connected to ${store.droneModel || 'Drone'}` : 'Not Connected'}
          </Text>
        </View>

        {!isStreaming ? (
          <TouchableOpacity
            onPress={handleStartStream}
            style={[
              styles.startButton,
              (!store.connected || store.droneModel !== 'FLYQ_Vision') && styles.buttonDisabled
            ]}
            disabled={!store.connected || store.droneModel !== 'FLYQ_Vision'}
          >
            <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
            <Text style={styles.buttonText}>Start Stream</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleStopStream} style={styles.stopButton}>
            <MaterialCommunityIcons name="stop-circle" size={24} color="#fff" />
            <Text style={styles.buttonText}>Stop Stream</Text>
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  liveText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  noStreamContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  noStreamText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  noStreamSubtext: {
    fontSize: 14,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#2196F3',
  },
  streamContainer: {
    flex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    gap: 12,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#333',
  },
  streamOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  streamStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  photoButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomControls: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
