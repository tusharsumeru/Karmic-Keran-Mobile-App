import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import PlaceholderImage from '../common/PlaceholderImage';

const { width } = Dimensions.get('window');

export default function AboutSection() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <PlaceholderImage 
          width={width * 0.9}
          height={width * 0.6}
          backgroundColor="#f0eefb"
          text="About Karmic Keran"
          textColor="#7765e3"
          icon="people-outline"
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>ABOUT US</Text>
        <Text style={styles.title}>Guiding Your Spiritual Journey</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.description}>
          At Karmic Keran, we blend ancient astrological wisdom with modern technology to provide you with personalized guidance. 
          Our team of expert astrologers and spiritual guides are dedicated to helping you navigate life's challenges and discover your true purpose.
        </Text>
        
        <View style={styles.featuresContainer}>
          <FeatureItem text="Expert astrologers with decades of experience" />
          <FeatureItem text="Personalized guidance based on your birth chart" />
          <FeatureItem text="Modern approach to ancient astrological wisdom" />
          <FeatureItem text="Secure and confidential consultations" />
        </View>
      </View>
    </View>
  );
}

function FeatureItem({ text }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.bulletPoint} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  image: {
    width: width * 0.9,
    height: width * 0.6,
    borderRadius: 16,
  },
  contentContainer: {
    width: '100%',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7765e3',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#7765e3',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 26,
    marginBottom: 24,
  },
  featuresContainer: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7765e3',
    marginTop: 8,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
}); 