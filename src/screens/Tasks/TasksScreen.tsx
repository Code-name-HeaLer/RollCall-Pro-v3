import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Plus, CheckCircle2, Circle } from 'lucide-react-native';

export default function TasksScreen({ navigation }: any) {
    const [tab, setTab] = useState<'active' | 'done'>('active');

    return (
        <ScreenWrapper>
            <View className="flex-row justify-between items-center mb-6 mt-2">
                <Text className="text-3xl font-bold text-zinc-900 dark:text-white">Tasks</Text>
                <TouchableOpacity
                    className="w-10 h-10 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-500/30"
                    onPress={() => navigation.navigate('AddTask' as never)}
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-6">
                <TouchableOpacity
                    onPress={() => setTab('active')}
                    className={`flex-1 py-2 items-center rounded-lg ${tab === 'active' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}
                >
                    <Text className={`font-bold ${tab === 'active' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>To Do</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setTab('done')}
                    className={`flex-1 py-2 items-center rounded-lg ${tab === 'done' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}
                >
                    <Text className={`font-bold ${tab === 'done' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>Completed</Text>
                </TouchableOpacity>
            </View>

            {/* Task List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {tab === 'active' ? (
                    <>
                        <TaskItem title="Submit CS Assignment" subject="Computer Science" due="Due in 5h" isUrgent />
                        <TaskItem title="Prepare for Math Quiz" subject="Mathematics" due="Due Tomorrow" />
                        <TaskItem title="Read History Chapter 4" subject="History" due="Due Oct 30" />
                    </>
                ) : (
                    <>
                        <TaskItem title="Physics Lab Report" subject="Physics" due="Completed" isDone />
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

// Local Component for Task Item
const TaskItem = ({ title, subject, due, isUrgent, isDone }: any) => (
    <View className="flex-row items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl mb-3 border border-zinc-100 dark:border-zinc-800">
        <TouchableOpacity className="mr-4">
            {isDone ? <CheckCircle2 size={24} color="#6366F1" /> : <Circle size={24} color="#D4D4D8" />}
        </TouchableOpacity>
        <View className="flex-1">
            <Text className={`text-base font-bold ${isDone ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-white'}`}>{title}</Text>
            <Text className="text-xs text-zinc-500 mt-0.5">{subject}</Text>
        </View>
        <View className={`px-2 py-1 rounded-md ${isUrgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
            <Text className={`text-xs font-bold ${isUrgent ? 'text-red-600' : 'text-zinc-500'}`}>{due}</Text>
        </View>
    </View>
);