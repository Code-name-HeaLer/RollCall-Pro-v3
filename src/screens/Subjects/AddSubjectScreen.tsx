import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, Check, Trash2, Save } from 'lucide-react-native';
import { addSubject, updateSubject, deleteSubject, Subject } from '../../db/db';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

const COLORS = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export default function AddSubjectScreen({ navigation, route }: any) {
    // Check if we are editing
    const subjectToEdit: Subject | undefined = route.params?.subject;
    const isEditing = !!subjectToEdit;

    const { colorScheme } = useColorScheme();
    const bgColor = colorScheme === 'dark' ? '#09090b' : '#f8fafc';

    // Form State
    const [mode, setMode] = useState<'new' | 'mid'>('new');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [name, setName] = useState('');
    const [teacher, setTeacher] = useState('');

    // Mid-Sem fields (Only for creating)
    const [classesDone, setClassesDone] = useState('');
    const [classesAttended, setClassesAttended] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill data if editing
    useEffect(() => {
        if (isEditing && subjectToEdit) {
            setName(subjectToEdit.name);
            setTeacher(subjectToEdit.teacher || '');
            setSelectedColor(subjectToEdit.color);
        }
    }, [isEditing, subjectToEdit]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Hold up!", "Please enter a subject name.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (isEditing && subjectToEdit) {
                // --- UPDATE MODE ---
                await updateSubject(subjectToEdit.id, name, teacher, selectedColor);
            } else {
                // --- CREATE MODE ---
                // Validate Mid-Sem logic
                if (mode === 'mid') {
                    const total = parseInt(classesDone) || 0;
                    const attended = parseInt(classesAttended) || 0;
                    if (attended > total) {
                        Alert.alert("Math Error", "You can't attend more classes than conducted!");
                        setIsSubmitting(false);
                        return;
                    }
                }

                const total = mode === 'mid' ? parseInt(classesDone) || 0 : 0;
                const attended = mode === 'mid' ? parseInt(classesAttended) || 0 : 0;

                await addSubject(name, teacher, selectedColor, total, attended);
            }

            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not save subject.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        if (!subjectToEdit) return;

        Alert.alert(
            "Delete Subject",
            "Are you sure? This will delete all attendance history for this subject.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteSubject(subjectToEdit.id);
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>

            {/* 2. ADDED: Inner View for padding (keeps content neat) */}
            <View className="flex-1 px-6 pt-4">

                {/* Header */}
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {isEditing ? 'Edit Subject' : 'New Subject'}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                        <X size={20} className="text-zinc-600 dark:text-zinc-400" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* Toggle Mode (Only show when CREATING new subject) */}
                    {!isEditing && (
                        <View style={{ backgroundColor: colorScheme === 'dark' ? '#27272a' : '#e4e4e7' }} className="flex-row p-1 rounded-xl mb-8">
                            <TouchableOpacity
                                onPress={() => setMode('new')}
                                style={{ backgroundColor: mode === 'new' ? (colorScheme === 'dark' ? '#3f3f46' : '#ffffff') : 'transparent' }}
                                className={`flex-1 py-3 items-center rounded-lg ${mode === 'new' ? 'shadow-sm' : ''}`}
                            >
                                <Text className={`font-bold ${mode === 'new' ? 'text-zinc-900' : 'text-zinc-500'}`}>New Semester</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMode('mid')}
                                style={{ backgroundColor: mode === 'mid' ? (colorScheme === 'dark' ? '#3f3f46' : '#ffffff') : 'transparent' }}
                                className={`flex-1 py-3 items-center rounded-lg ${mode === 'mid' ? 'shadow-sm' : ''}`}
                            >
                                <Text className={`font-bold ${mode === 'mid' ? 'text-zinc-900' : 'text-zinc-500'}`}>Mid-Sem Start</Text>
                            </TouchableOpacity>
                        </View>
                    )}

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

                        {/* Mid Sem Fields (Only when Creating + Mid Mode) */}
                        {!isEditing && mode === 'mid' && (
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

                {/* Action Buttons */}
                <View className="mt-4 gap-3">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSubmitting}
                        className={`bg-indigo-600 p-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-indigo-500/30 ${isSubmitting ? 'opacity-50' : 'opacity-100'}`}
                    >
                        <Save size={20} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-lg">{isEditing ? 'Save Changes' : 'Create Subject'}</Text>
                    </TouchableOpacity>

                    {isEditing && (
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl flex-row items-center justify-center border border-red-100 dark:border-red-900/30"
                        >
                            <Trash2 size={20} className="text-red-500" style={{ marginRight: 8 }} />
                            <Text className="text-red-500 font-bold text-lg">Delete Subject</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-3 items-center"
                    >
                        <Text className="text-zinc-500 font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}