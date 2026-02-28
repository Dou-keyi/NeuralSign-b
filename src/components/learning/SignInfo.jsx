/**
 * SignInfo Component
 * Displays detailed information about a sign
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
    Check,
    AlertTriangle,
    Info,
    Lightbulb,
    Star
} from 'lucide-react';
import { getDifficultyLabel, getDifficultyColor } from '@/data/signsData';

/**
 * Info Section Component
 * Reusable section with icon and title
 */
const InfoSection = memo(({ icon: Icon, title, iconColor, children }) => (
    <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
            <div className={`p-1.5 rounded-lg ${iconColor}`}>
                <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-dark-100">{title}</h3>
        </div>
        {children}
    </div>
));

InfoSection.displayName = 'InfoSection';

/**
 * Tip Item Component
 */
const TipItem = memo(({ text, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-start gap-3 py-2"
    >
        <div className="flex-shrink-0 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-success" strokeWidth={3} />
            </div>
        </div>
        <p className="text-sm text-dark-300 leading-relaxed">{text}</p>
    </motion.div>
));

TipItem.displayName = 'TipItem';

/**
 * Mistake Item Component
 */
const MistakeItem = memo(({ text, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 + 0.1 }}
        className="flex items-start gap-3 py-2"
    >
        <div className="flex-shrink-0 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-error/20 flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-error" />
            </div>
        </div>
        <p className="text-sm text-dark-300 leading-relaxed">{text}</p>
    </motion.div>
));

MistakeItem.displayName = 'MistakeItem';

/**
 * Difficulty Badge Component
 */
const DifficultyBadge = memo(({ difficulty }) => (
    <span className={`
    inline-flex items-center gap-1.5 px-3 py-1
    text-xs font-medium rounded-full border
    ${getDifficultyColor(difficulty)}
  `}>
        <Star className="w-3 h-3" />
        {getDifficultyLabel(difficulty)}
    </span>
));

DifficultyBadge.displayName = 'DifficultyBadge';

/**
 * SignInfo Component
 * 
 * @param {Object} signData - Sign data object from signsData.js
 * @param {string} className - Additional CSS classes
 */
const SignInfo = memo(({ signData, className = '' }) => {
    if (!signData) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <Info className="w-8 h-8 text-dark-500 mx-auto mb-2" />
                <p className="text-dark-400">Select a letter to see sign information</p>
            </div>
        );
    }

    const { letter, description, tips, commonMistakes, difficulty } = signData;

    return (
        <motion.div
            key={letter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`space-y-4 ${className}`}
        >
            {/* Header with Letter and Description */}
            <div className="glass-card p-5 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="
                w-16 h-16 rounded-xl
                bg-gradient-to-br from-primary to-secondary
                flex items-center justify-center
                text-3xl font-bold text-white
                shadow-lg shadow-primary/30
              "
                        >
                            {letter}
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-bold text-dark-100">
                                Letter {letter}
                            </h2>
                            <DifficultyBadge difficulty={difficulty} />
                        </div>
                    </div>
                </div>

                <p className="text-dark-300 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Tips Section */}
            {tips && tips.length > 0 && (
                <InfoSection
                    icon={Lightbulb}
                    title="Tips for Success"
                    iconColor="bg-success/20 text-success"
                >
                    <div className="space-y-1">
                        {tips.map((tip, index) => (
                            <TipItem key={index} text={tip} index={index} />
                        ))}
                    </div>
                </InfoSection>
            )}

            {/* Common Mistakes Section */}
            {commonMistakes && commonMistakes.length > 0 && (
                <InfoSection
                    icon={AlertTriangle}
                    title="Common Mistakes to Avoid"
                    iconColor="bg-error/20 text-error"
                >
                    <div className="space-y-1">
                        {commonMistakes.map((mistake, index) => (
                            <MistakeItem key={index} text={mistake} index={index} />
                        ))}
                    </div>
                </InfoSection>
            )}
        </motion.div>
    );
});

SignInfo.displayName = 'SignInfo';

export default SignInfo;
