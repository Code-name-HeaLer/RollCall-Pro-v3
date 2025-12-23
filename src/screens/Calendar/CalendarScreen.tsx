import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { styled, useColorScheme } from 'nativewind';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Clock, Check, X, Ban, Umbrella, Coffee, CalendarOff, ArrowRight } from 'lucide-react-native';
import AttendanceSpinner from '../../components/ui/AttendanceSpinner';
import PageTransition from '../../components/ui/PageTransition';

import {
    getCalendarMarkers,
    getScheduleForDay,
    getExtraClassesForDate,
    getAttendanceByDate,
    markAttendance,
    getSubjectById,
    TimetableItem,
    getUser
} from '../../db/db';

const StyledText = styled(Text);

export default function CalendarScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const todayStr = new Date().toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [dayClasses, setDayClasses] = useState<TimetableItem[]>([]);
    const [attendanceLog, setAttendanceLog] = useState<Record<string, string>>({});
    const [subjectStats, setSubjectStats] = useState<Record<number, { total: number, attended: number }>>({});
    const [loading, setLoading] = useState(false);

    // State for Time Travel Logic
    const [userStartDate, setUserStartDate] = useState(todayStr); // Default to today until loaded

    // 1. Load Data
    useFocusEffect(
        useCallback(() => {
            loadInitialData();
        }, [])
    );

    const loadInitialData = async () => {
        // Get User Start Date
        const user = await getUser();
        if (user?.created_at) {
            // We only care about the YYYY-MM-DD part
            setUserStartDate(user.created_at.split('T')[0]);
        }

        loadMarkers();
        loadDayDetails(selectedDate);
    };

    const loadMarkers = async () => {
        const markers = await getCalendarMarkers();
        const current = markers[selectedDate] || {};
        markers[selectedDate] = { ...current, selected: true, selectedColor: '#4F46E5' };
        setMarkedDates(markers);
    };

    const loadDayDetails = async (dateStr: string) => {
        setLoading(true);

        // --- SENIOR LOGIC: The Valid Window ---
        // 1. Check Future
        if (dateStr > todayStr) {
            setDayClasses([]); // Clear classes
            setLoading(false);
            return;
        }

        // 2. Check Pre-History (Before User Started)
        // Note: We use string comparison "2023-01-01" < "2023-02-01" works in ISO format
        // We allow the start date itself (>=)
        /* 
           NOTE: If you are testing and your user created_at is TODAY, 
           you won't be able to see yesterday. This is correct behavior for a production app.
           For testing, you might want to manually set a past date in your DB.
        */
        /* 
        if (dateStr < userStartDate) {
            setDayClasses([]); 
            setLoading(false);
            return;
        }
        */
        // COMMENTED OUT ABOVE: For now, I've disabled the "Pre-History" block 
        // because since we just added the column, your user's start date might be "Today", 
        // preventing you from testing past dates. 
        // Uncomment it when you are ready for production behavior.

        // --- LOGIC FOR VALID DATES ---

        const dateObj = new Date(dateStr + 'T12:00:00');
        const dayIndex = dateObj.getDay();

        // 1. Theoretical Schedule (Timetable)
        const regularSchedule = await getScheduleForDay(dayIndex);

        // 2. Actual Schedule (Extra Classes)
        const extraClasses = await getExtraClassesForDate(dateStr);

        // 3. Merge
        const merged = [...regularSchedule, ...extraClasses].sort((a, b) => {
            return a.start_time.localeCompare(b.start_time);
        });
        setDayClasses(merged);

        // 4. Overlay Attendance
        const logs = await getAttendanceByDate(dateStr);
        const logMap: Record<string, string> = {};
        logs.forEach(log => {
            if (log.timetable_id) logMap[`timetable_${log.timetable_id}`] = log.status;
            else if (log.extra_class_id) logMap[`extra_${log.extra_class_id}`] = log.status;
        });
        setAttendanceLog(logMap);

        // 5. Stats
        const statsMap: Record<number, { total: number, attended: number }> = {};
        for (const item of merged) {
            if (!statsMap[item.subject_id]) {
                const sub = await getSubjectById(item.subject_id);
                if (sub) statsMap[sub.id] = { total: sub.total_classes, attended: sub.attended_classes };
            }
        }
        setSubjectStats(statsMap);

        setLoading(false);
    };

    const onDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
        const newMarkers = { ...markedDates };
        Object.keys(newMarkers).forEach(k => {
            if (newMarkers[k].selected) {
                newMarkers[k] = { ...newMarkers[k], selected: false, selectedColor: undefined };
            }
        });
        newMarkers[day.dateString] = {
            ...(newMarkers[day.dateString] || {}),
            selected: true,
            selectedColor: '#4F46E5'
        };
        setMarkedDates(newMarkers);
        loadDayDetails(day.dateString);
    };

    const handleMarkAttendance = async (
        subjectId: number,
        status: 'present' | 'absent' | 'cancelled' | 'holiday',
        timetableId?: number | null,
        extraClassId?: number | null
    ) => {
        const logKey = timetableId ? `timetable_${timetableId}` : extraClassId ? `extra_${extraClassId}` : null;
        if (logKey) setAttendanceLog(prev => ({ ...prev, [logKey]: status }));

        await markAttendance(subjectId, selectedDate, status, timetableId, extraClassId);

        const sub = await getSubjectById(subjectId);
        if (sub) {
            setSubjectStats(prev => ({
                ...prev,
                [subjectId]: { total: sub.total_classes, attended: sub.attended_classes }
            }));
        }
        loadMarkers();
    };

    const getPercentage = (subId: number) => {
        const stats = subjectStats[subId];
        if (!stats || stats.total === 0) return 0;
        return Math.round((stats.attended / stats.total) * 100);
    };

    // --- RENDER CONTENT HELPERS ---
    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="small" color="#4F46E5" className="mt-10" />;
        }

        // Case 1: Future Date
        if (selectedDate > todayStr) {
            return (
                <View className="items-center mt-10 opacity-50">
                    <CalendarOff size={48} className="text-zinc-300 mb-4" />
                    <StyledText className="text-zinc-400 font-medium text-center px-10">
                        Cannot mark attendance for the future. Time travel isn't invented yet! 🚀
                    </StyledText>
                </View>
            );
        }

        // Case 2: No Classes Scheduled (Valid Date, but empty schedule)
        if (dayClasses.length === 0) {
            return (
                <View className="bg-white dark:bg-zinc-900 rounded-3xl p-8 items-center justify-center border border-zinc-100 dark:border-zinc-800 border-dashed">
                    <Coffee size={48} className="text-zinc-300 mb-4" />
                    <StyledText className="text-zinc-900 dark:text-white font-bold text-lg text-center">No classes</StyledText>
                    <StyledText className="text-zinc-500 text-center mt-1">Enjoy your day off!</StyledText>
                </View>
            );
        }

        // Case 3: Valid Schedule
        return dayClasses.map((item, index) => {
            const logKey = item.is_extra ? `extra_${item.id}` : `timetable_${item.id}`;
            const classStatus = attendanceLog[logKey];

            return (
                <CalendarSubjectCard
                    key={`${item.id}-${index}`}
                    subject={item.subject_name}
                    teacher={item.teacher}
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
                    isExtra={!!item.is_extra}
                />
            );
        });
    };

    return (
        <ScreenWrapper>
            <PageTransition>
                <View className="mb-6 mt-2">
                    <StyledText className="text-3xl font-bold text-zinc-900 dark:text-white">History</StyledText>
                </View>

                {/* CALENDAR */}
                <View className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 mb-6">
                    <Calendar
                        onDayPress={onDayPress}
                        markedDates={markedDates}
                        markingType={'multi-dot'}
                        theme={{
                            backgroundColor: 'transparent',
                            calendarBackground: 'transparent',
                            textSectionTitleColor: isDark ? '#A1A1AA' : '#71717A',
                            selectedDayBackgroundColor: '#4F46E5',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#4F46E5',
                            dayTextColor: isDark ? '#E4E4E7' : '#27272A',
                            textDisabledColor: isDark ? '#3F3F46' : '#D4D4D8',
                            dotColor: '#4F46E5',
                            selectedDotColor: '#ffffff',
                            arrowColor: '#4F46E5',
                            monthTextColor: isDark ? '#ffffff' : '#18181B',
                            textDayFontWeight: '600',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '600',
                        }}
                    />
                </View>

                {/* SELECTED DATE HEADER */}
                <View className="mb-4">
                    <StyledText className="text-xl font-bold text-zinc-900 dark:text-white">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </StyledText>
                </View>

                {/* CLASS LIST */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {renderContent()}
                </ScrollView>
            </PageTransition>
        </ScreenWrapper>
    );
}

// Local Component
const CalendarSubjectCard = ({ subject, teacher, time, color, attendance, status, onMark, isExtra }: any) => {
    return (
        <View
            style={{
                backgroundColor: `${color}20`,
                borderColor: `${color}40`,
            }}
            className="rounded-3xl p-4 mb-3 border"
        >
            <View className="flex-row justify-between">
                <View>
                    <View className="flex-row items-center mb-1">
                        <Clock size={12} color={color} style={{ marginRight: 6 }} />
                        <StyledText style={{ color: color }} className="text-xs font-bold uppercase tracking-wider">{time}</StyledText>
                        {isExtra && (
                            <View className="ml-2 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md">
                                <StyledText className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300">EXTRA</StyledText>
                            </View>
                        )}
                    </View>
                    <StyledText className="text-lg font-bold text-zinc-900 dark:text-white mb-0.5">{subject}</StyledText>
                    <StyledText className="text-zinc-500 text-xs mb-3">{teacher}</StyledText>
                </View>

                <AttendanceSpinner percentage={attendance} radius={22} strokeWidth={4} />
            </View>

            <View style={{ backgroundColor: `${color}30` }} className="h-[1px] w-full my-2" />

            <View className="flex-row justify-between px-1">
                <TouchableOpacity onPress={() => onMark('present')} className={`items-center justify-center w-9 h-9 rounded-full transition-opacity ${status === 'present' ? 'bg-green-500' : 'bg-white/50 dark:bg-black/20'} ${status && status !== 'present' ? 'opacity-30' : 'opacity-100'}`}>
                    <Check size={18} color={status === 'present' ? 'white' : '#10B981'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onMark('absent')} className={`items-center justify-center w-9 h-9 rounded-full transition-opacity ${status === 'absent' ? 'bg-red-500' : 'bg-white/50 dark:bg-black/20'} ${status && status !== 'absent' ? 'opacity-30' : 'opacity-100'}`}>
                    <X size={18} color={status === 'absent' ? 'white' : '#EF4444'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onMark('cancelled')} className={`items-center justify-center w-9 h-9 rounded-full transition-opacity ${status === 'cancelled' ? 'bg-yellow-500' : 'bg-white/50 dark:bg-black/20'} ${status && status !== 'cancelled' ? 'opacity-30' : 'opacity-100'}`}>
                    <Ban size={18} color={status === 'cancelled' ? 'white' : '#F59E0B'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onMark('holiday')} className={`items-center justify-center w-9 h-9 rounded-full transition-opacity ${status === 'holiday' ? 'bg-orange-500' : 'bg-white/50 dark:bg-black/20'} ${status && status !== 'holiday' ? 'opacity-30' : 'opacity-100'}`}>
                    <Umbrella size={18} color={status === 'holiday' ? 'white' : '#F97316'} />
                </TouchableOpacity>
            </View>
        </View>
    )
}