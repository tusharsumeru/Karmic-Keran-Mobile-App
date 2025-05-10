import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import ConsultationDetailScreen from '../../components/admin/consultations/ConsultationDetailScreen';
import { createAuthConfig } from '../../actions/auth';

export default function ConsultationDetail() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const router = useRouter();

  // Log the parameters for debugging
  console.log('DETAIL SCREEN PARAMS:', JSON.stringify(params));

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const authConfig = await createAuthConfig();
        const hasToken = !!authConfig.headers.Authorization;
        
        console.log('Consultation detail screen - Auth check:', hasToken ? 'Authenticated' : 'Not authenticated');
        setIsAuthenticated(hasToken);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, color: '#333' }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#ef4444' }}>
          Authentication Required
        </Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>
          Please sign in to view consultation details.
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: '#3b82f6',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
          onPress={() => router.push('/(auth)/sign-in')}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!params.id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#ef4444' }}>
          Consultation ID Missing
        </Text>
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>
          No consultation ID was provided. Please select a consultation from the list.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#3b82f6',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Back to Consultations</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />
      <ConsultationDetailScreen id={params.id} />
    </>
  );
} 