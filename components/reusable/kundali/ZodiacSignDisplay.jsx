import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { getPositionStyles } from "./utils";
import { ZODIAC_SIGN_POSITIONS } from "./constants/zodiac-sign-positions";
import { getZodiacImage } from "./constants/zodiacImages";

const ZodiacSignDisplay = ({
  name,
  position,
  color,
  dimensions,
  isAscendant,
  zodiacSign,
}) => {
  const positionStyles = getPositionStyles(position);
  const signPosition = ZODIAC_SIGN_POSITIONS[name];

  // If no ascendant or sign, don't render anything
  if (!isAscendant) {
    return (
      <View 
        style={[
          styles.container, 
          positionStyles, 
          { 
            width: dimensions.width, 
            height: dimensions.height,
            backgroundColor: color || 'transparent',
          }
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container, 
        positionStyles, 
        { 
          width: dimensions.width, 
          height: dimensions.height,
          backgroundColor: color || 'transparent',
        }
      ]}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.zodiacSignScaler}>
          <Image
            source={getZodiacImage(zodiacSign)}
            style={styles.zodiacImage}
            resizeMode="contain"
          />
          <Text style={styles.zodiacText}>
            {zodiacSign.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contentWrapper: {
    paddingTop: 20,
  },
  zodiacSignScaler: {
    alignItems: 'center',
    transform: [{ scale: 1 }],
  },
  zodiacImage: {
    width: 38,
    height: 38,
  },
  zodiacText: {
    fontSize: 8,
    fontWeight: '500',
    color: 'white',
    textTransform: 'uppercase',
  },
});

export default ZodiacSignDisplay;
