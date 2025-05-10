import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PlaceholderImage from '../common/PlaceholderImage';

const { width } = Dimensions.get('window');
const cardWidth = width > 600 ? width * 0.4 : width * 0.85;

export default function ServicesSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Our Services</Text>
      <Text style={styles.sectionSubtitle}>
        Discover a world of spiritual growth and self-discovery with our specialized services
      </Text>
      
      <View style={styles.cardsContainer}>
        <ServiceCard 
          title="AI Astrology"
          description="Get instant AI-powered astrological insights based on your birth chart"
          icon="planet"
          color="#7765e3"
        />
        
        <ServiceCard 
          title="Expert Consultation"
          description="Book one-on-one sessions with our experienced astrologers"
          icon="person-circle"
          color="#4CAF50"
        />
        
        <ServiceCard 
          title="Self-Discovery"
          description="Embark on a journey of self-awareness with guided spiritual exercises"
          icon="compass"
          color="#FF9800"
        />
      </View>
      
      <View style={styles.premiumContainer}>
        <View style={styles.premiumTextContainer}>
          <Text style={styles.premiumTitle}>Premium Membership</Text>
          <Text style={styles.premiumDescription}>
            Upgrade to premium for unlimited consultations, priority scheduling, and exclusive content
          </Text>
          <TouchableOpacity style={styles.learnMoreButton}>
            <Text style={styles.learnMoreText}>Coming Soon</Text>
            <Ionicons name="arrow-forward" size={16} color="#7765e3" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.premiumImageContainer}>
          <PlaceholderImage 
            width={width * 0.7}
            height={width * 0.4}
            backgroundColor="#f0eefb"
            text="Premium Benefits"
            textColor="#7765e3"
            icon="diamond-outline"
          />
        </View>
      </View>
    </View>
  );
}

function ServiceCard({ title, description, icon, color }) {
  return (
    <View style={[styles.card, { borderColor: color + '20' }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <TouchableOpacity style={styles.cardButton}>
        <Text style={[styles.cardButtonText, { color }]}>Learn More</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardButton: {
    alignSelf: 'flex-start',
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  premiumContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  premiumTextContainer: {
    width: '100%',
    marginBottom: 20,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7765e3',
    marginRight: 6,
  },
  premiumImageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  premiumImage: {
    width: width * 0.7,
    height: width * 0.4,
  },
}); 