import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * KKLogo component for displaying the Karmic Keran logo
 * @param {Object} props - Component props
 * @param {number} props.width - Width of the logo container
 * @param {number} props.height - Height of the logo container
 * @param {boolean} props.showText - Whether to show the logo text
 */
const KKLogo = ({ width = 180, height = 80, showText = true }) => {
  // Calculate icon sizes based on the provided dimensions
  const iconSize = Math.min(width, height) * 0.5;
  const containerSize = Math.min(width, height) * 0.8;
  const raySize = containerSize * 0.9;
  
  return (
    <View style={[styles.container, { width, height }]}>
      <View style={[styles.logoContainer, { width: containerSize, height: containerSize }]}>
        {/* Inner glow */}
        <View style={[
          styles.innerGlow, 
          { 
            width: raySize, 
            height: raySize, 
            borderRadius: raySize / 2 
          }
        ]} />
        
        {/* Outer glow */}
        <View style={[
          styles.outerGlow, 
          { 
            width: raySize * 1.4, 
            height: raySize * 1.4, 
            borderRadius: raySize * 0.7 
          }
        ]} />
        
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="sunny" size={iconSize} color="#FF6B00" />
        </View>
      </View>
      
      {showText && (
        <Text style={[styles.logoText, { fontSize: height * 0.25 }]}>
          Karmic Keran
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  logoContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
  },
  outerGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoText: {
    color: '#FF6B00',
    fontWeight: 'bold',
    marginTop: 8,
  }
});

export default KKLogo; 