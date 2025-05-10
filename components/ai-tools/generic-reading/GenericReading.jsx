

import React, { useEffect, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { formatBirthData, formatDegrees } from "./utils/interpretationHelpers";
import { useQuery } from "react-query";
import { handleRetrieveAscendantById } from "@/actions/actions";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import SpeechToTextPlayer from "@/components/user/sppech-to-text";
import KundaliChart from "@/components/reusable/kundali/constants/kk-kundali";
import KundaliChart1 from "@/components/reusable/kundali/constants/kk-kundali1";

const CORE_INTERPRETATIONS = {
  Sun: "Your core identity and the driving force behind who you are becoming. It reflects your purpose, willpower, and the traits you naturally grow into as life unfolds. Think of it as your soul's central theme — steady, powerful, and ever-present.",
  Moon: "Your emotional landscape — how you feel, nurture, and respond deep within. It governs your instincts, moods, and how you process the world on a subconscious level. It's the part of you only close friends or moments of vulnerability reveal.",
  Ascendant:
    "Your outward personality and the energetic tone of your life path. It shapes how others perceive you, how you begin things, and the first impression you leave. It's your 'cosmic outfit' — the lens through which the world first meets you.",
};

const GenericReading = ({ birthData, interpretationData, onBack }) => {
  const token = Cookies.get("jwt");
  const [formattedBirthData, setFormattedBirthData] = useState(
    birthData ? formatBirthData(birthData) : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const { data: ascendant2, isLoading: ascendantLoading } = useQuery(
    ["ascendant", id],
    () => handleRetrieveAscendantById(config, id),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  if (ascendantLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Birth Chart Reading</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7765E3" />
          <Text style={styles.loadingText}>Loading your reading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filter out Rahu and Ketu from planets
  const filteredPlanets =
    ascendant2?.data?.data?.planets?.filter(
      (planet) => planet.name !== "Rahu" && planet.name !== "Ketu"
    ) || [];

  // Add Ascendant to the beginning of the planets array
  const ascendant = ascendant2?.data?.data?.siderealAscendant;
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

  const speechText = [
    "Understanding Your Cosmic Blueprint",
    "Your birth chart is a snapshot of the sky at the exact moment of your birth. Each planet's position tells a unique story about different aspects of your life, personality, and potential. The following analysis breaks down these planetary influences in detail.",
    ...allPlacements
      .map((planet) => {
        const introLine = `${planet.name} is in ${planet.sign}, in the ${
          planet.nakshatra
        } Nakshatra, Pada ${planet.pada}${
          planet.statusName ? ` — ${planet.statusName}` : ""
        }.`;

        const staticInterpretation = CORE_INTERPRETATIONS[planet.name] || "";
        const dynamicInterpretation =
          interpretationData[planet.name]?.[planet.sign] || "";

        const status = planet.exalted
          ? "It is exalted."
          : planet.debilited
          ? "It is debilitated."
          : "";

        const degreeInfo = `Its position is ${formatDegrees(
          planet.degree,
          planet.minute
        )}.`;

        return [
          introLine,
          staticInterpretation,
          dynamicInterpretation,
          status,
          degreeInfo,
        ].filter(Boolean); // remove empty strings
      })
      .flat(), // flatten the nested arrays into one
  ];

  // Reading Header Component
  const ReadingHeader = ({ birthData }) => {
    if (!birthData) return null;
    
    return (
      <View style={styles.birthDetailsCard}>
        <Text style={styles.birthDetailsTitle}>Birth Details</Text>
        <Text style={styles.birthDetailsText}>
          {birthData.name}, {birthData.dob}
        </Text>
        <Text style={styles.birthDetailsText}>
          {birthData.tob}, {birthData.city}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Birth Chart Reading</Text>
          <View style={{ width: 24 }} />
        </View>

        {formattedBirthData && (
          <View style={styles.contentContainer}>
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
                  <Text style={styles.toolHeaderTitle}>General Reading based on your Birth Chart</Text>
                  <Text style={styles.toolHeaderDescription}>
                    Based on your unique planetary positions at the time of your
                    birth, this report provides deep insights into your cosmic
                    blueprint.
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Birth Details Section */}
            <ReadingHeader birthData={ascendant2?.data?.data} />

            <div className="p-6 flex items-center justify-center ">
              <KundaliChart1
                sign={ascendant2?.data?.data?.siderealAscendant?.sign}
                data={ascendant2?.data}
              />
            </div>

            {/* Introduction Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Understanding Your Cosmic Blueprint
              </Text>
              <Text style={styles.sectionText}>
                Your birth chart is a snapshot of the sky at the exact moment
                of your birth. Each planet's position tells a unique story
                about different aspects of your life, personality, and
                potential. The following analysis breaks down these planetary
                influences in detail.
              </Text>
            </View>

            {/* Planetary Positions Analysis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Detailed Planetary Analysis
              </Text>
              
              {allPlacements.map((planet) => (
                <View key={planet.name} style={styles.planetCard}>
                  <View style={styles.planetHeaderRow}>
                    <View style={styles.planetIconContainer}>
                      <Text style={styles.planetIconText}>
                        {planet.name[0]}
                      </Text>
                    </View>
                    <View style={styles.planetHeaderText}>
                      <Text style={styles.planetName}>
                        {planet.name} in {planet.sign}
                      </Text>
                      <Text style={styles.planetDetails}>
                        {planet.nakshatra} Nakshatra • Pada {planet.pada}
                        {planet.statusName && ` • ${planet.statusName}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.planetContentContainer}>
                    {/* Static interpretation */}
                    {CORE_INTERPRETATIONS[planet.name] && (
                      <Text style={styles.interpretationText}>
                        {CORE_INTERPRETATIONS[planet.name]}
                      </Text>
                    )}
                    
                    {/* Dynamic interpretation */}
                    {interpretationData && interpretationData[planet.name]?.[planet.sign] && (
                      <Text style={styles.interpretationText}>
                        {interpretationData[planet.name][planet.sign]}
                      </Text>
                    )}

                    <View style={styles.badgeContainer}>
                      {planet.exalted && (
                        <View style={styles.exaltedBadge}>
                          <Text style={styles.exaltedBadgeText}>
                            Exalted
                          </Text>
                        </View>
                      )}
                      {planet.debilited && (
                        <View style={styles.debilitatedBadge}>
                          <Text style={styles.debilitatedBadgeText}>
                            Debilitated
                          </Text>
                        </View>
                      )}
                      <View style={styles.degreeBadge}>
                        <Text style={styles.degreeBadgeText}>
                          {formatDegrees(planet.degree, planet.minute)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Conclusion Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Synthesis & Integration
              </Text>
              <Text style={styles.sectionText}>
                These planetary positions work together to create your unique
                astrological signature. Understanding these influences can
                help you navigate life's challenges and make the most of your
                natural strengths. Consider this reading a guide to
                understanding your cosmic DNA.
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  contentContainer: {
    padding: 16,
  },
  toolHeader: {
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
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  toolHeaderDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  birthDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  birthDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  birthDetailsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
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
    marginBottom: 8,
  },
  planetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  planetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0e6ff',
    borderWidth: 2,
    borderColor: '#e6d9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planetIconText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7765E3',
  },
  planetHeaderText: {
    flex: 1,
  },
  planetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  planetDetails: {
    fontSize: 12,
    color: '#888',
  },
  planetContentContainer: {
    paddingLeft: 60,
  },
  interpretationText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  exaltedBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  exaltedBadgeText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  debilitatedBadge: {
    backgroundColor: '#ffebee',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  debilitatedBadgeText: {
    fontSize: 12,
    color: '#c62828',
    fontWeight: '500',
  },
  degreeBadge: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  degreeBadgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default GenericReading;
