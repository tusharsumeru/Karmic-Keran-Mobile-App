import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';

const BasicInfo = ({ userData, setUserData, errors, onNext }) => {
  // Primary colors matching SignIn and VerifyOTP
  const primaryColor = '#FF7A00';
  const secondaryColor = '#FFA149';
  
  const genderOptions = [
    { label: 'Select Gender', value: '' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Header moved outside the card and positioned lower */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Basic Information</Text>
          <Text style={styles.subtitle}>Let's get to know you better</Text>
        </View>
        
        <View style={styles.cardContainer}>
          {/* Email field (read-only) */}
          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="mail-outline" size={22} color={primaryColor} />
            </View>
            <TextInput
              style={[styles.input, { color: '#666' }]}
              placeholder="Email"
              value={userData.email}
              editable={false}
            />
          </View>
          
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="person-outline" size={22} color={primaryColor} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
            />
          </View>
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          
          {/* Gender Dropdown */}
          <View style={styles.pickerContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="male-female-outline" size={22} color={primaryColor} />
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={userData.gender}
                onValueChange={(value) => setUserData({ ...userData, gender: value })}
                style={styles.picker}
                dropdownIconColor={primaryColor}
              >
                {genderOptions.map((option) => (
                  <Picker.Item 
                    key={option.value} 
                    label={option.label} 
                    value={option.value}
                    color={option.value ? '#333' : '#999'}
                  />
                ))}
              </Picker>
            </View>
          </View>
          {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

          {/* Next Button */}
          {onNext && (
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={onNext}
              disabled={!userData.name || !userData.gender}
            >
              <LinearGradient
                colors={[!userData.name || !userData.gender ? '#cccccc' : primaryColor, !userData.name || !userData.gender ? '#cccccc' : secondaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
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
    color: '#333', // Removed strong color, more subtle
  },
  subtitle: {
    fontSize: 15,
    color: '#999', // Lighter color for subtitle
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
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    flex: 1,
    height: 56,
  },
  picker: {
    height: 56,
    width: '100%',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 5,
  },
  buttonContainer: {
    marginTop: 16,
  },
  gradientButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  }
});

export default BasicInfo; 