import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Moon, Bell, Download, Upload, Info, ChevronRight, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
    const { theme, isDark, setTheme } = useTheme();
    const isDarkModeEnabled = theme === 'dark';

    const handleThemeToggle = async (value: boolean) => {
        await setTheme(value ? 'dark' : 'light');
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
                            <View className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-full items-center justify-center">
                                <Moon size={18} color={isDark ? "#818CF8" : "#4F46E5"} />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Dark Mode</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#767577', true: '#4F46E5' }}
                            value={isDarkModeEnabled}
                            onValueChange={handleThemeToggle}
                        />
                    </View>
                </View>

                {/* Section: Notifications */}
                <Text className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 ml-1">Notifications</Text>
                <View className="bg-white dark:bg-zinc-900 rounded-2xl mb-8 overflow-hidden border border-zinc-100 dark:border-zinc-800">
                    <View className="flex-row items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full items-center justify-center">
                                <Bell size={18} className="text-orange-600 dark:text-orange-400" />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Class Reminders</Text>
                        </View>
                        <Switch trackColor={{ false: '#767577', true: '#4F46E5' }} value={true} />
                    </View>
                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full items-center justify-center">
                                <Bell size={18} className="text-orange-600 dark:text-orange-400" />
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
                            <View className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-full items-center justify-center">
                                <Download size={18} className="text-emerald-600 dark:text-emerald-400" />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Export to CSV</Text>
                        </View>
                        <ChevronRight size={20} className="text-zinc-400" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full items-center justify-center">
                                <Upload size={18} className="text-blue-600 dark:text-blue-400" />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Import Data</Text>
                        </View>
                        <ChevronRight size={20} className="text-zinc-400" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-t border-zinc-100 dark:border-zinc-800">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full items-center justify-center">
                                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                            </View>
                            <Text className="text-base font-medium text-zinc-900 dark:text-white">Delete All Data</Text>
                        </View>
                        <ChevronRight size={20} className="text-zinc-400" />
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