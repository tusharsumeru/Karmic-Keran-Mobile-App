import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAuthConfig, searchLocationSuggestions } from '../../actions/auth';

/**
 * LocationPicker component for selecting locations with autocomplete
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.value - Current input value
 * @param {function} props.onLocationSelect - Callback when location is selected
 * @param {string} props.placeholder - Input placeholder
 * @param {Object} props.style - Additional container styles
 */
const LocationPicker = ({ 
  label, 
  value, 
  onLocationSelect, 
  placeholder = "Enter location...",
  style = {}
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Reset query when value changes externally
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Debounced search function
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query && query.length > 2) {
        await searchLocations(query);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const searchLocations = async (searchText) => {
    try {
      setLoading(true);
      
      // Get auth config for API request
      const config = await createAuthConfig();
      
      // Call the location search API
      const result = await searchLocationSuggestions(config, searchText);
      
      // Process results
      if (result.status === 200) {
        // Debug log
        console.log('Location suggestions received:', result.data);
        
        // Handle different possible response formats
        let suggestionsArray = [];
        
        if (Array.isArray(result.data)) {
          suggestionsArray = result.data;
        } else if (result.data && Array.isArray(result.data.locations)) {
          // Sometimes API returns nested locations array
          suggestionsArray = result.data.locations;
        } else if (typeof result.data === 'object' && result.data !== null) {
          // Convert object to array if needed
          suggestionsArray = [result.data];
        }
        
        // Ensure all items have necessary properties
        suggestionsArray = suggestionsArray.map(item => {
          if (!item.display_name && (item.city || item.state || item.country)) {
            // Construct display_name from parts if missing
            item.display_name = [item.city, item.state, item.country]
              .filter(Boolean)
              .join(', ');
          }
          // Ensure place_id exists
          if (!item.place_id) {
            item.place_id = Math.random().toString(36).substr(2, 9);
          }
          return item;
        });
        
        // Filter out duplicates
        const uniqueLocations = filterDuplicateLocations(suggestionsArray);
        setSuggestions(uniqueLocations.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(uniqueLocations.length > 0);
        console.log('Processed suggestions count:', uniqueLocations.length);
      } else {
        console.log('Error from location API:', result.message);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // Remove duplicate locations by display_name
  const filterDuplicateLocations = (locations) => {
    const seen = new Set();
    return locations.filter(item => {
      if (!item || typeof item !== 'object') return false;
      if (!item.display_name) return false;
      if (seen.has(item.display_name)) return false;
      seen.add(item.display_name);
      return true;
    });
  };

  // Handle location selection
  const handleSelectLocation = (location) => {
    setQuery(location.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Pass selected location to parent component
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  // Clear the input
  const handleClearInput = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Pass empty value to parent component
    if (onLocationSelect) {
      onLocationSelect(null);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onFocus={() => {
            if (query.length > 2) {
              setShowSuggestions(true);
            }
          }}
        />
        
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color="#7765E3" 
            style={styles.inputIcon} 
          />
        ) : query ? (
          <TouchableOpacity 
            style={styles.inputIcon}
            onPress={handleClearInput}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : (
          <View style={styles.inputIcon}>
            <Ionicons name="search" size={20} color="#999" />
          </View>
        )}
      </View>
      
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id?.toString() || item.display_name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectLocation(item)}
              >
                <Ionicons 
                  name="location" 
                  size={16} 
                  color="#7765E3" 
                  style={styles.locationIcon} 
                />
                <Text 
                  style={styles.suggestionText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            contentContainerStyle={{ paddingVertical: 4 }}
            keyboardShouldPersistTaps="always"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 48,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationIcon: {
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});

export default LocationPicker; 