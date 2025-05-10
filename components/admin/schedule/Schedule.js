import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import { createAuthConfig, retrieveAdminSchedule } from '../../../actions/auth';
import ScheduleOverview from './ScheduleOverview';
import ScheduleList from './ScheduleList';
import TimeOfDayScheduleView from './TimeOfDayScheduleView';
import { Ionicons } from '@expo/vector-icons';

// Function to ensure proper data format
const formatScheduleData = (data) => {
  if (!data) {
    console.log('Received null or undefined data');
    return {
      date: new Date().toISOString().split('T')[0],
      consultations: []
    };
  }
  
  console.log('Original data structure:', JSON.stringify(data, null, 2));
  
  // Helper to fix suspicious future dates
  const fixDateIfNeeded = (dateTimeString) => {
    if (!dateTimeString) return null;
    
    try {
      const date = new Date(dateTimeString);
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      
      // If the date is more than a year in the future, it's probably wrong
      // (common case for mock data: 2025)
      if (date > oneYearFromNow) {
        console.warn('Fixing suspicious future date:', dateTimeString);
        // Use today's date with the same time
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const todayWithSameTime = new Date();
        todayWithSameTime.setHours(hours, minutes, 0, 0);
        return todayWithSameTime.toISOString();
      }
      
      return dateTimeString;
    } catch (e) {
      console.error('Error parsing date:', e);
      return dateTimeString;
    }
  };
  
  // Check if data is already in the expected format
  if (data.consultations && Array.isArray(data.consultations)) {
    console.log('Data has', data.consultations.length, 'consultations');
    
    if (data.consultations.length === 0) {
      console.log('No consultations in data, returning empty schedule');
      return {
        date: data.date || new Date().toISOString().split('T')[0],
        consultations: []
      };
    }
    
    // Transform consultations to match expected format
    const transformedConsultations = data.consultations.map(consultation => {
      // Format the scheduledTime from booking date and time
      let scheduledTime = null;
      if (consultation.booking && consultation.booking.date && consultation.booking.start_time) {
        scheduledTime = `${consultation.booking.date}T${consultation.booking.start_time}:00`;
        scheduledTime = fixDateIfNeeded(scheduledTime);
      } else if (consultation.scheduledTime) {
        scheduledTime = fixDateIfNeeded(consultation.scheduledTime);
      }
      
      // Map status values to expected values
      let status = consultation.status || 'pending';
      if (status === 'today') status = 'pending';
      if (status === 'upcoming') status = 'confirmed';
      if (status === 'completed') status = 'completed';
      if (consultation.payment && consultation.payment.status === 'cancelled') {
        status = 'cancelled';
      }
      
      // Create client object from consultation data
      const client = {
        name: consultation.name || consultation.client?.name || 'Unknown Client',
        email: consultation.attendee_email || consultation.client?.email || 'No email'
      };
      
      // Return transformed consultation
      return {
        _id: consultation._id,
        scheduledTime: scheduledTime,
        status: status,
        client: client,
        type: consultation.service?.name || 'Unknown Service',
        duration: parseInt(consultation.service?.duration) || 30,
        notes: consultation.notes || '',
        meeting: consultation.meeting,
        // Keep original data for reference
        original: consultation 
      };
    });
    
    return {
      date: data.date || new Date().toISOString().split('T')[0],
      consultations: transformedConsultations
    };
  }
  
  // If data is an array of consultations, wrap it in the expected structure
  if (Array.isArray(data)) {
    console.log('Converting array to proper schedule format with', data.length, 'consultations');
    
    // Transform consultations to match expected format
    const transformedConsultations = data.map(consultation => {
      // Format the scheduledTime from booking date and time
      let scheduledTime = null;
      if (consultation.booking && consultation.booking.date && consultation.booking.start_time) {
        scheduledTime = `${consultation.booking.date}T${consultation.booking.start_time}:00`;
        scheduledTime = fixDateIfNeeded(scheduledTime);
      } else if (consultation.scheduledTime) {
        scheduledTime = fixDateIfNeeded(consultation.scheduledTime);
      }
      
      // Map status values to expected values
      let status = consultation.status || 'pending';
      if (status === 'today') status = 'pending';
      if (status === 'upcoming') status = 'confirmed';
      if (status === 'completed') status = 'completed';
      if (consultation.payment && consultation.payment.status === 'cancelled') {
        status = 'cancelled';
      }
      
      // Create client object from consultation data
      const client = {
        name: consultation.name || consultation.client?.name || 'Unknown Client',
        email: consultation.attendee_email || consultation.client?.email || 'No email'
      };
      
      // Return transformed consultation
      return {
        _id: consultation._id,
        scheduledTime: scheduledTime,
        status: status,
        client: client,
        type: consultation.service?.name || 'Unknown Service',
        duration: parseInt(consultation.service?.duration) || 30,
        notes: consultation.notes || '',
        meeting: consultation.meeting,
        // Keep original data for reference
        original: consultation 
      };
    });
    
    return {
      date: data.date || new Date().toISOString().split('T')[0],
      consultations: transformedConsultations
    };
  }
  
  // If data has a nested 'data' property (common API response pattern)
  if (data.data) {
    if (Array.isArray(data.data)) {
      console.log('Extracting array from data.data with', data.data.length, 'consultations');
      
      // Transform consultations to match expected format
      const transformedConsultations = data.data.map(consultation => {
        // Format the scheduledTime from booking date and time
        let scheduledTime = null;
        if (consultation.booking && consultation.booking.date && consultation.booking.start_time) {
          scheduledTime = `${consultation.booking.date}T${consultation.booking.start_time}:00`;
          scheduledTime = fixDateIfNeeded(scheduledTime);
        } else if (consultation.scheduledTime) {
          scheduledTime = fixDateIfNeeded(consultation.scheduledTime);
        }
        
        // Map status values to expected values
        let status = consultation.status || 'pending';
        if (status === 'today') status = 'pending';
        if (status === 'upcoming') status = 'confirmed';
        if (status === 'completed') status = 'completed';
        if (consultation.payment && consultation.payment.status === 'cancelled') {
          status = 'cancelled';
        }
        
        // Create client object from consultation data
        const client = {
          name: consultation.name || consultation.client?.name || 'Unknown Client',
          email: consultation.attendee_email || consultation.client?.email || 'No email'
        };
        
        // Return transformed consultation
        return {
          _id: consultation._id,
          scheduledTime: scheduledTime,
          status: status,
          client: client,
          type: consultation.service?.name || 'Unknown Service',
          duration: parseInt(consultation.service?.duration) || 30,
          notes: consultation.notes || '',
          meeting: consultation.meeting,
          // Keep original data for reference
          original: consultation 
        };
      });
      
      return {
        date: new Date().toISOString().split('T')[0],
        consultations: transformedConsultations
      };
    } else if (data.data.consultations) {
      console.log('Using data.data.consultations with', data.data.consultations.length, 'items');
      // Similarly transform these consultations
      const transformedConsultations = data.data.consultations.map(consultation => {
        // Apply the same transformation logic
        // Format the scheduledTime from booking date and time
        let scheduledTime = null;
        if (consultation.booking && consultation.booking.date && consultation.booking.start_time) {
          scheduledTime = `${consultation.booking.date}T${consultation.booking.start_time}:00`;
          scheduledTime = fixDateIfNeeded(scheduledTime);
        } else if (consultation.scheduledTime) {
          scheduledTime = fixDateIfNeeded(consultation.scheduledTime);
        }
        
        // Map status values to expected values
        let status = consultation.status || 'pending';
        if (status === 'today') status = 'pending';
        if (status === 'upcoming') status = 'confirmed';
        if (status === 'completed') status = 'completed';
        if (consultation.payment && consultation.payment.status === 'cancelled') {
          status = 'cancelled';
        }
        
        // Create client object from consultation data
        const client = {
          name: consultation.name || consultation.client?.name || 'Unknown Client',
          email: consultation.attendee_email || consultation.client?.email || 'No email'
        };
        
        // Return transformed consultation
        return {
          _id: consultation._id,
          scheduledTime: scheduledTime,
          status: status,
          client: client,
          type: consultation.service?.name || 'Unknown Service',
          duration: parseInt(consultation.service?.duration) || 30,
          notes: consultation.notes || '',
          meeting: consultation.meeting,
          // Keep original data for reference
          original: consultation 
        };
      });
      
      return {
        date: data.data.date || new Date().toISOString().split('T')[0],
        consultations: transformedConsultations
      };
    }
  }
  
  // Fallback to empty structure
  console.log('Could not determine proper format, using empty structure');
  return {
    date: new Date().toISOString().split('T')[0],
    consultations: []
  };
};

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState('');
  const [debugInfo, setDebugInfo] = useState({});
  const [dataFormat, setDataFormat] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' for TimeOfDay view, 'list' for ScheduleList view

  // Try different API endpoint as a fallback
  const fetchConsultationsDirectly = async (config) => {
    try {
      console.log('Trying alternative approach: retrieveAdminSchedule');
      const response = await retrieveAdminSchedule(config);
      
      console.log('Direct consultations response:', response.status);
      console.log('Response data type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      console.log('Data preview:', JSON.stringify(response.data).substring(0, 100) + '...');
      
      if (response.status === 200 && response.data) {
        // Format data to match expected schedule format
        const formattedData = formatScheduleData(response.data);
        
        if (formattedData && formattedData.consultations) {
          console.log('Successfully formatted consultations data with', 
            formattedData.consultations.length, 'consultations');
          
          setScheduleData(formattedData);
          setDataFormat('user_consultations');
          setError(null);
          return true;
        }
      }
      
      return false;
    } catch (err) {
      console.error('Error in direct consultations approach:', err);
      return false;
    }
  };

  const fetchScheduleData = async () => {
    try {
      setError(null);
      setErrorDetails('');
      setDebugInfo({});
      setDataFormat(null);
      
      // Get auth configuration
      const config = await createAuthConfig();
      const hasToken = !!config.headers.Authorization;
      console.log('Auth token exists:', hasToken);
      
      // Store auth info for debugging
      setDebugInfo(prev => ({
        ...prev,
        hasToken,
        tokenPrefix: hasToken ? config.headers.Authorization.substring(0, 15) + '...' : 'none'
      }));
      
      if (!hasToken) {
        setError('Please log in to view your schedule');
        setErrorDetails('Your session may have expired. Please sign out and sign in again.');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Fetch schedule data with improved error handling
      console.log('Attempting to fetch admin schedule');
      const response = await retrieveAdminSchedule(config);
      console.log('Schedule response:', response.status, response.message);
      
      // Examine data structure
      console.log('Response data type:', typeof response.data);
      if (response.data) {
        console.log('Data has consultations property:', !!response.data.consultations);
        if (response.data.consultations) {
          console.log('Consultations is array:', Array.isArray(response.data.consultations));
          console.log('Consultations count:', response.data.consultations.length);
        }
      }
      
      // Store response info for debugging
      setDebugInfo(prev => ({
        ...prev,
        responseStatus: response.status,
        responseMessage: response.message,
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataKeys: response.data ? Object.keys(response.data) : [],
        consultationsCount: response.data && response.data.consultations ? 
          response.data.consultations.length : 'N/A'
      }));
      
      if (response.status === 200 && response.data) {
        // Ensure data is in the correct format before setting
        const formattedData = formatScheduleData(response.data);
        setScheduleData(formattedData);
        setDataFormat('admin_schedule');
      } else if (response.status >= 200 && response.status < 300 && response.data) {
        // Handle partial success
        const formattedData = formatScheduleData(response.data);
        setScheduleData(formattedData);
        setDataFormat('partial');
        console.log('Using partial data');
      } else {
        // Try alternative approach
        const directSuccess = await fetchConsultationsDirectly(config);
        
        if (!directSuccess) {
          setError('Failed to load schedule data. Please try again later.');
          setErrorDetails(response.message || 'API returned no data');
        }

      }
    } catch (err) {
      console.error('Error fetching admin schedule:', err);
      setError('An error occurred while loading schedule data');
      setErrorDetails(err.message || '');
      setDebugInfo(prev => ({
        ...prev,
        error: err.message,
        stack: err.stack
      }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
    
    // Log a warning if we detect any consultations with future dates
    if (scheduleData?.consultations?.length > 0) {
      const futureConsultations = scheduleData.consultations.filter(consultation => {
        if (!consultation.scheduledTime) return false;
        const consultDate = new Date(consultation.scheduledTime);
        const today = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(today.getFullYear() + 1);
        
        if (consultDate > oneYearFromNow) {
          console.warn('Found consultation with suspicious future date:', consultation.scheduledTime);
          return true;
        }
        return false;
      });
      
      if (futureConsultations.length > 0) {
        console.warn(`Detected ${futureConsultations.length} consultations with dates more than a year in the future.`);
      }
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchScheduleData();
  };

  // Handle View Chart action
  const handleViewChart = (consultation) => {
    const clientName = consultation.client?.name || "Unknown";
    Alert.alert(
      "Birth Chart",
      `View birth chart for ${clientName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "View", 
          onPress: () => {
            // Here you would navigate to the birth chart screen
            console.log("View chart for client:", clientName, consultation.original);
            Alert.alert("Coming Soon", "Birth chart view will be available in a future update.");
          }
        }
      ]
    );
  };

  // Handle View Details action
  const handleViewDetails = (consultation) => {
    const details = [
      `Client: ${consultation.client?.name || "Unknown"}`,
      `Email: ${consultation.client?.email || "No email"}`,
      `Service: ${consultation.type || "Unknown service"}`,
      `Duration: ${consultation.duration || 30} mins`,
      `Status: ${consultation.status || "Unknown status"}`,
      `Time: ${new Date(consultation.scheduledTime).toLocaleString()}`,
      consultation.meeting?.link ? `Meeting Link: ${consultation.meeting.link}` : "No meeting link"
    ];

    Alert.alert(
      "Consultation Details",
      details.join("\n"),
      [{ text: "Close", style: "cancel" }]
    );
  };

  // Group consultations by time of day for today's schedule
  const groupConsultationsByTimeOfDay = () => {
    if (!scheduleData?.consultations) return {};
    
    const today = new Date().toISOString().split('T')[0];
    const todayConsultations = scheduleData.consultations.filter(consultation => {
      if (!consultation.scheduledTime) return false;
      return consultation.scheduledTime.split('T')[0] === today;
    });
    
    const groups = {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    };
    
    todayConsultations.forEach(consultation => {
      if (!consultation.scheduledTime) return;
      
      const date = new Date(consultation.scheduledTime);
      const hours = date.getHours();
      
      if (hours >= 5 && hours < 12) {
        groups.morning.push(consultation);
      } else if (hours >= 12 && hours < 17) {
        groups.afternoon.push(consultation);
      } else if (hours >= 17 && hours < 20) {
        groups.evening.push(consultation);
      } else {
        groups.night.push(consultation);
      }
    });
    
    // Sort consultations within each group by time
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => 
        new Date(a.scheduledTime) - new Date(b.scheduledTime)
      );
    });
    
    return groups;
  };

  const groupedConsultations = groupConsultationsByTimeOfDay();

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  // Display data structure info
  console.log('Rendering with data format:', dataFormat);
  if (scheduleData) {
    console.log('Schedule data structure:');
    console.log('- date:', scheduleData.date);
    console.log('- consultations:', scheduleData.consultations ? 
      `Array with ${scheduleData.consultations.length} items` : 'missing or not an array');
    
    if (scheduleData.consultations && scheduleData.consultations.length > 0) {
      const sample = scheduleData.consultations[0];
      console.log('First consultation sample:', 
        sample._id, 
        sample.status, 
        sample.scheduledTime,
        sample.client ? `Client: ${sample.client.name}` : 'No client data');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {errorDetails ? (
            <Text style={styles.errorDetails}>{errorDetails}</Text>
          ) : null}
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2563eb']}
            />
          }
        >
          <ScheduleOverview 
            scheduleData={scheduleData}
            onRefresh={handleRefresh}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  debugContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeToggleButton: {
    backgroundColor: '#2196F3',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: '500',
  }
});

export default Schedule; 
