/**
 * Utility functions for processing astrological readings and interpretations
 */

/**
 * Gets the interpretation for a planet in a specific sign
 */
export const getPlanetInterpretation = (planet, interpretationData) => {
  const { name, sign } = planet;
  if (!interpretationData[name] || !interpretationData[name][sign]) {
    return 'Interpretation not available';
  }
  return interpretationData[name][sign];
};

/**
 * Formats degrees and minutes into a readable string
 */
export const formatDegrees = (degrees, minutes) => {
  if (degrees === undefined || minutes === undefined) {
    return 'Unknown Position';
  }
  
  // Format degrees with leading zero if needed
  const formattedDegrees = degrees.toString().padStart(2, '0');
  
  // Format minutes with leading zero if needed
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${formattedDegrees}° ${formattedMinutes}'`;
};

/**
 * Formats planet status for display
 */
export const formatPlanetStatus = (planet) => {
  const statuses = [];
  
  if (planet.exalted) statuses.push('Exalted');
  if (planet.debilited) statuses.push('Debilitated');
  
  if (planet.status) {
    const statusCodes = planet.status
      .replace('[', '')
      .replace(']', '')
      .split(' ')
      .filter(Boolean);
      
    statusCodes.forEach(code => {
      switch(code) {
        case 'R':
          statuses.push('Retrograde');
          break;
        case 'C':
          statuses.push('Combust');
          break;
        case 'D':
          statuses.push('Direct');
          break;
      }
    });
  }

  return statuses.join(', ');
};

/**
 * Format raw birth data into a more usable structure
 * @param {Object} data - Raw birth chart data
 * @returns {Object} Formatted birth data
 */
export const formatBirthData = (data) => {
  if (!data) return null;
  
  return {
    name: data.name || 'Unknown',
    dob: data.dob || data.date_of_birth || 'Unknown Date',
    tob: data.tob || data.time_of_birth || 'Unknown Time',
    pob: data.pob || data.place_of_birth || 'Unknown Location',
    city: data.city || '',
    state: data.state || '',
    country: data.country || '',
    planets: data.planets || [],
    houses: data.houses || [],
    ascendant: data.ascendant || data.siderealAscendant?.sign || 'Unknown',
  };
};

/**
 * Groups planets by their signs
 */
export const groupPlanetsBySign = (planets) => {
  return planets.reduce((acc, planet) => {
    if (!acc[planet.sign]) {
      acc[planet.sign] = [];
    }
    acc[planet.sign].push(planet);
    return acc;
  }, {});
};

/**
 * Gets the strength description of a planet
 */
export const getPlanetStrength = (planet) => {
  if (planet.exalted) return 'Strong';
  if (planet.debilited) return 'Weak';
  return 'Moderate';
}; 