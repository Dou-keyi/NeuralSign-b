/**
 * Learning Preferences Settings Component
 * Difficulty, practice defaults, feedback, hints, AI sensitivity
 */

import { useSettings } from '@/context/SettingsContext';
import SettingItem from './SettingItem';
import Toggle from './Toggle';
import Slider from './Slider';
import { cn } from '@/utils/helpers';

const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', description: 'More hints & guidance' },
    { value: 'intermediate', label: 'Intermediate', description: 'Balanced experience' },
    { value: 'advanced', label: 'Advanced', description: 'Minimal assistance' }
];

const practiceModeOptions = [
    { value: 'free', label: 'Free Practice' },
    { value: 'flashcard', label: 'Flashcard Mode' },
    { value: 'timed', label: 'Timed Challenge' }
];

const durationOptions = [5, 10, 15, 20, 30];

const LearningPreferences = () => {
    const { settings, updateSetting } = useSettings();
    const prefs = settings.learningPreferences || {};

    return (
        <div className="space-y-6">
            {/* Difficulty Level */}
            <SettingItem
                label="Difficulty Level"
                description="Adjust hints and guidance level"
            >
                <div className="flex gap-2 mt-2">
                    {difficultyOptions.map(({ value, label, description }) => (
                        <button
                            key={value}
                            onClick={() => updateSetting('learningPreferences.difficulty', value)}
                            className={cn(
                                'flex-1 p-3 rounded-xl border-2 transition-all text-center',
                                prefs.difficulty === value
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

            {/* Practice Defaults */}
            <div className="space-y-3">
                <div className="text-sm font-medium text-dark-200">Practice Defaults</div>

                <SettingItem label="Default Mode" inline>
                    <select
                        value={prefs.defaultPracticeMode || 'free'}
                        onChange={(e) => updateSetting('learningPreferences.defaultPracticeMode', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {practiceModeOptions.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </SettingItem>

                <SettingItem label="Default Duration" inline>
                    <select
                        value={prefs.defaultDuration || 10}
                        onChange={(e) => updateSetting('learningPreferences.defaultDuration', Number(e.target.value))}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {durationOptions.map((mins) => (
                            <option key={mins} value={mins}>{mins} minutes</option>
                        ))}
                    </select>
                </SettingItem>

                <SettingItem label="Auto-start next sign" inline>
                    <Toggle
                        checked={prefs.autoStartNext ?? true}
                        onChange={(v) => updateSetting('learningPreferences.autoStartNext', v)}
                    />
                </SettingItem>
            </div>

            {/* Feedback Preferences */}
            <div className="space-y-1">
                <div className="text-sm font-medium text-dark-200 mb-3">Feedback</div>

                <SettingItem label="Show instant feedback" inline>
                    <Toggle
                        checked={prefs.feedback?.instant ?? true}
                        onChange={(v) => updateSetting('learningPreferences.feedback.instant', v)}
                    />
                </SettingItem>

                <SettingItem label="Display accuracy percentage" inline>
                    <Toggle
                        checked={prefs.feedback?.showAccuracy ?? true}
                        onChange={(v) => updateSetting('learningPreferences.feedback.showAccuracy', v)}
                    />
                </SettingItem>

                <SettingItem label="Show improvement tips" inline>
                    <Toggle
                        checked={prefs.feedback?.improvementTips ?? true}
                        onChange={(v) => updateSetting('learningPreferences.feedback.improvementTips', v)}
                    />
                </SettingItem>

                <SettingItem label="Celebrate achievements" inline>
                    <Toggle
                        checked={prefs.feedback?.celebrateAchievements ?? true}
                        onChange={(v) => updateSetting('learningPreferences.feedback.celebrateAchievements', v)}
                    />
                </SettingItem>
            </div>

            {/* Hint Settings */}
            <div className="space-y-3">
                <div className="text-sm font-medium text-dark-200">Hints</div>

                <SettingItem label="Show hints after attempts" inline>
                    <select
                        value={prefs.hints?.showAfterAttempts || 3}
                        onChange={(e) => updateSetting('learningPreferences.hints.showAfterAttempts', Number(e.target.value))}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {[1, 2, 3, 5, 10].map((n) => (
                            <option key={n} value={n}>{n} attempts</option>
                        ))}
                    </select>
                </SettingItem>

                <SettingItem label="Show hand position guides" inline>
                    <Toggle
                        checked={prefs.hints?.showHandGuides ?? true}
                        onChange={(v) => updateSetting('learningPreferences.hints.showHandGuides', v)}
                    />
                </SettingItem>

                <SettingItem label="Show 3D model reference" inline>
                    <Toggle
                        checked={prefs.hints?.show3DReference ?? true}
                        onChange={(v) => updateSetting('learningPreferences.hints.show3DReference', v)}
                    />
                </SettingItem>
            </div>

            {/* AI Sensitivity */}
            <SettingItem
                label="AI Validation Sensitivity"
                description="How strict the sign detection should be"
            >
                <Slider
                    value={prefs.aiSensitivity ?? 50}
                    onChange={(v) => updateSetting('learningPreferences.aiSensitivity', v)}
                    min={0}
                    max={100}
                    step={5}
                    valueFormat={(v) => v <= 30 ? 'Lenient' : v >= 70 ? 'Strict' : 'Medium'}
                    className="mt-2"
                />
                <div className="flex justify-between text-xs text-dark-500 mt-1">
                    <span>More forgiving</span>
                    <span>More precise</span>
                </div>
            </SettingItem>

            {/* Daily Goals */}
            <div className="space-y-3">
                <div className="text-sm font-medium text-dark-200">Daily Goals</div>

                <SettingItem label="Practice minutes goal" inline>
                    <select
                        value={prefs.dailyGoals?.practiceMinutes || 15}
                        onChange={(e) => updateSetting('learningPreferences.dailyGoals.practiceMinutes', Number(e.target.value))}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                            <option key={mins} value={mins}>{mins} min</option>
                        ))}
                    </select>
                </SettingItem>

                <SettingItem label="Signs per day goal" inline>
                    <select
                        value={prefs.dailyGoals?.signsCount || 5}
                        onChange={(e) => updateSetting('learningPreferences.dailyGoals.signsCount', Number(e.target.value))}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {[1, 3, 5, 10, 15, 20].map((n) => (
                            <option key={n} value={n}>{n} signs</option>
                        ))}
                    </select>
                </SettingItem>
            </div>
        </div>
    );
};

export default LearningPreferences;
