import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import KundaliChart from '../../../reusable/kundali/constants/kk-kundali';
import { fetchBirthChartData, processChartDataForVisualization } from '../../../../actions/auth';

/**
 * Format degrees and minutes into a readable string
 */
const formatDegrees = (degrees, minutes) => {
  // Handle missing or undefined values
  const deg = typeof degrees === 'number' ? degrees : 0;
  const min = typeof minutes === 'number' ? minutes : 0;
  
  return `${deg}° ${min}'`;
};

/**
 * Format planet status from code to human-readable form
 */
const formatPlanetStatus = (status) => {
  if (!status) return '';
  
  const statusText = [];
  
  // Remove brackets and split by spaces
  const statusCodes = status
    .replace('[', '')
    .replace(']', '')
    .split(' ')
    .filter(Boolean);
    
  statusCodes.forEach(code => {
    switch(code) {
      case 'R':
        statusText.push('Retrograde');
        break;
      case 'C':
        statusText.push('Combust');
        break;
      case 'D':
        statusText.push('Direct');
        break;
      default:
        if (code.trim()) statusText.push(code);
        break;
    }
  });

  return statusText.join(', ');
};

/**
 * Get combined planet status considering both status code and individual flags
 */
const getPlanetStatuses = (planet) => {
  const statuses = {
    exalted: planet.exalted || false,
    debilitated: planet.debilitated || false,
    retrograde: planet.retrograde || false,
    combust: planet.combust || false,
    direct: false
  };
  
  // Check status string for additional information
  if (planet.status) {
    const statusString = planet.status.toLowerCase();
    
    // Check for status codes in the string
    if (statusString.includes('r')) statuses.retrograde = true;
    if (statusString.includes('c')) statuses.combust = true;
    if (statusString.includes('d')) statuses.direct = true;
  }
  
  return statuses;
};

/**
 * ConsultationChart component displays the birth chart for a consultation
 */
const ConsultationChart = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('ascendantChart');
  
  // Get consultation data from route params
  const { 
    consultationId,
    name, 
    birthDate, 
    birthTime, 
    birthPlace: rawBirthPlace,
    gender 
  } = route.params || {};

  // Parse birthPlace if it's a string (JSON)
  const birthPlace = React.useMemo(() => {
    if (!rawBirthPlace) return null;
    
    if (typeof rawBirthPlace === 'string') {
      try {
        return JSON.parse(rawBirthPlace);
      } catch (e) {
        console.error('Error parsing birthPlace:', e);
        return null;
      }
    }
    
    return rawBirthPlace;
  }, [rawBirthPlace]);

  // Fetch chart data from API using React Query
  const { 
    data: chartResponse, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['birthChart', consultationId, birthDate, birthTime, JSON.stringify(birthPlace)],
    queryFn: async () => {
      if (!birthDate || !birthTime || !birthPlace) {
        throw new Error('Missing birth information');
      }
      
      try {
        const birthDetails = {
          date: birthDate,
          time: birthTime,
          place: {
            city: birthPlace?.city || '',
            state: birthPlace?.state || '',
            country: birthPlace?.country || ''
          },
          name,
          gender
        };
        
        return await fetchBirthChartData(birthDetails, consultationId);
      } catch (err) {
        console.error('Error fetching birth chart data:', err);
        throw new Error('Failed to fetch birth chart data');
      }
    },
    retry: 1,
    enabled: !!birthDate && !!birthTime && !!birthPlace
  });

  // Process the chart data for visualization
  const chartData = React.useMemo(() => {
    if (!chartResponse || !chartResponse.data) return null;
    
    // If data is already in the expected format
    if (chartResponse.data.data && chartResponse.data.data.siderealAscendant) {
      return chartResponse.data;
    }
    
    // Otherwise process it
    return processChartDataForVisualization(chartResponse.data);
  }, [chartResponse]);

  // Window dimensions for chart size
  const windowWidth = Dimensions.get('window').width;
  
  // Format dates and times for better display
  const formattedBirthDate = React.useMemo(() => {
    if (!birthDate) return 'N/A';
    
    try {
      // Try to format as readable date
      const date = new Date(birthDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      // If parsing fails, return the original string
      console.warn('Error formatting birth date:', e);
      return birthDate;
    }
  }, [birthDate]);
  
  const formattedBirthTime = React.useMemo(() => {
    if (!birthTime) return 'N/A';
    
    try {
      // Check if it's already a date object
      if (birthTime instanceof Date) {
        return birthTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });
      }
      
      // Try to parse as date string
      if (typeof birthTime === 'string' && birthTime.includes(':')) {
        // For time-only strings, add a dummy date
        const [hours, minutes] = birthTime.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });
      }
      
      // Fallback to original string
      return birthTime;
    } catch (e) {
      console.warn('Error formatting birth time:', e);
      return birthTime;
    }
  }, [birthTime]);

  // Get the ascendant sign from the chart data
  const ascendantSign = chartData?.data?.siderealAscendant?.sign || "Aries";
  
  // Tab content for ascendant chart
  const renderAscendantChart = () => {
    if (!chartData) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No chart data available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.chartContainer}>
        <KundaliChart 
          sign={ascendantSign} 
          data={chartData} 
          isMoon={false}
          isSun={false}
        />
      </View>
    );
  };
  
  // Tab content for sun chart
  const renderSunChart = () => {
    if (!chartData) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No chart data available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.chartContainer}>
        <KundaliChart 
          sign={ascendantSign} 
          data={chartData} 
          isMoon={false}
          isSun={true}
        />
      </View>
    );
  };
  
  // Tab content for moon chart
  const renderMoonChart = () => {
    if (!chartData) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No chart data available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.chartContainer}>
        <KundaliChart 
          sign={ascendantSign} 
          data={chartData} 
          isMoon={true}
          isSun={false}
        />
      </View>
    );
  };
  
  // Tab content for planets
  const renderPlanets = () => {
    if (!chartData || !chartData.data || !chartData.data.planets) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No planet data available</Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.planetsContainer}>
        {chartData.data.planets.map((planet, index) => {
          // Get combined status information
          const planetStatus = getPlanetStatuses(planet);
          
          return (
            <View key={index} style={styles.planetCard}>
              <View style={styles.planetCardHeader}>
                <Text style={styles.planetName}>{planet.name}</Text>
                <View style={styles.planetStatus}>
                  {planetStatus.retrograde && (
                    <Text style={styles.retrogradeText}>Retrograde</Text>
                  )}
                  {planetStatus.combust && (
                    <Text style={styles.combustText}>Combust</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.planetCardContent}>
                <View style={styles.planetDetailRow}>
                  <Text style={styles.planetDetailLabel}>Sign:</Text>
                  <Text style={styles.planetDetailValue}>{planet.sign}</Text>
                </View>
                
                <View style={styles.planetDetailRow}>
                  <Text style={styles.planetDetailLabel}>Degrees:</Text>
                  <Text style={styles.planetDetailValue}>
                    {formatDegrees(planet.degrees, planet.minutes)}
                  </Text>
                </View>
                
                {planet.nakshatra && (
                  <View style={styles.planetDetailRow}>
                    <Text style={styles.planetDetailLabel}>Nakshatra:</Text>
                    <Text style={styles.planetDetailValue}>{planet.nakshatra}</Text>
                  </View>
                )}
                
                {planet.pada && (
                  <View style={styles.planetDetailRow}>
                    <Text style={styles.planetDetailLabel}>Pada:</Text>
                    <Text style={styles.planetDetailValue}>{planet.pada}</Text>
                  </View>
                )}
                
                {planet.status && (
                  <View style={styles.planetDetailRow}>
                    <Text style={styles.planetDetailLabel}>Status:</Text>
                    <Text style={styles.planetDetailValue}>{formatPlanetStatus(planet.status)}</Text>
                  </View>
                )}
                
                <View style={styles.planetStatusRow}>
                  {planetStatus.exalted && (
                    <View style={[styles.statusBadge, styles.exaltedBadge]}>
                      <Text style={styles.statusBadgeText}>Exalted</Text>
                    </View>
                  )}
                  {planetStatus.debilitated && (
                    <View style={[styles.statusBadge, styles.debilitatedBadge]}>
                      <Text style={styles.statusBadgeText}>Debilitated</Text>
                    </View>
                  )}
                  {planetStatus.retrograde && (
                    <View style={[styles.statusBadge, styles.retrogradeBadge]}>
                      <Text style={styles.statusBadgeText}>Retrograde</Text>
                    </View>
                  )}
                  {planetStatus.combust && (
                    <View style={[styles.statusBadge, styles.combustBadge]}>
                      <Text style={styles.statusBadgeText}>Combust</Text>
                    </View>
                  )}
                  {planetStatus.direct && (
                    <View style={[styles.statusBadge, styles.directBadge]}>
                      <Text style={styles.statusBadgeText}>Direct</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };
  
  // Tab content for houses
  const renderHouses = () => {
    if (!chartData || !chartData.data || !chartData.data.houses) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No house data available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.planetsContainer}>
        {chartData.data.houses.map((house, index) => (
          <View key={index} style={styles.planetCard}>
            <View style={styles.planetCardHeader}>
              <Text style={styles.planetName}>House {house.number}</Text>
              <Text style={styles.planetDegree}>{house.sign}</Text>
            </View>
            <View style={styles.planetCardContent}>
              {house.planets && house.planets.length > 0 ? (
                <>
                  <Text style={styles.planetInfo}>Planets: </Text>
                  {house.planets.map((planet, pIndex) => (
                    <Text key={pIndex} style={styles.planetInfo}>- {planet}</Text>
                  ))}
                </>
              ) : (
                <Text style={styles.planetInfo}>No planets in this house</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  // Tab content for remarks
  const renderRemarks = () => {
    if (!chartData || !chartData.data || !chartData.data.remarks) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No remarks available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.remarksContainer}>
        <Text style={styles.remarksText}>{chartData.data.remarks}</Text>
      </View>
    );
  };
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'ascendantChart':
        return renderAscendantChart();
      case 'sunChart':
        return renderSunChart();
      case 'moonChart':
        return renderMoonChart();
      case 'planets':
        return renderPlanets();
      case 'houses':
        return renderHouses();
      case 'remarks':
        return renderRemarks();
      default:
        return renderAscendantChart();
    }
  };
  
  // Handle errors in data fetching
  if (error && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#f44336" />
        <Text style={styles.errorTitle}>Failed to load chart</Text>
        <Text style={styles.errorText}>
          {error.message || "There was an error loading the birth chart data."}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Birth Chart</Text>
          <TouchableOpacity style={styles.headerRight}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Birth Details Card */}
      <View style={styles.detailsCard}>
        <View style={styles.detailsContent}>
          <View style={styles.detailsNameRow}>
            <Text style={styles.personName} numberOfLines={1} ellipsizeMode="tail">{name || 'Birth Chart'}</Text>
            {gender && (
              <View style={styles.genderBadge}>
                <Text style={styles.genderText}>{gender}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailsGridContainer}>
            <View style={styles.detailsColumn}>
              <View style={styles.detailsRow}>
                <View style={styles.detailsIcon}>
                  <Ionicons name="calendar-outline" size={18} color="#7765e3" />
                </View>
                <Text style={styles.detailsText} numberOfLines={1}>{formattedBirthDate}</Text>
              </View>
              <View style={styles.detailsRow}>
                <View style={styles.detailsIcon}>
                  <Ionicons name="time-outline" size={18} color="#7765e3" />
                </View>
                <Text style={styles.detailsText} numberOfLines={1}>{formattedBirthTime}</Text>
              </View>
            </View>
            
            <View style={styles.detailsDivider} />
            
            <View style={styles.detailsColumn}>
              <View style={styles.detailsRow}>
                <View style={styles.detailsIcon}>
                  <Ionicons name="location-outline" size={18} color="#7765e3" />
                </View>
                <Text style={styles.detailsText} numberOfLines={2}>
                  {birthPlace ? 
                    `${birthPlace.city}${birthPlace.state ? `, ${birthPlace.state}` : ''}${birthPlace.country ? `, ${birthPlace.country}` : ''}` 
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabsScrollView}
          contentContainerStyle={styles.tabsScrollViewContent}
        >
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'ascendantChart' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('ascendantChart')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="planet-outline" 
                size={20} 
                color={activeTab === 'ascendantChart' ? '#7765e3' : '#888'} 
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'ascendantChart' && styles.activeTabText
              ]}>Ascendant</Text>
              {activeTab === 'ascendantChart' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'sunChart' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('sunChart')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="sunny-outline" 
                size={20} 
                color={activeTab === 'sunChart' ? '#7765e3' : '#888'} 
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'sunChart' && styles.activeTabText
              ]}>Sun</Text>
              {activeTab === 'sunChart' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'moonChart' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('moonChart')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="moon-outline" 
                size={20} 
                color={activeTab === 'moonChart' ? '#7765e3' : '#888'} 
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'moonChart' && styles.activeTabText
              ]}>Moon</Text>
              {activeTab === 'moonChart' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'planets' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('planets')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="apps-outline" 
                size={20} 
                color={activeTab === 'planets' ? '#7765e3' : '#888'} 
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'planets' && styles.activeTabText
              ]}>Planets</Text>
              {activeTab === 'planets' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'houses' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('houses')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="grid-outline" 
                size={20} 
                color={activeTab === 'houses' ? '#7765e3' : '#888'} 
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'houses' && styles.activeTabText
              ]}>Houses</Text>
              {activeTab === 'houses' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'remarks' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('remarks')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                color={activeTab === 'remarks' ? '#7765e3' : '#888'} 
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'remarks' && styles.activeTabText
              ]}>Remarks</Text>
              {activeTab === 'remarks' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      
      {/* Chart Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7765e3" />
            <Text style={styles.loadingText}>Loading chart data...</Text>
          </View>
        ) : (
          renderTabContent()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    padding: 8,
  },
  detailsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  detailsContent: {
    padding: 16,
  },
  detailsNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  genderBadge: {
    backgroundColor: '#7765e3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  genderText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  detailsGridContainer: {
    flexDirection: 'row',
  },
  detailsColumn: {
    flex: 1,
  },
  detailsDivider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  tabsWrapper: {
    backgroundColor: 'white',
    marginTop: 16,
  },
  tabsScrollView: {
    flexGrow: 0,
  },
  tabsScrollViewContent: {
    paddingHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 48,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    position: 'relative',
    height: '100%',
  },
  activeTabButton: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#7765e3',
  },
  tabIcon: {
    marginRight: 4,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: '#7765e3',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingVertical: 16,
    minHeight: 400,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#555',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  planetCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  planetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  planetDegree: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7765e3',
  },
  planetCardContent: {
    marginTop: 8,
    paddingBottom: 8,
  },
  planetStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retrogradeText: {
    color: '#5B2FDF',
    fontWeight: '500',
    fontSize: 12,
  },
  combustText: {
    color: '#A83500',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 12,
  },
  planetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planetDetailLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
    width: 90,
  },
  planetDetailValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  planetStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 13,
  },
  exaltedBadge: {
    backgroundColor: '#4CAF50',
  },
  debilitatedBadge: {
    backgroundColor: '#F44336',
  },
  retrogradeBadge: {
    backgroundColor: '#5B2FDF',
  },
  combustBadge: {
    backgroundColor: '#A83500',
  },
  directBadge: {
    backgroundColor: '#2196F3',
  },
  planetInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  planetsContainer: {
    paddingHorizontal: 8,
  },
  remarksContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  remarksText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    height: 200,
    margin: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#7765e3',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConsultationChart; 