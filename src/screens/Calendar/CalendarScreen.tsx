import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, TextInput, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { styled, useColorScheme } from 'nativewind';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Clock, Check, X, Ban, Umbrella, Coffee, CalendarOff, ArrowRight, Plus } from 'lucide-react-native';
import AttendanceSpinner from '../../components/ui/AttendanceSpinner';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    getCalendarMarkers,
    getScheduleForDay,
    getExtraClassesForDate,
    getAttendanceByDate,
    markAttendance,
    getSubjectById,
    TimetableItem,
    getUser,
    addExtraClass,
    Subject,
    getSubjects
} from '../../db/db';

const StyledText = styled(Text);

export default function CalendarScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [dayClasses, setDayClasses] = useState<TimetableItem[]>([]);
    const [attendanceLog, setAttendanceLog] = useState<Record<string, string>>({});
    const [subjectStats, setSubjectStats] = useState<Record<number, { total: number, attended: number }>>({});
    const [loading, setLoading] = useState(false);

    // State for Time Travel Logic
    const [userStartDate, setUserStartDate] = useState(todayStr); // Default to today until loaded

    // State for Extra Class Modal
    const [isAddExtraClassOpen, setIsAddExtraClassOpen] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [extraClassStartTime, setExtraClassStartTime] = useState(new Date());
    const [extraClassEndTime, setExtraClassEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));
    const [extraClassLocation, setExtraClassLocation] = useState('');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

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

        // Load Subjects for Extra Class Modal
        const subjectsList = await getSubjects();
        setSubjects(subjectsList);

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

        // 2. Check Pre-History (Before User Started) - ENFORCED
        // Note: We use string comparison "2023-01-01" < "2023-02-01" works in ISO format
        // We allow the start date itself (>=)
        if (dateStr < userStartDate) {
            setDayClasses([]); 
            setLoading(false);
            return;
        }

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

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const handleAddExtraClass = async () => {
        if (!selectedSubjectId) {
            Alert.alert("Missing Info", "Please select a subject.");
            return;
        }

        try {
            await addExtraClass(
                selectedSubjectId,
                selectedDate,
                formatTime(extraClassStartTime),
                formatTime(extraClassEndTime),
                extraClassLocation
            );
            // Reset form
            setSelectedSubjectId(null);
            setExtraClassLocation('');
            setExtraClassStartTime(new Date());
            setExtraClassEndTime(new Date(new Date().getTime() + 60 * 60 * 1000));
            setIsAddExtraClassOpen(false);
            // Reload the day details to show the new extra class
            loadDayDetails(selectedDate);
            loadMarkers();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not add extra class.");
        }
    };

    const onStartTimeChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) setExtraClassStartTime(selectedDate);
    };

    const onEndTimeChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) setExtraClassEndTime(selectedDate);
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
        return (
            <View>
                {dayClasses.map((item, index) => {
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
                })}
            </View>
        );
    };

    return (
        <ScreenWrapper>
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

            {/* SELECTED DATE HEADER WITH ADD EXTRA CLASS BUTTON */}
            <View className="flex-row justify-between items-center mb-4">
                <StyledText className="text-xl font-bold text-zinc-900 dark:text-white">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </StyledText>
                {selectedDate <= todayStr && selectedDate >= userStartDate && (
                    <TouchableOpacity
                        onPress={() => setIsAddExtraClassOpen(true)}
                        className="bg-indigo-600 px-3 py-1.5 rounded-full flex-row items-center justify-center"
                    >
                        <Plus size={16} color="white" />
                        <StyledText className="text-white font-bold text-xs">Extra</StyledText>
                    </TouchableOpacity>
                )}
            </View>

            {/* CLASS LIST */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {renderContent()}
            </ScrollView>

            {/* --- ADD EXTRA CLASS MODAL --- */}
            <Modal visible={isAddExtraClassOpen} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#09090b' : '#f8fafc' }} edges={['top', 'left', 'right']}>
                    <View className="flex-1 px-6 pt-6">
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-8">
                            <StyledText className="text-2xl font-bold text-zinc-900 dark:text-white">Add Extra Class</StyledText>
                            <TouchableOpacity onPress={() => setIsAddExtraClassOpen(false)} className="p-3 bg-zinc-200 dark:bg-zinc-800 rounded-full active:opacity-70">
                                <X size={24} className="text-zinc-600 dark:text-zinc-400" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="space-y-6">
                                {/* Subject Selector */}
                                <View>
                                    <StyledText className="text-zinc-500 font-medium mb-2 ml-1">Subject</StyledText>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        className="flex-row py-2"
                                        contentContainerStyle={{ paddingRight: 8 }}
                                    >
                                        {subjects.map(sub => (
                                            <TouchableOpacity
                                                key={sub.id}
                                                onPress={() => setSelectedSubjectId(sub.id)}
                                                className={`mr-3 px-4 py-2 rounded-full border flex-row items-center ${
                                                    selectedSubjectId === sub.id
                                                        ? 'bg-indigo-50 border-indigo-500'
                                                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                                                }`}
                                            >
                                                <View
                                                    style={{ backgroundColor: sub.color }}
                                                    className="w-2 h-2 rounded-full mr-2"
                                                />
                                                <StyledText
                                                    className={`text-xs font-bold ${
                                                        selectedSubjectId === sub.id
                                                            ? 'text-indigo-700'
                                                            : 'text-zinc-700 dark:text-zinc-300'
                                                    }`}
                                                >
                                                    {sub.name}
                                                </StyledText>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Time Pickers */}
                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <StyledText className="text-zinc-500 font-medium mb-2 ml-1">Start Time</StyledText>
                                        <TouchableOpacity onPress={() => setShowStartPicker(true)} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                            <StyledText className="text-zinc-900 dark:text-white font-bold text-center">{formatTime(extraClassStartTime)}</StyledText>
                                        </TouchableOpacity>
                                        {showStartPicker && (
                                            <DateTimePicker
                                                value={extraClassStartTime}
                                                mode="time"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                onChange={onStartTimeChange}
                                            />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <StyledText className="text-zinc-500 font-medium mb-2 ml-1">End Time</StyledText>
                                        <TouchableOpacity onPress={() => setShowEndPicker(true)} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                            <StyledText className="text-zinc-900 dark:text-white font-bold text-center">{formatTime(extraClassEndTime)}</StyledText>
                                        </TouchableOpacity>
                                        {showEndPicker && (
                                            <DateTimePicker
                                                value={extraClassEndTime}
                                                mode="time"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                onChange={onEndTimeChange}
                                            />
                                        )}
                                    </View>
                                </View>

                                {/* Location */}
                                <View>
                                    <StyledText className="text-zinc-500 font-medium mb-2 ml-1">Location (Optional)</StyledText>
                                    <TextInput
                                        placeholder="e.g. Room 304"
                                        placeholderTextColor="#A1A1AA"
                                        value={extraClassLocation}
                                        onChangeText={setExtraClassLocation}
                                        className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* Save Button */}
                        <TouchableOpacity onPress={handleAddExtraClass} className="bg-indigo-600 p-5 rounded-2xl items-center shadow-lg shadow-indigo-500/30 mt-4 mb-4">
                            <StyledText className="text-white font-bold text-lg">Add Class</StyledText>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
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