import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Plus, Calendar as CalendarIcon, MoreVertical, Pencil } from 'lucide-react-native';
import { getSubjects, Subject } from '../../db/db'; // Import helpers

import AttendanceSpinner from '../../components/ui/AttendanceSpinner';
import DashedRoundedCard from '../../components/ui/DashedRoundedCard';

export default function SubjectsScreen({ navigation }: any) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();

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
                            const borderColor =
                                colorScheme === 'dark' ? '#3f3f46' /* zinc-700 */ : '#d4d4d8'; /* zinc-300 */
                            const cardBg =
                                colorScheme === 'dark' ? '#27272a' /* zinc-800-ish */ : '#f4f4f5'; /* zinc-100 */

                            return (
                                <DashedRoundedCard
                                    borderColor={borderColor}
                                    backgroundColor={cardBg}
                                    borderRadius={24}
                                    strokeWidth={2}
                                    dashArray="6 4"
                                    style={{ width: '48%', height: 106, marginBottom: 12 }} // h-28 ~ 112
                                >
                                    {/* Make inner content transparent so the SVG border remains visible */}
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('AddSubject')}
                                        className="w-full h-full items-center justify-center"
                                        activeOpacity={0.8}
                                    >
                                        <Plus size={24} className="text-zinc-500 mb-1" />
                                        <Text className="text-zinc-500 text-xs font-medium">Add Subject</Text>
                                    </TouchableOpacity>
                                </DashedRoundedCard>
                            );
                        }

                        // Render Real Subject Card
                        const percentage = calculatePercentage(item.attended_classes, item.total_classes);
                        const percentColor = getPercentageColor(percentage);

                        return (
                            <TouchableOpacity
                                // Optional: If you want clicking the card to open Edit, keep this. 
                                // Or you can make just the Pencil clickable later.
                                onPress={() => navigation.navigate('AddSubject', { subject: item })} // We will handle edit logic later
                                style={{
                                    backgroundColor: `${item.color}20`,
                                    borderColor: `${item.color}40`,
                                }}
                                // Changed h-28 to h-32 for better spacing
                                className="w-[48%] h-[106px] rounded-3xl p-3 mb-3 border relative"
                            >


                                {/* Main Content Row */}
                                <View className="flex-row items-center justify-between h-full pt-2">

                                    {/* Left Side: Info */}
                                    <View className="flex-1 mr-2 justify-center">
                                        <Text
                                            className="text-base font-bold text-zinc-900 dark:text-white leading-5 mb-1"
                                            numberOfLines={2}
                                        >
                                            {item.name}
                                        </Text>

                                        <Text
                                            className="text-[10px] text-zinc-500 tracking-wide mb-2"
                                            numberOfLines={1}
                                        >
                                            {item.teacher || 'No Teacher'}
                                        </Text>

                                        {/* Stats Badge: 5/7 */}
                                        <View className="self-start px-2 py-1 rounded-lg"
                                            style={{
                                                backgroundColor: `${item.color}30`
                                            }}>
                                            <Text className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                {item.attended_classes} <Text className="text-zinc-400 font-normal">/</Text> {item.total_classes}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Right Side: Spinner */}
                                    <View>
                                        <AttendanceSpinner percentage={percentage} radius={24} strokeWidth={4} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </ScreenWrapper>
    );
}