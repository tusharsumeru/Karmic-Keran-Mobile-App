import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,  // Hide header for all auth screens
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="verify-otp"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
} 