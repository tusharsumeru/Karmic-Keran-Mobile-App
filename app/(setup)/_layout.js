import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SetupLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#7765e3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#f8f9fa',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Setup Profile',
            headerShown: false 
          }} 
        />
      </Stack>
    </>
  );
} 