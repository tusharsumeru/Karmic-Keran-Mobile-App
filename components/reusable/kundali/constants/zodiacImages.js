/**
 * Image mapping for zodiac signs in React Native
 * 
 * This file provides utility functions and mappings for zodiac sign images.
 * Use the getZodiacImage function to get the appropriate image for a zodiac sign.
 */

// Updated paths to match the actual filenames in assets/images
const ZODIAC_IMAGES = {
  // Map each zodiac sign to its image resource
  Aries: require('../../../../assets/images/zodiac-sign-1-aries.png'),
  Taurus: require('../../../../assets/images/zodiac-sign-2-taurus.png'),
  Gemini: require('../../../../assets/images/zodiac-sign-3-gemini.png'),
  Cancer: require('../../../../assets/images/zodiac-sign-4-cancer.png'),
  Leo: require('../../../../assets/images/zodiac-sign-5-leo.png'),
  Virgo: require('../../../../assets/images/zodiac-sign-6-virgo.png'),
  Libra: require('../../../../assets/images/zodiac-sign-7-libra.png'),
  Scorpio: require('../../../../assets/images/zodiac-sign-8-scorpio.png'),
  Sagittarius: require('../../../../assets/images/zodiac-sign-9-sagittarius.png'),
  Capricorn: require('../../../../assets/images/zodiac-sign-10-capricorn.png'),
  Aquarius: require('../../../../assets/images/zodiac-sign-11-aquarius.png'),
  Pisces: require('../../../../assets/images/zodiac-sign-12-pisces.png'),
};

/**
 * Gets the image resource for a zodiac sign
 * @param {string} sign - The zodiac sign name
 * @returns {any} React Native image resource for the zodiac sign
 */
export const getZodiacImage = (sign) => {
  // Normalize the sign name by capitalizing first letter and lower-casing the rest
  const normalizedSign = sign && typeof sign === 'string' 
    ? sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase() 
    : '';
    
  // Return the image for the sign, or default to Aries if not found
  return ZODIAC_IMAGES[normalizedSign] || ZODIAC_IMAGES.Aries;
};

export default ZODIAC_IMAGES; 