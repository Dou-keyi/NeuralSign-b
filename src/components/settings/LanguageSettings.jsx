/**
 * Language Settings Component
 * App language, sign language variant, regional preferences
 */

import { Globe, Calendar, Languages } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import SettingItem from './SettingItem';
import Toggle from './Toggle';
import { appLanguages, signLanguageVariants } from '@/config/defaultSettings';
import { cn } from '@/utils/helpers';

const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '02/08/2026' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '08/02/2026' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-02-08' }
];

const timeFormatOptions = [
    { value: '12h', label: '12-hour', example: '10:08 PM' },
    { value: '24h', label: '24-hour', example: '22:08' }
];

const weekStartOptions = [
    { value: 'sunday', label: 'Sunday' },
    { value: 'monday', label: 'Monday' },
    { value: 'saturday', label: 'Saturday' }
];

const LanguageSettings = () => {
    const { settings, updateSetting } = useSettings();
    const lang = settings.language || {};

    return (
        <div className="space-y-6">
            {/* App Language */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Globe className="w-4 h-4" />
                    App Language
                </div>

                <SettingItem label="Interface language" inline>
                    <select
                        value={lang.app || 'en-US'}
                        onChange={(e) => updateSetting('language.app', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px]"
                    >
                        {appLanguages.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </SettingItem>

                <p className="text-xs text-dark-500">
                    More languages coming soon! Help us translate NeuralSign.
                </p>
            </div>

            {/* Sign Language Variant */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Languages className="w-4 h-4" />
                    Sign Language
                </div>

                <div className="grid gap-2">
                    {signLanguageVariants.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => updateSetting('language.signVariant', value)}
                            className={cn(
                                'p-3 rounded-xl border-2 transition-all text-left',
                                lang.signVariant === value
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-dark-600 bg-dark-700/50 text-dark-300 hover:border-dark-500'
                            )}
                        >
                            <div className="text-sm font-medium">{label}</div>
                        </button>
                    ))}
                </div>

                <p className="text-xs text-dark-500">
                    Currently supporting ASL. More sign languages will be added in future updates.
                </p>
            </div>

            {/* Regional Preferences */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Calendar className="w-4 h-4" />
                    Regional Preferences
                </div>

                <SettingItem label="Date format" inline>
                    <select
                        value={lang.regional?.dateFormat || 'MM/DD/YYYY'}
                        onChange={(e) => updateSetting('language.regional.dateFormat', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {dateFormatOptions.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </SettingItem>

                <SettingItem label="Time format" inline>
                    <select
                        value={lang.regional?.timeFormat || '12h'}
                        onChange={(e) => updateSetting('language.regional.timeFormat', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {timeFormatOptions.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </SettingItem>

                <SettingItem label="First day of week" inline>
                    <select
                        value={lang.regional?.firstDayOfWeek || 'sunday'}
                        onChange={(e) => updateSetting('language.regional.firstDayOfWeek', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {weekStartOptions.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </SettingItem>
            </div>

            {/* Translation */}
            <div className="space-y-1">
                <div className="text-sm font-medium text-dark-200 mb-3">Translation</div>

                <SettingItem
                    label="Show translations"
                    description="Display text translations where available"
                    inline
                >
                    <Toggle
                        checked={lang.translation?.showTranslations ?? true}
                        onChange={(v) => updateSetting('language.translation.showTranslations', v)}
                    />
                </SettingItem>

                <SettingItem label="Show phonetic guides" inline>
                    <Toggle
                        checked={lang.translation?.phonetics || false}
                        onChange={(v) => updateSetting('language.translation.phonetics', v)}
                    />
                </SettingItem>
            </div>
        </div>
    );
};

export default LanguageSettings;
