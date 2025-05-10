import { BASE_URL } from './base_url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { saveToken, saveUser } from '../utils/storage';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import config from '../config';

// Register for the WebBrowser redirect URI
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs for different platforms
const GOOGLE_CLIENT_ID_ANDROID = 'YOUR_ANDROID_CLIENT_ID';
const GOOGLE_CLIENT_ID_IOS = 'YOUR_IOS_CLIENT_ID';
const GOOGLE_CLIENT_ID_WEB = 'YOUR_WEB_CLIENT_ID';

/**
 * Initiates sign-in/sign-up process with email
 * @param {string} email - User's email
 * @returns {Promise<Object>} Response with status, data, and message
 */
export const checkEmail = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    // The API returns "User exists" message and data.show: true for existing users
    const isRegistered = 
      (data.message === "User exists" && data.data?.show === true) || 
      data.status === 201;
    
    return {
      status: response.status,
      data: data.data,
      message: data.message,
      isRegistered
    };
  } catch (error) {
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to process email',
      isRegistered: false
    };
  }
};

/**
 * Signs in a registered user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response with user data and token
 */
export const signIn = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    // If login was successful, save the token and user data
    if (response.status === 200 || response.status === 201) {
      if (data.data?.token) {
        const token = data.data.token;
        
        // Store token in all expected storage locations for maximum compatibility
        try {
          // Primary storage locations
          await AsyncStorage.setItem('token', token);
          await saveToken(token); // Uses @karmic_keran_token key
          
          // Additional locations for compatibility
          await AsyncStorage.setItem('jwt', token);
          await AsyncStorage.setItem('authToken', token);
          
          // Also try to save in SecureStore if available
          if (SecureStore) {
            await SecureStore.setItemAsync('userToken', token);
          }
          
          console.log('Token saved in all storage locations successfully');
        } catch (storageError) {
          console.error('Error saving token to storage:', storageError);
        }
        
        // Save user data if available
        if (data.data) {
          await saveUser(data.data);
        }
        
        // If we have user ID, store it
        if (data.data?._id) {
          await AsyncStorage.setItem('userId', data.data._id);
        }
        
        // Store user role if available
        if (data.data?.is_admin !== undefined) {
          await AsyncStorage.setItem('userRole', data.data.is_admin ? 'admin' : 'user');
        }
      } else {
        console.warn('Login successful but no token received');
      }
    }
    
    return {
      status: response.status,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to sign in',
    };
  }
};

/**
 * Verifies OTP sent to user's email
 * @param {string} email - User's email
 * @param {string} otp - One-time password
 * @returns {Promise<Object>} Response with verification status
 */
export const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    
    return {
      status: response.status,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to verify OTP',
    };
  }
};

/**
 * Resends OTP to user's email
 * @param {string} email - User's email
 * @returns {Promise<Object>} Response with resend status
 */
export const resendOTP = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    return {
      status: response.status,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to resend OTP',
    };
  }
};

/**
 * Updates user information
 * @param {Object} config - Request configuration with headers
 * @param {string} id - User ID
 * @param {Object} updatePayload - User data to update
 * @returns {Promise<Object>} Response with status, data, and message
 */
export const updateUser = async (config, id, updatePayload) => {
  try {
    // Validate required parameters
    if (!id) {
      console.error('Missing user ID for update');
      return {
        status: 400,
        data: null,
        message: 'Missing user ID'
      };
    }
    
    if (!updatePayload || Object.keys(updatePayload).length === 0) {
      console.error('Empty update payload');
      return {
        status: 400,
        data: null,
        message: 'No data to update'
      };
    }
    
    // Format payload exactly as backend expects it in req.body.updatePayload
    const payload = { updatePayload };
    
    console.log(`Updating user ${id} with payload:`, JSON.stringify(payload));
    
    // Make request to update endpoint
    const response = await fetch(`${BASE_URL}/auth/user/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': config.headers.Authorization
      },
      body: JSON.stringify(payload)
    });
    
    // Parse response
    let data = null;
    const responseText = await response.text();
    
    try {
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (e) {
      console.error('Response is not valid JSON:', responseText);
    }
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || (response.ok ? 'Profile updated successfully' : 'Update failed')
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      status: 500,
      data: null,
      message: 'Failed to update profile'
    };
  }
};

/**
 * Updates a single user field - matched with web implementation
 * @param {Object} config - Request configuration with headers
 * @param {string} id - User ID
 * @param {Object} updatePayload - Field to update (e.g., {name: 'New Name'})
 * @returns {Promise<Object>} Response with status, data, and message
 */
export const updateUserFieldWeb = async (config, id, updatePayload) => {
  try {
    // Create a clean object with string values only
    const stringPayload = {};
    
    // Process each key in the payload
    Object.keys(updatePayload).forEach(key => {
      const value = updatePayload[key];
      // Force string conversion for all values
      stringPayload[key] = value === null || value === undefined ? '' : String(value);
    });
    
    // Create payload in the exact format required by backend
    const payload = { updatePayload: stringPayload };
    
    console.log(`Updating field for user ${id}:`, JSON.stringify(payload));
    
    // Make request with simplified headers
    const response = await fetch(`${BASE_URL}/auth/user/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': config.headers.Authorization
      },
      body: JSON.stringify(payload)
    });
    
    // Parse response
    let data = null;
    const responseText = await response.text();
    
    try {
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (e) {
      console.log('Response is not valid JSON');
    }
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || (response.ok ? 'Profile updated' : 'Update failed')
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      status: 500,
      data: null,
      message: 'Failed to update profile'
    };
  }
};

/**
 * Logs out the user by clearing token and redirecting to sign-in
 * @returns {Promise<boolean>} True if logout was successful, false otherwise
 */
export const logout = async () => {
  try {
    // Clear auth token from all possible storage locations
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('jwt');
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('@karmic_keran_token');
    
    // Clear user data
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('@karmic_keran_user');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userRole');
    
    // Clear any other auth-related data
    await AsyncStorage.removeItem('email');
    
    // Redirect to sign-in page
    router.replace('/(auth)/sign-in');
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

/**
 * Retrieves current user data
 * @param {Object} config - Request configuration with headers
 * @returns {Promise<Object>} Response with user data
 */
export const retrieveUser = async (config) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/user`, {
      method: 'GET',
      headers: config.headers,
    });
    
    const data = await response.json();
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || 'User data retrieved',
    };
  } catch (error) {
    console.error('Error retrieving user:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to retrieve user data',
    };
  }
};

/**
 * Updates user profile image
 * @param {Object} config - Request configuration with headers
 * @param {string} id - User ID
 * @param {Object} imageData - Image data from ImagePicker
 * @returns {Promise<Object>} Response with status, data, and message
 */
export const updateProfileImage = async (config, id, imageData) => {
  try {
    if (!imageData?.uri) {
      return {
        status: 400,
        data: null,
        message: 'Invalid image data'
      };
    }

    // Create form data for the image upload
    const formData = new FormData();
    
    // Get file extension and mime type
    const uriParts = imageData.uri.split('.');
    const fileExtension = uriParts[uriParts.length - 1];
    
    // Create a file object to append to form data
    formData.append('file', {
      uri: imageData.uri,
      name: `profile-${id}.${fileExtension}`,
      type: imageData.type || `image/${fileExtension}`
    });

    console.log(`Uploading profile image for user ${id}`);
    
    // Make request to the correct endpoint
    const response = await fetch(`${BASE_URL}/auth/user/profile/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': config.headers.Authorization,
        // Important: Do NOT set Content-Type here, let fetch set it with the boundary
      },
      body: formData
    });
    
    // Parse response
    let data = null;
    const responseText = await response.text();
    
    try {
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (e) {
      console.log('Response is not valid JSON:', responseText);
    }
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || (response.ok ? 'Profile image updated' : 'Update failed')
    };
  } catch (error) {
    console.error('Profile image update error:', error);
    return {
      status: 500,
      data: null,
      message: 'Failed to update profile image'
    };
  }
};

/**
 * Creates authentication configuration with headers for API requests
 * @returns {Promise<Object>} Config object with headers
 */
export const createAuthConfig = async () => {
  try {
    // Try to get token from multiple possible storage locations
    let token = await AsyncStorage.getItem('token');
    
    // If not found in primary location, try alternative locations
    if (!token) {
      token = await AsyncStorage.getItem('@karmic_keran_token');
    }
    
    if (!token) {
      token = await AsyncStorage.getItem('jwt');
    }
    
    if (!token) {
      token = await AsyncStorage.getItem('authToken');
    }
    
    // Still no token found, try SecureStore as last resort
    if (!token && SecureStore) {
      try {
        token = await SecureStore.getItemAsync('userToken');
      } catch (secureStoreError) {
        console.error('SecureStore error:', secureStoreError);
      }
    }
    
    // Log token status but not the actual token
    console.log(`Token found: ${!!token}`);
    
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      }
    };
  } catch (error) {
    console.error('Error creating auth config:', error);
    return {
      headers: {
        'Content-Type': 'application/json',
      }
    };
  }
};

/**
 * Retrieves user consultations
 * @param {Object} config - Request configuration with headers
 * @param {string} source - Source of consultations (upcoming, past, all)
 * @returns {Promise<Object>} Response with consultations data
 */
export const retrieveUserConsultations = async (config, source = 'all') => {
  try {
    const response = await fetch(`${BASE_URL}/consultation?source=${source}`, {
      method: 'GET',
      headers: config.headers,
    });
    
    const data = await response.json();
    
    return {
      status: response.status,
      data: data?.data || [],
      message: data?.message || 'Consultations retrieved',
    };
  } catch (error) {
    console.error('Error retrieving consultations:', error);
    return {
      status: 500,
      data: [],
      message: error.message || 'Failed to retrieve consultations',
    };
  }
};

/**
 * Retrieves available slots for consultation booking
 * @param {Object} config - Request configuration with headers
 * @param {number} duration - Duration of the consultation in minutes
 * @returns {Promise<Object>} Response with available slots data
 */
export const retrieveAvailableSlots = async (config, duration) => {
  console.log(`Fetching available slots for duration: ${duration}`);
  try {
    const response = await fetch(`${BASE_URL}/settings/available-slots?duration=${duration}`, {
      method: 'GET',
      headers: {
        ...config.headers,
      },
    });
    
    // Get response as text first to check if it's valid JSON
    const responseText = await response.text();
    
    try {
      // Try to parse the response text as JSON
      const data = JSON.parse(responseText);
      
      return {
        status: response.status,
        data: data?.data || [],
        message: data?.message || 'Available slots retrieved',
      };
    } catch (parseError) {
      console.error('Error retrieving available slots: [SyntaxError: JSON Parse error]', responseText.substring(0, 100));
      return {
        status: 500,
        data: [],
        message: 'Server returned invalid data format. Please contact support.',
        rawResponse: responseText.substring(0, 200) // Include part of the raw response for debugging
      };
    }
  } catch (error) {
    console.error('Error retrieving available slots:', error);
    return {
      status: 500,
      data: [],
      message: error.message || 'Failed to retrieve available slots',
    };
  }
};

/**
 * Creates a payment intent for booking a consultation
 * @param {Object} config - Request configuration with headers
 * @param {number} amount - Amount to charge
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {Object} bookingData - Booking details
 * @returns {Promise<Object>} Response with payment intent data
 */
export const createPaymentIntent = async (config, amount, currency, bookingData) => {
  console.log('Creating payment intent with:', { amount, currency });
  console.log('Using auth token:', config.headers.Authorization ? 'Present (hidden)' : 'Missing');
  
  try {
    // Check if we have the required fields
    if (!bookingData.service || !bookingData.booking_slot) {
      console.error('Missing required booking data fields:', { 
        hasService: !!bookingData.service, 
        hasBookingSlot: !!bookingData.booking_slot 
      });
      return {
        status: 400,
        data: null,
        message: 'Missing required booking data',
        error: 'Service or booking slot data is missing'
      };
    }
    
    const requestData = { amount, currency, bookingData };
    console.log('Sending request data:', JSON.stringify(requestData));
    
    const response = await fetch(`${BASE_URL}/payment/payment-intent`, {
      method: 'POST',
      headers: {
        ...config.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    const data = await response.json();
    console.log('Payment API response:', response.status, data);
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || 'Payment intent created',
      error: data?.error || null
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to create payment intent',
      error: error.toString()
    };
  }
};

/**
 * Retrieves all available services
 * @param {Object} config - Request configuration with headers
 * @returns {Promise<Object>} Response with services data
 */
export const retrieveServices = async (config) => {
  try {
    const response = await fetch(`${BASE_URL}/service`, {
      method: "GET",
      headers: {
        ...config.headers,
      },
    });
    const data = await response.json();

    return {
      status: response.status,
      data: data?.data,
      message: data?.message,
    };
  } catch (error) {
    return error;
  }
};

/**
 * Fetches birth chart data based on birth details
 * @param {Object} birthDetails - User's birth details
 * @param {string} birthDetails.date - Date of birth (YYYY-MM-DD)
 * @param {string} birthDetails.time - Time of birth (HH:MM)
 * @param {Object} birthDetails.place - Birth place components
 * @param {string} birthDetails.place.city - Birth city
 * @param {string} birthDetails.place.state - Birth state/region
 * @param {string} birthDetails.place.country - Birth country
 * @param {string} consultationId - Optional consultation ID to associate with the chart
 * @returns {Promise<Object>} Response with birth chart data
 */
export const fetchBirthChartData = async (birthDetails, consultationId = null) => {
  try {
    // Create auth config to include token if available
    const authConfig = await createAuthConfig();
    
    console.log('Fetching birth chart data with details:', JSON.stringify(birthDetails));
    
    // Extract details in the format expected by the original function
    const dob = birthDetails.date;
    const tob = birthDetails.time;
    const city = birthDetails.place.city || '';
    const state = birthDetails.place.state || '';
    const country = birthDetails.place.country || '';
    const name = birthDetails.name || '';
    const gender = birthDetails.gender ? birthDetails.gender.toLowerCase() : '';
    
    // First calculate/create the birth chart using the original function
    const chartResponse = await handleRetrieveAscendant(
      authConfig,
      dob,
      tob,
      city,
      state,
      country,
      name,
      gender,
      consultationId
    );
    
    console.log('Chart calculation response:', chartResponse.status);
    
    // If successful and we have a chart ID, get the detailed chart
    if (chartResponse.status === 200 && chartResponse.data && chartResponse.data._id) {
      console.log('Chart calculation successful, retrieving full chart data with ID:', chartResponse.data._id);
      
      // Get the detailed chart data using the ID with the original function
      return await handleRetrieveAscendantById(authConfig, chartResponse.data._id);
    }
    
    // Return original response if we can't get detailed data
    return chartResponse;
  } catch (error) {
    console.error('Error fetching birth chart data:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to calculate birth chart',
    };
  }
};

/**
 * Calculates birth chart data based on user's birth information
 * @param {Object} config - Request configuration with headers
 * @param {string} name - User's full name
 * @param {string} gender - User's gender
 * @param {string} dateOfBirth - Date in format YYYY-MM-DD
 * @param {string} timeOfBirth - Time in 24hr format HH:MM
 * @param {string} city - Birth city
 * @param {string} state - Birth state/region (optional)
 * @param {string} country - Birth country
 * @param {string} toolType - Type of reading (generic-reading, sade-sati, compatibility-check)
 * @returns {Promise<Object>} Response with birth chart data
 */
export const calculateBirthChart = async (
  config,
  name,
  gender,
  dateOfBirth,
  timeOfBirth,
  city,
  state,
  country,
  toolType = 'generic-reading'
) => {
  try {
    console.log('========== BIRTH CHART CALCULATION ==========');
    console.log(`Name: ${name}`);
    console.log(`Gender: ${gender}`);
    console.log(`Date: ${dateOfBirth}`);
    console.log(`Time: ${timeOfBirth}`);
    console.log(`Location: ${city}, ${state}, ${country}`);
    console.log(`Tool type: ${toolType}`);
    console.log('Authorization header present:', !!config.headers.Authorization);
    
    const payload = {
      name,
      gender,
      date_of_birth: dateOfBirth,
      time_of_birth: timeOfBirth,
      city,
      state,
      country,
      tool_type: toolType
    };
    
    console.log('Request payload:', JSON.stringify(payload));
    
    // Skip the failing endpoint and directly use the working ascendant/calculate endpoint
    console.log('Using ascendant/calculate endpoint - direct approach');
    
    // Use the format expected by handleRetrieveAscendant
    const result = await handleRetrieveAscendant(
      config,
      dateOfBirth,
      timeOfBirth,
      city,
      state,
      country,
      name,
      gender.toLowerCase(), // Original function expects lowercase gender
      null // id
    );
    
    console.log('Response status:', result.status);
    
    if (result.data) {
      // Ensure proper toolType is added to the data
      result.data.toolType = toolType;
    }
    
    return result;
  } catch (error) {
    console.error('Birth chart calculation error:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to calculate birth chart'
    };
  }
};

/**
 * Original function from web version for calculating birth chart
 */
export const handleRetrieveAscendant = async (
  config,
  dob,
  tob,
  city,
  state,
  country,
  name,
  gender,
  id
) => {
  try {
    const res = await fetch(`${BASE_URL}/ascendant/calculate`, {
      method: "POST",
      headers: {
        ...config.headers,
      },
      body: JSON.stringify({
        dob,
        tob,
        city,
        state,
        country,
        name,
        gender,
        id,
      }),
    });
    const data = await res.json();

    return {
      status: res?.status,
      data: data?.data,
      message: data?.message,
    };
  } catch (error) {
    return error;
  }
};

/**
 * Original function from web version for retrieving birth chart by ID
 */
export const handleRetrieveAscendantById = async (config, id) => {
  try {
    // Use the same URL pattern as shown in the logs for the user side
    const url = `${BASE_URL}/ascendant/${id}`;
    
    console.log('Retrieving ascendant by ID:', id);
    console.log('URL:', url);
    
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...config.headers,
      },
    });
    
    // Check response before parsing JSON
    const contentType = res.headers.get("content-type");
    console.log("Response status:", res.status, "Content type:", contentType);
    
    // Get the response text first
    const responseText = await res.text();
    
    // Check if response starts with HTML tags
    if (responseText.trim().startsWith('<') || 
        (contentType && contentType.includes('text/html'))) {
      console.error('Received HTML response instead of JSON');
      console.log('Response preview:', responseText.substring(0, 200));
      
      return {
        status: 500,
        data: null,
        message: 'Server returned HTML instead of JSON. The server might be unavailable or the ID format is incorrect.'
      };
    }
    
    try {
      const data = JSON.parse(responseText);
      
      // Check for the special case where the message indicates success but there's no data
      // This happens sometimes with the astrology calculation endpoints
      const isSuccessMessage = data.message && (
        data.message.toLowerCase().includes('success') || 
        data.message.toLowerCase().includes('processed')
      );
      
      // If status is success and we have a success message but no data, create placeholder
      if (res.status === 200 && isSuccessMessage && !data.data) {
        console.log('Success message received but no data:', data.message);
        
        // Return a success response with minimal placeholder data to avoid errors
        return {
          status: 200,
          data: {
            message: data.message,
            // Provide minimal default data
            siderealAscendant: { sign: "Aries", degrees: 0 }
          },
          message: data.message
        };
      }
      
      // Normal response processing
      return {
        status: res.status,
        data: data.data,
        message: data.message,
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw response:', responseText.substring(0, 200));
      
      return {
        status: 500,
        data: null,
        message: `Failed to parse server response: ${parseError.message}`
      };
    }
  } catch (error) {
    console.error('Error retrieving ascendant:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Error retrieving ascendant data'
    };
  }
};

/**
 * Process a chart response from the backend to make it compatible with Kundali visualization
 * @param {Object} chartData - Original chart data from API 
 * @returns {Object} Processed chart data ready for visualization
 */
export const processChartDataForVisualization = (chartData) => {
  if (!chartData) return null;
  
  try {
    // Basic structure expected by Kundali visualization
    const processedData = {
      data: {
        siderealAscendant: {
          sign: chartData.ascendant || "Aries"
        },
        planets: [],
        houses: []
      }
    };
    
    // Process planets if available
    if (chartData.planets && Array.isArray(chartData.planets)) {
      processedData.data.planets = chartData.planets.map(planet => {
        // Extract degrees and minutes from degree value if available
        let degrees = 0;
        let minutes = 0;
        
        if (planet.degree) {
          const degreeValue = parseFloat(planet.degree) || 0;
          degrees = Math.floor(degreeValue);
          minutes = Math.floor((degreeValue - degrees) * 60);
        }
        
        return {
          name: planet.name,
          sign: planet.sign || planet.rashi || "", // Rashi is another term for sign
          degree: parseFloat(planet.degree) || 0,
          degrees: degrees,
          minutes: minutes,
          house: planet.house,
          status: planet.status || "",
          nakshatra: planet.nakshatra || "",
          pada: planet.pada || "",
          exalted: planet.exalted || false,
          debilitated: planet.debilitated || false,
          // Additional fields if available
          position: planet.position || "",
          lordship: planet.lordship || "",
          combust: planet.combust || false,
          retrograde: planet.retrograde || false
        };
      });
    }
    
    // Process houses if available
    if (chartData.houses && Array.isArray(chartData.houses)) {
      processedData.data.houses = chartData.houses.map(house => ({
        number: house.number,
        sign: house.sign,
        planets: house.planets || []
      }));
    }
    
    // Add any additional remarks
    if (chartData.remarks) {
      processedData.data.remarks = chartData.remarks;
    }
    
    return processedData;
  } catch (error) {
    console.error('Error processing chart data:', error);
    return null;
  }
};

/**
 * Retrieves location suggestions for birth location search
 * @param {Object} config - Request configuration with headers
 * @param {string} query - Search query for location
 * @returns {Promise<Object>} Response with location suggestions
 */
export const searchLocationSuggestions = async (config, query) => {
  try {
    console.log('Searching locations with query:', query);
    
    // URL encode the query parameter properly
    const encodedQuery = encodeURIComponent(query);
    
    // Handle missing config headers gracefully
    const headers = config?.headers || {
      'Content-Type': 'application/json'
    };
    
    // Try the API endpoint
    const response = await fetch(`${BASE_URL}/autocomplete?place=${encodedQuery}`, {
      method: 'GET',
      headers: headers
    });
    
    // Log the status code
    console.log('Location search response status:', response.status);
    
    // Get the response as text first to handle invalid JSON
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
      console.log('Location suggestions count:', 
        Array.isArray(data?.data) ? data.data.length : 
        (data?.data?.locations ? data.data.locations.length : 'unknown structure'));
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.log('Raw response text:', responseText.substring(0, 200));
      
      // If API fails, fall back to OpenStreetMap
      return await fallbackLocationSearch(query);
    }
    
    // If the response doesn't have data, try the fallback
    if (!data?.data) {
      console.log('No data in API response, using fallback');
      return await fallbackLocationSearch(query);
    }
    
    return {
      status: response.status,
      data: data?.data || [],
      message: data?.message || 'Location suggestions retrieved',
    };
  } catch (error) {
    console.error('Error searching locations from API:', error);
    
    // Fallback to OpenStreetMap API if our API fails
    return await fallbackLocationSearch(query);
  }
};

/**
 * Fallback function to search locations using OpenStreetMap API
 * @param {string} query - Search query
 * @returns {Promise<Object>} Response with location suggestions
 */
const fallbackLocationSearch = async (query) => {
  try {
    console.log('Using fallback location search with OpenStreetMap');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
    );
    
    if (!response.ok) {
      throw new Error(`OpenStreetMap API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform OpenStreetMap format to match our expected format
    const transformedData = data.map(item => ({
      place_id: item.place_id,
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      city: item.address?.city || item.address?.town || item.address?.village || '',
      state: item.address?.state || '',
      country: item.address?.country || '',
      // Add additional fields that might be used
      address: item.address
    }));
    
    console.log('OpenStreetMap returned', transformedData.length, 'results');
    
    return {
      status: 200,
      data: transformedData,
      message: 'Location suggestions retrieved from OpenStreetMap',
    };
  } catch (fallbackError) {
    console.error('Fallback location search failed:', fallbackError);
    return {
      status: 500,
      data: [],
      message: 'Failed to retrieve location suggestions',
    };
  }
};

/**
 * Retrieves previously calculated birth chart by ID
 * @param {Object} config - Request configuration with headers
 * @param {string} id - Birth chart ID
 * @returns {Promise<Object>} Response with birth chart data
 */
export const retrieveBirthChartById = async (config, id) => {
  try {
    const response = await fetch(`${BASE_URL}/ascendant/${id}`, {
      method: 'GET',
      headers: config.headers
    });
    
    const data = await response.json();
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || 'Birth chart retrieved',
    };
  } catch (error) {
    console.error('Error retrieving birth chart:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to retrieve birth chart',
    };
  }
};

/**
 * Retrieves admin schedule with consultations
 * @param {Object} config - Request configuration with headers
 * @param {string} date - Optional date filter (YYYY-MM-DD)
 * @returns {Promise<Object>} Response with schedule data
 */
export const retrieveAdminSchedule = async (authConfig, date = null) => {
  try {
    // Debugging auth token
    console.log('Using auth token with prefix:', 
      authConfig.headers.Authorization ? authConfig.headers.Authorization.substring(0, 10) + '...' : 'missing');

    // Use the dedicated admin endpoint for consultations
    console.log('Using admin-specific endpoint for consultations');
    
    let url = `${BASE_URL}${config.apiEndpoints.admin.consultations}`;
    // The admin endpoint may already include query params, check before adding more
    if (url.includes('?')) {
      if (date) {
        url += `&date=${date}`;
      }
    } else {
      if (date) {
        url += `?date=${date}`;
      }
    }
    
    console.log('Fetching from:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: authConfig.headers,
      });
      
      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw API response:', responseText.substring(0, 200) + '...');
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        
        // Try fallback endpoint since the first one failed
        return await tryFallbackEndpoint(authConfig, date);
      }
      
      if (response.status === 200) {
        console.log('Response parsed successfully, data type:', typeof data.data);
        console.log('Data structure:', Object.keys(data).join(', '));
        
        // Format the data based on what we received
        let consultations = [];
        
        // Handle different API response structures
        if (data && data.data) {
          if (Array.isArray(data.data)) {
            // If data.data is an array, it's directly the consultations
            consultations = data.data;
            console.log('Direct array format, consultations:', data.data.length);
          } else if (data.data.consultations && Array.isArray(data.data.consultations)) {
            // If data.data.consultations is an array
            consultations = data.data.consultations;
            console.log('Nested consultations array, count:', consultations.length);
          } else {
            // If data.data is an object (single consultation or other structure)
            console.log('Unknown data structure:', JSON.stringify(data.data).substring(0, 100) + '...');
            
            // Try to extract consultations in various formats
            if (data.data._id) {
              // It's a single consultation
              consultations = [data.data];
            }
          }
        } else if (Array.isArray(data)) {
          // Direct array response
          consultations = data;
          console.log('Response is direct array, count:', data.length);
        }
        
        // Format data in expected structure
        const formattedData = {
          date: date || new Date().toISOString().split('T')[0],
          consultations: consultations || []
        };
        
        console.log('Returning', formattedData.consultations.length, 'consultations');
        
        return {
          status: 200,
          data: formattedData,
          message: 'Schedule retrieved successfully'
        };
      } else {
        console.error('API returned non-success status:', response.status);
        console.error('Error message:', data.message || 'No error message');
        
        // Try fallback endpoint since the first one failed
        return await tryFallbackEndpoint(authConfig, date);
      }
    } catch (fetchError) {
      console.error('Primary fetch error:', fetchError);
      
      // Try fallback endpoint if first attempt fails
      return await tryFallbackEndpoint(authConfig, date);
    }
    
    // If we get here, all attempts have failed
    console.log('All API attempts failed, returning error');
    
    return {
      status: 404,
      data: null,
      message: 'Failed to retrieve schedule data from API'
    };
  } catch (error) {
    console.error('Error in retrieveAdminSchedule:', error);
    
    return {
      status: 500,
      data: null,
      message: 'An error occurred while fetching schedule data'
    };
  }
};

// Helper function to try the fallback endpoint
const tryFallbackEndpoint = async (authConfig, date) => {
  try {
    console.log('Trying fallback endpoint for schedule data');
    
    // Try the general consultations endpoint as fallback
    const fallbackUrl = `${BASE_URL}/consultation/all?source=upcoming`;
    console.log('Fallback URL:', fallbackUrl);
    
    const response = await fetch(fallbackUrl, {
      method: 'GET',
      headers: authConfig.headers,
    });
    
    // Get raw response for debugging
    const responseText = await response.text();
    console.log('Fallback response (preview):', responseText.substring(0, 200) + '...');
    
    try {
      const data = JSON.parse(responseText);
      
      if (response.status === 200 && data.data) {
        console.log('Fallback succeeded, found', Array.isArray(data.data) ? data.data.length : 'unknown', 'consultations');
        
        return {
          status: 200,
          data: {
            date: date || new Date().toISOString().split('T')[0],
            consultations: Array.isArray(data.data) ? data.data : []
          },
          message: 'Schedule retrieved from fallback endpoint'
        };
      } else {
        console.log('Fallback endpoint returned non-success:', response.status);
        
        return {
          status: response.status || 404,
          data: null,
          message: 'Failed to retrieve schedule data from fallback API'
        };
      }
    } catch (parseError) {
      console.error('Fallback JSON parse error:', parseError);
      return {
        status: 500,
        data: null,
        message: 'Failed to parse schedule data response'
      };
    }
  } catch (error) {
    console.error('Fallback endpoint error:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to retrieve consultations',
    };
  }
};

/**
 * Retrieves all customer queries for admin
 * @param {Object} config - Request configuration with headers
 * @returns {Promise<Object>} Response with queries data
 */
export const retrieveQueries = async (config) => {
  try {
    console.log('Fetching customer queries...');
    const response = await fetch(`${BASE_URL}/query`, {
      method: 'GET',
      headers: config.headers,
    });
    
    // Log the response status
    console.log('Query fetch response status:', response.status);
    
    const data = await response.json();
    
    return {
      status: response.status,
      data: data?.data || [],
      message: data?.message || 'Queries retrieved successfully',
    };
  } catch (error) {
    console.error('Error retrieving queries:', error);
    return {
      status: 500,
      data: [],
      message: error.message || 'Failed to retrieve queries',
    };
  }
};

/**
 * Updates a query with an answer
 * @param {Object} config - Request configuration with headers
 * @param {string} id - Query ID
 * @param {string} answer - Answer text
 * @returns {Promise<Object>} Response with update status
 */
export const updateQueryAnswer = async (config, id, answer) => {
  try {
    console.log(`Updating query ${id} with answer`);
    const response = await fetch(`${BASE_URL}/query/${id}`, {
      method: 'PUT',
      headers: {
        ...config.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer }),
    });
    
    console.log('Update response status:', response.status);
    
    const data = await response.json();
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || (response.status === 200 ? 'Answer submitted successfully' : 'Failed to submit answer'),
    };
  } catch (error) {
    console.error('Error updating query answer:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to update query answer',
    };
  }
};

/**
 * Activates or deactivates a query
 * @param {Object} config - Request configuration with headers
 * @param {string} id - Query ID
 * @param {boolean} isActive - Active status to set
 * @returns {Promise<Object>} Response with update status
 */
export const updateQueryStatus = async (config, id, isActive) => {
  try {
    console.log(`Updating query ${id} status to ${isActive ? 'active' : 'inactive'}`);
    const response = await fetch(`${BASE_URL}/query/deactivate/${id}`, {
      method: 'PUT',
      headers: {
        ...config.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    });
    
    const data = await response.json();
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || (response.status === 200 
        ? `Query ${isActive ? 'activated' : 'deactivated'} successfully` 
        : 'Failed to update query status'),
    };
  } catch (error) {
    console.error('Error updating query status:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to update query status',
    };
  }
};

/**
 * Retrieves dashboard overview metrics for admin
 * @param {Object} config - Request configuration with headers
 * @returns {Promise<Object>} Response with dashboard metrics
 */
export const retrieveDashboardOverviewMetrics = async (config) => {
  try {
    console.log('Fetching dashboard overview metrics...');
    const response = await fetch(`${BASE_URL}/dashboard/overview-metrics`, {
      method: 'GET',
      headers: config.headers,
    });
    
    console.log('Dashboard metrics response status:', response.status);
    
    // If endpoint doesn't exist yet, return error
    if (response.status === 404) {
      console.log('Endpoint not found');
      return {
        status: 404,
        data: null,
        message: 'Dashboard metrics endpoint not available'
      };
    }
    
    const data = await response.json();
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || 'Overview metrics retrieved successfully',
    };
  } catch (error) {
    console.error('Error retrieving dashboard metrics:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to retrieve dashboard metrics'
    };
  }
};

/**
 * Retrieves metrics by date range (registrations and bookings)
 * @param {Object} config - Request configuration with headers
 * @param {string} range - Time range (7d, 30d, 90d)
 * @returns {Promise<Object>} Response with metrics by date
 */
export const retrieveDashboardMetricsByDateRange = async (config, range = '30d') => {
  try {
    console.log(`Fetching metrics for range: ${range}`);
    const response = await fetch(`${BASE_URL}/dashboard/metrics-by-date-range?range=${range}`, {
      method: 'GET',
      headers: config.headers,
    });
    
    console.log('Metrics by date response status:', response.status);
    
    // If endpoint doesn't exist yet, return error
    if (response.status === 404) {
      return {
        status: 404,
        data: null,
        message: 'Metrics by date endpoint not available'
      };
    }
    
    const data = await response.json();
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || 'Metrics retrieved successfully',
    };
  } catch (error) {
    console.error('Error retrieving metrics by date:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to retrieve metrics by date'
    };
  }
};

/**
 * Retrieves consultations by service data for charts
 * @param {Object} config - Request configuration with headers
 * @returns {Promise<Object>} Response with service distribution data
 */
export const retrieveConsultationsByService = async (config) => {
  try {
    console.log('Fetching consultations by service...');
    const response = await fetch(`${BASE_URL}/dashboard/consultations-by-service`, {
      method: 'GET',
      headers: config.headers,
    });
    
    console.log('Consultations by service response status:', response.status);
    
    // If endpoint doesn't exist yet, return error
    if (response.status === 404) {
      return {
        status: 404,
        data: null,
        message: 'Consultations by service endpoint not available'
      };
    }
    
    const data = await response.json();
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || 'Service distribution retrieved successfully',
    };
  } catch (error) {
    console.error('Error retrieving consultations by service:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to retrieve consultations by service'
    };
  }
};

/**
 * Retrieves popular services data for dashboard
 * @param {Object} config - Request configuration with headers
 * @returns {Promise<Object>} Response with popular services data
 */
export const retrievePopularServices = async (config) => {
  try {
    console.log('Fetching popular services...');
    const response = await fetch(`${BASE_URL}/dashboard/service-popularity-metrics`, {
      method: 'GET',
      headers: config.headers,
    });
    
    console.log('Popular services response status:', response.status);
    
    // If endpoint doesn't exist yet, return error
    if (response.status === 404) {
      return {
        status: 404,
        data: null,
        message: 'Popular services endpoint not available'
      };
    }
    
    const data = await response.json();
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || 'Popular services retrieved successfully',
    };
  } catch (error) {
    console.error('Error retrieving popular services:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to retrieve popular services'
    };
  }
};

/**
 * Updates user password
 * @param {Object} config - Request configuration with headers
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Response with status, data, and message
 */
export const updatePassword = async (config, oldPassword, newPassword) => {
  try {
    if (!oldPassword || !newPassword) {
      return {
        status: 400,
        data: null,
        message: 'Both current and new passwords are required'
      };
    }

    console.log('Attempting to update password');
    
    // Make request to the password change endpoint
    const response = await fetch(`${BASE_URL}/auth/admin/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': config.headers.Authorization
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    });
    
    // Parse response
    let data = null;
    const responseText = await response.text();
    
    try {
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (e) {
      console.error('Response is not valid JSON:', responseText);
    }
    
    return {
      status: response.status,
      data: data?.data || null,
      message: data?.message || (response.ok ? 'Password updated successfully' : 'Password update failed')
    };
  } catch (error) {
    console.error('Password update error:', error);
    return {
      status: 500,
      data: null,
      message: 'Failed to update password'
    };
  }
};

/**
 * Retrieves consultation details by ID
 * @param {Object} config - Request configuration with headers
 * @param {string} id - Consultation ID (can be business ID or MongoDB _id)
 * @returns {Promise<Object>} Response with consultation data
 */
export const handleRetrieveConsulation = async (config, id) => {
  try {
    // The key insight: We need to use the same path regardless of ID format
    // The API expects the ID in the path directly, not as a query parameter
    // Let's construct the URL using the ID directly in the path
    
    console.log(`Retrieving consultation with ID: ${id}`);
    
    // Use the direct path format for both business ID and MongoDB ID
    const apiUrl = `${BASE_URL}/consultation/${id}`;
    
    console.log(`Using API endpoint: ${apiUrl}`);
    console.log(`Authorization header exists:`, !!config.headers.Authorization);
    
    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        ...config.headers,
      },
    });

    console.log(`API response status: ${res.status}`);
    
    // Get the response text first for debugging
    const responseText = await res.text();
    console.log(`API response text (first 200 chars): ${responseText.substring(0, 200)}...`);
    
    // Parse JSON safely
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`Response parsed successfully.`);
      
      return {
        status: res.status,
        data: data.data,
        message: data.message,
      };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return {
        status: res.status,
        data: null,
        message: `Failed to parse response: ${parseError.message}`
      };
    }
  } catch (error) {
    console.error('Exception in handleRetrieveConsulation:', error);
    return {
      status: 500,
      data: null,
      message: `Failed to fetch consultation: ${error.message || 'Unknown error'}`
    };
  }
};

/**
 * Retrieves all consultations for the admin
 * @param {Object} config - Request configuration with headers
 * @param {string} source - Filtering source (all, today, upcoming, completed)
 * @returns {Promise<Object>} Response with consultation data
 */
export const handleRetrieveConsulations = async (config, source = 'all') => {
  try {
    console.log('=== FETCHING CONSULTATIONS ===');
    console.log(`Source parameter: ${source}`);
    console.log(`API endpoint: ${BASE_URL}/consultation/all?source=${source}`);
    console.log('Auth header present:', !!config.headers.Authorization);
    
    const res = await fetch(`${BASE_URL}/consultation/all?source=${source}`, {
      method: "GET",
      headers: {
        ...config.headers,
      },
    });
    
    console.log('Response status:', res.status);
    
    // Get response as text first for logging
    const responseText = await res.text();
    console.log('Raw response (first 200 chars):', responseText.substring(0, 200) + '...');
    
    // Parse JSON after logging text
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Response data structure:', Object.keys(data));
      console.log('Data array length:', Array.isArray(data.data) ? data.data.length : 'not an array');
      
      // Log the first item if it exists
      if (Array.isArray(data.data) && data.data.length > 0) {
        console.log('First consultation item structure:', Object.keys(data.data[0]));
        console.log('First consultation sample:', JSON.stringify(data.data[0]).substring(0, 300) + '...');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        status: res.status,
        data: null,
        message: 'Failed to parse response data'
      };
    }

    return {
      status: res?.status,
      data: data?.data,
      message: data?.message,
    };
  } catch (error) {
    console.error('Error retrieving consultations:', error);
    return {
      status: 500,
      data: null,
      message: error.message || 'Failed to retrieve consultations',
    };
  }
};

/**
 * Processes Google sign-in response from backend
 * @param {string} idToken - Google ID token
 * @param {string} accessToken - Google access token
 * @returns {Promise<Object>} Response with user data and token
 */
export const processGoogleLogin = async (idToken, accessToken) => {
  try {
    console.log('Processing Google login with tokens');
    
    // Call your backend to verify the Google token and create/login user
    const response = await fetch(`${BASE_URL}/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        idToken,
        accessToken
      }),
    });

    const data = await response.json();
    console.log('Google login response:', data);
    
    // If login was successful, save the token and user data
    if (response.status === 200 || response.status === 201) {
      if (data.data?.token) {
        const token = data.data.token;
        
        // Store token in all expected storage locations for maximum compatibility
        try {
          // Primary storage locations
          await AsyncStorage.setItem('token', token);
          await saveToken(token); // Uses @karmic_keran_token key
          
          // Additional locations for compatibility
          await AsyncStorage.setItem('jwt', token);
          await AsyncStorage.setItem('authToken', token);
          
          // Also try to save in SecureStore if available
          if (SecureStore) {
            await SecureStore.setItemAsync('userToken', token);
          }
          
          console.log('Token saved in all storage locations successfully');
        } catch (storageError) {
          console.error('Error saving token to storage:', storageError);
        }
        
        // Save user data if available
        const userData = data.data?.user || data.data;
        if (userData) {
          await saveUser(userData);
          
          // If we have user ID, store it
          if (userData?._id) {
            await AsyncStorage.setItem('userId', userData._id);
          }
          
          // Store user role if available
          if (userData?.is_admin !== undefined) {
            await AsyncStorage.setItem('userRole', userData.is_admin ? 'admin' : 'user');
          }
        }
      }
      
      return {
        success: true,
        status: response.status,
        data: data.data,
        message: data.message || "Successfully signed in with Google"
      };
    }
    
    // Handle error cases
    return {
      success: false,
      status: response.status,
      message: data.message || "Error signing in with Google"
    };
  } catch (error) {
    console.error('Google sign in processing error:', error);
    return {
      success: false,
      status: 500,
      message: error.message || "Failed to process Google sign in"
    };
  }
};




