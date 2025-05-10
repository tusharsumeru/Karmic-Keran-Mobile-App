import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Switch,
  Modal,
  FlatList,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  createAuthConfig, 
  calculateBirthChart
} from '../../../actions/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

// Location APIs for fallback
const LOCATION_APIS = {
  PRIMARY: 'https://nominatim.openstreetmap.org/search',
  FALLBACK: 'https://photon.komoot.io/api/'
};

const BirthInfoScreen = ({ onBack, onBirthChartCalculated, toolType = 'generic-reading' }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState({
    hour: '09',
    minute: '00',
    ampm: 'AM'
  });
  const [birthLocation, setBirthLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [useAlternateApi, setUseAlternateApi] = useState(false);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [dontKnowBirthTime, setDontKnowBirthTime] = useState(false);
  const [selectedPickerType, setSelectedPickerType] = useState('hour'); // 'hour', 'minute', or 'ampm'
  const [timeOfBirth, setTimeOfBirth] = useState(new Date());
  const [locationComponents, setLocationComponents] = useState({
    city: '',
    state: '',
    country: ''
  });
  const [errors, setErrors] = useState({});

  // Format date as DD/MM/YYYY for display
  const formatDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Handle date change from picker
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  // Format time as HH:MM AM/PM for display
  const formatTime = (time) => {
    if (!time) return '12:00 PM';
    
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${hours}:${minutes} ${ampm}`;
  };

  // Handle time change from picker
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTimeOfBirth(selectedTime);
      
      // Update birthTime state for compatibility with existing code
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      const displayHours = hours % 12 || 12;
      
      setBirthTime({
        hour: displayHours.toString().padStart(2, '0'),
        minute: minutes.toString().padStart(2, '0'),
        ampm: ampm
      });
    }
  };

  // Clock functions for time picker
  const getHourPositions = () => {
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const radius = 100;
    const centerX = radius;
    const centerY = radius;
    
    return hours.map((hour, index) => {
      const angle = (index * 30 - 90) * (Math.PI / 180);
      const x = centerX + radius * 0.7 * Math.cos(angle);
      const y = centerY + radius * 0.7 * Math.sin(angle);
      return { hour, x, y };
    });
  };

  // Generate grid for minutes
  const getMinuteGrid = () => {
    const minutes = [];
    for (let i = 0; i < 60; i += 5) {
      minutes.push(i.toString().padStart(2, '0'));
    }
    return minutes;
  };

  // Render visual clock time picker
  const renderVisualTimePicker = () => {
    if (selectedPickerType === 'hour') {
      // Render hour clock
      const hourPositions = getHourPositions();
      
      return (
        <View style={styles.visualPickerContainer}>
          <Text style={styles.visualPickerTitle}>Select Hour</Text>
          
          <View style={styles.timeDisplay}>
            <Text style={styles.timeDisplayText}>
              {birthTime.hour}:{birthTime.minute} {birthTime.ampm}
            </Text>
          </View>
          
          <View style={styles.clockContainer}>
            <View style={styles.clockCenter} />
            
            {hourPositions.map(({ hour, x, y }) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.hourButton,
                  hour === birthTime.hour && styles.selectedTimeButton,
                  { position: 'absolute', left: x - 20, top: y - 20 }
                ]}
                onPress={() => handleTimeSelection(hour)}
              >
                <Text style={[
                  styles.hourButtonText,
                  hour === birthTime.hour && styles.selectedTimeButtonText
                ]}>
                  {hour}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.timeTypeSelector}>
            <TouchableOpacity 
              style={styles.timeTypeButton}
              onPress={() => setSelectedPickerType('minute')}
            >
              <Text style={styles.timeTypeButtonText}>Next: Select Minutes</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (selectedPickerType === 'minute') {
      // Render minute grid
      const minuteGrid = getMinuteGrid();
      
      return (
        <View style={styles.visualPickerContainer}>
          <Text style={styles.visualPickerTitle}>Select Minute</Text>
          
          <View style={styles.timeDisplay}>
            <Text style={styles.timeDisplayText}>
              {birthTime.hour}:{birthTime.minute} {birthTime.ampm}
            </Text>
          </View>
          
          <View style={styles.minuteGridContainer}>
            {minuteGrid.map((minute) => (
              <TouchableOpacity
                key={minute}
                style={[
                  styles.minuteButton,
                  minute === birthTime.minute && styles.selectedTimeButton
                ]}
                onPress={() => handleTimeSelection(minute)}
              >
                <Text style={[
                  styles.minuteButtonText,
                  minute === birthTime.minute && styles.selectedTimeButtonText
                ]}>
                  {minute}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.timeTypeSelector}>
            <TouchableOpacity 
              style={styles.timeTypeButton}
              onPress={() => setSelectedPickerType('ampm')}
            >
              <Text style={styles.timeTypeButtonText}>Next: Select AM/PM</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      // Render AM/PM selector
      return (
        <View style={styles.visualPickerContainer}>
          <Text style={styles.visualPickerTitle}>Select AM/PM</Text>
          
          <View style={styles.timeDisplay}>
            <Text style={styles.timeDisplayText}>
              {birthTime.hour}:{birthTime.minute} {birthTime.ampm}
            </Text>
          </View>
          
          <View style={styles.ampmContainer}>
            <TouchableOpacity
              style={[
                styles.ampmButton,
                birthTime.ampm === 'AM' && styles.selectedAmPmButton
              ]}
              onPress={() => handleTimeSelection('AM')}
            >
              <Text style={[
                styles.ampmButtonText,
                birthTime.ampm === 'AM' && styles.selectedAmPmButtonText
              ]}>
                AM
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.ampmButton,
                birthTime.ampm === 'PM' && styles.selectedAmPmButton
              ]}
              onPress={() => handleTimeSelection('PM')}
            >
              <Text style={[
                styles.ampmButtonText,
                birthTime.ampm === 'PM' && styles.selectedAmPmButtonText
              ]}>
                PM
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeTypeSelector}>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  // Handle gender selection
  const handleGenderSelection = (selectedGender) => {
    setGender(selectedGender);
    setShowGenderPicker(false);
  };

  // Fetch location suggestions using BirthInfo setup approach
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (birthLocation && birthLocation.trim().length >= 3 && !isSelected) {
        fetchLocationSuggestions(birthLocation);
      } else {
        setLocationSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [birthLocation, isSelected, useAlternateApi]);

  const fetchLocationSuggestions = async (query) => {
    if (!query || query.trim().length < 3) return;
    
    // Limit API calls for better performance
    setIsLoadingSuggestions(true);
    try {
      let data = [];
      
      if (!useAlternateApi) {
        // Try primary API
        try {
          const response = await fetch(
            `${LOCATION_APIS.PRIMARY}?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=8`, 
            { 
              headers: { 'Accept': 'application/json' },
              timeout: 5000 
            }
          );
          
          // Check if response is OK and is JSON
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              data = await response.json();
              
              // Process OpenStreetMap data
              if (Array.isArray(data)) {
                // Limit to 8 suggestions to improve performance but also provide more options
                setLocationSuggestions(data.slice(0, 8));
              } else {
                console.log('Invalid data structure from primary API:', data);
                setUseAlternateApi(true);
              }
            } else {
              console.log('Non-JSON response from primary API');
              setUseAlternateApi(true);
            }
          } else {
            console.log('Primary API response not OK:', response.status);
            setUseAlternateApi(true);
          }
        } catch (error) {
          console.log('Error with primary API:', error);
          setUseAlternateApi(true);
        }
      }
      
      // Try fallback API if primary failed
      if (useAlternateApi) {
        try {
          const response = await fetch(
            `${LOCATION_APIS.FALLBACK}?q=${encodeURIComponent(query)}&limit=8`,
            { 
              headers: { 'Accept': 'application/json' },
              timeout: 5000
            }
          );
          
          if (response.ok) {
            const result = await response.json();
            
            // Process Photon API data (different structure)
            if (result && result.features) {
              data = result.features.slice(0, 8).map(item => ({
                place_id: item.properties.osm_id || Math.random().toString(),
                display_name: item.properties.name + (item.properties.city ? ', ' + item.properties.city : '') + 
                  (item.properties.country ? ', ' + item.properties.country : '')
              }));
              setLocationSuggestions(data);
            }
          }
        } catch (error) {
          console.log('Error with fallback API:', error);
          // If both APIs fail, use a simple approach
          setLocationSuggestions([{
            place_id: 'manual',
            display_name: query
          }]);
        }
      }
    } catch (error) {
      console.log('General error fetching locations:', error);
      // Provide at least the user input as an option
      setLocationSuggestions([{
        place_id: 'manual',
        display_name: query
      }]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSelectLocation = (location) => {
    setBirthLocation(location.display_name);
    setLocationSuggestions([]);
    setIsSelected(true);
    
    // Extract location components for API use
    const locationParts = location.display_name.split(', ');
    
    let city = '', state = '', country = '';
    
    if (location.address) {
      // Use address components from API if available
      city = location.address.city || location.address.town || location.address.village || location.address.hamlet || '';
      state = location.address.state || location.address.county || '';
      country = location.address.country || '';
    } else if (locationParts.length >= 3) {
      // Extract from display_name if address not available
      city = locationParts[0] || '';
      state = locationParts[1] || '';
      country = locationParts[locationParts.length - 1] || '';
    } else if (locationParts.length === 2) {
      city = locationParts[0] || '';
      country = locationParts[1] || '';
    } else if (locationParts.length === 1) {
      city = locationParts[0] || '';
    }

    // Fallback to ensure we have a country
    if (!country && locationParts.length > 0) {
      country = locationParts[locationParts.length - 1] || '';
    }
    
    // Store the components for API use
    setLocationComponents({ city, state, country });
    console.log('Parsed location:', { city, state, country });
  };

  const handleCalculateBirthChart = async () => {
    // Validate inputs
    const validationErrors = {};
    if (!name.trim()) validationErrors.name = 'Name is required';
    if (!gender) validationErrors.gender = 'Gender is required';
    if (!birthLocation) validationErrors.birthLocation = 'Birth location is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    setIsLoadingChart(true);

    try {
      const config = await createAuthConfig();
      
      // Format date for API
      const dateFormatted = `${birthDate.getFullYear()}-${(birthDate.getMonth() + 1).toString().padStart(2, '0')}-${birthDate.getDate().toString().padStart(2, '0')}`;
      
      // Format time for API
      let timeFormatted;
      if (dontKnowBirthTime) {
        // Use 12:00 noon as default if birth time is not known
        timeFormatted = '12:00';
      } else {
        // Convert hours, minutes, and AM/PM to 24-hour format
        let hours24 = parseInt(birthTime.hour, 10);
        if (birthTime.ampm === 'PM' && hours24 < 12) {
          hours24 += 12;
        } else if (birthTime.ampm === 'AM' && hours24 === 12) {
          hours24 = 0;
        }
        timeFormatted = `${hours24.toString().padStart(2, '0')}:${birthTime.minute}`;
      }
      
      // Use the stored location components
      const { city, state, country } = locationComponents;
      
      console.log('Calculating birth chart with:', {
        name,
        gender,
        date: dateFormatted,
        time: timeFormatted,
        city,
        state, 
        country,
        toolType
      });
      
      // Use the calculateBirthChart function from auth.js
      const result = await calculateBirthChart(
        config,
        name,
        gender,
        dateFormatted,
        timeFormatted,
        city,
        state,
        country,
        toolType // Pass the tool type to the API
      );
      
      if (result.status === 200 && result.data) {
        console.log('Birth chart calculation successful');
        // Add tool type to chart data
        const chartDataWithType = {
          ...result.data,
          toolType: toolType
        };
        
        // Pass the chart data to the parent component
        onBirthChartCalculated(chartDataWithType);
      } else {
        console.error('Birth chart API error:', result.message);
        Alert.alert('Error', result.message || 'Failed to calculate birth chart');
      }
    } catch (error) {
      console.error('Error calculating birth chart:', error);
      Alert.alert('Error', 'An error occurred while calculating your birth chart');
    } finally {
      setIsLoadingChart(false);
    }
  };

  // Gender options for the picker
  const genderOptions = ['Male', 'Female', 'Other'];

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container} 
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Birth Information</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Birth Details</Text>
            <Text style={styles.cardDescription}>
              Enter your birth information for accurate astrological analysis
            </Text>
          </View>
          
          <View style={styles.cardContent}>
            {/* Name Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>
            
            {/* Gender Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity
                style={[styles.genderSelector, errors.gender && styles.inputError]}
                onPress={() => setShowGenderPicker(true)}
              >
                <Text style={[
                  styles.genderSelectorText,
                  !gender && styles.placeholderText
                ]}>
                  {gender || 'Select gender'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
            </View>
            
            {/* Date of Birth */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons name="calendar-outline" size={22} color="#FF6B00" />
                </View>
                <Text style={styles.dateText}>{formatDate(birthDate)}</Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}
            </View>
            
            {/* Time of Birth */}
            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Time of Birth</Text>
                <TouchableOpacity
                  style={styles.dontKnowContainer}
                  onPress={() => setDontKnowBirthTime(!dontKnowBirthTime)}
                >
                  <Switch
                    value={dontKnowBirthTime}
                    onValueChange={setDontKnowBirthTime}
                    trackColor={{ false: "#ddd", true: "#7765E3" }}
                    thumbColor={dontKnowBirthTime ? "#fff" : "#fff"}
                  />
                  <Text style={styles.dontKnowText}>I don't know</Text>
                </TouchableOpacity>
              </View>

              {!dontKnowBirthTime ? (
                <TouchableOpacity
                  style={styles.timeInputContainer}
                  onPress={() => setShowTimePicker(true)}
                >
                  <View style={styles.iconWrapper}>
                    <Ionicons name="time-outline" size={22} color="#FF6B00" />
                  </View>
                  <Text style={styles.timeText}>
                    {formatTime(timeOfBirth)}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.dateInput}>
                  <Text style={[styles.dateInputText, { color: '#999' }]}>
                    12:00 PM (Noon, Default)
                  </Text>
                  <Ionicons name="time" size={20} color="#999" />
                </View>
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={timeOfBirth || new Date()}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}
            </View>
            
            {/* Place of Birth - Using the direct approach like in BirthInfo setup */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Place of Birth</Text>
              <View style={styles.locationContainer}>
                <View style={[styles.inputContainer, errors.birthLocation && styles.inputError]}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="location-outline" size={22} color="#FF6B00" />
                  </View>
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Enter city, state, country"
                    value={birthLocation}
                    onChangeText={(text) => {
                      setBirthLocation(text);
                      setIsSelected(false);
                      if (text.length < 3) {
                        setLocationSuggestions([]);
                      } else {
                        setShowLocationModal(true);
                      }
                    }}
                    onFocus={() => {
                      if (birthLocation.length >= 3 && locationSuggestions.length > 0) {
                        setShowLocationModal(true);
                      }
                    }}
                  />
                </View>
                {errors.birthLocation && (
                  <Text style={styles.errorText}>{errors.birthLocation}</Text>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCalculateBirthChart}
              disabled={isLoadingChart}
            >
              {isLoadingChart ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Calculate Chart</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.timePickerModalContent}>
                {renderVisualTimePicker()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Gender</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowGenderPicker(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.genderOptions}>
              {genderOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    gender === option && styles.genderOptionSelected
                  ]}
                  onPress={() => handleGenderSelection(option)}
                >
                  <Text style={[
                    styles.genderOptionText,
                    gender === option && styles.genderOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Suggestions Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.locationModalOverlay}>
          <View style={styles.locationModalContent}>
            <View style={styles.locationModalHeader}>
              <View style={styles.locationModalInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={{marginLeft: 10}} />
                <TextInput
                  style={styles.locationModalInput}
                  placeholder="Search city, state, country..."
                  value={birthLocation}
                  onChangeText={(text) => {
                    setBirthLocation(text);
                    setIsSelected(false);
                    if (text.length < 3) {
                      setLocationSuggestions([]);
                    }
                  }}
                  autoFocus={true}
                />
                {birthLocation.length > 0 && (
                  <TouchableOpacity
                    style={{marginRight: 10}}
                    onPress={() => {
                      setBirthLocation('');
                      setLocationSuggestions([]);
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={[styles.closeButton, {marginLeft: 10}]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={{color: '#FF6B00', fontWeight: '600'}}>Done</Text>
              </TouchableOpacity>
            </View>

            {isLoadingSuggestions ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FF6B00" />
                <Text style={styles.loaderText}>Searching locations...</Text>
              </View>
            ) : locationSuggestions.length > 0 ? (
              <FlatList
                data={locationSuggestions}
                keyExtractor={(item) => item.place_id?.toString() || Math.random().toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.locationModalItem}
                    onPress={() => {
                      handleSelectLocation(item);
                      setShowLocationModal(false);
                    }}
                  >
                    <Ionicons name="location" size={20} color="#FF6B00" style={styles.locationModalIcon} />
                    <View style={styles.locationModalTextContainer}>
                      <Text style={styles.locationModalText}>{item.display_name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListFooterComponent={
                  locationSuggestions.length > 0 ? (
                    <View style={styles.locationModalFooter}>
                      <Text style={styles.locationModalFooterText}>
                        Showing {locationSuggestions.length} results
                      </Text>
                    </View>
                  ) : null
                }
              />
            ) : birthLocation.length >= 3 ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={40} color="#ccc" style={styles.noResultsIcon} />
                <Text style={styles.noResultsText}>No locations found</Text>
                <TouchableOpacity
                  style={styles.manualEntryButton}
                  onPress={() => {
                    handleSelectLocation({ 
                      place_id: 'manual', 
                      display_name: birthLocation 
                    });
                    setShowLocationModal(false);
                  }}
                >
                  <Text style={styles.manualEntryText}>Use "{birthLocation}" as entered</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.searchPromptContainer}>
                <Ionicons name="search-outline" size={40} color="#ccc" />
                <Text style={styles.searchPromptText}>
                  Enter at least 3 characters to search
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  cardHeader: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  cardContent: {
    padding: 24,
  },
  cardFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    height: 48,
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 48,
    backgroundColor: '#fff',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 15,
  },
  // Time input styles
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 48,
    backgroundColor: '#fff',
  },
  iconWrapper: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    height: '100%',
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 15,
  },
  // Gender selector
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
    backgroundColor: '#fff',
  },
  genderSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  // Picker styles
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  pickerScrollView: {
    maxHeight: 300,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: '#FF6B00',
    fontWeight: '500',
  },
  // Time picker styles
  timePickerContainer: {
    padding: 16,
  },
  // Gender options
  genderOptions: {
    padding: 16,
  },
  genderOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#333',
  },
  genderOptionTextSelected: {
    color: '#FF6B00',
    fontWeight: '500',
  },
  // Location picker styles from BirthInfo setup
  locationContainer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    marginBottom: 10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 48,
    backgroundColor: '#fff',
  },
  locationInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    maxHeight: 280,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'scroll',
  },
  flatSuggestionsList: {
    maxHeight: 220,
    overflow: 'scroll',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  lastSuggestionItem: {
    borderBottomWidth: 0,
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  suggestionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  suggestionHeaderText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  scrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  scrollIndicatorText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  loader: {
    padding: 15,
  },
  noResultsContainer: {
    padding: 15,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  manualEntryButton: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  manualEntryText: {
    fontSize: 14,
    color: '#FF6B00',
  },
  submitButton: {
    backgroundColor: '#FF6B00', 
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dontKnowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dontKnowText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  locationModalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  locationModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    height: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  locationModalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 48,
    backgroundColor: '#f8f9fa',
  },
  locationModalInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  loaderContainer: {
    padding: 15,
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  locationModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationModalIcon: {
    marginRight: 10,
  },
  locationModalTextContainer: {
    flex: 1,
  },
  locationModalText: {
    fontSize: 16,
    color: '#333',
  },
  locationModalFooter: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  locationModalFooterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  searchPromptContainer: {
    padding: 15,
    alignItems: 'center',
  },
  searchPromptText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  noResultsIcon: {
    marginBottom: 10,
  },
  // Visual Time Picker Styles
  timePickerModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 360,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    padding: 0,
  },
  visualPickerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  visualPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  timeDisplay: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    minWidth: 120,
    alignItems: 'center',
  },
  timeDisplayText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF6B00',
  },
  clockContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#eee',
    position: 'relative',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B00',
    position: 'absolute',
  },
  hourButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  selectedTimeButton: {
    backgroundColor: '#FF6B00',
  },
  hourButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedTimeButtonText: {
    color: 'white',
  },
  minuteGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 280,
    marginBottom: 20,
  },
  minuteButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    backgroundColor: '#f8f9fa',
  },
  minuteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  ampmContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  ampmButton: {
    width: 120,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedAmPmButton: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  ampmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectedAmPmButtonText: {
    color: 'white',
  },
  timeTypeSelector: {
    marginTop: 10,
  },
  timeTypeButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },
  timeTypeButtonText: {
    color: '#FF6B00',
    fontWeight: '500',
  },
  doneButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: '#FF6B00',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default BirthInfoScreen; 