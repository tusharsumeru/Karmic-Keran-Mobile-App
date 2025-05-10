import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { VerifyOTP } from '../../components/auth';
import { verifyOTP, resendOTP } from '../../actions/auth';
import { saveToken, saveUser } from '../../utils/storage';
import LocalStorage from '../../utils/localStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerifyOTPScreen() {
  const [loading, setLoading] = useState(false);
  const [storedEmail, setStoredEmail] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email = '', existingUser = 'false' } = params;
  const isExistingUser = existingUser === 'true';

  // Get email from localStorage if not provided in params
  useEffect(() => {
    const getEmail = async () => {
      if (!email) {
        const emailFromStorage = await LocalStorage.getItem('email');
        if (emailFromStorage) {
          setStoredEmail(emailFromStorage);
        }
      }
    };
    
    getEmail();
  }, [email]);
  
  // Use email from params or localStorage
  const emailToUse = email || storedEmail;

  // Determine if user is an admin based on various possible properties
  const isUserAdmin = (user) => {
    if (!user) return false;
    
    // Check all possible admin indicators
    return (
      user.role === 'admin' || 
      user.is_admin === true || 
      user.isAdmin === true ||
      user.user_type === 'admin' ||
      user.userType === 'admin' ||
      user.type === 'admin'
    );
  };

  const handleVerify = async (email, otpCode) => {
    setLoading(true);
    
    try {
      const response = await verifyOTP(email, otpCode);
      console.log('Verify OTP response:', response);
      
      // Following web implementation logic:
      if (response.status === 200) {
        // Success, get token and handle routing
        if (response.data?.token) {
          const token = response.data.token;
          const user = response.data.user || response.data;
          
          console.log('User data from verification:', user);
          
          // Extract userId from token or user object
          let userId = '';
          if (user && user.id) {
            userId = user.id.toString();
          } else if (user && user._id) {
            userId = user._id.toString();
          } else {
            // Try to extract from token payload
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload.userId) {
                userId = payload.userId;
              }
            } catch (e) {
              console.error('Failed to extract userId from token:', e);
            }
          }
          
          // Determine if user is admin
          const isAdmin = isUserAdmin(user);
          // Always assign a role - default to 'user' if not admin and for new users
          const role = isAdmin ? 'admin' : 'user';
          
          console.log('Detected user role:', role);
          
          // Store everything in one go with direct AsyncStorage to ensure it completes
          await Promise.all([
            AsyncStorage.setItem('token', token),
            AsyncStorage.setItem('email', email),
            userId ? AsyncStorage.setItem('userId', userId) : Promise.resolve(),
            AsyncStorage.setItem('userRole', role)
          ]);
          
          // Also use the regular storage for compatibility
          await saveToken(token);
          await saveUser(user);
          
          // Delay navigation slightly to ensure storage operations complete
          setTimeout(() => {
            setLoading(false);
            
            // For existing users or users with profile data, go directly to dashboard based on role
            if (isExistingUser || user.name) {
              console.log("User already set up or is existing user, redirecting to main app");
              if (isAdmin) {
                console.log("Navigating to admin dashboard");
                router.replace('/(admin)/dashboard');
              } else {
                console.log("Navigating to user dashboard");
                router.replace('/(user)/ask-question');
              }
            } else {
              // Only new users who need to set up their profile should go to setup
              const needsSetup = !user.name || !user.gender || !user.dob;
              if (needsSetup) {
                console.log("New user needs setup, redirecting to setup screen");
                router.replace('/(setup)');
              } else {
                // Fallback navigation for users with complete profiles
                console.log("User has complete profile, redirecting to main app");
                if (isAdmin) {
                  router.replace('/(admin)/dashboard');
                } else {
                  router.replace('/(user)/ask-question');
                }
              }
            }
          }, 300);
          
          return { status: 200 };
        } else {
          // If token isn't provided, assume it's a new user and default to 'user' role
          console.log("No token returned. Setting default user role and redirecting to setup");
          await AsyncStorage.setItem('userRole', 'user');
          setLoading(false);
          
          // Redirect to setup screen for new user
          router.replace('/(setup)');
          return { status: 200 };
        }
      } else {
        // Handle error
        setLoading(false);
        return {
          status: response.status || 400,
          message: response.message || 'Verification failed'
        };
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setLoading(false);
      return {
        status: 500,
        message: 'An error occurred during verification'
      };
    }
  };

  const handleResend = async (emailAddr) => {
    try {
      const response = await resendOTP(emailAddr);
      console.log('Resend OTP response:', response);
      
      if (response.status === 200) {
        // Success
        return response;
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP');
      }
      
      return response;
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <VerifyOTP 
        email={emailToUse}
        onVerify={handleVerify}
        onResend={handleResend}
        loading={loading}
        isExistingUser={isExistingUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
}); 