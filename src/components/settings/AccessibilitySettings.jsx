/**
 * Accessibility Settings Component
 * Text size, contrast, motion, keyboard settings
 */

import { useState } from 'react';
import { Eye, Type, Keyboard, Lightbulb } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import SettingItem from './SettingItem';
import Toggle from './Toggle';
import Slider from './Slider';
import Modal from '@/components/common/Modal';
import { cn } from '@/utils/helpers';

const contrastOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High Contrast' },
    { value: 'extra-high', label: 'Extra High' }
];

const colorBlindOptions = [
    { value: 'none', label: 'None' },
    { value: 'protanopia', label: 'Protanopia (Red-blind)' },
    { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
    { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' }
];

const keyboardShortcuts = [
    { key: 'Space', action: 'Start/Stop practice' },
    { key: 'Enter', action: 'Confirm selection' },
    { key: 'Escape', action: 'Close modal/menu' },
    { key: '→', action: 'Next sign' },
    { key: '←', action: 'Previous sign' },
    { key: 'H', action: 'Toggle hints' },
    { key: 'R', action: 'Retry current sign' },
    { key: 'S', action: 'Skip current sign' }
];

const AccessibilitySettings = () => {
    const { settings, updateSetting } = useSettings();
    const access = settings.accessibility || {};
    const [showShortcuts, setShowShortcuts] = useState(false);

    return (
        <div className="space-y-6">
            {/* Text Size */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Type className="w-4 h-4" />
                    Text Size
                </div>

                <Slider
                    value={access.textSize || 16}
                    onChange={(v) => updateSetting('accessibility.textSize', v)}
                    min={12}
                    max={24}
                    step={1}
                    valueFormat={(v) => `${v}px`}
                />

                {/* Preview */}
                <div className="p-3 rounded-lg bg-dark-700/50 border border-dark-600">
                    <p style={{ fontSize: access.textSize || 16 }} className="text-dark-200">
                        Sample text at {access.textSize || 16}px
                    </p>
                </div>
            </div>

            {/* Visual */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Eye className="w-4 h-4" />
                    Visual
                </div>

                <SettingItem label="Contrast Mode" inline>
                    <select
                        value={access.contrast || 'normal'}
                        onChange={(e) => updateSetting('accessibility.contrast', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {contrastOptions.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </SettingItem>

                <SettingItem label="Color Blind Mode" inline>
                    <select
                        value={access.colorBlindMode || 'none'}
                        onChange={(e) => updateSetting('accessibility.colorBlindMode', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {colorBlindOptions.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </SettingItem>
            </div>

            {/* Motion */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-3">
                    <Lightbulb className="w-4 h-4" />
                    Motion & Animation
                </div>

                <SettingItem
                    label="Reduce motion"
                    description="Minimize animations and transitions"
                    inline
                >
                    <Toggle
                        checked={access.reducedMotion || false}
                        onChange={(v) => updateSetting('accessibility.reducedMotion', v)}
                    />
                </SettingItem>

                <SettingItem label="Disable parallax effects" inline>
                    <Toggle
                        checked={access.disableParallax || false}
                        onChange={(v) => updateSetting('accessibility.disableParallax', v)}
                    />
                </SettingItem>

                <SettingItem label="Disable autoplay videos" inline>
                    <Toggle
                        checked={access.disableAutoplay || false}
                        onChange={(v) => updateSetting('accessibility.disableAutoplay', v)}
                    />
                </SettingItem>
            </div>

            {/* Keyboard */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Keyboard className="w-4 h-4" />
                    Keyboard
                </div>

                <SettingItem label="Enhanced focus indicators" inline>
                    <Toggle
                        checked={access.keyboard?.focusIndicators ?? true}
                        onChange={(v) => updateSetting('accessibility.keyboard.focusIndicators', v)}
                    />
                </SettingItem>

                <SettingItem label="Enable keyboard shortcuts" inline>
                    <Toggle
                        checked={access.keyboard?.shortcuts ?? true}
                        onChange={(v) => updateSetting('accessibility.keyboard.shortcuts', v)}
                    />
                </SettingItem>

                <button
                    onClick={() => setShowShortcuts(true)}
                    className="text-sm text-primary hover:underline"
                >
                    View keyboard shortcuts
                </button>
            </div>

            {/* Screen Reader */}
            <div className="space-y-1">
                <div className="text-sm font-medium text-dark-200 mb-3">Screen Reader</div>

                <SettingItem label="Enhanced screen reader support" inline>
                    <Toggle
                        checked={access.screenReader?.enhanced ?? true}
                        onChange={(v) => updateSetting('accessibility.screenReader.enhanced', v)}
                    />
                </SettingItem>

                <SettingItem label="Announce dynamic content" inline>
                    <Toggle
                        checked={access.screenReader?.announceRegions ?? true}
                        onChange={(v) => updateSetting('accessibility.screenReader.announceRegions', v)}
                    />
                </SettingItem>
            </div>

            {/* Captions */}
            <SettingItem
                label="Show captions"
                description="Display captions for video content"
                inline
            >
                <Toggle
                    checked={access.captions ?? true}
                    onChange={(v) => updateSetting('accessibility.captions', v)}
                />
            </SettingItem>

            {/* Hand Detection Assistance */}
            <div className="space-y-1">
                <div className="text-sm font-medium text-dark-200 mb-3">Hand Detection Assistance</div>

                <SettingItem label="Extended detection time" inline>
                    <Toggle
                        checked={access.handDetection?.extendedTime || false}
                        onChange={(v) => updateSetting('accessibility.handDetection.extendedTime', v)}
                    />
                </SettingItem>

                <SettingItem label="More lenient validation" inline>
                    <Toggle
                        checked={access.handDetection?.lenientValidation || false}
                        onChange={(v) => updateSetting('accessibility.handDetection.lenientValidation', v)}
                    />
                </SettingItem>

                <SettingItem label="Extra guidance overlays" inline>
                    <Toggle
                        checked={access.handDetection?.extraGuidance || false}
                        onChange={(v) => updateSetting('accessibility.handDetection.extraGuidance', v)}
                    />
                </SettingItem>
            </div>

            {/* Keyboard Shortcuts Modal */}
            <Modal
                isOpen={showShortcuts}
                onClose={() => setShowShortcuts(false)}
                title="Keyboard Shortcuts"
                size="sm"
            >
                <div className="space-y-2">
                    {keyboardShortcuts.map(({ key, action }) => (
                        <div key={key} className="flex items-center justify-between py-2">
                            <span className="text-dark-300">{action}</span>
                            <kbd className="px-2 py-1 rounded bg-dark-700 border border-dark-600 text-dark-200 text-sm font-mono">
                                {key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default AccessibilitySettings;
