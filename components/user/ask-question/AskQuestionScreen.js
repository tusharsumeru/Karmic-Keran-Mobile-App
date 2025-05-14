import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Switch,
  Platform,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../../actions/base_url';
import { createAuthConfig } from '../../../actions/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

// Location APIs for Place of Birth suggestions
const LOCATION_APIS = {
  PRIMARY: 'https://nominatim.openstreetmap.org/search',
  FALLBACK: 'https://photon.komoot.io/api/'
};

const AskQuestionScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState(new Date());
  const [birthLocation, setBirthLocation] = useState('');
  const [category, setCategory] = useState('');
  
  // UI control states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [is24HourFormat, setIs24HourFormat] = useState(false);
  
  // Location suggestions state
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [useAlternateApi, setUseAlternateApi] = useState(false);
  
  // New state for modal suggestions
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  
  // Categories for questions
  const categories = [
    { id: "Career & Business", label: "Career & Business" },
    { id: "Love & Relationships", label: "Love & Relationships" },
    { id: "Health & Wellness", label: "Health & Wellness" },
    { id: "Money & Finance", label: "Money & Finance" },
    { id: "Family & Children", label: "Family & Children" },
    { id: "Education & Learning", label: "Education & Learning" },
    { id: "Spiritual Growth", label: "Spiritual Growth" },
    { id: "Travel & Relocation", label: "Travel & Relocation" },
    { id: "General Guidance", label: "General Guidance" },
    { id: "Other", label: "Other" },
  ];
  
  // Gender options
  const genderOptions = [
    { id: 'Male', label: 'Male' },
    { id: 'Female', label: 'Female' },
    { id: 'Other', label: 'Other' }
  ];

  // Add state for gender dropdown
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  
  // Add state to track the location input position
  const [locationInputPosition, setLocationInputPosition] = useState(100); // Default position
  const locationInputRef = useRef(null);
  
  // Measure the position of the location input
  const measureLocationInput = () => {
    if (locationInputRef.current) {
      locationInputRef.current.measure((x, y, width, height, pageX, pageY) => {
        if (pageY > 0) { // Only update if we get a valid position
          setLocationInputPosition(pageY + height);
        }
      });
    }
  };
  
  // Call measure when layout changes
  useEffect(() => {
    const timeoutId = setTimeout(measureLocationInput, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Fetch location suggestions when birthLocation changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (birthLocation && birthLocation.trim().length >= 3 && !isSelected) {
        fetchLocationSuggestions(birthLocation);
      } else {
        setLocationSuggestions([]);
        setShowSuggestionsModal(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [birthLocation, isSelected, useAlternateApi]);
  
  // Format time for display
  const formatTimeForDisplay = (time) => {
    if (!time) return 'Select time';
    
    try {
      if (is24HourFormat) {
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else {
        let hours = time.getHours();
        const minutes = time.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        
        return `${hours}:${minutes} ${ampm}`;
      }
    } catch (error) {
      console.log('Error formatting time:', error);
      return 'Select time';
    }
  };
  
  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return 'Select date';
    try {
      return format(new Date(date), 'MM/dd/yyyy');
    } catch (error) {
      return 'Select date';
    }
  };
  
  // Date picker handler
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(format(selectedDate, 'MM/dd/yyyy'));
    }
  };
  
  // Time picker handler
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setBirthTime(selectedTime);
    }
  };

  // Show date picker with platform-specific handling
  const showDatePickerModal = () => {
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

  // Show time picker with platform-specific handling
  const showTimePickerModal = () => {
    Keyboard.dismiss(); 
    setShowTimePicker(true);
  };

  // Fetch location suggestions from APIs
  const fetchLocationSuggestions = async (query) => {
    if (!query || query.trim().length < 3) {
      setShowSuggestionsModal(false);
      return;
    }
    
    setIsLoadingSuggestions(true);
    setShowSuggestionsModal(true);
    measureLocationInput(); // Measure again when showing suggestions
    
    try {
      let data = [];
      
      if (!useAlternateApi) {
        // Try primary API
        try {
          const response = await fetch(
            `${LOCATION_APIS.PRIMARY}?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`, 
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
                setLocationSuggestions(data);
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
            `${LOCATION_APIS.FALLBACK}?q=${encodeURIComponent(query)}&limit=5`,
            { 
              headers: { 'Accept': 'application/json' },
              timeout: 5000
            }
          );
          
          if (response.ok) {
            const result = await response.json();
            
            // Process Photon API data (different structure)
            if (result && result.features) {
              data = result.features.map(item => ({
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
      // Make sure to measure again after loading is complete
      setTimeout(measureLocationInput, 50);
    }
  };

  // Handle location selection
  const handleSelectLocation = (location) => {
    setBirthLocation(location.display_name);
    setLocationSuggestions([]);
    setIsSelected(true);
    setShowSuggestionsModal(false);
  };
  
  const handleSubmit = async () => {
    if (!name || !email || !gender || !birthDate || !birthTime || !birthLocation || !category || !question) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the createAuthConfig helper to get proper authentication headers
      const config = await createAuthConfig();
      
      // Format time for API
      let formattedTime;
      if (birthTime instanceof Date) {
        const hours = birthTime.getHours().toString().padStart(2, '0');
        const minutes = birthTime.getMinutes().toString().padStart(2, '0');
        formattedTime = `${hours}:${minutes}`;
      } else {
        formattedTime = birthTime;
      }
      
      // Create request data
      const requestData = {
        name,
        email,
        gender: gender.toLowerCase(),
        date_of_birth: birthDate,
        time_of_birth: formattedTime,
        place_of_birth: birthLocation,
        category: category === 'Other' ? 'Custom' : category,
        question
      };
      
      console.log('Submitting question:', requestData);
      
      // Make the API call directly
      const response = await fetch(`${BASE_URL}/query`, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      console.log('Question submission result:', data);
      
      if (response.ok) {
        // Success message
        alert('Your question has been submitted successfully!');
        
        // Reset form
        setName('');
        setEmail('');
        setGender('');
        setBirthDate('');
        setBirthTime(new Date());
        setBirthLocation('');
        setCategory('');
        setQuestion('');
        
        // Navigate to queries list
        navigation.navigate('queries');
      } else {
        throw new Error(data.message || 'Failed to submit question');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Error submitting your question: ' + (error.message || 'Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Add this style update for the modal container
  const getModalStyle = () => {
    return {
      position: 'absolute',
      top: locationInputPosition,
      left: 20,
      right: 20,
      maxHeight: 250,
      backgroundColor: '#fff',
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#ddd',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 10,
      zIndex: 9999,
      marginTop: -1, // Slight overlap to hide the gap
    };
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.mainTitle}>Ask Your Question</Text>
        
        <Text style={styles.subtitle}>
          Share your concerns and receive personalized astrological guidance.
        </Text>
        
        {/* Steps */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Enter Details</Text>
            <Text style={styles.stepDescription}>Birth information</Text>
          </View>
          
          <View style={styles.stepDivider} />
          
          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Ask Question</Text>
            <Text style={styles.stepDescription}>Choose category</Text>
          </View>
          
          <View style={styles.stepDivider} />
          
          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Get Answer</Text>
            <Text style={styles.stepDescription}>Within 24hrs</Text>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          {/* Personal Details Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            <View style={styles.formGrid}>
              {/* Name Field */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              
              {/* Email Field */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email Address"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              
              {/* Gender Field */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <TouchableOpacity 
                  style={styles.locationWrapper}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowGenderDropdown(!showGenderDropdown);
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#f87400" style={styles.locationIcon} />
                  <Text style={[
                    styles.dateInputText,
                    !gender && styles.placeholderText
                  ]}>
                    {gender ? 
                      genderOptions.find(option => option.id === gender)?.label || 'Select gender' 
                      : 'Select gender'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" style={{marginLeft: 'auto'}} />
                </TouchableOpacity>
                
                {showGenderDropdown && (
                  <View style={styles.dropdownList}>
                    {genderOptions.map(option => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.dropdownItem,
                          gender === option.id && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setGender(option.id);
                          setShowGenderDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          gender === option.id && styles.dropdownItemTextSelected
                        ]}>
                          {option.label}
                        </Text>
                        {gender === option.id && (
                          <Ionicons name="checkmark" size={16} color="#f87400" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Date of Birth Field */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Date of Birth</Text>
                <TouchableOpacity
                  style={styles.locationWrapper}
                  onPress={showDatePickerModal}
                >
                  <Ionicons name="calendar-outline" size={20} color="#f87400" style={styles.locationIcon} />
                  <Text style={[
                    styles.dateInputText,
                    !birthDate && styles.placeholderText
                  ]}>
                    {birthDate ? birthDate : 'MM/DD/YYYY'}
                  </Text>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={birthDate ? new Date(birthDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                  />
                )}
              </View>
              
              {/* Time of Birth Field */}
              <View style={styles.formField}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Time of Birth</Text>
                  <View style={styles.timeFormatContainer}>
                    <Text style={styles.timeFormatText}>24h</Text>
                    <Switch
                      trackColor={{ false: '#d1d1d1', true: '#f87400' }}
                      thumbColor={'#fff'}
                      onValueChange={() => setIs24HourFormat(!is24HourFormat)}
                      value={is24HourFormat}
                      style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.locationWrapper}
                  onPress={showTimePickerModal}
                >
                  <Ionicons name="time-outline" size={20} color="#f87400" style={styles.locationIcon} />
                  <Text style={[
                    styles.dateInputText,
                    !birthTime && styles.placeholderText
                  ]}>
                    {birthTime ? formatTimeForDisplay(birthTime) : 'HH:MM AM/PM'}
                  </Text>
                </TouchableOpacity>
                
                {showTimePicker && (
                  <DateTimePicker
                    value={birthTime instanceof Date ? birthTime : new Date()}
                    mode="time"
                    is24Hour={is24HourFormat}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimeChange}
                  />
                )}
              </View>
              
              {/* Birth Location Field */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Birth Location</Text>
                <View 
                  ref={locationInputRef}
                  style={[
                    styles.locationWrapper,
                    showSuggestionsModal && locationSuggestions.length > 0 && {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0
                    }
                  ]}
                  onLayout={() => {
                    // Measure after layout is complete
                    setTimeout(measureLocationInput, 50);
                  }}
                >
                  <Ionicons name="location-outline" size={20} color="#f87400" style={styles.locationIcon} />
                  <TextInput
                    style={styles.locationInput}
                    placeholder="City, State, Country"
                    value={birthLocation}
                    onFocus={() => {
                      measureLocationInput();
                      if (birthLocation.length >= 3 && !isSelected) {
                        fetchLocationSuggestions(birthLocation);
                      }
                    }}
                    onChangeText={(text) => {
                      setBirthLocation(text);
                      setIsSelected(false);
                      // Measure on every text change to handle keyboard appearance
                      setTimeout(measureLocationInput, 50);
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
          
          {/* Category Selection */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Select Question Category</Text>
            
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.id && styles.categorySelected
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text 
                    style={[
                      styles.categoryText,
                      category === cat.id && styles.categoryTextSelected
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Question Content */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Your Question</Text>
            
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Type your detailed question here... The more specific you are, the better guidance you'll receive."
              multiline={true}
              numberOfLines={8}
              textAlignVertical="top"
              value={question}
              onChangeText={setQuestion}
            />
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.buttonContentLoading}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit Question ✨</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Location Suggestions Modal */}
      <Modal
        transparent={true}
        visible={showSuggestionsModal && locationSuggestions.length > 0}
        animationType="none"
        onRequestClose={() => setShowSuggestionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuggestionsModal(false)}
        >
          <View style={getModalStyle()}>
            {isLoadingSuggestions ? (
              <ActivityIndicator size="small" color="#f87400" style={styles.loader} />
            ) : (
              <ScrollView
                style={styles.suggestionsList}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {locationSuggestions.map((item) => (
                  <TouchableOpacity
                    key={item.place_id.toString()}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectLocation(item)}
                  >
                    <Ionicons name="location" size={16} color="#f87400" style={styles.suggestionIcon} />
                    <Text style={styles.suggestionText} numberOfLines={2}>{item.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 16,
    paddingBottom: 30,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f87400',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  stepDivider: {
    height: 1,
    width: 24,
    backgroundColor: '#ddd',
  },
  formContainer: {
    padding: 16,
    position: 'relative',
    zIndex: 1,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  formGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  formField: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  textInput: {
    height: 48,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  // New date input styles
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#aaa',
  },
  timeFormatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeFormatText: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  // Updated gender selection styles
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingLeft: 0,
    paddingRight: 12,
  },
  locationIcon: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingVertical: 12,
    marginRight: 12,
    color: '#f87400',
  },
  locationInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 9999,
    elevation: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  suggestionsList: {
    width: '100%',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    marginRight: 12,
    color: '#f87400',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  loader: {
    padding: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryOption: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  categorySelected: {
    backgroundColor: '#f87400',
    borderColor: '#f87400',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  textArea: {
    height: 160,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    height: 56,
    backgroundColor: '#f87400',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 80,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonContentLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  selectInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  selectInputText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    position: 'absolute',
    top: 52, // Position closer to the input
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    maxHeight: 180,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#fff4e5',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#f87400',
    fontWeight: 'bold',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  suggestionsModalContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 9999,
  },
});

export default AskQuestionScreen; 