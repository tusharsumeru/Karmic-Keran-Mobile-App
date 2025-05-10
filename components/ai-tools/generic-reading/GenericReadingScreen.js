import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createAuthConfig, handleRetrieveAscendantById } from '../../../actions/auth';
import { useQuery } from '@tanstack/react-query';

const CORE_INTERPRETATIONS = {
  Sun: "Your core identity and driving force. It reflects your purpose, willpower, and traits you grow into as life unfolds.",
  Moon: "Your emotional landscape — how you feel, nurture, and respond deep within. It governs your instincts and moods.",
  Mercury: "How you think, communicate, and process information. It represents your intellectual style and verbal expression.",
  Venus: "Your approach to love, beauty, and values. It shows how you express affection and what you're attracted to.",
  Mars: "Your drive, passion, and how you take action. It represents your assertiveness and energy.",
  Jupiter: "Your growth, expansion, and philosophy of life. It represents abundance and how you seek meaning.",
  Saturn: "Your discipline, responsibility, and life lessons. It represents structure and long-term goals.",
  Ascendant: "Your outward personality and the energy of your life path. It shapes how others perceive you."
};

const GenericReadingScreen = ({ chartData, onBack }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Function to get fresh chart data
  const fetchChartData = async () => {
    if (!chartData?._id) return null;
    
    try {
      const config = await createAuthConfig();
      const response = await handleRetrieveAscendantById(config, chartData._id);
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return null;
    }
  };

  // Use React Query for data fetching with automatic caching
  const { data: fullChartData, isLoading, error, refetch } = useQuery(
    {
      queryKey: ['birthChart', chartData?._id],
      queryFn: fetchChartData,
      enabled: !!chartData?._id,
      onSuccess: () => setRefreshing(false)
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    refetch();
  };

  // Helper function to format degrees
  const formatDegrees = (degree, minute) => {
    return `${degree}° ${minute}'`;
  };
  
  // Helper to get zodiac sign emoji
  const getZodiacEmoji = (sign) => {
    const emojis = {
      'Aries': '♈',
      'Taurus': '♉',
      'Gemini': '♊',
      'Cancer': '♋',
      'Leo': '♌',
      'Virgo': '♍',
      'Libra': '♎',
      'Scorpio': '♏',
      'Sagittarius': '♐',
      'Capricorn': '♑',
      'Aquarius': '♒',
      'Pisces': '♓'
    };
    return emojis[sign] || '';
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7765E3" />
          <Text style={styles.loadingText}>Loading your cosmic blueprint...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error || !fullChartData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>
            Couldn't load your birth chart analysis. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Filter out Rahu and Ketu from planets if needed
  const filteredPlanets = fullChartData?.planets?.filter(
    (planet) => planet.name !== "Rahu" && planet.name !== "Ketu"
  ) || [];

  // Add Ascendant to planets if needed
  const ascendant = fullChartData?.siderealAscendant;
  const allPlacements = ascendant
    ? [
        {
          name: "Ascendant",
          sign: ascendant.sign,
          nakshatra: ascendant.nakshatra,
          pada: ascendant.pada,
          degree: ascendant.degrees,
          minute: ascendant.minutes,
          statusName: "",
          exalted: false,
          debilited: false,
        },
        ...filteredPlanets,
      ]
    : filteredPlanets;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        {/* Header */}
        <LinearGradient
          colors={['#FF6B6B', '#FF8C42', '#4169E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Image
            source={require('../../../assets/images/mandala.png')}
            style={styles.mandalaImage}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              General Reading based on your Birth Chart
            </Text>
            <Text style={styles.headerSubtitle}>
              Based on your unique planetary positions at birth
            </Text>
          </View>
        </LinearGradient>
        
        {/* Birth Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Birth Details</Text>
          <View style={styles.birthDetailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{fullChartData.name || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Birth Date:</Text>
              <Text style={styles.detailValue}>{fullChartData.date || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Birth Time:</Text>
              <Text style={styles.detailValue}>{fullChartData.time || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Birth Place:</Text>
              <Text style={styles.detailValue}>
                {fullChartData.city ? 
                  `${fullChartData.city}, ${fullChartData.country || ""}` : 
                  "N/A"}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Introduction */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Understanding Your Cosmic Blueprint</Text>
          <Text style={styles.cardText}>
            Your birth chart is a snapshot of the sky at the exact moment of your birth.
            Each planet's position tells a unique story about different aspects of your life,
            personality, and potential. The following analysis breaks down these planetary
            influences in detail.
          </Text>
        </View>
        
        {/* Planetary Positions Analysis */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detailed Planetary Analysis</Text>
          
          {allPlacements.map((planet, index) => (
            <View key={index} style={styles.planetSection}>
              <View style={styles.planetHeader}>
                <View style={[
                  styles.planetIcon, 
                  { backgroundColor: getPlanetColor(planet.name) }
                ]}>
                  <Text style={styles.planetIconText}>
                    {planet.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.planetTitleContainer}>
                  <Text style={styles.planetName}>{planet.name}</Text>
                  <Text style={styles.planetPosition}>
                    {getZodiacEmoji(planet.sign)} {planet.sign} • {planet.nakshatra} Pada {planet.pada}
                  </Text>
                </View>
              </View>
              
              <View style={styles.interpretationContainer}>
                <Text style={styles.interpretationText}>
                  {CORE_INTERPRETATIONS[planet.name] || 
                    `Your ${planet.name} in ${planet.sign} shapes how you express this planetary energy.`}
                </Text>
                
                <Text style={styles.positionDetails}>
                  Position: {formatDegrees(planet.degree, planet.minute)}
                  {planet.exalted && " • Exalted"}
                  {planet.debilited && " • Debilitated"}
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Conclusion */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conclusion</Text>
          <Text style={styles.cardText}>
            This analysis offers a glimpse into your astrological profile.
            Remember that you have free will to shape your destiny.
            Your birth chart is a tool for self-awareness, not a rigid determinant of your future.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function for planet colors
const getPlanetColor = (planetName) => {
  const colors = {
    Sun: '#FF9800',
    Moon: '#757575',
    Mercury: '#64B5F6',
    Venus: '#F06292',
    Mars: '#E53935',
    Jupiter: '#8BC34A',
    Saturn: '#795548',
    Uranus: '#64FFDA',
    Neptune: '#1E88E5',
    Pluto: '#7B1FA2',
    Ascendant: '#FF5722'
  };
  
  return colors[planetName] || '#7765E3';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  backButton: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#7765E3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  headerGradient: {
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 16,
  },
  mandalaImage: {
    width: 80,
    height: 80,
    marginBottom: -10,
    opacity: 0.9,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
  },
  birthDetailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  planetSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  planetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planetIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  planetTitleContainer: {
    flex: 1,
  },
  planetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  planetPosition: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  interpretationContainer: {
    paddingLeft: 52,
  },
  interpretationText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
    marginBottom: 8,
  },
  positionDetails: {
    fontSize: 13,
    color: '#7765E3',
    fontWeight: '500',
  },
});

export default GenericReadingScreen; 