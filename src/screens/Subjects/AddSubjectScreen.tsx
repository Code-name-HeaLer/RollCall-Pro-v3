import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { addSubject } from '../../db/db'; // Import the new helper

const COLORS = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export default function AddSubjectScreen({ navigation: navProp }: any) {
    // Use hook as fallback if prop is not available
    const navHook = useNavigation();
    const navigation = navProp || navHook;
    const [mode, setMode] = useState<'new' | 'mid'>('new');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    // Form State
    const [name, setName] = useState('');
    const [teacher, setTeacher] = useState('');
    const [classesDone, setClassesDone] = useState('');
    const [classesAttended, setClassesAttended] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        // 1. Validation
        if (!name.trim()) {
            Alert.alert("Hold up!", "Please enter a subject name.");
            return;
        }

        if (mode === 'mid') {
            const total = parseInt(classesDone) || 0;
            const attended = parseInt(classesAttended) || 0;
            if (attended > total) {
                Alert.alert("Math Error", "You can't attend more classes than conducted!");
                return;
            }
        }

        setIsSubmitting(true);

        try {
            // 2. Prepare Data
            const total = mode === 'mid' ? parseInt(classesDone) || 0 : 0;
            const attended = mode === 'mid' ? parseInt(classesAttended) || 0 : 0;

            // 3. Save to DB
            await addSubject(name, teacher, selectedColor, total, attended);

            // 4. Close Modal
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not save subject.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-6">

            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
                <Text className="text-2xl font-bold text-zinc-900 dark:text-white">New Subject</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                    <X size={20} className="text-zinc-600 dark:text-zinc-400" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Toggle Mode */}
                <View className="flex-row bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl mb-8">
                    <TouchableOpacity
                        onPress={() => setMode('new')}
                        className={`flex-1 py-3 items-center rounded-lg ${mode === 'new' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${mode === 'new' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>New Semester</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setMode('mid')}
                        className={`flex-1 py-3 items-center rounded-lg ${mode === 'mid' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${mode === 'mid' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>Mid-Sem Start</Text>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View className="space-y-6">
                    <View>
                        <Text className="text-zinc-500 font-medium mb-2 ml-1">Subject Name</Text>
                        <TextInput
                            placeholder="e.g. Data Structures"
                            placeholderTextColor="#A1A1AA"
                            value={name}
                            onChangeText={setName}
                            className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                        />
                    </View>

                    <View>
                        <Text className="text-zinc-500 font-medium mb-2 ml-1">Teacher (Optional)</Text>
                        <TextInput
                            placeholder="e.g. Dr. Roberts"
                            placeholderTextColor="#A1A1AA"
                            value={teacher}
                            onChangeText={setTeacher}
                            className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                        />
                    </View>

                    {/* Mid Sem Only Fields */}
                    {mode === 'mid' && (
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-zinc-500 font-medium mb-2 ml-1">Classes Done</Text>
                                <TextInput
                                    placeholder="0"
                                    keyboardType="number-pad"
                                    placeholderTextColor="#A1A1AA"
                                    value={classesDone}
                                    onChangeText={setClassesDone}
                                    className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-zinc-500 font-medium mb-2 ml-1">Attended</Text>
                                <TextInput
                                    placeholder="0"
                                    keyboardType="number-pad"
                                    placeholderTextColor="#A1A1AA"
                                    value={classesAttended}
                                    onChangeText={setClassesAttended}
                                    className="bg-white dark:bg-zinc-900 p-4 rounded-2xl text-lg text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
                                />
                            </View>
                        </View>
                    )}

                    {/* Color Picker */}
                    <View>
                        <Text className="text-zinc-500 font-medium mb-3 ml-1">Accent Color</Text>
                        <View className="flex-row flex-wrap gap-4">
                            {COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setSelectedColor(color)}
                                    style={{ backgroundColor: color }}
                                    className={`w-12 h-12 rounded-full items-center justify-center ${selectedColor === color ? 'border-4 border-white dark:border-zinc-800 shadow-lg' : ''}`}
                                >
                                    {selectedColor === color && <Check size={20} color="white" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity
                onPress={handleSave}
                disabled={isSubmitting}
                className={`bg-indigo-600 p-5 rounded-2xl items-center shadow-lg shadow-indigo-500/30 mt-4 ${isSubmitting ? 'opacity-50' : 'opacity-100'}`}
            >
                <Text className="text-white font-bold text-lg">{isSubmitting ? 'Saving...' : 'Create Subject'}</Text>
            </TouchableOpacity>
        </View>
    );
}