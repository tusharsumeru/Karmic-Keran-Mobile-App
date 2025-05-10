/**
 * Configuration for OAuth providers
 * Replace placeholder values with your actual OAuth credentials
 */

import { Platform } from 'react-native';

// Google OAuth configuration
export const GOOGLE_CONFIG = {
  // For Android devices
  androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  
  // For iOS devices
  iosClientId: 'YOUR_IOS_CLIENT_ID',
  
  // For web and Expo Go
  webClientId: 'YOUR_WEB_CLIENT_ID',
  expoClientId: 'YOUR_WEB_CLIENT_ID', // Usually the same as webClientId
  
  // Optional scopes to request
  scopes: ['profile', 'email'],
  
  // Response type to request (token or code)
  responseType: 'id_token',
};

// Meta/Facebook OAuth configuration (placeholder for future implementation)
export const META_CONFIG = {
  appId: 'YOUR_FACEBOOK_APP_ID',
  clientId: 'YOUR_FACEBOOK_CLIENT_ID',
};

// Helper to get the appropriate config based on platform
export const getGoogleConfig = () => {
  return {
    ...GOOGLE_CONFIG,
    // Add platform-specific settings if needed
    ...(Platform.OS === 'android' ? { androidClientId: GOOGLE_CONFIG.androidClientId } : {}),
    ...(Platform.OS === 'ios' ? { iosClientId: GOOGLE_CONFIG.iosClientId } : {}),
  };
}; 