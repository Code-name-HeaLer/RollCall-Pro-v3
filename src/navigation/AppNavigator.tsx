import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { checkUserExists } from '../db/db';

import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import TabNavigator from './TabNavigator';
import AddSubjectScreen from '../screens/Subjects/AddSubjectScreen';
import TimetableScreen from '../screens/Subjects/TimetableScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const [isLoading, setIsLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState('Onboarding');

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
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
                name="Timetable"
                component={TimetableScreen}
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />

        </Stack.Navigator>
    );
}