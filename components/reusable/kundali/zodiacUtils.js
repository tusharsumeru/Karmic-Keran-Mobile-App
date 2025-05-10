/**
 * Constants and utility functions for zodiac signs
 */

// Mapping of zodiac signs to their numerical values
const ZODIAC_NUMBERS = {
  Aries: 1,
  Taurus: 2,
  Gemini: 3,
  Cancer: 4,
  Leo: 5,
  Virgo: 6,
  Libra: 7,
  Scorpio: 8,
  Sagittarius: 9,
  Capricorn: 10,
  Aquarius: 11,
  Pisces: 12,
};

/**
 * Gets the numerical value of a zodiac sign
 * @param {string} sign - The zodiac sign name
 * @returns {number} The numerical value (1-12) or undefined if not found
 */
export const getSignNumber = (sign) => {
  return ZODIAC_NUMBERS[sign];
};

/**
 * Gets the zodiac sign name from its numerical value
 * @param {number} number - The numerical value (1-12)
 * @returns {string} The zodiac sign name or empty string if not found
 */
export const getSignName = (number) => {
  return (
    Object.entries(ZODIAC_NUMBERS).find(
      ([_, value]) => value === number
    )?.[0] || ""
  );
};

/**
 * Calculates the house numbers based on the ascendant sign
 * @param {string} ascendantSign - The ascendant sign
 * @returns {number[]} Array of 12 house numbers in sequence
 */
export const calculateHouseNumbers = (ascendantSign) => {
  const ascendantNumber = getSignNumber(ascendantSign);
  const result = [];

  // Start with ascendant number
  let currentNumber = ascendantNumber;

  // Generate 12 numbers in sequence
  for (let i = 0; i < 12; i++) {
    result.push(currentNumber);
    currentNumber++;
    if (currentNumber > 12) {
      currentNumber = 1;
    }
  }

  return result;
};

// Export constants
export { ZODIAC_NUMBERS };
