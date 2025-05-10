import React from 'react';
import { View, StyleSheet } from 'react-native';
import QueriesList from '../../components/user/queries';

export default function QueriesPage() {
  return (
    <View style={styles.container}>
      <QueriesList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
}); 