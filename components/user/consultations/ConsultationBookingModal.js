import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { createAuthConfig, retrieveAvailableSlots, createPaymentIntent } from '../../../actions/auth';

/**
 * ConsultationBookingModal component - Multi-step booking process for consultations
 * 
 * @param {Object} props.visible - Boolean to control modal visibility
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.service - The selected service to book
 */
const ConsultationBookingModal = ({ visible, onClose, service }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Birth details for predictions
  const [birthDetails, setBirthDetails] = useState({
    name: '',
    birthDate: new Date(),
    birthTime: new Date(),
    birthPlace: '',
    gender: 'male'
  });

  // Errors object for validation
  const [errors, setErrors] = useState({});

  // Fetch available slots when date changes
  useEffect(() => {
    if (visible && currentStep === 3) {
      fetchAvailableSlots();
    }
  }, [selectedDate, visible, currentStep]);

  const fetchAvailableSlots = async () => {
    if (!service) return;
    
    try {
      setLoadingSlots(true);
      const config = await createAuthConfig();
      const response = await retrieveAvailableSlots(config, service.duration);
      
      if (response.status === 200 && response.data) {
        // Make sure we have an array of slots
        const slots = Array.isArray(response.data) ? response.data : [];
        
        // Only filter slots that have a valid start_time
        const validSlots = slots.filter(slot => slot && slot.start_time);
        
        // Filter slots for the selected date
        const slotsForSelectedDate = validSlots.filter(slot => {
          try {
            const slotDate = new Date(slot.start_time);
            const selectedDay = selectedDate.getDate();
            const selectedMonth = selectedDate.getMonth();
            const selectedYear = selectedDate.getFullYear();
            
            const slotDay = slotDate.getDate();
            const slotMonth = slotDate.getMonth();
            const slotYear = slotDate.getFullYear();
            
            return (
              slotDay === selectedDay &&
              slotMonth === selectedMonth &&
              slotYear === selectedYear
            );
          } catch (error) {
            console.error('Error parsing date for slot:', slot, error);
            return false;
          }
        });
        
        setTimeSlots(slotsForSelectedDate);
      } else {
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setSelectedTimeSlot(null); // Reset time selection
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setBirthDetails({
        ...birthDetails,
        birthTime: time
      });
    }
  };

  const validateStep1 = () => {
    // Step 1 doesn't need validation - just showing service details
    return true;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!birthDetails.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!birthDetails.birthPlace.trim()) {
      newErrors.birthPlace = 'Birth place is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!selectedTimeSlot) {
      newErrors.timeSlot = 'Please select a time slot';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare booking data
      const bookingData = {
        service_id: service.id,
        start_time: selectedTimeSlot.start_time,
        duration: service.duration,
        consultation_type: service.type,
        name: birthDetails.name,
        date_of_birth: format(birthDetails.birthDate, 'yyyy-MM-dd'),
        time_of_birth: format(birthDetails.birthTime, 'HH:mm'),
        place_of_birth: birthDetails.birthPlace,
        gender: birthDetails.gender
      };
      
      console.log('Booking data:', bookingData);
      
      // Create payment intent
      const config = await createAuthConfig();
      const response = await createPaymentIntent(
        config, 
        service.price * 100, // Amount in cents
        'gbp', 
        bookingData
      );
      
      if (response.status === 200 && response.data) {
        // Handle successful booking
        // In a real app, integrate with payment processor like Stripe here
        alert('Booking successful! We will redirect you to payment page.');
        onClose();
      } else {
        alert(response.message || 'Failed to book consultation');
      }
    } catch (error) {
      console.error('Error booking consultation:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepRow}>
          <View 
            style={[
              styles.stepCircle, 
              currentStep === step ? styles.activeStep : 
              currentStep > step ? styles.completedStep : {}
            ]}
          >
            {currentStep > step ? (
              <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
              <Text style={currentStep === step ? styles.activeStepText : styles.stepText}>
                {step}
              </Text>
            )}
          </View>
          
          {step < 3 && (
            <View 
              style={[
                styles.stepLine, 
                currentStep > step ? styles.completedLine : {}
              ]} 
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderServiceSummary = () => (
    <View style={styles.serviceSummary}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceImagePlaceholder}>
          <Ionicons name="star" size={24} color="#7765e3" />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service?.name}</Text>
          <Text style={styles.serviceSubtitle}>Deep Life Insights</Text>
        </View>
      </View>
      
      <View style={styles.priceSummary}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Consultation Fee</Text>
          <Text style={styles.priceValue}>£{service?.price}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Platform Fee</Text>
          <Text style={styles.priceValue}>£0.00</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Taxes</Text>
          <Text style={styles.priceValue}>£0.00</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>£{service?.price}</Text>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Booking Summary</Text>
            {renderServiceSummary()}
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Birth Details for Prediction</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter your full name"
                value={birthDetails.name}
                onChangeText={(text) => setBirthDetails({...birthDetails, name: text})}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.dateText}>
                  {format(birthDetails.birthDate, 'MMMM dd, yyyy')}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={birthDetails.birthDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      setBirthDetails({...birthDetails, birthDate: date});
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Time of Birth</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.dateText}>
                  {format(birthDetails.birthTime, 'h:mm a')}
                </Text>
              </TouchableOpacity>
              
              {showTimePicker && (
                <DateTimePicker
                  value={birthDetails.birthTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Place of Birth</Text>
              <TextInput
                style={[styles.input, errors.birthPlace && styles.inputError]}
                placeholder="City, Country"
                value={birthDetails.birthPlace}
                onChangeText={(text) => setBirthDetails({...birthDetails, birthPlace: text})}
              />
              {errors.birthPlace && <Text style={styles.errorText}>{errors.birthPlace}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setBirthDetails({...birthDetails, gender: 'male'})}
                >
                  <View style={[
                    styles.radioButton, 
                    birthDetails.gender === 'male' && styles.radioSelected
                  ]}>
                    {birthDetails.gender === 'male' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Male</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setBirthDetails({...birthDetails, gender: 'female'})}
                >
                  <View style={[
                    styles.radioButton,
                    birthDetails.gender === 'female' && styles.radioSelected
                  ]}>
                    {birthDetails.gender === 'female' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Female</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setBirthDetails({...birthDetails, gender: 'other'})}
                >
                  <View style={[
                    styles.radioButton,
                    birthDetails.gender === 'other' && styles.radioSelected
                  ]}>
                    {birthDetails.gender === 'other' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Other</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Date & Time</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Select Date</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.dateText}>
                  {format(selectedDate, 'MMMM dd, yyyy')}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Available Time Slots</Text>
              {loadingSlots ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#7765e3" />
                  <Text style={styles.loadingText}>Loading available slots...</Text>
                </View>
              ) : timeSlots.length > 0 ? (
                <View style={styles.timeSlotContainer}>
                  {timeSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        selectedTimeSlot === slot && styles.selectedTimeSlot
                      ]}
                      onPress={() => setSelectedTimeSlot(slot)}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        selectedTimeSlot === slot && styles.selectedTimeSlotText
                      ]}>
                        {format(new Date(slot.start_time), 'h:mm a')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noSlotsContainer}>
                  <Text style={styles.noSlotsText}>
                    No time slots available for this date. Please select another date.
                  </Text>
                </View>
              )}
              {errors.timeSlot && <Text style={styles.errorText}>{errors.timeSlot}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Timezone</Text>
              <View style={styles.timezoneBox}>
                <Ionicons name="globe-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.timezoneText}>Europe/London</Text>
              </View>
              <Text style={styles.timezoneNote}>All times are shown in your local timezone</Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Consultation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {renderStepIndicator()}
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {renderStepContent()}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            {currentStep > 1 && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={prevStep}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.actionButton,
                loading && styles.disabledButton
              ]}
              onPress={currentStep < 3 ? nextStep : handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>
                  {currentStep < 3 ? 'Continue' : 'Book Now'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 30,
  },
  stepRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#7765e3',
    borderColor: '#7765e3',
  },
  completedStep: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeStepText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  completedLine: {
    backgroundColor: '#4CAF50',
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  serviceSummary: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  serviceImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  priceSummary: {
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7765e3',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: '#fff',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#7765e3',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  timeSlot: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedTimeSlot: {
    borderColor: '#7765e3',
    backgroundColor: '#7765e3',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  noSlotsContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  noSlotsText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  timezoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  timezoneText: {
    fontSize: 16,
    color: '#333',
  },
  timezoneNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  backButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  actionButton: {
    flex: 2,
    padding: 16,
    backgroundColor: '#ff6c00',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default ConsultationBookingModal; 