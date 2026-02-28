/**
 * CategoryCard Component
 * Expandable category card showing words and progress
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import WordCard from './WordCard';

const CategoryCard = ({
    category,
    words = [],
    userProgress = {},
    onWordClick = null,
    defaultExpanded = false,
    delay = 0
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const learnedWords = userProgress?.learned || [];
    const accuracyData = userProgress?.accuracy || {};
    const learnedInCategory = words.filter(w => learnedWords.includes(w.id)).length;
    const progressPercent = words.length > 0
        ? Math.round((learnedInCategory / words.length) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-card overflow-hidden"
        >
            {/* Category Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-5 flex items-center gap-4 hover:bg-dark-700/30 transition-colors"
            >
                {/* Icon */}
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${category.color}20` }}
                >
                    {category.icon}
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                    <h3 className="font-semibold text-dark-100 text-lg">{category.name}</h3>
                    <p className="text-sm text-dark-400 mt-0.5">{category.description}</p>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-sm font-bold text-dark-100">
                            {learnedInCategory}/{words.length}
                        </div>
                        <div className="text-xs text-dark-400">learned</div>
                    </div>

                    {/* Progress Ring */}
                    <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                            <circle
                                cx="18" cy="18" r="15"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-dark-700"
                            />
                            <circle
                                cx="18" cy="18" r="15"
                                fill="none"
                                stroke={category.color}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${progressPercent * 0.942} 100`}
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-dark-200">
                            {progressPercent}%
                        </span>
                    </div>

                    {/* Expand Arrow */}
                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5 text-dark-400" />
                    </motion.div>
                </div>
            </button>

            {/* Progress Bar */}
            <div className="px-5 pb-1">
                <div className="w-full h-1 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: category.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, delay: delay + 0.2 }}
                    />
                </div>
            </div>

            {/* Expanded Word Grid */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 pt-4">
                            {words.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {words.map((word, idx) => (
                                        <WordCard
                                            key={word.id}
                                            word={word}
                                            isLearned={learnedWords.includes(word.id)}
                                            accuracy={accuracyData[word.id]?.avg || null}
                                            categoryColor={category.color}
                                            onClick={() => onWordClick?.(word)}
                                            delay={0.05 * idx}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-dark-400">
                                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No words in this category yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CategoryCard;
