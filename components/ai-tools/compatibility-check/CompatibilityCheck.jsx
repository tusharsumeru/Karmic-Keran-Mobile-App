

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import compatibilityData from './compatibility-data.json';
import { LinearGradient } from 'expo-linear-gradient';

const CompatibilityCheck = ({ person1Data, person2Data, onBack }) => {
  const [mounted, setMounted] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState(null);

  // Extract Moon sign from birth data
  const getMoonSign = (data) => {
    const moonPlanet = data?.data?.data?.planets?.find(planet => planet.name === "Moon");
    return moonPlanet ? moonPlanet.sign : null;
  };

  // Check compatibility between two signs
  const checkCompatibility = (sign1, sign2) => {
    // Check if sign1 is incompatible with sign2
    const sign1Data = compatibilityData[sign1];
    if (sign1Data) {
      const incompatibleMatch = sign1Data.find(item => item.incompatibleWith === sign2);
      if (incompatibleMatch) {
        return {
          isCompatible: false,
          data: incompatibleMatch
        };
      }
    }

    // Check if sign2 is incompatible with sign1
    const sign2Data = compatibilityData[sign2];
    if (sign2Data) {
      const incompatibleMatch = sign2Data.find(item => item.incompatibleWith === sign1);
      if (incompatibleMatch) {
        return {
          isCompatible: false,
          data: incompatibleMatch
        };
      }
    }

    return {
      isCompatible: true,
      data: null
    };
  };

  // Generate compatibility analysis
  const generateAnalysis = () => {
    const person1MoonSign = getMoonSign(person1Data);
    const person2MoonSign = getMoonSign(person2Data);

    if (!person1MoonSign || !person2MoonSign) {
      return {
        error: "Could not determine Moon signs from the provided data."
      };
    }

    const compatibility = checkCompatibility(person1MoonSign, person2MoonSign);
    
    const result = {
      analysis: {
        title: "Moon Sign Compatibility Analysis",
        person1MoonSign,
        person2MoonSign,
        status: compatibility.isCompatible ? "Compatible" : "Incompatible",
        isCompatible: compatibility.isCompatible
      }
    };

    if (!compatibility.isCompatible && compatibility.data) {
      result.incompatibilityDetails = {
        reason: compatibility.data.reasonTitle,
        description: compatibility.data.reasonDescription,
        remedies: {
          [person1MoonSign]: compatibility.data[`remedieFor${person1MoonSign}`],
          [person2MoonSign]: compatibility.data[`remedieFor${person2MoonSign}`]
        }
      };
    }

    return result;
  };

  useEffect(() => {
    setMounted(true);
    if (person1Data && person2Data) {
      const analysis = generateAnalysis();
      setCompatibilityResult(analysis);
    }
  }, [person1Data, person2Data]);

  if (!mounted) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7765E3" />
        <Text style={styles.loadingText}>Loading compatibility data...</Text>
      </View>
    );
  }

  if (!person1Data || !person2Data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compatibility Check</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Please provide birth data for both people to analyze compatibility.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (compatibilityResult?.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compatibility Check</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF9800" />
          <Text style={styles.errorText}>{compatibilityResult.error}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compatibility Check</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {/* Header Section with Gradient */}
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
                style={styles.mandalaImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.toolHeaderContent}>
              <Text style={styles.toolHeaderTitle}>Partner Compatibility Check</Text>
              <Text style={styles.toolHeaderDescription}>
                Understanding the emotional harmony and potential challenges between two Moon signs
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Moon Signs Comparison Section */}
        <View style={styles.card}>
          <View style={styles.moonSignsContainer}>
            <View style={styles.moonSignItem}>
              <View style={styles.moonSignCircle}>
                <Text style={styles.moonSignInitial}>
                  {compatibilityResult?.analysis?.person1MoonSign?.[0] || '?'}
                </Text>
              </View>
              <Text style={styles.moonSignText}>
                {compatibilityResult?.analysis?.person1MoonSign || 'Unknown'}
              </Text>
            </View>
            
            <Text style={styles.moonSignDivider}>×</Text>
            
            <View style={styles.moonSignItem}>
              <View style={styles.moonSignCircle}>
                <Text style={styles.moonSignInitial}>
                  {compatibilityResult?.analysis?.person2MoonSign?.[0] || '?'}
                </Text>
              </View>
              <Text style={styles.moonSignText}>
                {compatibilityResult?.analysis?.person2MoonSign || 'Unknown'}
              </Text>
            </View>
          </View>
          
          <View style={[
            styles.compatibilityStatusContainer,
            compatibilityResult?.analysis?.isCompatible ? styles.compatibleStatus : styles.incompatibleStatus
          ]}>
            <Text style={[
              styles.compatibilityStatusText,
              compatibilityResult?.analysis?.isCompatible ? styles.compatibleStatusText : styles.incompatibleStatusText
            ]}>
              {compatibilityResult?.analysis?.status || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Compatibility Details Section */}
        {!compatibilityResult?.analysis?.isCompatible && compatibilityResult?.incompatibilityDetails && (
          <View style={styles.detailsContainer}>
            {/* Analysis Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                {compatibilityResult.incompatibilityDetails.reason}
              </Text>
              <Text style={styles.sectionText}>
                {compatibilityResult.incompatibilityDetails.description}
              </Text>
            </View>

            {/* Remedies Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Harmonizing Strategies
              </Text>
              
              {Object.entries(compatibilityResult.incompatibilityDetails.remedies).map(([sign, remedy]) => (
                <View key={sign} style={styles.remedyCard}>
                  <Text style={styles.remedyTitle}>For {sign}</Text>
                  <Text style={styles.remedyText}>{remedy}</Text>
                </View>
              ))}
            </View>

            {/* Conclusion Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Moving Forward Together
              </Text>
              <Text style={styles.sectionText}>
                While these Moon signs may present certain challenges, understanding and implementing 
                these remedies can help create a more harmonious relationship. Remember that 
                astrological compatibility is just one aspect of a relationship, and conscious effort 
                from both parties can overcome many challenges.
              </Text>
            </View>
          </View>
        )}

        {/* Compatible Signs Section */}
        {compatibilityResult?.analysis?.isCompatible && (
          <View style={styles.detailsContainer}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Natural Harmony
              </Text>
              <Text style={styles.sectionText}>
                These Moon signs naturally complement each other, creating a harmonious emotional 
                connection. This compatibility suggests an intuitive understanding between both 
                parties and a natural flow in emotional expression and reception.
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Building on Strengths
              </Text>
              <Text style={styles.sectionText}>
                While these Moon signs are naturally compatible, nurturing the relationship through 
                open communication and mutual understanding will help maintain and strengthen the 
                emotional bond. Remember that compatibility is a foundation to build upon.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 24,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e53935',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
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
  toolHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  toolHeaderGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mandalaContainer: {
    alignItems: 'center',
    marginTop: -10,
    marginBottom: -20,
  },
  mandalaImage: {
    width: 100,
    height: 100,
    opacity: 0.9,
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
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  moonSignsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  moonSignItem: {
    alignItems: 'center',
  },
  moonSignCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0e6ff',
    borderWidth: 2,
    borderColor: '#e6d9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moonSignInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7765E3',
  },
  moonSignText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  moonSignDivider: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d1c4e9',
    marginHorizontal: 20,
  },
  compatibilityStatusContainer: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatibleStatus: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  incompatibleStatus: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  compatibilityStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  compatibleStatusText: {
    color: '#2e7d32',
  },
  incompatibleStatusText: {
    color: '#c62828',
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  remedyCard: {
    backgroundColor: '#f5f0ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6d9ff',
  },
  remedyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7765E3',
    marginBottom: 8,
  },
  remedyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  }
});

export default CompatibilityCheck; 