import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutLeft, FadeInRight } from 'react-native-reanimated';
import { ArrowRight, Check } from 'lucide-react-native';
// ... imports
import { createUser } from '../../db/db'; // Import this

export default function OnboardingScreen({ navigation }: any) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [attendance, setAttendance] = useState('');

    const handleNext = async () => {
        if (step === 1 && name.length > 0) {
            setStep(2);
        } else if (step === 2 && attendance.length > 0) {
            try {
                // Save to SQLite
                await createUser(name, parseInt(attendance));
                // Navigate to App
                navigation.replace('MainTabs');
            } catch (e) {
                console.error("Failed to save user", e);
            }
        }
    };


    return (
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-center px-8"
            >

                {/* --- Step 1: Name --- */}
                {step === 1 && (
                    <Animated.View entering={FadeInDown.duration(600)} exiting={FadeOutLeft.duration(400)}>
                        <Text className="text-zinc-400 font-medium mb-4 text-lg">Let's get started.</Text>
                        <Text className="text-4xl font-bold text-zinc-900 dark:text-white mb-8 leading-tight">
                            What should I {'\n'}call you?
                        </Text>

                        <TextInput
                            className="text-3xl font-bold text-indigo-600 border-b-2 border-zinc-200 dark:border-zinc-800 pb-2 mb-12"
                            placeholder="Your Name"
                            placeholderTextColor="#A1A1AA"
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />

                        <TouchableOpacity
                            onPress={handleNext}
                            className="self-start bg-zinc-900 dark:bg-white rounded-full w-16 h-16 items-center justify-center shadow-lg"
                        >
                            <ArrowRight size={28} className="text-white dark:text-zinc-900" />
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* --- Step 2: Goals --- */}
                {step === 2 && (
                    <Animated.View entering={FadeInRight.duration(600)}>
                        <Text className="text-zinc-400 font-medium mb-4 text-lg">Nice to meet you, {name}.</Text>
                        <Text className="text-4xl font-bold text-zinc-900 dark:text-white mb-8 leading-tight">
                            What's the minimum attendance you need?
                        </Text>

                        <View className="flex-row items-center border-b-2 border-zinc-200 dark:border-zinc-800 pb-2 mb-12 w-1/2">
                            <TextInput
                                className="text-3xl font-bold text-indigo-600 flex-1"
                                placeholder="75"
                                placeholderTextColor="#A1A1AA"
                                keyboardType="number-pad"
                                value={attendance}
                                onChangeText={setAttendance}
                                autoFocus
                            />
                            <Text className="text-3xl font-bold text-zinc-300">%</Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleNext}
                            className="self-start bg-indigo-600 rounded-full w-16 h-16 items-center justify-center shadow-lg shadow-indigo-500/30"
                        >
                            <Check size={28} color="white" />
                        </TouchableOpacity>
                    </Animated.View>
                )}

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}