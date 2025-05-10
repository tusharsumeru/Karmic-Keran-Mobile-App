import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { retrieveConsultationsByService } from '../../../actions/auth';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get("window").width - 40; // accounting for padding

/**
 * Component to display the service distribution using a pie chart
 */
const ServiceDistribution = ({ config }) => {
  const { data: serviceData, isLoading, error } = useQuery({
    queryKey: ['consultationsByService'],
    queryFn: () => retrieveConsultationsByService(config),
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading service data...</Text>
      </View>
    );
  }

  if (error || !serviceData?.data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#f44336" />
        <Text style={styles.errorText}>
          Failed to load service distribution. Please try again.
        </Text>
      </View>
    );
  }

  // Generate colors for the pie chart
  const generateChartColors = () => {
    const colors = [
      '#2196F3', // blue
      '#4CAF50', // green
      '#FF9800', // orange
      '#9C27B0', // purple
      '#F44336', // red
      '#00BCD4', // cyan
      '#FFEB3B', // yellow
      '#795548', // brown
      '#607D8B', // blue-grey
      '#009688', // teal
    ];

    return colors;
  };

  // Format data for the pie chart
  const formatChartData = () => {
    if (!serviceData.data || serviceData.data.length === 0) {
      return [{
        name: 'No Data',
        count: 1,
        color: '#CCCCCC',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      }];
    }

    const colors = generateChartColors();
    return serviceData.data.map((service, index) => ({
      name: service.serviceName.length > 20 
        ? service.serviceName.substring(0, 17) + '...' 
        : service.serviceName,
      count: service.count,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
  };

  const chartData = formatChartData();

  // Calculate totals
  const totalConsultations = serviceData.data?.reduce((sum, service) => sum + service.count, 0) || 0;
  const totalRevenue = serviceData.data?.reduce((sum, service) => sum + service.totalRevenue, 0) || 0;

  // Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="pie-chart-outline" size={20} color="#333" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Service Distribution</Text>
          <Text style={styles.subtitle}>Consultations by Service Type</Text>
        </View>
      </View>

      <View style={styles.totalContainer}>
        <View style={styles.totalItem}>
          <Text style={styles.totalValue}>{totalConsultations}</Text>
          <Text style={styles.totalLabel}>Total Consultations</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={styles.totalValue}>£{totalRevenue}</Text>
          <Text style={styles.totalLabel}>Total Revenue</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="10"
          hasLegend={false}
          center={[screenWidth / 6, 0]}
          absolute
        />
      </View>

      <ScrollView style={styles.legendContainer}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendName}>{item.name}</Text>
              <View style={styles.legendStatsContainer}>
                <Text style={styles.legendStat}>{item.count} bookings</Text>
                <Text style={styles.legendStat}>
                  {serviceData.data[index] ? `£${serviceData.data[index].totalRevenue}` : ''}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerTextContainer: {
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalItem: {
    alignItems: 'center',
    flex: 1,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legendContainer: {
    maxHeight: 160,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  legendStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  legendStat: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
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
    minHeight: 300,
  },
  errorText: {
    marginTop: 10,
    color: '#f44336',
    textAlign: 'center',
  },
});

export default ServiceDistribution; 