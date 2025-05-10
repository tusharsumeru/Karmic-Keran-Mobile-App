import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';
import ConsultationChart from '../../components/user/consultations/chart';

export default function ConsultationChartScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Birth Chart',
          headerShown: false, // Hide header as we have a custom header in the component
        }} 
      />
      <ConsultationChart />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
}); 