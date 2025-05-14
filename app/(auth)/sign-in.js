import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SignIn } from '../../components/auth';
import { checkEmail, signIn, resendOTP, processGoogleLogin } from '../../actions/auth';
import { saveToken, saveUser } from '../../utils/storage';
import LocalStorage from '../../utils/localStorage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { getGoogleConfig } from '../../utils/auth-config';

// Register for WebBrowser redirect URI handling
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Set up Google OAuth request with config from auth-config.js
  const googleConfig = getGoogleConfig();
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: googleConfig.androidClientId,
    iosClientId: googleConfig.iosClientId,
    webClientId: googleConfig.webClientId,
    expoClientId: googleConfig.expoClientId,
    scopes: googleConfig.scopes,
    responseType: googleConfig.responseType,
  });
  
  // Handle Google authentication response
  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success') {
        setLoading(true);
        const { authentication } = response;
        
        try {
          // Process the Google authentication with our backend
          const result = await processGoogleLogin(
            authentication.idToken,
            authentication.accessToken
          );
          
          if (result.success) {
            // Extract user data
            const user = result.data?.user || result.data;
            
            // Check if admin and redirect accordingly
            const isAdmin = user.role === 'admin' || user.is_admin;
            if (isAdmin) {
              router.replace('/(admin)/dashboard');
            } else {
              router.replace('/(user)/home');
            }
          } else {
            Alert.alert('Error', result.message || 'Failed to sign in with Google');
          }
        } catch (error) {
          console.error('Google auth processing error:', error);
          Alert.alert('Error', 'Failed to process Google sign in');
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (response) {
      handleGoogleResponse();
    }
  }, [response, router]);

  const handleEmailCheck = async (email, useOtpForLogin = false) => {
    setLoading(true);
    
    try {
      const response = await checkEmail(email);
      console.log('Email check response:', response);
      
      // Follow same logic as web version:
      // 201 - User exists, show password field
      // 200/202 - New user, send to OTP verification
      if ((response.status === 201 || 
          (response.status === 200 && response.isRegistered)) && 
          !useOtpForLogin) {
        // User exists, return response to show password field
        setLoading(false);
        return response;
      } else if (response.status === 200 || response.status === 202 || useOtpForLogin) {
        // New user OR existing user who wants to login with OTP
        // If it's an existing user who wants OTP, we'll need to send OTP
        if (useOtpForLogin && (response.status === 201 || response.isRegistered)) {
          try {
            // Send OTP for existing user
            const otpResponse = await resendOTP(email);
            if (otpResponse.status === 200 || otpResponse.status === 201) {
              // OTP sent successfully, redirect to verification page
              // Mark this as an existing user OTP login so we skip setup
              await LocalStorage.setItem('email', email);
              router.push({
                pathname: '/(auth)/verify-otp',
                params: { email, existingUser: 'true' }
              });
              setLoading(false);
              return otpResponse;
            } else {
              Alert.alert('Error', otpResponse.message || 'Failed to send OTP');
              setLoading(false);
              return null;
            }
          } catch (otpError) {
            Alert.alert('Error', 'Failed to send OTP. Please try again.');
            setLoading(false);
            return null;
          }
        } else {
          // New user, redirect to OTP verification
          await LocalStorage.setItem('email', email);
          router.push({
            pathname: '/(auth)/verify-otp',
            params: { email, existingUser: 'false' }
          });
          setLoading(false);
          return response;
        }
      } else {
        // Error handling
        Alert.alert('Error', response.message || 'Failed to process request');
        setLoading(false);
        return null;
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
      return null;
    }
  };

  const handleSignIn = async (email, password) => {
    setLoading(true);
    
    try {
      const response = await signIn(email, password);
      console.log('Sign in response:', response);
      
      // Follow same logic as web version
      if (response.status === 201) {
        // User authenticated with password, save token and redirect
        const token = response.data?.token;
        const user = response.data?.user || response.data;
        
        if (!token) {
          Alert.alert('Error', 'Authentication failed. No token received.');
          setLoading(false);
          return;
        }
        
        await saveToken(token);
        await saveUser(user);
        
        const isAdmin = user.role === 'admin' || user.is_admin;
        if (isAdmin) {
          router.replace('/(admin)/dashboard');
        } else {
          // Redirect to our new home screen instead of ask-question
          router.replace('/(user)/home');
        }
      } else if (response.status === 200 || response.status === 202) {
        // OTP flow needed, store email and redirect to verify OTP
        await LocalStorage.setItem('email', email);
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { email, existingUser: 'true' }
        });
      } else {
        // Error handling
        Alert.alert('Error', response.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen options={{ 
        headerShown: false
      }} />
      <SignIn 
        onSubmit={handleEmailCheck} 
        onLogin={handleSignIn}
        loading={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  }
}); 