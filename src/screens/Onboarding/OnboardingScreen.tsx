import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutLeft, FadeInRight } from 'react-native-reanimated';
import { ArrowRight, Check } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
// ... imports
import { createUser } from '../../db/db'; // Import this

export default function OnboardingScreen({ navigation }: any) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#09090b' : '#f8fafc';
    const textColor = isDark ? '#ffffff' : '#18181b';
    const secondaryTextColor = isDark ? '#a1a1aa' : '#71717a';
    const borderColor = isDark ? '#27272a' : '#e4e4e7';

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
        <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-center px-8"
            >

                {/* --- Step 1: Name --- */}
                {step === 1 && (
                    <Animated.View entering={FadeInDown.duration(600)} exiting={FadeOutLeft.duration(400)}>
                        <Text style={{ color: secondaryTextColor }} className="font-medium mb-4 text-lg">Let's get started.</Text>
                        <Text style={{ color: textColor }} className="text-4xl font-bold mb-8 leading-tight">
                            What should I {'\n'}call you?
                        </Text>

                        <TextInput
                            placeholder="Your Name"
                            placeholderTextColor="#A1A1AA"
                            value={name}
                            onChangeText={setName}
                            autoFocus
                            style={{
                                fontSize: 24,
                                fontWeight: '700',
                                color: '#4F46E5',
                                borderBottomWidth: 2,
                                borderBottomColor: borderColor,
                                paddingBottom: 8,
                                marginBottom: 24,
                            }}
                        />

                        <TouchableOpacity
                            onPress={handleNext}
                            style={{
                                alignSelf: 'flex-start',
                                backgroundColor: isDark ? '#ffffff' : '#09090b',
                                width: 64,
                                height: 64,
                                borderRadius: 999,
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: '#000',
                                shadowOpacity: 0.1,
                                shadowRadius: 10,
                            }}
                        >
                            <ArrowRight size={28} color={isDark ? '#09090b' : '#ffffff'} />
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* --- Step 2: Goals --- */}
                {step === 2 && (
                    <Animated.View entering={FadeInRight.duration(600)}>
                        <Text style={{ color: secondaryTextColor }} className="font-medium mb-4 text-lg">Nice to meet you, {name}.</Text>
                        <Text style={{ color: textColor }} className="text-4xl font-bold mb-8 leading-tight">
                            What's the minimum attendance you need?
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: borderColor, paddingBottom: 8, marginBottom: 48, width: '50%' }}>
                            <TextInput
                                placeholder="75"
                                placeholderTextColor="#A1A1AA"
                                keyboardType="number-pad"
                                value={attendance}
                                onChangeText={setAttendance}
                                autoFocus
                                style={{ fontSize: 24, fontWeight: '700', color: '#4F46E5', flex: 1 }}
                            />
                            <Text style={{ fontSize: 24, fontWeight: '700', color: '#9CA3AF' }}>%</Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleNext}
                            style={{ alignSelf: 'flex-start', backgroundColor: '#4F46E5', borderRadius: 999, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', shadowColor: '#4F46E5', shadowOpacity: 0.25, shadowRadius: 10 }}
                        >
                            <Check size={28} color="white" />
                        </TouchableOpacity>
                    </Animated.View>
                )}

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}