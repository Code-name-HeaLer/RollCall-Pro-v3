import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Bell, Check, X, Ban, Umbrella, MoreHorizontal } from 'lucide-react-native';
import { useState, useEffect } from 'react'; // Add hooks
import { useIsFocused } from '@react-navigation/native'; // To refresh when tab is active
import { getUser } from '../../db/db'; // Import helper



export default function DashboardScreen() {
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    // State for user name
    const [userName, setUserName] = useState('Scholar');
    const isFocused = useIsFocused();

    // Fetch User
    useEffect(() => {
        if (isFocused) {
            getUser().then(user => {
                if (user && user.name) setUserName(user.name);
            });
        }
    }, [isFocused]);

    return (
        <ScreenWrapper>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* --- Header --- */}
                <View className="flex-row justify-between items-center mb-6 mt-2">
                    <View>
                        <Text className="text-3xl font-bold text-zinc-900 dark:text-white">Hello, {userName}</Text>
                        <Text className="text-zinc-500 dark:text-zinc-400 font-medium">{currentDate}</Text>
                    </View>
                    <TouchableOpacity className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-700">
                        <Bell size={20} color="#A1A1AA" />
                    </TouchableOpacity>
                </View>

                {/* --- At A Glance --- */}
                <View className="flex-row gap-4 mb-8">
                    {/* Overall Attendance Box */}
                    <View className="flex-1 bg-indigo-600 rounded-3xl p-5 shadow-lg shadow-indigo-500/30">
                        <View className="w-10 h-10 bg-indigo-400/30 rounded-full items-center justify-center mb-3">
                            <Text className="text-white font-bold">All</Text>
                        </View>
                        <Text className="text-white/80 text-sm font-medium">Overall Attendance</Text>
                        <Text className="text-white text-3xl font-bold mt-1">85%</Text>
                    </View>

                    {/* Classes Today Box */}
                    <View className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <View className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-3">
                            <Text className="text-zinc-900 dark:text-white font-bold">#</Text>
                        </View>
                        <Text className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Classes Today</Text>
                        <Text className="text-zinc-900 dark:text-white text-3xl font-bold mt-1">4</Text>
                    </View>
                </View>

                {/* --- Today's Schedule Label --- */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-zinc-900 dark:text-white">Today's Schedule</Text>
                    <TouchableOpacity className="flex-row items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                        <Text className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mr-1">Extra Class?</Text>
                    </TouchableOpacity>
                </View>

                {/* --- Subject Card (MOCK) --- */}
                {/* Card 1: Computer Science */}
                <SubjectCard
                    subject="Computer Science"
                    teacher="Dr. Smith"
                    room="Room 304"
                    time="10:00 AM - 11:00 AM"
                    color="#F43F5E" // Rose-500
                    attendance={72}
                />

                {/* Card 2: Mathematics */}
                <SubjectCard
                    subject="Mathematics"
                    teacher="Prof. Johnson"
                    room="Hall B"
                    time="11:30 AM - 12:30 PM"
                    color="#3B82F6" // Blue-500
                    attendance={89}
                />

                {/* Card 3: Physics (Low Attendance) */}
                <SubjectCard
                    subject="Physics"
                    teacher="Mr. Tesla"
                    room="Lab 2"
                    time="02:00 PM - 03:30 PM"
                    color="#10B981" // Emerald-500
                    attendance={45}
                />

            </ScrollView>
        </ScreenWrapper>
    );
}

// --- Local Component: Subject Card (We will move this to its own file later) ---
const SubjectCard = ({ subject, teacher, room, time, color, attendance }: any) => {
    // Color Logic for Spinner
    let spinnerColor = 'text-green-500';
    if (attendance < 75) spinnerColor = 'text-orange-500';
    if (attendance < 50) spinnerColor = 'text-red-500';

    return (
        <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5 mb-4 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <View className="flex-row justify-between">
                {/* Left Side: Info */}
                <View>
                    <View className="flex-row items-center mb-1">
                        <View style={{ backgroundColor: color }} className="w-2 h-2 rounded-full mr-2" />
                        <Text className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{time}</Text>
                    </View>
                    <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{subject}</Text>
                    <Text className="text-zinc-500 text-sm mb-4">{teacher} • {room}</Text>
                </View>

                {/* Right Side: Spinner Mock */}
                <View className="items-center justify-center w-14 h-14 rounded-full border-4 border-zinc-100 dark:border-zinc-800">
                    <Text className={`text-xs font-bold ${spinnerColor}`}>{attendance}%</Text>
                </View>
            </View>

            {/* Divider */}
            <View className="h-[1px] bg-zinc-100 dark:bg-zinc-800 w-full my-3" />

            {/* Action Buttons */}
            <View className="flex-row justify-between px-2">
                <TouchableOpacity className="items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Check size={20} color="#10B981" />
                </TouchableOpacity>

                <TouchableOpacity className="items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <X size={20} color="#EF4444" />
                </TouchableOpacity>

                <TouchableOpacity className="items-center justify-center w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                    <Ban size={20} color="#F59E0B" />
                </TouchableOpacity>

                <TouchableOpacity className="items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                    <Umbrella size={20} color="#F97316" />
                </TouchableOpacity>
            </View>
        </View>
    )
}