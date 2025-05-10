"use client";

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Borders from "../Borders";
import PlanetPositionContainers from "../PlanetPositionContainers";
import ZodiacSignDisplay from "../ZodiacSignDisplay";
import HouseNumbers from "../HouseNumbers";
import mockData from "../mockData.json";
import { ZODIAC_SIGN_CONFIGS } from "./zodiac-sign-configs";

const KundaliChart1 = ({ sign, data, isMoon, isSun }) => {
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  }
});

export default KundaliChart1;
