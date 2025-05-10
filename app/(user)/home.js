import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function HomeScreen() {
  const navigateTo = (screen) => {
    router.push(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <LinearGradient
          colors={['#FF6F61', '#FF6F61', '#FFA500', '#FF8C00']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.gradient}
        >
          <View style={styles.navigationHeader}>
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="menu-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>Karmic Keran</Text>
        </LinearGradient>
      </View>
      
      <ScrollView style={styles.bottomSection}>
        <Text style={styles.sectionTitle}>Your Dashboard</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={28} color="#FF6F61" />
            <Text style={styles.statValue}>256</Text>
            <Text style={styles.statLabel}>Karma Points</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={28} color="#FF6F61" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Upcoming Sessions</Text>
          </View>
        </View>
        
        <Text style={styles.sectionSubtitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigateTo('book-consulation')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="calendar-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.actionText}>Book Consultation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigateTo('self-discovery')}
          >
            <View style={[styles.actionIcon, {backgroundColor: '#FFA500'}]}>
              <Ionicons name="compass-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.actionText}>Self Discovery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigateTo('ask-question')}
          >
            <View style={[styles.actionIcon, {backgroundColor: '#FF8C00'}]}>
              <Ionicons name="help-circle-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.actionText}>Ask a Question</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionSubtitle}>Your Progress</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: '65%'}]} />
          </View>
          <Text style={styles.progressText}>65% towards next level</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    height: '50%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  navigationHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    zIndex: 10,
  },
  navButton: {
    padding: 8,
  },
  bottomSection: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  quickActions: {
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    backgroundColor: '#FF6F61',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6F61',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
}); 