import React from 'react';
import { Redirect } from 'expo-router';

// Skip landing page and redirect directly to sign-in
export default function Index() {
  return <Redirect href="/(auth)/sign-in" />;
} 