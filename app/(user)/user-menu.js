import React from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserMenuScreen() {
  const router = useRouter();

  const navigateToScreen = (screen) => {
    if (screen === 'ask') {
      router.push('/(user)/ask-question');
    } else if (screen === 'book') {
      router.push('/(user)/book-consulation');
    } else if (screen === 'consults') {
      router.push('/(user)/my-consulatation');
    } else if (screen === 'discover') {
      router.push('/(user)/self-discovery');
    } else if (screen === 'profile') {
      router.push('/(user)/profile');
    } else if (screen === 'queries') {
      router.push('/(user)/queries');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear auth token or user data from storage
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              
              // Navigate to auth screen
              router.replace('/(auth)/sign-in');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Menu</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.optionsContainer}>
          {/* Main Navigation Options */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Main Navigation</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigateToScreen('ask')}
          >
            <View style={[styles.optionIcon, {backgroundColor: 'rgba(76, 175, 80, 0.1)'}]}>
              <Ionicons name="help-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Ask a Question</Text>
              <Text style={styles.optionDescription}>Get answers to your spiritual questions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigateToScreen('book')}
          >
            <View style={[styles.optionIcon, {backgroundColor: 'rgba(76, 175, 80, 0.1)'}]}>
              <Ionicons name="calendar" size={24} color="#4CAF50" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Book Consultation</Text>
              <Text style={styles.optionDescription}>Schedule a session with our experts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigateToScreen('consults')}
          >
            <View style={[styles.optionIcon, {backgroundColor: 'rgba(76, 175, 80, 0.1)'}]}>
              <Ionicons name="time" size={24} color="#4CAF50" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>My Consultations</Text>
              <Text style={styles.optionDescription}>View your upcoming and past sessions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigateToScreen('discover')}
          >
            <View style={[styles.optionIcon, {backgroundColor: 'rgba(76, 175, 80, 0.1)'}]}>
              <Ionicons name="compass" size={24} color="#4CAF50" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Discover</Text>
              <Text style={styles.optionDescription}>Explore self-discovery tools and resources</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          {/* Account Options */}
          <View style={[styles.sectionHeader, {marginTop: 30}]}>
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigateToScreen('profile')}
          >
            <View style={[styles.optionIcon, {backgroundColor: 'rgba(33, 150, 243, 0.1)'}]}>
              <Ionicons name="person" size={24} color="#2196F3" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Profile & Settings</Text>
              <Text style={styles.optionDescription}>Manage your account information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigateToScreen('queries')}
          >
            <View style={[styles.optionIcon, {backgroundColor: 'rgba(33, 150, 243, 0.1)'}]}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#2196F3" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>My Queries</Text>
              <Text style={styles.optionDescription}>View your previous questions and answers</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, styles.logoutOption]}
            onPress={handleLogout}
          >
            <View style={[styles.optionIcon, {backgroundColor: 'rgba(244, 67, 54, 0.1)'}]}>
              <Ionicons name="log-out" size={24} color="#f44336" />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, styles.logoutText]}>Logout</Text>
              <Text style={styles.optionDescription}>Sign out from your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 5,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  optionsContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionHeader: {
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#777',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#777',
  },
  logoutOption: {
    marginTop: 20,
  },
  logoutText: {
    color: '#f44336',
  }
}); 