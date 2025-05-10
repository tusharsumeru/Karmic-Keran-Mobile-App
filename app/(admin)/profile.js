import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AdminProfileScreen from '../../components/admin/profile/AdminProfileScreen';

export default function ProfilePage() {
  return (
    <SafeAreaView style={styles.container}>
      <AdminProfileScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
}); 