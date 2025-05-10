import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlaceholderImage({ 
  width = 200, 
  height = 150, 
  backgroundColor = '#e0e0e0',
  text = 'Image',
  textColor = '#888',
  icon = 'image-outline'
}) {
  return (
    <View style={[
      styles.container, 
      { width, height, backgroundColor }
    ]}>
      <Ionicons name={icon} size={width * 0.2} color={`${textColor}50`} style={styles.icon} />
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  icon: {
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 