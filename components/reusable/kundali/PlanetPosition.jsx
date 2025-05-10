import React from "react";
import { View, StyleSheet } from "react-native";
import PlanetTag from "./PlanetTag";
import { PLANET_PATTERNS } from "./constants/planet-position-patterns";
import { getPositionStyles, getContainerStyles } from "./utils/planetPositionStylesConverter";

const PlanetPosition = ({ position, planets }) => {
  // If no planets or pattern not found, return empty view
  if (!planets?.length || !PLANET_PATTERNS[position]?.[planets.length]) {
    return <View style={styles.fullSize} />;
  }

  const pattern = PLANET_PATTERNS[position][planets.length];
  
  // Check if we're working with the new format (position property) or old format (x, y properties)
  const isNewFormat = pattern.positions[0] && pattern.positions[0].position !== undefined;
  
  // Get container style either from containerStyle (new format) or by converting containerClass (old format)
  const containerStyle = pattern.containerStyle || 
    (pattern.containerClass ? getContainerStyles(pattern.containerClass) : {});

  return (
    <View style={[styles.fullSize, containerStyle]}>
      {planets.map((planet, index) => {
        // Only render if we have position data for this index
        if (!pattern.positions[index]) return null;

        // Get position style either directly from position property (new format)
        // or by converting x, y properties (old format)
        const positionStyle = isNewFormat 
          ? pattern.positions[index].position 
          : getPositionStyles(pattern.positions[index]);

        return (
          <View key={index} style={[styles.planetPosition, positionStyle]}>
            <PlanetTag
              degree={planet.degree}
              status={planet.status}
              exalted={planet.exalted}
              debilitated={planet.debilitated}
            >
              {planet.symbol}
            </PlanetTag>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  fullSize: {
    width: '100%',
    height: '100%',
  },
  planetPosition: {
    position: 'absolute',
  },
});

export default PlanetPosition;
