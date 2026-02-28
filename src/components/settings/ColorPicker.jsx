/**
 * Color Picker Component
 * Color selection with presets and custom option
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Pipette } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { accentColors } from '@/config/defaultSettings';

const ColorPicker = ({
    value = '#6366F1',
    onChange,
    showCustom = true,
    presets = accentColors,
    label = null,
    className = ''
}) => {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customColor, setCustomColor] = useState(value);

    const handlePresetClick = (color) => {
        if (onChange) {
            onChange(color);
        }
        setShowCustomInput(false);
    };

    const handleCustomChange = (e) => {
        const color = e.target.value;
        setCustomColor(color);
        if (onChange) {
            onChange(color);
        }
    };

    const isPresetSelected = Object.values(presets).includes(value);

    return (
        <div className={cn('space-y-3', className)}>
            {label && (
                <div className="text-sm font-medium text-dark-200">{label}</div>
            )}

            {/* Preset Colors */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(presets).map(([name, color]) => (
                    <motion.button
                        key={name}
                        type="button"
                        onClick={() => handlePresetClick(color)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            'relative w-8 h-8 rounded-full',
                            'ring-2 ring-offset-2 ring-offset-dark-800',
                            'focus:outline-none focus:ring-primary',
                            value === color ? 'ring-white' : 'ring-transparent hover:ring-dark-500'
                        )}
                        style={{ backgroundColor: color }}
                        title={name.charAt(0).toUpperCase() + name.slice(1)}
                    >
                        {value === color && (
                            <Check className="absolute inset-0 m-auto w-4 h-4 text-white" />
                        )}
                    </motion.button>
                ))}

                {/* Custom Color Button */}
                {showCustom && (
                    <motion.button
                        type="button"
                        onClick={() => setShowCustomInput(!showCustomInput)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            'relative w-8 h-8 rounded-full',
                            'bg-dark-600 border-2 border-dashed border-dark-500',
                            'flex items-center justify-center',
                            'ring-2 ring-offset-2 ring-offset-dark-800',
                            'focus:outline-none focus:ring-primary',
                            !isPresetSelected ? 'ring-white' : 'ring-transparent hover:ring-dark-500'
                        )}
                        title="Custom color"
                    >
                        {!isPresetSelected ? (
                            <div
                                className="w-5 h-5 rounded-full"
                                style={{ backgroundColor: value }}
                            />
                        ) : (
                            <Pipette className="w-4 h-4 text-dark-400" />
                        )}
                    </motion.button>
                )}
            </div>

            {/* Custom Color Input */}
            {showCustom && showCustomInput && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3"
                >
                    <input
                        type="color"
                        value={customColor}
                        onChange={handleCustomChange}
                        className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                            setCustomColor(e.target.value);
                            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value) && onChange) {
                                onChange(e.target.value);
                            }
                        }}
                        placeholder="#6366F1"
                        className={cn(
                            'flex-1 px-3 py-2 rounded-lg',
                            'bg-dark-700 border border-dark-600',
                            'text-dark-200 text-sm font-mono',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                        )}
                    />
                </motion.div>
            )}
        </div>
    );
};

export default ColorPicker;
