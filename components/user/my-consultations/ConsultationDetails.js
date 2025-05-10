import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Linking, 
  Share,
  TextInput,
  Clipboard 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { handleRetrieveConsulation, createAuthConfig } from '../../../actions/auth';
import { format } from 'date-fns';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocalSearchParams, router } from 'expo-router';

const ConsultationDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // For Expo Router
  const params = useLocalSearchParams();
  
  // Get consultationId from multiple possible sources (React Navigation route or Expo Router)
  const consultationId = params?.consultationId || (route.params && route.params.consultationId);
  
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingChartId, setLoadingChartId] = useState(null);
  
  // Debugging
  console.log('ConsultationDetails mounted with ID:', consultationId);
  
  // Fetch consultation details
  useEffect(() => {
    const fetchConsultationDetails = async () => {
      try {
        setLoading(true);
        const config = await createAuthConfig();
        
        // Determine if the ID is in KKE format
        const isKKEFormat = /^KKE\w+$/i.test(consultationId);
        console.log(`Fetching consultation with ID: ${consultationId} (${isKKEFormat ? 'KKE format' : 'MongoDB ID format'})`);
        
        const response = await handleRetrieveConsulation(config, consultationId);
        console.log('Consultation fetch response:', response.status);
        
        if (response.status === 200) {
          console.log('Consultation data retrieved successfully');
          // Log entire consultation data structure
          if (response.data) {
            console.log('Consultation data structure:', 
              JSON.stringify(Object.keys(response.data))
            );
            // Log both ID formats if available
            console.log('KKE ID:', response.data.id || 'N/A');
            console.log('MongoDB ID:', response.data._id || 'N/A');
          }
          
          setConsultation(response.data);
          setError(null);
        } else if (response.status === 404) {
          // Specific handling for the 404 error
          console.error('Consultation not found:', response.message);
          setError('Consultation not found. It may have been deleted or the ID is incorrect.');
          setConsultation(null);
        } else {
          console.error('Failed to fetch consultation:', response.message);
          setError(response.message || 'Failed to fetch consultation details');
          setConsultation(null);
        }
      } catch (error) {
        console.error('Error fetching consultation details:', error);
        setError('An error occurred while fetching consultation details');
      } finally {
        setLoading(false);
      }
    };
    
    if (consultationId) {
      fetchConsultationDetails();
    } else {
      console.error('No consultation ID provided');
      setError('No consultation ID provided');
      setLoading(false);
    }
  }, [consultationId]);
  
  // Helper to get a consistent ID for display purposes
  const getDisplayId = (consultation) => {
    if (!consultation) return 'N/A';
    // Use the KKE format ID
    return consultation.id || 'N/A';
  };
  
  // Format date and time
  const getFormattedDateTime = (consultation) => {
    try {
      // For newer format with booking object
      if (consultation?.booking?.date && consultation?.booking?.start_time) {
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
      if (consultation?.start_time) {
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
  
  // Handle back button press - support multiple navigation methods
  const handleBack = () => {
    try {
      // First try native navigation
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else if (router && router.back) {
        // Then try Expo Router
        router.back();
      } else {
        // As fallback, go to my-consultations screen
        navigation.navigate('my-consulatation');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Last resort fallback
      if (router && router.replace) {
        router.replace('/(user)/my-consulatation');
      }
    }
  };
  
  // Handle join call button press
  const handleJoinCall = () => {
    if (!consultation) return;
    
    // Debug the structure of the consultation item
    console.log('Consultation item structure:', JSON.stringify(consultation, null, 2));
    
    // Check multiple possible locations for meeting URL with fallbacks
    const meetingUrl = consultation?.meeting?.link ||
                      (consultation?.meeting && consultation?.meeting.join_url) || 
                      consultation?.meeting_url || 
                      (consultation?.virtual_meeting_info && consultation?.virtual_meeting_info.url);
    
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
  
  // Handle view chart button press
  const handleViewChart = () => {
    if (!consultation || !consultation.id) return;
    
    setLoadingChartId(consultation.id);
    
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
    
    // Extract place of birth components
    const { city, state, country } = parsePlaceOfBirth(
      consultation.place_of_birth || consultation.birth_place
    );
    
    // Prepare data for navigation
    const navigationParams = {
      consultationId: consultation.id,
      name: consultation.name || consultation.user_details?.full_name,
      birthDate: consultation.date_of_birth || consultation.user_details?.birth_date,
      birthTime: consultation.time_of_birth || consultation.user_details?.birth_time,
      birthPlace: {
        city,
        state,
        country
      },
      gender: consultation.gender || consultation.user_details?.gender
    };
    
    try {
      // Navigate to chart view with consultation data
      setTimeout(() => {
        setLoadingChartId(null);
        // Try multiple navigation patterns to handle different navigation structures
        try {
          // Using stack navigation if available
          if (navigation.navigate) {
            navigation.navigate('consultation-chart', navigationParams);
          } else {
            throw new Error('Navigation method not available');
          }
        } catch (error) {
          console.error('Error navigating to chart:', error);
          Alert.alert(
            'Navigation Error',
            'Unable to open the birth chart view. Please try again later.'
          );
        }
      }, 1000);
    } catch (error) {
      console.error('Error preparing chart navigation:', error);
      Alert.alert(
        'Navigation Error',
        'Unable to open the birth chart view. Please try again later.'
      );
      setLoadingChartId(null);
    }
  };
  
  // Handle download invoice button press
  const handleDownloadInvoice = () => {
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
  
  // Handle share consultation button press
  const handleShareConsultation = () => {
    if (!consultation) return;
    
    const { date, time, timezone } = getFormattedDateTime(consultation);
    const message = `My consultation details:\n\nService: ${consultation.service?.name || 'Consultation'}\nDate: ${date}\nTime: ${time}\nTimezone: ${timezone}`;
    
    Share.share({
      message,
      title: 'My Consultation Details',
    }).catch(error => {
      console.error('Error sharing consultation:', error);
    });
  };
  
  // Get consultation status
  const getConsultationStatus = () => {
    if (!consultation) {
      return { 
        value: 'unknown',
        label: 'Unknown',
        color: '#999' 
      };
    }
    
    // If status is already provided, use it
    let statusValue = consultation.status || 'unknown';
    
    // Determine status if not explicitly provided
    if (statusValue === 'unknown') {
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
          return { 
            value: 'unknown',
            label: 'Unknown',
            color: '#999' 
          };
        }
        
        // Check payment status
        const paymentStatus = consultation.payment?.status || 'pending';
        if (paymentStatus === 'cancelled') {
          statusValue = 'cancelled';
        } else {
          // Determine if today, upcoming, or past
          const today = new Date();
          const isToday = dateToCheck.getDate() === today.getDate() &&
                        dateToCheck.getMonth() === today.getMonth() &&
                        dateToCheck.getFullYear() === today.getFullYear();
          
          if (isToday) {
            statusValue = 'today';
          } else if (dateToCheck > today) {
            statusValue = 'upcoming';
          } else if (dateToCheck < today) {
            statusValue = 'completed';
          } else {
            statusValue = 'upcoming'; // Default to upcoming
          }
        }
      } catch (error) {
        console.warn('Error determining consultation status:', error);
        statusValue = 'unknown';
      }
    }
    
    // Map status value to a properly formatted object with label and color
    switch (statusValue) {
      case 'completed':
        return {
          value: 'completed',
          label: 'Completed',
          color: '#f0f9eb',
          textColor: '#52c41a'
        };
      case 'cancelled':
        return {
          value: 'cancelled',
          label: 'Cancelled',
          color: '#fff1f0',
          textColor: '#f5222d'
        };
      case 'today':
        return {
          value: 'today',
          label: 'Today',
          color: '#fff4e5',
          textColor: '#ff9500'
        };
      case 'upcoming':
        return {
          value: 'upcoming',
          label: 'Upcoming',
          color: '#e6f5ff',
          textColor: '#1890ff'
        };
      default:
        return {
          value: 'unknown',
          label: 'Unknown',
          color: '#f5f5f5',
          textColor: '#999'
        };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#f9f9f9" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7765e3" />
          <Text style={styles.loadingText}>Loading consultation details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#f9f9f9" barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Ionicons 
            name={error.includes('not found') ? "information-circle-outline" : "alert-circle-outline"} 
            size={60} 
            color={error.includes('not found') ? "#ff9500" : "#ff3b30"} 
          />
          <Text style={styles.errorTitle}>
            {error.includes('not found') ? 'Consultation Not Found' : 'Error'}
          </Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!consultation) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#f9f9f9" barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="information-circle-outline" size={60} color="#ff9500" />
          <Text style={styles.errorTitle}>Consultation Not Found</Text>
          <Text style={styles.errorMessage}>The consultation details could not be found.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { date, time, timezone } = getFormattedDateTime(consultation);
  // Get the status object with value, label, and color
  const status = getConsultationStatus();
  const isChartLoading = loadingChartId === consultation.id;
  
  // Format the meeting URL to display
  const meetingUrl = consultation?.meeting?.link ||
                      (consultation?.meeting && consultation?.meeting.join_url) || 
                      consultation?.meeting_url || 
                      (consultation?.virtual_meeting_info && consultation?.virtual_meeting_info.url) ||
                      'Not available yet';
  
  // Copy to clipboard function
  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Meeting link copied to clipboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f9f9f9" barStyle="dark-content" />
      
      {/* Back button header */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity 
          style={styles.backButtonWithIcon}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={20} color="#333" style={styles.backIcon} />
          <Text style={styles.backText}>Back to My Consultations</Text>
        </TouchableOpacity>
      </View>
      
      {/* Consultation Details Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Consultation Details</Text>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.cardsContainer}>
          {/* Customer Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Customer Information</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRows}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{consultation.name || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{consultation.attendee_email || 'N/A'}</Text>
                </View>
              </View>
              
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleViewChart}
                  disabled={isChartLoading}
                >
                  {isChartLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.actionButtonText}>View Chart</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Consultation Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Consultation Details</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Consultation ID:</Text>
                <Text style={styles.infoValueBold}>#{getDisplayId(consultation)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Service Type:</Text>
                <Text style={styles.infoValue}>{consultation.service?.name || 'Consultation'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date & Time ({timezone}):</Text>
                <Text style={styles.infoValue}>{date} at {time}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: status.color }
                ]}>
                  <View style={styles.statusDot} />
                  <Text style={[
                    styles.statusText,
                    { color: status.textColor }
                  ]}>{status.label.toLowerCase()}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Payment Information Card */}
          {consultation.payment && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Payment Information</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Amount:</Text>
                  <Text style={styles.infoValueBold}>
                    {consultation.payment.currency === 'gbp' ? '£' : '$'}
                    {consultation.payment.amount || 0}.00
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment ID:</Text>
                  <Text style={styles.infoValue}>{consultation.payment.payment_id || 'N/A'}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Booking Date:</Text>
                  <Text style={styles.infoValue}>
                    {format(new Date(consultation.createdAt || new Date()), 'MMMM d, yyyy \'at\' h:mm a')}
                  </Text>
                </View>
                
                <View style={styles.actionButtonContainer}>
                  <TouchableOpacity 
                    style={styles.greyButton}
                    onPress={handleDownloadInvoice}
                  >
                    <Text style={styles.greyButtonText}>Download Invoice</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          {/* Video Call Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Video Call Details</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Meeting Link:</Text>
                <View style={styles.meetingLinkContainer}>
                  <TextInput
                    style={styles.meetingLinkInput}
                    value={meetingUrl}
                    editable={false}
                  />
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(meetingUrl)}
                  >
                    <Ionicons name="copy-outline" size={16} color="#666" style={styles.copyIcon} />
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity 
                  style={styles.joinButton}
                  onPress={handleJoinCall}
                >
                  <Text style={styles.actionButtonText}>Join Audio/Video Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButtonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backIcon: {
    marginRight: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    gap: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cardContent: {
    padding: 16,
  },
  infoRows: {
    marginBottom: 10,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    width: 130,
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  infoValueBold: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionButtonContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  greyButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  greyButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#4169E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  meetingLinkContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingLinkInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    color: '#333',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  copyIcon: {
    marginRight: 6,
  },
  copyButtonText: {
    fontSize: 14,
    color: '#64748b',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4169E1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ConsultationDetails; 