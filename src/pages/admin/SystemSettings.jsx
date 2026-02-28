/**
 * System Settings
 * System-wide configuration panel
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Save,
    RotateCcw,
    Globe,
    BookOpen,
    Users,
    Eye,
    Bell,
    CheckCircle
} from 'lucide-react';

const DEFAULT_SETTINGS = {
    general: {
        siteName: 'NeuralSign',
        siteDescription: 'AI-Powered Sign Language Learning Platform',
        maintenanceMode: false,
        debugMode: false
    },
    content: {
        autoPublish: false,
        requireReview: true,
        maxVideoSize: 50,
        allowedFormats: ['mp4', 'webm', 'mov'],
        defaultDifficulty: 1,
        defaultStatus: 'draft'
    },
    users: {
        allowRegistration: true,
        requireEmailVerification: false,
        maxLoginAttempts: 5,
        sessionTimeout: 60,
        defaultXpPerWord: 10,
        levelUpMultiplier: 1.5
    },
    detection: {
        confidenceThreshold: 0.7,
        minDetectionFrames: 5,
        maxDetectionTime: 10,
        enableFeedback: true,
        useGPU: true
    },
    notifications: {
        emailNotifications: true,
        dailyDigest: false,
        weeklyReport: true,
        newUserAlert: true,
        contentAlert: true
    }
};

const SystemSettings = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        const saved = localStorage.getItem('neuralsign-admin-settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved settings');
            }
        }
    }, []);

    const updateSetting = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            localStorage.setItem('neuralsign-admin-settings', JSON.stringify(settings));
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (!confirm('Reset all settings to defaults? This cannot be undone.')) return;
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem('neuralsign-admin-settings');
        setSaved(false);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'content', label: 'Content', icon: BookOpen },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'detection', label: 'Detection', icon: Eye },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">System Settings</h1>
                    <p className="text-dark-400 text-sm mt-1">Configure platform behavior</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                        {saved ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-dark-800 border border-dark-700 rounded-xl p-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${activeTab === tab.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-dark-400 hover:bg-dark-700 hover:text-white'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Settings Content */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                {activeTab === 'general' && (
                    <SettingsSection title="General Settings">
                        <TextSetting
                            label="Site Name"
                            value={settings.general.siteName}
                            onChange={(v) => updateSetting('general', 'siteName', v)}
                        />
                        <TextSetting
                            label="Site Description"
                            value={settings.general.siteDescription}
                            onChange={(v) => updateSetting('general', 'siteDescription', v)}
                        />
                        <ToggleSetting
                            label="Maintenance Mode"
                            description="Temporarily disable the site for non-admin users"
                            value={settings.general.maintenanceMode}
                            onChange={(v) => updateSetting('general', 'maintenanceMode', v)}
                        />
                        <ToggleSetting
                            label="Debug Mode"
                            description="Show detailed error messages and logging"
                            value={settings.general.debugMode}
                            onChange={(v) => updateSetting('general', 'debugMode', v)}
                        />
                    </SettingsSection>
                )}

                {activeTab === 'content' && (
                    <SettingsSection title="Content Settings">
                        <ToggleSetting
                            label="Auto-Publish"
                            description="Automatically publish new words without review"
                            value={settings.content.autoPublish}
                            onChange={(v) => updateSetting('content', 'autoPublish', v)}
                        />
                        <ToggleSetting
                            label="Require Review"
                            description="Require admin review before publishing"
                            value={settings.content.requireReview}
                            onChange={(v) => updateSetting('content', 'requireReview', v)}
                        />
                        <NumberSetting
                            label="Max Video Size (MB)"
                            value={settings.content.maxVideoSize}
                            min={10}
                            max={200}
                            onChange={(v) => updateSetting('content', 'maxVideoSize', v)}
                        />
                        <SelectSetting
                            label="Default Status"
                            value={settings.content.defaultStatus}
                            options={['draft', 'review', 'published']}
                            onChange={(v) => updateSetting('content', 'defaultStatus', v)}
                        />
                        <NumberSetting
                            label="Default Difficulty"
                            value={settings.content.defaultDifficulty}
                            min={1}
                            max={5}
                            onChange={(v) => updateSetting('content', 'defaultDifficulty', v)}
                        />
                    </SettingsSection>
                )}

                {activeTab === 'users' && (
                    <SettingsSection title="User Settings">
                        <ToggleSetting
                            label="Allow Registration"
                            description="Allow new users to register"
                            value={settings.users.allowRegistration}
                            onChange={(v) => updateSetting('users', 'allowRegistration', v)}
                        />
                        <ToggleSetting
                            label="Require Email Verification"
                            description="Require users to verify their email"
                            value={settings.users.requireEmailVerification}
                            onChange={(v) => updateSetting('users', 'requireEmailVerification', v)}
                        />
                        <NumberSetting
                            label="Max Login Attempts"
                            value={settings.users.maxLoginAttempts}
                            min={3}
                            max={10}
                            onChange={(v) => updateSetting('users', 'maxLoginAttempts', v)}
                        />
                        <NumberSetting
                            label="Session Timeout (minutes)"
                            value={settings.users.sessionTimeout}
                            min={15}
                            max={1440}
                            onChange={(v) => updateSetting('users', 'sessionTimeout', v)}
                        />
                        <NumberSetting
                            label="XP Per Word"
                            value={settings.users.defaultXpPerWord}
                            min={1}
                            max={100}
                            onChange={(v) => updateSetting('users', 'defaultXpPerWord', v)}
                        />
                    </SettingsSection>
                )}

                {activeTab === 'detection' && (
                    <SettingsSection title="Sign Detection Parameters">
                        <NumberSetting
                            label="Confidence Threshold"
                            value={settings.detection.confidenceThreshold}
                            min={0.1}
                            max={1}
                            step={0.05}
                            onChange={(v) => updateSetting('detection', 'confidenceThreshold', v)}
                        />
                        <NumberSetting
                            label="Min Detection Frames"
                            value={settings.detection.minDetectionFrames}
                            min={1}
                            max={30}
                            onChange={(v) => updateSetting('detection', 'minDetectionFrames', v)}
                        />
                        <NumberSetting
                            label="Max Detection Time (sec)"
                            value={settings.detection.maxDetectionTime}
                            min={5}
                            max={60}
                            onChange={(v) => updateSetting('detection', 'maxDetectionTime', v)}
                        />
                        <ToggleSetting
                            label="Enable Live Feedback"
                            description="Show real-time detection feedback to user"
                            value={settings.detection.enableFeedback}
                            onChange={(v) => updateSetting('detection', 'enableFeedback', v)}
                        />
                        <ToggleSetting
                            label="Use GPU Acceleration"
                            description="Use WebGL for faster detection"
                            value={settings.detection.useGPU}
                            onChange={(v) => updateSetting('detection', 'useGPU', v)}
                        />
                    </SettingsSection>
                )}

                {activeTab === 'notifications' && (
                    <SettingsSection title="Notification Preferences">
                        <ToggleSetting
                            label="Email Notifications"
                            description="Send notifications via email"
                            value={settings.notifications.emailNotifications}
                            onChange={(v) => updateSetting('notifications', 'emailNotifications', v)}
                        />
                        <ToggleSetting
                            label="Daily Digest"
                            description="Send daily summary email"
                            value={settings.notifications.dailyDigest}
                            onChange={(v) => updateSetting('notifications', 'dailyDigest', v)}
                        />
                        <ToggleSetting
                            label="Weekly Report"
                            description="Send weekly analytics report"
                            value={settings.notifications.weeklyReport}
                            onChange={(v) => updateSetting('notifications', 'weeklyReport', v)}
                        />
                        <ToggleSetting
                            label="New User Alerts"
                            description="Notify when new users register"
                            value={settings.notifications.newUserAlert}
                            onChange={(v) => updateSetting('notifications', 'newUserAlert', v)}
                        />
                        <ToggleSetting
                            label="Content Alerts"
                            description="Notify when content needs review"
                            value={settings.notifications.contentAlert}
                            onChange={(v) => updateSetting('notifications', 'contentAlert', v)}
                        />
                    </SettingsSection>
                )}
            </div>
        </div>
    );
};

// ─── Setting Components ──────────────────────────────────

function SettingsSection({ title, children }) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-white mb-5">{title}</h3>
            <div className="space-y-5">{children}</div>
        </div>
    );
}

function ToggleSetting({ label, description, value, onChange }) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="text-white text-sm font-medium">{label}</p>
                {description && <p className="text-dark-500 text-xs mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-dark-600'
                    }`}
            >
                <motion.div
                    animate={{ x: value ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                />
            </button>
        </div>
    );
}

function TextSetting({ label, value, onChange }) {
    return (
        <div className="py-2">
            <label className="block text-white text-sm font-medium mb-1.5">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
        </div>
    );
}

function NumberSetting({ label, value, min, max, step = 1, onChange }) {
    return (
        <div className="py-2 flex items-center justify-between">
            <label className="text-white text-sm font-medium">{label}</label>
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-24 px-3 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
        </div>
    );
}

function SelectSetting({ label, value, options, onChange }) {
    return (
        <div className="py-2 flex items-center justify-between">
            <label className="text-white text-sm font-medium">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
                {options.map(opt => (
                    <option key={opt} value={opt} className="capitalize">
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SystemSettings;
