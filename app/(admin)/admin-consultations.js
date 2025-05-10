import React from 'react';
import { View, StyleSheet } from 'react-native';
import Consultations from '../../components/admin/consultations/Consultations';
import { Stack } from 'expo-router';

export default function AdminConsultationsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Consultations',
          headerShown: false,
        }}
      />
      <Consultations />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
}); 