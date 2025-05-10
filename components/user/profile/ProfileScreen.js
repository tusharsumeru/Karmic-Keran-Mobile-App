import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from '../../../actions/base_url';
import { createAuthConfig, retrieveUser, updateUser, updateProfileImage, updatePassword } from '../../../actions/auth';
import EditProfileDialog from './EditProfileDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [editField, setEditField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: userData, isLoading: userLoading, error: userError, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const config = await createAuthConfig();
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

  const birthDetails = [
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

  // Handle edit field
  const handleEdit = (field) => {
    setEditField(field);
  };

  // Handle save after editing
  const handleSave = async (value, fieldName) => {
    if (!userData?._id) {
      Alert.alert('Error', 'User ID not found. Please try logging in again.');
      return;
    }

    setLoading(true);
    try {
      // Special handling for password
      if (fieldName?.type === 'password') {
        const config = await createAuthConfig();
        
        console.log("Updating password for user:", userData._id);
        
        // Use the dedicated password update function
        const res = await updatePassword(
          config, 
          value.currentPassword, 
          value.newPassword
        );
        
        console.log("Password update response:", res);
        
        if (res?.status === 200) {
          Alert.alert('Success', 'Password updated successfully');
        } else {
          Alert.alert('Error', res?.message || 'Failed to update password');
        }
        
        setLoading(false);
        setEditField(null);
        return;
      }
      
      // Create the update payload
      let fieldToUpdate = "";
      let valueToUpdate = "";
      
      // Map frontend field names to backend field names
      switch (fieldName?.label) {
        case "Name":
          fieldToUpdate = "name";
          valueToUpdate = value;
          break;
        case "Gender":
          fieldToUpdate = "gender";
          valueToUpdate = value;
          break;
        case "Date of Birth":
          fieldToUpdate = "dob";
          valueToUpdate = value;
          break;
        case "Time of Birth":
          fieldToUpdate = "tob";
          valueToUpdate = value;
          break;
        case "Location of Birth":
          fieldToUpdate = "location";
          valueToUpdate = value;
          break;
        default:
          console.warn("Unknown field:", fieldName);
          setLoading(false);
          setEditField(null);
          return;
      }
      
      console.log(`Updating field: ${fieldToUpdate} with value: ${valueToUpdate}`);
      
      // Create a properly structured update payload
      const updatePayload = {};
      updatePayload[fieldToUpdate] = valueToUpdate;
      
      // Get authentication configuration
      const config = await createAuthConfig();
      
      // Use the proper updateUser function from auth.js
      const response = await updateUser(config, userData._id, updatePayload);
      
      console.log("Update response:", response);
      
      if (response.status === 200) {
        // Success - update the UI
        queryClient.invalidateQueries({ queryKey: ['user'] });
        await refetch();
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        // Show error message
        Alert.alert('Update Failed', response.message || 'Could not update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setEditField(null);
    }
  };

  // Image picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      handleUploadPhoto(result.assets[0]);
    }
  };

  // Upload profile photo
  const handleUploadPhoto = async (imageAsset) => {
    if (!imageAsset) return;
    
    setProfileLoading(true);
    try {
      const config = await createAuthConfig();
      
      // Get file extension from URI
      const uriParts = imageAsset.uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1];
      
      // Determine correct mime type
      const mimeType = fileExtension === 'jpg' || fileExtension === 'jpeg' 
        ? 'image/jpeg' 
        : fileExtension === 'png' 
          ? 'image/png' 
          : 'image/jpg';
      
      const imageFile = {
        uri: Platform.OS === 'ios' ? imageAsset.uri.replace('file://', '') : imageAsset.uri,
        type: mimeType,
        name: `profile-image.${fileExtension}`,
      };
      
      console.log('Uploading image:', JSON.stringify(imageFile, null, 2));
      
      // Send the image file object directly to updateProfileImage
      const res = await updateProfileImage(config, userData?._id, imageFile);
      
      if (res?.status === 200) {
        // Success - update UI immediately
        queryClient.invalidateQueries({ queryKey: ['user'] });
        await refetch();
        Alert.alert('Success', res?.message || 'Profile photo updated successfully');
      } else {
        // Error handling
        console.error('Profile photo upload error:', res?.message);
        Alert.alert('Error', res?.message || 'Failed to update profile photo. Please try again later.');
      }
    } catch (error) {
      console.error('Profile photo upload error:', error);
      Alert.alert('Error', 'Failed to upload profile photo');
    } finally {
      setProfileLoading(false);
      setSelectedImage(null);
    }
  };

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
          onPress={() => queryClient.invalidateQueries({ queryKey: ['user'] })}
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
              {userData?.image ? (
                <Image 
                  source={{ uri: userData.image }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {userData?.name ? userData.name.substr(0, 2).toUpperCase() : 'NA'}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <Feather name="camera" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            {profileLoading && (
              <View style={styles.uploadingIndicator}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userData?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'user@example.com'}</Text>
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
          
          {birthDetails.map((field) => (
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
          
          {userData?.strategy === "local" ? (
            <>
              {securityFields.map((field) => (
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
            </>
          ) : (
            <View style={styles.connectedAccountContainer}>
              <View style={styles.connectedAccount}>
                <View style={styles.accountInfo}>
                  <View style={[styles.accountIconContainer, { backgroundColor: userData?.strategy === "google" ? "#EA4335" : "#1877F2" }]}>
                    <Ionicons 
                      name={userData?.strategy === "google" ? "logo-google" : "logo-facebook"} 
                      size={18} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <View>
                    <Text style={styles.accountName}>{userData?.strategy} Account</Text>
                    <Text style={styles.accountEmail}>{userData?.email}</Text>
                  </View>
                </View>
                
                <View style={styles.connectedStatus}>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              </View>
              
              <Text style={styles.accountNote}>
                You signed up using {userData?.strategy}. Password change is managed through your {userData?.strategy} account.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Edit Profile Dialog */}
      {editField && (
        <EditProfileDialog 
          isVisible={!!editField}
          onClose={() => setEditField(null)}
          onSave={handleSave}
          field={editField}
          loading={loading}
        />
      )}
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
});

export default ProfileScreen; 