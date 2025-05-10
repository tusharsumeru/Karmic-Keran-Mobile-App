

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDegrees } from "../utils/interpretationHelpers";

const PlanetCard = ({ planet, interpretation }) => {
  const getStatusColor = (status) => {
    if (status && status.includes('[R]')) return '#ef4444'; // red-500
    if (status && status.includes('[C]')) return '#f97316'; // orange-500
    return '#22c55e'; // green-500
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{planet.name[0]}</Text>
        </View>
        <View>
          <Text style={styles.planetName}>{planet.name}</Text>
          <Text style={styles.planetSign}>in {planet.sign}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Position</Text>
            <Text style={styles.value}>{formatDegrees(planet.degree, planet.minute)}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Status</Text>
            <Text style={[styles.value, { color: getStatusColor(planet.status) }]}>
              {planet.statusName || 'Normal'}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Nakshatra</Text>
            <Text style={styles.value}>{planet.nakshatra} (Pada {planet.pada})</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Dignity</Text>
            <Text style={styles.value}>
              {planet.exalted ? 'Exalted' : planet.debilited ? 'Debilitated' : 'Normal'}
            </Text>
          </View>
        </View>

        <View style={styles.interpretationContainer}>
          <Text style={styles.interpretationText}>{interpretation}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '600',
  },
  planetName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  planetSign: {
    fontSize: 14,
    color: '#64748b',
  },
  content: {
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  gridItem: {
    width: '50%',
    paddingVertical: 6,
    paddingRight: 8,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  interpretationContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  interpretationText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748b',
  },
});

export default PlanetCard; 