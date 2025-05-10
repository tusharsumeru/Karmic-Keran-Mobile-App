import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const remedies = [
  {
    title: "Spiritual Practices",
    description: "Chant 'Om Sham Shanicharaya Namah' or play calming mantra music",
    note: "108 times daily for best results"
  },
  {
    title: "Saturday Observances",
    description: "Fast or maintain dietary discipline on Saturdays",
    note: "Avoid processed foods and maintain simplicity"
  },
  {
    title: "Charitable Acts",
    description: "Help those in need, especially the elderly and underprivileged",
    note: "Service to others lightens karmic burden"
  },
  {
    title: "Meditation Practice",
    description: "Regular meditation and mindfulness practices",
    note: "Even 10-15 minutes daily can make a difference"
  },
  {
    title: "Physical Discipline",
    description: "Regular exercise, yoga, or pranayama",
    note: "Helps maintain physical and mental balance"
  },
  {
    title: "Lifestyle Adjustments",
    description: "Maintain a structured daily routine and practice minimalism",
    note: "Saturn favors discipline and simplicity"
  },
  {
    title: "Environmental Practices",
    description: "Spend time in nature, practice grounding exercises",
    note: "Connects you with Earth's stabilizing energy"
  },
  {
    title: "Mental Discipline",
    description: "Practice patience, avoid impulsive decisions",
    note: "Saturn teaches through deliberate action"
  },
  {
    title: "Self-Reflection",
    description: "Maintain a journal, practice introspection",
    note: "Understanding patterns leads to growth"
  },
  {
    title: "Professional Focus",
    description: "Work diligently, take on responsibilities",
    note: "Saturn rewards sincere effort"
  },
  {
    title: "Relationship Care",
    description: "Honor elders, maintain healthy boundaries",
    note: "Respect and responsibility in relationships"
  }
];

const RemediesSection = () => {
  const renderRemedyItem = ({ item }) => (
    <View style={styles.remedyCard}>
      <Text style={styles.remedyTitle}>{item.title}</Text>
      <Text style={styles.remedyDescription}>{item.description}</Text>
      <Text style={styles.remedyNote}>{item.note}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Remedies & Practices</Text>
        <Text style={styles.subtitle}>
          These practices can help harmonize Saturn's influence during Sade Sati
        </Text>
      </View>

      <FlatList
        data={remedies}
        keyExtractor={(item, index) => `remedy-${index}`}
        renderItem={renderRemedyItem}
        numColumns={1}
        contentContainerStyle={styles.remediesGrid}
      />

      <View style={styles.conclusionCard}>
        <Text style={styles.conclusionText}>
          Sade Sati is a period of transformation and growth. While these remedies can help,
          the most important aspects are maintaining a positive attitude, accepting responsibilities,
          and viewing challenges as opportunities for spiritual evolution.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  remediesGrid: {
    paddingBottom: 16,
  },
  remedyCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  remedyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  remedyDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  remedyNote: {
    fontSize: 12,
    color: '#94a3b8',
  },
  conclusionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  conclusionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  }
});

export default RemediesSection; 