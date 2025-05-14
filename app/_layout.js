// import React, { useState, useEffect } from 'react';
// import { Stack,router } from 'expo-router';
// import { Text } from 'react-native';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, View } from 'react-native';
// import * as SplashScreen from 'expo-splash-screen';
// import CustomSplashScreen from '../components/SplashScreen';
// import * as Linking from 'expo-linking'; // ✅ Make sure this is imported

// // Prevent the splash screen from auto-hiding
// SplashScreen.preventAutoHideAsync();

// // Create a client
// const queryClient = new QueryClient();

// export default function Layout() {
//   const [isReady, setIsReady] = useState(false);
//   const [appIsReady, setAppIsReady] = useState(false);

//   useEffect(() => {
//     const handleDeepLink = (event) => {
//       const { url } = event;
//       console.log('Received deep link:', url);
    
//       if (url && url.startsWith('project2://')) {
//         const parsed = Linking.parse(url);
    
//         console.log('Parsed deep link:', parsed);
    
//         const path = parsed.path;
//         const token = parsed.queryParams?.token;
    
//         if (token) {
//           // Optionally store token in global state / AsyncStorage
//           console.log('User token from deep link:', token);
//         }
    
//         // Route to appropriate screen
//         if (path === 'setup') {
//           router.replace('/(setup)');
//         } else if (path === 'user/ask-question') {
//           router.replace('/(user)/ask-question');
//         } else {
//           router.replace('/(tabs)'); // fallback
//         }
//       }
//     };
//     // Add event listener for deep linking
//     Linking.addEventListener('url', handleDeepLink);

//     // Check if the app was opened via deep link
//     Linking.getInitialURL().then((url) => {
//       if (url) {
//         handleDeepLink({ url });
//       }
//     });
//     return () => {
//       Linking.removeAllListeners('url');
//     };
//   }, [router]);

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   useEffect(() => {
//     async function prepare() {
//       try {
//         // Pre-load fonts, make API calls, etc.
//         // Add any required async loading here
//         await new Promise(resolve => setTimeout(resolve, 500));
//       } catch (e) {
//         console.warn(e);
//       } finally {
//         // Tell the application to render
//         setAppIsReady(true);

//         // Hide the native splash screen
//         await SplashScreen.hideAsync();
//       }
//     }

//     prepare();
//   }, []);

//   if (!appIsReady) {
//     return null;
//   }

//   if (!isReady) {
//     return (
//       <CustomSplashScreen onFinish={() => setIsReady(true)} />
//     );
//   }
  
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         <StatusBar style="auto" />
//         <QueryClientProvider client={queryClient}>
//           <Stack
//             screenOptions={{
//               headerShown: false,
//               animation: 'slide_from_right',
//               gestureEnabled: true,
//               presentation: 'card',
//               animationTypeForReplace: 'push',
//             }}
//           >
//             {/* Hide all group-level nav structure elements */}
//             <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//             <Stack.Screen name="(setup)" options={{ headerShown: false }} />
//             <Stack.Screen name="(user)" options={{ headerShown: false }} />
//             <Stack.Screen name="(admin)" options={{ headerShown: false }} />
//             <Stack.Screen name="index" options={{ headerShown: false }} />
//           </Stack>
//         </QueryClientProvider>
//       </View>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// }); 

import React, { useState, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '../components/SplashScreen';
import * as Linking from 'expo-linking';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

export default function Layout() {
  const [isReady, setIsReady] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const handleDeepLink = (event) => {
      const { url } = event;
      console.log('🔗 Received deep link:', url);

      if (url && url.startsWith('project2://')) {
        const parsed = Linking.parse(url);
        console.log('🧠 Parsed deep link:', parsed);

        const path = parsed.path;
        const token = parsed.queryParams?.token;

        if (token) {
          // 🛡️ Store token in AsyncStorage/global state if needed
          console.log('🪪 Deep link token:', token);
        }

        // 🧭 Redirect based on path
        if (path === 'setup') {
          router.replace('/(setup)');
        } else if (path === 'user/ask-question') {
          router.replace('/(user)/ask-question');
        } else {
          router.replace('/(tabs)');
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if the app was opened from a terminated state via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove(); // ✅ Clean up listener
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // preload here if needed
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) return null;

  if (!isReady) {
    return <CustomSplashScreen onFinish={() => setIsReady(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              gestureEnabled: true,
              presentation: 'card',
              animationTypeForReplace: 'push',
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(setup)" />
            <Stack.Screen name="(user)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="index" />
          </Stack>
        </QueryClientProvider>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
