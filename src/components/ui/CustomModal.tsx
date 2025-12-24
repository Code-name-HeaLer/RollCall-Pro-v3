import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { styled, useColorScheme } from 'nativewind';
import {
    AlertTriangle,
    CheckCircle,
    Info,
    AlertCircle,
    HelpCircle,
} from 'lucide-react-native';

const StyledText = styled(Text);

export type AlertType = 'danger' | 'warning' | 'info' | 'success' | 'error' | 'confirm';

interface CustomModalProps {
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryPress: () => void;
    onSecondaryPress?: () => void;
}

const getIconAndColors = (type: AlertType, isDark: boolean) => {
    const configs = {
        danger: {
            Icon: AlertTriangle,
            iconColor: isDark ? '#f87171' : '#dc2626',
            bgColor: isDark ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2',
            primaryBg: '#dc2626',
            primaryText: '#ffffff',
        },
        warning: {
            Icon: AlertCircle,
            iconColor: isDark ? '#facc15' : '#ca8a04',
            bgColor: isDark ? 'rgba(202, 138, 4, 0.2)' : '#fef3c7',
            primaryBg: '#ca8a04',
            primaryText: '#ffffff',
        },
        error: {
            Icon: AlertCircle,
            iconColor: isDark ? '#f87171' : '#dc2626',
            bgColor: isDark ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2',
            primaryBg: '#dc2626',
            primaryText: '#ffffff',
        },
        info: {
            Icon: Info,
            iconColor: isDark ? '#60a5fa' : '#2563eb',
            bgColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe',
            primaryBg: '#2563eb',
            primaryText: '#ffffff',
        },
        success: {
            Icon: CheckCircle,
            iconColor: isDark ? '#4ade80' : '#16a34a',
            bgColor: isDark ? 'rgba(22, 163, 74, 0.2)' : '#dcfce7',
            primaryBg: '#16a34a',
            primaryText: '#ffffff',
        },
        confirm: {
            Icon: HelpCircle,
            iconColor: isDark ? '#60a5fa' : '#2563eb',
            bgColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe',
            primaryBg: '#2563eb',
            primaryText: '#ffffff',
        },
    };

    return configs[type];
};

export default function CustomModal({
    visible,
    type,
    title,
    message,
    primaryButtonText = 'Ok',
    secondaryButtonText,
    onPrimaryPress,
    onSecondaryPress,
}: CustomModalProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const config = getIconAndColors(type, isDark);
    const { Icon, iconColor, bgColor, primaryBg, primaryText } = config;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/60 justify-center items-center px-6">
                <View className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 items-center">
                    {/* Icon */}
                    <View
                        style={{ backgroundColor: bgColor }}
                        className="w-16 h-16 rounded-full items-center justify-center mb-4"
                    >
                        <Icon size={32} color={iconColor} />
                    </View>

                    {/* Title */}
                    <StyledText className="text-xl font-bold text-zinc-900 dark:text-white text-center mb-2">
                        {title}
                    </StyledText>

                    {/* Message */}
                    <StyledText className="text-zinc-500 dark:text-zinc-400 text-center mb-8 px-4">
                        {message}
                    </StyledText>

                    {/* Buttons */}
                    <View className="flex-row gap-4 w-full">
                        {secondaryButtonText && (
                            <TouchableOpacity
                                onPress={onSecondaryPress}
                                className="flex-1 py-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 items-center"
                            >
                                <StyledText className="font-bold text-zinc-900 dark:text-white">
                                    {secondaryButtonText}
                                </StyledText>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={onPrimaryPress}
                            className="py-4 rounded-xl items-center"
                            style={{
                                backgroundColor: primaryBg,
                                flex: secondaryButtonText ? 1 : undefined,
                                width: secondaryButtonText ? undefined : '100%',
                                ...(type === 'danger' && {
                                    shadowColor: '#dc2626',
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                }),
                            }}
                        >
                            <StyledText style={{ color: primaryText }} className="font-bold">
                                {primaryButtonText}
                            </StyledText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}