import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withDelay } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AttendanceSpinnerProps {
    percentage: number; // 0 to 100
    radius?: number;
    strokeWidth?: number;
}

export default function AttendanceSpinner({ percentage, radius = 24, strokeWidth = 4 }: AttendanceSpinnerProps) {
    const innerRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * innerRadius;
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(300, withTiming(percentage / 100, { duration: 1000 }));
    }, [percentage]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference * (1 - progress.value);
        return { strokeDashoffset };
    });

    // Color Logic
    let color = '#10B981'; // Green
    if (percentage < 75) color = '#F97316'; // Orange
    if (percentage < 60) color = '#EF4444'; // Red

    // Text Color Logic
    let textColor = 'text-green-500';
    if (percentage < 75) textColor = 'text-orange-500';
    if (percentage < 60) textColor = 'text-red-500';

    return (
        <View className="items-center justify-center">
            {/* 1. Parent Container must be Relative */}
            <View style={{ width: radius * 2, height: radius * 2 }} className="relative justify-center items-center">

                {/* 2. SVG Rotated -90deg so animation starts from top */}
                <Svg width={radius * 2} height={radius * 2}>
                    <G rotation="-90" origin={`${radius}, ${radius}`}>
                        {/* Background Track */}
                        <Circle
                            cx={radius}
                            cy={radius}
                            r={innerRadius}
                            stroke="#E4E4E7"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeOpacity={0.3}
                        />
                        {/* Animated Progress */}
                        <AnimatedCircle
                            cx={radius}
                            cy={radius}
                            r={innerRadius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            animatedProps={animatedProps}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>

                {/* 3. Absolute Text Container Centered */}
                <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
                    <Text className={`font-bold text-xs ${textColor}`}>
                        {percentage}%
                    </Text>
                </View>
            </View>
        </View>
    );
}