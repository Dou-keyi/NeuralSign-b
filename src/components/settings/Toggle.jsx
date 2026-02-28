/**
 * Toggle Component
 * Animated on/off switch for settings
 */

import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

const Toggle = ({
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    label = null,
    description = null,
    className = ''
}) => {
    const sizes = {
        sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
        md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
        lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' }
    };

    const { track, thumb, translate } = sizes[size];

    const handleClick = () => {
        if (!disabled && onChange) {
            onChange(!checked);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={cn(
                    'relative inline-flex shrink-0 cursor-pointer rounded-full',
                    'transition-colors duration-200 ease-in-out',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-800',
                    track,
                    checked ? 'bg-primary' : 'bg-dark-600',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={cn(
                        'pointer-events-none inline-block rounded-full bg-white shadow-lg',
                        'transform ring-0',
                        thumb,
                        checked ? translate : 'translate-x-0.5'
                    )}
                    style={{ marginTop: '0.125rem' }}
                />
            </button>

            {(label || description) && (
                <div className="flex flex-col">
                    {label && (
                        <span className={cn(
                            'text-sm font-medium',
                            disabled ? 'text-dark-500' : 'text-dark-200'
                        )}>
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-dark-400">{description}</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default Toggle;
