/**
 * This module overrides React Native's useColorScheme to use our theme context
 * NativeWind v2 uses useColorScheme internally, so we need to override it at the module level
 */

let forcedColorScheme: 'light' | 'dark' | null = null;

export const setForcedColorScheme = (scheme: 'light' | 'dark' | null) => {
    forcedColorScheme = scheme;
};

export const getForcedColorScheme = (): 'light' | 'dark' | null => {
    return forcedColorScheme;
};

