/**
 * Setting Item Component
 * Individual setting row with label and control
 */

import { cn } from '@/utils/helpers';

const SettingItem = ({
    label,
    description = null,
    children,
    inline = false,
    className = ''
}) => {
    return (
        <div className={cn(
            'py-3',
            inline ? 'flex items-center justify-between gap-4' : 'space-y-2',
            className
        )}>
            <div className={cn(inline && 'flex-1 min-w-0')}>
                <div className="text-sm font-medium text-dark-200">{label}</div>
                {description && (
                    <p className="text-xs text-dark-400 mt-0.5">{description}</p>
                )}
            </div>
            <div className={cn(inline && 'flex-shrink-0')}>
                {children}
            </div>
        </div>
    );
};

export default SettingItem;
