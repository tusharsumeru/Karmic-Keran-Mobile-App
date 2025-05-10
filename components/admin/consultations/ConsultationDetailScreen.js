import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { handleUpdateConsultationStatus, handleRetrieveConsulation, createAuthConfig } from '../../../actions/auth';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const ConsultationDetailScreen = ({ id }) => {
  const router = useRouter();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Define the fetchConsultationDetails function outside useEffect so we can call it later
  const fetchConsultationDetails = async () => {
    try {
      // Use the ID from props instead of router.params
      const consultationId = id || router.params?.id;
      
      console.log('Using consultationId:', consultationId);
      
      if (!consultationId) {
        console.error('No consultation ID provided in props or router params');
        setError('Please select a consultation from the list');
        setLoading(false);
        return;
      }
      
      // Check if it's a business ID (starting with KK) or a MongoDB ID
      const isBusinessId = typeof consultationId === 'string' && consultationId.startsWith('KK');
      console.log(`Fetching consultation details for ${isBusinessId ? 'business' : 'MongoDB'} ID:`, consultationId);
      
      // Get auth configuration
      const authConfig = await createAuthConfig();
      
      console.log('Auth config created, token exists:', !!authConfig.headers.Authorization);
      
      if (!authConfig.headers.Authorization) {
        console.error('No authorization token found');
        setError('Please login to view consultation details');
        setLoading(false);
        return;
      }
      
      // Fetch consultation by ID
      console.log('Calling handleRetrieveConsulation with ID:', consultationId);
      const response = await handleRetrieveConsulation(authConfig, consultationId);
      console.log('API response status:', response?.status);
      console.log('API response message:', response?.message);
      console.log('API response data exists:', !!response?.data);
      
      if (response?.status === 200 && response?.data) {
        console.log('Consultation data received:', JSON.stringify(response.data).substring(0, 200) + '...');
        // Process the consultation data
        const consultationData = processConsultation(response.data);
        if (!consultationData) {
          console.error('Processing consultation data failed');
          setError('Could not process consultation data');
          setLoading(false);
          return;
        }
        
        setConsultation(consultationData);
        setSelectedStatus(consultationData.status || 'pending');
      } else {
        console.error('Failed to fetch consultation:', response?.message || 'Unknown error');
        
        // Different error message based on if we used business ID or MongoDB ID
        if (isBusinessId) {
          setError(`Consultation with ID ${consultationId} was not found. Please check the ID and try again.`);
        } else {
          setError(response?.message || 'Failed to load consultation details');
        }
      }
    } catch (err) {
      console.error('Error fetching consultation details:', err);
      setError('An error occurred while loading consultation details: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Use the fetchConsultationDetails function in useEffect
  useEffect(() => {
    fetchConsultationDetails();
  }, [id]);

  // Process a single consultation to normalize data structure
  const processConsultation = (rawConsultation) => {
    if (!rawConsultation) {
      console.error('No consultation data to process');
      return null;
    }
    
    try {
      console.log('Processing consultation data, rawConsultation type:', typeof rawConsultation);
      
      // Log available keys to help debug
      const keys = Object.keys(rawConsultation);
      console.log('Available keys:', keys.join(', '));
      
      // First try to get the business ID
      let displayId = '';
      
      if (rawConsultation.id) {
        displayId = rawConsultation.id;
      } else if (rawConsultation.shortId) {
        displayId = rawConsultation.shortId;
      } else if (rawConsultation.displayId) {
        displayId = rawConsultation.displayId;
      } else if (rawConsultation.bookingId) {
        displayId = rawConsultation.bookingId;
      } else if (rawConsultation._id) {
        // Generate from _id if it follows KK pattern or create appropriate format
        if (typeof rawConsultation._id === 'string') {
          if (rawConsultation._id.match(/^KK[A-Z0-9]{5}$/)) {
            displayId = rawConsultation._id;
          } else if (rawConsultation._id.length >= 7) {
            const firstTwo = 'KK';
            const lastFive = rawConsultation._id.slice(-5).toUpperCase();
            displayId = `${firstTwo}${lastFive}`;
          } else {
            displayId = `KK${rawConsultation._id.toUpperCase()}`;
          }
        } else {
          displayId = 'KKXXXXX'; // Fallback if _id isn't a string
        }
      }
      
      console.log('Generated displayId:', displayId);
      
      // Safely extract nested objects with fallbacks
      const client = rawConsultation.client || {};
      const clientName = client.name || rawConsultation.attendee_name || rawConsultation.name || 'Client';
      const clientEmail = client.email || rawConsultation.attendee_email || rawConsultation.email || '';
      const clientPhone = client.phone || rawConsultation.attendee_phone || rawConsultation.phone || '';
      
      // Extract service data
      const service = rawConsultation.service || {};
      const serviceType = rawConsultation.type || (service.name) || 'Consultation';
      const serviceDuration = rawConsultation.duration || (service.duration) || 60;
      
      // Extract meeting URL from all possible locations
      const meetingInfo = {
        url: null,
        provider: null
      };
      
      if (rawConsultation.meeting) {
        if (typeof rawConsultation.meeting === 'string') {
          // Simple string meeting field
          meetingInfo.url = rawConsultation.meeting;
        } else if (rawConsultation.meeting.link || rawConsultation.meeting.url) {
          // Object with link property
          meetingInfo.url = rawConsultation.meeting.link || rawConsultation.meeting.url;
          meetingInfo.provider = rawConsultation.meeting.provider || 'Unknown';
        }
      } else if (rawConsultation.meeting_url) {
        meetingInfo.url = rawConsultation.meeting_url;
      } else if (rawConsultation.virtual_meeting_info && rawConsultation.virtual_meeting_info.url) {
        meetingInfo.url = rawConsultation.virtual_meeting_info.url;
        meetingInfo.provider = rawConsultation.virtual_meeting_info.provider || 'Unknown';
      } else if (rawConsultation.booking && rawConsultation.booking.meeting) {
        const bookingMeeting = rawConsultation.booking.meeting;
        if (typeof bookingMeeting === 'string') {
          meetingInfo.url = bookingMeeting;
        } else {
          meetingInfo.url = bookingMeeting.link || bookingMeeting.url;
          meetingInfo.provider = bookingMeeting.provider || 'Unknown';
        }
      }
      
      // Extract date/time from various possible fields
      const startTime = rawConsultation.start_time || rawConsultation.startTime || 
                      rawConsultation.scheduledTime || rawConsultation.date ||
                      rawConsultation.datetime || rawConsultation.dateTime;
              
      // Extract created_at from various possible fields
      const createdAt = rawConsultation.created_at || rawConsultation.createdAt || 
                     (rawConsultation.booking && (rawConsultation.booking.createdAt || rawConsultation.booking.created_at));
      
      // Thoroughly check payment status from all possible structures
      let isPaid = false;
      if (rawConsultation.isPaid !== undefined) {
        isPaid = Boolean(rawConsultation.isPaid);
      } else if (rawConsultation.payment) {
        if (typeof rawConsultation.payment === 'boolean') {
          isPaid = rawConsultation.payment;
        } else {
          const paymentStatus = rawConsultation.payment.status || rawConsultation.payment.paymentStatus;
          isPaid = paymentStatus === 'paid' || 
                  paymentStatus === 'completed' || 
                  paymentStatus === 'successful' ||
                  paymentStatus === true;
        }
      } else if (rawConsultation.paymentStatus) {
        isPaid = rawConsultation.paymentStatus === 'paid' || 
                rawConsultation.paymentStatus === 'completed' ||
                rawConsultation.paymentStatus === true;
      } else if (rawConsultation.booking && rawConsultation.booking.isPaid !== undefined) {
        isPaid = Boolean(rawConsultation.booking.isPaid);
      }
      
      // Extract payment amount/price from various possible fields
      const price = rawConsultation.price || rawConsultation.amount || 
                  (rawConsultation.booking && (rawConsultation.booking.price || rawConsultation.booking.amount)) ||
                  (rawConsultation.payment && (rawConsultation.payment.amount || rawConsultation.payment.price));
      
      // Extract payment method from various possible fields
      const paymentMethod = rawConsultation.payment_method || 
                          rawConsultation.paymentMethod ||
                          (rawConsultation.payment && (
                            typeof rawConsultation.payment === 'object' ? (
                            rawConsultation.payment.method || 
                            rawConsultation.payment.paymentMethod ||
                            rawConsultation.payment.gateway ||
                            rawConsultation.payment.provider
                            ) : null
                          ));
      
      return {
        _id: rawConsultation._id || '',
        id: rawConsultation.id || '',
        displayId: displayId || 'KK' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        type: serviceType,
        start_time: startTime || new Date().toISOString(),
        duration: serviceDuration,
        status: rawConsultation.status || 'pending',
        client: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone
        },
        notes: rawConsultation.notes || rawConsultation.additionalNotes || '',
        price: price,
        isPaid: isPaid,
        payment_method: paymentMethod,
        meeting: meetingInfo,
        created_at: createdAt
      };
    } catch (error) {
      console.error('Error processing consultation data:', error);
      return null;
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#f59e0b', icon: 'time-outline' },
    { value: 'upcoming', label: 'Upcoming', color: '#3b82f6', icon: 'calendar-outline' },
    { value: 'today', label: 'Today', color: '#fd7e14', icon: 'today-outline' },
    { value: 'completed', label: 'Completed', color: '#16a34a', icon: 'checkmark-circle-outline' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444', icon: 'close-circle-outline' }
  ];

  const formatDateTime = (dateString, format = 'full') => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const options = { 
        weekday: 'short',
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
      };
      
      const timeOptions = {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      };
      
      if (format === 'full') {
        return `${date.toLocaleDateString('en-GB', options)} at ${date.toLocaleTimeString('en-GB', timeOptions).toLowerCase()}`;
      } else if (format === 'date') {
        return date.toLocaleDateString('en-GB', options);
      } else if (format === 'time') {
        return date.toLocaleTimeString('en-GB', timeOptions).toLowerCase();
      }
      
      return date.toLocaleDateString('en-GB', options);
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'Date error';
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : '#6b7280';
  };

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.icon : 'help-circle-outline';
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    setShowStatusDropdown(false);
  };

  const handleSaveStatus = async () => {
    if (selectedStatus !== consultation.status) {
      setIsLoading(true);
      try {
        // Make sure to use the MongoDB _id for API operations
        console.log(`Updating consultation ${consultation._id} status to ${selectedStatus}`);
        
        // Call the API to update the status
        const result = await handleUpdateConsultationStatus(consultation._id, selectedStatus);
        
        // Check if the update was successful
        if (result && result.success) {
          console.log('Status update successful');
          setUpdateSuccess(true);
          
          // Reset success message after a few seconds
          setTimeout(() => {
            setUpdateSuccess(false);
          }, 3000);
          
          // Pass back the updated consultation to the previous screen
          navigateToConsultations({
            updatedConsultation: {
              ...consultation,
              status: selectedStatus
            }
          });
        } else {
          console.error('Status update failed:', result?.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error updating consultation status:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Update the navigation methods to avoid potential errors
  const goBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error('Error navigating back:', error);
      // Fallback to navigating to admin consultations
      router.push('/admin-consultations');
    }
  };
  
  // Update navigation.navigate to use router with error handling
  const navigateToConsultations = (params) => {
    try {
      router.push({
        pathname: '/(admin)/admin-consultations',
        params
      });
    } catch (error) {
      console.error('Error navigating to consultations:', error);
      // Simple fallback if push with params fails
      router.push('/(admin)/admin-consultations');
    }
  };

  // Add this function to handle navigation to KundaliPlanet
  const handleViewChart = () => {
    if (consultation && consultation._id) {
      try {
        console.log('Navigating to kundali chart with ID:', consultation._id);
        router.push({
          pathname: '/(admin)/kundali-chart',
          params: { consultationId: consultation._id }
        });
      } catch (error) {
        console.error('Error navigating to kundali chart:', error);
      }
    } else {
      console.log('No consultation ID available for chart view');
    }
  };

  // Show loading state if still fetching data
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading consultation details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if there was an error
  if (error || !consultation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Consultation Not Found</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>
            {error || "The consultation details could not be loaded."}
          </Text>
          <View style={styles.errorActions}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setError(null);
                fetchConsultationDetails(); // Call the fetchConsultationDetails function again
              }}
            >
              <Ionicons name="refresh" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.backToListButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backToListButtonText}>Back to Consultations</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBack}
        >
          <Ionicons name="arrow-back" size={20} color="#444" />
          <Text style={styles.backButtonText}>Back to My Consultations</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsGrid}>
          {/* Customer Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Customer Information</Text>
            </View>
            <View style={[styles.cardContent, { paddingTop: 20, paddingBottom: 20 }]}>
              <View style={styles.customerDetailContainer}>
                <View style={styles.customerDetailRow}>
                  <Text style={styles.customerDetailLabel}>Name:</Text>
                  <Text style={styles.customerDetailValue}>{consultation.client.name}</Text>
                </View>
                <View style={styles.customerDetailRow}>
                  <Text style={styles.customerDetailLabel}>Email:</Text>
                  <Text style={styles.customerDetailValue}>{consultation.client.email}</Text>
                </View>
                {consultation.client.phone && (
                  <View style={styles.customerDetailRow}>
                    <Text style={styles.customerDetailLabel}>Phone:</Text>
                    <Text style={styles.customerDetailValue}>{consultation.client.phone}</Text>
                  </View>
                )}
              </View>
              
              <View style={[styles.cardActions, { marginTop: 20 }]}>
                <TouchableOpacity 
                  style={styles.viewChartButton}
                  onPress={handleViewChart}
                >
                  <Text style={styles.viewChartButtonText}>View Chart</Text>
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
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Consultation ID:</Text>
                <Text style={[styles.detailValue, styles.boldValue]}>#{consultation.displayId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Service Type:</Text>
                <Text style={styles.detailValue}>{consultation.type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time:</Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(consultation.start_time)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge, 
                  { 
                    backgroundColor: consultation.status === 'upcoming' ? '#EBF5FF' : 
                                    consultation.status === 'completed' ? '#F0FDF4' :
                                    consultation.status === 'today' ? '#FFF7ED' :
                                    consultation.status === 'cancelled' ? '#FEF2F2' : '#F3F4F6',
                    borderColor: consultation.status === 'upcoming' ? '#93C5FD' : 
                                consultation.status === 'completed' ? '#86EFAC' :
                                consultation.status === 'today' ? '#FDBA74' :
                                consultation.status === 'cancelled' ? '#FCA5A5' : '#E5E7EB'
                  }
                ]}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: consultation.status === 'upcoming' ? '#3B82F6' : 
                                    consultation.status === 'completed' ? '#22C55E' :
                                    consultation.status === 'today' ? '#F59E0B' :
                                    consultation.status === 'cancelled' ? '#EF4444' : '#6B7280' 
                  }]} />
                  <Text style={[
                    styles.statusText, 
                    { 
                      color: consultation.status === 'upcoming' ? '#1D4ED8' : 
                            consultation.status === 'completed' ? '#15803D' :
                            consultation.status === 'today' ? '#B45309' :
                            consultation.status === 'cancelled' ? '#B91C1C' : '#374151' 
                    }
                  ]}>
                    {consultation.status}
                  </Text>
                </View>
              </View>
              {consultation.duration && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{consultation.duration} minutes</Text>
                </View>
              )}
              {consultation.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes:</Text>
                  <Text style={styles.detailValue}>{consultation.notes}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Payment Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Payment Information</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={[styles.detailValue, styles.boldValue]}>
                  £{consultation.price || 'N/A'}
                </Text>
              </View>
              {consultation.payment_method && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Method:</Text>
                  <Text style={styles.detailValue}>{consultation.payment_method}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[
                  styles.paymentBadge, 
                  consultation.isPaid ? styles.paidBadge : styles.unpaidBadge
                ]}>
                  <Text style={styles.paymentBadgeText}>
                    {consultation.isPaid ? 'Paid' : 'Unpaid'}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Booking Date:</Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(consultation.created_at)}
                </Text>
              </View>
              
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.invoiceButton}>
                  <Text style={styles.invoiceButtonText}>Download Invoice</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Video Call Details Card */}
          {consultation.meeting && consultation.meeting.url && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Video Call Details</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={[styles.detailRow, { alignItems: 'center' }]}>
                  <Text style={styles.detailLabel}>Meeting Link:</Text>
                  <View style={styles.meetingLinkContainer}>
                    <TextInput
                      style={styles.meetingLinkInput}
                      value={consultation.meeting.url}
                      editable={false}
                    />
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => {
                        if (consultation.meeting.url) {
                          // On actual devices, you'd use Clipboard API
                          console.log('Copy to clipboard:', consultation.meeting.url);
                        }
                      }}
                    >
                      <Ionicons name="copy-outline" size={16} color="#444" style={styles.buttonIcon} />
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.joinMeetingButton}
                    onPress={() => {
                      if (consultation.meeting.url) {
                        Linking.openURL(consultation.meeting.url)
                          .catch(err => console.error('Error opening meeting URL:', err));
                      }
                    }}
                  >
                    <Text style={styles.joinMeetingButtonText}>Join Audio/Video Call</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  cardsGrid: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    width: 120,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    color: '#111827',
    flexWrap: 'wrap',
  },
  boldValue: {
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 24,
  },
  viewChartButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
  },
  viewChartButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
  },
  invoiceButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  invoiceButtonText: {
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 14,
  },
  meetingLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  meetingLinkInput: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
    color: '#111827',
    marginRight: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonIcon: {
    marginRight: 6,
  },
  copyButtonText: {
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 14,
  },
  joinMeetingButton: {
    backgroundColor: '#4169E1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  joinMeetingButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  paymentBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  paidBadge: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  unpaidBadge: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  backToListButton: {
    marginTop: 16,
    backgroundColor: '#4b5563',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  backToListButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  customerDetailContainer: {
    width: '100%',
    marginBottom: 8,
  },
  customerDetailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  customerDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    width: 60,
    paddingRight: 10,
  },
  customerDetailValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
});

export default ConsultationDetailScreen; 