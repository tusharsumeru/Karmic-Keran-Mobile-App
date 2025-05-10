import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { retrievePopularServices } from '../../../actions/auth';
import { Ionicons } from '@expo/vector-icons';

/**
 * Component to display the most popular services
 */
const Popular = ({ config }) => {
  const { data: popularData, isLoading, error } = useQuery({
    queryKey: ['popularServices'],
    queryFn: () => retrievePopularServices(config),
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading popular services...</Text>
      </View>
    );
  }

  if (error || !popularData?.data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#f44336" />
        <Text style={styles.errorText}>
          Failed to load popular services. Please try again.
        </Text>
      </View>
    );
  }

  const { mostPopularService, allServices } = popularData.data;

  const renderServiceItem = ({ item, index }) => {
    // Determine the dot color based on position
    let dotColor = '#E0E0E0';  // Default gray for lower positions
    if (index === 0) dotColor = '#FF8A00';  // Orange for 1st place
    else if (index === 1) dotColor = '#9CA3AF';  // Silver for 2nd place
    else if (index === 2) dotColor = '#D1D5DB';  // Bronze for 3rd place
    
    const isPopular = item.serviceName === mostPopularService.name;
    
    return (
      <View style={[
        styles.serviceItem, 
        isPopular && styles.popularServiceItem
      ]}>
        <View style={styles.serviceNameContainer}>
          <View style={[styles.serviceDot, { backgroundColor: dotColor }]} />
          <Text style={styles.serviceName}>{item.serviceName}</Text>
        </View>
        
        <View style={styles.serviceStatsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.bookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.share}</Text>
            <Text style={styles.statLabel}>Share</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {mostPopularService && (
        <View style={styles.popularBanner}>
          <View style={styles.iconContainer}>
            <Ionicons name="star" size={22} color="#FF8A00" />
          </View>
          <View>
            <Text style={styles.popularLabel}>Most Popular Service</Text>
            <Text style={styles.popularName}>{mostPopularService.name}</Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerCell}>SERVICE</Text>
        <Text style={styles.headerCellRight}>BOOKINGS</Text>
        <Text style={styles.headerCellRight}>SHARE</Text>
      </View>

      <FlatList
        data={allServices}
        renderItem={renderServiceItem}
        keyExtractor={(item, index) => `service-${index}`}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  popularBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  iconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  popularLabel: {
    fontSize: 12,
    color: '#795548',
  },
  popularName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8A00',
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  headerCell: {
    flex: 2,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  headerCellRight: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textAlign: 'right',
  },
  listContainer: {
    paddingBottom: 8,
  },
  serviceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  popularServiceItem: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: -4,
  },
  serviceNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  serviceName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  serviceStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statItem: {
    alignItems: 'flex-end',
    marginLeft: 24,
    width: 60,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorText: {
    marginTop: 10,
    color: '#f44336',
    textAlign: 'center',
  },
});

export default Popular; 