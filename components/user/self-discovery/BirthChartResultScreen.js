import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { createAuthConfig, handleRetrieveAscendantById } from '../../../actions/auth';

const BirthChartResultScreen = ({ onBack, chartData }) => {
  // Define planet colors for visualization
  const planetColors = {
    Sun: '#FF9800',
    Moon: '#BDBDBD',
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

  // Update React Query to use object format
  const { data, isLoading, error } = useQuery(
    {
      queryKey: ['birthChart', chartData?._id],
      queryFn: async () => {
        const config = await createAuthConfig();
        const response = await handleRetrieveAscendantById(config, chartData._id);
        return response.data;
      },
      enabled: !!chartData?._id
    }
  );
  
  // Handle case where chartData is not provided
  if (!chartData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Birth Chart</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF9800" />
          <Text style={styles.errorText}>No chart data available</Text>
          <TouchableOpacity 
            style={styles.tryAgainButton}
            onPress={onBack}
          >
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading Birth Chart</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7765E3" />
          <Text style={styles.loadingText}>Loading your birth chart data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF6B6B" />
          <Text style={styles.errorText}>Failed to load birth chart data</Text>
          <TouchableOpacity 
            style={styles.tryAgainButton}
            onPress={onBack}
          >
            <Text style={styles.tryAgainText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get correct title based on tool type
  const getResultTitle = () => {
    if (chartData.toolType === 'sade-sati') {
      return 'Saturn Transit Analysis';
    }
    return 'Your Birth Chart';
  };

  // Render Saturn Transit section if applicable
  const renderSaturnTransitSection = () => {
    if (chartData.toolType !== 'sade-sati') return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saturn Transit Impact</Text>
        <View style={styles.interpretationCard}>
          <View style={styles.saturnStatusContainer}>
            <View style={[styles.statusBadge, 
              chartData.saturnStatus?.inSadeSati ? styles.saturnActive : styles.saturnInactive]}>
              <Text style={styles.statusText}>
                {chartData.saturnStatus?.inSadeSati ? 'Currently in Sade Sati' : 'Not in Sade Sati'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.saturnPhaseTitle}>Current Phase:</Text>
          <Text style={styles.saturnPhase}>{chartData.saturnStatus?.phase || 'No phase detected'}</Text>
          
          <Text style={styles.interpretationText}>
            {chartData.saturnStatus?.description || 
              `Saturn's transit through the moon sign and its adjacent signs is known as Sade Sati. 
              This period typically lasts for 7.5 years and is believed to bring challenges that ultimately 
              lead to growth and transformation.`}
          </Text>
          
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Timeline:</Text>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>Started:</Text>
              <Text style={styles.timelineDate}>{chartData.saturnStatus?.startDate || 'Not applicable'}</Text>
            </View>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>Ends:</Text>
              <Text style={styles.timelineDate}>{chartData.saturnStatus?.endDate || 'Not applicable'}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Get Detailed Analysis</Text>
            <Ionicons name="chevron-forward" size={16} color="#7765E3" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getResultTitle()}</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.userInfoCard}>
          <View style={styles.userInfoTop}>
            <Text style={styles.userName}>{chartData.name}</Text>
            <Text style={styles.userDetails}>
              {chartData.dob} • {chartData.tob || 'Time not specified'}
            </Text>
            <Text style={styles.userLocation}>
              {chartData.city}, {chartData.country || ''}
            </Text>
          </View>
          
          <View style={styles.ascendantContainer}>
            <Text style={styles.ascendantLabel}>Your Ascendant</Text>
            <View style={styles.ascendantBadge}>
              <Text style={styles.ascendantText}>
                {getZodiacEmoji(chartData.ascendant)} {chartData.ascendant}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Saturn Transit specific section */}
        {renderSaturnTransitSection()}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planetary Positions</Text>
          <View style={styles.planetsContainer}>
            {chartData.planets && Object.entries(chartData.planets).map(([planet, data]) => (
              <View key={planet} style={styles.planetCard}>
                <View style={[styles.planetIconContainer, { backgroundColor: planetColors[planet] || '#7765E3' }]}>
                  <Text style={styles.planetIcon}>{planet === 'Ascendant' ? '↑' : '★'}</Text>
                </View>
                <View style={styles.planetInfo}>
                  <Text style={styles.planetName}>{planet}</Text>
                  <Text style={styles.planetPosition}>
                    {getZodiacEmoji(data.sign)} {data.sign} • {data.degree}°
                  </Text>
                  {data.house && (
                    <Text style={styles.planetHouse}>House {data.house}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Houses</Text>
          <View style={styles.housesContainer}>
            {chartData.houses && Object.entries(chartData.houses).map(([house, data]) => (
              <View key={house} style={styles.houseCard}>
                <View style={styles.houseNumber}>
                  <Text style={styles.houseNumberText}>{house}</Text>
                </View>
                <View style={styles.houseInfo}>
                  <Text style={styles.houseSign}>
                    {getZodiacEmoji(data.sign)} {data.sign}
                  </Text>
                  <Text style={styles.houseDegree}>{data.degree}°</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {chartData.toolType === 'sade-sati' ? 'Saturn Transit Interpretation' : 'Birth Chart Interpretation'}
          </Text>
          <View style={styles.interpretationCard}>
            <Text style={styles.interpretationText}>
              {chartData.toolType === 'sade-sati' ? 
                `Saturn's transit through your Moon sign is a significant astrological period. 
                It often represents a time of lessons, discipline, and growth through challenges.
                Understanding this transit can help you navigate this period with greater awareness.` :
                `Your birth chart is a cosmic snapshot of the sky at the moment you were born. 
                It reveals your personality traits, strengths, challenges, and potential life path.
                The position of your Ascendant in ${chartData.ascendant} suggests ${getAscendantDescription(chartData.ascendant)}.`
              }
            </Text>
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Get Full Interpretation</Text>
              <Ionicons name="chevron-forward" size={16} color="#7765E3" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => alert('Share feature coming soon!')}
          >
            <Ionicons name="share-outline" size={20} color="#7765E3" />
            <Text style={styles.shareButtonText}>Share Chart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => alert('Chart saved!')}
          >
            <Ionicons name="bookmark-outline" size={20} color="#FFF" />
            <Text style={styles.saveButtonText}>Save to Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function to get ascendant descriptions
const getAscendantDescription = (sign) => {
  const descriptions = {
    'Aries': 'a bold, energetic, and pioneering approach to life',
    'Taurus': 'a steady, practical, and determined nature',
    'Gemini': 'a curious, adaptable, and communicative personality',
    'Cancer': 'a nurturing, intuitive, and emotionally sensitive disposition',
    'Leo': 'a confident, creative, and expressive character',
    'Virgo': 'an analytical, detail-oriented, and practical mindset',
    'Libra': 'a harmonious, fair, and partnership-focused approach',
    'Scorpio': 'an intense, passionate, and transformative presence',
    'Sagittarius': 'an optimistic, adventurous, and truth-seeking spirit',
    'Capricorn': 'an ambitious, disciplined, and responsible demeanor',
    'Aquarius': 'an innovative, independent, and humanitarian perspective',
    'Pisces': 'a compassionate, intuitive, and dreamy nature'
  };
  return descriptions[sign] || 'a unique cosmic influence on your personality';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  tryAgainButton: {
    backgroundColor: '#7765E3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tryAgainText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  userInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfoTop: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: '#666',
  },
  ascendantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ascendantLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  ascendantBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  ascendantText: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  planetsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  planetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  planetIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planetIcon: {
    fontSize: 18,
    color: '#fff',
  },
  planetInfo: {
    flex: 1,
  },
  planetName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  planetPosition: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  planetHouse: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  housesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  houseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  houseNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7765E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  houseNumberText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  houseInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  houseSign: {
    fontSize: 14,
    color: '#333',
  },
  houseDegree: {
    fontSize: 14,
    color: '#666',
  },
  interpretationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  interpretationText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  readMoreText: {
    fontSize: 14,
    color: '#7765E3',
    fontWeight: '500',
    marginRight: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 30,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#7765E3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
  },
  shareButtonText: {
    color: '#7765E3',
    fontWeight: '500',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7765E3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  // New styles for Saturn Transit section
  saturnStatusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  saturnActive: {
    backgroundColor: '#ffebee',
  },
  saturnInactive: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontWeight: '500',
    fontSize: 14,
  },
  saturnPhaseTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  saturnPhase: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53935',
    marginBottom: 16,
  },
  timelineContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#666',
  },
  timelineDate: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
  }
});

export default BirthChartResultScreen; 