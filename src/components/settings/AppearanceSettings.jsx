/**
 * Appearance Settings Component
 * Theme, colors, fonts, and animation preferences
 */

import { useSettings } from '@/context/SettingsContext';
import SettingItem from './SettingItem';
import Toggle from './Toggle';
import Slider from './Slider';
import ColorPicker from './ColorPicker';
import { cn } from '@/utils/helpers';

const themeOptions = [
    { value: 'light', label: 'Light', description: 'Light background' },
    { value: 'dark', label: 'Dark', description: 'Dark background' },
    { value: 'auto', label: 'Auto', description: 'Match system' }
];

const AppearanceSettings = () => {
    const { settings, updateSetting } = useSettings();
    const appearance = settings.appearance || {};

    const handleThemeChange = (theme) => {
        updateSetting('appearance.theme', theme);
    };

    const handleAccentColorChange = (color) => {
        updateSetting('appearance.accentColor', color);
    };

    const handleFontSizeChange = (size) => {
        updateSetting('appearance.fontSize', size);
    };

    const handleAnimationToggle = (key, value) => {
        updateSetting(`appearance.animations.${key}`, value);
    };

    const handleReducedMotionToggle = (value) => {
        updateSetting('appearance.reducedMotion', value);
    };

    return (
        <div className="space-y-6">
            {/* Theme Selection */}
            <SettingItem
                label="Theme"
                description="Choose your preferred color theme"
            >
                <div className="flex gap-2 mt-2">
                    {themeOptions.map(({ value, label, description }) => (
                        <button
                            key={value}
                            onClick={() => handleThemeChange(value)}
                            className={cn(
                                'flex-1 p-3 rounded-xl border-2 transition-all',
                                'text-center',
                                appearance.theme === value
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-dark-600 bg-dark-700/50 text-dark-300 hover:border-dark-500'
                            )}
                        >
                            <div className="text-sm font-medium">{label}</div>
                            <div className="text-xs opacity-70">{description}</div>
                        </button>
                    ))}
                </div>
            </SettingItem>

            {/* Accent Color */}
            <SettingItem
                label="Accent Color"
                description="Customize UI accent color"
            >
                <ColorPicker
                    value={appearance.accentColor || '#6366F1'}
                    onChange={handleAccentColorChange}
                    className="mt-2"
                />
            </SettingItem>

            {/* Font Size */}
            <SettingItem
                label="Font Size"
                description="Adjust base text size"
            >
                <Slider
                    value={appearance.fontSize || 16}
                    onChange={handleFontSizeChange}
                    min={12}
                    max={24}
                    step={1}
                    valueFormat={(v) => `${v}px`}
                    className="mt-2"
                />
            </SettingItem>

            {/* Animation Toggles */}
            <div className="space-y-1">
                <div className="text-sm font-medium text-dark-200 mb-3">Animations</div>

                <SettingItem label="Page Transitions" inline>
                    <Toggle
                        checked={appearance.animations?.pageTransitions ?? true}
                        onChange={(v) => handleAnimationToggle('pageTransitions', v)}
                    />
                </SettingItem>

                <SettingItem label="Achievement Celebrations" inline>
                    <Toggle
                        checked={appearance.animations?.achievements ?? true}
                        onChange={(v) => handleAnimationToggle('achievements', v)}
                    />
                </SettingItem>

                <SettingItem label="Confetti Effects" inline>
                    <Toggle
                        checked={appearance.animations?.confetti ?? true}
                        onChange={(v) => handleAnimationToggle('confetti', v)}
                    />
                </SettingItem>

                <SettingItem label="Particle Effects" inline>
                    <Toggle
                        checked={appearance.animations?.particles ?? true}
                        onChange={(v) => handleAnimationToggle('particles', v)}
                    />
                </SettingItem>
            </div>

            {/* Reduced Motion */}
            <SettingItem
                label="Reduced Motion"
                description="Minimize animations for accessibility"
                inline
            >
                <Toggle
                    checked={appearance.reducedMotion || false}
                    onChange={handleReducedMotionToggle}
                />
            </SettingItem>

            {/* Live Preview */}
            <div className="mt-6 p-4 rounded-xl bg-dark-700/50 border border-dark-600">
                <div className="text-xs text-dark-400 mb-3">Preview</div>
                <div className="flex items-center gap-3">
                    <button
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: appearance.accentColor || '#6366F1' }}
                    >
                        Sample Button
                    </button>
                    <span
                        className="text-sm font-medium"
                        style={{ color: appearance.accentColor || '#6366F1' }}
                    >
                        Accent Text
                    </span>
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: appearance.accentColor || '#6366F1' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;
