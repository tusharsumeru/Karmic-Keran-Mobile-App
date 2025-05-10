/**
 * Utility functions to convert Tailwind positioning classes to React Native positioning styles
 */

/**
 * Converts Tailwind positioning class strings to React Native positioning styles
 * @param {Object} position - Object containing x and y positioning from the PLANET_PATTERNS
 * @returns {Object} React Native style object with positioning properties
 */
export const getPositionStyles = (position) => {
  if (!position) return {};
  
  const styles = {};
  const transformArray = [];
  
  // Extract the horizontal position values
  if (position.x) {
    if (position.x.includes('left-')) {
      // Extract left value
      const leftMatch = position.x.match(/left-\[?(\d+(?:\.\d+)?)%\]?/);
      if (leftMatch) {
        styles.left = `${leftMatch[1]}%`;
      } else if (position.x.includes('left-1/2')) {
        styles.left = '50%';
      }
      
      // Check for translateX
      if (position.x.includes('-translate-x-1/2')) {
        transformArray.push({ translateX: '-50%' });
      }
    } else if (position.x.includes('right-')) {
      // Extract right value
      const rightMatch = position.x.match(/right-\[?(\d+(?:\.\d+)?)%\]?/);
      if (rightMatch) {
        styles.right = `${rightMatch[1]}%`;
      } else if (position.x.includes('right-1/2')) {
        styles.right = '50%';
      }
    }
  }
  
  // Extract the vertical position values
  if (position.y) {
    if (position.y.includes('top-')) {
      // Extract top value
      const topMatch = position.y.match(/top-\[?(\d+(?:\.\d+)?)%\]?/);
      if (topMatch) {
        styles.top = `${topMatch[1]}%`;
      } else if (position.y.includes('top-1/2')) {
        styles.top = '50%';
      }
      
      // Check for translateY
      if (position.y.includes('-translate-y-1/2')) {
        transformArray.push({ translateY: '-50%' });
      }
    } else if (position.y.includes('bottom-')) {
      // Extract bottom value
      const bottomMatch = position.y.match(/bottom-\[?(\d+(?:\.\d+)?)%\]?/);
      if (bottomMatch) {
        styles.bottom = `${bottomMatch[1]}%`;
      } else if (position.y.includes('bottom-1/2')) {
        styles.bottom = '50%';
      }
      
      // Check for translateY with positive value (move down)
      if (position.y.includes('translate-y-1/2')) {
        transformArray.push({ translateY: '50%' });
      }
    }
  }
  
  // Add transform array if there are any transforms
  if (transformArray.length > 0) {
    styles.transform = transformArray;
  }
  
  return styles;
};

/**
 * Converts Tailwind container class strings to React Native style objects
 * @param {string} containerClass - Tailwind container class string
 * @returns {Object} React Native style object with container styles
 */
export const getContainerStyles = (containerClass) => {
  if (!containerClass) return {};
  
  const styles = {};
  
  // Handle flex alignment
  if (containerClass.includes('items-center')) {
    styles.alignItems = 'center';
  } else if (containerClass.includes('items-start')) {
    styles.alignItems = 'flex-start';
  } else if (containerClass.includes('items-end')) {
    styles.alignItems = 'flex-end';
  }
  
  // Handle flex justification
  if (containerClass.includes('justify-center')) {
    styles.justifyContent = 'center';
  } else if (containerClass.includes('justify-start')) {
    styles.justifyContent = 'flex-start';
  } else if (containerClass.includes('justify-end')) {
    styles.justifyContent = 'flex-end';
  }
  
  return styles;
};

/**
 * Maps a React position from old PLANET_PATTERNS to the new React Native style format
 * @param {Object} oldPosition - Old position object with x and y properties
 * @returns {Object} New position object with React Native styles
 */
export const mapOldPositionToNew = (oldPosition) => {
  if (!oldPosition) return null;
  
  return {
    position: getPositionStyles(oldPosition)
  };
}; 