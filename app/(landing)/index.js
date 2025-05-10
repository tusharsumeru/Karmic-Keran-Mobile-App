import React from 'react';
import { View, StyleSheet } from 'react-native';
import LandingPage from '../../components/landing-page/LandingPage';
import { Stack } from 'expo-router';

export default function LandingScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LandingPage />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 