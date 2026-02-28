/**
 * Audio Settings Component
 * Volume controls, sound effects, voice feedback
 */

import { useState } from 'react';
import { Volume2, Music, Mic, Vibrate, PlayCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import SettingItem from './SettingItem';
import Toggle from './Toggle';
import Slider from './Slider';
import Button from '@/components/common/Button';
import { cn } from '@/utils/helpers';

const speedOptions = [
    { value: 'slow', label: 'Slow' },
    { value: 'normal', label: 'Normal' },
    { value: 'fast', label: 'Fast' }
];

const musicStyleOptions = [
    { value: 'ambient', label: 'Ambient' },
    { value: 'focus', label: 'Focus' },
    { value: 'upbeat', label: 'Upbeat' },
    { value: 'none', label: 'None' }
];

const hapticOptions = [
    { value: 'low', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'Strong' }
];

const AudioSettings = () => {
    const { settings, updateSetting } = useSettings();
    const audio = settings.audio || {};
    const [testPlaying, setTestPlaying] = useState(false);

    const playTestSound = () => {
        // Play a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 440;
        oscillator.type = 'sine';
        gainNode.gain.value = (audio.masterVolume || 80) / 100 * 0.3;

        oscillator.start();
        setTestPlaying(true);

        setTimeout(() => {
            oscillator.stop();
            setTestPlaying(false);
        }, 200);
    };

    return (
        <div className="space-y-6">
            {/* Master Volume */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Volume2 className="w-4 h-4" />
                    Master Volume
                </div>

                <Slider
                    value={audio.masterVolume ?? 80}
                    onChange={(v) => updateSetting('audio.masterVolume', v)}
                    min={0}
                    max={100}
                    step={5}
                    valueFormat={(v) => `${v}%`}
                />
            </div>

            {/* Sound Effects */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-dark-200">Sound Effects</div>
                    <Toggle
                        checked={audio.soundEffects?.enabled ?? true}
                        onChange={(v) => updateSetting('audio.soundEffects.enabled', v)}
                        size="sm"
                    />
                </div>

                {audio.soundEffects?.enabled && (
                    <div className="ml-4 space-y-3">
                        <Slider
                            label="Effects Volume"
                            value={audio.soundEffects?.volume ?? 80}
                            onChange={(v) => updateSetting('audio.soundEffects.volume', v)}
                            min={0}
                            max={100}
                            step={5}
                            valueFormat={(v) => `${v}%`}
                        />

                        <div className="space-y-1">
                            <SettingItem label="Success sounds" inline>
                                <Toggle
                                    checked={audio.soundEffects?.success ?? true}
                                    onChange={(v) => updateSetting('audio.soundEffects.success', v)}
                                    size="sm"
                                />
                            </SettingItem>

                            <SettingItem label="Error sounds" inline>
                                <Toggle
                                    checked={audio.soundEffects?.error ?? true}
                                    onChange={(v) => updateSetting('audio.soundEffects.error', v)}
                                    size="sm"
                                />
                            </SettingItem>

                            <SettingItem label="Achievement sounds" inline>
                                <Toggle
                                    checked={audio.soundEffects?.achievement ?? true}
                                    onChange={(v) => updateSetting('audio.soundEffects.achievement', v)}
                                    size="sm"
                                />
                            </SettingItem>

                            <SettingItem label="Level up sounds" inline>
                                <Toggle
                                    checked={audio.soundEffects?.levelUp ?? true}
                                    onChange={(v) => updateSetting('audio.soundEffects.levelUp', v)}
                                    size="sm"
                                />
                            </SettingItem>

                            <SettingItem label="Streak sounds" inline>
                                <Toggle
                                    checked={audio.soundEffects?.streak ?? true}
                                    onChange={(v) => updateSetting('audio.soundEffects.streak', v)}
                                    size="sm"
                                />
                            </SettingItem>
                        </div>
                    </div>
                )}
            </div>

            {/* Voice Feedback */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                        <Mic className="w-4 h-4" />
                        Voice Feedback
                    </div>
                    <Toggle
                        checked={audio.voiceFeedback?.enabled || false}
                        onChange={(v) => updateSetting('audio.voiceFeedback.enabled', v)}
                        size="sm"
                    />
                </div>

                {audio.voiceFeedback?.enabled && (
                    <div className="ml-4 space-y-3">
                        <Slider
                            label="Voice Volume"
                            value={audio.voiceFeedback?.volume ?? 80}
                            onChange={(v) => updateSetting('audio.voiceFeedback.volume', v)}
                            min={0}
                            max={100}
                            step={5}
                            valueFormat={(v) => `${v}%`}
                        />

                        <SettingItem label="Speech Speed" inline>
                            <select
                                value={audio.voiceFeedback?.speed || 'normal'}
                                onChange={(e) => updateSetting('audio.voiceFeedback.speed', e.target.value)}
                                className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {speedOptions.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </SettingItem>

                        <SettingItem label="Announce sign names" inline>
                            <Toggle
                                checked={audio.voiceFeedback?.announceSignNames || false}
                                onChange={(v) => updateSetting('audio.voiceFeedback.announceSignNames', v)}
                                size="sm"
                            />
                        </SettingItem>

                        <SettingItem label="Read feedback messages" inline>
                            <Toggle
                                checked={audio.voiceFeedback?.readFeedback || false}
                                onChange={(v) => updateSetting('audio.voiceFeedback.readFeedback', v)}
                                size="sm"
                            />
                        </SettingItem>
                    </div>
                )}
            </div>

            {/* Background Music */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                        <Music className="w-4 h-4" />
                        Background Music
                    </div>
                    <Toggle
                        checked={audio.backgroundMusic?.enabled || false}
                        onChange={(v) => updateSetting('audio.backgroundMusic.enabled', v)}
                        size="sm"
                    />
                </div>

                {audio.backgroundMusic?.enabled && (
                    <div className="ml-4 space-y-3">
                        <Slider
                            label="Music Volume"
                            value={audio.backgroundMusic?.volume ?? 40}
                            onChange={(v) => updateSetting('audio.backgroundMusic.volume', v)}
                            min={0}
                            max={100}
                            step={5}
                            valueFormat={(v) => `${v}%`}
                        />

                        <SettingItem label="Music Style" inline>
                            <select
                                value={audio.backgroundMusic?.style || 'ambient'}
                                onChange={(e) => updateSetting('audio.backgroundMusic.style', e.target.value)}
                                className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {musicStyleOptions.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </SettingItem>
                    </div>
                )}
            </div>

            {/* Haptic Feedback */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                        <Vibrate className="w-4 h-4" />
                        Haptic Feedback
                    </div>
                    <Toggle
                        checked={audio.haptic?.enabled ?? true}
                        onChange={(v) => updateSetting('audio.haptic.enabled', v)}
                        size="sm"
                    />
                </div>

                {audio.haptic?.enabled && (
                    <SettingItem label="Intensity" inline className="ml-4">
                        <select
                            value={audio.haptic?.intensity || 'medium'}
                            onChange={(e) => updateSetting('audio.haptic.intensity', e.target.value)}
                            className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {hapticOptions.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </SettingItem>
                )}
            </div>

            {/* Test Sound */}
            <div className="pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<PlayCircle className="w-4 h-4" />}
                    onClick={playTestSound}
                    isDisabled={testPlaying}
                >
                    {testPlaying ? 'Playing...' : 'Test Sound'}
                </Button>
            </div>
        </div>
    );
};

export default AudioSettings;
