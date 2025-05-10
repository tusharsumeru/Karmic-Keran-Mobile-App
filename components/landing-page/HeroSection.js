import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import PlaceholderImage from '../common/PlaceholderImage';

const { width, height } = Dimensions.get('window');

export default function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Discover Your{'\n'}Spiritual Path</Text>
          <Text style={styles.subtitle}>
            Connect with expert astrologers and discover your true purpose through personalized guidance
          </Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleGetStarted}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.imageContainer}>
          <PlaceholderImage 
            width={width * 0.9}
            height={width * 0.6}
            backgroundColor="#f0eefb"
            text="Spiritual Guidance"
            textColor="#7765e3"
            icon="sparkles-outline"
          />
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>10k+</Text>
          <Text style={styles.statLabel}>Happy Clients</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>50+</Text>
          <Text style={styles.statLabel}>Expert Astrologers</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>98%</Text>
          <Text style={styles.statLabel}>Satisfaction Rate</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
    paddingBottom: 30,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    backgroundColor: 'rgba(119, 101, 227, 0.05)',
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: {
    width: '100%',
    marginBottom: 30,
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    lineHeight: width * 0.11,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#666',
    marginBottom: 30,
    lineHeight: width * 0.055,
  },
  button: {
    backgroundColor: '#7765e3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#7765e3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7765e3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
  },
}); 