import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert, Modal, Linking, Platform, Share, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { format, parseISO, isToday, isFuture, isPast } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

/**
 * Renders a list of user consultations with filtering options
 */
const ConsultationList = ({ consultations: initialConsultations, loading, activeFilter, onFilterChange, onViewDetails, onViewChart }) => {
  const navigation = useNavigation();
  const [consultations, setConsultations] = useState(initialConsultations || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingChartId, setLoadingChartId] = useState(null);
  
  // Update consultations when initialConsultations change
  useEffect(() => {
    setConsultations(initialConsultations || []);
  }, [initialConsultations]);
  
  // Filter consultations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setConsultations(initialConsultations || []);
      return;
    }
    
    const filtered = (initialConsultations || []).filter(item => {
      const serviceName = (item.service?.name || '').toLowerCase();
      const status = (item.status || '').toLowerCase();
      const search = searchQuery.toLowerCase();
      
      return serviceName.includes(search) || status.includes(search);
    });
    
    setConsultations(filtered);
  }, [searchQuery, initialConsultations]);

  // Date and time formatting functions
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return dateString || 'N/A';
    }
  };

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return format(date, 'h:mm a');
    } catch (error) {
      console.warn('Error formatting time:', error);
      return timeString || 'N/A';
    }
  };
  
  const getFormattedDateTime = (consultation) => {
    try {
      // For newer format with booking object
      if (consultation.booking?.date && consultation.booking?.start_time) {
        const dateStr = consultation.booking.date;
        const timeStr = consultation.booking.start_time;
        const timezone = consultation.timezone || 'UTC';
        
        // Create a properly formatted date-time string
        const dateTimeStr = `${dateStr}T${timeStr}:00`;
        const date = new Date(dateTimeStr);
        
        return {
          date: format(date, 'EEE, MMMM d, yyyy'),
          time: format(date, 'h:mm a'),
          timezone
        };
      }
      
      // For older format with start_time field
      if (consultation.start_time) {
        const date = new Date(consultation.start_time);
        return {
          date: format(date, 'EEE, MMMM d, yyyy'),
          time: format(date, 'h:mm a'),
          timezone: consultation.timezone || 'UTC'
        };
      }
      
      return { date: 'N/A', time: 'N/A', timezone: 'UTC' };
    } catch (error) {
      console.warn('Error formatting date-time:', error);
      return { date: 'N/A', time: 'N/A', timezone: 'UTC' };
    }
  };
  
  // Determine consultation status
  const getConsultationStatus = (consultation) => {
    // If status is already provided, use it
    if (consultation.status) {
      return consultation.status;
    }
    
    try {
      let dateToCheck;
      
      // Check if using new booking format or old start_time format
      if (consultation.booking?.date && consultation.booking?.start_time) {
        const dateStr = consultation.booking.date;
        const timeStr = consultation.booking.start_time;
        dateToCheck = new Date(`${dateStr}T${timeStr}:00`);
      } else if (consultation.start_time) {
        dateToCheck = new Date(consultation.start_time);
      } else {
        return 'unknown';
      }
      
      // Check payment status
      const paymentStatus = consultation.payment?.status || 'pending';
      if (paymentStatus === 'cancelled') {
        return 'cancelled';
      }
      
      // Determine if today, upcoming, or past
      if (isToday(dateToCheck)) {
        return 'today';
      } else if (isFuture(dateToCheck)) {
        return 'upcoming';
      } else if (isPast(dateToCheck)) {
        return 'completed';
      }
      
      return 'upcoming'; // Default to upcoming
    } catch (error) {
      console.warn('Error determining consultation status:', error);
      return 'unknown';
    }
  };
  
  // Handle consultation actions
  const handleViewDetails = (item) => {
    if (onViewDetails) {
      // If parent component provided a handler, use it
      onViewDetails(item);
    } else {
      // Navigate to consultation details screen instead of showing modal
      try {
        // ALWAYS use the KKE format ID (item.id) when available
        // Only fall back to MongoDB ID (_id) if necessary
        const consultationId = item.id;
        
        console.log('Navigating to details with ID (KKE format preferred):', consultationId);
        
        if (!consultationId) {
          Alert.alert('Error', 'Unable to find consultation details.');
          return;
        }
        
        try {
          // Try with expo-router first (most reliable in Expo environment)
          router.push({
            pathname: '/(user)/consultation-details',
            params: { consultationId }
          });
        } catch (routerError) {
          console.error('Router navigation failed:', routerError);
          
          // Fall back to using navigation directly
          try {
            navigation.navigate('consultation-details', { consultationId });
          } catch (navError) {
            console.error('Navigation failed:', navError);
            
            // Last resort - try direct push to screen
            router.push(`/(user)/consultation-details?consultationId=${consultationId}`);
          }
        }
      } catch (error) {
        console.error('Error navigating to details:', error);
        Alert.alert('Error', 'Unable to navigate to consultation details.');
      }
    }
  };
  
  const handleViewChart = (item) => {
    // First check if parent component provided a handler
    if (onViewChart) {
      setLoadingChartId(item.id);
      
      // Use setTimeout to show loading indicator for better UX
      setTimeout(() => {
        setLoadingChartId(null);
        onViewChart(item);
      }, 1000);
      
      return;
    }
    
    // If no parent handler, use our internal implementation
    try {
      // Parse place of birth to get city, state, and country
      const parsePlaceOfBirth = (placeOfBirth = "") => {
        const parts = placeOfBirth
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
    
        let city = "";
        let state = "";
        let country = "";
    
        if (parts.length >= 2) {
          country = parts[parts.length - 1]; // last part is always country
          const possibleState = parts[parts.length - 2];
    
          // Check if possibleState is a number (e.g., postal code)
          const isPinCode = /^\d{4,6}$/.test(possibleState);
    
          if (isPinCode) {
            state = parts[parts.length - 3] || "";
          } else {
            state = possibleState;
          }
    
          city = parts[0]; // assume city is the first item
    
          if (!state) state = city; // fallback
        }
    
        return { city, state, country };
      };
      
      // Set loading indicator for this specific consultation
      setSelectedConsultation(item);
      setLoadingChartId(item.id || item._id);
      
      // Extract place of birth components
      const { city, state, country } = parsePlaceOfBirth(item.place_of_birth || item.birth_place || "");
      
      // Prepare data for navigation
      const birthPlaceObject = {
        city,
        state,
        country
      };
      
      // Convert birthPlaceObject to JSON string for passing through URL params
      const birthPlaceString = JSON.stringify(birthPlaceObject);
      
      // Log navigation attempt to help with debugging
      console.log('Attempting to navigate to chart with params:', JSON.stringify({
        consultationId: item.id || item._id,
        name: item.name || item.user_details?.full_name,
        birthDate: item.date_of_birth || item.user_details?.birth_date,
        birthTime: item.time_of_birth || item.user_details?.birth_time,
        birthPlace: birthPlaceString,
        gender: item.gender || item.user_details?.gender
      }));
      
      // In a real app, you would make an API call here to get the chart data
      // For now, we'll simulate the delay and then navigate
      setTimeout(() => {
        setLoadingChartId(null);
        
        try {
          // Navigate to chart view with consultation data using router.push for Expo Router
          router.push({
            pathname: '/(user)/consultation-chart',
            params: {
              consultationId: item.id || item._id,
              name: item.name || item.user_details?.full_name,
              birthDate: item.date_of_birth || item.user_details?.birth_date,
              birthTime: item.time_of_birth || item.user_details?.birth_time,
              birthPlace: birthPlaceString,
              gender: item.gender || item.user_details?.gender
            }
          });
        } catch (navError) {
          console.error('Navigation error:', navError);
          Alert.alert(
            'Navigation Error',
            'Unable to open the birth chart view. Please try again later.'
          );
        }
      }, 1500);
    } catch (error) {
      console.error('Error preparing chart data:', error);
      Alert.alert(
        'Error',
        'Failed to prepare chart data. Please try again.'
      );
      setLoadingChartId(null);
    }
  };
  
  const handleJoinCall = (item) => {
    // Debug the structure of the consultation item
    console.log('Consultation item structure:', JSON.stringify(item, null, 2));
    
    // Check multiple possible locations for meeting URL with fallbacks
    const meetingUrl = item?.meeting?.link ||
                      (item?.meeting && item?.meeting.join_url) || 
                      item?.meeting_url || 
                      (item?.virtual_meeting_info && item?.virtual_meeting_info.url);
    
    console.log('Meeting URL found:', meetingUrl);
    
    if (!meetingUrl) {
      Alert.alert(
        'No Meeting Link Available',
        'The meeting link for this consultation is not available yet. It will be available closer to the scheduled time.',
        [
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
      return;
    }
    
    // Open the URL using the Linking API
    Linking.openURL(meetingUrl).catch(err => {
      console.error('Error opening URL:', err);
      Alert.alert(
        'Cannot Open Link',
        'Unable to open the meeting link. Please try again or copy the link manually.'
      );
    });
  };
  
  const handleDownloadInvoice = (item) => {
    Alert.alert(
      'Download Invoice',
      'The invoice will be downloaded to your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Download', 
          onPress: () => {
            Alert.alert('Success', 'Invoice downloaded successfully!');
          }
        }
      ]
    );
  };
  
  const handleShareConsultation = (item) => {
    const { date, time, timezone } = getFormattedDateTime(item);
    const message = `My consultation details:\n\nService: ${item.service?.name || 'Consultation'}\nDate: ${date}\nTime: ${time}\nTimezone: ${timezone}`;
    
    Share.share({
      message,
      title: 'My Consultation Details',
    }).catch(error => {
      console.error('Error sharing consultation:', error);
    });
  };

  // Render consultation item with enhanced UI
  const renderConsultationItem = ({ item }) => {
    const status = getConsultationStatus(item);
    const { date, time, timezone } = getFormattedDateTime(item);
    const isChartLoading = loadingChartId === (item._id || item.id);
    
    return (
      <View style={styles.consultationCard}>
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={() => handleViewDetails(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.serviceName}>{item.service?.name || 'Consultation'}</Text>
            <View style={[
              styles.statusBadge, 
              status === 'completed' ? styles.completedBadge : 
              status === 'cancelled' ? styles.cancelledBadge : 
              status === 'today' ? styles.todayBadge :
              styles.upcomingBadge
            ]}>
              {status === 'today' && <View style={styles.statusDot} />}
              <Text style={[
                styles.statusText,
                status === 'today' ? styles.todayStatusText : 
                status === 'completed' ? styles.completedStatusText : 
                status === 'cancelled' ? styles.cancelledStatusText : 
                status === 'upcoming' ? styles.upcomingStatusText : 
                styles.upcomingStatusText
              ]}>
                {status === 'completed' ? 'Completed' : 
                 status === 'cancelled' ? 'Cancelled' : 
                 status === 'today' ? 'Today' :
                 'Upcoming'}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailsRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {date}
            </Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {time} ({timezone})
            </Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Ionicons name="hourglass-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.service?.duration || 30} minutes
            </Text>
          </View>
          
          {item.payment && (
            <View style={styles.detailsRow}>
              <Ionicons name="wallet-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {item.payment.currency?.toUpperCase() || 'GBP'} {item.payment.amount || 0}
                <Text style={styles.paymentStatus}>
                  • {item.payment.status === 'completed' ? 'Paid' : 'Pending'}
                </Text>
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.buttonsContainer}>
          {/* View Chart Button - always visible */}
          <TouchableOpacity 
            style={styles.viewChartButton}
            onPress={() => !isChartLoading && handleViewChart(item)}
            disabled={isChartLoading}
          >
            {isChartLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.viewChartButtonText}>View Chart</Text>
            )}
          </TouchableOpacity>

          {/* Join Audio/Video Call Button - always visible */}
          <TouchableOpacity 
            style={styles.joinCallButton}
            onPress={() => handleJoinCall(item)}
          >
            <Text style={styles.joinCallButtonText}>Join Audio/Video Call</Text>
          </TouchableOpacity>
          
          {/* More Details Button - always visible */}
          <TouchableOpacity 
            style={styles.moreDetailsButton}
            onPress={() => {
              // Use our handleViewDetails function to navigate to details screen
              if (item && item.id) {
                console.log('More Details button clicked for consultation:', item.id, '(Using KKE format)');
                
                try {
                  // Use handleViewDetails function which has proper error handling
                  handleViewDetails(item);
                } catch (error) {
                  console.error('Error navigating to consultation details:', error);
                  Alert.alert(
                    'Navigation Error',
                    'Unable to view consultation details. Please try again.'
                  );
                }
              } else {
                // Fallback if no item or ID
                Alert.alert('Info', 'No additional details available for this consultation.');
              }
            }}
          >
            <Text style={styles.moreDetailsButtonText}>More Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Search bar component
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search consultations..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#999"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Empty state component with enhanced UI
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar" size={70} color="#e0e0e0" />
      <Text style={styles.emptyStateTitle}>No consultations found</Text>
      <Text style={styles.emptyStateMessage}>
        {searchQuery ? 
          `No results found for "${searchQuery}". Try a different search term.` :
          activeFilter === 'upcoming' ? 
          "You don't have any upcoming consultations scheduled." :
          activeFilter === 'past' || activeFilter === 'completed' ? 
          "You don't have any past consultations." :
          activeFilter === 'today' ?
          "You don't have any consultations scheduled for today." :
          "No consultations found. Book a consultation to get started."}
      </Text>
      
      {!searchQuery && (
        <TouchableOpacity style={styles.bookNowButton}>
          <Text style={styles.bookNowText}>Book a Consultation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Render consultation details modal
  const renderDetailsModal = () => {
    if (!selectedConsultation) return null;
    
    const { date, time, timezone } = getFormattedDateTime(selectedConsultation);
    const status = getConsultationStatus(selectedConsultation);
    const isChartLoading = loadingChartId === (selectedConsultation._id || selectedConsultation.id);
    
    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Consultation Details</Text>
              <TouchableOpacity 
                onPress={() => setShowDetailsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Service Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Service:</Text>
                  <Text style={styles.infoValue}>{selectedConsultation.service?.name || 'Consultation'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Duration:</Text>
                  <Text style={styles.infoValue}>{selectedConsultation.service?.duration || 30} minutes</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <View style={[
                    styles.statusBadge, 
                    styles.smallStatusBadge,
                    status === 'completed' ? styles.completedBadge : 
                    status === 'cancelled' ? styles.cancelledBadge : 
                    status === 'today' ? styles.todayBadge :
                    styles.upcomingBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      styles.smallStatusText,
                      status === 'today' ? styles.todayStatusText : 
                      status === 'completed' ? styles.completedStatusText : 
                      status === 'cancelled' ? styles.cancelledStatusText : 
                      styles.upcomingStatusText
                    ]}>
                      {status === 'completed' ? 'Completed' : 
                       status === 'cancelled' ? 'Cancelled' : 
                       status === 'today' ? 'Today' :
                       'Upcoming'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Schedule</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date:</Text>
                  <Text style={styles.infoValue}>{date}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Time:</Text>
                  <Text style={styles.infoValue}>{time}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Timezone:</Text>
                  <Text style={styles.infoValue}>{timezone}</Text>
                </View>
              </View>
              
              {selectedConsultation.payment && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Payment</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Amount:</Text>
                    <Text style={styles.infoValue}>
                      {selectedConsultation.payment.currency?.toUpperCase() || 'GBP'} {selectedConsultation.payment.amount || 0}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status:</Text>
                    <Text style={[
                      styles.infoValue,
                      selectedConsultation.payment.status === 'completed' ? styles.successText : styles.pendingText
                    ]}>
                      {selectedConsultation.payment.status === 'completed' ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Method:</Text>
                    <Text style={styles.infoValue}>{selectedConsultation.payment.method || 'Card'}</Text>
                  </View>
                </View>
              )}
              
              {status === 'today' && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.joinButton]}
                  onPress={() => {
                    setShowDetailsModal(false);
                    handleJoinCall(selectedConsultation);
                  }}
                >
                  <Ionicons name="videocam-outline" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.modalButtonText}>Join Video Call</Text>
                </TouchableOpacity>
              )}
              
              {status === 'completed' && (
                <View style={styles.modalButtonGroup}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.downloadButton]}
                    onPress={() => handleDownloadInvoice(selectedConsultation)}
                  >
                    <Ionicons name="download-outline" size={18} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.modalButtonText}>Download Invoice</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.chartButton, isChartLoading && styles.disabledButton]}
                    onPress={() => {
                      setShowDetailsModal(false);
                      if (!isChartLoading) handleViewChart(selectedConsultation);
                    }}
                    disabled={isChartLoading}
                  >
                    {isChartLoading ? (
                      <ActivityIndicator size="small" color="#fff" style={styles.buttonIcon} />
                    ) : (
                      <Ionicons name="pie-chart-outline" size={18} color="#fff" style={styles.buttonIcon} />
                    )}
                    <Text style={styles.modalButtonText}>
                      {isChartLoading ? 'Loading...' : 'View Birth Chart'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Advanced filter container */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'upcoming' && styles.activeFilterButton
          ]}
          onPress={() => onFilterChange('upcoming')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'upcoming' && styles.activeFilterText
          ]}>Upcoming</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'today' && styles.activeFilterButton
          ]}
          onPress={() => onFilterChange('today')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'today' && styles.activeFilterText
          ]}>Today</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'completed' && styles.activeFilterButton
          ]}
          onPress={() => onFilterChange('completed')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'completed' && styles.activeFilterText
          ]}>Completed</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && styles.activeFilterButton
          ]}
          onPress={() => onFilterChange('all')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'all' && styles.activeFilterText
          ]}>All</Text>
        </TouchableOpacity>
      </View>
      
      {/* Search bar */}
      {renderSearchBar()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7765e3" />
          <Text style={styles.loadingText}>Loading consultations...</Text>
        </View>
      ) : (
        <FlatList
          data={consultations}
          renderItem={renderConsultationItem}
          keyExtractor={item => item.id || String(Math.random())}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            // If there's a refresh callback, call it
            if (onFilterChange) {
              onFilterChange(activeFilter, () => setIsRefreshing(false));
            } else {
              // Otherwise just simulate a refresh
              setTimeout(() => setIsRefreshing(false), 1000);
            }
          }}
        />
      )}
      
      {/* Consultation details modal */}
      {renderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#f0f2f5',
    padding: 4,
    marginHorizontal: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterButton: {
    backgroundColor: '#7765e3',
    shadowColor: '#7765e3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 6,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  consultationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  smallStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upcomingBadge: {
    backgroundColor: '#e6f5ff',
  },
  todayBadge: {
    backgroundColor: '#fff4e5',
  },
  completedBadge: {
    backgroundColor: '#f0f9eb',
  },
  cancelledBadge: {
    backgroundColor: '#fff1f0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff9500',
    marginRight: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  smallStatusText: {
    fontSize: 12,
  },
  upcomingStatusText: {
    color: '#1890ff',
  },
  todayStatusText: {
    color: '#ff9500',
  },
  completedStatusText: {
    color: '#52c41a',
  },
  cancelledStatusText: {
    color: '#f5222d',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  paymentStatus: {
    color: '#888',
    marginLeft: 5,
  },
  buttonsContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  viewChartButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  viewChartButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  joinCallButton: {
    backgroundColor: '#E05D00', // orange-600 equivalent
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  joinCallButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  moreDetailsButton: {
    backgroundColor: '#F3F4F6', // gray-100 equivalent
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  moreDetailsButtonText: {
    color: '#4B5563', // gray-700 equivalent
    fontWeight: '500',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  emptyStateMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  bookNowButton: {
    backgroundColor: '#7765e3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  successText: {
    color: '#52c41a',
  },
  pendingText: {
    color: '#faad14',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7765e3',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 8,
  },
  chartButton: {
    backgroundColor: '#5b42bb',
  },
  disabledButton: {
    backgroundColor: '#c5c5c5',
    opacity: 0.7,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
    gap: 10,
  },
  externalLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  externalLinkText: {
    color: '#666',
    fontSize: 14,
  },
  externalLink: {
    color: '#7765e3',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ConsultationList; 