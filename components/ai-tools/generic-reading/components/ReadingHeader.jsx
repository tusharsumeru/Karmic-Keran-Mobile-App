

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDegrees } from "../utils/interpretationHelpers";

const ReadingHeader = ({ birthData }) => {
  if (!birthData) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Birth Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Birth Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>{birthData?.dateOfBirth || birthData?.dob}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>
              {[birthData?.city, birthData?.state, birthData?.country].filter(Boolean).join(', ')}
            </Text>
          </View>
          
          {(birthData?.latitude || birthData?.longitude) && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Coordinates</Text>
              <Text style={styles.detailValue}>
                {birthData?.latitude}, {birthData?.longitude}
              </Text>
            </View>
          )}
          
          {birthData?.timezone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Timezone</Text>
              <Text style={styles.detailValue}>GMT {birthData?.timezone}</Text>
            </View>
          )}
        </View>

        {/* Ascendant Details Section */}
        {birthData?.siderealAscendant && (
          <View style={[styles.section, styles.secondSection]}>
            <Text style={styles.sectionTitle}>Rising Sign</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ascendant Sign</Text>
              <Text style={styles.detailValue}>{birthData?.siderealAscendant?.sign}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Exact Position</Text>
              <Text style={styles.detailValue}>
                {formatDegrees(
                  birthData?.siderealAscendant?.degrees,
                  birthData?.siderealAscendant?.minutes
                )}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nakshatra & Pada</Text>
              <Text style={styles.detailValue}>
                {birthData?.siderealAscendant?.nakshatra} (Pada {birthData?.siderealAscendant?.pada})
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  section: {
    padding: 16,
  },
  secondSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
});

export default ReadingHeader;
