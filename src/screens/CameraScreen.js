import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function CameraScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [quality, setQuality] = useState('HD');
  const [fps, setFps] = useState(30);

  const qualities = ['SD', 'HD', 'FHD'];
  const frameRates = [24, 30, 60];

  const handleCapture = () => {
    alert('📸 Photo captured! Saved to gallery.');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      alert('🎥 Recording started');
    } else {
      alert('⏹️ Recording stopped and saved');
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera Preview (Simulated) */}
      <View style={styles.cameraPreview}>
        <View style={styles.cameraOverlay}>
          {/* Recording Indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
            </View>
          )}

          {/* Camera Info Overlay */}
          <View style={styles.infoOverlay}>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>{quality} • {fps} FPS</Text>
              <Text style={styles.infoText}>▂▄▆█ 87%</Text>
            </View>
          </View>

          {/* Center Message */}
          <View style={styles.centerMessage}>
            <Text style={styles.centerIcon}>📹</Text>
            <Text style={styles.centerText}>Camera Stream</Text>
            <Text style={styles.centerSubtext}>
              Live video feed will appear here when connected
            </Text>
          </View>

          {/* Telemetry Overlay */}
          <View style={styles.telemetryOverlay}>
            <View style={styles.telemetryRow}>
              <Text style={styles.telemetryText}>Alt: 12.5m</Text>
              <Text style={styles.telemetryText}>Spd: 5.2 m/s</Text>
            </View>
            <View style={styles.telemetryRow}>
              <Text style={styles.telemetryText}>Dist: 45.3m</Text>
              <Text style={styles.telemetryText}>Sat: 12</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Camera Controls */}
      <ScrollView 
        style={styles.controlsContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            activeOpacity={0.7}
          >
            <Text style={styles.captureButtonText}>📸</Text>
            <Text style={styles.captureButtonLabel}>Capture</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={toggleRecording}
            activeOpacity={0.7}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? '⏹️' : '🎥'}
            </Text>
            <Text style={styles.recordButtonLabel}>
              {isRecording ? 'Stop' : 'Record'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quality Settings */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Video Quality</Text>
          <View style={styles.optionsRow}>
            {qualities.map((q) => (
              <TouchableOpacity
                key={q}
                style={[
                  styles.optionButton,
                  quality === q && styles.optionButtonActive,
                ]}
                onPress={() => setQuality(q)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    quality === q && styles.optionTextActive,
                  ]}
                >
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frame Rate Settings */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Frame Rate</Text>
          <View style={styles.optionsRow}>
            {frameRates.map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[
                  styles.optionButton,
                  fps === rate && styles.optionButtonActive,
                ]}
                onPress={() => setFps(rate)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    fps === rate && styles.optionTextActive,
                  ]}
                >
                  {rate} FPS
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Camera Modes */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Camera Mode</Text>
          <View style={styles.modeGrid}>
            <TouchableOpacity style={styles.modeButton} activeOpacity={0.7}>
              <Text style={styles.modeIcon}>🌅</Text>
              <Text style={styles.modeText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modeButton} activeOpacity={0.7}>
              <Text style={styles.modeIcon}>🎬</Text>
              <Text style={styles.modeText}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modeButton} activeOpacity={0.7}>
              <Text style={styles.modeIcon}>⏱️</Text>
              <Text style={styles.modeText}>Timelapse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modeButton} activeOpacity={0.7}>
              <Text style={styles.modeIcon}>🎭</Text>
              <Text style={styles.modeText}>Panorama</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Storage Info */}
        <View style={styles.storageCard}>
          <Text style={styles.storageLabel}>Storage</Text>
          <View style={styles.storageBar}>
            <View style={[styles.storageBarFill, { width: '35%' }]} />
          </View>
          <Text style={styles.storageText}>
            3.2 GB used • 5.8 GB available
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
  cameraPreview: {
    width: width,
    height: width * 0.75, // 4:3 aspect ratio
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  centerMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  centerIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  centerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  centerSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  telemetryOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  telemetryText: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '500',
  },
  controlsContainer: {
    flex: 1,
    padding: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    fontSize: 32,
  },
  captureButtonLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#C62828',
  },
  recordButtonText: {
    fontSize: 32,
  },
  recordButtonLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  optionButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#fff',
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modeButton: {
    width: (width - 64) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  storageCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  storageLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  storageText: {
    fontSize: 12,
    color: '#aaa',
  },
});
