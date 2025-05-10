import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys
const TOKEN_KEY = '@karmic_keran_token';
const USER_KEY = '@karmic_keran_user';

/**
 * Saves authentication token to AsyncStorage
 * @param {string} token - JWT token
 */
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

/**
 * Gets authentication token from AsyncStorage
 * @returns {Promise<string|null>} Token or null if not found
 */
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Saves user data to AsyncStorage
 * @param {Object} userData - User data object
 */
export const saveUser = async (userData) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

/**
 * Gets user data from AsyncStorage
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Clears auth data from AsyncStorage
 */
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}; 