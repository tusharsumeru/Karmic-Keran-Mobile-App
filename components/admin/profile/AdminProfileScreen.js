import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createAuthConfig, retrieveUser, updateUser, updateProfileImage, updatePassword } from '../../../actions/auth';
import ProfileEdit from './ProfileEdit';
import ChangePasswordDialog from './ChangePasswordDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminProfileScreen = () => {
  const [editField, setEditField] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: userData, isLoading: userLoading, error: userError, refetch } = useQuery({
    queryKey: ['admin-user'],
    queryFn: async () => {
      const config = await createAuthConfig();
      setConfig(config);
      const response = await retrieveUser(config);
      
      if (response.status !== 200) {
        throw new Error(`Error fetching user data: [${response.message}]`);
      }
      
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (error) => {
      console.error('User data fetch error:', error);
    }
  });

  // Handle edit field
  const handleEdit = (field) => {
    setEditField(field);
    setShowEditModal(true);
  };

  // Handle save after editing
  const handleSave = async (value, field) => {
    if (!userData?._id) {
      Alert.alert('Error', 'User ID not found. Please try logging in again.');
      return;
    }

    setLoading(true);
    try {
      let updatePayload = {};
      
      switch (field.fieldKey) {
        case 'name':
          updatePayload.name = value;
          break;
        case 'gender':
          updatePayload.gender = value;
          break;
        case 'dateOfBirth':
          updatePayload.dob = value;
          break;
        case 'timeOfBirth':
          updatePayload.tob = value;
          break;
        case 'locationOfBirth':
          updatePayload.location = value;
          break;
        default:
          console.warn('Unknown field:', field);
          return;
      }

      const response = await updateUser(config, userData._id, updatePayload);
      
      if (response?.status === 200) {
        queryClient.invalidateQueries({ queryKey: ['admin-user'] });
        await refetch();
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', response?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
      setShowEditModal(false);
    }
  };

  // Get initials from name for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle profile image selection and upload
  const pickImage = async () => {
    if (!config) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUploading(true);
        try {
          const response = await updateProfileImage(config, userData._id, result.assets[0]);
          
          if (response?.status === 200) {
            // Refresh user data to get updated profile pic URL
            queryClient.invalidateQueries({ queryKey: ['admin-user'] });
            await refetch();
            Alert.alert('Success', 'Profile picture updated successfully');
          } else {
            Alert.alert('Error', response?.message || 'Failed to update profile picture');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
          setImageUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Define profile fields
  const personalFields = [
    {
      label: "Name",
      value: userData?.name,
      editable: true,
      fieldKey: "name",
      icon: "user"
    },
    {
      label: "Email",
      value: userData?.email,
      editable: false,
      fieldKey: "email",
      icon: "envelope"
    },
    {
      label: "Gender",
      value: userData?.gender ?? "Not specified",
      editable: true,
      fieldKey: "gender",
      type: "select",
      options: ["Male", "Female", "Other"],
      icon: "venus-mars"
    },
  ];

  const birthFields = [
    {
      label: "Date of Birth",
      value: userData?.dob || "Not specified",
      editable: true,
      type: "date",
      fieldKey: "dateOfBirth",
      icon: "calendar-alt"
    },
    {
      label: "Time of Birth",
      value: userData?.tob || "Not specified",
      editable: true,
      type: "time",
      fieldKey: "timeOfBirth",
      icon: "clock"
    },
    {
      label: "Location of Birth",
      value: userData?.location || "Not specified",
      editable: true,
      fieldKey: "locationOfBirth",
      icon: "map-marker-alt"
    },
  ];

  const securityFields = [
    {
      label: "Password",
      value: "••••••••",
      editable: true,
      fieldKey: "password",
      type: "password",
      icon: "lock"
    }
  ];

  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (userError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading profile</Text>
        <Text style={styles.errorMessage}>{userError.message}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => queryClient.invalidateQueries({ queryKey: ['admin-user'] })}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#FF7A00', '#FFA149']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {userData?.profile_pic ? (
                <Image 
                  source={{ uri: userData.profile_pic }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {getInitials(userData?.name)}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <Feather name="camera" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            {imageUploading && (
              <View style={styles.uploadingIndicator}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userData?.name || 'Admin User'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'admin@example.com'}</Text>
        </View>
      </LinearGradient>

      <View style={styles.cardsContainer}>
        {/* Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 122, 0, 0.1)' }]}>
                <Feather name="user" size={20} color="#FF7A00" />
              </View>
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>
          </View>
          
          {personalFields.map((field) => (
            <View key={field.fieldKey} style={styles.fieldRow}>
              <View style={styles.fieldIconContainer}>
                <FontAwesome5 name={field.icon} size={16} color="#666" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <Text style={styles.fieldValue}>{field.value}</Text>
              </View>
              {field.editable && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(field)}
                >
                  <View style={styles.editIconContainer}>
                    <Feather name="edit-2" size={16} color="#FF7A00" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Birth Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 122, 0, 0.1)' }]}>
                <Feather name="calendar" size={20} color="#FF7A00" />
              </View>
              <Text style={styles.cardTitle}>Birth Details</Text>
            </View>
          </View>
          
          {birthFields.map((field) => (
            <View key={field.fieldKey} style={styles.fieldRow}>
              <View style={styles.fieldIconContainer}>
                <FontAwesome5 name={field.icon} size={16} color="#666" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <Text style={styles.fieldValue}>{field.value}</Text>
              </View>
              {field.editable && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(field)}
                >
                  <View style={styles.editIconContainer}>
                    <Feather name="edit-2" size={16} color="#FF7A00" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Security Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 122, 0, 0.1)' }]}>
                <Feather name="shield" size={20} color="#FF7A00" />
              </View>
              <Text style={styles.cardTitle}>Security & Account</Text>
            </View>
          </View>
          
          <View style={styles.fieldRow}>
            <View style={styles.fieldIconContainer}>
              <FontAwesome5 name="lock" size={16} color="#666" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Password</Text>
              <Text style={styles.fieldValue}>••••••••</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowPasswordModal(true)}
            >
              <View style={styles.editIconContainer}>
                <Feather name="edit-2" size={16} color="#FF7A00" />
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                "Logout",
                "Are you sure you want to log out?",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Logout", 
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await AsyncStorage.removeItem('userToken');
                        await AsyncStorage.removeItem('userData');
                        router.replace('/(auth)/sign-in');
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Feather name="log-out" size={18} color="#FF7A00" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Field Edit Modal */}
      {editField && (
        <ProfileEdit 
          isVisible={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
          fieldData={editField}
          loading={loading}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordDialog 
        isVisible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        config={config}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF7A00',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF7A00',
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FF7A00',
    borderRadius: 20,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  cardsContainer: {
    padding: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editButton: {
    padding: 4,
  },
  editIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedAccountContainer: {
    marginTop: 4,
  },
  connectedAccount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    marginVertical: 8,
    backgroundColor: '#FAFAFA',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textTransform: 'capitalize',
  },
  accountEmail: {
    fontSize: 14,
    color: '#666',
  },
  connectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22c55e',
    marginLeft: 6,
  },
  accountNote: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.3)',
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#FF7A00',
  },
});

export default AdminProfileScreen; 