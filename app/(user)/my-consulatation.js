import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import ConsultationList from '../../components/user/consultations/ConsultationList';
import { createAuthConfig, retrieveUserConsultations } from '../../actions/auth';

export default function MyConsultationScreen() {
  const [filter, setFilter] = useState('upcoming');
  const router = useRouter();
  
  // Fetch consultations with React Query
  const { data: consultations, isLoading, refetch } = useQuery({
    queryKey: ['consultations', filter],
    queryFn: async () => {
      const config = await createAuthConfig();
      const response = await retrieveUserConsultations(config, filter);
      
      if (response.status !== 200) {
        console.error(`Error fetching consultations: ${response.message}`);
        return [];
      }
      
      return response.data || [];
    },
    refetchOnWindowFocus: true
  });
  
  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  // Handle view chart navigation - alternative to direct navigation from component
  const handleViewChart = (consultation) => {
    console.log('Navigating to chart from screen level handler');
    if (!consultation) return;
    
    // Parse place of birth
    const parsePlaceOfBirth = (placeOfBirth = "") => {
      const parts = placeOfBirth
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
  
      let city = "";
      let state = "";
      let country = "";
  
      if (parts.length >= 2) {
        country = parts[parts.length - 1]; 
        const possibleState = parts[parts.length - 2];
  
        const isPinCode = /^\d{4,6}$/.test(possibleState);
  
        if (isPinCode) {
          state = parts[parts.length - 3] || "";
        } else {
          state = possibleState;
        }
  
        city = parts[0];
  
        if (!state) state = city;
      }
  
      return { city, state, country };
    };
    
    // Extract place of birth components
    const { city, state, country } = parsePlaceOfBirth(
      consultation.place_of_birth || consultation.birth_place || ""
    );
    
    // Navigate to chart
    router.push({
      pathname: '/(user)/consultation-chart',
      params: {
        consultationId: consultation._id || consultation.id,
        name: consultation.name || consultation.user_details?.full_name,
        birthDate: consultation.date_of_birth || consultation.user_details?.birth_date,
        birthTime: consultation.time_of_birth || consultation.user_details?.birth_time,
        birthPlace: JSON.stringify({ city, state, country }),
        gender: consultation.gender || consultation.user_details?.gender
      }
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f9f9f9" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Consultations</Text>
      </View>
      
      <View style={styles.content}>
        <ConsultationList 
          consultations={consultations || []}
          loading={isLoading}
          activeFilter={filter}
          onFilterChange={handleFilterChange}
          onViewChart={handleViewChart}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fa',
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
  content: {
    flex: 1,
    padding: 16,
  },
}); 