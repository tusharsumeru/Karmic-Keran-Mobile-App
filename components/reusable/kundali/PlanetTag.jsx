import React from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

const PlanetTag = ({
  children,
  degree,
  status = [],
  exalted = false,
  debilitated = false,
}) => {
  // Animation for retrograde rotation
  const rotateAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (status?.includes("R") && !status?.includes("C")) {
      Animated.loop(
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [status, rotateAnimation]);

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg']
  });

  // Helper function to determine tag style based on status
  const getTagStyle = () => {
    // Check for combined R and C status
    if (status.includes("R") && status.includes("C")) {
      return {
        containerBorder: {
          borderWidth: 1.5,
          borderColor: 'rgba(181, 0, 157, 0.8)',
        },
        innerBg: '#B5009D',
        symbolText: '#FFFFFF',
        degreeText: '#FFFFFF',
      };
    }
    if (status.includes("C")) {
      return {
        containerBorder: {
          borderWidth: 1.5,
          borderColor: '#FF0000',
        },
        innerBg: '#A83500',
        symbolText: '#FFFFFF',
        degreeText: '#FFFFFF',
      };
    }
    if (status.includes("R")) {
      return {
        containerBorder: {
          borderWidth: 0,
        },
        innerBg: '#5B2FDF',
        symbolText: '#FFFFFF',
        degreeText: '#FFFFFF',
      };
    }
    // Default (Direct) style
    return {
      containerBorder: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.7)',
      },
      innerBg: '#FFFFFF',
      symbolText: '#A53333',
      degreeText: '#B25C00',
    };
  };

  const styles = getTagStyle();

  return (
    <View style={localStyles.planetTagScaler}>
      <View style={localStyles.tagContainer}>
        {/* Rotating border for retrograde */}
        {status?.includes("R") && !status?.includes("C") && (
          <View style={localStyles.rotatingBorderContainer}>
            {/* Base blue circle */}
            <View style={localStyles.blueCircle} />
            
            {/* Rotating gradient overlay - represented as a simple animated view */}
            <Animated.View 
              style={[
                localStyles.rotatingGradient,
                { transform: [{ rotate: spin }] }
              ]}
            >
              <View style={localStyles.gradientOverlay} />
            </Animated.View>
          </View>
        )}

        <View
          style={[
            localStyles.planetTagContainer,
            styles.containerBorder,
          ]}
        >
          <View
            style={[
              localStyles.planetTagInner,
              { backgroundColor: styles.innerBg }
            ]}
          >
            {/* Static content */}
            <View style={localStyles.contentContainer}>
              <View style={localStyles.statusRow}>
                {status.includes("EXALTED") && (
                  <View style={localStyles.exaltedArrow} />
                )}
                {status.includes("DEBILITATED") && (
                  <View style={localStyles.debilitatedArrow} />
                )}
              </View>
              
              <View style={localStyles.symbolRow}>
                <Text
                  style={[
                    localStyles.symbolText,
                    { color: styles.symbolText }
                  ]}
                >
                  {children}
                </Text>
              </View>
              
              <View style={localStyles.degreeRow}>
                <Text
                  style={[
                    localStyles.degreeText,
                    { color: styles.degreeText }
                  ]}
                >
                  {degree}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  planetTagScaler: {
    transform: [{ scale: 1 }],
  },
  tagContainer: {
    position: 'relative',
    width: 22,
    height: 22,
  },
  rotatingBorderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blueCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 11,
    backgroundColor: '#0081DC',
  },
  rotatingGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 11,
  },
  gradientOverlay: {
    width: '100%',
    height: '100%',
    borderRadius: 11,
    // This is a simplification, as React Native doesn't support conic gradients directly
    // You might want to use a more sophisticated solution like react-native-linear-gradient
    backgroundColor: 'rgba(0, 123, 255, 0.7)',
  },
  planetTagContainer: {
    position: 'relative',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 5,
  },
  planetTagInner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 21,
    height: 21,
    borderRadius: 10.5,
    transform: [
      { translateX: -10.5 },
      { translateY: -10.5 }
    ],
    overflow: 'hidden',
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 1,
  },
  statusRow: {
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exaltedArrow: {
    width: 5,
    height: 5,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  debilitatedArrow: {
    width: 5,
    height: 5,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  symbolRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 9,
  },
  degreeRow: {
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  degreeText: {
    fontSize: 6,
    fontWeight: '500',
    lineHeight: 6,
    marginBottom: 1.2,
  },
});

export default PlanetTag;
