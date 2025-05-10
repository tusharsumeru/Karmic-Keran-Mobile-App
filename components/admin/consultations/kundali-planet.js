import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import LagnaKundali from "./lagna-kundali";
import { handleRetrieveAscendantById, createAuthConfig } from "../../../actions/auth";

// Import KundaliChart component - adjust path if needed
import KundaliChart from '../../reusable/kundali/constants/kk-kundali';

// Component for skeleton loading UI
const Skeleton = ({ style }) => (
  <View style={[styles.skeleton, style]} />
);

// Simple DataTable component for React Native
const DataTable = ({ data, columns, isLoading }) => {
  if (isLoading) {
    return (
      <View style={styles.tableLoadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading table data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.tableContainer}>
      {/* Table Header */}
      <View style={styles.tableHeaderRow}>
        {columns.map((column, index) => (
          <View 
            key={index} 
            style={[styles.tableHeaderCell, column.width && { width: column.width }]}
          >
            <Text style={styles.tableHeaderText}>{column.header}</Text>
          </View>
        ))}
      </View>

      {/* Table Body */}
      <ScrollView>
        {data.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.tableRow}>
            {columns.map((column, colIndex) => (
              <View 
                key={colIndex} 
                style={[styles.tableCell, column.width && { width: column.width }]}
              >
                {column.render ? (
                  column.render(row)
                ) : (
                  <Text style={styles.tableCellText}>
                    {row[column.accessor] || 'NA'}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Simple RemarkDialog component for React Native
const RemarkDialogRN = ({ myID }) => {
  return (
    <TouchableOpacity style={styles.remarkButton}>
      <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
      <Text style={styles.remarkButtonText}>Add Remark</Text>
    </TouchableOpacity>
  );
};

// Tab items
const items = [
  {
    name: "Ascendent Chart",
    source: "lagna",
  },
  {
    name: "Sun Chart",
    source: "sun",
  },
  {
    name: "Moon Chart",
    source: "moon",
  },
  {
    name: "All Planets Table",
    source: "planets",
  },
  {
    name: "Remarks by Karmic Keran",
    source: "remarks",
  },
];

// Column definitions for planet table
const columns = [
  {
    accessor: "name",
    header: "PLANET",
    width: 80,
  },
  {
    accessor: "statusName",
    header: "STATUS",
    width: 100,
  },
  {
    accessor: "exalted",
    header: "EXALTED & DEBILITATED",
    width: 120,
    render: (item) => (
      <View style={styles.exaltedCell}>
        {item.exalted === true ? (
          <View style={styles.exaltedIndicator}>
            <Text style={styles.exaltedText}>EXALTED</Text>
          </View>
        ) : item.debilitated === true ? (
          <View style={styles.debilitatedIndicator}>
            <Text style={styles.debilitatedText}>DEBILITATED</Text>
          </View>
        ) : (
          <Text style={styles.neutralText}>NEUTRAL</Text>
        )}
      </View>
    ),
  },
  {
    accessor: "degree",
    header: "DEGREES",
    width: 60,
    render: (item) => <Text>{item.degree || "0"}°</Text>,
  },
  {
    accessor: "minute",
    header: "MINUTES",
    width: 60,
    render: (item) => <Text>{item.minute || "0"}'</Text>,
  },
  {
    accessor: "sign",
    header: "RASHI",
    width: 80,
  },
  {
    accessor: "nakshatra",
    header: "NAKSHATRA",
    width: 100,
    render: (item) => <Text>{item.nakshatra || "NA"}</Text>,
  },
  {
    accessor: "pada",
    header: "PADA",
    width: 50,
    render: (item) => <Text>{item.pada || "-"}</Text>,
  },
];

const KundaliPlanet = ({ isUser = false, showBack = true }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.consultationId;
  
  // Initialize state with proper structure
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('lagna');
  const [ascendant, setAscendant] = useState(null);
  
  // Log params for debugging
  console.log('📋 KundaliPlanet params:', params);
  console.log('🆔 consultationId:', id);
  
  useEffect(() => {
    console.log('🔄 KundaliPlanet mounted or consultationId changed:', id);
    if (id) {
      fetchAscendantData();
    }
  }, [id]);
  
  const fetchAscendantData = async () => {
    if (!id) {
      setError('Consultation ID is required');
      setLoading(false);
      return;
    }
    
    try {
      const authConfig = await createAuthConfig();
      
      if (!authConfig.headers.Authorization) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await handleRetrieveAscendantById(authConfig, id);
      
      if (response.status === 200) {
        if (response.data?.data) {
          // Process the data to match the user-side structure
          const processedData = {
            data: {
              data: {
                siderealAscendant: {
                  sign: response.data.data.siderealAscendant?.sign || "Aries",
                  degrees: response.data.data.siderealAscendant?.degrees || 0,
                  minutes: response.data.data.siderealAscendant?.minutes || 0,
                  nakshatra: response.data.data.siderealAscendant?.nakshatra || "",
                  pada: response.data.data.siderealAscendant?.pada || 0
                },
                planets: (response.data.data.planets || []).map(planet => ({
                  name: planet?.name || "",
                  sign: planet?.sign || "Aries",
                  degree: planet?.degree || 0,
                  minute: planet?.minute || 0,
                  nakshatra: planet?.nakshatra || "",
                  pada: planet?.pada || 0,
                  status: planet?.status || "",
                  statusName: planet?.statusName || "",
                  exalted: planet?.exalted || false,
                  debilitated: planet?.debilitated || false
                })),
                message: response.data.data.message || "Chart data",
                name: response.data.data.name || "",
                dateOfBirth: response.data.data.dateOfBirth || "",
                timeOfBirth: response.data.data.timeOfBirth || "",
                city: response.data.data.city || "",
                state: response.data.data.state || "",
                country: response.data.data.country || "",
                gender: response.data.data.gender || "",
                consultation_id: response.data.data.consultation_id || id
              }
            }
          };
          setAscendant(processedData);
        } else if (response.message?.includes("Calculation Processed")) {
          setAscendant({
            data: {
              data: {
                siderealAscendant: {
                  sign: "Aries",
                  degrees: 0,
                  minutes: 0,
                  nakshatra: "",
                  pada: 0
                },
                planets: [],
                message: "Calculation is being processed. Please check back later.",
                name: "",
                dateOfBirth: "",
                timeOfBirth: "",
                city: "",
                state: "",
                country: "",
                gender: "",
                consultation_id: id
              }
            }
          });
        } else {
          setError('No kundali data available for this consultation');
        }
      } else {
        setError(response.message || 'Failed to fetch ascendant data');
      }
    } catch (err) {
      setError('An error occurred while loading the kundali data: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const zodiacSigns = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpion",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

  let data = [
    {
      name: "Asc",
      sign: ascendant?.data?.data?.siderealAscendant?.sign,
      degree: ascendant?.data?.data?.siderealAscendant?.degrees,
      minute: ascendant?.data?.data?.siderealAscendant?.minutes,
      nakshatra: ascendant?.data?.data?.siderealAscendant?.nakshatra,
      pada: ascendant?.data?.data?.siderealAscendant?.pada,
      statusName: ascendant?.data?.data?.siderealAscendant?.statusName,
    },
    {
      name: "Sun",
      sign: ascendant?.data?.data?.planets?.[0]?.sign,
      degree: ascendant?.data?.data?.planets?.[0]?.degree,
      minute: ascendant?.data?.data?.planets?.[0]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[0]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[0]?.pada,
      status: ascendant?.data?.data?.planets?.[0]?.status,
      statusName: ascendant?.data?.data?.planets?.[0]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[0]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[0]?.debilitated,
    },
    {
      name: "Moon",
      sign: ascendant?.data?.data?.planets?.[1]?.sign,
      degree: ascendant?.data?.data?.planets?.[1]?.degree,
      minute: ascendant?.data?.data?.planets?.[1]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[1]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[1]?.pada,
      status: ascendant?.data?.data?.planets?.[1]?.status,
      statusName: ascendant?.data?.data?.planets?.[1]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[1]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[1]?.debilitated,
    },
    {
      name: "Mars",
      sign: ascendant?.data?.data?.planets?.[4]?.sign,
      degree: ascendant?.data?.data?.planets?.[4]?.degree,
      minute: ascendant?.data?.data?.planets?.[4]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[4]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[4]?.pada,
      status: ascendant?.data?.data?.planets?.[4]?.status,
      statusName: ascendant?.data?.data?.planets?.[4]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[4]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[4]?.debilitated,
    },
    {
      name: "Mercury",
      sign: ascendant?.data?.data?.planets?.[2]?.sign,
      degree: ascendant?.data?.data?.planets?.[2]?.degree,
      minute: ascendant?.data?.data?.planets?.[2]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[2]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[2]?.pada,
      status: ascendant?.data?.data?.planets?.[2]?.status,
      statusName: ascendant?.data?.data?.planets?.[2]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[2]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[2]?.debilitated,
    },
    {
      name: "Jupiter",
      sign: ascendant?.data?.data?.planets?.[5]?.sign,
      degree: ascendant?.data?.data?.planets?.[5]?.degree,
      minute: ascendant?.data?.data?.planets?.[5]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[5]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[5]?.pada,
      status: ascendant?.data?.data?.planets?.[5]?.status,
      statusName: ascendant?.data?.data?.planets?.[5]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[5]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[5]?.debilitated,
    },
    {
      name: "Venus",
      sign: ascendant?.data?.data?.planets?.[3]?.sign,
      degree: ascendant?.data?.data?.planets?.[3]?.degree,
      minute: ascendant?.data?.data?.planets?.[3]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[3]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[3]?.pada,
      status: ascendant?.data?.data?.planets?.[3]?.status,
      statusName: ascendant?.data?.data?.planets?.[3]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[3]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[3]?.debilitated,
    },
    {
      name: "Saturn",
      sign: ascendant?.data?.data?.planets?.[6]?.sign,
      degree: ascendant?.data?.data?.planets?.[6]?.degree,
      minute: ascendant?.data?.data?.planets?.[6]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[6]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[6]?.pada,
      status: ascendant?.data?.data?.planets?.[6]?.status,
      statusName: ascendant?.data?.data?.planets?.[6]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[6]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[6]?.debilitated,
    },
    {
      name: "Rahu",
      sign: ascendant?.data?.data?.planets?.[10]?.sign,
      degree: ascendant?.data?.data?.planets?.[10]?.degree,
      minute: ascendant?.data?.data?.planets?.[10]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[10]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[10]?.pada,
      status: ascendant?.data?.data?.planets?.[10]?.status,
      statusName: ascendant?.data?.data?.planets?.[10]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[10]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[10]?.debilitated,
    },
    {
      name: "Ketu",
      sign: ascendant?.data?.data?.planets?.[11]?.sign,
      degree: ascendant?.data?.data?.planets?.[11]?.degree,
      minute: ascendant?.data?.data?.planets?.[11]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[11]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[11]?.pada,
      status: ascendant?.data?.data?.planets?.[11]?.status,
      statusName: ascendant?.data?.data?.planets?.[11]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[11]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[11]?.debilitated,
    },
    {
      name: "Uranus",
      sign: ascendant?.data?.data?.planets?.[7]?.sign,
      degree: ascendant?.data?.data?.planets?.[7]?.degree,
      minute: ascendant?.data?.data?.planets?.[7]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[7]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[7]?.pada,
      status: ascendant?.data?.data?.planets?.[7]?.status,
      statusName: ascendant?.data?.data?.planets?.[7]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[7]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[7]?.debilitated,
    },
    {
      name: "Neptune",
      sign: ascendant?.data?.data?.planets?.[8]?.sign,
      degree: ascendant?.data?.data?.planets?.[8]?.degree,
      minute: ascendant?.data?.data?.planets?.[8]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[8]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[8]?.pada,
      status: ascendant?.data?.data?.planets?.[8]?.status,
      statusName: ascendant?.data?.data?.planets?.[8]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[8]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[8]?.debilitated,
    },
    {
      name: "Pluto",
      sign: ascendant?.data?.data?.planets?.[9]?.sign,
      degree: ascendant?.data?.data?.planets?.[9]?.degree,
      minute: ascendant?.data?.data?.planets?.[9]?.minute,
      nakshatra: ascendant?.data?.data?.planets?.[9]?.nakshatra,
      pada: ascendant?.data?.data?.planets?.[9]?.pada,
      status: ascendant?.data?.data?.planets?.[9]?.status,
      statusName: ascendant?.data?.data?.planets?.[9]?.statusName,
      exalted: ascendant?.data?.data?.planets?.[9]?.exalted,
      debilitated: ascendant?.data?.data?.planets?.[9]?.debilitated,
    },
  ];

  if (loading) {
    return (
      <View>
        <View style={styles.textLeft}>
          <Skeleton style={styles.skeletonHeader} />
          <Skeleton style={styles.skeletonSubheader} />
        </View>

        <View style={styles.skeletonGridContainer}>
          <FlatList
            data={[1, 2, 3]} 
            numColumns={1}
            renderItem={({item, index}) => (
              <View key={index} style={styles.skeletonCard}>
                <View style={styles.skeletonCardHeader}>
                  <Skeleton style={styles.skeletonTitle} />
                  <Skeleton style={styles.skeletonText} />
                </View>
                <View style={styles.skeletonGrid}>
                  {[...Array(9)].map((_, j) => (
                    <Skeleton
                      key={j}
                      style={styles.skeletonGridItem}
                    />
                  ))}
                </View>
              </View>
            )}
          />
        </View>
        <View style={styles.skeletonTableContainer}>
          <Skeleton style={styles.skeletonTableHeader} />
          <View style={styles.skeletonTable}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={styles.skeletonTableRow}>
                <Skeleton style={[styles.skeletonTableCell, {width: '10%'}]} />
                <Skeleton style={[styles.skeletonTableCell, {width: '30%'}]} />
                <Skeleton style={[styles.skeletonTableCell, {width: '20%'}]} />
                <Skeleton style={[styles.skeletonTableCell, {width: '30%'}]} />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorHeader}>
          <Ionicons name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <Text style={styles.errorSubtext}>
          Consultation ID: {id}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => fetchAscendantData()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.retryButton, styles.goBackButton]} 
            onPress={() => router.back()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  if (!ascendant || !ascendant.data) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorHeader}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.infoText}>
            No kundali data available
          </Text>
        </View>
        <Text style={styles.errorSubtext}>
          This consultation may not have birth chart data available
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => fetchAscendantData()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.retryButton, styles.goBackButton]} 
            onPress={() => router.back()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderChart = (isMoon = false, isSun = false) => {
    if (!ascendant?.data?.data) {
      return (
        <View style={styles.chartErrorContainer}>
          <Ionicons name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.chartErrorText}>No chart data available</Text>
        </View>
      );
    }

    // Get the sign based on chart type
    let sign = ascendant.data.data.siderealAscendant?.sign || "Aries";
    if (isMoon && ascendant.data.data.planets?.[1]) {
      sign = ascendant.data.data.planets[1].sign;
    } else if (isSun && ascendant.data.data.planets?.[0]) {
      sign = ascendant.data.data.planets[0].sign;
    }

    return (
      <KundaliChart
        sign={sign}
        data={ascendant.data}
        isMoon={isMoon}
        isSun={isSun}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      {showBack && (
        <View style={styles.backButtonContainer}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color="#000" />
            <Text style={styles.backButtonText}>
              {isUser ? "Back to My Consultations" : "Back to Consultations"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>
            <Text style={styles.boldText}>
              {ascendant?.data?.data?.name || "-"}
            </Text>
            {" "}was born on{" "}
            <Text style={styles.boldText}>
              {ascendant?.data?.data?.dateOfBirth
                ? new Date(ascendant?.data?.data?.dateOfBirth).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long", 
                    year: "numeric"
                  }) || "-"
                : "-"}
            </Text>
            {" "}at{" "}
            <Text style={styles.boldText}>
              {ascendant?.data?.data?.timeOfBirth
                ? ascendant?.data?.data?.timeOfBirth
                    .split(":")
                    .slice(0, 2)
                    .map((num) => num.padStart(2, "0"))
                    .join(":")
                : "-"}
            </Text>
            {" "}in{" "}
            <Text style={styles.boldText}>
              {ascendant?.data?.data?.city}, {ascendant?.data?.data?.state},{" "}
              {ascendant?.data?.data?.country || "-"}
            </Text>
            {ascendant?.data?.data?.gender && (
              <Text>
                {" "}Their gender is{" "}
                <Text style={styles.boldText}>
                  {ascendant?.data?.data?.gender}
                </Text>
              </Text>
            )}
          </Text>
          <Text style={styles.subHeaderText}>
            Below are their detailed astrological charts and planetary positions.
          </Text>
        </View>

        {params.isAdmin && (
          <RemarkDialogRN myID={ascendant?.data?.data?.consultation_id} />
        )}
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => setSource(item.source)}
              style={[
                styles.tab,
                source === item.source && styles.activeTab
              ]}
            >
              <Text style={[
                styles.tabText,
                source === item.source && styles.activeTabText
              ]}>
                {item.name}
              </Text>
              {source === item.source && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        {source === "lagna" && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Ascendent Chart</Text>
              <Text style={styles.chartDescription}>
                Explore your rising sign and its influence on your personality, relationships, and life path through detailed Lagna analysis.
              </Text>
            </View>

            <View style={styles.chartContent}>
              {loading ? (
                <View style={styles.chartLoadingContainer}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.chartLoadingText}>Loading chart...</Text>
                </View>
              ) : error ? (
                <View style={styles.chartErrorContainer}>
                  <Ionicons name="alert-circle" size={24} color="#ef4444" />
                  <Text style={styles.chartErrorText}>{error}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => fetchAscendantData()}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                renderChart(false, false)
              )}
            </View>
          </View>
        )}

        {source === "moon" && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Moon Chart</Text>
              <Text style={styles.chartDescription}>
                Understand your emotional nature, mental patterns, and subconscious tendencies through in-depth analysis of your Moon sign and its placement.
              </Text>
            </View>

            <View style={styles.chartContent}>
              {renderChart(true, false)}
            </View>
          </View>
        )}

        {source === "sun" && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Sun Chart</Text>
              <Text style={styles.chartDescription}>
                Discover your core identity, ego, and life purpose through a detailed study of your Sun sign and its influence in your Kundali.
              </Text>
            </View>

            <View style={styles.chartContent}>
              {renderChart(false, true)}
            </View>
          </View>
        )}

        {source === "remarks" && (
          <View style={styles.remarksCard}>
            <View style={styles.remarksHeader}>
              <Text style={styles.remarksTitle}>Remarks by Karmic Keran</Text>

              {params.isAdmin && (
                <RemarkDialogRN myID={ascendant?.data?.data?.consultation_id} />
              )}
            </View>

            {ascendant?.data?.remark?.length > 0 ? (
              <View style={styles.remarksContent}>
                <View style={styles.remarkBox}>
                  <Text style={styles.remarkText}>
                    {ascendant?.data?.remark || ""}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noRemarks}>
                <Text style={styles.noRemarksText}>No remarks found</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {source === "planets" && (
        <View style={styles.planetsContainer}>
          <Text style={styles.planetsTitle}>All Planets Table</Text>
          <DataTable
            data={data || []}
            isLoading={loading}
            columns={columns}
            showPagination={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  // Skeleton styles
  skeleton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  textLeft: {
    alignItems: 'flex-start',
  },
  skeletonHeader: {
    height: 28,
    width: 288,
    marginBottom: 8,
  },
  skeletonSubheader: {
    height: 16,
    width: '90%',
    maxWidth: 640,
  },
  skeletonGridContainer: {
    marginTop: 40,
  },
  skeletonCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 24,
  },
  skeletonCardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 24,
    gap: 8,
  },
  skeletonTitle: {
    height: 24,
    width: 160,
  },
  skeletonText: {
    height: 16,
    width: '90%',
  },
  skeletonGrid: {
    padding: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skeletonGridItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonTableContainer: {
    marginTop: 24,
    gap: 12,
  },
  skeletonTableHeader: {
    height: 24,
    width: 160,
    marginBottom: 8,
  },
  skeletonTable: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  skeletonTableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 16,
  },
  skeletonTableCell: {
    height: 16,
    borderRadius: 4,
  },
  
  // Back button
  backButtonContainer: {
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  headerText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '600',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  // Tabs
  tabContainer: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    position: 'relative',
  },
  activeTab: {
    // Style for active tab
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#3b82f6',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  
  // Content container
  contentContainer: {
    marginBottom: 16,
  },
  
  // Chart card
  chartCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  chartHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  chartDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  chartContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    width: '100%',
    backgroundColor: '#ffffff',
  },
  
  // Remarks
  remarksCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: 16,
  },
  remarksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  remarksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  remarksContent: {
    marginTop: 8,
  },
  remarkBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
  },
  remarkText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  noRemarks: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  noRemarksText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  
  // Planets table
  planetsContainer: {
    marginTop: 16,
  },
  planetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  
  // DataTable styles
  tableLoadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  tableCellText: {
    fontSize: 14,
    color: '#4b5563',
  },
  
  // Exalted status styles
  exaltedCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exaltedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exaltedText: {
    fontSize: 14,
    color: '#059669', // green
  },
  debilitatedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debilitatedText: {
    fontSize: 14,
    color: '#dc2626', // red
  },
  neutralText: {
    fontSize: 14,
    color: '#6b7280', // gray
  },
  
  // Remark dialog button
  remarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  remarkButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginLeft: 4,
  },
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  
  // Error container styles
  errorContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  retryButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  goBackButton: {
    marginLeft: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 6,
  },
  goBackButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  chartLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    width: '100%',
    backgroundColor: '#ffffff',
  },
  chartLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  chartErrorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  chartErrorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});

export default KundaliPlanet;
