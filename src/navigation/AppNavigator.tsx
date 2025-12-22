import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { checkUserExists } from '../db/db'; // Import helper

import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import TabNavigator from './TabNavigator';
import AddSubjectScreen from '../screens/Subjects/AddSubjectScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { colorScheme } = useColorScheme();
    const [isLoading, setIsLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState('Onboarding');
    
    // Dynamic background color for modals (only AddSubject now uses React Navigation modal)
    const modalBgColor = colorScheme === 'dark' ? '#09090b' : '#f8fafc';

    useEffect(() => {
        checkUserExists()
            .then((exists) => {
                if (exists) setInitialRoute('MainTabs');
                else setInitialRoute('Onboarding');
            })
            .catch((err) => console.log(err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 bg-zinc-50 dark:bg-zinc-950 justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        )
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>

            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="MainTabs" component={TabNavigator} />

            {/* Modals */}
            <Stack.Screen
                name="AddSubject"
                component={AddSubjectScreen}
                options={({ route }) => ({ 
                    presentation: 'modal', 
                    animation: 'slide_from_bottom',
                    animationTypeForReplace: 'push',
                    gestureEnabled: true,
                    gestureDirection: 'vertical',
                    fullScreenGestureEnabled: true,
                    contentStyle: { backgroundColor: modalBgColor }
                })}
            />
        </Stack.Navigator>
    );
}