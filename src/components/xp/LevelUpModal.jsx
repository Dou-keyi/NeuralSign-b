/**
 * Level Up Modal Component
 * Celebration modal shown when user levels up
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Sparkles, Gift, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import Button from '@/components/common/Button';

const LevelUpModal = ({
    isOpen,
    onClose,
    newLevel,
    xpGained = 0,
    newPerks = [],
    previousLevel = null
}) => {
    const hasTriggeredConfetti = useRef(false);

    // Trigger confetti on open
    useEffect(() => {
        if (isOpen && !hasTriggeredConfetti.current) {
            hasTriggeredConfetti.current = true;
            triggerCelebration();
        }

        if (!isOpen) {
            hasTriggeredConfetti.current = false;
        }
    }, [isOpen]);

    const triggerCelebration = () => {
        // Center burst
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366F1', '#8B5CF6', '#EC4899', '#FFD700']
        });

        // Left side
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.6 },
                colors: ['#6366F1', '#8B5CF6', '#EC4899']
            });
        }, 200);

        // Right side
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.6 },
                colors: ['#6366F1', '#8B5CF6', '#EC4899']
            });
        }, 400);
    };

    if (!isOpen) return null;

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
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-dark-700 text-dark-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Main Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-800 to-dark-900 border border-primary/30 shadow-2xl shadow-primary/20">
                        {/* Animated Background */}
                        <div className="absolute inset-0 overflow-hidden">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-conic from-primary/10 via-transparent to-secondary/10"
                            />
                        </div>

                        {/* Content */}
                        <div className="relative p-8 text-center">
                            {/* Sparkle Icons */}
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-4 left-4"
                            >
                                <Sparkles className="w-6 h-6 text-warning" />
                            </motion.div>
                            <motion.div
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                className="absolute top-4 right-4"
                            >
                                <Sparkles className="w-6 h-6 text-accent" />
                            </motion.div>

                            {/* Level Up Text */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="mb-6"
                            >
                                <h2 className="text-2xl font-bold text-warning mb-1">🎉 LEVEL UP!</h2>
                                <p className="text-dark-400">You've reached a new milestone!</p>
                            </motion.div>

                            {/* Level Badge */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', delay: 0.4, stiffness: 200 }}
                                className="relative inline-block mb-6"
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-50" />

                                {/* Level Number */}
                                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-2xl">
                                    <div className="text-center">
                                        <span className="text-4xl font-bold text-white">{newLevel}</span>
                                        <p className="text-xs text-white/80">LEVEL</p>
                                    </div>
                                </div>

                                {/* Rotating Ring */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"
                                />
                            </motion.div>

                            {/* Level Transition */}
                            {previousLevel && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex items-center justify-center gap-3 mb-6"
                                >
                                    <span className="px-3 py-1 rounded-full bg-dark-700 text-dark-400">
                                        Level {previousLevel}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-primary" />
                                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium">
                                        Level {newLevel}
                                    </span>
                                </motion.div>
                            )}

                            {/* XP Gained */}
                            {xpGained > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="mb-6"
                                >
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/30">
                                        <Star className="w-5 h-5 text-warning" />
                                        <span className="text-warning font-medium">+{xpGained} XP Earned</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* New Perks */}
                            {newPerks.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="mb-6"
                                >
                                    <h3 className="flex items-center justify-center gap-2 text-sm font-medium text-dark-200 mb-3">
                                        <Gift className="w-4 h-4 text-accent" />
                                        New Perks Unlocked
                                    </h3>
                                    <div className="space-y-2">
                                        {newPerks.map((perk, index) => (
                                            <motion.div
                                                key={perk.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.9 + index * 0.1 }}
                                                className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{perk.icon}</span>
                                                    <div className="text-left">
                                                        <h4 className="font-medium text-dark-100">{perk.name}</h4>
                                                        <p className="text-xs text-dark-400">{perk.description}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Continue Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                            >
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    onClick={onClose}
                                >
                                    Continue Learning
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LevelUpModal;
