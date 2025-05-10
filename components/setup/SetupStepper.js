import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BasicInfo from './BasicInfo';
import BirthInfo from './BirthInfo';
import Password from './Password';
import StepNavigation from './StepNavigation';
import { updateUser } from '../../actions/auth';

const TOTAL_STEPS = 3;

const SetupStepper = ({ email }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    email: email || '',
    name: '',
    gender: '',
    dateOfBirth: null,
    timeOfBirth: null,
    placeOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load saved progress on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('setupProgress');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          // Convert date strings back to Date objects
          if (parsedData.dateOfBirth) {
            parsedData.dateOfBirth = new Date(parsedData.dateOfBirth);
          }
          if (parsedData.timeOfBirth) {
            parsedData.timeOfBirth = new Date(parsedData.timeOfBirth);
          }
          
          setUserData(prev => ({
            ...prev,
            ...parsedData,
            email: email || prev.email, // Ensure email is always the latest
          }));
        }
      } catch (error) {
        console.error('Error loading saved setup data:', error);
      }
    };
    
    loadSavedData();
  }, [email]);

  // Save progress after each step
  const saveProgress = async () => {
    try {
      await AsyncStorage.setItem('setupProgress', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving setup progress:', error);
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!userData.name) newErrors.name = 'Name is required';
      if (!userData.gender) newErrors.gender = 'Gender is required';
    } 
    else if (currentStep === 2) {
      if (!userData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!userData.timeOfBirth) newErrors.timeOfBirth = 'Time of birth is required';
      if (!userData.placeOfBirth) newErrors.placeOfBirth = 'Place of birth is required';
    } 
    else if (currentStep === 3) {
      if (!userData.password) {
        newErrors.password = 'Password is required';
      } else if (userData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (!userData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (userData.password !== userData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateCurrentStep()) {
      // Save progress after each validated step
      await saveProgress();
      
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      } else {
        await completeSetup();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeSetup = async () => {
    try {
      setLoading(true);
      
      // Get auth info from AsyncStorage
      const [token, userId] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('userId')
      ]);
      
      if (!token || !userId) {
        Alert.alert('Error', 'Authentication information missing. Please sign in again.');
        router.replace('/(auth)/sign-in');
        return;
      }
      
      // Format user data for API
      const userDataForUpdate = {
        name: userData.name,
        gender: userData.gender,
        dob: userData.dateOfBirth ? userData.dateOfBirth.toISOString().split('T')[0] : null,
        tob: userData.timeOfBirth ? 
          (() => {
            let hours = userData.timeOfBirth.getHours();
            const minutes = userData.timeOfBirth.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            return `${hours}:${minutes} ${ampm}`;
          })() : null,
        location: userData.placeOfBirth,
        password: userData.password,
      };
      
      console.log('Updating user with data:', userDataForUpdate);
      
      // Create config with auth token
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Update user profile
      const response = await updateUser(config, userId, userDataForUpdate);
      console.log('Update response:', response);
      
      if (response?.status === 200) {
        // Clear setup progress after successful completion
        await AsyncStorage.removeItem('setupProgress');
        
        // Store user role (default to 'user' if not provided)
        const role = response.data?.role || 'user';
        await AsyncStorage.setItem('userRole', role);
        
        Alert.alert('Success', 'Your profile has been successfully set up!', [
          { 
            text: 'OK', 
            onPress: () => {
              // Redirect based on role
              if (role === 'admin') {
                router.replace('/(admin)/dashboard');
              } else {
                router.replace('/(user)/ask-question');
              }
            }
          }
        ]);
      } else {
        Alert.alert(
          'Error', 
          response?.message || 'Failed to update your information. Please try again.'
        );
      }
    } catch (error) {
      console.error('Setup completion error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfo userData={userData} setUserData={setUserData} errors={errors} />;
      case 2:
        return <BirthInfo userData={userData} setUserData={setUserData} errors={errors} />;
      case 3:
        return <Password userData={userData} setUserData={setUserData} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>
      
      <StepNavigation
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isNextDisabled={loading || (
          currentStep === 1 && (!userData.name || !userData.gender)) || 
          (currentStep === 2 && (!userData.dateOfBirth || !userData.timeOfBirth || !userData.placeOfBirth)) ||
          (currentStep === 3 && (!userData.password || !userData.confirmPassword || userData.password !== userData.confirmPassword))
        }
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
});

export default SetupStepper; 