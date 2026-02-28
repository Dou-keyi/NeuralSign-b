/**
 * Camera Settings Component
 * Camera selection, detection settings, overlays, background
 */

import { useState, useEffect } from 'react';
import { Camera, Settings2, Palette, Eye } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import SettingItem from './SettingItem';
import Toggle from './Toggle';
import Slider from './Slider';
import { cn } from '@/utils/helpers';

const qualityOptions = [
    { value: 'low', label: 'Low', description: '480p - Better performance' },
    { value: 'medium', label: 'Medium', description: '720p - Balanced' },
    { value: 'high', label: 'High', description: '1080p - Best quality' }
];

const fpsOptions = [10, 15, 20, 30];

const backgroundOptions = [
    { value: 'camera', label: 'Camera Feed' },
    { value: 'blur', label: 'Blurred Background' },
    { value: 'solid', label: 'Solid Color' }
];

const CameraSettings = () => {
    const { settings, updateSetting } = useSettings();
    const camera = settings.camera || {};
    const [devices, setDevices] = useState([]);

    // Get available cameras
    useEffect(() => {
        const getDevices = async () => {
            try {
                // Request permission first
                await navigator.mediaDevices.getUserMedia({ video: true });
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
                setDevices(videoDevices);
            } catch (error) {
                console.log('Camera access error:', error);
            }
        };
        getDevices();
    }, []);

    return (
        <div className="space-y-6">
            {/* Camera Selection */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Camera className="w-4 h-4" />
                    Camera
                </div>

                <SettingItem label="Select camera" inline>
                    <select
                        value={camera.deviceId || 'default'}
                        onChange={(e) => updateSetting('camera.deviceId', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-w-[200px]"
                    >
                        <option value="default">Default Camera</option>
                        {devices.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${devices.indexOf(device) + 1}`}
                            </option>
                        ))}
                    </select>
                </SettingItem>

                <SettingItem
                    label="Mirror camera"
                    description="Flip video horizontally (recommended)"
                    inline
                >
                    <Toggle
                        checked={camera.mirror ?? true}
                        onChange={(v) => updateSetting('camera.mirror', v)}
                    />
                </SettingItem>

                <SettingItem label="Video quality" inline>
                    <select
                        value={camera.quality || 'high'}
                        onChange={(e) => updateSetting('camera.quality', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {qualityOptions.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </SettingItem>
            </div>

            {/* Detection Settings */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Settings2 className="w-4 h-4" />
                    Detection
                </div>

                <SettingItem
                    label="Detection Sensitivity"
                    description="How easily hands are detected"
                >
                    <Slider
                        value={camera.detection?.sensitivity ?? 50}
                        onChange={(v) => updateSetting('camera.detection.sensitivity', v)}
                        min={0}
                        max={100}
                        step={5}
                        valueFormat={(v) => v <= 30 ? 'Low' : v >= 70 ? 'High' : 'Medium'}
                        className="mt-2"
                    />
                </SettingItem>

                <SettingItem
                    label="Confidence Threshold"
                    description="Minimum confidence for sign validation"
                >
                    <Slider
                        value={camera.detection?.confidenceThreshold ?? 70}
                        onChange={(v) => updateSetting('camera.detection.confidenceThreshold', v)}
                        min={50}
                        max={95}
                        step={5}
                        valueFormat={(v) => `${v}%`}
                        className="mt-2"
                    />
                </SettingItem>

                <SettingItem label="Processing FPS" inline>
                    <select
                        value={camera.detection?.processingFPS || 15}
                        onChange={(e) => updateSetting('camera.detection.processingFPS', Number(e.target.value))}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {fpsOptions.map((fps) => (
                            <option key={fps} value={fps}>{fps} FPS</option>
                        ))}
                    </select>
                </SettingItem>
            </div>

            {/* Landmark Overlays */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-3">
                    <Eye className="w-4 h-4" />
                    Overlays
                </div>

                <SettingItem label="Show hand landmarks" inline>
                    <Toggle
                        checked={camera.detection?.showLandmarks ?? true}
                        onChange={(v) => updateSetting('camera.detection.showLandmarks', v)}
                    />
                </SettingItem>

                <SettingItem label="Show finger markers" inline>
                    <Toggle
                        checked={camera.detection?.showFingerMarkers ?? true}
                        onChange={(v) => updateSetting('camera.detection.showFingerMarkers', v)}
                    />
                </SettingItem>

                <SettingItem label="Show palm center" inline>
                    <Toggle
                        checked={camera.detection?.showPalmCenter ?? true}
                        onChange={(v) => updateSetting('camera.detection.showPalmCenter', v)}
                    />
                </SettingItem>

                <SettingItem label="Color-code fingers" inline>
                    <Toggle
                        checked={camera.detection?.colorCodeFingers ?? true}
                        onChange={(v) => updateSetting('camera.detection.colorCodeFingers', v)}
                    />
                </SettingItem>
            </div>

            {/* Feedback */}
            <div className="space-y-1">
                <div className="text-sm font-medium text-dark-200 mb-3">Detection Feedback</div>

                <SettingItem label="Show detection status" inline>
                    <Toggle
                        checked={camera.detection?.feedback?.showStatus ?? true}
                        onChange={(v) => updateSetting('camera.detection.feedback.showStatus', v)}
                    />
                </SettingItem>

                <SettingItem label="Show confidence percentage" inline>
                    <Toggle
                        checked={camera.detection?.feedback?.showConfidence ?? true}
                        onChange={(v) => updateSetting('camera.detection.feedback.showConfidence', v)}
                    />
                </SettingItem>

                <SettingItem label="Highlight detected signs" inline>
                    <Toggle
                        checked={camera.detection?.feedback?.highlight ?? true}
                        onChange={(v) => updateSetting('camera.detection.feedback.highlight', v)}
                    />
                </SettingItem>
            </div>

            {/* Background */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                    <Palette className="w-4 h-4" />
                    Background
                </div>

                <SettingItem label="Background type" inline>
                    <select
                        value={camera.background?.type || 'camera'}
                        onChange={(e) => updateSetting('camera.background.type', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {backgroundOptions.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </SettingItem>

                {camera.background?.type === 'solid' && (
                    <SettingItem label="Background color" inline>
                        <input
                            type="color"
                            value={camera.background?.color || '#0F172A'}
                            onChange={(e) => updateSetting('camera.background.color', e.target.value)}
                            className="w-10 h-8 rounded border-0 cursor-pointer bg-transparent"
                        />
                    </SettingItem>
                )}
            </div>

            {/* Lighting */}
            <div className="space-y-3">
                <div className="text-sm font-medium text-dark-200">Lighting Adjustment</div>

                <SettingItem label="Brightness">
                    <Slider
                        value={camera.lighting?.brightness ?? 50}
                        onChange={(v) => updateSetting('camera.lighting.brightness', v)}
                        min={0}
                        max={100}
                        step={5}
                        valueFormat={(v) => `${v}%`}
                        className="mt-2"
                    />
                </SettingItem>

                <SettingItem label="Contrast">
                    <Slider
                        value={camera.lighting?.contrast ?? 50}
                        onChange={(v) => updateSetting('camera.lighting.contrast', v)}
                        min={0}
                        max={100}
                        step={5}
                        valueFormat={(v) => `${v}%`}
                        className="mt-2"
                    />
                </SettingItem>
            </div>
        </div>
    );
};

export default CameraSettings;
