import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { formatDate } from '../utils/dateHelpers';

const TransitHeader = ({ birthData }) => {
  // Extract data with proper null checks
  const moonSign = birthData?.planets?.find(p => p.name === 'Moon')?.sign;
  const birthDate = birthData?.dateOfBirth;
  const birthTime = birthData?.timeOfBirth;
  const location = birthData ? `${birthData.city}, ${birthData.state}, ${birthData.country}` : '';

  if (!birthData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#7765E3" />
        <Text style={styles.loadingText}>Loading birth data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Birth Date</Text>
          <Text style={styles.infoValue}>{formatDate(birthDate)}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Birth Time</Text>
          <Text style={styles.infoValue}>{birthTime}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Moon Sign</Text>
          <Text style={styles.infoValue}>{moonSign}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Birth Place</Text>
          <Text style={styles.infoValue}>{location}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'column',
  },
  infoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  }
});

export default TransitHeader; 