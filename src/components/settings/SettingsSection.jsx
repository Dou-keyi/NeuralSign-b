/**
 * Settings Section Component
 * Collapsible accordion section for settings page
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/helpers';

const SettingsSection = ({
    icon: Icon,
    title,
    description = null,
    children,
    defaultOpen = false,
    badge = null,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={cn(
            'rounded-xl border border-dark-700 overflow-hidden',
            'bg-dark-800/50 backdrop-blur-sm',
            className
        )}>
            {/* Header - Clickable */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full flex items-center gap-4 p-4',
                    'text-left transition-colors duration-200',
                    'hover:bg-dark-700/50',
                    'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary'
                )}
            >
                {/* Icon */}
                {Icon && (
                    <div className={cn(
                        'p-2 rounded-lg',
                        isOpen ? 'bg-primary/10' : 'bg-dark-700'
                    )}>
                        <Icon className={cn(
                            'w-5 h-5 transition-colors',
                            isOpen ? 'text-primary' : 'text-dark-400'
                        )} />
                    </div>
                )}

                {/* Title & Description */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={cn(
                            'text-base font-medium',
                            isOpen ? 'text-dark-100' : 'text-dark-200'
                        )}>
                            {title}
                        </h3>
                        {badge && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                {badge}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-sm text-dark-400 truncate">{description}</p>
                    )}
                </div>

                {/* Chevron */}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-dark-400" />
                </motion.div>
            </button>

            {/* Content - Collapsible */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        <div className="px-4 pb-4 pt-2 border-t border-dark-700">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SettingsSection;
