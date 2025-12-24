import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'nativewind';
import * as Notifications from 'expo-notifications';

import AppNavigator from './src/navigation/AppNavigator';
import { initDB, getUser } from './src/db/db';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  // Get the current theme state
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    const setup = async () => {
      try {
        await initDB();

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permissions not granted');
        }

        const user = await getUser();
        if (user?.theme_pref && user.theme_pref !== 'system') {
          setColorScheme(user.theme_pref as 'light' | 'dark');
        }
      } catch (e) {
        console.log('Setup Error:', e);
      } finally {
        setDbReady(true);
      }
    };

    setup();
  }, []);

  if (!dbReady) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Custom theme to prevent white flash during modal transitions
  const navigationTheme = colorScheme === 'dark'
    ? {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: '#09090b', // zinc-950
        card: '#09090b', // zinc-950
      },
    }
    : {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: '#f8fafc', // zinc-50
        card: '#f8fafc', // zinc-50
      },
    };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ backgroundColor: colorScheme === 'dark' ? '#09090b' : '#f8fafc' }}>
        <NavigationContainer theme={navigationTheme}>
          {/* DYNAMIC STATUS BAR */}
          <StatusBar
            // If Dark Mode -> Text is White ('light'). If Light Mode -> Text is Black ('dark')
            style={colorScheme === 'dark' ? 'light' : 'dark'}

            // Android Only: Match the background color (Zinc-950 vs Zinc-50)
            backgroundColor={colorScheme === 'dark' ? '#09090b' : '#f8fafc'}
          />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}