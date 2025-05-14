import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const WelcomeBanner = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          const name = parsedData.name || parsedData.fullName || '';
          
          // Extract first name if possible
          const firstName = name.split(' ')[0];
          setUserName(firstName || name);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    getUserData();
  }, []);

  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF8C42', '#4169E1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.mandalaContainer}>
        <Image 
          source={require('../../../assets/images/mandala.png')}
          style={styles.mandalaImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>
           Schedule Your Personalized Astrology Session
            {width > 450 ? '\n' : ' '}
            with Karmic Keran
          </Text>
          
          <Text style={styles.subheading}>
            Unlock deep insights with personalized 1-on-1 sessions. Explore your celestial path today.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  mandalaContainer: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: -50,
  },
  mandalaImage: {
    width: width > 450 ? 180 : 150,
    height: width > 450 ? 150 : 120,
    opacity: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 20,
    alignItems: 'center',
    marginTop: -10,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  heading: {
    fontSize: width > 450 ? 24 : 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    lineHeight: width > 450 ? 32 : 28,
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  subheading: {
    fontSize: width > 450 ? 16 : 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: width > 450 ? 16 : 8,
    letterSpacing: 0.2,
    lineHeight: width > 450 ? 24 : 20,
  },
});

export default WelcomeBanner; 