import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { BarChart } from 'react-native-gifted-charts';

export default function StatsScreen() {
    // Mock Data for Chart
    const barData = [
        { value: 72, label: 'CS', frontColor: '#F43F5E' },
        { value: 89, label: 'Math', frontColor: '#3B82F6' },
        { value: 45, label: 'Phy', frontColor: '#10B981' },
        { value: 92, label: 'Hist', frontColor: '#F59E0B' },
    ];

    return (
        <ScreenWrapper>
            <Text className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 mt-2">Analytics</Text>
            <Text className="text-zinc-500 mb-8">Your performance this semester</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Chart Container */}
                <View className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 mb-8 overflow-hidden">
                    <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-6 ml-2">Attendance Overview</Text>
                    <BarChart
                        data={barData}
                        barWidth={35}
                        spacing={25}
                        roundedTop
                        roundedBottom
                        hideRules
                        xAxisThickness={0}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: 'gray' }}
                        xAxisLabelTextStyle={{ color: 'gray', fontSize: 12 }}
                        height={200}
                    />
                </View>

                {/* Breakdown Sections */}
                <View className="flex-row gap-4">
                    <View className="flex-1 bg-green-50 dark:bg-green-900/10 p-5 rounded-3xl">
                        <Text className="text-green-600 font-bold mb-1">On Track</Text>
                        <Text className="text-3xl font-bold text-zinc-900 dark:text-white">3</Text>
                        <Text className="text-xs text-zinc-500 mt-1">Subjects above 75%</Text>
                    </View>

                    <View className="flex-1 bg-red-50 dark:bg-red-900/10 p-5 rounded-3xl">
                        <Text className="text-red-600 font-bold mb-1">Danger Zone</Text>
                        <Text className="text-3xl font-bold text-zinc-900 dark:text-white">1</Text>
                        <Text className="text-xs text-zinc-500 mt-1">Needs attention</Text>
                    </View>
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
}