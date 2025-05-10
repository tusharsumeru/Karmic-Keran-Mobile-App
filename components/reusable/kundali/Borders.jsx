import React from 'react';
import { View, StyleSheet } from 'react-native';

const Borders = () => {
  return (
    <View style={styles.container}>
      {/* Square */}
      <View style={styles.square}></View>

      {/* Diagonal lines */}
      <View style={styles.diagonalContainer}>
        {/* Line rotated 45 degrees */}
        <View style={[styles.diagonalLine, styles.rotate45]}></View>

        {/* Line rotated -45 degrees */}
        <View style={[styles.diagonalLine, styles.rotateNeg45]}></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  square: {
    width: '70.5%',
    height: '70.5%',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ rotate: '45deg' }],
  },
  diagonalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  diagonalLine: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '141.4%', // sqrt(2) * 100% to account for rotation
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [
      { translateX: '-50%' },
      { translateY: '-50%' },
    ],
  },
  rotate45: {
    transform: [
      { translateX: '-50%' },
      { translateY: '-50%' },
      { rotate: '45deg' },
    ],
  },
  rotateNeg45: {
    transform: [
      { translateX: '-50%' },
      { translateY: '-50%' },
      { rotate: '-45deg' },
    ],
  },
});

export default Borders;
