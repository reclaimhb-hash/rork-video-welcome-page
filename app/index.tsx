import { Video, ResizeMode } from 'expo-av';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIDEO_URL_NATIVE = 'https://github.com/reclaimhb-hash/rork-video-welcome-page/releases/download/assets-v1/Untitled.design.5.mp4';
const VIDEO_URL_WEB = 'https://lajiegouajqvecmilwyj.supabase.co/storage/v1/object/public/Welcome%20Video/download.mp4';
const HAS_SEEN_WELCOME_KEY = 'has_seen_welcome_video';

export default function WelcomeScreen() {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const handleContinue = async () => {
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

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <video
          src={VIDEO_URL_WEB}
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onLoadedData={() => {
            console.log('Web video loaded successfully');
            setIsLoading(false);
          }}
          onCanPlay={() => {
            console.log('Web video can play');
            setIsLoading(false);
          }}
          onError={(e) => {
            const target = e.target as HTMLVideoElement;
            const errorCode = target?.error?.code;
            const errorMessage = target?.error?.message || 'Unknown error';
            console.error('Web video error:', errorCode, errorMessage);
            setError(`Video error: ${errorMessage}`);
            setIsLoading(false);
          }}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={styles.overlay}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: VIDEO_URL_NATIVE }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        onLoad={() => {
          console.log('Video loaded');
          setIsLoading(false);
        }}
        onError={(err) => {
          console.error('Video error:', err);
          setError('Failed to load video');
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <View style={styles.overlay}>
        <Text style={styles.welcomeText}>Welcome</Text>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Get Started</Text>
        </TouchableOpacity>
      </View>
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
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  errorText: {
    color: '#f87171',
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  continueButton: {
    marginTop: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  continueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 1,
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
