import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useColorScheme, styled } from 'nativewind';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { BarChart } from 'react-native-gifted-charts';
import PageTransition from '../../components/ui/PageTransition';
import { Trophy, AlertTriangle, TrendingUp, BookOpen } from 'lucide-react-native';

// DB Imports
import { getSubjects, getUser, Subject } from '../../db/db';

const StyledText = styled(Text);
const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        onTrack: 0,
        danger: 0,
        overall: 0,
        bestSubject: 'N/A',
        worstSubject: 'N/A',
        minAttendanceTarget: 75 // Default
    });

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const loadStats = async () => {
        setLoading(true);
        try {
            // 1. Get User Goal
            const user = await getUser();
            const target = user?.min_attendance || 75;

            // 2. Get Subjects
            const subjects = await getSubjects();

            // 3. Process Data
            let totalPercentage = 0;
            let onTrackCount = 0;
            let dangerCount = 0;

            // Trackers for Best/Worst
            let maxPercent = -1;
            let minPercent = 101;
            let bestName = 'N/A';
            let worstName = 'N/A';

            const graphData = subjects.map((sub: Subject) => {
                const total = sub.total_classes || 0;
                const attended = sub.attended_classes || 0;
                const percentage = total === 0 ? 0 : Math.round((attended / total) * 100);

                // Stats Logic
                if (percentage >= target) onTrackCount++;
                else dangerCount++;

                totalPercentage += percentage;

                // Best/Worst Logic (Only counts if classes > 0)
                if (total > 0) {
                    // Find Best
                    if (percentage > maxPercent) {
                        maxPercent = percentage;
                        bestName = sub.name;
                    }
                    // Find Lowest (Potential Worst)
                    if (percentage < minPercent) {
                        minPercent = percentage;
                        worstName = sub.name;
                    }
                }

                return {
                    value: percentage,
                    label: sub.name.length > 4 ? sub.name.substring(0, 4) + '..' : sub.name,
                    frontColor: sub.color,
                    topLabelComponent: () => (
                        <StyledText className="text-[10px] text-zinc-500 font-bold mb-1">{percentage}%</StyledText>
                    ),
                };
            });

            const avg = subjects.length > 0 ? Math.round(totalPercentage / subjects.length) : 0;

            // --- SENIOR LOGIC FIX ---
            // If the lowest percentage is actually ABOVE or EQUAL to the target,
            // then nothing "Needs Work".
            const finalWorstSubject = (minPercent < target && worstName !== 'N/A') ? worstName : 'N/A';

            // If best and worst are N/A (no classes yet), keep N/A.
            // If we have data, Best is always valid. Worst depends on the check above.

            setChartData(graphData);
            setStats({
                onTrack: onTrackCount,
                danger: dangerCount,
                overall: avg,
                bestSubject: bestName,
                worstSubject: finalWorstSubject, // <--- Use the filtered result
                minAttendanceTarget: target
            });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <PageTransition>
                <StyledText className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 mt-2">Analytics</StyledText>
                <StyledText className="text-zinc-500 mb-8">
                    Target: <StyledText className="text-indigo-500 font-bold">{stats.minAttendanceTarget}%</StyledText> attendance
                </StyledText>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

                    {/* 1. MAIN CHART */}
                    <View className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 mb-8">
                        <StyledText className="text-lg font-bold text-zinc-900 dark:text-white mb-4 ml-2">Attendance Overview</StyledText>
                        {chartData.length > 0 ? (
                            <BarChart
                                data={chartData}
                                barWidth={30}
                                spacing={24}
                                roundedTop
                                roundedBottom
                                hideRules
                                xAxisThickness={0}
                                yAxisThickness={0}
                                yAxisTextStyle={{ color: isDark ? '#A1A1AA' : '#71717A' }}
                                xAxisLabelTextStyle={{ color: isDark ? '#A1A1AA' : '#71717A', fontSize: 11 }}
                                noOfSections={4}
                                maxValue={100}
                                height={200}
                                width={screenWidth - 80} // Responsive width
                                initialSpacing={10}
                                yAxisExtraHeight={14}
                            />
                        ) : (
                            <View className="h-[200px] justify-center items-center">
                                <StyledText className="text-zinc-400">No subjects added yet.</StyledText>
                            </View>
                        )}
                    </View>

                    {/* 2. SUMMARY CARDS (On Track / Danger) */}
                    <View className="flex-row gap-4 mb-4">
                        <View
                            style={{ backgroundColor: isDark ? 'rgba(5, 150, 105, 0.15)' : '#ecfdf5' }}
                            className="flex-1 p-5 rounded-3xl border border-transparent dark:border-emerald-900/30"
                        >
                            <View className="flex-row items-center gap-2 mb-2 ml-[-15px]">
                                <View className="bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-full">
                                    <TrendingUp size={16} color={isDark ? '#34d399' : '#059669'} />
                                </View>
                                <StyledText className="text-emerald-700 dark:text-emerald-400 font-bold">On Track</StyledText>
                            </View>
                            <StyledText className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.onTrack}</StyledText>
                            <StyledText className="text-xs text-zinc-500 mt-1">Subjects &gt; {stats.minAttendanceTarget}%</StyledText>
                        </View>

                        <View
                            style={{ backgroundColor: isDark ? 'rgba(185, 28, 28, 0.15)' : '#fef2f2' }}
                            className="flex-1 p-5 rounded-3xl border border-transparent dark:border-red-900/30"
                        >
                            <View className="flex-row items-center gap-2 mb-2 ml-[-15px]">
                                <View className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-full">
                                    <AlertTriangle size={16} color={isDark ? '#f87171' : '#b91c1c'} />
                                </View>
                                <StyledText className="text-red-700 dark:text-red-400 font-bold">Danger Zone</StyledText>
                            </View>
                            <StyledText className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.danger}</StyledText>
                            <StyledText className="text-xs text-zinc-500 mt-1">Subjects &lt; {stats.minAttendanceTarget}%</StyledText>
                        </View>
                    </View>

                    {/* 3. INSIGHTS ROW (Best / Worst) */}
                    <View className="flex-row gap-4">
                        <View className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                            <View className="mb-2">
                                <Trophy size={20} color="#EFBF04" />
                            </View>
                            <StyledText className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">Best Subject</StyledText>
                            <StyledText className="text-lg font-bold text-zinc-900 dark:text-white" numberOfLines={1}>
                                {stats.bestSubject}
                            </StyledText>
                        </View>

                        <View className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                            <View className="mb-2">
                                <BookOpen size={20} color="#CE8946" />
                            </View>
                            <StyledText className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">Needs Work</StyledText>
                            <StyledText className="text-lg font-bold text-zinc-900 dark:text-white" numberOfLines={1}>
                                {stats.worstSubject}
                            </StyledText>
                        </View>
                    </View>

                </ScrollView>
            </PageTransition>
        </ScreenWrapper>
    );
}