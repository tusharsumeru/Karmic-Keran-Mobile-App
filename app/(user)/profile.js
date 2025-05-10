import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ProfileScreen from '../../components/user/profile/ProfileScreen';

export default function ProfilePage() {
  return (
    <SafeAreaView style={styles.container}>
      <ProfileScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
}); 