import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Calendar } from 'react-native-calendars';
import { useColorScheme } from 'nativewind';

export default function CalendarScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [selectedDate, setSelectedDate] = useState('2023-10-25');

    return (
        <ScreenWrapper>
            <Text className="text-3xl font-bold text-zinc-900 dark:text-white mb-6 mt-2">History</Text>

            {/* Calendar Component */}
            <View className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 mb-6">
                <Calendar
                    onDayPress={(day: any) => setSelectedDate(day.dateString)}
                    markedDates={{
                        '2023-10-23': { marked: true, dotColor: '#10B981' },
                        '2023-10-24': { marked: true, dotColor: '#EF4444' },
                        [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: '#4F46E5' }
                    }}
                    theme={{
                        backgroundColor: 'transparent',
                        calendarBackground: 'transparent',
                        textSectionTitleColor: isDark ? '#A1A1AA' : '#71717A',
                        selectedDayBackgroundColor: '#4F46E5',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#4F46E5',
                        dayTextColor: isDark ? '#E4E4E7' : '#27272A',
                        textDisabledColor: isDark ? '#3F3F46' : '#D4D4D8',
                        monthTextColor: isDark ? '#ffffff' : '#000000',
                        arrowColor: '#4F46E5',
                        textDayFontWeight: '600',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '600',
                    }}
                />
            </View>

            {/* Selected Date Details */}
            <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                Classes on {selectedDate}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Mock Historic Class */}
                <View className="bg-white dark:bg-zinc-900 p-4 rounded-2xl flex-row justify-between items-center mb-3 border border-zinc-100 dark:border-zinc-800">
                    <View>
                        <Text className="text-zinc-900 dark:text-white font-bold text-base">Computer Science</Text>
                        <Text className="text-zinc-500 text-xs">10:00 AM - 11:00 AM</Text>
                    </View>
                    <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                        <Text className="text-green-700 dark:text-green-400 font-bold text-xs">Present</Text>
                    </View>
                </View>

                <View className="bg-white dark:bg-zinc-900 p-4 rounded-2xl flex-row justify-between items-center mb-3 border border-zinc-100 dark:border-zinc-800">
                    <View>
                        <Text className="text-zinc-900 dark:text-white font-bold text-base">Mathematics</Text>
                        <Text className="text-zinc-500 text-xs">11:30 AM - 12:30 PM</Text>
                    </View>
                    <View className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                        <Text className="text-red-700 dark:text-red-400 font-bold text-xs">Absent</Text>
                    </View>
                </View>
            </ScrollView>

        </ScreenWrapper>
    );
}