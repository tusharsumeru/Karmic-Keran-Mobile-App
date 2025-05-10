import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { retrieveDashboardOverviewMetrics } from '../../../actions/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Glass-effect card component for each metric
 */
const GlassMetricCard = ({ label, value, suffix, subLabel, subValue, children }) => (
  <View style={styles.glassCard}>
    {/* Glass card background effects */}
    <View style={styles.glassBackground}></View>
    <View style={styles.glassHoverEffect}></View>
    
    {/* Metric content */}
    <View style={styles.cardContent}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueContainer}>
        <Text style={styles.metricValue}>{value}</Text>
        {suffix && <Text style={styles.metricSuffix}>{suffix}</Text>}
      </View>
      
      {/* Optional sub-section with border */}
      {subLabel && (
        <View style={styles.subSection}>
          <View style={styles.subValueContainer}>
            <Text style={styles.subValueLabel}>{subLabel}:</Text>
            <Text style={styles.subValue}>{subValue}</Text>
          </View>
        </View>
      )}
      
      {/* Optional children content */}
      {children}
    </View>
  </View>
);

/**
 * Main Analytics component with glass-morphism design
 */
const Analytics = ({ config }) => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => retrieveDashboardOverviewMetrics(config),
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#FF6B6B', '#FFB347', '#4169E1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading dashboard metrics...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error || !metrics?.data) {
    return (
      <LinearGradient
        colors={['#FF6B6B', '#FFB347', '#4169E1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#FFFFFF" />
          <Text style={styles.errorText}>
            Failed to load dashboard metrics. Please try again.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const data = metrics.data;

  // Format the time spent value for display
  const formatTimeSpent = () => {
    const totalMinutes = data.total_time_spent;
    if (!totalMinutes) return '0';

    if (totalMinutes < 60) return `${totalMinutes}`;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes > 0
      ? `${hours}.${minutes.toString().padStart(2, '0')}`
      : `${hours}`;
  };

  return (
    <LinearGradient
      colors={['#FF6B6B', '#FFB347', '#4169E1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      {/* Header section with icon and text */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Overview Metrics</Text>
          <Text style={styles.headerSubtitle}>
            Real-time insights for consultations, revenue, and client engagement
          </Text>
        </View>
      </View>

      {/* Metrics grid */}
      <ScrollView 
        contentContainerStyle={styles.metricsGrid}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Consultations */}
        <GlassMetricCard
          label="Total consultations"
          value={data.sessions || '0'}
          suffix="sessions"
        />
        
        {/* Total Revenue */}
        <GlassMetricCard
          label="Total revenue"
          value={`£${data.total_revenue || '0'}`}
          subLabel="Revenue today"
          subValue={`£${data.today_revenue || '0'}`}
        />
        
        {/* Total Hours */}
        <GlassMetricCard
          label="Total time spent"
          value={formatTimeSpent()}
          suffix="hours"
          subLabel="Avg. earnings"
          subValue={`£${data.avg_earnings_per_hour?.toFixed(2) || '0'} /hour`}
        />
        
        {/* Total Clients */}
        <GlassMetricCard
          label="Total clients"
          value={data.total_users || '0'}
          suffix="clients"
          subLabel="New this month"
          subValue={data.new_users_this_month || '0'}
        />
        
        {/* Page Visits */}
        <GlassMetricCard
          label="Landing page visits"
          value={data.landing_page_visits || '0'}
          suffix="today"
        />
        
        {/* App Downloads */}
        <GlassMetricCard
          label="Mobile app downloads"
          value={data.mobile_app_downloads?.total || '0'}
          suffix="total"
        >
          {data.mobile_app_downloads && (
            <View style={styles.subSection}>
              <View style={styles.platformGrid}>
                <View style={styles.platformStat}>
                  <Text style={styles.platformLabel}>ios</Text>
                  <Text style={styles.platformValue}>
                    {data.mobile_app_downloads.ios || '0'}
                  </Text>
                </View>
                <View style={styles.platformStat}>
                  <Text style={styles.platformLabel}>android</Text>
                  <Text style={styles.platformValue}>
                    {data.mobile_app_downloads.android || '0'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </GlassMetricCard>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(12px)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  glassCard: {
    width: '48%',
    minWidth: 150,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 4,
    flex: 1,
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  glassHoverEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    opacity: 0.5,
  },
  cardContent: {
    position: 'relative',
    zIndex: 10,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricSuffix: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  subSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  subValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    padding: 8,
  },
  subValueLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  subValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  platformGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  platformStat: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  platformLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  platformValue: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Analytics; 