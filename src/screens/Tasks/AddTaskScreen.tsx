import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { X, Calendar as CalendarIcon, Link, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { styled, useColorScheme } from 'nativewind';
import { getSubjects, Subject, addTask } from '../../db/db';
import { scheduleSmartNotification } from '../../utils/notificationService';

const StyledText = styled(Text);

type AddTaskProps = {
    onClose: () => void;
    onTaskCreated?: () => void;
};

export default function AddTaskScreen({ onClose, onTaskCreated }: AddTaskProps) {
    const { colorScheme } = useColorScheme();
    const bgColor = colorScheme === 'dark' ? '#09090b' : '#f8fafc';
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Date Picker State
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Subject Linking
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

    useEffect(() => {
        getSubjects().then(setSubjects);
    }, []);

    // --- SENIOR ENGINEER LOGIC: Notification Scheduling ---
    const scheduleReminders = async (taskId: number, due: Date, taskTitle: string) => {
        const triggers = [
            { hours: 24, label: 'Tomorrow' },
            { hours: 12, label: 'Later today' },
            { hours: 5, label: 'Soon' },
        ];

        for (const t of triggers) {
            const triggerDate = new Date(due.getTime() - t.hours * 60 * 60 * 1000);

            // Use the smart service
            await scheduleSmartNotification(
                `Task Due in ${t.hours} Hours! ⏳`,
                `Don't forget to complete: "${taskTitle}"`,
                'task',
                triggerDate
            );
            // Only schedule if the trigger time is in the future
            if (triggerDate > new Date()) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `Task Due in ${t.hours} Hours! ⏳`,
                        body: `Don't forget to complete: "${taskTitle}"`,
                        data: { taskId }, // Store ID to potentially cancel later
                    },
                    trigger: { date: triggerDate, type: Notifications.SchedulableTriggerInputTypes.DATE },
                });
            }
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert("Missing Info", "Please add a task title.");
            return;
        }

        try {
            // 1. Save to SQLite
            const newTaskId = await addTask(
                title,
                description,
                selectedSubjectId,
                dueDate.toISOString()
            );

            // 2. Schedule Notifications
            await scheduleReminders(newTaskId, dueDate, title);

            // 3. Notify parent & close
            if (onTaskCreated) {
                onTaskCreated();
            }
            onClose();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not save task.");
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            // Keep the time from current dueDate, update date
            const newDate = new Date(selectedDate);
            newDate.setHours(dueDate.getHours());
            newDate.setMinutes(dueDate.getMinutes());
            setDueDate(newDate);
            // Show time picker next for better UX
            setTimeout(() => setShowTimePicker(true), 500);
        }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <View className="flex-1 px-6 pt-4">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-8">
                    <StyledText className="text-2xl font-bold text-zinc-900 dark:text-white">New Task</StyledText>
                    <TouchableOpacity onPress={onClose} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                        <X size={20} className="text-zinc-600 dark:text-zinc-400" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="space-y-6">

                        {/* Title */}
                        <View>
                            <StyledText className="text-zinc-500 font-medium mb-2 ml-1">Task Title</StyledText>
                            <TextInput
                                placeholder="What needs to be done?"
                                placeholderTextColor="#A1A1AA"
                                value={title}
                                onChangeText={setTitle}
                                className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                            />
                        </View>

                        {/* Description */}
                        <View>
                            <StyledText className="text-zinc-500 font-medium mb-2 ml-1">Description (Optional)</StyledText>
                            <TextInput
                                placeholder="Add details..."
                                placeholderTextColor="#A1A1AA"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-base text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                                style={{ textAlignVertical: 'top' }}
                            />
                        </View>

                        {/* Subject Link (Horizontal Scroll) */}
                        <View>
                            <StyledText className="text-zinc-500 font-medium mb-2 ml-1">Link Subject (Optional)</StyledText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="flex-row py-2"
                                contentContainerStyle={{ paddingRight: 8 }}
                            >
                                {/* None pill */}
                                <TouchableOpacity
                                    onPress={() => setSelectedSubjectId(null)}
                                    className={`mr-3 px-4 py-2 rounded-full border ${selectedSubjectId === null
                                        ? 'bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white'
                                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                                        }`}
                                >
                                    <StyledText
                                        className={`text-xs font-bold ${selectedSubjectId === null ? 'text-white dark:text-zinc-900' : 'text-zinc-500'
                                            }`}
                                    >
                                        None
                                    </StyledText>
                                </TouchableOpacity>

                                {/* Subject pills */}
                                {subjects.map(sub => (
                                    <TouchableOpacity
                                        key={sub.id}
                                        onPress={() => setSelectedSubjectId(sub.id)}
                                        className={`mr-3 px-4 py-2 rounded-full border flex-row items-center ${selectedSubjectId === sub.id
                                            ? 'bg-indigo-50 border-indigo-500'
                                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                                            }`}
                                    >
                                        <View
                                            style={{ backgroundColor: sub.color }}
                                            className="w-2 h-2 rounded-full mr-2"
                                        />
                                        <StyledText
                                            className={`text-xs font-bold ${selectedSubjectId === sub.id
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

                        {/* Date & Time Picker */}
                        <View>
                            <StyledText className="text-zinc-500 font-medium mb-2 ml-1">Due Date</StyledText>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex-row items-center justify-between"
                            >
                                <StyledText className="text-zinc-900 dark:text-white font-medium text-lg">
                                    {dueDate.toLocaleDateString()}  •  {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </StyledText>
                                <CalendarIcon size={20} className="text-indigo-500" />
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={dueDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                />
                            )}
                            {showTimePicker && (
                                <DateTimePicker
                                    value={dueDate}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onTimeChange}
                                />
                            )}
                        </View>

                    </View>
                </ScrollView>

                {/* Save Button */}
                <TouchableOpacity onPress={handleSave} className="bg-indigo-600 p-5 rounded-2xl items-center shadow-lg shadow-indigo-500/30 mt-4 mb-4">
                    <StyledText className="text-white font-bold text-lg">Save Task</StyledText>
                </TouchableOpacity>
            </View>
        </View>
    );
}