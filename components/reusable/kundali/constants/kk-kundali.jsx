

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Borders from "../Borders";
import PlanetPositionContainers from "../PlanetPositionContainers";
import ZodiacSignDisplay from "../ZodiacSignDisplay";
import HouseNumbers from "../HouseNumbers";
import mockData from "../mockData.json";
import { ZODIAC_SIGN_CONFIGS } from "./zodiac-sign-configs";

const KundaliChart = ({ sign, data, isMoon, isSun }) => {
  const ascendantSign = sign || "Capricorn";
  
  // For React Native we'll use Dimensions to handle scaling
  const windowWidth = Dimensions.get('window').width;
  const chartSize = Math.min(windowWidth - 40, 600); // Max size 600, with padding
  
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.chart,
          { width: chartSize, height: chartSize }
        ]}
      >
        <Borders />
        
        {/* Planet Positions Layer */}
        <PlanetPositionContainers
          kundaliData={data}
          isMoon={isMoon}
          isSun={isSun}
        />
        
        {/* Zodiac Signs Layer */}
        <View style={styles.absoluteFill}>
          {ZODIAC_SIGN_CONFIGS.map((config) => (
            <ZodiacSignDisplay
              key={config.name}
              {...config}
              isAscendant={config.name === "Z1"}
              zodiacSign={ascendantSign}
              isMoon={isMoon}
            />
          ))}
        </View>

        <HouseNumbers sign={ascendantSign} />
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendSection}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#B5009D' }]} />
            <Text style={styles.legendText}>Planet is Combust and Retrograde</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#A83500' }]} />
            <Text style={styles.legendText}>Planet is Combust</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#5B2FDF' }]} />
            <Text style={styles.legendText}>Planet is Retrograde</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendIconContainer, { backgroundColor: 'white' }]}>
              <View style={styles.exaltedArrow} />
            </View>
            <Text style={styles.legendText}>Planet is Exalted</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendIconContainer, { backgroundColor: 'white' }]}>
              <View style={styles.debilitatedArrow} />
            </View>
            <Text style={styles.legendText}>Planet is Debilitated</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  chart: {
    aspectRatio: 1,
    backgroundColor: '#FF9900', // Base color before gradient
    position: 'relative',
    // React Native gradients require a separate component like LinearGradient
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  legendContainer: {
    marginTop: 24,
    width: '100%',
  },
  legendSection: {
    flexDirection: 'column',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendIconContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  exaltedArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#333',
  },
  debilitatedArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#333',
  },
});

export default KundaliChart;
