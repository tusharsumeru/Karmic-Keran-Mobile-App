import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Primary colors matching other components
const primaryColor = '#FF7A00';
const secondaryColor = '#FFA149';

// Get screen dimensions for responsive layout
const { height } = Dimensions.get('window');

// Alternatives for location API in case primary one fails
const LOCATION_APIS = {
  PRIMARY: 'https://nominatim.openstreetmap.org/search',
  FALLBACK: 'https://photon.komoot.io/api/'
};

const BirthInfo = ({ userData, setUserData, errors }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [useAlternateApi, setUseAlternateApi] = useState(false);

  // Fetch location suggestions when placeOfBirth changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (userData.placeOfBirth && userData.placeOfBirth.trim().length >= 3 && !isSelected) {
        fetchLocationSuggestions(userData.placeOfBirth);
      } else {
        setLocationSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [userData.placeOfBirth, isSelected, useAlternateApi]);

  const fetchLocationSuggestions = async (query) => {
    if (!query || query.trim().length < 3) return;
    
    setIsLoadingSuggestions(true);
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
    }
  };

  const handleSelectLocation = (location) => {
    setUserData({ ...userData, placeOfBirth: location.display_name });
    setLocationSuggestions([]);
    setIsSelected(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setUserData({ ...userData, dateOfBirth: selectedDate });
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setUserData({ ...userData, timeOfBirth: selectedTime });
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  const formatTime = (time) => {
    if (!time) return '';
    
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${hours}:${minutes} ${ampm}`;
  };

  // Render location suggestions separately to avoid FlatList inside ScrollView
  const renderLocationSuggestions = () => {
    if (!userData.placeOfBirth || userData.placeOfBirth.length < 3 || isSelected) {
      return null;
    }

    return (
      <View style={styles.suggestionsContainer}>
        {isLoadingSuggestions ? (
          <ActivityIndicator size="small" color={primaryColor} style={styles.loader} />
        ) : locationSuggestions.length > 0 ? (
          <FlatList
            data={locationSuggestions}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => handleSelectLocation(item)}
              >
                <Ionicons name="location" size={16} color={primaryColor} style={styles.suggestionIcon} />
                <Text style={styles.suggestionText} numberOfLines={2}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            nestedScrollEnabled={true}
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No locations found. Enter a valid city name.</Text>
            <TouchableOpacity
              style={styles.manualEntryButton}
              onPress={() => {
                handleSelectLocation({ 
                  place_id: 'manual', 
                  display_name: userData.placeOfBirth 
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
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Header moved outside the card - same as BasicInfo */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Birth Information</Text>
          <Text style={styles.subtitle}>Details about your birth</Text>
        </View>
        
        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name="calendar-outline" size={22} color={primaryColor} />
            </View>
            <Text style={styles.inputText}>
              {userData.dateOfBirth ? formatDate(userData.dateOfBirth) : 'Date of Birth'}
            </Text>
          </TouchableOpacity>
          {errors.dateOfBirth ? <Text style={styles.errorText}>{errors.dateOfBirth}</Text> : null}
          
          {showDatePicker && (
            <DateTimePicker
              value={userData.dateOfBirth || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
          
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name="time-outline" size={22} color={primaryColor} />
            </View>
            <Text style={styles.inputText}>
              {userData.timeOfBirth ? formatTime(userData.timeOfBirth) : 'Time of Birth'}
            </Text>
          </TouchableOpacity>
          {errors.timeOfBirth ? <Text style={styles.errorText}>{errors.timeOfBirth}</Text> : null}
          
          {showTimePicker && (
            <DateTimePicker
              value={userData.timeOfBirth || new Date()}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onTimeChange}
            />
          )}
          
          <View style={styles.locationContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.iconWrapper}>
                <Ionicons name="location-outline" size={22} color={primaryColor} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Place of Birth"
                value={userData.placeOfBirth}
                onChangeText={(text) => {
                  setIsSelected(false);
                  setUserData({ ...userData, placeOfBirth: text });
                }}
              />
            </View>
            {errors.placeOfBirth ? <Text style={styles.errorText}>{errors.placeOfBirth}</Text> : null}
            
            {/* Using position absolute to avoid nesting FlastList inside ScrollView */}
            {renderLocationSuggestions()}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    // Offset for bottom navigation bar to ensure true center
    marginBottom: 60, 
  },
  headerContainer: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 15,
    color: '#999',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
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
  locationContainer: {
    position: 'relative',
    zIndex: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    maxHeight: 200,
    zIndex: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  suggestionsList: {
    padding: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
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
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  manualEntryText: {
    fontSize: 14,
    color: '#FF7A00',
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 15,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 15,
  },
  placeholder: {
    color: '#999',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 5,
  },
});

export default BirthInfo; 