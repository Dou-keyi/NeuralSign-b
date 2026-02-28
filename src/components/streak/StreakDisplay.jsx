/**
 * Streak Display Component
 * Visual streak counter with fire animation
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion } from 'framer-motion';
import { Flame, AlertTriangle, Trophy, TrendingUp } from 'lucide-react';

const StreakDisplay = ({
    currentStreak = 0,
    longestStreak = 0,
    isAtRisk = false,
    isNewRecord = false,
    nextMilestone = null,
    daysToMilestone = 0,
    size = 'default', // 'mini', 'default', 'large'
    className = ''
}) => {
    const sizeConfig = {
        mini: {
            container: 'px-3 py-2',
            icon: 'w-5 h-5',
            number: 'text-xl',
            text: 'text-xs'
        },
        default: {
            container: 'p-4',
            icon: 'w-8 h-8',
            number: 'text-3xl',
            text: 'text-sm'
        },
        large: {
            container: 'p-6',
            icon: 'w-12 h-12',
            number: 'text-5xl',
            text: 'text-base'
        }
    };

    const config = sizeConfig[size];

    // Determine visual state
    const getStateStyles = () => {
        if (isAtRisk) {
            return {
                bg: 'from-orange-500/20 to-red-500/20',
                border: 'border-orange-500/30',
                iconColor: 'text-orange-400',
                glow: 'shadow-orange-500/20'
            };
        }
        if (isNewRecord && currentStreak > 0) {
            return {
                bg: 'from-yellow-500/20 to-amber-500/20',
                border: 'border-yellow-500/30',
                iconColor: 'text-yellow-400',
                glow: 'shadow-yellow-500/30'
            };
        }
        if (currentStreak >= 7) {
            return {
                bg: 'from-warning/20 to-orange-500/20',
                border: 'border-warning/30',
                iconColor: 'text-warning',
                glow: 'shadow-warning/20'
            };
        }
        return {
            bg: 'from-dark-700/50 to-dark-600/50',
            border: 'border-dark-600',
            iconColor: currentStreak > 0 ? 'text-warning' : 'text-dark-500',
            glow: ''
        };
    };

    const styles = getStateStyles();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className={`
        rounded-xl ${config.container}
        bg-gradient-to-br ${styles.bg}
        border ${styles.border}
        ${styles.glow && `shadow-lg ${styles.glow}`}
        ${className}
      `}
        >
            <div className="flex items-center gap-4">
                {/* Fire Icon with Animation */}
                <div className="relative">
                    <motion.div
                        animate={currentStreak > 0 ? {
                            scale: [1, 1.1, 1],
                            opacity: [1, 0.8, 1]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Flame className={`${config.icon} ${styles.iconColor}`} />
                    </motion.div>

                    {/* Glow effect for high streaks */}
                    {currentStreak >= 7 && (
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-warning blur-lg rounded-full"
                        />
                    )}
                </div>

                {/* Streak Info */}
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <motion.span
                            key={currentStreak}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className={`${config.number} font-bold text-dark-100`}
                        >
                            {currentStreak}
                        </motion.span>
                        <span className={`${config.text} text-dark-400`}>
                            day{currentStreak !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Status Messages */}
                    {isAtRisk && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 mt-1"
                        >
                            <AlertTriangle className="w-3 h-3 text-orange-400" />
                            <span className="text-xs text-orange-400">
                                Practice today to keep your streak!
                            </span>
                        </motion.div>
                    )}

                    {isNewRecord && currentStreak > 1 && !isAtRisk && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 mt-1"
                        >
                            <Trophy className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-yellow-400">
                                New personal record!
                            </span>
                        </motion.div>
                    )}

                    {/* Milestone Progress */}
                    {size !== 'mini' && nextMilestone && !isAtRisk && !isNewRecord && (
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-dark-400" />
                            <span className="text-xs text-dark-400">
                                {daysToMilestone} day{daysToMilestone !== 1 ? 's' : ''} to {nextMilestone}-day milestone
                            </span>
                        </div>
                    )}
                </div>

                {/* Personal Best Badge */}
                {size !== 'mini' && longestStreak > 0 && (
                    <div className="text-right">
                        <span className="text-xs text-dark-500">Best</span>
                        <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-warning" />
                            <span className="text-lg font-bold text-dark-300">{longestStreak}</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/**
 * Mini Streak Badge for Navbar
 */
export const MiniStreakBadge = ({ currentStreak = 0, isAtRisk = false }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`
        flex items-center gap-1.5 px-2 py-1 rounded-full
        ${isAtRisk
                    ? 'bg-orange-500/20 border border-orange-500/30'
                    : 'bg-warning/20 border border-warning/30'
                }
      `}
            title={`${currentStreak} day streak${isAtRisk ? ' - at risk!' : ''}`}
        >
            <Flame className={`w-4 h-4 ${isAtRisk ? 'text-orange-400' : 'text-warning'}`} />
            <span className={`text-xs font-bold ${isAtRisk ? 'text-orange-400' : 'text-warning'}`}>
                {currentStreak}
            </span>
        </motion.div>
    );
};

export default StreakDisplay;
