import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { createAuthConfig, retrieveAvailableSlots, createPaymentIntent, retrieveServices } from '../../../actions/auth';
import ServiceConfirmation from './booking-steps/ServiceConfirmation';
import BirthDetails from './booking-steps/BirthDetails';
import SchedulePicker from './booking-steps/SchedulePicker';

/**
 * ConsultationBookingFlow component for multi-step booking process
 * 
 * @param {Object} props.service - The selected service object
 * @param {String} props.serviceId - Optional service ID to fetch if service object not provided
 * @param {Function} props.onClose - Function to close the booking flow
 * @param {Function} props.onBookingComplete - Callback for when booking is complete
 * @param {Boolean} props.inlineMode - Whether the component is displayed inline or in a modal
 */
const ConsultationBookingFlow = ({ service, serviceId, onClose, onBookingComplete, inlineMode = false }) => {
  // Component state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceData, setServiceData] = useState(service);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [error, setError] = useState(null);
  
  // Booking data
  const [bookingData, setBookingData] = useState({
    service: service,
    birthDetails: {
      fullName: '',
      birthDate: null,
      birthTime: { hour: '12', minute: '00', ampm: 'PM' },
      placeOfBirth: '',
      gender: ''
    },
    schedule: {
      date: null,
      time: null,
      timezone: (() => {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London';
        } catch (e) {
          return 'Europe/London'; // Fallback timezone
        }
      })()
    }
  });

  // Fetch service if serviceId is provided but no service object
  useEffect(() => {
    if (!service && serviceId) {
      fetchService(serviceId);
    }
  }, [service, serviceId]);

  // Fetch available slots when service changes or on mount
  useEffect(() => {
    if (serviceData && serviceData.duration) {
      fetchAvailableSlots(serviceData.duration);
    }
  }, [serviceData]);

  // Fetch service details by ID
  const fetchService = async (id) => {
    try {
      setServiceLoading(true);
      setError(null);
      
      const config = await createAuthConfig();
      const response = await retrieveServices(config);
      
      if (response.status === 200 && Array.isArray(response.data)) {
        // Find the service with matching ID
        const found = response.data.find(s => s._id === id);
        
        if (found) {
          const formattedService = {
            id: found._id,
            name: found.name,
            duration: found.duration || 30,
            price: found.price || 50,
            type: found.consultation_type || 'video',
            description: found.description || found.sub_title || 'No description available',
            image: found.image || null,
            benefits: found.benefits ? 
              (typeof found.benefits === 'string' ? 
                found.benefits.split(',').map(b => b.trim()) : 
                found.benefits) : 
              []
          };
          
          setServiceData(formattedService);
          
          // Update booking data with the service
          setBookingData(prev => ({
            ...prev,
            service: formattedService
          }));
        } else {
          setError('Service not found. Please try again.');
        }
      } else {
        setError('Failed to load service information. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while fetching service details.');
      console.error('Error fetching service:', err);
    } finally {
      setServiceLoading(false);
    }
  };

  // Fetch available slots from API
  const fetchAvailableSlots = async (duration) => {
    try {
      setLoading(true);
      setError(null);
      
      const config = await createAuthConfig();
      const response = await retrieveAvailableSlots(config, duration);
      
      // Check for server error or invalid JSON
      if (response.status === 500 && response.rawResponse) {
        console.warn('Server returned non-JSON response:', response.rawResponse);
        
        // Check if it looks like an HTML error page
        if (response.rawResponse.includes('<html') || response.rawResponse.includes('<!DOCTYPE')) {
          setError('The server is currently unavailable. Please try again later or contact support.');
        } else {
          setError('Unable to load available slots. Please try again later.');
        }
        setAvailableSlots({});
        return;
      }
      
      if (response.status === 200) {
        // Normalize data structure to handle various API response formats
        // The expected format is { "2023-06-15": [slots], "2023-06-16": [slots], ... }
        const data = response.data;
        
        // Check what format the data is in and normalize appropriately
        if (data) {
          if (Array.isArray(data)) {
            // If data is an array of slots, we need to group by date
            const normalizedSlots = {};
            
            data.forEach(slot => {
              try {
                if (slot && slot.start_time) {
                  // Extract date part from the slot datetime
                  const date = slot.start_time.split('T')[0];
                  
                  if (!normalizedSlots[date]) {
                    normalizedSlots[date] = [];
                  }
                  
                  // Add slot to the appropriate date
                  normalizedSlots[date].push({
                    start: slot.start_time.split('T')[1].substring(0, 5), // Extract HH:MM
                    end: slot.end_time ? slot.end_time.split('T')[1].substring(0, 5) : '',
                    id: slot.id || slot._id || Math.random().toString(36).substring(7)
                  });
                }
              } catch (err) {
                console.warn('Error processing slot:', err);
              }
            });
            
            setAvailableSlots(normalizedSlots);
          } else if (typeof data === 'object' && !Array.isArray(data)) {
            // If data is already in the format we expect
            setAvailableSlots(data);
          } else {
            console.warn('Unexpected slots data format:', data);
            setAvailableSlots({});
          }
        } else {
          // Empty data but successful response
          setAvailableSlots({});
          setError('No available slots found. Please try again later or contact support.');
        }
      } else {
        setError(response.message || 'Failed to load available slots. Please try again.');
        setAvailableSlots({});
      }
    } catch (err) {
      setError('An error occurred while fetching available slots.');
      console.error('Error fetching slots:', err);
      setAvailableSlots({});
    } finally {
      setLoading(false);
    }
  };

  // Handle data updates for each step
  const updateServiceData = (serviceData) => {
    setBookingData(prev => ({
      ...prev,
      service: serviceData
    }));
  };

  const updateBirthDetails = (details) => {
    setBookingData(prev => ({
      ...prev,
      birthDetails: details
    }));
  };

  const updateSchedule = (schedule) => {
    // Ensure we have a valid schedule object with all required fields
    if (!schedule) return;
    
    const validSchedule = {
      date: schedule.date || null,
      time: schedule.time || null,
      timezone: schedule.timezone || 
        (() => {
          try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London';
          } catch (e) {
            return 'Europe/London'; // Fallback timezone
          }
        })()
    };
    
    setBookingData(prev => ({
      ...prev,
      schedule: validSchedule
    }));
  };

  // Navigation between steps
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleBookingSubmit();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  // Format birth time for API
  const formatBirthTimeForAPI = (birthTime) => {
    if (!birthTime) return '';

    if (birthTime instanceof Date) {
      const hours = birthTime.getHours();
      const minutes = birthTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    
    // Handle legacy format
    if (birthTime.hour && birthTime.minute && birthTime.ampm) {
      return `${birthTime.hour}:${birthTime.minute} ${birthTime.ampm}`;
    }
    
    return '';
  };

  // Handle final booking submission
  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate data before submission
      if (!bookingData.schedule || !bookingData.schedule.date || !bookingData.schedule.time) {
        setError('Please select a date and time for your consultation.');
        setLoading(false);
        return;
      }
      
      // Validate birth details are present
      if (!bookingData.birthDetails) {
        setError('Birth details are missing. Please go back and complete the previous step.');
        setLoading(false);
        return;
      }
      
      const config = await createAuthConfig();
      
      // Format birth date properly
      let birthDate = null;
      if (bookingData.birthDetails.birthDate) {
        try {
          // Ensure we have a valid date
          const date = new Date(bookingData.birthDetails.birthDate);
          birthDate = !isNaN(date.getTime()) 
            ? date.toISOString().split('T')[0]  // Format as YYYY-MM-DD
            : null;
        } catch (e) {
          console.warn('Error formatting birth date:', e);
        }
      }
      
      // Format start time properly
      let startTime;
      try {
        // Create a valid ISO date-time string
        startTime = new Date(`${bookingData.schedule.date}T${bookingData.schedule.time}:00`);
        if (isNaN(startTime.getTime())) {
          throw new Error('Invalid date or time format');
        }
        startTime = startTime.toISOString();
      } catch (e) {
        console.error('Error formatting start time:', e);
        setError('There was an issue with the selected date and time. Please try again.');
        setLoading(false);
        return;
      }
      
      // Format birth time
      const formattedBirthTime = formatBirthTimeForAPI(bookingData.birthDetails.birthTime);
      
      // Prepare booking data for API
      const apiBookingData = {
        service: {
          id: bookingData.service.id,
          slug: bookingData.service.id, // Backend expects 'slug' property
          name: bookingData.service.name,
          description: bookingData.service.description,
          price: bookingData.service.price,
          duration: bookingData.service.duration
        },
        booking_slot: {
          date: bookingData.schedule.date,
          start_time: bookingData.schedule.time,
          end_time: '', // Can be calculated if needed
        },
        name: bookingData.birthDetails.fullName,
        gender: bookingData.birthDetails.gender,
        date_of_birth: birthDate,
        time_of_birth: formattedBirthTime,
        place_of_birth: bookingData.birthDetails.placeOfBirth,
        timezone: bookingData.schedule.timezone
      };
      
      console.log('Submitting booking data:', JSON.stringify(apiBookingData));
      
      // Create payment intent
      const response = await createPaymentIntent(
        config, 
        bookingData.service.price * 100, // Convert to cents for Stripe
        'GBP', 
        apiBookingData
      );
      
      if (response.status === 200 && response.data) {
        // Handle successful booking
        if (onBookingComplete) {
          onBookingComplete(response.data);
        }
      } else {
        // Extract error message from response with better details
        let errorMsg = 'Failed to process booking. Please try again.';
        
        if (response.message) {
          errorMsg = response.message;
        }
        
        // Check for detailed error information
        if (response.error) {
          errorMsg += ': ' + response.error;
        }
        
        console.error('Booking error:', errorMsg);
        setError(errorMsg);
        
        // Show an alert with error message
        alert(`Booking error: ${errorMsg}`);
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while processing your booking.';
      setError(errorMsg);
      console.error('Booking error:', err);
      
      // Show an alert with more details
      let alertMsg = `Booking error: ${errorMsg}`;
      
      // Add network error info if relevant
      if (err.name === 'TypeError' && err.message.includes('Network')) {
        alertMsg = 'Network error: Please check your internet connection and try again.';
      }
      
      // Add API error details if available
      if (err.response && err.response.data) {
        alertMsg += `\n\nServer details: ${err.response.data.message || JSON.stringify(err.response.data)}`;
      }
      
      alert(alertMsg);
    } finally {
      setLoading(false);
    }
  };

  // Render the progress indicator at the top
  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map(step => (
        <View key={step} style={styles.progressStep}>
          <View style={[
            styles.progressCircle,
            currentStep >= step ? styles.activeProgressCircle : {}
          ]}>
            <Text style={[
              styles.progressNumber,
              currentStep >= step ? styles.activeProgressNumber : {}
            ]}>{step}</Text>
          </View>
          <Text style={styles.progressText}>
            {step === 1 ? 'Service' : step === 2 ? 'Details' : 'Schedule'}
          </Text>
        </View>
      ))}
    </View>
  );

  // Render the current step's content
  const renderCurrentStep = () => {
    if (serviceLoading || (loading && currentStep > 1)) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7765e3" />
          <Text style={styles.loadingText}>
            {serviceLoading ? 'Loading service details...' : 'Fetching available slots...'}
          </Text>
        </View>
      );
    }

    if (error && currentStep > 1) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={() => fetchAvailableSlots(serviceData?.duration || 30)}
          >
            <Text style={styles.tryAgainButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch(currentStep) {
      case 1:
        return (
          <ServiceConfirmation 
            service={serviceData || {}}
            onServiceDataChange={updateServiceData}
            onContinue={goToNextStep}
          />
        );
      case 2:
        return (
          <BirthDetails
            initialData={bookingData.birthDetails || {}}
            onDataChange={updateBirthDetails}
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 3:
        return (
          <SchedulePicker
            initialData={bookingData.schedule || {}}
            availableSlots={availableSlots || {}}
            onDataChange={updateSchedule}
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            serviceData={serviceData || {}}
          />
        );
      default:
        return null;
    }
  };

  // If in inline mode, render directly
  if (inlineMode) {
    return (
      <View style={styles.container}>
        {renderProgressIndicator()}
        <ScrollView 
          style={styles.stepContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentStep()}
        </ScrollView>
      </View>
    );
  }

  // Otherwise, render with modal header
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={28} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Consultation</Text>
        <View style={styles.rightHeaderSpace} />
      </View>
      
      {renderProgressIndicator()}
      
      <ScrollView 
        style={styles.stepContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>
    </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rightHeaderSpace: {
    width: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeProgressCircle: {
    backgroundColor: '#7765e3',
    borderColor: '#7765e3',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  activeProgressNumber: {
    color: '#fff',
  },
  progressText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  stepContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 80, // Extra space for keyboard
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginTop: 12,
  },
  tryAgainButton: {
    padding: 12,
    backgroundColor: '#7765e3',
    borderRadius: 8,
  },
  tryAgainButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ConsultationBookingFlow; 