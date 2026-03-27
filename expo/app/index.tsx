import { Video, ResizeMode } from 'expo-av';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIDEO_URL = 'https://github.com/reclaimhb-hash/rork-video-welcome-page/releases/download/assets-v1/Welcome.Video.mp4';

console.log('Video URL:', VIDEO_URL);
const HAS_SEEN_WELCOME_KEY = 'has_seen_welcome_video';

export default function WelcomeScreen() {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const seen = await AsyncStorage.getItem(HAS_SEEN_WELCOME_KEY);
      console.log('Has seen welcome:', seen);
      setHasSeenWelcome(seen === 'true');
    } catch (err) {
      console.error('Error checking first launch:', err);
      setHasSeenWelcome(false);
    }
  };

  const handleVideoEnd = async () => {
    try {
      await AsyncStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
      setShowWelcome(false);
      setHasSeenWelcome(true);
    } catch (err) {
      console.error('Error saving welcome state:', err);
    }
  };

  if (hasSeenWelcome === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (hasSeenWelcome && !showWelcome) {
    return (
      <View style={styles.mainApp}>
        <Text style={styles.mainAppText}>Main App</Text>
        <Text style={styles.mainAppSubtext}>Welcome video completed</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: VIDEO_URL }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isMuted={true}
        onLoad={() => {
          console.log('Video loaded');
          setIsLoading(false);
        }}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            handleVideoEnd();
          }
        }}
        onError={(err) => {
          console.error('Video error details:', JSON.stringify(err, null, 2));
          console.error('Video URL attempted:', VIDEO_URL);
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  mainApp: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainAppText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700' as const,
  },
  mainAppSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    marginTop: 8,
  },
});
