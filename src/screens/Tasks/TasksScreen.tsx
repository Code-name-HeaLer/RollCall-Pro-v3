import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, LayoutChangeEvent } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Plus, CheckCircle2, Circle, Trash2, CalendarDays } from 'lucide-react-native';
import { styled } from 'nativewind';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { getTasks, toggleTaskStatus, deleteTask, Task } from '../../db/db';
import AddTaskScreen from './AddTaskScreen';

const StyledText = styled(Text);
const StyledView = styled(Animated.View); // Create styled animated view

export default function TasksScreen({ navigation }: any) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [tab, setTab] = useState<'active' | 'done'>('active');
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    // Animation State
    const [containerWidth, setContainerWidth] = useState(0);
    const translateX = useSharedValue(0);

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

    const handleDelete = (id: number) => {
        Alert.alert("Delete Task", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    await deleteTask(id);
                    loadTasks();
                }
            }
        ]);
    };

    // --- ANIMATION LOGIC ---
    const handleTabChange = (selectedTab: 'active' | 'done') => {
        setTab(selectedTab);
        // Slide to 0 for active, or half width for done
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
            width: containerWidth / 2, // Explicitly half the width
        };
    });

    const onLayout = (e: LayoutChangeEvent) => {
        // Capture the width of the gray container
        const width = e.nativeEvent.layout.width;
        setContainerWidth(width);
        // Correct initial position if we are on 'done' tab
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
                {/* 1. The Sliding Cursor (Absolute) */}
                {containerWidth > 0 && (
                    <StyledView
                        style={[cursorStyle]}
                        className="absolute top-1 bottom-1 left-1 bg-white dark:bg-zinc-700 rounded-lg shadow-sm"
                    />
                )}

                {/* 2. The Buttons (Overlay) */}
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
                {/* Active Tasks List (kept mounted, just hidden when not active) */}
                <View style={{ display: tab === 'active' ? 'flex' : 'none' }}>
                    {activeTasks.map((item) => (
                        <TaskItem
                            key={item.id}
                            item={item}
                            onToggle={() => handleToggle(item.id, item.is_completed)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    ))}

                    {activeTasks.length === 0 && (
                        <View className="items-center mt-10 opacity-50">
                            <CheckCircle2 size={48} className="text-zinc-300 dark:text-zinc-600 mb-2" />
                            <StyledText className="text-zinc-400 font-medium">No tasks here</StyledText>
                        </View>
                    )}
                </View>

                {/* Completed Tasks List (kept mounted, just hidden when not active) */}
                <View style={{ display: tab === 'done' ? 'flex' : 'none' }}>
                    {completedTasks.map((item) => (
                        <TaskItem
                            key={item.id}
                            item={item}
                            onToggle={() => handleToggle(item.id, item.is_completed)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    ))}

                    {completedTasks.length === 0 && (
                        <View className="items-center mt-10 opacity-50">
                            <CheckCircle2 size={48} className="text-zinc-300 dark:text-zinc-600 mb-2" />
                            <StyledText className="text-zinc-400 font-medium">No tasks here</StyledText>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* --- ADD TASK MODAL --- */}
            <Modal visible={isAddTaskOpen} animationType="slide" presentationStyle="pageSheet">
                <AddTaskScreen
                    onClose={() => setIsAddTaskOpen(false)}
                    onTaskCreated={loadTasks}
                />
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
                <Trash2 size={18} className="text-zinc-300 hover:text-red-500" />
            </TouchableOpacity>
        </View>
    );
}