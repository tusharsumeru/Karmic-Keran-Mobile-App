import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';

const EditProfileDialog = ({ isVisible, onClose, onSave, field, loading }) => {
  const [value, setValue] = useState(field?.value);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' or 'time'
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  // Update value when field changes
  useEffect(() => {
    if (field) {
      setValue(field.value);
      
      // Reset password fields when dialog opens
      if (field.type === 'password') {
        setPasswordValues({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordError('');
      }
    }
  }, [field]);

  // Search location if location field has at least 3 characters
  useEffect(() => {
    if (
      field?.label === "Location of Birth" &&
      value?.length >= 3 &&
      !selected
    ) {
      const delayDebounce = setTimeout(() => {
        fetchCities(value);
      }, 500); // debounce delay

      return () => clearTimeout(delayDebounce);
    } else {
      setSuggestions([]);
    }
  }, [value, field?.label, selected]);

  // Fetch cities from OpenStreetMap API
  const fetchCities = async (searchText) => {
    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setSuggestions([]);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Handle save action
  const handleSave = () => {
    // Special handling for password fields
    if (field?.type === 'password') {
      if (!passwordValues.currentPassword) {
        setPasswordError('Current password is required');
        return;
      }
      
      if (!passwordValues.newPassword) {
        setPasswordError('New password is required');
        return;
      }
      
      if (passwordValues.newPassword !== passwordValues.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      
      // Password should be at least 8 characters
      if (passwordValues.newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        return;
      }
      
      // Save the password values
      onSave(passwordValues, field);
      return;
    }
    
    // For other fields
    onSave(value, field);
  };

  // Handle date/time selection
  const handleDateTimeChange = (event, selectedValue) => {
    setShowDateTimePicker(Platform.OS === 'ios');
    
    if (event.type === 'dismissed') {
      return;
    }

    if (selectedValue) {
      if (pickerMode === 'date') {
        // Format date as YYYY-MM-DD
        const formattedDate = selectedValue.toISOString().split('T')[0];
        setValue(formattedDate);
      } else if (pickerMode === 'time') {
        // Format time as HH:MM
        const hours = selectedValue.getHours().toString().padStart(2, '0');
        const minutes = selectedValue.getMinutes().toString().padStart(2, '0');
        setValue(`${hours}:${minutes}`);
      }
    }
  };

  // Get appropriate icon for field
  const getFieldIcon = () => {
    switch(field?.label) {
      case "Name":
        return <FontAwesome5 name="user" size={20} color="#FF7A00" />;
      case "Email":
        return <FontAwesome5 name="envelope" size={20} color="#FF7A00" />;
      case "Gender": 
        return <FontAwesome5 name="venus-mars" size={20} color="#FF7A00" />;
      case "Date of Birth": 
        return <FontAwesome5 name="calendar-alt" size={20} color="#FF7A00" />;
      case "Time of Birth": 
        return <FontAwesome5 name="clock" size={20} color="#FF7A00" />;
      case "Location of Birth": 
        return <FontAwesome5 name="map-marker-alt" size={20} color="#FF7A00" />;
      default: 
        return <Feather name="edit-2" size={20} color="#FF7A00" />;
    }
  };

  // Render different input based on field type
  const renderFieldInput = () => {
    if (field?.type === 'password') {
      return (
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            value={passwordValues.currentPassword}
            onChangeText={(text) => {
              setPasswordValues({...passwordValues, currentPassword: text});
              setPasswordError('');
            }}
            placeholder="Current password"
            placeholderTextColor="#999"
            secureTextEntry
          />
          
          <View style={styles.inputSpacer} />
          
          <TextInput
            style={styles.input}
            value={passwordValues.newPassword}
            onChangeText={(text) => {
              setPasswordValues({...passwordValues, newPassword: text});
              setPasswordError('');
            }}
            placeholder="New password"
            placeholderTextColor="#999"
            secureTextEntry
          />
          
          <View style={styles.inputSpacer} />
          
          <TextInput
            style={styles.input}
            value={passwordValues.confirmPassword}
            onChangeText={(text) => {
              setPasswordValues({...passwordValues, confirmPassword: text});
              setPasswordError('');
            }}
            placeholder="Confirm new password"
            placeholderTextColor="#999"
            secureTextEntry
          />
          
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>
      );
    }
    
    if (field?.type === 'select' || field?.label === "Gender") {
      return (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => setValue(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select" value="" />
            {field?.options?.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        </View>
      );
    }

    if (field?.type === 'date') {
      return (
        <View>
          <TouchableOpacity 
            style={styles.dateTimeButton} 
            onPress={() => {
              setPickerMode('date');
              setShowDateTimePicker(true);
            }}
          >
            <Text style={styles.dateTimeText}>{value || 'Select date'}</Text>
            <FontAwesome5 name="calendar-alt" size={20} color="#FF7A00" />
          </TouchableOpacity>
          
          {showDateTimePicker && pickerMode === 'date' && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateTimeChange}
              accentColor="#FF7A00"
            />
          )}
        </View>
      );
    }

    if (field?.type === 'time') {
      return (
        <View>
          <TouchableOpacity 
            style={styles.dateTimeButton} 
            onPress={() => {
              setPickerMode('time');
              setShowDateTimePicker(true);
            }}
          >
            <Text style={styles.dateTimeText}>{value || 'Select time'}</Text>
            <FontAwesome5 name="clock" size={20} color="#FF7A00" />
          </TouchableOpacity>
          
          {showDateTimePicker && pickerMode === 'time' && (
            <DateTimePicker
              value={(() => {
                const date = new Date();
                if (value) {
                  const [hours, minutes] = value.split(':').map(Number);
                  date.setHours(hours, minutes, 0);
                }
                return date;
              })()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateTimeChange}
              accentColor="#FF7A00"
            />
          )}
        </View>
      );
    }

    if (field?.label === "Location of Birth") {
      return (
        <View style={styles.locationInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={value}
            onChangeText={(text) => {
              setSelected(false);
              setValue(text);
            }}
            placeholderTextColor="#999"
          />
          
          {loadingLocation && (
            <View style={styles.suggestionLoading}>
              <ActivityIndicator size="small" color="#FF7A00" />
              <Text style={styles.loadingText}>Searching locations...</Text>
            </View>
          )}
          
          {suggestions.length > 0 && !selected && (
            <View style={styles.suggestionsContainer}>
              <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="handled">
                {suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion.place_id}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setValue(suggestion.display_name);
                      setSelected(true);
                      setSuggestions([]);
                      Keyboard.dismiss();
                    }}
                  >
                    <FontAwesome5 name="map-marker-alt" size={16} color="#FF7A00" />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {suggestion.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      );
    }

    return (
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder={`Enter ${field?.label}`}
        placeholderTextColor="#999"
      />
    );
  };

  if (!isVisible || !field) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.iconTitleContainer}>
                  <View style={styles.iconContainer}>
                    {getFieldIcon()}
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Edit {field.label}</Text>
                    <Text style={styles.modalDescription}>
                      Make changes to your {field.label.toLowerCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                {renderFieldInput()}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  iconTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#333',
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  locationInputContainer: {
    position: 'relative',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
    color: '#333',
  },
  suggestionLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#FF7A00',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  passwordContainer: {
    width: '100%',
  },
  inputSpacer: {
    height: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
});

export default EditProfileDialog; 