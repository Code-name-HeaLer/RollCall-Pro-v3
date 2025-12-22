import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import { X, Calendar as CalendarIcon, Link } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AddTaskModalContentProps {
    onClose: () => void;
}

export default function AddTaskModalContent({ onClose }: AddTaskModalContentProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    const bgColor = isDark ? '#09090b' : '#f8fafc';
    const cardBg = isDark ? '#18181b' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#18181b';
    const borderColor = isDark ? '#27272a' : '#e4e4e7';
    const secondaryTextColor = isDark ? '#a1a1aa' : '#71717a';
    const iconBgColor = isDark ? '#27272a' : '#e4e4e7';
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }} edges={['top', 'left', 'right']}>
            <View className="flex-1 p-6">

            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
                <Text style={{ color: textColor }} className="text-2xl font-bold">New Task</Text>
                <TouchableOpacity 
                    onPress={onClose} 
                    style={{ backgroundColor: iconBgColor }}
                    className="p-2 rounded-full"
                >
                    <X size={20} color={secondaryTextColor} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="space-y-6">

                    {/* Title */}
                    <View>
                        <Text style={{ color: secondaryTextColor }} className="font-medium mb-2 ml-1">Task Title</Text>
                        <TextInput
                            placeholder="What needs to be done?"
                            placeholderTextColor="#A1A1AA"
                            style={{
                                backgroundColor: cardBg,
                                color: textColor,
                                borderColor: borderColor,
                            }}
                            className="p-4 rounded-2xl text-lg border"
                            autoFocus
                        />
                    </View>

                    {/* Description */}
                    <View>
                        <Text style={{ color: secondaryTextColor }} className="font-medium mb-2 ml-1">Description (Optional)</Text>
                        <TextInput
                            placeholder="Add details..."
                            placeholderTextColor="#A1A1AA"
                            multiline
                            numberOfLines={3}
                            style={{
                                backgroundColor: cardBg,
                                color: textColor,
                                borderColor: borderColor,
                                textAlignVertical: 'top',
                            }}
                            className="p-4 rounded-2xl text-base border"
                        />
                    </View>

                    {/* Mock Subject Link */}
                    <View>
                        <Text style={{ color: secondaryTextColor }} className="font-medium mb-2 ml-1">Link Subject</Text>
                        <TouchableOpacity 
                            style={{
                                backgroundColor: cardBg,
                                borderColor: borderColor,
                            }}
                            className="p-4 rounded-2xl border flex-row items-center justify-between"
                        >
                            <Text style={{ color: secondaryTextColor }} className="font-medium">Select a subject...</Text>
                            <Link size={20} color={secondaryTextColor} />
                        </TouchableOpacity>
                    </View>

                    {/* Mock Date Picker */}
                    <View>
                        <Text style={{ color: secondaryTextColor }} className="font-medium mb-2 ml-1">Due Date</Text>
                        <TouchableOpacity 
                            style={{
                                backgroundColor: cardBg,
                                borderColor: borderColor,
                            }}
                            className="p-4 rounded-2xl border flex-row items-center justify-between"
                        >
                            <Text style={{ color: textColor }} className="font-medium">Tomorrow, 10:00 AM</Text>
                            <CalendarIcon size={20} color="#6366f1" />
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity className="bg-indigo-600 p-5 rounded-2xl items-center shadow-lg shadow-indigo-500/30 mt-4">
                <Text className="text-white font-bold text-lg">Save Task</Text>
            </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

