import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground
} from 'react-native';

const { width } = Dimensions.get('window');
const CHART_SIZE = Math.min(width * 0.9, 350);

const LagnaKundali = ({
  startValue = 1,
  name,
  degree,
  planetIndices = [],
}) => {
  // Generate array of 12 numbers starting from startValue
  const getOrderedNumbers = (start) => {
    const numbers = [];
    for (let i = 0; i < 12; i++) {
      const num = ((start + i - 1) % 12) + 1;
      numbers.push(num);
    }
    return numbers;
  };

  const numbers = getOrderedNumbers(startValue);

  // Generate zodiac names for reference
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  return (
    <View style={styles.outerContainer}>
      <Text style={styles.chartTitle}>{name || "Kundali Chart"}</Text>
      {degree !== undefined && (
        <Text style={styles.degreeText}>Degree: {degree}°</Text>
      )}
      
      <View style={styles.container}>
        <View style={styles.kundaliChart}>
          {/* Top extending div */}
          <View style={[styles.cell, styles.topCell]}>
            <View style={styles.cellContent}>
              <View style={[
                styles.numberCircle,
                planetIndices.includes(0) && styles.highlightedCircle
              ]}>
                <Text style={styles.numberText}>{numbers[0]}</Text>
              </View>
              <Text style={styles.signText}>{zodiacSigns[(numbers[0] - 1) % 12]}</Text>
            </View>
          </View>

          {/* Left column divs */}
          <View style={styles.leftColumn}>
            {/* Top-left vertical */}
            <View style={styles.leftTopCell}>
              <View style={[styles.numberCircle, { position: 'absolute', top: 20, right: 12 }]}>
                <Text style={styles.numberText}>{numbers[2]}</Text>
              </View>
            </View>

            {/* Bottom-left vertical */}
            <View style={styles.leftBottomCell}>
              <View style={[styles.numberCircle, { position: 'absolute', bottom: 20, right: 12 }]}>
                <Text style={styles.numberText}>{numbers[4]}</Text>
              </View>
            </View>
          </View>

          {/* Right column divs */}
          <View style={styles.rightColumn}>
            {/* Top-right vertical */}
            <View style={styles.rightTopCell}>
              <View style={[styles.numberCircle, { position: 'absolute', top: 20, left: 10 }]}>
                <Text style={styles.numberText}>{numbers[10]}</Text>
              </View>
            </View>

            {/* Bottom-right vertical */}
            <View style={styles.rightBottomCell}>
              <View style={[styles.numberCircle, { position: 'absolute', bottom: 20, left: 12 }]}>
                <Text style={styles.numberText}>{numbers[8]}</Text>
              </View>
            </View>
          </View>

          {/* Bottom extending div */}
          <View style={[styles.cell, styles.bottomCell]}>
            <View style={styles.cellContent}>
              <View style={[
                styles.numberCircle,
                planetIndices.includes(6) && styles.highlightedCircle
              ]}>
                <Text style={styles.numberText}>{numbers[6]}</Text>
              </View>
              <Text style={styles.signText}>{zodiacSigns[(numbers[6] - 1) % 12]}</Text>
            </View>
          </View>

          {/* Middle row container */}
          <View style={styles.middleRow}>
            {/* Left extending div */}
            <View style={styles.middleLeftCell}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{numbers[3]}</Text>
              </View>
            </View>

            {/* Right extending div */}
            <View style={styles.middleRightCell}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{numbers[9]}</Text>
              </View>
            </View>
          </View>

          {/* Top row container */}
          <View style={styles.topRow}>
            {/* Top-left */}
            <View style={styles.topLeftCell}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{numbers[1]}</Text>
              </View>
            </View>

            {/* Top-right */}
            <View style={styles.topRightCell}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{numbers[11]}</Text>
              </View>
            </View>
          </View>

          {/* Bottom row container */}
          <View style={styles.bottomRow}>
            {/* Bottom-left */}
            <View style={styles.bottomLeftCell}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{numbers[5]}</Text>
              </View>
            </View>

            {/* Bottom-right */}
            <View style={styles.bottomRightCell}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{numbers[7]}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    padding: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  degreeText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 10,
  },
  kundaliChart: {
    width: CHART_SIZE,
    height: CHART_SIZE * 0.8,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: '#FF9900', // Chart background color
    borderRadius: 8,
  },
  cell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: '50%',
  },
  cellContent: {
    alignItems: 'center',
  },
  topCell: {
    top: 0,
    left: '50%',
    marginLeft: -20,
    transform: [{ translateY: -40 }],
  },
  bottomCell: {
    bottom: 0,
    left: '50%',
    marginLeft: -20,
    transform: [{ translateY: 40 }],
  },
  leftColumn: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '25%',
    height: '100%',
    flexDirection: 'column',
  },
  rightColumn: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '25%',
    height: '100%',
    flexDirection: 'column',
  },
  leftTopCell: {
    height: '50%',
    width: '100%',
    position: 'relative',
  },
  leftBottomCell: {
    height: '50%',
    width: '100%',
    position: 'relative',
  },
  rightTopCell: {
    height: '50%',
    width: '100%',
    position: 'relative',
  },
  rightBottomCell: {
    height: '50%',
    width: '100%',
    position: 'relative',
  },
  middleRow: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 40,
    top: '50%',
    marginTop: -20,
    flexDirection: 'row',
  },
  middleLeftCell: {
    width: '50%',
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 0,
    transform: [{ translateX: -50 }],
  },
  middleRightCell: {
    width: '50%',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 0,
    transform: [{ translateX: 50 }],
  },
  topRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '25%',
    flexDirection: 'row',
  },
  topLeftCell: {
    width: '50%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  topRightCell: {
    width: '50%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '25%',
    flexDirection: 'row',
  },
  bottomLeftCell: {
    width: '50%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  bottomRightCell: {
    width: '50%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightedCircle: {
    backgroundColor: '#FF9500',
    borderColor: '#FFC107',
  },
  numberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  signText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default LagnaKundali;
