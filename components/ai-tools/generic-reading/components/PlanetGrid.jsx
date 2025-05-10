

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getPlanetInterpretation } from "../utils/interpretationHelpers";
import PlanetCard from "./PlanetCard";

const PlanetGrid = ({ planets, interpretationData }) => {
  if (!planets || !planets.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No planetary data available</Text>
      </View>
    );
  }

  const renderPlanetCard = ({ item }) => (
    <View style={styles.planetCardContainer}>
      <PlanetCard
        planet={item}
        interpretation={getPlanetInterpretation(item, interpretationData)}
      />
    </View>
  );

  return (
    <FlatList
      data={planets}
      keyExtractor={(item) => item.name}
      renderItem={renderPlanetCard}
      contentContainerStyle={styles.gridContainer}
      numColumns={1}
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    padding: 16,
  },
  planetCardContainer: {
    marginBottom: 16,
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  }
});

export default PlanetGrid; 