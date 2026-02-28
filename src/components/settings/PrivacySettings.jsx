/**
 * Privacy Settings Component
 * Profile visibility, leaderboard, data collection, data rights
 */

import { Shield, Eye, Database, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import SettingItem from './SettingItem';
import Toggle from './Toggle';
import Button from '@/components/common/Button';
import { cn } from '@/utils/helpers';

const visibilityOptions = [
    { value: 'public', label: 'Public', description: 'Anyone can view' },
    { value: 'friends', label: 'Friends Only', description: 'Only friends' },
    { value: 'private', label: 'Private', description: 'Only you' }
];

const displayAsOptions = [
    { value: 'username', label: 'Username' },
    { value: 'firstName', label: 'First Name' },
    { value: 'fullName', label: 'Full Name' },
    { value: 'anonymous', label: 'Anonymous' }
];

const PrivacySettings = () => {
    const { settings, updateSetting } = useSettings();
    const privacy = settings.privacy || {};

    return (
        <div className="space-y-6">
            {/* Profile Visibility */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Eye className="w-4 h-4" />
                    Profile Visibility
                </div>

                <div className="flex gap-2">
                    {visibilityOptions.map(({ value, label, description }) => (
                        <button
                            key={value}
                            onClick={() => updateSetting('privacy.profileVisibility', value)}
                            className={cn(
                                'flex-1 p-3 rounded-xl border-2 transition-all text-center',
                                privacy.profileVisibility === value
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-dark-600 bg-dark-700/50 text-dark-300 hover:border-dark-500'
                            )}
                        >
                            <div className="text-sm font-medium">{label}</div>
                            <div className="text-xs opacity-70">{description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Shield className="w-4 h-4" />
                    Leaderboard
                </div>

                <SettingItem label="Appear on leaderboards" inline>
                    <Toggle
                        checked={privacy.leaderboard?.appear ?? true}
                        onChange={(v) => updateSetting('privacy.leaderboard.appear', v)}
                    />
                </SettingItem>

                {privacy.leaderboard?.appear && (
                    <>
                        <SettingItem label="Show profile picture" inline>
                            <Toggle
                                checked={privacy.leaderboard?.showPicture || false}
                                onChange={(v) => updateSetting('privacy.leaderboard.showPicture', v)}
                            />
                        </SettingItem>

                        <SettingItem label="Display as" inline>
                            <select
                                value={privacy.leaderboard?.displayAs || 'username'}
                                onChange={(e) => updateSetting('privacy.leaderboard.displayAs', e.target.value)}
                                className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {displayAsOptions.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </SettingItem>
                    </>
                )}
            </div>

            {/* Activity Sharing */}
            <div className="space-y-1">
                <div className="text-sm font-medium text-dark-200 mb-3">Activity Sharing</div>

                <SettingItem label="Share achievements" inline>
                    <Toggle
                        checked={privacy.activitySharing?.achievements ?? true}
                        onChange={(v) => updateSetting('privacy.activitySharing.achievements', v)}
                    />
                </SettingItem>

                <SettingItem label="Share practice activity" inline>
                    <Toggle
                        checked={privacy.activitySharing?.practice || false}
                        onChange={(v) => updateSetting('privacy.activitySharing.practice', v)}
                    />
                </SettingItem>

                <SettingItem label="Share progress milestones" inline>
                    <Toggle
                        checked={privacy.activitySharing?.progress || false}
                        onChange={(v) => updateSetting('privacy.activitySharing.progress', v)}
                    />
                </SettingItem>
            </div>

            {/* Data Collection */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Database className="w-4 h-4" />
                    Data Collection
                </div>

                <SettingItem
                    label="Analytics"
                    description="Help improve NeuralSign with anonymous usage data"
                    inline
                >
                    <Toggle
                        checked={privacy.dataCollection?.analytics ?? true}
                        onChange={(v) => updateSetting('privacy.dataCollection.analytics', v)}
                    />
                </SettingItem>

                <SettingItem
                    label="Crash reports"
                    description="Send crash reports to help fix bugs"
                    inline
                >
                    <Toggle
                        checked={privacy.dataCollection?.crashReports ?? true}
                        onChange={(v) => updateSetting('privacy.dataCollection.crashReports', v)}
                    />
                </SettingItem>
            </div>

            {/* Marketing */}
            <div className="space-y-1">
                <div className="text-sm font-medium text-dark-200 mb-3">Marketing</div>

                <SettingItem label="Product updates" inline>
                    <Toggle
                        checked={privacy.marketing?.updates ?? true}
                        onChange={(v) => updateSetting('privacy.marketing.updates', v)}
                    />
                </SettingItem>

                <SettingItem label="Marketing emails" inline>
                    <Toggle
                        checked={privacy.marketing?.emails || false}
                        onChange={(v) => updateSetting('privacy.marketing.emails', v)}
                    />
                </SettingItem>
            </div>

            {/* Data Rights */}
            <div className="space-y-3 pt-4 border-t border-dark-700">
                <div className="text-sm font-medium text-dark-200">Your Data</div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download className="w-4 h-4" />}
                    >
                        Download My Data
                    </Button>
                </div>

                <p className="text-xs text-dark-500">
                    You can request a copy of all your data stored with NeuralSign.
                </p>
            </div>
        </div>
    );
};

export default PrivacySettings;
