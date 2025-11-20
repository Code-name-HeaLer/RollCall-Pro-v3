import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Plus, Calendar as CalendarIcon, MoreVertical } from 'lucide-react-native';

type Subject = {
    id: string;
    name: string;
    teacher: string;
    color: string;
    attendance: number;
};

type AddNewItem = {
    id: 'add_new';
};

type ListItem = Subject | AddNewItem;

const MOCK_SUBJECTS: Subject[] = [
    { id: '1', name: 'Computer Science', teacher: 'Dr. Smith', color: '#F43F5E', attendance: 72 },
    { id: '2', name: 'Mathematics', teacher: 'Prof. Johnson', color: '#3B82F6', attendance: 89 },
    { id: '3', name: 'Physics', teacher: 'Mr. Tesla', color: '#10B981', attendance: 45 },
    { id: '4', name: 'History', teacher: 'Mrs. Davis', color: '#F59E0B', attendance: 92 },
];

export default function SubjectsScreen() {
    return (
        <ScreenWrapper>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6 mt-2">
                <Text className="text-3xl font-bold text-zinc-900 dark:text-white">Subjects</Text>
                <TouchableOpacity className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                    <CalendarIcon size={22} className="text-zinc-900 dark:text-white" />
                </TouchableOpacity>
            </View>

            {/* Grid */}
            <FlatList
                data={[...MOCK_SUBJECTS, { id: 'add_new' } as AddNewItem]}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => {
                    // "Add New" Card
                    if (item.id === 'add_new') {
                        return (
                            <TouchableOpacity className="w-[48%] h-48 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 items-center justify-center mb-4">
                                <View className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full items-center justify-center mb-2">
                                    <Plus size={24} className="text-zinc-500" />
                                </View>
                                <Text className="text-zinc-500 font-medium">Add Subject</Text>
                            </TouchableOpacity>
                        );
                    }

                    // Subject Card
                    const subject = item as Subject;
                    return (
                        <TouchableOpacity className="w-[48%] h-48 bg-white dark:bg-zinc-900 rounded-3xl p-4 justify-between mb-4 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <View>
                                <View className="flex-row justify-between items-start mb-2">
                                    <View style={{ backgroundColor: subject.color }} className="w-3 h-3 rounded-full" />
                                    <MoreVertical size={16} className="text-zinc-300" />
                                </View>
                                <Text className="text-lg font-bold text-zinc-900 dark:text-white leading-5 mb-1">{subject.name}</Text>
                                <Text className="text-xs text-zinc-500">{subject.teacher}</Text>
                            </View>

                            <View>
                                <Text className="text-3xl font-bold text-zinc-900 dark:text-white">{subject.attendance}%</Text>
                                <Text className="text-xs text-zinc-400">Attendance</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </ScreenWrapper>
    );
}