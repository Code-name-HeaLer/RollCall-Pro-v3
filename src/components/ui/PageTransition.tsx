import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    ReduceMotion
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';

interface PageTransitionProps extends ViewProps {
    children: React.ReactNode;
}

export default function PageTransition({ children, style, ...props }: PageTransitionProps) {
    const isFocused = useIsFocused();

    // 0 = Hidden/Down, 1 = Visible/Up
    const progress = useSharedValue(0);

    useEffect(() => {
        if (isFocused) {
            // Screen is Active: Slide Up & Fade In
            progress.value = 0; // Reset to start position
            progress.value = withSpring(1, {
                damping: 18,
                stiffness: 120,
                reduceMotion: ReduceMotion.System,
            });
        } else {
            // Screen is Inactive: Reset silently
            // We don't animate out because the user has already switched tabs instantly
            progress.value = 0;
        }
    }, [isFocused]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: progress.value, // Fade from 0 to 1
            transform: [
                // Slide from 50px down to 0px
                { translateY: (1 - progress.value) * 50 }
            ],
        };
    });

    return (
        <Animated.View
            style={[{ flex: 1 }, style, animatedStyle]}
            {...props}
        >
            {children}
        </Animated.View>
    );
}