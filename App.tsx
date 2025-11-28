import 'react-native-gesture-handler'; // <--- 1. IMPORT THIS AT THE VERY TOP
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // <--- 2. IMPORT THIS

import AppNavigator from './src/navigation/AppNavigator';
import { initDB } from './src/db/db';
import './global.css';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => {
        console.log('Database initialized successfully');
        setDbReady(true);
      })
      .catch((err) => {
        console.log('Failed to init DB:', err);
        setDbReady(true);
      });
  }, []);

  if (!dbReady) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    // 3. WRAP EVERYTHING IN GESTURE HANDLER ROOT VIEW
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}