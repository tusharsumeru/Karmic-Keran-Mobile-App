"use client";

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, SafeAreaView } from "react-native";
import { calculateSadeSatiPeriods } from "./utils/sadeSatiCalculator";
import { formatDate } from "./utils/dateHelpers";
import TransitHeader from "./components/TransitHeader";
import PeriodTimeline from "./components/PeriodTimeline";
import RemediesSection from "./components/RemediesSection";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import { handleRetrieveAscendantById } from "@/actions/actions";
import { useQuery } from "react-query";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const SaturnTransitImpact = ({ birthData, transitData, onBack }) => {
  const [sadeSatiPeriods, setSadeSatiPeriods] = useState(null);

  const token = Cookies.get("jwt");

  const { id } = useParams();

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const { data: ascendant2, isLoading } = useQuery(
    ["ascendant", id],
    () => handleRetrieveAscendantById(config, id),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (ascendant2 && transitData) {
      const moonSign = ascendant2?.data?.data?.planets?.find(
        (p) => p.name === "Moon"
      )?.sign;
      const birthDate = ascendant2?.data?.data?.dateOfBirth;

      if (moonSign && birthDate) {
        const periods = calculateSadeSatiPeriods(
          moonSign,
          transitData,
          birthDate
        );
        setSadeSatiPeriods(periods);
      }
    }
  }, [ascendant2, transitData]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7765E3" />
        <Text style={styles.loadingText}>Loading transit data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saturn Transit Impact</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={['#FF6B6B', '#4A90E2', '#4169E1']}
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle2}>Saturn Transit Impact Analysis (Sade Sati)</Text>
            <Text style={styles.headerDescription}>
              Understanding the transformative 7.5-year journey of Saturn's
              transit and its profound impact on your life
            </Text>
          </View>
        </LinearGradient>

        {/* Birth and Transit Details */}
        <TransitHeader birthData={ascendant2?.data?.data} />

        {/* Introduction Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Understanding Saturn Transit's Impact</Text>
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              Sade Sati refers to the 7.5-year period when Saturn transits
              through three signs: the sign before your Moon sign, your Moon
              sign itself, and the sign after your Moon sign. This transit is
              considered a significant period of transformation, learning, and
              spiritual growth.
            </Text>
            
            <View style={styles.phasesContainer}>
              <View style={styles.phaseCard}>
                <Text style={styles.phaseTitle}>First Phase</Text>
                <Text style={styles.phaseText}>
                  Saturn in the 12th house from your Moon sign. A period of
                  introspection, letting go, and spiritual preparation.
                </Text>
              </View>
              
              <View style={styles.phaseCard}>
                <Text style={styles.phaseTitle}>Peak Phase</Text>
                <Text style={styles.phaseText}>
                  Saturn in your Moon sign. The most intense period of
                  transformation, challenges, and personal growth.
                </Text>
              </View>
              
              <View style={styles.phaseCard}>
                <Text style={styles.phaseTitle}>Final Phase</Text>
                <Text style={styles.phaseText}>
                  Saturn in the 2nd house from your Moon sign. Integration of
                  lessons, material adjustments, and new beginnings.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Periods Timeline */}
        {sadeSatiPeriods && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Sade Sati Timeline</Text>
            <PeriodTimeline periods={sadeSatiPeriods} />
          </View>
        )}

        {/* Remedies Section */}
        <View style={styles.section}>
          <RemediesSection />
        </View>

        {/* Conclusion Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Embracing the Journey</Text>
          <View style={styles.conclusionCard}>
            <Text style={styles.conclusionText}>
              While Sade Sati is often viewed with apprehension, it's
              important to understand that this transit represents a period of
              profound spiritual growth and character development. Saturn,
              known as the great teacher, brings lessons through experiences
              that ultimately lead to wisdom and maturity. This period often
              correlates with significant achievements, provided one
              approaches it with patience, perseverance, and responsibility.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  gradientHeader: {
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
  },
  mandalaContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  mandalaImage: {
    width: 100,
    height: 100,
    opacity: 0.9,
  },
  headerContent: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle2: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  introText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 16,
  },
  phasesContainer: {
    marginTop: 16,
  },
  phaseCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  phaseText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  conclusionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  conclusionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
});

export default SaturnTransitImpact;
