/**
 * Settings Context
 * Global state management for user settings
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useAuthStore from '@/store/authStore';
import { defaultSettings } from '@/config/defaultSettings';
import {
    loadSettings,
    updateSetting as updateSettingService,
    updateSettings as updateSettingsService,
    resetToDefaults as resetToDefaultsService,
    applySettings,
    cacheSettings,
    loadCachedSettings
} from '@/services/settingsService';

// Create context
const SettingsContext = createContext(null);

// Deep update utility for local state
const updateNestedState = (state, path, value) => {
    const keys = path.split('.');
    const result = { ...state };
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = { ...current[key] };
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return result;
};

/**
 * Settings Provider Component
 * Wraps app and provides settings state/actions
 */
export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const { user } = useAuthStore();

    // Load settings when user changes
    useEffect(() => {
        const initSettings = async () => {
            setLoading(true);

            // First, try to load cached settings for instant display
            const cached = loadCachedSettings();
            if (cached) {
                setSettings(cached);
                applySettings(cached);
            }

            if (user?.uid) {
                // Load from Firestore
                const userSettings = await loadSettings(user.uid);
                setSettings(userSettings);
                applySettings(userSettings);
                cacheSettings(userSettings);
            } else {
                // Use defaults for non-authenticated users
                setSettings(defaultSettings);
                applySettings(defaultSettings);
            }

            setLoading(false);
            setInitialized(true);
        };

        initSettings();
    }, [user?.uid]);

    // Listen for system theme changes when using 'auto'
    useEffect(() => {
        if (settings.appearance?.theme !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            applySettings(settings);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [settings.appearance?.theme]);

    /**
     * Update a single setting
     * @param {string} path - Dot notation path (e.g., 'appearance.theme')
     * @param {any} value - New value
     */
    const updateSetting = useCallback(async (path, value) => {
        // Update local state immediately for responsive UI
        setSettings(prev => {
            const newSettings = updateNestedState(prev, path, value);
            applySettings(newSettings);
            cacheSettings(newSettings);
            return newSettings;
        });

        // Persist to Firestore
        if (user?.uid) {
            await updateSettingService(user.uid, path, value);
        }
    }, [user?.uid]);

    /**
     * Update multiple settings at once
     * @param {Object} updates - Object with updates to apply
     */
    const updateSettings = useCallback(async (updates) => {
        setSettings(prev => {
            const newSettings = { ...prev, ...updates };
            applySettings(newSettings);
            cacheSettings(newSettings);
            return newSettings;
        });

        if (user?.uid) {
            await updateSettingsService(user.uid, updates);
        }
    }, [user?.uid]);

    /**
     * Reset settings to defaults
     * @param {string|null} section - Section name or null for all
     */
    const resetSettings = useCallback(async (section = null) => {
        if (section && defaultSettings[section]) {
            setSettings(prev => {
                const newSettings = {
                    ...prev,
                    [section]: defaultSettings[section]
                };
                applySettings(newSettings);
                cacheSettings(newSettings);
                return newSettings;
            });
        } else {
            setSettings(defaultSettings);
            applySettings(defaultSettings);
            cacheSettings(defaultSettings);
        }

        if (user?.uid) {
            await resetToDefaultsService(user.uid, section);
        }
    }, [user?.uid]);

    /**
     * Get a specific setting value
     * @param {string} path - Dot notation path
     * @returns {any} Setting value
     */
    const getSetting = useCallback((path) => {
        return path.split('.').reduce((current, key) => current?.[key], settings);
    }, [settings]);

    const value = {
        settings,
        loading,
        initialized,
        updateSetting,
        updateSettings,
        resetSettings,
        getSetting
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

/**
 * Hook to access settings context
 * @returns {Object} Settings context value
 */
export const useSettings = () => {
    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }

    return context;
};

export default SettingsContext;
