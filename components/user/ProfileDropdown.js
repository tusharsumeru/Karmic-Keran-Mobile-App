import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { logout } from '../../actions/auth';

const ProfileDropdown = ({ user, onClose }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (!success) {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const navigateToProfile = () => {
    console.log('Navigating to profile...');
    
    try {
      router.push('/(user)/profile');
      console.log('Navigation initiated');
    } catch (error) {
      console.error('Navigation error:', error);
      
      // Fallback navigation
      Alert.alert(
        'Navigation Error',
        'Could not navigate to profile. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => console.log('OK Pressed')
          }
        ]
      );
    }
    
    if (onClose) {
      onClose();
    }
  };

  const navigateToQueries = () => {
    console.log('Navigating to queries...');
    
    try {
      router.push('/(user)/queries');
      console.log('Navigation to queries initiated');
    } catch (error) {
      console.error('Navigation error (queries):', error);
      
      // Fallback navigation
      Alert.alert(
        'Navigation Error',
        'Could not navigate to queries. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => console.log('OK Pressed')
          }
        ]
      );
    }
    
    if (onClose) {
      onClose();
    }
  };

  const navigateToSignIn = () => {
    try {
      router.push('/(auth)/sign-in');
    } catch (error) {
      console.error('Navigation error (sign in):', error);
    }
    
    if (onClose) {
      onClose();
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <View style={styles.dropdownContent}>
      <View style={styles.userInfo}>
        <View style={styles.avatarLarge}>
          {user?.images?.[0] ? (
            <Image source={{ uri: user.images[0] }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.initialsLarge}>{getInitials()}</Text>
          )}
        </View>
        <Text style={styles.userName}>
          {user?.name || (user?.email && user.email.split('@')[0]) || 'Guest User'}
        </Text>
        <Text style={styles.userEmail}>{user?.email || 'Not signed in'}</Text>
      </View>

      {user ? (
        <>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={navigateToProfile}
            activeOpacity={0.6}
            accessibilityLabel="Profile Settings"
          >
            <Ionicons name="settings-outline" size={18} color="#555" />
            <Text style={styles.menuText}>Profile Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={navigateToQueries}
            activeOpacity={0.6}
            accessibilityLabel="My Queries"
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#555" />
            <Text style={styles.menuText}>My Queries</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleLogout}
            activeOpacity={0.6}
            accessibilityLabel="Log out"
          >
            <Ionicons name="log-out-outline" size={18} color="#555" />
            <Text style={styles.menuText}>Log out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={navigateToSignIn}
          activeOpacity={0.6}
          accessibilityLabel="Sign In"
        >
          <Ionicons name="log-in-outline" size={18} color="#555" />
          <Text style={styles.menuText}>Sign In</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContent: {
    width: 220,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  userInfo: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initialsLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#777',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 14,
    marginLeft: 12,
    color: '#333',
  },
});

export default ProfileDropdown; 