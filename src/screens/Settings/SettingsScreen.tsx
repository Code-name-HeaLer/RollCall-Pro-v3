import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Moon, Bell, Download, Upload, Info, ChevronRight, Trash2 } from 'lucide-react-native';
import { updateThemePreference } from '../../db/db';

export default function SettingsScreen() {
    const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Helper to safely toggle and save
    const handleThemeToggle = async () => {
        // 1. Calculate new theme
        const newTheme = colorScheme === 'dark' ? 'light' : 'dark';

        // 2. Apply immediately (Visual)
        setColorScheme(newTheme); // or toggleColorScheme()

        // 3. Save to DB (Persistent)
        try {
            await updateThemePreference(newTheme);
        } catch (e) {
            console.error("Failed to save theme", e);
        }
    };

    // Dynamic colors for icons
    const iconColors = {
        indigo: isDark ? '#818cf8' : '#4f46e5', // indigo-400 : indigo-600
        orange: isDark ? '#fb923c' : '#ea580c', // orange-400 : orange-600
        emerald: isDark ? '#34d399' : '#059669', // emerald-400 : emerald-600
        blue: isDark ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
        red: isDark ? '#f87171' : '#dc2626', // red-400 : red-600
        zinc: isDark ? '#a1a1aa' : '#71717a', // zinc-400 : zinc-500
    };

    // Dynamic background colors for icon containers
    const iconBgColors = {
        indigo: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff', // indigo-900/20 : indigo-100
        orange: isDark ? 'rgba(249, 115, 22, 0.2)' : '#ffedd5', // orange-900/20 : orange-100
        emerald: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5', // emerald-900/20 : emerald-100
        blue: isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe', // blue-900/20 : blue-100
        red: isDark ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2', // red-900/20 : red-100
    };

    return (
        <ScreenWrapper>
            <Text className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 mt-2">Settings</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Section: Appearance */}
                <Text className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 ml-1">Appearance</Text>
                <View className="bg-white dark:bg-zinc-900 rounded-2xl mb-8 overflow-hidden border border-zinc-100 dark:border-zinc-800">
                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center gap-3">
                            <View 
                                style={{ backgroundColor: iconBgColors.indigo }}
                                className="w-8 h-8 rounded-full items-center justify-center"
                            >
                                <Moon size={18} color={iconColors.indigo} />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Dark Mode</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#767577', true: '#4F46E5' }}
                            thumbColor={colorScheme === 'dark' ? '#ffffff' : '#f4f3f4'}
                            value={colorScheme === 'dark'}
                            onValueChange={handleThemeToggle} // <--- Connected!
                        />
                    </View>
                </View>

                {/* Section: Notifications */}
                <Text className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 ml-1">Notifications</Text>
                <View className="bg-white dark:bg-zinc-900 rounded-2xl mb-8 overflow-hidden border border-zinc-100 dark:border-zinc-800">
                    <View className="flex-row items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <View className="flex-row items-center gap-3">
                            <View 
                                style={{ backgroundColor: iconBgColors.orange }}
                                className="w-8 h-8 rounded-full items-center justify-center"
                            >
                                <Bell size={18} color={iconColors.orange} />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Class Reminders</Text>
                        </View>
                        <Switch trackColor={{ false: '#767577', true: '#4F46E5' }} value={true} />
                    </View>
                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center gap-3">
                            <View 
                                style={{ backgroundColor: iconBgColors.orange }}
                                className="w-8 h-8 rounded-full items-center justify-center"
                            >
                                <Bell size={18} color={iconColors.orange} />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Task Deadlines</Text>
                        </View>
                        <Switch trackColor={{ false: '#767577', true: '#4F46E5' }} value={true} />
                    </View>
                </View>

                {/* Section: Data */}
                <Text className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 ml-1">Data Management</Text>
                <View className="bg-white dark:bg-zinc-900 rounded-2xl mb-8 overflow-hidden border border-zinc-100 dark:border-zinc-800">
                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <View className="flex-row items-center gap-3">
                            <View 
                                style={{ backgroundColor: iconBgColors.emerald }}
                                className="w-8 h-8 rounded-full items-center justify-center"
                            >
                                <Download size={18} color={iconColors.emerald} />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Export to CSV</Text>
                        </View>
                        <ChevronRight size={20} color={iconColors.zinc} />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center gap-3">
                            <View 
                                style={{ backgroundColor: iconBgColors.blue }}
                                className="w-8 h-8 rounded-full items-center justify-center"
                            >
                                <Upload size={18} color={iconColors.blue} />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Import Data</Text>
                        </View>
                        <ChevronRight size={20} color={iconColors.zinc} />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-t border-zinc-100 dark:border-zinc-800">
                        <View className="flex-row items-center gap-3">
                            <View 
                                style={{ backgroundColor: iconBgColors.red }}
                                className="w-8 h-8 rounded-full items-center justify-center"
                            >
                                <Trash2 size={18} color={iconColors.red} />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Delete All Data</Text>
                        </View>
                        <ChevronRight size={20} color={iconColors.zinc} />
                    </TouchableOpacity>
                </View>

                {/* Section: About */}
                <View className="items-center mt-1 mb-4">
                    <Text className="text-zinc-400 text-sm">RollCall Pro v3.1.2</Text>
                    <Text className="text-zinc-500 text-xs mt-1">Made with ❤️ | by HeaLer</Text>
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
}