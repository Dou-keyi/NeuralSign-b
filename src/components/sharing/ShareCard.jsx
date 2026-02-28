/**
 * Share Card Component
 * Shareable progress cards for social media
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Share2,
    Download,
    Copy,
    Check,
    X,
    Twitter,
    Facebook,
    Linkedin,
    Award,
    Flame,
    Target,
    Star
} from 'lucide-react';
import Button from '@/components/common/Button';

const ShareCard = ({
    isOpen,
    onClose,
    userData = {},
    milestoneType = 'progress' // 'progress', 'achievement', 'streak', 'level'
}) => {
    const [copied, setCopied] = useState(false);
    const cardRef = useRef(null);

    const {
        displayName = 'Learner',
        signsLearned = 0,
        streak = 0,
        totalXP = 0,
        level = 1,
        accuracy = 0,
        achievement = null
    } = userData;

    // Generate share text
    const getShareText = () => {
        switch (milestoneType) {
            case 'achievement':
                return `🏆 I just unlocked the "${achievement?.name}" achievement on NeuralSign! Learning ASL one sign at a time. #NeuralSign #ASL #SignLanguage`;
            case 'streak':
                return `🔥 ${streak} day streak on NeuralSign! Consistently learning sign language every day. #NeuralSign #ASL #LanguageLearning`;
            case 'level':
                return `⭐ Just reached Level ${level} on NeuralSign! ${signsLearned} signs learned and counting. #NeuralSign #ASL #SignLanguage`;
            default:
                return `📚 Learning progress on NeuralSign: ${signsLearned} signs learned, ${streak} day streak, and ${totalXP.toLocaleString()} XP! #NeuralSign #ASL #SignLanguage`;
        }
    };

    // Copy to clipboard
    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(getShareText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [milestoneType, userData]);

    // Download as image (basic implementation)
    const handleDownload = useCallback(async () => {
        if (!cardRef.current) return;

        try {
            // Note: For production, use html2canvas or similar library
            alert('Image download requires html2canvas library. Copying text instead.');
            handleCopy();
        } catch (err) {
            console.error('Failed to download:', err);
        }
    }, [handleCopy]);

    // Social share URLs
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(getShareText())}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&title=My%20NeuralSign%20Progress&summary=${encodeURIComponent(getShareText())}`
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-dark-700 text-dark-400 hover:text-white transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Share Card Preview */}
                    <div
                        ref={cardRef}
                        className="rounded-2xl overflow-hidden bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-600 shadow-2xl"
                    >
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-primary to-secondary p-4 text-center">
                            <h2 className="text-2xl font-bold text-white">
                                {milestoneType === 'achievement' ? '🏆 Achievement Unlocked!' :
                                    milestoneType === 'streak' ? '🔥 Streak Milestone!' :
                                        milestoneType === 'level' ? '⭐ Level Up!' :
                                            '📚 My Progress'}
                            </h2>
                            <p className="text-white/80 text-sm">{displayName}</p>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                            {milestoneType === 'achievement' && achievement && (
                                <div className="text-center mb-6">
                                    <div className="text-6xl mb-3">{achievement.icon}</div>
                                    <h3 className="text-xl font-bold text-dark-100">{achievement.name}</h3>
                                    <p className="text-dark-400">{achievement.description}</p>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-xl bg-dark-700/50 text-center">
                                    <Award className="w-6 h-6 mx-auto text-primary mb-1" />
                                    <div className="text-2xl font-bold text-dark-100">{signsLearned}</div>
                                    <div className="text-xs text-dark-500">Signs Learned</div>
                                </div>
                                <div className="p-3 rounded-xl bg-dark-700/50 text-center">
                                    <Flame className="w-6 h-6 mx-auto text-warning mb-1" />
                                    <div className="text-2xl font-bold text-dark-100">{streak}</div>
                                    <div className="text-xs text-dark-500">Day Streak</div>
                                </div>
                                <div className="p-3 rounded-xl bg-dark-700/50 text-center">
                                    <Star className="w-6 h-6 mx-auto text-yellow-400 mb-1" />
                                    <div className="text-2xl font-bold text-dark-100">{totalXP.toLocaleString()}</div>
                                    <div className="text-xs text-dark-500">Total XP</div>
                                </div>
                                <div className="p-3 rounded-xl bg-dark-700/50 text-center">
                                    <Target className="w-6 h-6 mx-auto text-success mb-1" />
                                    <div className="text-2xl font-bold text-dark-100">{accuracy}%</div>
                                    <div className="text-xs text-dark-500">Accuracy</div>
                                </div>
                            </div>

                            {/* Branding */}
                            <div className="mt-6 pt-4 border-t border-dark-700 text-center">
                                <p className="text-xs text-dark-500">
                                    Learning ASL with <span className="text-primary font-medium">NeuralSign</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Share Actions */}
                    <div className="mt-4 space-y-3">
                        {/* Social Buttons */}
                        <div className="flex gap-2 justify-center">
                            <a
                                href={shareUrls.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-xl bg-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/30 transition-colors"
                                title="Share on Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href={shareUrls.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-xl bg-[#4267B2]/20 text-[#4267B2] hover:bg-[#4267B2]/30 transition-colors"
                                title="Share on Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href={shareUrls.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-xl bg-[#0077B5]/20 text-[#0077B5] hover:bg-[#0077B5]/30 transition-colors"
                                title="Share on LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleCopy}
                                leftIcon={copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                            >
                                {copied ? 'Copied!' : 'Copy Text'}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleDownload}
                                leftIcon={<Download className="w-4 h-4" />}
                            >
                                Save Image
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ShareCard;
