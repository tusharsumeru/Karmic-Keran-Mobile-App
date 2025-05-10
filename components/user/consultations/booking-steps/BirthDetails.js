import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');

// Location APIs for Place of Birth suggestions
const LOCATION_APIS = {
  PRIMARY: 'https://nominatim.openstreetmap.org/search',
  FALLBACK: 'https://photon.komoot.io/api/'
};

/**
 * BirthDetails component - Step 2 of booking flow
 * Collects birth details for astrological services
 */
const BirthDetails = ({ initialData, onDataChange, onContinue, onBack }) => {
  // Reference to track if we're updating internally
  const isInternalUpdate = useRef(false);
  
  // Local state to manage the form data
  const [birthDetails, setBirthDetails] = useState(initialData || {
    fullName: '',
    birthDate: null,
    birthTime: { hour: '12', minute: '00', ampm: 'PM' },
    placeOfBirth: '',
    gender: ''
  });
  
  // Local state for modals
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  
  // Location suggestions state
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [useAlternateApi, setUseAlternateApi] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Keyboard handling
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Reference to ScrollView for scrolling
  const scrollViewRef = React.useRef(null);
  
  // State for time format
  const [is24HourFormat, setIs24HourFormat] = useState(false);
  
  // Update parent component when birthDetails change
  useEffect(() => {
    // Only notify parent if it's not an internal update
    if (onDataChange && !isInternalUpdate.current) {
      onDataChange(birthDetails);
    }
    // Reset the flag after the effect runs
    isInternalUpdate.current = false;
  }, [onDataChange, birthDetails]);
  
  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Scroll to input field on focus
  const handleInputFocus = (fieldPosition) => {
    if (scrollViewRef.current) {
      // Give time for keyboard to appear
      setTimeout(() => {
        // Use a reasonable offset to position the input in view
        scrollViewRef.current.scrollTo({
          y: fieldPosition,
          animated: true
        });
      }, 300);
    }
  };
  
  // Ensure birthTime is a valid Date object
  useEffect(() => {
    // If birthTime is not a Date object, initialize it
    if (birthDetails.birthTime && !(birthDetails.birthTime instanceof Date)) {
      // If it's the old format with hour, minute, ampm, convert it
      if (birthDetails.birthTime.hour && birthDetails.birthTime.minute && birthDetails.birthTime.ampm) {
        const now = new Date();
        const hour = parseInt(birthDetails.birthTime.hour);
        const minute = parseInt(birthDetails.birthTime.minute);
        const isPM = birthDetails.birthTime.ampm === 'PM';
        
        // Convert to 24-hour format if PM
        const hour24 = isPM && hour !== 12 ? hour + 12 : (hour === 12 && !isPM ? 0 : hour);
        
        now.setHours(hour24, minute, 0, 0);
        updateField('birthTime', now);
      } else {
        // Default to current time
        updateField('birthTime', new Date());
      }
    }
  }, []); // Run only once on mount
  
  // Fetch location suggestions when placeOfBirth changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (birthDetails.placeOfBirth && birthDetails.placeOfBirth.trim().length >= 3 && !isSelected) {
        fetchLocationSuggestions(birthDetails.placeOfBirth);
      } else {
        setLocationSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [birthDetails.placeOfBirth, isSelected, useAlternateApi]);
  
  // Gender options
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];
  
  // Handler functions
  const updateField = useCallback((field, value) => {
    // Set flag to indicate we're updating internally
    isInternalUpdate.current = true;
    
    setBirthDetails(prevDetails => ({
      ...prevDetails,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);
  
  // Fetch location suggestions from API
  const fetchLocationSuggestions = async (searchText) => {
    if (!searchText || searchText.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }
    
    setIsLoadingSuggestions(true);
    
    try {
      const api = useAlternateApi ? LOCATION_APIS.FALLBACK : LOCATION_APIS.PRIMARY;
      const params = new URLSearchParams();
      
      if (useAlternateApi) {
        // Photon API format
        params.append('q', searchText);
        params.append('limit', 5);
      } else {
        // Nominatim API format
        params.append('q', searchText);
        params.append('format', 'json');
        params.append('addressdetails', 1);
        params.append('limit', 5);
      }
      
      const response = await fetch(`${api}?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'KarmicKernanApp/1.0'
        }
      });
      
      const data = await response.json();
      
      if (useAlternateApi) {
        // Process Photon API response
        if (data && data.features) {
          const formattedResults = data.features.map((item, index) => ({
            place_id: item.properties.osm_id || `photon-${index}`,
            display_name: [
              item.properties.name,
              item.properties.city,
              item.properties.state,
              item.properties.country
            ].filter(Boolean).join(', ')
          }));
          setLocationSuggestions(formattedResults);
        } else {
          setLocationSuggestions([]);
        }
      } else {
        // Process Nominatim API response
        if (Array.isArray(data) && data.length > 0) {
          setLocationSuggestions(data);
        } else {
          // Try alternate API if no results
          if (!useAlternateApi) {
            setUseAlternateApi(true);
          } else {
            setLocationSuggestions([]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
      // Try alternate API if primary fails
      if (!useAlternateApi) {
        setUseAlternateApi(true);
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  
  // Handle location selection
  const handleSelectLocation = (location) => {
    updateField('placeOfBirth', location.display_name);
    setLocationSuggestions([]);
    setIsSelected(true);
  };
  
  // Date picker functionality
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateField('birthDate', selectedDate);
    }
  };
  
  // Time picker functionality
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      updateField('birthTime', selectedTime);
    }
  };
  
  // Update the gender selection function
  const handleGenderSelection = (option) => {
    updateField('gender', option.value);
    setShowGenderDropdown(false);
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!birthDetails.fullName || !birthDetails.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!birthDetails.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }
    
    if (!birthDetails.birthTime || !(birthDetails.birthTime instanceof Date)) {
      newErrors.birthTime = 'Time of birth is required';
    }
    
    if (!birthDetails.placeOfBirth || !birthDetails.placeOfBirth.trim()) {
      newErrors.placeOfBirth = 'Place of birth is required';
    }
    
    if (!birthDetails.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle continue
  const handleContinue = () => {
    if (validateForm()) {
      onContinue();
    }
  };
  
  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return 'Select date';
    return format(date, 'dd MMM yyyy');
  };
  
  // Format time for display
  const formatTimeForDisplay = (time) => {
    if (!time) return 'Select time';
    
    if (time instanceof Date) {
      const hours = time.getHours();
      const minutes = time.getMinutes();
      
      if (is24HourFormat) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else {
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
      }
    }
    
    // Handle old format
    if (typeof time === 'object' && time.hour && time.minute && time.ampm) {
      if (is24HourFormat) {
        const hour = parseInt(time.hour);
        const isPM = time.ampm === 'PM';
        const hour24 = isPM && hour !== 12 ? hour + 12 : (hour === 12 && !isPM ? 0 : hour);
        return `${hour24.toString().padStart(2, '0')}:${time.minute.padStart(2, '0')}`;
      } else {
        return `${time.hour}:${time.minute} ${time.ampm}`;
      }
    }
    
    return 'Select time';
  };
  
  // Render location suggestions
  const renderLocationSuggestions = () => {
    if (!birthDetails.placeOfBirth || birthDetails.placeOfBirth.length < 3 || isSelected) {
      return null;
    }

    return (
      <View style={styles.suggestionsContainer}>
        {isLoadingSuggestions ? (
          <ActivityIndicator size="small" color="#7765e3" style={styles.loader} />
        ) : locationSuggestions.length > 0 ? (
          <ScrollView 
            style={styles.suggestionsList}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {locationSuggestions.map(item => (
              <TouchableOpacity 
                key={item.place_id.toString()}
                style={styles.suggestionItem}
                onPress={() => handleSelectLocation(item)}
              >
                <Ionicons name="location" size={16} color="#7765e3" style={styles.suggestionIcon} />
                <Text style={styles.suggestionText} numberOfLines={2}>{item.display_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No locations found. Enter a valid city name.</Text>
            <TouchableOpacity
              style={styles.manualEntryButton}
              onPress={() => {
                handleSelectLocation({ 
                  place_id: 'manual', 
                  display_name: birthDetails.placeOfBirth 
                });
              }}
            >
              <Text style={styles.manualEntryText}>Use as entered</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      enabled={Platform.OS === 'ios'}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent,
          // Add just enough extra space for the keyboard
          keyboardVisible && { paddingBottom: keyboardHeight + 50 }
        ]}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text style={styles.title}>Your Birth Details</Text>
        <Text style={styles.subtitle}>
          We need your birth details to create an accurate astrological reading
        </Text>
        
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder="Enter your full name"
            value={birthDetails.fullName}
            onChangeText={(text) => updateField('fullName', text)}
            onFocus={() => handleInputFocus(0)}
          />
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          )}
        </View>
        
        {/* Birth Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={[styles.dateInput, errors.birthDate && styles.inputError]}
            onPress={() => {
              Keyboard.dismiss();
              setShowDatePicker(true);
            }}
          >
            <Text style={[
              styles.dateInputText,
              !birthDetails.birthDate && styles.placeholderText
            ]}>
              {birthDetails.birthDate ? formatDateForDisplay(birthDetails.birthDate) : 'Select date of birth'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          {errors.birthDate && (
            <Text style={styles.errorText}>{errors.birthDate}</Text>
          )}
          
          {showDatePicker && (
            <DateTimePicker
              value={birthDetails.birthDate || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>
        
        {/* Birth Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Time of Birth</Text>
          <View style={styles.timeFormatToggleContainer}>
            <Text style={styles.inputHint}>Approximate time is fine if you're not sure</Text>
            <View style={styles.formatToggle}>
              <Text style={styles.formatToggleText}>24h</Text>
              <Switch
                trackColor={{ false: '#d1d1d1', true: '#7765e3' }}
                thumbColor={'#fff'}
                onValueChange={() => setIs24HourFormat(!is24HourFormat)}
                value={is24HourFormat}
                style={styles.formatToggleSwitch}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.dateInput, errors.birthTime && styles.inputError]}
            onPress={() => {
              Keyboard.dismiss();
              setShowTimePicker(true);
            }}
          >
            <Text style={[
              styles.dateInputText,
              !birthDetails.birthTime && styles.placeholderText
            ]}>
              {birthDetails.birthTime ? formatTimeForDisplay(birthDetails.birthTime) : 'Select time of birth'}
            </Text>
            <Ionicons name="time-outline" size={20} color="#666" />
          </TouchableOpacity>
          {errors.birthTime && (
            <Text style={styles.errorText}>{errors.birthTime}</Text>
          )}
          
          {showTimePicker && (
            <DateTimePicker
              value={birthDetails.birthTime instanceof Date ? birthDetails.birthTime : new Date()}
              mode="time"
              is24Hour={is24HourFormat}
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>
        
        {/* Place of Birth */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Place of Birth</Text>
          <View style={styles.locationContainer}>
            <View style={[styles.inputContainer, errors.placeOfBirth && styles.inputError]}>
              <View style={styles.iconWrapper}>
                <Ionicons name="location-outline" size={22} color="#7765e3" />
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="Enter city, state, country"
                value={birthDetails.placeOfBirth}
                onChangeText={(text) => {
                  updateField('placeOfBirth', text);
                  setIsSelected(false);
                }}
                onFocus={() => handleInputFocus(400)}
              />
            </View>
            {errors.placeOfBirth && (
              <Text style={styles.errorText}>{errors.placeOfBirth}</Text>
            )}
            {renderLocationSuggestions()}
          </View>
        </View>
        
        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={[
            styles.dropdownContainer,
            showGenderDropdown && styles.dropdownContainerExpanded
          ]}>
            <TouchableOpacity 
              style={[styles.dropdownSelector, errors.gender && styles.inputError]}
              onPress={() => {
                Keyboard.dismiss();
                setShowGenderDropdown(!showGenderDropdown);
              }}
            >
              <Text style={[
                styles.dropdownSelectorText,
                !birthDetails.gender && styles.placeholderText
              ]}>
                {birthDetails.gender ? 
                  genderOptions.find(option => option.value === birthDetails.gender)?.label || 'Select gender' 
                  : 'Select gender'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            
            {/* Gender Dropdown */}
            {showGenderDropdown && (
              <View style={styles.dropdownOptions}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.dropdownOption,
                      birthDetails.gender === option.value && styles.dropdownOptionSelected
                    ]}
                    onPress={() => handleGenderSelection(option)}
                  >
                    <Text style={[
                      styles.dropdownOptionText,
                      birthDetails.gender === option.value && styles.dropdownOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender}</Text>
          )}
        </View>
        
        {/* Smaller bottom space */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Keyboard.dismiss();
            onBack();
          }}
        >
          <Text style={styles.backButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => {
            Keyboard.dismiss();
            handleContinue();
          }}
        >
          <Text style={styles.continueButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for keyboard
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  dateInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  timeFormatToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#888',
  },
  formatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatToggleText: {
    fontSize: 12,
    color: '#555',
    marginRight: 8,
  },
  formatToggleSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  locationContainer: {
    position: 'relative',
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  iconWrapper: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#ddd',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  loader: {
    padding: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  manualEntryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  manualEntryText: {
    fontSize: 14,
    color: '#555',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 90,
  },
  dropdownContainerExpanded: {
    zIndex: 100,
  },
  dropdownSelector: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownOptions: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 180,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionSelected: {
    backgroundColor: '#f0e7ff',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownOptionTextSelected: {
    color: '#7765e3',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginLeft: 4,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#7765e3',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 4,
  },
  bottomSpacer: {
    height: 80, // Reduced to minimal height needed for buttons
  },
});

export default BirthDetails; 