import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, View } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function UserLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#FF4F4F',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          borderTopWidth: 1,
          borderTopColor: '#eee',
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          paddingHorizontal: 10, // Even padding on both sides
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1, // Each tab takes equal space
          maxWidth: screenWidth / 6, // Evenly distribute across screen
        },
        headerShown: false,
        tabBarIconStyle: {
          width: 24,
          height: 24,
        },
        lazy: true,
        contentStyle: {
          width: '100%',
        },
      })}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="book-consulation"
        options={{
          title: 'Book',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-consulatation"
        options={{
          title: 'Consults',
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="self-discovery"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Ionicons name="compass" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ask-question"
        options={{
          title: 'Ask',
          tabBarIcon: ({ color }) => <Ionicons name="help-circle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="user-menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Ionicons name="menu" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide this tab from the tab bar
        }}
      />
      <Tabs.Screen
        name="queries"
        options={{
          href: null, // Hide this tab from the tab bar
        }}
      />
      <Tabs.Screen
        name="consultation-chart"
        options={{
          href: null, // Hide this tab from the tab bar
        }}
      />
      <Tabs.Screen
        name="consultation-details"
        options={{
          href: null, // Hide this tab from the tab bar
        }}
      />
    </Tabs>
  );
} 