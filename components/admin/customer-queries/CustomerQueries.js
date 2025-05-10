import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { retrieveQueries, calculateBirthChart } from '../../../actions/auth';
import { Ionicons } from '@expo/vector-icons';
import QueryItem from './QueryItem';
import DateRangeFilter from './DateRangeFilter';
import { useRouter } from 'expo-router';

const CustomerQueries = ({ config }) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: queriesData, isLoading, refetch } = useQuery({
    queryKey: ['customerQueries'],
    queryFn: () => retrieveQueries(config),
    refetchOnWindowFocus: false
  });

  const queries = queriesData?.data || [];

  // Filter queries based on search text and date range
  const filteredQueries = queries.filter((item) => {
    // Search filter
    const matchesSearch =
      (item?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item?.question?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item?.category?.toLowerCase() || '').includes(search.toLowerCase());

    // Date filter
    let matchesDate = true;
    if (dateRange.from && dateRange.to && item?.createdAt) {
      const queryDate = new Date(item.createdAt);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      matchesDate = queryDate >= fromDate && queryDate <= toDate;
    }

    return matchesSearch && matchesDate;
  });

  // Parse place of birth for kundali calculation
  const parsePlaceOfBirth = (placeOfBirth = '') => {
    const parts = placeOfBirth
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    let city = '';
    let state = '';
    let country = '';

    if (parts.length >= 2) {
      country = parts[parts.length - 1]; // last part is always country
      const possibleState = parts[parts.length - 2];

      // Check if possibleState is a number (e.g., postal code)
      const isPinCode = /^\d{4,6}$/.test(possibleState);

      if (isPinCode) {
        state = parts[parts.length - 3] || '';
      } else {
        state = possibleState;
      }

      city = parts[0]; // assume city is the first item
      if (!state) state = city; // fallback
    } else if (parts.length === 1) {
      city = parts[0];
      state = parts[0];
      country = 'Unknown';
    }

    return { city, state, country };
  };

  // Handle calculating and viewing birth chart
  const handleViewBirthChart = async (item) => {
    setLoading(true);
    
    try {
      const { city, state, country } = parsePlaceOfBirth(item.place_of_birth);
      
      const result = await calculateBirthChart(
        config,
        item.name,
        item.gender,
        item.date_of_birth,
        item.time_of_birth,
        city,
        state,
        country
      );

      if (result.status === 200 && result.data?._id) {
        router.push(`/(admin)/birth-chart/${result.data._id}`);
      } else {
        console.error('Failed to calculate birth chart:', result.message);
        // You would typically show an alert or toast here
      }
    } catch (error) {
      console.error('Error calculating birth chart:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Function to handle query answered - invalidate and refetch queries
  const handleQueryAnswered = async () => {
    await queryClient.invalidateQueries(['customerQueries']);
    await refetch();
  };

  const toggleDateFilter = () => {
    setFilterVisible(!filterVisible);
  };

  const clearFilters = () => {
    setSearch('');
    setDateRange({ from: null, to: null });
  };

  const renderHeader = () => (
    <View style={styles.searchCard}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search queries..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
          {search ? (
            <TouchableOpacity style={styles.iconButton} onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      <View style={styles.filterRow}>
        <View style={styles.filterInfo}>
          {(dateRange.from && dateRange.to) ? (
            <Text style={styles.filterText}>
              Filtered: {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
            </Text>
          ) : (
            <Text style={styles.filterText}>No date filters applied</Text>
          )}
        </View>
        <View style={styles.filterButtons}>
          <TouchableOpacity 
            style={[styles.filterButton, filterVisible && styles.activeFilterButton]} 
            onPress={toggleDateFilter}
          >
            <Ionicons name="calendar" size={20} color={filterVisible ? "#2196F3" : "#666"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={clearFilters}
          >
            <Ionicons name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      {filterVisible && (
        <View style={styles.dateFilterContainer}>
          <DateRangeFilter 
            dateRange={dateRange} 
            setDateRange={setDateRange} 
          />
        </View>
      )}
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryNumber}>{queries.length}</Text>
        <Text style={styles.summaryLabel}>Total</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryNumber}>{queries.filter(q => !q.answer).length}</Text>
        <Text style={styles.summaryLabel}>Pending</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryNumber}>{queries.filter(q => !!q.answer).length}</Text>
        <Text style={styles.summaryLabel}>Answered</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading queries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredQueries}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <QueryItem 
            item={item} 
            config={config}
            onViewBirthChart={() => handleViewBirthChart(item)}
            loading={loading}
            onQueryAnswered={handleQueryAnswered}
          />
        )}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderSummary()}
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                Customer Queries {filteredQueries.length > 0 ? `(${filteredQueries.length})` : ''}
              </Text>
            </View>
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No queries found</Text>
            <Text style={styles.emptySubtext}>
              {search || (dateRange.from && dateRange.to) 
                ? "Try adjusting your filters" 
                : "Customer queries will appear here"}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#333',
  },
  iconButton: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  filterInfo: {
    flex: 1,
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginLeft: 8,
  },
  activeFilterButton: {
    backgroundColor: '#e6f4ff',
  },
  dateFilterContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#f0f0f0',
    alignSelf: 'center',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  }
});

export default CustomerQueries; 