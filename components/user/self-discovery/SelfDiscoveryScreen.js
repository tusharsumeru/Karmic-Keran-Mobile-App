import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import BirthInfoScreen from './BirthInfoScreen';
import BirthChartResultScreen from './BirthChartResultScreen';
import GenericReadingScreen from '../../ai-tools/generic-reading/GenericReadingScreen';
import CompatibilityCheck from '../../ai-tools/compatibility-check/CompatibilityCheck';

const { width } = Dimensions.get('window');

// Custom header component for tool screens
const ToolHeader = ({ title, description }) => {
  return (
    <View style={styles.toolHeader}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8C42', '#4169E1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.toolHeaderGradient}
      >
        <View style={styles.mandalaContainer}>
          <Image
            source={require('../../../assets/images/mandala.png')}
            style={styles.toolHeaderMandala}
            resizeMode="contain"
          />
        </View>
        <View style={styles.toolHeaderContent}>
          <Text style={styles.toolHeaderTitle}>{title}</Text>
          <Text style={styles.toolHeaderDescription}>{description}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const SelfDiscoveryScreen = () => {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState('main');
  const [birthChartData, setBirthChartData] = useState(null);
  const [compatibilityData, setCompatibilityData] = useState({ 
    person1Data: null, 
    person2Data: null
  });
  const [currentTool, setCurrentTool] = useState(null);

  const discoveryOptions = [
    {
      id: 'generic-reading',
      title: 'Generic Reading',
      subtitle: 'Broad Chart Overview',
      description: 'A comprehensive overview of your birth chart covering multiple areas.',
      benefits: [
        'Chart highlights',
        'Key planetary influences',
        'General guidance'
      ],
      color: '#FFA500',
      headerTitle: 'Generic Reading',
      headerDescription: 'Choose the path that resonates with you and unlock deeper insights.'
    },
    {
      id: 'compatibility-check',
      title: 'Compatibility Check',
      subtitle: 'Love & Relationships',
      description: 'Compare charts with your partner to uncover harmony and challenges.',
      benefits: [
        'Relationship dynamics',
        'Communication tips',
        'Growth opportunities'
      ],
      color: '#FFA500',
      headerTitle: 'Compatibility Check',
      headerDescription: 'Compare two birth charts to understand your emotional connection.'
    },
    {
      id: 'sade-sati',
      title: 'Sade Sati',
      subtitle: 'Saturn\'s Influence',
      description: 'Understand the impact of Saturn\'s transit through your moon sign.',
      benefits: [
        'Period analysis',
        'Remedial measures',
        'Timing insights'
      ],
      color: '#FFA500',
      headerTitle: 'Saturn Transit Impact',
      headerDescription: 'Choose the path that resonates with you and unlock deeper insights.'
    }
  ];

  const handleOptionSelect = (option) => {
    if (option.id === 'generic-reading' || option.id === 'sade-sati') {
      setCurrentTool(option);
      setCurrentScreen('birth-info');
    } else if (option.id === 'compatibility-check') {
      setCurrentTool(option);
      setCurrentScreen('compatibility-check');
    } else {
      // For future implementation
      alert(`${option.title} will be available soon!`);
    }
  };

  const handleBirthChartCalculated = (data) => {
    setBirthChartData(data);
    
    // Select the right result screen based on tool type
    if (currentTool?.id === 'generic-reading') {
      setCurrentScreen('generic-reading-result');
    } else if (currentTool?.id === 'sade-sati') {
      setCurrentScreen('saturn-transit-result');
    } else {
      setCurrentScreen('birth-chart-result');
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'birth-info':
        return (
          <View style={styles.container}>
            {currentTool && (
              <ToolHeader 
                title={currentTool.headerTitle} 
                description={currentTool.headerDescription} 
              />
            )}
            <BirthInfoScreen 
              onBack={() => setCurrentScreen('main')} 
              onBirthChartCalculated={handleBirthChartCalculated}
              toolType={currentTool?.id || 'generic-reading'}
            />
          </View>
        );
      case 'birth-chart-result':
        return (
          <BirthChartResultScreen 
            onBack={() => setCurrentScreen('birth-info')} 
            chartData={birthChartData}
          />
        );
      case 'generic-reading-result':
        return (
          <GenericReadingScreen 
            onBack={() => setCurrentScreen('birth-info')} 
            chartData={birthChartData}
          />
        );
      case 'saturn-transit-result':
        return (
          <BirthChartResultScreen 
            onBack={() => setCurrentScreen('birth-info')} 
            chartData={birthChartData}
          />
        );
      case 'compatibility-check':
        return (
          <CompatibilityCheck 
            person1Data={compatibilityData.person1Data}
            person2Data={compatibilityData.person2Data}
            onBack={() => setCurrentScreen('main')}
          />
        );
      default:
        return renderMainScreen();
    }
  };

  const renderCard = (option, index) => {
    return (
      <View key={option.id} style={styles.card}>
        <View style={styles.cardTopLine}>
          <View style={styles.cardNoiseBg} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{option.title}</Text>
          <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
          
          <Text style={styles.cardDescription}>{option.description}</Text>
          
          <View style={styles.benefitsList}>
            {option.benefits.map((benefit, idx) => (
              <View key={idx} style={styles.benefitItem}>
                <View style={styles.benefitDot} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.knowMoreButton}
            onPress={() => handleOptionSelect(option)}
          >
            <Text style={styles.knowMoreButtonText}>Know More</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMainScreen = () => {
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionContainer}>
          {/* Header with gradient background */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <LinearGradient
              colors={['#FF6B6B', '#FF8C42', '#4169E1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientHeader}
            >
              <View style={styles.mandalaContainer}>
                <Image
                  source={require('../../../assets/images/mandala.png')}
                  style={styles.mandalaImage}
                  resizeMode="contain"
                />
              </View>
              
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Explore Our Self Discovery Ai Tools</Text>
                <Text style={styles.headerSubtitle}>
                  These ai tools are trained with Karmic Keran's 45+ years of experience
                </Text>
              </View>
            </LinearGradient>
          </View>
          
          {/* Cards Grid */}
          <View style={styles.cardsContainer}>
            {discoveryOptions.map((option, index) => renderCard(option, index))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      {renderCurrentScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 20,
    padding: 8,
  },
  gradientHeader: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 24,
  },
  mandalaContainer: {
    alignItems: 'center',
    marginTop: -10,
    padding: 10,
  },
  mandalaImage: {
    width: 150,
    height: 150,
    opacity: 1,
  },
  headerTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  cardTopLine: {
    height: 6,
    backgroundColor: '#FFA500',
    position: 'relative',
    zIndex: 1,
  },
  cardNoiseBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
    backgroundColor: '#FFA500',
  },
  cardBody: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFA500',
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#444',
  },
  knowMoreButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  knowMoreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // New styles for tool headers
  toolHeader: {
    marginBottom: 16,
  },
  toolHeaderGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  toolHeaderMandala: {
    width: 100,
    height: 100,
    opacity: 0.9,
    marginBottom: -20,
  },
  toolHeaderContent: {
    padding: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  toolHeaderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  toolHeaderDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  }
});

export default SelfDiscoveryScreen; 