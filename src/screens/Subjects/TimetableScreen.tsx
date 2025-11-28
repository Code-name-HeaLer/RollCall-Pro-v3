import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { X, Plus, MapPin, Clock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TimetableScreen({ navigation }: any) {
    const [selectedDay, setSelectedDay] = useState(1); // Monday default
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950" edges={['top', 'left', 'right']}>
            <View className="flex-1 p-6">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Manage Schedule</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                        <X size={20} className="text-zinc-600 dark:text-zinc-400" />
                    </TouchableOpacity>
                </View>

                {/* Day Selector (Horizontal Scroll) */}
                <View className="h-14 mb-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {DAYS.map((day, index) => (
                            <TouchableOpacity
                                key={day}
                                onPress={() => setSelectedDay(index)}
                                className={`mr-3 px-5 py-2 rounded-full justify-center ${selectedDay === index ? 'bg-indigo-600' : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800'}`}
                            >
                                <Text className={`font-bold ${selectedDay === index ? 'text-white' : 'text-zinc-500'}`}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Class List for Selected Day */}
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Mock Existing Class */}
                    <View className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border-l-4 border-l-indigo-500 border-zinc-100 dark:border-zinc-800 mb-3 shadow-sm">
                        <View className="flex-row justify-between items-start">
                            <View>
                                <Text className="text-lg font-bold text-zinc-900 dark:text-white">Computer Science</Text>
                                <View className="flex-row items-center mt-1">
                                    <Clock size={14} className="text-zinc-400 mr-1" />
                                    <Text className="text-zinc-500 text-xs mr-3">10:00 AM - 11:00 AM</Text>
                                    <MapPin size={14} className="text-zinc-400 mr-1" />
                                    <Text className="text-zinc-500 text-xs">Room 304</Text>
                                </View>
                            </View>
                            <TouchableOpacity>
                                <Text className="text-indigo-600 font-bold text-xs">Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Add Class FAB */}
                <TouchableOpacity
                    onPress={() => setIsAddModalOpen(true)}
                    className="absolute bottom-8 right-6 w-14 h-14 bg-zinc-900 dark:bg-white rounded-full items-center justify-center shadow-xl"
                >
                    <Plus size={24} className="text-white dark:text-zinc-900" />
                </TouchableOpacity>

                {/* --- Internal Modal: Add Class Form --- */}
                <Modal visible={isAddModalOpen} animationType="slide" presentationStyle="pageSheet">
                    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-6">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-xl font-bold text-zinc-900 dark:text-white">Add Class to {DAYS[selectedDay]}</Text>
                            <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                                <Text className="text-indigo-600 font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Mock Subject Selector */}
                        <View className="mb-6">
                            <Text className="text-zinc-500 font-medium mb-2">Subject</Text>
                            <TouchableOpacity className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex-row items-center">
                                <View className="w-3 h-3 rounded-full bg-indigo-500 mr-3" />
                                <Text className="text-zinc-900 dark:text-white font-medium">Select Subject...</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Time Pickers */}
                        <View className="flex-row gap-4 mb-6">
                            <View className="flex-1">
                                <Text className="text-zinc-500 font-medium mb-2">Start Time</Text>
                                <TextInput
                                    placeholder="10:00" placeholderTextColor="#A1A1AA"
                                    className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-zinc-500 font-medium mb-2">End Time</Text>
                                <TextInput
                                    placeholder="11:00" placeholderTextColor="#A1A1AA"
                                    className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                                />
                            </View>
                        </View>

                        {/* Location */}
                        <View className="mb-8">
                            <Text className="text-zinc-500 font-medium mb-2">Location (Optional)</Text>
                            <TextInput
                                placeholder="e.g. Room 304" placeholderTextColor="#A1A1AA"
                                className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                            />
                        </View>

                        <TouchableOpacity className="bg-indigo-600 p-4 rounded-2xl items-center">
                            <Text className="text-white font-bold text-lg">Add to Schedule</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>

            </View>
        </SafeAreaView>
    );
}