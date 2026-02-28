/**
 * Settings Service
 * Handles settings persistence with Firestore and local application
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { defaultSettings } from '@/config/defaultSettings';

// Deep merge utility
const deepMerge = (target, source) => {
    const result = { ...target };

    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }

    return result;
};

// Get nested property by path
const getNestedProperty = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Set nested property by path
const setNestedProperty = (obj, path, value) => {
    const result = { ...obj };
    const keys = path.split('.');
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = { ...current[key] };
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return result;
};

// ============================================
// SETTINGS OPERATIONS
// ============================================

/**
 * Load user settings from Firestore
 * Merges with defaults for any missing values
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Complete settings object
 */
export const loadSettings = async (userId) => {
    if (!userId) {
        console.log('📋 No user ID, returning default settings');
        return { ...defaultSettings };
    }

    try {
        const settingsRef = doc(db, 'settings', userId);
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
            const userSettings = settingsDoc.data();
            // Merge with defaults to ensure all fields exist
            const mergedSettings = deepMerge(defaultSettings, userSettings);
            console.log('📋 Settings loaded from Firestore');
            return mergedSettings;
        } else {
            // Create default settings for new user
            console.log('📋 Creating default settings for new user');
            await setDoc(settingsRef, defaultSettings);
            return { ...defaultSettings };
        }
    } catch (error) {
        console.error('❌ Error loading settings:', error);
        return { ...defaultSettings };
    }
};

/**
 * Update a specific setting
 * 
 * @param {string} userId - User ID
 * @param {string} path - Dot-notation path (e.g., 'appearance.theme')
 * @param {any} value - New value
 * @returns {Promise<boolean>} Success status
 */
export const updateSetting = async (userId, path, value) => {
    if (!userId) {
        console.warn('⚠️ Cannot update settings without user ID');
        return false;
    }

    try {
        const settingsRef = doc(db, 'settings', userId);

        // Use dot notation for Firestore update
        await updateDoc(settingsRef, {
            [path]: value,
            updatedAt: new Date().toISOString()
        });

        console.log(`✅ Setting updated: ${path}`);
        return true;
    } catch (error) {
        // If document doesn't exist, create it
        if (error.code === 'not-found') {
            try {
                const newSettings = setNestedProperty(defaultSettings, path, value);
                const settingsRef = doc(db, 'settings', userId);
                await setDoc(settingsRef, {
                    ...newSettings,
                    updatedAt: new Date().toISOString()
                });
                console.log(`✅ Settings created with: ${path}`);
                return true;
            } catch (createError) {
                console.error('❌ Error creating settings:', createError);
                return false;
            }
        }
        console.error('❌ Error updating setting:', error);
        return false;
    }
};

/**
 * Update multiple settings at once
 * 
 * @param {string} userId - User ID
 * @param {Object} updates - Object with path:value pairs
 * @returns {Promise<boolean>} Success status
 */
export const updateSettings = async (userId, updates) => {
    if (!userId) {
        console.warn('⚠️ Cannot update settings without user ID');
        return false;
    }

    try {
        const settingsRef = doc(db, 'settings', userId);

        await updateDoc(settingsRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });

        console.log('✅ Multiple settings updated');
        return true;
    } catch (error) {
        console.error('❌ Error updating settings:', error);
        return false;
    }
};

/**
 * Reset settings to defaults
 * 
 * @param {string} userId - User ID
 * @param {string|null} section - Section to reset (null for all)
 * @returns {Promise<Object>} New settings
 */
export const resetToDefaults = async (userId, section = null) => {
    if (!userId) {
        console.warn('⚠️ Cannot reset settings without user ID');
        return defaultSettings;
    }

    try {
        const settingsRef = doc(db, 'settings', userId);

        if (section && defaultSettings[section]) {
            // Reset specific section
            await updateDoc(settingsRef, {
                [section]: defaultSettings[section],
                updatedAt: new Date().toISOString()
            });
            console.log(`🔄 Reset ${section} to defaults`);

            const currentSettings = await loadSettings(userId);
            return currentSettings;
        } else {
            // Reset all
            await setDoc(settingsRef, {
                ...defaultSettings,
                updatedAt: new Date().toISOString()
            });
            console.log('🔄 Reset all settings to defaults');
            return { ...defaultSettings };
        }
    } catch (error) {
        console.error('❌ Error resetting settings:', error);
        return defaultSettings;
    }
};

/**
 * Apply visual settings (theme, colors, fonts)
 * Updates CSS variables and data attributes
 * 
 * @param {Object} settings - Settings object
 */
export const applySettings = (settings) => {
    if (!settings) return;

    const root = document.documentElement;
    const { appearance, accessibility } = settings;

    // Apply theme
    if (appearance?.theme) {
        if (appearance.theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', appearance.theme);
        }
    }

    // Apply accent color
    if (appearance?.accentColor) {
        root.style.setProperty('--color-accent-user', appearance.accentColor);
    }

    // Apply font size
    if (appearance?.fontSize || accessibility?.textSize) {
        const size = accessibility?.textSize || appearance?.fontSize || 16;
        root.style.setProperty('--font-size-base', `${size}px`);
    }

    // Apply reduced motion
    if (appearance?.reducedMotion || accessibility?.reducedMotion) {
        root.setAttribute('data-reduced-motion', 'true');
    } else {
        root.removeAttribute('data-reduced-motion');
    }

    // Apply contrast mode
    if (accessibility?.contrast) {
        root.setAttribute('data-contrast', accessibility.contrast);
    }

    console.log('🎨 Visual settings applied');
};

/**
 * Save settings to localStorage for immediate load
 * 
 * @param {Object} settings - Settings to cache
 */
export const cacheSettings = (settings) => {
    try {
        localStorage.setItem('neuralsign-settings-cache', JSON.stringify(settings));
    } catch (error) {
        console.warn('⚠️ Could not cache settings:', error);
    }
};

/**
 * Load cached settings from localStorage
 * 
 * @returns {Object|null} Cached settings or null
 */
export const loadCachedSettings = () => {
    try {
        const cached = localStorage.getItem('neuralsign-settings-cache');
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.warn('⚠️ Could not load cached settings:', error);
        return null;
    }
};

/**
 * Clear settings cache
 */
export const clearSettingsCache = () => {
    try {
        localStorage.removeItem('neuralsign-settings-cache');
        console.log('🗑️ Settings cache cleared');
    } catch (error) {
        console.warn('⚠️ Could not clear settings cache:', error);
    }
};

export default {
    loadSettings,
    updateSetting,
    updateSettings,
    resetToDefaults,
    applySettings,
    cacheSettings,
    loadCachedSettings,
    clearSettingsCache
};
