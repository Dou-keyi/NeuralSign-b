/**
 * Slider Component
 * Range slider with value display
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/helpers';

const Slider = ({
    value = 50,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label = null,
    showValue = true,
    valueFormat = (v) => v,
    disabled = false,
    className = ''
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null);

    // Calculate percentage for styling
    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = (e) => {
        if (!disabled && onChange) {
            onChange(Number(e.target.value));
        }
    };

    return (
        <div className={cn('w-full', className)}>
            {/* Label and Value */}
            {(label || showValue) && (
                <div className="flex items-center justify-between mb-2">
                    {label && (
                        <span className={cn(
                            'text-sm font-medium',
                            disabled ? 'text-dark-500' : 'text-dark-200'
                        )}>
                            {label}
                        </span>
                    )}
                    {showValue && (
                        <span className={cn(
                            'text-sm font-mono',
                            disabled ? 'text-dark-500' : 'text-primary'
                        )}>
                            {valueFormat(value)}
                        </span>
                    )}
                </div>
            )}

            {/* Slider Track */}
            <div className="relative" ref={sliderRef}>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    className={cn(
                        'w-full h-2 rounded-full appearance-none cursor-pointer',
                        'bg-dark-600',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-800',
                        disabled && 'opacity-50 cursor-not-allowed',
                        // Custom track styling
                        '[&::-webkit-slider-runnable-track]:rounded-full',
                        '[&::-webkit-slider-runnable-track]:h-2',
                        // Custom thumb styling
                        '[&::-webkit-slider-thumb]:appearance-none',
                        '[&::-webkit-slider-thumb]:w-4',
                        '[&::-webkit-slider-thumb]:h-4',
                        '[&::-webkit-slider-thumb]:-mt-1',
                        '[&::-webkit-slider-thumb]:rounded-full',
                        '[&::-webkit-slider-thumb]:bg-white',
                        '[&::-webkit-slider-thumb]:shadow-lg',
                        '[&::-webkit-slider-thumb]:cursor-pointer',
                        '[&::-webkit-slider-thumb]:transition-transform',
                        isDragging && '[&::-webkit-slider-thumb]:scale-110',
                        // Firefox
                        '[&::-moz-range-thumb]:w-4',
                        '[&::-moz-range-thumb]:h-4',
                        '[&::-moz-range-thumb]:rounded-full',
                        '[&::-moz-range-thumb]:bg-white',
                        '[&::-moz-range-thumb]:border-0',
                        '[&::-moz-range-thumb]:shadow-lg'
                    )}
                    style={{
                        background: `linear-gradient(to right, #6366F1 0%, #6366F1 ${percentage}%, #475569 ${percentage}%, #475569 100%)`
                    }}
                />
            </div>

            {/* Min/Max Labels */}
            <div className="flex justify-between mt-1">
                <span className="text-xs text-dark-500">{valueFormat(min)}</span>
                <span className="text-xs text-dark-500">{valueFormat(max)}</span>
            </div>
        </div>
    );
};

export default Slider;
