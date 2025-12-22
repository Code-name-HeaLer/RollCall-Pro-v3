import React from 'react';
import { View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
}

export default function ScreenWrapper({ children, style, ...props }: ScreenWrapperProps) {
    const { colorScheme } = useColorScheme();
    const bgColor = colorScheme === 'dark' ? '#09090b' : '#f8fafc';

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: bgColor }}
            edges={['top', 'left', 'right']} // We handle bottom manually because of the floating dock
        >
            <View className="flex-1 px-5 pt-2" {...props}>
                {children}
            </View>
        </SafeAreaView>
    );
}