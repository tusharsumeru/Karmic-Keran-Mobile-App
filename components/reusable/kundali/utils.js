import { PLANET_SYMBOLS, ZODIAC_SIGNS } from "./constants/zodiac-constants";

export const getPositionStyles = (position) => {
  const positions = {
    top: {
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: [{ translateX: '-50%' }]
    },
    bottom: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: [{ translateX: '-50%' }]
    },
    left: {
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: [{ translateY: '-50%' }]
    },
    right: {
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: [{ translateY: '-50%' }]
    },
    topLeft: {
      position: 'absolute',
      top: 0,
      left: 0
    },
    topRight: {
      position: 'absolute',
      top: 0,
      right: 0
    },
    bottomLeft: {
      position: 'absolute',
      bottom: 0,
      left: 0
    },
    bottomRight: {
      position: 'absolute',
      bottom: 0,
      right: 0
    },
  };

  return positions[position] || {};
};

export const mapPlanetsToPositions = (kundaliData, isMoon, isSun) => {
  // For moon chart, use moon sign as reference point instead of ascendant
  const referenceSign = isMoon
    ? kundaliData.data.planets.find((p) => p.name === "Moon")?.sign
    : isSun
    ? kundaliData.data.planets.find((p) => p.name === "Sun")?.sign
    : kundaliData.data.siderealAscendant.sign;

  const referenceIndex = ZODIAC_SIGNS.indexOf(referenceSign);

  // Initialize positions map (P1 to P12)
  const positionsMap = {};
  for (let i = 1; i <= 12; i++) {
    positionsMap[`P${i}`] = [];
  }

  // Map each planet to its position
  kundaliData.data.planets.forEach((planet) => {
    const planetSignIndex = ZODIAC_SIGNS.indexOf(planet.sign);
    // Calculate position number (P1-P12) based on sign relative to reference point
    let positionNumber = planetSignIndex - referenceIndex + 1;
    if (positionNumber <= 0) positionNumber += 12;

    const formattedDegree = Math.floor(planet.degree)
      .toString()
      .padStart(2, "0");
    const planetSymbol =
      PLANET_SYMBOLS[planet.name] || planet.name.substring(0, 2);

    // Parse status string into array of status flags
    const statusArray = planet.status
      ? planet.status
          .replace(/[\[\]]/g, "")
          .split(" ")
          .filter((s) => s === "R" || s === "C")
      : [];

    // Add exalted and debilitated status
    if (planet.exalted) {
      statusArray.push("EXALTED");
    }
    if (planet.debilitated) {
      statusArray.push("DEBILITATED");
    }

    positionsMap[`P${positionNumber}`].push({
      symbol: planetSymbol,
      degree: formattedDegree,
      status: statusArray,
    });
  });

  return positionsMap;
};
