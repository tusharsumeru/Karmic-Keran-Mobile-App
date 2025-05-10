import AsyncStorage from '@react-native-async-storage/async-storage';

// Shim for localStorage to be used in React Native with AsyncStorage
// This makes it easier to port code from web to React Native
class LocalStorage {
  static async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return null;
    }
  }

  static async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to AsyncStorage:', error);
      return false;
    }
  }

  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
      return false;
    }
  }
}

// Use this as a drop-in replacement for localStorage in React Native
export default LocalStorage; 