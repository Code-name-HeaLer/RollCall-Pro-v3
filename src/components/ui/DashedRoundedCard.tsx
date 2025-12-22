import React, { ReactNode, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

type Props = {
    children: ReactNode;
    borderColor?: string;
    backgroundColor?: string;
    borderRadius?: number;
    strokeWidth?: number;
    dashArray?: string;
    style?: ViewStyle;
};

export default function DashedRoundedCard({
    children,
    borderColor = '#d4d4d8', // zinc-300
    backgroundColor = 'transparent',
    borderRadius = 24,
    strokeWidth = 2,
    dashArray = '6 4',
    style,
}: Props) {
    const [size, setSize] = useState({ width: 0, height: 0 });

    const onLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== size.width || height !== size.height) {
            setSize({ width, height });
        }
    };

    const hasSize = size.width > 0 && size.height > 0;

    return (
        <View style={[styles.container, style]} onLayout={onLayout}>
            {hasSize && (
                <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill}>
                    <Rect
                        x={strokeWidth / 2}
                        y={strokeWidth / 2}
                        width={size.width - strokeWidth}
                        height={size.height - strokeWidth}
                        rx={borderRadius}
                        ry={borderRadius}
                        stroke={borderColor}
                        strokeWidth={strokeWidth}
                        // react-native-svg prefers array or number[] here
                        strokeDasharray={dashArray.split(' ').map((n) => Number(n))}
                        fill={backgroundColor}
                    />
                </Svg>
            )}

            {/* Content sits on top of SVG outline */}
            <View style={[styles.content, { borderRadius }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'visible',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


