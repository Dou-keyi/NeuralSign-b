/**
 * WordCard Component
 * Displays an individual word sign with thumbnail, difficulty, and progress
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion } from 'framer-motion';
import { Star, Check, TrendingUp } from 'lucide-react';

const WordCard = ({
    word,
    isLearned = false,
    accuracy = null,
    onClick = null,
    categoryColor = '#6366f1',
    delay = 0
}) => {
    const difficultyStars = Array.from({ length: 3 }, (_, i) => i < word.difficulty);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="relative glass-card p-4 cursor-pointer group overflow-hidden"
        >
            {/* Category accent top bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                style={{ backgroundColor: categoryColor }}
            />

            {/* Learned Badge */}
            {isLearned && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-success" />
                </div>
            )}

            {/* Thumbnail / Icon */}
            <div className="w-full aspect-square bg-dark-700/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {word.thumbnailUrl ? (
                    <img
                        src={word.thumbnailUrl}
                        alt={word.englishText}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-4xl select-none">
                        {word.category === 'greetings' ? '👋' :
                            word.category === 'pronouns' ? '👤' :
                                word.category === 'nouns' ? '🏠' :
                                    word.category === 'verbs' ? '🏃' : '🤟'}
                    </span>
                )}
            </div>

            {/* Word Info */}
            <h4 className="font-semibold text-dark-100 text-sm mb-1 truncate group-hover:text-primary transition-colors">
                {word.englishText}
            </h4>

            <p className="text-xs text-dark-400 mb-2 truncate">
                {word.shortDescription || word.aslGloss}
            </p>

            {/* Footer: Difficulty + Accuracy */}
            <div className="flex items-center justify-between">
                {/* Difficulty Stars */}
                <div className="flex gap-0.5">
                    {difficultyStars.map((filled, i) => (
                        <Star
                            key={i}
                            className={`w-3 h-3 ${filled
                                    ? 'text-warning fill-warning'
                                    : 'text-dark-600'
                                }`}
                        />
                    ))}
                </div>

                {/* Accuracy */}
                {accuracy !== null && accuracy !== undefined && (
                    <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        <span className="text-dark-300">{accuracy}%</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default WordCard;
