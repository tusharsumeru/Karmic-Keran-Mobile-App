import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { createAuthConfig } from '../../actions/auth';
import Analytics from '../../components/admin/dashboard/Analytics';
import ActivityChart from '../../components/admin/dashboard/ActivityChart';
import ServiceDistribution from '../../components/admin/dashboard/ServiceDistribution';
import Popular from '../../components/admin/dashboard/Popular';

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthConfig();
  }, []);

  const fetchAuthConfig = async () => {
    try {
      setLoading(true);
      const authConfig = await createAuthConfig();
      
      if (!authConfig.headers.Authorization) {
        // If no auth token, redirect to login
        router.replace('/(auth)/login');
        return;
      }
      
      setConfig(authConfig);
    } catch (error) {
      console.error('Error fetching auth config:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAuthConfig();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerDescription}>
            This is your admin dashboard where you will see overview metrics of your application
          </Text>
        </View>

        {config && (
          <>
            <Analytics config={config} />
            <ActivityChart config={config} />
            
            <View style={styles.gridContainer}>
              <ServiceDistribution config={config} />
              <Popular config={config} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 500,
    paddingHorizontal: 4,
  },
  gridContainer: {
    // For a 2-column layout if needed in the future
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 