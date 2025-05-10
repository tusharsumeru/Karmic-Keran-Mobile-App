import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileDropdown from '../user/ProfileDropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { retrieveUser, createAuthConfig } from '../../actions/auth';

const ProfileButton = ({ style }) => {
  const [user, setUser] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
    fetchUserData();
  }, []);

  const checkAuthentication = async () => {
    try {
      const config = await createAuthConfig();
      setIsAuthenticated(!!config.headers.Authorization);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const config = await createAuthConfig();
      
      // Check if we have an authorization token in the config
      if (!config.headers.Authorization) {
        console.log('No authorization token found. Showing default profile.');
        setIsLoading(false);
        return;
      }

      const response = await retrieveUser(config);
      if (response.status === 200 && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        console.warn('Failed to fetch user data:', response.message);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const getInitials = () => {
    if (!user) return '?';
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={toggleDropdown}
        activeOpacity={0.7}
        accessibilityLabel="Profile menu"
        accessibilityRole="button"
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.initials}>{getInitials()}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View 
            style={styles.dropdownWrapper}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <ProfileDropdown 
              user={user} 
              onClose={() => setIsDropdownVisible(false)} 
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  profileButton: {
    padding: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  initials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownWrapper: {
    marginTop: 60,
    marginRight: 10,
  }
});

export default ProfileButton; 