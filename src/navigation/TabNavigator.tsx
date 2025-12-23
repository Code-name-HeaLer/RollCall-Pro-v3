import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { Home, LibraryBig, CalendarDays, CheckSquare, PieChart, Settings } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Import Screens
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
                    height: 70,
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
    // 1. Measure the container width to calculate slide distance
    const [layout, setLayout] = useState({ width: 0, height: 0 });

    // 2. Shared Value for X Position
    const translateX = useSharedValue(0);

    // Constants
    const PADDING_X = 24; // px-6 = 24px
    const TAB_COUNT = state.routes.length;

    // Calculate the width of a SINGLE tab slot
    // (Total Width - Total Padding) / Number of Tabs
    const tabWidth = (layout.width - (PADDING_X * 2)) / TAB_COUNT;

    // 3. Update Position when Index Changes
    useEffect(() => {
        if (tabWidth > 0) {
            // Move to: Padding + (Index * SlotWidth)
            const targetX = PADDING_X + (state.index * tabWidth);

            translateX.value = withSpring(targetX, {
                damping: 15,
                stiffness: 150,
                mass: 0.5,
            });
        }
    }, [state.index, tabWidth]);

    // 4. Animated Style for the Cursor
    const cursorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
            width: tabWidth, // The cursor matches the slot width
        };
    });

    return (
        <View
            onLayout={(e) => setLayout(e.nativeEvent.layout)}
            className="absolute bottom-6 left-5 right-5 justify-center bg-white dark:bg-zinc-900 rounded-3xl border border-indigo-300 dark:border-indigo-800"
            style={{
                height: 70, // Fixed height for calculations
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 12,
            }}
        >
            {/* --- THE SLIDING CURSOR (Ghost) --- */}
            {layout.width > 0 && (
                <Animated.View
                    className="absolute bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl"
                    style={[
                        cursorStyle,
                        {
                            height: 44, // Slightly smaller than container
                            top: 12,    // Centered vertically (70 - 44) / 2 = 13 (approx 12-13)
                        }
                    ]}
                />
            )}

            {/* --- THE ICONS (Overlay) --- */}
            <View className="flex-row items-center justify-between px-6 w-full h-full">
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
                        navigation.emit({ type: 'tabLongPress', target: route.key });
                    };

                    let IconComponent;
                    const color = isFocused ? '#4F46E5' : '#A1A1AA';

                    switch (route.name) {
                        case 'Dashboard': IconComponent = Home; break;
                        case 'Subjects': IconComponent = LibraryBig; break;
                        case 'Calendar': IconComponent = CalendarDays; break;
                        case 'Tasks': IconComponent = CheckSquare; break;
                        case 'Stats': IconComponent = PieChart; break;
                        case 'Settings': IconComponent = Settings; break;
                        default: IconComponent = Home;
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            className="items-center justify-center flex-1 h-full"
                            style={{ zIndex: 10 }} // Ensure click sits above the cursor
                        >
                            {/* Icons have NO background now, the Cursor handles it */}
                            {/* @ts-ignore */}
                            <IconComponent size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}