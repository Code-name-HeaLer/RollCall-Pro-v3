import React from 'react';
import { View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
}

export default function ScreenWrapper({ children, style, ...props }: ScreenWrapperProps) {
    return (
        <SafeAreaView
            className="flex-1 bg-zinc-50 dark:bg-zinc-950"
            edges={['top', 'left', 'right']} // We handle bottom manually because of the floating dock
        >
            <View className="flex-1 px-5 pt-2" {...props}>
                {children}
            </View>
        </SafeAreaView>
    );
}