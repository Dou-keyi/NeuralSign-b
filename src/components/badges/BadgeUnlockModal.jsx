/**
 * Badge Unlock Modal Component
 * Celebration modal when user unlocks a new badge
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { tierColors, categories } from '@/data/achievements';
import Button from '@/components/common/Button';

const BadgeUnlockModal = ({
    isOpen,
    onClose,
    badges = [], // Array of badges to show (supports multiple)
    onCollect
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const hasTriggeredConfetti = useRef(false);

    const currentBadge = badges[currentIndex];
    const hasMultiple = badges.length > 1;

    // Trigger confetti on open
    useEffect(() => {
        if (isOpen && !hasTriggeredConfetti.current && currentBadge) {
            hasTriggeredConfetti.current = true;
            triggerCelebration();
        }

        if (!isOpen) {
            hasTriggeredConfetti.current = false;
            setCurrentIndex(0);
        }
    }, [isOpen, currentBadge]);

    const triggerCelebration = () => {
        const tier = currentBadge?.tier || 'bronze';
        // Use centralized tier colors for confetti
        const colors = {
            bronze: ['#CD7F32', '#8B4513', '#D2691E'],
            silver: ['#94A3B8', '#64748B', '#CBD5E1'], // Updated to match new slate/blue-gray theme
            gold: ['#FFD700', '#FFA500', '#FFE135'],
            platinum: ['#E5E4E2', '#7FDBFF', '#B10DC9']
        };

        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: colors[tier]
        });
    };

    const handleNext = () => {
        if (currentIndex < badges.length - 1) {
            setCurrentIndex(currentIndex + 1);
            triggerCelebration();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleCollect = () => {
        if (onCollect) {
            onCollect(badges);
        }
        onClose();
    };

    if (!isOpen || !currentBadge) return null;

    const rarity = tierColors[currentBadge.tier];
    const category = categories[currentBadge.category];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/90 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-sm"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-dark-700 text-dark-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Main Card */}
                    <div className={`
            relative overflow-hidden rounded-2xl
            bg-gradient-to-b from-dark-800 to-dark-900
            border ${rarity.border} shadow-2xl
          `}>
                        {/* Animated Background */}
                        <div className="absolute inset-0 overflow-hidden">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className={`absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-conic ${rarity.bg}`}
                                style={{ opacity: 0.3 }}
                            />
                        </div>

                        {/* Content */}
                        <div className="relative p-8 text-center">
                            {/* Header */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="mb-6"
                            >
                                <h2 className="text-xl font-bold text-warning mb-1">
                                    🎉 New Badge Unlocked!
                                </h2>
                                {hasMultiple && (
                                    <p className="text-sm text-dark-400">
                                        {currentIndex + 1} of {badges.length}
                                    </p>
                                )}
                            </motion.div>

                            {/* Badge Display */}
                            <motion.div
                                key={currentBadge.id}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                                className="relative inline-block mb-6"
                            >
                                {/* Glow Effect */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={`absolute inset-0 bg-gradient-to-r ${rarity.bg} rounded-full blur-xl`}
                                />

                                {/* Badge Container */}
                                <div className={`
                  relative w-32 h-32 rounded-full
                  bg-gradient-to-br ${rarity.bg}
                  border-4 ${rarity.border}
                  flex items-center justify-center
                  shadow-2xl
                `}>
                                    <span className="text-6xl">{currentBadge.icon}</span>
                                </div>

                                {/* Sparkle Ring */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"
                                />
                            </motion.div>

                            {/* Badge Info */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mb-6"
                            >
                                <h3 className="text-2xl font-bold text-dark-100 mb-2">
                                    {currentBadge.name}
                                </h3>
                                <p className={`text-sm ${rarity.text} uppercase font-medium mb-2`}>
                                    {currentBadge.tier} • {category?.name}
                                </p>
                                <p className="text-dark-400">{currentBadge.description}</p>
                            </motion.div>

                            {/* XP Reward */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/30 mb-6"
                            >
                                <Star className="w-5 h-5 text-warning" />
                                <span className="text-warning font-bold">+{currentBadge.xpReward} XP</span>
                            </motion.div>

                            {/* Navigation for Multiple Badges */}
                            {hasMultiple && (
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <button
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        className={`
                      p-2 rounded-full transition-colors
                      ${currentIndex === 0
                                                ? 'bg-dark-700/50 text-dark-600 cursor-not-allowed'
                                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                            }
                    `}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {/* Dots */}
                                    <div className="flex gap-2">
                                        {badges.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`
                          w-2 h-2 rounded-full transition-colors
                          ${i === currentIndex ? 'bg-primary' : 'bg-dark-600'}
                        `}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={currentIndex === badges.length - 1}
                                        className={`
                      p-2 rounded-full transition-colors
                      ${currentIndex === badges.length - 1
                                                ? 'bg-dark-700/50 text-dark-600 cursor-not-allowed'
                                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                            }
                    `}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {/* Collect Button */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    onClick={handleCollect}
                                >
                                    {hasMultiple && currentIndex < badges.length - 1
                                        ? 'Next Badge'
                                        : 'Collect'
                                    }
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BadgeUnlockModal;
