import { Platform } from 'react-native';

// Simple environment detection for React Native
// Since dotenv isn't compatible with React Native, use __DEV__ instead
const isDev = __DEV__;

// Export config object with environment-specific settings
export default {
  isDevelopment: isDev,
  apiEndpoints: {
    admin: {
      consultations: '/consultation',
      fallbackConsultations: '/consultation/all'
    }
  }
}; 