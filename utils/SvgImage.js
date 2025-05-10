import React from 'react';
import { Image } from 'react-native';

// This component handles SVG images in a way that works with both SVG and regular images
const SvgImage = ({ source, style, ...props }) => {
  // Check if the source is an SVG (imported directly) or a regular image (require)
  const isSvg = typeof source === 'function' || (source && source.default);
  
  if (isSvg) {
    const SvgComponent = source.default || source;
    return <SvgComponent width={style?.width} height={style?.height} {...props} />;
  }
  
  // Fallback to regular Image component for PNG/JPG/etc
  return <Image source={source} style={style} {...props} />;
};

export default SvgImage; 