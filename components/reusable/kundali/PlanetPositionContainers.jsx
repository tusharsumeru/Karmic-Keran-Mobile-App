import React from "react";
import { View, StyleSheet } from "react-native";
import { getPositionStyles, mapPlanetsToPositions } from "./utils";
import PlanetPosition from "./PlanetPosition";
import mockData from "./mockData.json";

// Configuration for planet positions with their respective background colors
const PLANET_CONFIGS = [
  // Planet 1 - Top
  {
    name: "P1",
    position: "top",
    dimensions: { width: "50%", height: "50%" },
  },
  // Planet 12 - Top Right
  {
    name: "P12",
    position: "topRight",
    dimensions: { width: "50%", height: "25%" },
  },
  // Planet 11 - Top Right
  {
    name: "P11",
    position: "topRight",
    dimensions: { width: "25%", height: "50%" },
  },
  // Planet 10 - Right
  {
    name: "P10",
    position: "right",
    dimensions: { width: "50%", height: "50%" },
  },
  // Planet 9 - Bottom Right
  {
    name: "P9",
    position: "bottomRight",
    dimensions: { width: "25%", height: "50%" },
  },
  // Planet 8 - Bottom Right
  {
    name: "P8",
    position: "bottomRight",
    dimensions: { width: "50%", height: "25%" },
  },
  // Planet 7 - Bottom
  {
    name: "P7",
    position: "bottom",
    dimensions: { width: "50%", height: "50%" },
  },
  // Planet 6 - Bottom Left
  {
    name: "P6",
    position: "bottomLeft",
    dimensions: { width: "50%", height: "25%" },
  },
  // Planet 5 - Bottom Left
  {
    name: "P5",
    position: "bottomLeft",
    dimensions: { width: "25%", height: "50%" },
  },
  // Planet 4 - Left
  {
    name: "P4",
    position: "left",
    dimensions: { width: "50%", height: "50%" },
  },
  // Planet 3 - Top Left
  {
    name: "P3",
    position: "topLeft",
    dimensions: { width: "25%", height: "50%" },
  },
  // Planet 2 - Top Left
  {
    name: "P2",
    position: "topLeft",
    dimensions: { width: "50%", height: "25%" },
  },
];

const PlanetPositionContainers = ({ kundaliData, isMoon, isSun }) => {
  // Get mapped planets for each position
  const planetPositions = mapPlanetsToPositions(kundaliData, isMoon, isSun);

  return (
    <View style={styles.container}>
      {PLANET_CONFIGS.map((planetConfig) => {
        const positionStyles = getPositionStyles(planetConfig.position);
        const positionPlanets = planetPositions[planetConfig.name] || [];

        return (
          <View
            key={planetConfig.name}
            style={[
              styles.positionContainer,
              positionStyles,
              {
                width: planetConfig.dimensions.width,
                height: planetConfig.dimensions.height,
              },
            ]}
          >
            <PlanetPosition
              position={planetConfig.name}
              planets={positionPlanets}
            />
          </View>
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
  positionContainer: {
    position: 'absolute',
  },
});

export default PlanetPositionContainers;
