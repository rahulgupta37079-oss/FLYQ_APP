import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const VideoBackground = ({ 
  source, 
  opacity = 0.3, 
  blur = false,
  children,
  style 
}) => {
  const video = useRef(null);
  const [status, setStatus] = useState({});

  useEffect(() => {
    // Auto-play and loop the video
    if (video.current) {
      video.current.playAsync();
    }
  }, []);

  return (
    <View style={[styles.container, style]}>
      {/* Background Video */}
      <Video
        ref={video}
        source={source}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
        onPlaybackStatusUpdate={status => setStatus(() => status)}
      />
      
      {/* Overlay to control opacity and add dark tint */}
      <View style={[styles.overlay, { opacity: 1 - opacity }]} />
      
      {/* Content on top of video */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default VideoBackground;
