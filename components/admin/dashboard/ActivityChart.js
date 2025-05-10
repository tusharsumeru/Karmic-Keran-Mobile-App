import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { retrieveDashboardMetricsByDateRange } from '../../../actions/auth';
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get("window").width - 40; // accounting for padding

/**
 * Chart component for displaying registrations and consultations over time
 */
const ActivityChart = ({ config }) => {
  const [timeRange, setTimeRange] = useState('30d');
  
  const { data: metricsData, isLoading, error } = useQuery({
    queryKey: ['dashboardTimeMetrics', timeRange],
    queryFn: () => retrieveDashboardMetricsByDateRange(config, timeRange),
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading activity data...</Text>
      </View>
    );
  }

  if (error || !metricsData?.data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#f44336" />
        <Text style={styles.errorText}>
          Failed to load activity data. Please try again.
        </Text>
      </View>
    );
  }

  // Format data for the chart
  const formatChartData = () => {
    const data = metricsData.data;
    
    if (!data.registrations || !data.consultations || 
        data.registrations.length === 0 || data.consultations.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          { data: [0], color: () => '#ccc' },
          { data: [0], color: () => '#ccc' }
        ]
      };
    }

    // Take every nth label to avoid overcrowding
    const skipFactor = data.registrations.length > 15 ? 
      Math.ceil(data.registrations.length / 8) : 1;
    
    const labels = data.registrations.map((item, index) => {
      // Only display labels for every nth item
      if (index % skipFactor === 0) {
        const date = new Date(item._id);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      return '';
    });
    
    const registrationsData = data.registrations.map(item => item.count);
    const consultationsData = data.consultations.map(item => item.count);

    return {
      labels,
      datasets: [
        {
          data: registrationsData,
          color: () => 'rgba(33, 150, 243, 0.8)', // blue
          strokeWidth: 2
        },
        {
          data: consultationsData,
          color: () => 'rgba(76, 175, 80, 0.8)', // green
          strokeWidth: 2
        }
      ]
    };
  };

  const chartData = formatChartData();

  // Chart configuration
  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "4",
      strokeWidth: "1",
      stroke: "#ffffff"
    },
    propsForLabels: {
      fontSize: 10
    }
  };

  // Range selector buttons
  const rangeOptions = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Activity Overview</Text>
          <Text style={styles.subtitle}>
            Registrations and consultations over time
          </Text>
        </View>
        
        <View style={styles.rangeSelector}>
          {rangeOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.rangeButton,
                timeRange === option.value && styles.activeRangeButton
              ]}
              onPress={() => setTimeRange(option.value)}
            >
              <Text 
                style={[
                  styles.rangeButtonText,
                  timeRange === option.value && styles.activeRangeButtonText
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          fromZero
          withShadow={false}
          withInnerLines={false}
          withOuterLines={true}
          withVerticalLines={false}
          yAxisInterval={1}
          style={styles.chart}
        />
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(33, 150, 243, 0.8)' }]} />
          <Text style={styles.legendText}>Registrations</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(76, 175, 80, 0.8)' }]} />
          <Text style={styles.legendText}>Consultations</Text>
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  rangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeRangeButton: {
    backgroundColor: '#2196F3',
  },
  rangeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeRangeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
    marginTop: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
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
    minHeight: 250,
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
    minHeight: 250,
  },
  errorText: {
    marginTop: 10,
    color: '#f44336',
    textAlign: 'center',
  },
});

export default ActivityChart; 