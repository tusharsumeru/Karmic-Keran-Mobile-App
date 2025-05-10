import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SetupNavbar, SetupStepper } from '../../components/setup';

export default function SetupScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token and userId directly from AsyncStorage
        const [token, userId, storedEmail] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('userId'),
          AsyncStorage.getItem('email')
        ]);
        
        console.log('Setup check - Token:', token ? 'exists' : 'missing');
        console.log('Setup check - UserId:', userId || 'missing');
        
        if (!token) {
          console.log('No token found, redirecting to sign-in');
          router.replace('/(auth)/sign-in');
          return;
        }
        
        if (!userId) {
          // If no userId but we have a token, try to extract userId from token
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.userId) {
              // Save userId and continue
              await AsyncStorage.setItem('userId', payload.userId);
              console.log('Extracted userId from token:', payload.userId);
            } else {
              setError('Could not find user ID in token');
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Failed to extract userId from token:', e);
            setError('Invalid token format');
            setIsLoading(false);
            return;
          }
        }
        
        if (storedEmail) {
          setEmail(storedEmail);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Setup auth check error:', err);
        setError('Error checking authentication');
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7765e3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Please try signing in again</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SetupNavbar />
      <SetupStepper email={email} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 