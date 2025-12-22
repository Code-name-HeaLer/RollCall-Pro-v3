import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, FlatList, Alert, Platform } from 'react-native';
import { X, Plus, MapPin, Clock, Trash2 } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getSubjects, Subject, addScheduleItem, getScheduleForDay, TimetableItem, deleteScheduleItem } from '../../db/db';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TimetableModalContentProps {
    onClose: () => void;
}

export default function TimetableModalContent({ onClose }: TimetableModalContentProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? '#09090b' : '#f8fafc';
    const textColor = isDark ? '#ffffff' : '#18181b';
    const secondaryTextColor = isDark ? '#a1a1aa' : '#71717a';
    const iconBgColor = isDark ? '#27272a' : '#e4e4e7';
    const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // Default to today
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Data State
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [schedule, setSchedule] = useState<TimetableItem[]>([]);
    const [refresh, setRefresh] = useState(0); // Trigger re-fetch

    // Form State
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [location, setLocation] = useState('');

    // Time Picker State
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // 1. Load Subjects on Mount
    useEffect(() => {
        getSubjects().then(setSubjects);
    }, []);

    // 2. Load Schedule when Day changes or Refresh triggers
    useEffect(() => {
        getScheduleForDay(selectedDay).then(setSchedule);
    }, [selectedDay, refresh]);

    // Helper: Format Time object to "HH:MM" string
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const handleSave = async () => {
        if (!selectedSubjectId) {
            Alert.alert("Missing Info", "Please select a subject.");
            return;
        }

        try {
            await addScheduleItem(
                selectedSubjectId,
                selectedDay,
                formatTime(startTime),
                formatTime(endTime),
                location
            );
            setRefresh(prev => prev + 1); // Reload list
            setIsAddModalOpen(false);
            // Reset Form
            setLocation('');
            setSelectedSubjectId(null);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not save class.");
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert("Delete Class", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    await deleteScheduleItem(id);
                    setRefresh(prev => prev + 1);
                }
            }
        ])
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }} edges={['top', 'left', 'right']}>
            <View className="flex-1 px-6 pt-4">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text style={{ color: textColor }} className="text-2xl font-bold">Manage Schedule</Text>
                    <TouchableOpacity 
                        onPress={onClose} 
                        style={{ backgroundColor: iconBgColor }}
                        className="p-2 rounded-full"
                    >
                        <X size={20} color={secondaryTextColor} />
                    </TouchableOpacity>
                </View>

                {/* Day Selector */}
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

                {/* Class List */}
                <FlatList
                    data={schedule}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={
                        <View className="mt-10 items-center">
                            <Text style={{ color: secondaryTextColor }}>No classes scheduled for {DAYS[selectedDay]}.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border-l-4 border-zinc-100 dark:border-zinc-800 mb-3 shadow-sm flex-row justify-between items-center" style={{ borderLeftColor: item.subject_color }}>
                            <View>
                                <Text className="text-lg font-bold text-zinc-900 dark:text-white">{item.subject_name}</Text>
                                <View className="flex-row items-center mt-1">
                                    <Clock size={14} color={secondaryTextColor} />
                                    <Text style={{ color: secondaryTextColor }} className="text-xs mr-3 ml-1">{item.start_time} - {item.end_time}</Text>
                                    {item.location ? (
                                        <>
                                            <MapPin size={14} color={secondaryTextColor} style={{ marginLeft: 4 }} />
                                            <Text style={{ color: secondaryTextColor }} className="text-xs ml-1">{item.location}</Text>
                                        </>
                                    ) : null}
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
                                <Trash2 size={18} color="#f87171" />
                            </TouchableOpacity>
                        </View>
                    )}
                />

                {/* Add Class FAB */}
                <TouchableOpacity
                    onPress={() => setIsAddModalOpen(true)}
                    className="absolute bottom-8 right-6 w-14 h-14 bg-zinc-900 dark:bg-white rounded-full items-center justify-center shadow-xl"
                >
                    <Plus size={24} color={isDark ? '#09090b' : '#ffffff'} />
                </TouchableOpacity>

                {/* --- ADD CLASS MODAL --- */}
                <Modal visible={isAddModalOpen} animationType="slide" presentationStyle="pageSheet">
                    <View style={{ flex: 1, backgroundColor: bgColor }} className="p-6">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text style={{ color: textColor }} className="text-xl font-bold">Add Class to {DAYS[selectedDay]}</Text>
                            <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                                <Text className="text-indigo-600 font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Subject Selector */}
                        <View className="mb-6">
                            <Text style={{ color: secondaryTextColor }} className="font-medium mb-2">Subject</Text>
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
                                <Text style={{ color: secondaryTextColor }} className="font-medium mb-2">Start Time</Text>
                                <TouchableOpacity onPress={() => setShowStartPicker(true)} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <Text style={{ color: textColor }} className="font-bold text-center">{formatTime(startTime)}</Text>
                                </TouchableOpacity>
                                {showStartPicker && (
                                    <DateTimePicker
                                        value={startTime}
                                        mode="time"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, date) => {
                                            setShowStartPicker(false);
                                            if (date) setStartTime(date);
                                        }}
                                    />
                                )}
                            </View>
                            <View className="flex-1">
                                <Text style={{ color: secondaryTextColor }} className="font-medium mb-2">End Time</Text>
                                <TouchableOpacity onPress={() => setShowEndPicker(true)} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <Text style={{ color: textColor }} className="font-bold text-center">{formatTime(endTime)}</Text>
                                </TouchableOpacity>
                                {showEndPicker && (
                                    <DateTimePicker
                                        value={endTime}
                                        mode="time"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, date) => {
                                            setShowEndPicker(false);
                                            if (date) setEndTime(date);
                                        }}
                                    />
                                )}
                            </View>
                        </View>

                        {/* Location */}
                        <View className="mb-8">
                            <Text style={{ color: secondaryTextColor }} className="font-medium mb-2">Location (Optional)</Text>
                            <TextInput
                                placeholder="e.g. Room 304" placeholderTextColor="#A1A1AA"
                                value={location}
                                onChangeText={setLocation}
                                style={{
                                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                                    color: textColor,
                                    borderColor: isDark ? '#27272a' : '#e4e4e7',
                                }}
                                className="p-4 rounded-2xl text-lg border"
                            />
                        </View>

                        <TouchableOpacity onPress={handleSave} className="bg-indigo-600 p-4 rounded-2xl items-center shadow-lg shadow-indigo-500/30">
                            <Text className="text-white font-bold text-lg">Add to Schedule</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

