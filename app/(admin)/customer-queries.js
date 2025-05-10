import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import CustomerQueries from '../../components/admin/customer-queries/CustomerQueries';
import { createAuthConfig } from '../../actions/auth';

export default function CustomerQueriesScreen() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      const authConfig = await createAuthConfig();
      setConfig(authConfig);
    };
    
    loadConfig();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Customer Queries' }} />
      
      <ScrollView>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Customer Queries</Text>
          <Text style={styles.headerDescription}>
            View and manage customer astrological queries. Track and respond to questions from users, monitor query status, and provide expert astrological guidance.
          </Text>
        </View>

        {config && <CustomerQueries config={config} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    paddingHorizontal: 16,
  },
}); 