import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Bell, Check, X, Ban, Umbrella, Coffee, Clock } from 'lucide-react-native';
import { getUser, getScheduleForDay, TimetableItem, getAttendanceByDate, markAttendance, AttendanceRecord, getSubjectById, Subject } from '../../db/db';
import AttendanceSpinner from '../../components/ui/AttendanceSpinner';

export default function DashboardScreen() {
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const isoDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for DB

    const [userName, setUserName] = useState('Scholar');
    const [todaysClasses, setTodaysClasses] = useState<TimetableItem[]>([]);
    const [attendanceLog, setAttendanceLog] = useState<Record<number, string>>({}); // Map subjectId -> status
    const [subjectStats, setSubjectStats] = useState<Record<number, { total: number, attended: number }>>({}); // Map subjectId -> stats
    const [loading, setLoading] = useState(true);

    // Load Data
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        setLoading(true);
        // 1. User
        const user = await getUser();
        if (user?.name) setUserName(user.name);

        // 2. Schedule
        const todayIndex = new Date().getDay();
        const schedule = await getScheduleForDay(todayIndex);
        setTodaysClasses(schedule);

        // 3. Existing Attendance for Today
        const logs = await getAttendanceByDate(isoDate);
        const logMap: Record<number, string> = {};
        logs.forEach(log => {
            logMap[log.subject_id] = log.status;
        });
        setAttendanceLog(logMap);

        // 4. Fetch Stats for these subjects (for spinners)
        const statsMap: Record<number, { total: number, attended: number }> = {};
        for (const item of schedule) {
            const sub = await getSubjectById(item.subject_id);
            if (sub) {
                statsMap[sub.id] = { total: sub.total_classes, attended: sub.attended_classes };
            }
        }
        setSubjectStats(statsMap);

        setLoading(false);
    };

    const handleMarkAttendance = async (subjectId: number, status: 'present' | 'absent' | 'cancelled' | 'holiday') => {
        // Optimistic Update (UI updates immediately)
        setAttendanceLog(prev => ({ ...prev, [subjectId]: status }));

        // Save to DB
        await markAttendance(subjectId, isoDate, status);

        // Refresh Stats (Spinner)
        const sub = await getSubjectById(subjectId);
        if (sub) {
            setSubjectStats(prev => ({
                ...prev,
                [subjectId]: { total: sub.total_classes, attended: sub.attended_classes }
            }));
        }
    };

    // Helper: Calculate Spinner %
    const getPercentage = (subId: number) => {
        const stats = subjectStats[subId];
        if (!stats || stats.total === 0) return 0;
        return Math.round((stats.attended / stats.total) * 100);
    };

    return (
        <ScreenWrapper>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Header */}
                <View className="flex-row justify-between items-center mb-6 mt-2">
                    <View>
                        <Text className="text-3xl font-bold text-zinc-900 dark:text-white">Hello, {userName}!</Text>
                        <Text className="text-zinc-500 dark:text-zinc-400 font-medium">{currentDate}</Text>
                    </View>
                    <TouchableOpacity className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-700">
                        <Bell size={20} color="#A1A1AA" />
                    </TouchableOpacity>
                </View>

                {/* At A Glance */}
                <View className="flex-row gap-4 mb-8">
                    {/* Logic for overall can be added later, for now static or basic calc */}
                    <View className="flex-1 bg-indigo-600 rounded-3xl p-5 shadow-lg shadow-indigo-500/30">
                        <View className="w-10 h-10 bg-indigo-400/30 rounded-full items-center justify-center mb-3">
                            <Text className="text-white font-bold">All</Text>
                        </View>
                        <Text className="text-white/80 text-sm font-medium">Overview</Text>
                        <Text className="text-white text-3xl font-bold mt-1">
                            {/* Simple average of currently visible subjects */}
                            {Object.keys(subjectStats).length > 0
                                ? Math.round(Object.values(subjectStats).reduce((acc, curr) => acc + (curr.total > 0 ? (curr.attended / curr.total) * 100 : 0), 0) / Object.keys(subjectStats).length) + '%'
                                : '--%'}
                        </Text>
                    </View>

                    <View className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <View className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-3">
                            <Text className="text-zinc-900 dark:text-white font-bold">#</Text>
                        </View>
                        <Text className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Classes Today</Text>
                        <Text className="text-zinc-900 dark:text-white text-3xl font-bold mt-1">{todaysClasses.length}</Text>
                    </View>
                </View>

                {/* Schedule Section */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-zinc-900 dark:text-white">Today's Schedule</Text>
                    <TouchableOpacity className="flex-row items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                        <Text className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mr-1">Extra Class?</Text>
                    </TouchableOpacity>
                </View>

                {/* LIST RENDERING */}
                {loading ? (
                    <ActivityIndicator size="small" color="#4F46E5" />
                ) : todaysClasses.length === 0 ? (
                    <View className="bg-white dark:bg-zinc-900 rounded-3xl p-8 items-center justify-center border border-zinc-100 dark:border-zinc-800 border-dashed">
                        <Coffee size={48} className="text-zinc-300 mb-4" />
                        <Text className="text-zinc-900 dark:text-white font-bold text-lg text-center">No classes today</Text>
                        <Text className="text-zinc-500 text-center mt-1">Enjoy your day off or get ahead on your tasks!</Text>
                    </View>
                ) : (
                    todaysClasses.map((item) => (
                        <SubjectCard
                            key={item.id}
                            subject={item.subject_name}
                            teacher={item.teacher}
                            room={item.location}
                            time={`${item.start_time} - ${item.end_time}`}
                            color={item.subject_color}
                            attendance={getPercentage(item.subject_id)}
                            status={attendanceLog[item.subject_id]} // Pass current status
                            onMark={(status: any) => handleMarkAttendance(item.subject_id, status)}
                        />
                    ))
                )}

            </ScrollView>
        </ScreenWrapper>
    );
}

// Updated "Cool AF" Tinted Card
const SubjectCard = ({ subject, teacher, room, time, color, attendance, status, onMark }: any) => {
    // Spinner Color Logic
    let spinnerColor = 'text-green-500';
    if (attendance < 75) spinnerColor = 'text-orange-500';
    if (attendance < 60) spinnerColor = 'text-red-500';

    return (
        <View
            style={{
                backgroundColor: `${color}20`, // 12% Opacity Background
                borderColor: `${color}40`,     // 25% Opacity Border
            }}
            className="rounded-3xl p-5 mb-4 border"
        >
            <View className="flex-row justify-between">
                <View>
                    {/* Header with Clock Icon */}
                    <View className="flex-row items-center mb-1">
                        <Clock size={14} color={color} style={{ marginRight: 6 }} />
                        <Text
                            style={{ color: color }}
                            className="text-xs font-bold uppercase tracking-wider"
                        >
                            {time}
                        </Text>
                    </View>

                    <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{subject}</Text>
                    <Text className="text-zinc-500 text-sm mb-4">{teacher || 'No Teacher'} • {room || 'No Room'}</Text>
                </View>

                {/* Dynamic Spinner */}
                <AttendanceSpinner percentage={attendance} radius={26} strokeWidth={4} />
            </View>

            {/* Divider (Tinted) */}
            <View style={{ backgroundColor: `${color}30` }} className="h-[1px] w-full my-3" />

            {/* Attendance Buttons */}
            <View className="flex-row justify-between px-2">
                <TouchableOpacity
                    onPress={() => onMark('present')}
                    className={`items-center justify-center w-10 h-10 rounded-full transition-opacity 
                        ${status === 'present' ? 'bg-green-500' : 'bg-white/50 dark:bg-black/20'}
                        ${status && status !== 'present' ? 'opacity-30' : 'opacity-100'} 
                    `}
                >
                    <Check size={20} color={status === 'present' ? 'white' : '#10B981'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onMark('absent')}
                    className={`items-center justify-center w-10 h-10 rounded-full transition-opacity
                        ${status === 'absent' ? 'bg-red-500' : 'bg-white/50 dark:bg-black/20'}
                        ${status && status !== 'absent' ? 'opacity-30' : 'opacity-100'}
                    `}
                >
                    <X size={20} color={status === 'absent' ? 'white' : '#EF4444'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onMark('cancelled')}
                    className={`items-center justify-center w-10 h-10 rounded-full transition-opacity
                        ${status === 'cancelled' ? 'bg-yellow-500' : 'bg-white/50 dark:bg-black/20'}
                        ${status && status !== 'cancelled' ? 'opacity-30' : 'opacity-100'}
                    `}
                >
                    <Ban size={20} color={status === 'cancelled' ? 'white' : '#F59E0B'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onMark('holiday')}
                    className={`items-center justify-center w-10 h-10 rounded-full transition-opacity
                        ${status === 'holiday' ? 'bg-orange-500' : 'bg-white/50 dark:bg-black/20'}
                        ${status && status !== 'holiday' ? 'opacity-30' : 'opacity-100'}
                    `}
                >
                    <Umbrella size={20} color={status === 'holiday' ? 'white' : '#F97316'} />
                </TouchableOpacity>
            </View>
        </View>
    )
}