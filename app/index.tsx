import { Video, ResizeMode } from 'expo-av';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const VIDEO_URL = 'https://github.com/reclaimhb-hash/rork-video-welcome-page/releases/download/assets-v1/Untitled.design.5.mp4';

console.log('Video URL:', VIDEO_URL);
const HAS_SEEN_WELCOME_KEY = 'has_seen_welcome_video';

export default function WelcomeScreen() {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

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

  const renderFallbackWelcome = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460', '#533483']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.animatedBg}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
      <View style={styles.overlay}>
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.subtitleText}>Your journey begins here</Text>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleRetry = () => {
    console.log('Retrying video load, attempt:', retryCount + 1);
    setError(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  };

  if (Platform.OS === 'web') {
    return renderFallbackWelcome();
  }

  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460', '#533483']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.overlay}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.errorInfoText}>Video failed to load</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.continueText}>Retry Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>Skip & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        key={`video-${retryCount}`}
        source={{ uri: VIDEO_URL }}
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
          console.error('Video error details:', JSON.stringify(err, null, 2));
          console.error('Video URL attempted:', VIDEO_URL);
          setError(`Failed to load video: ${JSON.stringify(err)}`);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading video...</Text>
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

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  animatedBg: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.3,
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#e94560',
    top: -width * 0.2,
    left: -width * 0.2,
  },
  circle2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: '#533483',
    bottom: height * 0.1,
    right: -width * 0.1,
  },
  circle3: {
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: '#0f3460',
    bottom: -width * 0.1,
    left: width * 0.2,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    marginTop: 12,
    letterSpacing: 1,
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
  errorInfoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center' as const,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: 'rgba(233,69,96,0.6)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
});
