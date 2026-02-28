/**
 * XP Bar Component
 * Visual progress bar showing current XP and level
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion } from 'framer-motion';
import { Star, TrendingUp, Zap } from 'lucide-react';
import { calculateLevel, getNextPerk } from '@/services/xpService';

const XPBar = ({
    totalXP = 0,
    showLevel = true,
    size = 'default', // 'mini', 'default', 'large'
    className = '',
    animate = true
}) => {
    const levelInfo = calculateLevel(totalXP);
    const nextPerk = getNextPerk(levelInfo.level);

    const sizeClasses = {
        mini: {
            container: 'h-6',
            bar: 'h-2',
            text: 'text-xs',
            badge: 'w-6 h-6 text-xs'
        },
        default: {
            container: 'h-16',
            bar: 'h-3',
            text: 'text-sm',
            badge: 'w-10 h-10 text-sm'
        },
        large: {
            container: 'h-20',
            bar: 'h-4',
            text: 'text-base',
            badge: 'w-14 h-14 text-lg'
        }
    };

    const sizes = sizeClasses[size];

    return (
        <motion.div
            initial={animate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            className={`
        flex items-center gap-3 p-3 rounded-xl
        bg-gradient-to-r from-dark-800/80 to-dark-700/80
        border border-dark-600/50 backdrop-blur-sm
        ${className}
      `}
        >
            {/* Level Badge */}
            {showLevel && (
                <motion.div
                    initial={animate ? { scale: 0 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                    className={`
            ${sizes.badge} rounded-full
            bg-gradient-to-br from-primary to-secondary
            flex items-center justify-center font-bold text-white
            shadow-lg shadow-primary/30
          `}
                    title={`Level ${levelInfo.level}`}
                >
                    {levelInfo.level}
                </motion.div>
            )}

            {/* XP Progress */}
            <div className="flex-1 min-w-0">
                {/* Top Row: Level and XP */}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-warning" />
                        <span className={`font-semibold text-dark-100 ${sizes.text}`}>
                            Level {levelInfo.level}
                        </span>
                    </div>
                    <span className={`text-dark-300 ${sizes.text}`}>
                        {levelInfo.currentXP.toLocaleString()} / {levelInfo.xpForNextLevel.toLocaleString()} XP
                    </span>
                </div>

                {/* Progress Bar */}
                <div className={`relative w-full ${sizes.bar} bg-dark-600 rounded-full overflow-hidden`}>
                    <motion.div
                        initial={animate ? { width: 0 } : false}
                        animate={{ width: `${levelInfo.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
                    />
                    {/* Shimmer Effect */}
                    <motion.div
                        animate={{ x: [-200, 400] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                </div>

                {/* Bottom Row: XP to next level */}
                {size !== 'mini' && (
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-dark-400">
                            {levelInfo.xpToNextLevel.toLocaleString()} XP to Level {levelInfo.level + 1}
                        </span>
                        {nextPerk && size === 'large' && (
                            <span className="text-xs text-primary">
                                {nextPerk.icon} {nextPerk.name} at Level {nextPerk.level}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/**
 * Mini XP indicator for navbar
 */
export const MiniXPBadge = ({ totalXP = 0, className = '' }) => {
    const levelInfo = calculateLevel(totalXP);

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`
        flex items-center gap-1.5 px-2 py-1 rounded-full
        bg-gradient-to-r from-primary/20 to-secondary/20
        border border-primary/30
        ${className}
      `}
            title={`Level ${levelInfo.level} - ${levelInfo.currentXP}/${levelInfo.xpForNextLevel} XP`}
        >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{levelInfo.level}</span>
            </div>
            <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-warning" />
                <span className="text-xs font-medium text-dark-200">
                    {totalXP.toLocaleString()}
                </span>
            </div>
        </motion.div>
    );
};

/**
 * XP Gain Animation Component
 */
export const XPGainPopup = ({ amount, source, onComplete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            onAnimationComplete={onComplete}
            className="fixed bottom-24 right-4 z-50"
        >
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-bold">+{amount} XP</span>
                </div>
                {source && (
                    <p className="text-xs text-white/80 mt-0.5">{source}</p>
                )}
            </div>
        </motion.div>
    );
};

export default XPBar;
