import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(0)).current;
  const bgScaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulse animation that loops
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start main animation sequence
    Animated.sequence([
      // Fade in gradient and logo with scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      
      // Hold for a moment while background subtly animates
      Animated.parallel([
        Animated.timing(bgScaleAnim, {
          toValue: 1.1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
      ]),
      
      // Fade out everything
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animation finished, notify parent
      if (onFinish) {
        onFinish();
      }
    });
  }, [fadeAnim, scaleAnim, rotateAnim, pulseAnim, bgScaleAnim, onFinish]);

  // Calculate rotation
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  // Calculate pulse scale
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <View style={styles.container}>
      {/* Animated Background with exact gradient from div */}
      <Animated.View
        style={[
          styles.backgroundContainer,
          {
            transform: [
              { scale: bgScaleAnim },
              { rotate: rotation }
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#FF4F4F', '#FF4F4F', '#FB923C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fullScreenGradient}
        />
      </Animated.View>

      {/* Logo directly on gradient background */}
      <Animated.View 
        style={[
          styles.logoContainer, 
          { 
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { scale: pulseScale }
            ]
          }
        ]}
      >
        <Image 
          source={require('../assets/images/kk-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4F4F', // Fallback color matching the gradient start
  },
  backgroundContainer: {
    position: 'absolute',
    width: width * 1.2,
    height: height * 1.2,
    top: -height * 0.1,
    left: -width * 0.1,
  },
  fullScreenGradient: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoImage: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen; 