import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput, Platform, Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Bell, Check, X, Ban, Umbrella, Coffee, Clock, Plus, MapPin, BookOpen, Calendar, NotebookText, CalendarRange } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AttendanceSpinner from '../../components/ui/AttendanceSpinner';
import {
    getUser, getScheduleForDay, TimetableItem, getAttendanceByDate,
    markAttendance, getSubjectById, getSubjects, Subject,
    addExtraClass, getExtraClassesForDate
} from '../../db/db';

export default function DashboardScreen() {
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const isoDate = new Date().toISOString().split('T')[0];
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [userName, setUserName] = useState('Scholar');
    const [todaysClasses, setTodaysClasses] = useState<TimetableItem[]>([]);
    // Key format: "timetable_<id>" or "extra_<id>" to track per class instance
    const [attendanceLog, setAttendanceLog] = useState<Record<string, string>>({});
    const [subjectStats, setSubjectStats] = useState<Record<number, { total: number, attended: number }>>({});
    const [weeklyClassCount, setWeeklyClassCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // --- EXTRA CLASS MODAL STATE ---
    const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [extraStartTime, setExtraStartTime] = useState(new Date());
    const [extraEndTime, setExtraEndTime] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [extraLocation, setExtraLocation] = useState('');

    // Load Data
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        setLoading(true);
        const user = await getUser();
        if (user?.name) setUserName(user.name);

        // 1. Fetch Weekly Schedule
        const todayIndex = new Date().getDay();
        const regularSchedule = await getScheduleForDay(todayIndex);

        // 2. Fetch Extra Classes for Today
        const extraClasses = await getExtraClassesForDate(isoDate);

        // 3. Merge & Sort by Time
        const merged = [...regularSchedule, ...extraClasses].sort((a, b) => {
            return a.start_time.localeCompare(b.start_time);
        });
        setTodaysClasses(merged);

        // 4. Attendance Logs - Map by class instance ID
        const logs = await getAttendanceByDate(isoDate);
        const logMap: Record<string, string> = {};
        logs.forEach(log => {
            // Use class instance ID as key: "timetable_<id>" or "extra_<id>"
            if (log.timetable_id) {
                logMap[`timetable_${log.timetable_id}`] = log.status;
            } else if (log.extra_class_id) {
                logMap[`extra_${log.extra_class_id}`] = log.status;
            }
        });
        setAttendanceLog(logMap);

        // 5. Stats for Spinners
        const statsMap: Record<number, { total: number, attended: number }> = {};
        for (const item of merged) {
            if (!statsMap[item.subject_id]) { // Avoid duplicate fetch
                const sub = await getSubjectById(item.subject_id);
                if (sub) statsMap[sub.id] = { total: sub.total_classes, attended: sub.attended_classes };
            }
        }
        setSubjectStats(statsMap);

        // 6. Calculate Weekly Class Count (all 7 days)
        let totalWeeklyClasses = 0;
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const daySchedule = await getScheduleForDay(dayIndex);
            totalWeeklyClasses += daySchedule.length;
        }
        setWeeklyClassCount(totalWeeklyClasses);

        setLoading(false);
    };

    const handleMarkAttendance = async (
        subjectId: number,
        status: 'present' | 'absent' | 'cancelled' | 'holiday',
        timetableId?: number | null,
        extraClassId?: number | null
    ) => {
        // Update local state with class instance key
        const logKey = timetableId ? `timetable_${timetableId}` : extraClassId ? `extra_${extraClassId}` : null;
        if (logKey) {
            setAttendanceLog(prev => ({ ...prev, [logKey]: status }));
        }

        await markAttendance(subjectId, isoDate, status, timetableId, extraClassId);

        // Refresh Stats (spinner shows overall subject attendance)
        const sub = await getSubjectById(subjectId);
        if (sub) {
            setSubjectStats(prev => ({
                ...prev,
                [subjectId]: { total: sub.total_classes, attended: sub.attended_classes }
            }));
        }
    };

    const openExtraModal = async () => {
        const subs = await getSubjects();
        setSubjects(subs);
        setIsExtraModalOpen(true);
    };

    const saveExtraClass = async () => {
        if (!selectedSubjectId) return;
        try {
            await addExtraClass(
                selectedSubjectId,
                isoDate,
                extraStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                extraEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                extraLocation
            );
            setIsExtraModalOpen(false);
            loadData(); // Refresh Dashboard
            // Reset Form
            setSelectedSubjectId(null);
            setExtraLocation('');
        } catch (e) {
            console.error(e);
        }
    };

    // Helper: Calculate Spinner %
    const getPercentage = (subId: number) => {
        const stats = subjectStats[subId];
        if (!stats || stats.total === 0) return 0;
        return Math.round((stats.attended / stats.total) * 100);
    };

    // Format Time Helper
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

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

                {/* Stats */}
                <View className="gap-4 mb-8">
                    <Pressable
                        className="rounded-2xl p-5"
                        style={{
                            backgroundColor: isDark ? '#4f46e5' : '#6366f1',
                            shadowColor: isDark ? '#4f46e5' : '#6366f1',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isDark ? 0.25 : 0.15,
                            shadowRadius: 12,
                            elevation: 4,
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <View className="bg-white/20 self-start px-2.5 py-1 rounded-full mb-2">
                                    <Text className="text-white text-[10px] font-semibold">ALL SUBJECTS</Text>
                                </View>
                                <Text className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">
                                    Overall Attendance
                                </Text>
                                <Text className="text-white text-4xl font-bold tracking-tight">
                                    {Object.keys(subjectStats).length > 0
                                        ? Math.round(
                                            Object.values(subjectStats).reduce(
                                                (acc, curr) => acc + (curr.total > 0 ? (curr.attended / curr.total) * 100 : 0),
                                                0
                                            ) / Object.keys(subjectStats).length
                                        ) + '%'
                                        : '--%'}
                                </Text>
                            </View>
                            <View className="w-14 h-14 bg-white/10 rounded-full items-center justify-center ml-3">
                                <Text className="text-white text-2xl">📊</Text>
                            </View>
                        </View>
                    </Pressable>

                    <View className="flex-row justify-between">
                        <Pressable
                            className="rounded-2xl p-3 border"
                            style={{
                                width: "42%",
                                height: "100%",
                                marginRight: 8,
                                backgroundColor: isDark ? 'rgba(161, 98, 7, 0.25)' : 'rgba(255, 240, 31, 0.2)',
                                borderColor: isDark ? 'rgba(180, 83, 9, 0.4)' : 'rgba(255, 240, 31, 0.4)',
                            }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-[45px] h-[45px] rounded-xl items-center justify-center mr-3"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(161, 98, 7, 0.35)' : 'rgba(250, 250, 5, 0.3)',
                                    }}>
                                    <NotebookText size={24} color={isDark ? '#fbbf24' : '#ffe600'} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase">Today</Text>
                                    <Text className="text-zinc-900 dark:text-white text-3xl font-bold">{todaysClasses.length}</Text>
                                </View>
                            </View>
                        </Pressable>

                        <Pressable
                            className="rounded-2xl p-3 border"
                            style={{
                                flex: 1,
                                marginLeft: 8,
                                backgroundColor: isDark ? 'rgba(5, 122, 85, 0.25)' : 'rgba(55, 255, 20, 0.2)',
                                borderColor: isDark ? 'rgba(5, 150, 105, 0.4)' : 'rgba(55, 255, 20, 0.4)',
                            }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-[45px] h-[45px] rounded-xl items-center justify-center mr-3"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(5, 122, 85, 0.35)' : 'rgba(4, 196, 23, 0.3)',
                                    }}>
                                    <CalendarRange size={24} color={isDark ? '#34d399' : '#017d0d'} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase">This Week</Text>
                                    <Text className="text-zinc-900 dark:text-white text-3xl font-bold">{weeklyClassCount}</Text>
                                </View>
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Schedule Section Header */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-zinc-900 dark:text-white">Today's Schedule</Text>
                    <TouchableOpacity onPress={openExtraModal} className="flex-row items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                        <Plus size={14} className="text-zinc-600 dark:text-zinc-300 mr-1" />
                        <Text className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Extra Class</Text>
                    </TouchableOpacity>
                </View>

                {/* LIST RENDERING */}
                {loading ? (
                    <ActivityIndicator size="small" color="#4F46E5" />
                ) : todaysClasses.length === 0 ? (
                    <View className="bg-white dark:bg-zinc-900 rounded-3xl p-8 items-center justify-center border border-zinc-100 dark:border-zinc-800 border-dashed">
                        <Coffee size={48} className="text-zinc-300 mb-4" />
                        <Text className="text-zinc-900 dark:text-white font-bold text-lg text-center">No classes today</Text>
                        <Text className="text-zinc-500 text-center mt-1">Enjoy your day off!</Text>
                    </View>
                ) : (
                    todaysClasses.map((item, index) => {
                        // Get attendance status for this specific class instance
                        const logKey = item.is_extra ? `extra_${item.id}` : `timetable_${item.id}`;
                        const classStatus = attendanceLog[logKey];

                        return (
                            <SubjectCard
                                key={`${item.id}-${index}`} // Composite key just in case
                                subject={item.subject_name}
                                teacher={item.teacher}
                                room={item.location}
                                time={`${item.start_time} - ${item.end_time}`}
                                color={item.subject_color}
                                attendance={getPercentage(item.subject_id)}
                                status={classStatus}
                                onMark={(status: any) => handleMarkAttendance(
                                    item.subject_id,
                                    status,
                                    item.is_extra ? null : item.id,
                                    item.is_extra ? item.id : null
                                )}
                                isExtra={!!item.is_extra} // Pass extra flag as boolean
                            />
                        );
                    })
                )}

            </ScrollView>

            {/* --- EXTRA CLASS MODAL --- */}
            <Modal visible={isExtraModalOpen} animationType="slide" presentationStyle="pageSheet">
                <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#09090b' : '#f8fafc' }} className="p-6">
                    <View className="flex-row justify-between items-center mb-8">
                        <Text className="text-xl font-bold text-zinc-900 dark:text-white">Add Extra Class</Text>
                        <TouchableOpacity onPress={() => setIsExtraModalOpen(false)}>
                            <Text className="text-indigo-600 font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Subject Selector */}
                    <View className="mb-6">
                        <Text className="text-zinc-500 font-medium mb-2">Subject</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-2">
                            {subjects.map(sub => (
                                <TouchableOpacity
                                    key={sub.id}
                                    onPress={() => setSelectedSubjectId(sub.id)}
                                    className={`mr-3 p-3 rounded-xl border ${selectedSubjectId === sub.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}
                                >
                                    <View className="flex-row items-center gap-2">
                                        <View style={{ backgroundColor: sub.color }} className="w-3 h-3 rounded-full" />
                                        <Text className={`font-bold ${selectedSubjectId === sub.id ? 'text-indigo-700' : 'text-zinc-700 dark:text-zinc-300'}`}>{sub.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Time Pickers */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-zinc-500 font-medium mb-2">Start Time</Text>
                            <TouchableOpacity onPress={() => setShowStartPicker(true)} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <Text className="text-zinc-900 dark:text-white font-bold text-center">{formatTime(extraStartTime)}</Text>
                            </TouchableOpacity>
                            {showStartPicker && (
                                <DateTimePicker
                                    value={extraStartTime}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, date) => {
                                        setShowStartPicker(false);
                                        if (date) setExtraStartTime(date);
                                    }}
                                />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-zinc-500 font-medium mb-2">End Time</Text>
                            <TouchableOpacity onPress={() => setShowEndPicker(true)} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <Text className="text-zinc-900 dark:text-white font-bold text-center">{formatTime(extraEndTime)}</Text>
                            </TouchableOpacity>
                            {showEndPicker && (
                                <DateTimePicker
                                    value={extraEndTime}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, date) => {
                                        setShowEndPicker(false);
                                        if (date) setExtraEndTime(date);
                                    }}
                                />
                            )}
                        </View>
                    </View>

                    {/* Location */}
                    <View className="mb-8">
                        <Text className="text-zinc-500 font-medium mb-2">Location (Optional)</Text>
                        <TextInput
                            placeholder="e.g. Room 304" placeholderTextColor="#A1A1AA"
                            value={extraLocation}
                            onChangeText={setExtraLocation}
                            className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                        />
                    </View>

                    <TouchableOpacity onPress={saveExtraClass} className="bg-indigo-600 p-4 rounded-2xl items-center shadow-lg shadow-indigo-500/30">
                        <Text className="text-white font-bold text-lg">Add to Today's Schedule</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

        </ScreenWrapper>
    );
}

// Updated Subject Card with "Extra" Badge support
const SubjectCard = ({ subject, teacher, room, time, color, attendance, status, onMark, isExtra }: any) => {
    let spinnerColor = 'text-green-500';
    if (attendance < 75) spinnerColor = 'text-orange-500';
    if (attendance < 60) spinnerColor = 'text-red-500';

    return (
        <View
            style={{
                backgroundColor: `${color}20`,
                borderColor: `${color}40`,
            }}
            className="rounded-3xl p-5 mb-4 border"
        >
            <View className="flex-row justify-between">
                <View>
                    <View className="flex-row items-center mb-1">
                        <Clock size={14} color={color} style={{ marginRight: 6 }} />
                        <Text style={{ color: color }} className="text-xs font-bold uppercase tracking-wider">{time}</Text>

                        {/* EXTRA BADGE */}
                        {isExtra && (
                            <View className="ml-2 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md">
                                <Text className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300">EXTRA</Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{subject}</Text>
                    <Text className="text-zinc-500 text-sm mb-4">{teacher || 'No Teacher'} • {room || 'No Room'}</Text>
                </View>

                <AttendanceSpinner percentage={attendance} radius={26} strokeWidth={4} />
            </View>

            <View style={{ backgroundColor: `${color}30` }} className="h-[1px] w-full my-3" />

            <View className="flex-row justify-between px-2">
                <TouchableOpacity onPress={() => onMark('present')} className={`items-center justify-center w-10 h-10 rounded-full transition-opacity ${status === 'present' ? 'bg-green-500' : 'bg-white/50 dark:bg-black/20'} ${status && status !== 'present' ? 'opacity-30' : 'opacity-100'}`}>
                    <Check size={20} color={status === 'present' ? 'white' : '#10B981'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onMark('absent')} className={`items-center justify-center w-10 h-10 rounded-full transition-opacity ${status === 'absent' ? 'bg-red-500' : 'bg-white/50 dark:bg-black/20'} ${status && status !== 'absent' ? 'opacity-30' : 'opacity-100'}`}>
                    <X size={20} color={status === 'absent' ? 'white' : '#EF4444'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onMark('cancelled')} className={`items-center justify-center w-10 h-10 rounded-full transition-opacity ${status === 'cancelled' ? 'bg-yellow-500' : 'bg-white/50 dark:bg-black/20'} ${status && status !== 'cancelled' ? 'opacity-30' : 'opacity-100'}`}>
                    <Ban size={20} color={status === 'cancelled' ? 'white' : '#F59E0B'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onMark('holiday')} className={`items-center justify-center w-10 h-10 rounded-full transition-opacity ${status === 'holiday' ? 'bg-orange-500' : 'bg-white/50 dark:bg-black/20'} ${status && status !== 'holiday' ? 'opacity-30' : 'opacity-100'}`}>
                    <Umbrella size={20} color={status === 'holiday' ? 'white' : '#F97316'} />
                </TouchableOpacity>
            </View>
        </View>
    )
}