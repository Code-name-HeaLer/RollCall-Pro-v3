import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Plus, Calendar as CalendarIcon, MoreVertical } from 'lucide-react-native';
import { getSubjects, Subject } from '../../db/db'; // Import helpers

export default function SubjectsScreen({ navigation }: any) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    // Load Data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadSubjects();
        }, [])
    );

    const loadSubjects = async () => {
        try {
            const data = await getSubjects();
            setSubjects(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const calculatePercentage = (attended: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((attended / total) * 100);
    };

    // Helper to get color based on percentage
    const getPercentageColor = (percent: number) => {
        if (percent >= 75) return 'text-green-500';
        if (percent >= 60) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <ScreenWrapper>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6 mt-2">
                <Text className="text-3xl font-bold text-zinc-900 dark:text-white">Subjects</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Timetable')}
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full"
                >
                    <CalendarIcon size={22} className="text-zinc-900 dark:text-white" />
                </TouchableOpacity>
            </View>

            {/* Grid */}
            {loading ? (
                <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
            ) : (
                <FlatList
                    // We append a "dummy" item at the end to render the Add Button
                    data={[...subjects, { id: -1, name: 'ADD_BUTTON', color: '', total_classes: 0, attended_classes: 0 }]}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => {

                        // Render "Add New" Button
                        if (item.name === 'ADD_BUTTON') {
                            return (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('AddSubject')}
                                    className="w-[48%] h-48 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 items-center justify-center mb-4"
                                >
                                    <View className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full items-center justify-center mb-2">
                                        <Plus size={24} className="text-zinc-500" />
                                    </View>
                                    <Text className="text-zinc-500 font-medium">Add Subject</Text>
                                </TouchableOpacity>
                            );
                        }

                        // Render Real Subject Card
                        const percentage = calculatePercentage(item.attended_classes, item.total_classes);
                        const percentColor = getPercentageColor(percentage);

                        return (
                            <TouchableOpacity className="w-[48%] h-48 bg-white dark:bg-zinc-900 rounded-3xl p-4 justify-between mb-4 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                <View>
                                    <View className="flex-row justify-between items-start mb-2">
                                        <View style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full" />
                                        <MoreVertical size={16} className="text-zinc-300" />
                                    </View>
                                    <Text className="text-lg font-bold text-zinc-900 dark:text-white leading-5 mb-1" numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    <Text className="text-xs text-zinc-500" numberOfLines={1}>
                                        {item.teacher || 'No Teacher'}
                                    </Text>
                                </View>

                                <View>
                                    <Text className={`text-3xl font-bold ${percentColor}`}>{percentage}%</Text>
                                    <Text className="text-xs text-zinc-400">Attendance</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </ScreenWrapper>
    );
}