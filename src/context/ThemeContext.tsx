import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, Appearance, View } from 'react-native';
import { getUser, updateThemePreference } from '../db/db';
import { setForcedColorScheme } from '../utils/colorSchemeOverride';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeMode;
    isDark: boolean;
    setTheme: (theme: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeMode>('system');
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
    const [forcedColorScheme, setForcedColorScheme] = useState<'light' | 'dark' | null>(null);

    // Load theme preference from database on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Update isDark and forcedColorScheme when theme or system color scheme changes
    useEffect(() => {
        if (theme === 'system') {
            setIsDark(systemColorScheme === 'dark');
            setForcedColorScheme(null); // Let system decide
        } else {
            const shouldBeDark = theme === 'dark';
            setIsDark(shouldBeDark);
            const scheme = shouldBeDark ? 'dark' : 'light';
            setForcedColorScheme(scheme);
        }
    }, [theme, systemColorScheme]);

    // Listen to system theme changes when in system mode
    useEffect(() => {
        if (theme === 'system') {
            const subscription = Appearance.addChangeListener(({ colorScheme }) => {
                if (theme === 'system') {
                    setIsDark(colorScheme === 'dark');
                    setForcedColorScheme(null);
                }
            });
            return () => subscription.remove();
        }
    }, [theme]);

    const loadThemePreference = async () => {
        try {
            const user = await getUser();
            if (user && user.theme_pref) {
                const savedTheme = user.theme_pref as ThemeMode;
                setThemeState(savedTheme);
                // Immediately apply the theme
                if (savedTheme === 'system') {
                    setIsDark(systemColorScheme === 'dark');
                    setForcedColorScheme(null);
                } else {
                    const shouldBeDark = savedTheme === 'dark';
                    setIsDark(shouldBeDark);
                    const scheme = shouldBeDark ? 'dark' : 'light';
                    setForcedColorScheme(scheme);
                }
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    };

    const setTheme = async (newTheme: ThemeMode) => {
        try {
            await updateThemePreference(newTheme);
            setThemeState(newTheme);
            // Immediately apply the theme
            if (newTheme === 'system') {
                setIsDark(systemColorScheme === 'dark');
                setForcedColorScheme(null);
            } else {
                const shouldBeDark = newTheme === 'dark';
                setIsDark(shouldBeDark);
                const scheme = shouldBeDark ? 'dark' : 'light';
                setForcedColorScheme(scheme);
            }
        } catch (error) {
            console.error('Failed to update theme preference:', error);
        }
    };

    // Determine the actual colorScheme to use for NativeWind
    const actualColorScheme = forcedColorScheme || systemColorScheme || 'light';
    
    // For NativeWind v2, we need to pass colorScheme as a prop
    // This will be read by NativeWind's internal useColorScheme hook
    return (
        <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
            <View 
                style={{ flex: 1 }}
                // Try multiple approaches to force colorScheme
                // @ts-ignore
                colorScheme={actualColorScheme}
                // @ts-ignore - Alternative prop name
                data-color-scheme={actualColorScheme}
            >
                {children}
            </View>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

