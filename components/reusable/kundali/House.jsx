import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getPositionStyles } from "./utils";

// Mapping for zodiac number positioning within each house
const ZODIAC_NUMBER_POSITIONS = {
  H1: {
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    number: {
      transform: [{ translateY: -4 }],
    },
  },
  H2: {
    container: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    number: {},
  },
  H3: {
    container: {
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    number: {},
  },
  H4: {
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    number: {
      transform: [{ translateX: -5 }],
    },
  },
  H5: {
    container: {
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    number: {},
  },
  H6: {
    container: {
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    number: {},
  },
  H7: {
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    number: {
      transform: [{ translateY: 5 }],
    },
  },
  H8: {
    container: {
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    number: {},
  },
  H9: {
    container: {
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    number: {},
  },
  H10: {
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    number: {
      transform: [{ translateX: 5 }],
    },
  },
  H11: {
    container: {
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    number: {},
  },
  H12: {
    container: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    number: {},
  },
};

const House = ({ name, position, color, dimensions, zodiacNumber }) => {
  const positionStyles = getPositionStyles(position);
  const housePosition =
    ZODIAC_NUMBER_POSITIONS[name] || ZODIAC_NUMBER_POSITIONS.H1;

  // Get the padding style based on house position
  const getPaddingStyle = () => {
    switch (name) {
      case "H2":
      case "H12":
        return { paddingBottom: 8 };
      case "H6":
      case "H8":
        return { paddingTop: 8 };
      case "H3":
      case "H5":
        return { paddingRight: 16 };
      case "H9":
      case "H11":
        return { paddingLeft: 16 };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        styles.house,
        positionStyles,
        {
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: color,
        },
        housePosition.container,
      ]}
    >
      <View style={getPaddingStyle()}>
        <Text
          style={[
            styles.houseNumber,
            housePosition.number,
          ]}
        >
          {zodiacNumber}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  house: {
    position: 'absolute',
  },
  houseNumber: {
    fontSize: 9,
    fontWeight: 'normal',
    color: 'white',
    transform: [{ scale: 1 }],
  },
});

export default House;
