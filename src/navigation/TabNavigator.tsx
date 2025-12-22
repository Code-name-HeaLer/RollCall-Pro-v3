import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Home, LibraryBig, CalendarDays, CheckSquare, PieChart, Settings } from 'lucide-react-native';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import SubjectsScreen from '../screens/Subjects/SubjectsScreen';
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import TasksScreen from '../screens/Tasks/TasksScreen';
import StatsScreen from '../screens/Stats/StatsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 20,
                    right: 20,
                    elevation: 0,
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    height: 70, // Height of the area
                },
                tabBarShowLabel: false,
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Subjects" component={SubjectsScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Tasks" component={TasksScreen} />
            <Tab.Screen name="Stats" component={StatsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

// The Custom Floating Dock
function CustomTabBar({ state, descriptors, navigation }: any) {
    return (
        <View
            className="absolute bottom-6 left-5 right-5 flex-row items-center justify-between bg-white dark:bg-zinc-900 rounded-3xl px-6 py-4 border border-indigo-300 dark:border-indigo-800"
            style={{
                // iOS shadows
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                // Android shadow
                elevation: 12,
            }}
        >
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                // Icon Mapping
                let IconComponent;
                const color = isFocused ? '#4F46E5' : '#A1A1AA'; // Indigo-600 vs Zinc-400

                switch (route.name) {
                    case 'Dashboard': IconComponent = Home; break;
                    case 'Subjects': IconComponent = LibraryBig; break;
                    case 'Calendar': IconComponent = CalendarDays; break;
                    case 'Tasks': IconComponent = CheckSquare; break;
                    case 'Stats': IconComponent = PieChart; break;
                    case 'Settings': IconComponent = Settings; break;
                    default: IconComponent = Home;
                }

                const bgClass = isFocused ? 'bg-indigo-100 dark:bg-indigo-500/20' : '';

                return (
                    <TouchableOpacity
                        key={`${route.key}-${isFocused}`}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        className="items-center justify-center"
                    >
                        <View
                            className={`p-2 ${bgClass}`}
                            style={{ borderRadius: 16 }}
                        >
                            {/* @ts-ignore - IconComponent is valid */}
                            <IconComponent size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}