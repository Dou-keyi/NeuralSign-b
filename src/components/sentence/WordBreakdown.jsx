/**
 * WordBreakdown Component
 * Displays the ASL word breakdown with explanation
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion } from 'framer-motion';
import { ArrowRight, Info, Sparkles, Volume2 } from 'lucide-react';

/**
 * WordBreakdown Component
 * @param {string} original - Original sentence
 * @param {string[]} aslWords - ASL words in signing order
 * @param {string} explanation - Explanation of ASL grammar
 * @param {Function} onWordClick - Callback when a word chip is clicked
 */
const WordBreakdown = ({ original, aslWords = [], explanation, onWordClick }) => {
    // Calculate word reduction
    const originalWordCount = original?.split(/\s+/).filter(Boolean).length || 0;
    const aslWordCount = aslWords.length;
    const reduction = originalWordCount > 0
        ? Math.round((1 - aslWordCount / originalWordCount) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-secondary/10">
                    <Sparkles className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-dark-100">ASL Translation</h3>
            </div>

            {/* Original Sentence */}
            <div className="mb-6">
                <label className="text-sm text-dark-400 mb-2 block">Original:</label>
                <p className="text-xl text-dark-100 font-medium">"{original}"</p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-6">
                <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="p-2 rounded-full bg-primary/10"
                >
                    <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                </motion.div>
            </div>

            {/* ASL Translation */}
            <div className="mb-6">
                <label className="text-sm text-dark-400 mb-3 block">In ASL:</label>
                <div className="flex flex-wrap gap-3">
                    {aslWords.map((word, index) => (
                        <motion.button
                            key={`${word}-${index}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onWordClick?.(word, index)}
                            className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 
                                     border border-primary/30 hover:border-primary/60 transition-all cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="font-semibold text-dark-100">{word}</span>

                            {/* Index indicator */}
                            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center 
                                           text-xs font-bold rounded-full bg-primary text-white">
                                {index + 1}
                            </span>

                            {/* Hover tooltip */}
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs 
                                           bg-dark-600 text-dark-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Click to learn
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Word Count Comparison */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-dark-700/30">
                <div className="flex-1">
                    <p className="text-sm text-dark-400">English</p>
                    <p className="text-xl font-bold text-dark-200">{originalWordCount} words</p>
                </div>
                <ArrowRight className="w-5 h-5 text-dark-400" />
                <div className="flex-1">
                    <p className="text-sm text-dark-400">ASL</p>
                    <p className="text-xl font-bold text-primary">{aslWordCount} words</p>
                </div>
                {reduction > 0 && (
                    <div className="px-3 py-1 rounded-full bg-success/10 border border-success/30">
                        <p className="text-sm font-medium text-success">{reduction}% fewer</p>
                    </div>
                )}
            </div>

            {/* Explanation */}
            {explanation && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20"
                >
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-dark-200 mb-1">Grammar Note</p>
                        <p className="text-sm text-dark-400">{explanation}</p>
                    </div>
                </motion.div>
            )}

            {/* Tips */}
            <div className="mt-6 pt-6 border-t border-dark-600">
                <div className="flex items-center gap-2 text-sm text-dark-400">
                    <Volume2 className="w-4 h-4" />
                    <span>Click on any word to start learning its sign</span>
                </div>
            </div>
        </motion.div>
    );
};

export default WordBreakdown;
