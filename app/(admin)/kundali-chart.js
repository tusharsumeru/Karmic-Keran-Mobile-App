import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import KundaliPlanet from '../../components/admin/consultations/kundali-planet';

export default function KundaliChartScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Astrological Chart",
          headerShown: true,
        }}
      />
      <KundaliPlanet 
        showBack={true}
        isUser={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
}); 