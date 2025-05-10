import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  FlatList,
  Dimensions,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAuthConfig, handleRetrieveConsulations, updateConsultationStatus } from '../../../actions/auth';
import { useRouter } from 'expo-router';
import ConsultationDetails from './ConsultationDetails';

const { width } = Dimensions.get('window');

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth configuration
      const authConfig = await createAuthConfig();
      
      if (!authConfig.headers.Authorization) {
        setError('Please login to view consultations');
        setLoading(false);
        return;
      }
      
      // Set source parameter based on active filter
      let source = 'all';
      if (activeFilter === 'today') source = 'today';
      if (activeFilter === 'upcoming') source = 'upcoming';
      if (activeFilter === 'completed') source = 'completed';
      
      // Fetch consultations
      const response = await handleRetrieveConsulations(authConfig, source);
      
      if (response.status === 200 && response.data) {
        // Process consultations
        const processedData = processConsultations(
          response.data.filter(consultation => 
            consultation !== null && consultation.status !== 'cancelled'
          )
        );
        
        setConsultations(processedData);
        applyFilter(activeFilter, processedData);
      } else {
        setError(response.message || 'Failed to load consultations. Please try again.');
        setConsultations([]);
        setFilteredConsultations([]);
      }
    } catch (err) {
      console.error('Exception while fetching consultations:', err);
      setError('An error occurred while fetching consultations. Please check your connection and try again.');
      setConsultations([]);
      setFilteredConsultations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    const updatedConsultation = router.params?.updatedConsultation;
    if (updatedConsultation) {
      console.log('Received updated consultation from detail screen:', updatedConsultation);
      
      // Update the consultations list with the updated consultation
      const updatedConsultations = consultations.map(c => 
        c._id === updatedConsultation._id ? updatedConsultation : c
      );
      
      setConsultations(updatedConsultations);
    }
  }, [router.params]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConsultations();
  };
  
  // Check if a date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Check if a date is in the past
  const isPast = (dateString) => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    const now = new Date();
    return date < now;
  };

  const applyFilter = (filter, data = consultations) => {
    if (!data || data.length === 0) {
      setFilteredConsultations([]);
      return;
    }
    
    let filtered;
    switch (filter) {
      case 'today':
        filtered = data.filter(c => isToday(c.start_time));
        break;
      case 'upcoming':
        filtered = data.filter(c => 
          (c.status === 'confirmed' || c.status === 'pending' || 
          c.status === 'upcoming' || c.status === 'today') && 
          !isPast(c.start_time)
        );
        break;
      case 'completed':
        filtered = data.filter(c => c.status === 'completed');
        break;
      case 'all':
      default:
        filtered = [...data];
        break;
    }
    
    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c._id?.toLowerCase().includes(query) ||
        c.client?.name?.toLowerCase().includes(query) ||
        c.type?.toLowerCase().includes(query) ||
        c.status?.toLowerCase().includes(query)
      );
    }
    
    setFilteredConsultations(filtered);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilter(filter);
  };

  const handleStatusUpdate = async (consultationId, newStatus) => {
    try {
      const authConfig = await createAuthConfig();
      
      if (!authConfig.headers.Authorization) {
        setError('Please login to update consultation status');
        return;
      }
      
      // Log which ID we're using for the update
      console.log(`Updating consultation status using MongoDB _id: ${consultationId}`);
      
      const response = await updateConsultationStatus(authConfig, consultationId, newStatus);
      
      if (response.status === 200) {
        // Update the local state to reflect the change
        const updatedConsultations = consultations.map(c => 
          c._id === consultationId ? { ...c, status: newStatus } : c
        );
        
        setConsultations(updatedConsultations);
        applyFilter(activeFilter, updatedConsultations);
        
        // Show success message (could add a toast notification here)
        console.log(`Successfully updated consultation ${consultationId} status to ${newStatus}`);
      } else {
        console.error('Error updating consultation status:', response.message);
      }
    } catch (err) {
      console.error('Exception while updating consultation status:', err);
    }
  };

  const handleViewDetails = (consultation) => {
    // Get the business ID rather than MongoDB ID
    // This is the critical part - we need to use the business ID (KK format)
    const businessId = consultation.id || consultation.displayId;
    console.log('Navigating to detail screen for consultation with business ID:', businessId);
    
    try {
      router.push({
        pathname: '/(admin)/consultation-detail',
        params: { 
          // Just pass the business ID directly - the API accepts it in the path
          id: businessId
        }
      });
    } catch (error) {
      console.error('Error navigating to consultation detail:', error);
      alert('Unable to open consultation details. Please try again.');
    }
  };

  const handleViewChart = (consultation) => {
    // Get the MongoDB ID - this needs to be passed directly to match user-side pattern
    const id = consultation._id;
    if (!id) {
      console.error('Missing MongoDB _id for consultation');
      alert('Cannot view chart: missing consultation ID');
      return;
    }
    
    console.log('Navigating to kundali chart with ID:', id);
    
    try {
      router.push({
        pathname: '/(admin)/kundali-chart',
        params: { 
          consultationId: id
        }
      });
    } catch (error) {
      console.error('Error navigating to kundali chart:', error);
      alert('Unable to open kundali chart. Please try again.');
    }
  };

  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-GB', options);
    } catch (error) {
      return '';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    } catch (error) {
      return '';
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return { bg: '#e6f5ff', text: '#1890ff' };
      case 'today':
        return { bg: '#fff4e5', text: '#ff9500' };
      case 'completed':
        return { bg: '#f0f9eb', text: '#52c41a' };
      case 'cancelled':
        return { bg: '#fff1f0', text: '#f5222d' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const formatPaymentStatus = (isPaid) => {
    return isPaid ? 
      { text: 'Paid', bg: '#f0f9eb', color: '#52c41a', dot: '#52c41a' } : 
      { text: 'Unpaid', bg: '#fff1f0', color: '#f5222d', dot: '#f5222d' };
  };

  const getFormattedDateForConsultation = (consultation) => {
    let dateStr = '';
    let timeStr = '';
    
    // Extract time correctly - try all possible fields and formats
    let startTime = null;
    let startDate = null;

    // Check the booking object (newer format)
    if (consultation.booking) {
      if (consultation.booking.date) {
        startDate = consultation.booking.date;
        
        // Check for time in booking object
        if (consultation.booking.start_time) {
          startTime = `${consultation.booking.date}T${consultation.booking.start_time}`;
        } else if (consultation.booking.startTime) {
          startTime = `${consultation.booking.date}T${consultation.booking.startTime}`;
        }
      } else if (consultation.booking.startTime) {
        startTime = consultation.booking.startTime;
      } else if (consultation.booking.date_time || consultation.booking.datetime) {
        startTime = consultation.booking.date_time || consultation.booking.datetime;
      }
    }

    // If no time from booking, try direct fields
    if (!startTime) {
      startTime = consultation.start_time || consultation.startTime || 
                  consultation.scheduledTime || consultation.date ||
                  consultation.datetime || consultation.dateTime;
    }

    // Log what was found for debugging
    console.log(`Time extraction for ${consultation._id || 'unknown'}: 
      - Found start_time: ${startTime || 'None'}
      - Found date: ${startDate || 'None'}`);
    
    // Now process the extracted time data
    if (startTime) {
      try {
        const date = new Date(startTime);
        if (!isNaN(date.getTime())) {
          dateStr = formatDate(startTime);
          timeStr = formatTime(startTime);
        } else if (startDate) {
          // If the combined time is invalid but we have a date, try to parse separately
          const dateObj = new Date(startDate);
          if (!isNaN(dateObj.getTime())) {
            dateStr = formatDate(startDate);
            
            // Try to extract just the time portion if it's in a standard format
            const timeMatch = startTime.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
              const hours = parseInt(timeMatch[1], 10);
              const minutes = parseInt(timeMatch[2], 10);
              const timeObj = new Date();
              timeObj.setHours(hours, minutes);
              timeStr = formatTime(timeObj);
            }
          }
        }
      } catch (error) {
        console.error('Error formatting time data:', error);
      }
    } else {
      console.warn('No time information found for consultation', 
        consultation._id || consultation.id || 'unknown');
    }
    
    // If no valid time was found but we have a display ID, provide a fallback
    if (!dateStr && consultation.displayId) {
      console.log('Using fallback message for consultation', consultation.displayId);
      dateStr = 'Time not specified';
    }
    
    return { dateStr, timeStr };
  };

  const renderConsultationCard = ({ item }) => {
    const { dateStr, timeStr } = getFormattedDateForConsultation(item);
    
    // Properly extract meeting URL
    const meetingUrl = item.meeting && item.meeting.url;
    
    // Format created_at date
    let createdAtStr = '';
    if (item.created_at) {
      try {
        const createdDate = new Date(item.created_at);
        if (!isNaN(createdDate.getTime())) {
          const datePart = formatDate(item.created_at);
          const timePart = formatTime(item.created_at);
          createdAtStr = `${datePart} at ${timePart}`;
        }
      } catch (err) {
        console.error('Error formatting created_at date:', err);
      }
    }
    
    return (
      <View style={styles.consultationCard}>
        {/* Card Header section with ID, Status badge and Service Type */}
        <View style={styles.cardHeaderContainer}>
          {item.displayId && (
            <Text style={styles.consultationId}>{item.displayId}</Text>
          )}
          
          {item.status && (
            <View style={[
              styles.statusBadge, 
              item.status === 'completed' ? styles.completedBadge : 
              item.status === 'cancelled' ? styles.cancelledBadge : 
              item.status === 'today' ? styles.todayBadge :
              styles.upcomingBadge
            ]}>
              {item.status === 'today' && <View style={styles.statusDot} />}
              <Text style={[
                styles.statusText,
                item.status === 'today' ? styles.todayStatusText : 
                item.status === 'completed' ? styles.completedStatusText : 
                item.status === 'cancelled' ? styles.cancelledStatusText : 
                styles.upcomingStatusText
              ]}>
                {item.status}
              </Text>
            </View>
          )}
        </View>
        
        {/* Main card content */}
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={() => handleViewDetails(item)}
          activeOpacity={0.7}
        >
          {/* Service Type in large prominent text */}
          <Text style={styles.serviceName}>{item.type}</Text>
          
          {/* Client info with nicer styling */}
          {item.client && item.client.name && (
            <View style={styles.clientContainer}>
              <View style={styles.clientAvatarCircle}>
                <Text style={styles.clientInitials}>
                  {item.client.name.substring(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{item.client.name}</Text>
                {item.client.email && <Text style={styles.clientEmail}>{item.client.email}</Text>}
              </View>
            </View>
          )}
          
          {/* Info Grid for better organization */}
          <View style={styles.infoGrid}>
            {/* Date and Time */}
            <View style={styles.infoGridItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>{dateStr}{timeStr ? ` at ${timeStr}` : ''}</Text>
              </View>
            </View>
            
            {/* Duration */}
            {item.duration && (
              <View style={styles.infoGridItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="hourglass-outline" size={18} color="#8b5cf6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{item.duration} minutes</Text>
                </View>
              </View>
            )}
            
            {/* Payment */}
            {(item.price || item.amount) && (
              <View style={styles.infoGridItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="wallet-outline" size={18} color="#10b981" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Payment</Text>
                  <View style={styles.paymentRow}>
                    <Text style={styles.infoValue}>£{item.price || item.amount}</Text>
                    <View style={[
                      styles.paymentBadge, 
                      item.isPaid ? styles.paidBadge : styles.unpaidBadge
                    ]}>
                      <Text style={[
                        styles.paymentBadgeText,
                        item.isPaid ? styles.paidText : styles.unpaidText
                      ]}>
                        {item.isPaid ? 'Paid' : 'Unpaid'}
                      </Text>
                    </View>
                  </View>
                  {item.payment_method && (
                    <Text style={styles.paymentMethod}>via {item.payment_method}</Text>
                  )}
                </View>
              </View>
            )}
            
            {/* Created At */}
            {createdAtStr && (
              <View style={styles.infoGridItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="create-outline" size={18} color="#6b7280" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Created</Text>
                  <Text style={styles.infoValue}>{createdAtStr}</Text>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        {/* Action buttons in card footer */}
        <View style={styles.buttonsContainer}>
          {/* View Chart Button */}
          <TouchableOpacity 
            style={styles.viewChartButton}
            onPress={() => handleViewChart(item)}
          >
            <Ionicons name="bar-chart-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.viewChartButtonText}>View Chart</Text>
          </TouchableOpacity>

          {/* Join Audio/Video Call button */}
          {meetingUrl && (
            <TouchableOpacity 
              style={styles.videoCallButton}
              onPress={() => {
                console.log('Opening meeting URL:', meetingUrl);
                Linking.openURL(meetingUrl)
                  .catch(err => console.error('Error opening meeting URL:', err));
              }}
            >
              <Ionicons name="videocam-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.videoCallButtonText}>Join Audio/ Video Call</Text>
            </TouchableOpacity>
          )}
          
          {/* More Details Button */}
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => handleViewDetails(item)}
          >
            <Ionicons name="information-circle-outline" size={18} color="#4B5563" style={styles.buttonIcon} />
            <Text style={styles.detailsButtonText}>More Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={70} color="#e0e0e0" />
      <Text style={styles.emptyStateTitle}>No consultations found</Text>
      <Text style={styles.emptyStateMessage}>
        {searchQuery ? 
          `No results found for "${searchQuery}". Try a different search term.` :
          activeFilter === 'upcoming' ? 
          "There are no upcoming consultations scheduled." :
          activeFilter === 'completed' ? 
          "There are no completed consultations." :
          activeFilter === 'today' ?
          "There are no consultations scheduled for today." :
          "No consultations found. Check back later."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Consultations</Text>
            <Text style={styles.headerSubtitle}>
              Manage and track all your consultation bookings in one place
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === 'all' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterChange('all')}
            >
              <Text style={[
                styles.filterText,
                activeFilter === 'all' && styles.activeFilterText
              ]}>All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === 'today' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterChange('today')}
            >
              <Text style={[
                styles.filterText,
                activeFilter === 'today' && styles.activeFilterText
              ]}>Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === 'upcoming' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterChange('upcoming')}
            >
              <Text style={[
                styles.filterText,
                activeFilter === 'upcoming' && styles.activeFilterText
              ]}>Upcoming</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === 'completed' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterChange('completed')}
            >
              <Text style={[
                styles.filterText,
                activeFilter === 'completed' && styles.activeFilterText
              ]}>Completed</Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search consultations..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                applyFilter(activeFilter);
              }}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading consultations...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : filteredConsultations.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              data={filteredConsultations}
              renderItem={renderConsultationCard}
              keyExtractor={item => item._id || String(Math.random())}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// Update processConsultations to properly distinguish between MongoDB _id and business id
const processConsultations = (consultations = []) => {
  if (!consultations || !consultations.length) return [];
  
  console.log('Processing consultations data, count:', consultations.length);
  
  return consultations.map(consultation => {
    // For debugging
    console.log('Processing consultation with _id:', consultation._id, 'and id:', consultation.id);
    
    // First try to get the business ID directly from the dedicated id field
    let displayId = '';
    
    // First priority: use the specific id field if available (this is the business ID)
    if (consultation.id) {
      displayId = consultation.id;
    } 
    // Second priority: check other possible ID fields
    else if (consultation.shortId) {
      displayId = consultation.shortId;
    } else if (consultation.displayId) {
      displayId = consultation.displayId;
    } else if (consultation.bookingId) {
      displayId = consultation.bookingId;
    } 
    // Last resort: generate from _id
    else if (consultation._id) {
      // Generate from _id if it follows KK pattern or create appropriate format
      if (consultation._id.match(/^KK[A-Z0-9]{5}$/)) {
        // Already in correct format
        displayId = consultation._id;
      } else if (consultation._id.length >= 7) {
        // Take first 2 chars + last 5 chars and uppercase
        const firstTwo = 'KK';
        const lastFive = consultation._id.slice(-5).toUpperCase();
        displayId = `${firstTwo}${lastFive}`;
      } else {
        // Just prefix with KK
        displayId = `KK${consultation._id.toUpperCase()}`;
      }
    } else {
      // Generate a placeholder if no ID exists at all
      displayId = `KK${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }
    
    // Extract time correctly - try all possible fields and formats
    let startTime = null;
    let startDate = null;

    // Check the booking object (newer format)
    if (consultation.booking) {
      if (consultation.booking.date) {
        startDate = consultation.booking.date;
        
        // Check for time in booking object
        if (consultation.booking.start_time) {
          startTime = `${consultation.booking.date}T${consultation.booking.start_time}`;
        } else if (consultation.booking.startTime) {
          startTime = `${consultation.booking.date}T${consultation.booking.startTime}`;
        }
      } else if (consultation.booking.startTime) {
        startTime = consultation.booking.startTime;
      } else if (consultation.booking.date_time || consultation.booking.datetime) {
        startTime = consultation.booking.date_time || consultation.booking.datetime;
      }
    }

    // If no time from booking, try direct fields
    if (!startTime) {
      startTime = consultation.start_time || consultation.startTime || 
                  consultation.scheduledTime || consultation.date ||
                  consultation.datetime || consultation.dateTime;
    }

    // Log what was found for debugging
    console.log(`Time extraction for ${consultation._id}: 
      - Found start_time: ${startTime || 'None'}
      - Found date: ${startDate || 'None'}`);

    // Always ensure we have a string, not undefined
    startTime = startTime || '';

    // Extract payment info with special focus on status
    const price = consultation.price || consultation.amount || 
                 (consultation.booking && consultation.booking.price) ||
                 (consultation.payment && consultation.payment.amount);
    
    // Thoroughly check payment status from all possible locations             
    let isPaid = false;
    if (consultation.isPaid !== undefined) {
      isPaid = consultation.isPaid;
    } else if (consultation.payment) {
      // Check payment object status which could be in different formats
      const paymentStatus = consultation.payment.status || consultation.payment.paymentStatus;
      isPaid = paymentStatus === 'paid' || 
               paymentStatus === 'completed' || 
               paymentStatus === 'successful' ||
               paymentStatus === true;
    } else if (consultation.paymentStatus) {
      // Direct paymentStatus field
      isPaid = consultation.paymentStatus === 'paid' || 
               consultation.paymentStatus === 'completed' ||
               consultation.paymentStatus === true;
    } else if (consultation.booking && consultation.booking.isPaid !== undefined) {
      // Check in booking object
      isPaid = consultation.booking.isPaid;
    }
    
    // Extract payment method with better handling
    const paymentMethod = consultation.payment_method || 
                         consultation.paymentMethod ||
                         (consultation.payment && (
                           consultation.payment.method || 
                           consultation.payment.paymentMethod ||
                           consultation.payment.gateway ||
                           consultation.payment.provider
                         ));

    // Extract meeting URL from all possible locations
    const meetingInfo = {
      link: null,
      provider: null
    };
    
    // Check all possible meeting URL locations
    if (consultation.meeting && (consultation.meeting.link || consultation.meeting.url)) {
      meetingInfo.link = consultation.meeting.link || consultation.meeting.url;
      meetingInfo.provider = consultation.meeting.provider || 'Unknown';
    } else if (consultation.meeting_url) {
      meetingInfo.link = consultation.meeting_url;
    } else if (consultation.virtual_meeting_info && consultation.virtual_meeting_info.url) {
      meetingInfo.link = consultation.virtual_meeting_info.url;
      meetingInfo.provider = consultation.virtual_meeting_info.provider || 'Unknown';
    } else if (consultation.booking && consultation.booking.meeting) {
      meetingInfo.link = consultation.booking.meeting.link || consultation.booking.meeting.url;
      meetingInfo.provider = consultation.booking.meeting.provider || 'Unknown';
    }
    
    // Process created_at to ensure we have both date and time
    const created_at = consultation.created_at || consultation.createdAt || 
                      (consultation.booking && consultation.booking.createdAt);
    
    // Log the extracted data
    console.log(`Consultation processed: 
      - MongoDB _id: ${consultation._id}
      - Business ID: ${displayId}
      - Start time: ${startTime || 'None'} 
      - Payment: ${price || 'None'} (${isPaid ? 'Paid' : 'Unpaid'})
      - Created at: ${created_at || 'None'}
      - Meeting URL: ${meetingInfo.link || 'None'}`);
    
    // Return properly structured consultation object
    return {
      _id: consultation._id, // MongoDB ID (for database operations)
      id: consultation.id,   // Original business ID if available
      displayId: displayId,  // Formatted business ID for display
      type: consultation.type || (consultation.service && consultation.service.name) || 'Consultation',
      start_time: startTime,
      end_time: consultation.end_time || consultation.endTime,
      duration: consultation.duration || 
               (consultation.service && consultation.service.duration) || 
               60,
      status: consultation.status || 'scheduled',
      client: {
        name: (consultation.client && consultation.client.name) || 
              consultation.attendee_name ||
              consultation.name ||
              'Client',
        email: (consultation.client && consultation.client.email) || 
               consultation.attendee_email ||
               consultation.email ||
               '',
        phone: (consultation.client && consultation.client.phone) ||
               consultation.attendee_phone ||
               consultation.phone ||
               ''
      },
      notes: consultation.notes || consultation.additionalNotes || '',
      price: price,
      isPaid: isPaid,
      payment_method: paymentMethod,
      meeting: {
        url: meetingInfo.link,
        provider: meetingInfo.provider
      },
      booking: consultation.booking,
      created_at: created_at
    };
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  innerContainer: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    maxWidth: 500,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#f0f2f5',
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterButton: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    backgroundColor: '#fafafa',
  },
  consultationId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    letterSpacing: 0.5,
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  clientAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientInitials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  clientInfo: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  clientEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
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
    textTransform: 'capitalize',
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
  cardContent: {
    padding: 16,
  },
  infoGrid: {
    flexDirection: 'column',
    gap: 14,
  },
  infoGridItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  paymentBadge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paidBadge: {
    backgroundColor: '#52c41a',
  },
  unpaidBadge: {
    backgroundColor: '#f5222d',
  },
  paidText: {
    color: '#FFFFFF',
  },
  unpaidText: {
    color: '#FFFFFF',
  },
  paymentMethod: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'column',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewChartButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  viewChartButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  videoCallButton: {
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4169E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  videoCallButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  detailsButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailsButtonText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 13,
  },
  buttonIcon: {
    marginRight: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default Consultations; 