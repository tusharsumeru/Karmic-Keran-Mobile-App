import React from "react";
import { View, StyleSheet } from "react-native";
import { HOUSE_CONFIGS } from "./constants/house-configs";
import House from "./House";
import mockData from "./mockData.json";
import { calculateHouseNumbers } from "./zodiacUtils";

const HouseNumbers = ({ sign }) => {
  // Get house numbers based on ascendant sign
  const houseNumbers = calculateHouseNumbers(sign || "Capricorn");

  // For Capricorn ascendant, houseNumbers will be [9,8,7,6,5,4,3,2,1,12,11,10]
  // When mapped to houses 1-12, this will give us [10,11,12,1,2,3,4,5,6,7,8,9]

  return (
    <View style={styles.container}>
      {HOUSE_CONFIGS.map((houseConfig) => {
        // Extract house number from name (e.g., 'H2' -> 2)
        const houseNumber = parseInt(houseConfig.name.substring(1));
        const index = houseNumber - 1;

        return (
          <House
            key={houseConfig.name}
            {...houseConfig}
            zodiacNumber={houseNumbers[index]}
          />
        );
      })}
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
  },
});

export default HouseNumbers;
