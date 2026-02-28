/**
 * Settings Page
 * Main settings page with collapsible sections
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Palette,
    BookOpen,
    Bell,
    Accessibility,
    Shield,
    Camera,
    Volume2,
    Globe,
    Database,
    RotateCcw
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import Button from '@/components/common/Button';
import {
    SettingsSection,
    AccountSettings,
    AppearanceSettings,
    LearningPreferences,
    NotificationSettings,
    AccessibilitySettings,
    PrivacySettings,
    CameraSettings,
    AudioSettings,
    LanguageSettings,
    DataManagement
} from '@/components/settings';
import { cn } from '@/utils/helpers';

const settingsSections = [
    {
        id: 'account',
        icon: User,
        title: 'Account',
        description: 'Profile, email, password, connected accounts',
        component: AccountSettings
    },
    {
        id: 'appearance',
        icon: Palette,
        title: 'Appearance',
        description: 'Theme, colors, fonts, animations',
        component: AppearanceSettings,
        defaultOpen: true
    },
    {
        id: 'learning',
        icon: BookOpen,
        title: 'Learning Preferences',
        description: 'Difficulty, practice defaults, hints, AI sensitivity',
        component: LearningPreferences
    },
    {
        id: 'notifications',
        icon: Bell,
        title: 'Notifications',
        description: 'Push, email, reminders, quiet hours',
        component: NotificationSettings
    },
    {
        id: 'accessibility',
        icon: Accessibility,
        title: 'Accessibility',
        description: 'Text size, contrast, motion, keyboard shortcuts',
        component: AccessibilitySettings
    },
    {
        id: 'privacy',
        icon: Shield,
        title: 'Privacy & Data',
        description: 'Profile visibility, leaderboard, data collection',
        component: PrivacySettings
    },
    {
        id: 'camera',
        icon: Camera,
        title: 'Camera & Detection',
        description: 'Camera selection, sensitivity, overlays, backgrounds',
        component: CameraSettings
    },
    {
        id: 'audio',
        icon: Volume2,
        title: 'Audio',
        description: 'Volume, sound effects, voice feedback, music',
        component: AudioSettings
    },
    {
        id: 'language',
        icon: Globe,
        title: 'Language',
        description: 'App language, sign language variant, regional formats',
        component: LanguageSettings
    },
    {
        id: 'data',
        icon: Database,
        title: 'Data Management',
        description: 'Export data, clear cache, reset progress, delete account',
        component: DataManagement
    }
];

const Settings = () => {
    const { loading, resetSettings } = useSettings();
    const [resetting, setResetting] = useState(false);

    const handleResetAll = async () => {
        setResetting(true);
        await resetSettings();
        setResetting(false);
    };

    return (
        <div className="min-h-screen pt-20 md:pt-24 pb-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <Link
                            to="/profile"
                            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-dark-400" />
                        </Link>
                        <h1 className="text-2xl font-bold gradient-text">Settings</h1>
                    </div>
                    <p className="text-dark-400 ml-12">
                        Customize your NeuralSign experience
                    </p>
                </motion.div>

                {/* Settings Sections */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    {settingsSections.map((section, index) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                        >
                            <SettingsSection
                                icon={section.icon}
                                title={section.title}
                                description={section.description}
                                defaultOpen={section.defaultOpen}
                            >
                                <section.component />
                            </SettingsSection>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Reset All Settings */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-4 rounded-xl bg-dark-800/50 border border-dark-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-dark-200">Reset All Settings</div>
                            <p className="text-xs text-dark-400">Restore all settings to their default values</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<RotateCcw className="w-4 h-4" />}
                            onClick={handleResetAll}
                            isLoading={resetting}
                        >
                            Reset All
                        </Button>
                    </div>
                </motion.div>

                {/* Version Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-center text-xs text-dark-500"
                >
                    <p>NeuralSign v1.0.0</p>
                    <p className="mt-1">
                        <a href="#" className="hover:text-primary">Privacy Policy</a>
                        {' · '}
                        <a href="#" className="hover:text-primary">Terms of Service</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
