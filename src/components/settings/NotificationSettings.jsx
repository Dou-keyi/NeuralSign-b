/**
 * Notification Settings Component
 * Push, email, and reminder preferences
 */

import { useState } from 'react';
import { Bell, Mail, Clock, TestTube } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import SettingItem from './SettingItem';
import Toggle from './Toggle';
import Button from '@/components/common/Button';
import { cn } from '@/utils/helpers';

const NotificationSettings = () => {
    const { settings, updateSetting } = useSettings();
    const notif = settings.notifications || {};
    const [testSent, setTestSent] = useState(false);

    const handleTestNotification = () => {
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('NeuralSign', {
                body: 'Test notification! Your notifications are working.',
                icon: '/favicon.ico'
            });
        }
        setTestSent(true);
        setTimeout(() => setTestSent(false), 2000);
    };

    const requestPushPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                updateSetting('notifications.push.enabled', true);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Push Notifications */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Bell className="w-4 h-4" />
                    Push Notifications
                </div>

                <SettingItem
                    label="Enable push notifications"
                    description="Receive notifications in your browser"
                    inline
                >
                    <Toggle
                        checked={notif.push?.enabled || false}
                        onChange={(v) => {
                            if (v) {
                                requestPushPermission();
                            } else {
                                updateSetting('notifications.push.enabled', false);
                            }
                        }}
                    />
                </SettingItem>
            </div>

            {/* Email Notifications */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                </div>

                <SettingItem label="Weekly progress emails" inline>
                    <Toggle
                        checked={notif.email?.enabled || false}
                        onChange={(v) => updateSetting('notifications.email.enabled', v)}
                    />
                </SettingItem>
            </div>

            {/* Notification Types */}
            <div className="space-y-1">
                <div className="text-sm font-medium text-dark-200 mb-3">Notification Types</div>

                <SettingItem label="Daily practice reminder" inline>
                    <Toggle
                        checked={notif.types?.dailyReminder?.enabled ?? true}
                        onChange={(v) => updateSetting('notifications.types.dailyReminder.enabled', v)}
                    />
                </SettingItem>

                <SettingItem label="Streak warnings" inline>
                    <Toggle
                        checked={notif.types?.streakWarning ?? true}
                        onChange={(v) => updateSetting('notifications.types.streakWarning', v)}
                    />
                </SettingItem>

                <SettingItem label="Streak milestones" inline>
                    <Toggle
                        checked={notif.types?.streakMilestone ?? true}
                        onChange={(v) => updateSetting('notifications.types.streakMilestone', v)}
                    />
                </SettingItem>

                <SettingItem label="Achievement unlocks" inline>
                    <Toggle
                        checked={notif.types?.achievements ?? true}
                        onChange={(v) => updateSetting('notifications.types.achievements', v)}
                    />
                </SettingItem>

                <SettingItem label="Level up alerts" inline>
                    <Toggle
                        checked={notif.types?.levelUp ?? true}
                        onChange={(v) => updateSetting('notifications.types.levelUp', v)}
                    />
                </SettingItem>

                <SettingItem label="Daily challenge" inline>
                    <Toggle
                        checked={notif.types?.dailyChallenge?.newChallenge ?? true}
                        onChange={(v) => updateSetting('notifications.types.dailyChallenge.newChallenge', v)}
                    />
                </SettingItem>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Clock className="w-4 h-4" />
                    Quiet Hours
                </div>

                <SettingItem
                    label="Enable quiet hours"
                    description="Pause notifications during specified hours"
                    inline
                >
                    <Toggle
                        checked={notif.quietHours?.enabled || false}
                        onChange={(v) => updateSetting('notifications.quietHours.enabled', v)}
                    />
                </SettingItem>

                {notif.quietHours?.enabled && (
                    <div className="flex items-center gap-3 ml-4">
                        <div>
                            <label className="block text-xs text-dark-400 mb-1">From</label>
                            <input
                                type="time"
                                value={notif.quietHours?.from || '22:00'}
                                onChange={(e) => updateSetting('notifications.quietHours.from', e.target.value)}
                                className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-dark-400 mb-1">To</label>
                            <input
                                type="time"
                                value={notif.quietHours?.to || '08:00'}
                                onChange={(e) => updateSetting('notifications.quietHours.to', e.target.value)}
                                className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Test Notification */}
            <div className="pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<TestTube className="w-4 h-4" />}
                    onClick={handleTestNotification}
                >
                    {testSent ? 'Notification Sent!' : 'Send Test Notification'}
                </Button>
            </div>
        </div>
    );
};

export default NotificationSettings;
