import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, LayoutChangeEvent } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Plus, CheckCircle2, Circle, Trash2, CalendarDays, AlertTriangle } from 'lucide-react-native';
import { styled, useColorScheme } from 'nativewind';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { getTasks, toggleTaskStatus, deleteTask, Task } from '../../db/db';
import AddTaskScreen from './AddTaskScreen';

const StyledText = styled(Text);
const StyledView = styled(Animated.View);

export default function TasksScreen({ navigation }: any) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Dynamic Colors for Modal
    const cardBgColor = isDark ? '#18181b' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#18181b';
    const secondaryTextColor = isDark ? '#a1a1aa' : '#71717a';

    const [tasks, setTasks] = useState<Task[]>([]);
    const [tab, setTab] = useState<'active' | 'done'>('active');
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    // Animation State
    const [containerWidth, setContainerWidth] = useState(0);
    const translateX = useSharedValue(0);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDeleteId, setTaskToDeleteId] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );

    const loadTasks = async () => {
        const data = await getTasks();
        setTasks(data);
    };

    const handleToggle = async (id: number, status: number) => {
        await toggleTaskStatus(id, status);
        loadTasks();
    };

    // 1. Open Modal
    const handleDeletePress = (id: number) => {
        setTaskToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    // 2. Confirm Delete
    const confirmDelete = async () => {
        if (taskToDeleteId !== null) {
            await deleteTask(taskToDeleteId);
            loadTasks();
            setIsDeleteModalOpen(false);
            setTaskToDeleteId(null);
        }
    };

    // --- ANIMATION LOGIC ---
    const handleTabChange = (selectedTab: 'active' | 'done') => {
        setTab(selectedTab);
        if (containerWidth > 0) {
            const targetX = selectedTab === 'active' ? 0 : containerWidth / 2;
            translateX.value = withSpring(targetX, {
                damping: 15,
                stiffness: 150,
                mass: 0.5,
            });
        }
    };

    const cursorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
            width: containerWidth / 2,
        };
    });

    const onLayout = (e: LayoutChangeEvent) => {
        const width = e.nativeEvent.layout.width;
        setContainerWidth(width);
        if (tab === 'done') {
            translateX.value = width / 2;
        }
    };

    // Filter lists
    const activeTasks = tasks.filter(t => t.is_completed === 0);
    const completedTasks = tasks.filter(t => t.is_completed === 1);

    return (
        <ScreenWrapper>
            <View className="flex-row justify-between items-center mb-6 mt-2">
                <StyledText className="text-3xl font-bold text-zinc-900 dark:text-white">Tasks</StyledText>
                {/* Note: If you registered AddTask in AppNavigator, use navigation.navigate('AddTask') instead of modal */}
                {/* Assuming inline modal for now based on your code: */}
                <TouchableOpacity
                    onPress={() => setIsAddTaskOpen(true)}
                    className="w-12 h-12 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-500/30"
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* --- SLIDING TABS --- */}
            <View
                onLayout={onLayout}
                className="relative flex-row bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-6 h-12"
            >
                {containerWidth > 0 && (
                    <StyledView
                        style={[cursorStyle]}
                        className="absolute top-1 bottom-1 left-1 bg-white dark:bg-zinc-700 rounded-lg shadow-sm"
                    />
                )}

                <TouchableOpacity
                    onPress={() => handleTabChange('active')}
                    className="flex-1 items-center justify-center z-10"
                >
                    <StyledText className={`font-bold ${tab === 'active' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                        To Do ({activeTasks.length})
                    </StyledText>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleTabChange('done')}
                    className="flex-1 items-center justify-center z-10"
                >
                    <StyledText className={`font-bold ${tab === 'done' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                        Completed ({completedTasks.length})
                    </StyledText>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* LIST RENDERING */}
                {(tab === 'active' ? activeTasks : completedTasks).map((item) => (
                    <TaskItem
                        key={item.id}
                        item={item}
                        onToggle={() => handleToggle(item.id, item.is_completed)}
                        onDelete={() => handleDeletePress(item.id)} // Trigger Modal
                    />
                ))}

                {/* EMPTY STATE */}
                {((tab === 'active' && activeTasks.length === 0) || (tab === 'done' && completedTasks.length === 0)) && (
                    <View className="items-center mt-10 opacity-50">
                        <CheckCircle2 size={48} className="text-zinc-300 dark:text-zinc-600 mb-2" />
                        <StyledText className="text-zinc-400 font-medium">No tasks here</StyledText>
                    </View>
                )}
            </ScrollView>

            {/* --- ADD TASK MODAL --- */}
            <Modal visible={isAddTaskOpen} animationType="slide" presentationStyle="pageSheet">
                <AddTaskScreen
                    onClose={() => setIsAddTaskOpen(false)}
                    onTaskCreated={loadTasks}
                />
            </Modal>

            {/* --- CUSTOM DELETE MODAL --- */}
            <Modal visible={isDeleteModalOpen} transparent animationType="fade">
                <View className="flex-1 bg-black/60 justify-center items-center px-6">
                    <View style={{ backgroundColor: cardBgColor }} className="w-full rounded-3xl p-6 items-center">

                        <View className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-4">
                            <AlertTriangle size={32} className="text-red-600 dark:text-red-500" />
                        </View>

                        <Text style={{ color: textColor }} className="text-xl font-bold text-center mb-2">
                            Delete Task?
                        </Text>
                        <Text style={{ color: secondaryTextColor }} className="text-center mb-8 px-4">
                            Are you sure you want to remove this task permanently?
                        </Text>

                        <View className="flex-row gap-4 w-full">
                            <TouchableOpacity
                                onPress={() => setIsDeleteModalOpen(false)}
                                style={{ backgroundColor: isDark ? '#27272a' : '#f4f4f5' }}
                                className="flex-1 py-4 rounded-xl items-center"
                            >
                                <Text style={{ color: textColor }} className="font-bold">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={confirmDelete}
                                className="flex-1 py-4 rounded-xl bg-red-600 items-center shadow-lg shadow-red-500/30"
                            >
                                <Text className="font-bold text-white">Delete</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

        </ScreenWrapper>
    );
}

// Local Component
const TaskItem = ({ item, onToggle, onDelete }: any) => {
    const isDone = item.is_completed === 1;
    const date = new Date(item.due_date);
    const isOverdue = !isDone && date < new Date();

    return (
        <View className="flex-row items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl mb-3 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <TouchableOpacity onPress={onToggle} className="mr-4">
                {isDone ? <CheckCircle2 size={24} className="text-indigo-500" /> : <Circle size={24} className="text-zinc-300 dark:text-zinc-600" />}
            </TouchableOpacity>

            <View className="flex-1">
                <StyledText className={`text-base font-bold ${isDone ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-white'}`}>
                    {item.title}
                </StyledText>

                <View className="flex-row items-center mt-1">
                    {item.subject_name && (
                        <View className="flex-row items-center mr-3">
                            <View style={{ backgroundColor: item.subject_color }} className="w-2 h-2 rounded-full mr-1.5" />
                            <StyledText className="text-xs text-zinc-500">{item.subject_name}</StyledText>
                        </View>
                    )}
                    <CalendarDays size={12} className={isOverdue ? "text-red-400 mr-1" : "text-zinc-400 mr-1"} />
                    <StyledText className={`text-xs ${isOverdue ? 'text-red-500 font-bold' : 'text-zinc-500'}`}>
                        {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </StyledText>
                </View>
            </View>

            <TouchableOpacity onPress={onDelete} className="p-2">
                <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );
}