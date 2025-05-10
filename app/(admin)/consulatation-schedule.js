import React from 'react';
import { View, StyleSheet } from 'react-native';
import Schedule from '../../components/admin/schedule/Schedule';

export default function ConsultationScheduleScreen() {
  return (
    <View style={styles.container}>
      <Schedule />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
}); 