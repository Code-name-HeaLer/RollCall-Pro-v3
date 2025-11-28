import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Calendar as CalendarIcon, Link } from 'lucide-react-native';

export default function AddTaskScreen({ navigation }: any) {
    return (
        <View className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-6">

            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
                <Text className="text-2xl font-bold text-zinc-900 dark:text-white">New Task</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                    <X size={20} className="text-zinc-600 dark:text-zinc-400" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="space-y-6">

                    {/* Title */}
                    <View>
                        <Text className="text-zinc-500 font-medium mb-2 ml-1">Task Title</Text>
                        <TextInput
                            placeholder="What needs to be done?"
                            placeholderTextColor="#A1A1AA"
                            className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                            autoFocus
                        />
                    </View>

                    {/* Description */}
                    <View>
                        <Text className="text-zinc-500 font-medium mb-2 ml-1">Description (Optional)</Text>
                        <TextInput
                            placeholder="Add details..."
                            placeholderTextColor="#A1A1AA"
                            multiline
                            numberOfLines={3}
                            className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-base text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                            style={{ textAlignVertical: 'top' }}
                        />
                    </View>

                    {/* Mock Subject Link */}
                    <View>
                        <Text className="text-zinc-500 font-medium mb-2 ml-1">Link Subject</Text>
                        <TouchableOpacity className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex-row items-center justify-between">
                            <Text className="text-zinc-400 font-medium">Select a subject...</Text>
                            <Link size={20} className="text-zinc-400" />
                        </TouchableOpacity>
                    </View>

                    {/* Mock Date Picker */}
                    <View>
                        <Text className="text-zinc-500 font-medium mb-2 ml-1">Due Date</Text>
                        <TouchableOpacity className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex-row items-center justify-between">
                            <Text className="text-zinc-900 dark:text-white font-medium">Tomorrow, 10:00 AM</Text>
                            <CalendarIcon size={20} className="text-indigo-500" />
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity className="bg-indigo-600 p-5 rounded-2xl items-center shadow-lg shadow-indigo-500/30 mt-4">
                <Text className="text-white font-bold text-lg">Save Task</Text>
            </TouchableOpacity>
        </View>
    );
}