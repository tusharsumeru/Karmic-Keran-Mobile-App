import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { retrieveUser, logout } from '../../../actions/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const userData = await retrieveUser(config);
        if (userData?.status === 200 && userData?.data) {
          setUser(userData.data);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleProfilePress = () => {
    setIsOpen(false);
    router.push('/(admin)/profile');
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const dropdownOpacity = dropdownAnim;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {user?.profile_pic ? (
            <Image 
              source={{ uri: user.profile_pic }} 
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initials}>{getInitials(user?.name)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {isOpen && (
        <Modal
          transparent={true}
          visible={isOpen}
          animationType="none"
          onRequestClose={() => setIsOpen(false)}
        >
          <TouchableOpacity 
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          >
            <Animated.View 
              style={[
                styles.dropdown,
                {
                  opacity: dropdownOpacity,
                  transform: [{ translateY: dropdownTranslateY }],
                  right: 10,
                  top: 60,
                }
              ]}
            >
              <View style={styles.userInfoContainer}>
                <View style={styles.largeAvatarContainer}>
                  {user?.profile_pic ? (
                    <Image 
                      source={{ uri: user.profile_pic }} 
                      style={styles.largeAvatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.largeInitialsContainer}>
                      <Text style={styles.largeInitials}>{getInitials(user?.name)}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.userTextContainer}>
                  <Text style={styles.userName}>{user?.name || 'Admin User'}</Text>
                  <Text style={styles.userEmail}>{user?.email || ''}</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleProfilePress}
              >
                <Ionicons name="person-outline" size={20} color="#333" />
                <Text style={styles.menuItemText}>Profile Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#F44336" />
                <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  profileButton: {
    marginRight: 10,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdown: {
    position: 'absolute',
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  largeAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    marginRight: 12,
  },
  largeAvatar: {
    width: '100%',
    height: '100%',
  },
  largeInitialsContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeInitials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  logoutText: {
    color: '#F44336',
  },
});

export default ProfileDropdown; 