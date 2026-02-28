/**
 * SavedSentences Component
 * Display and manage previously practiced sentences
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Clock,
    Target,
    PlayCircle,
    Trash2,
    Search,
    SortAsc,
    Filter,
    ChevronRight
} from 'lucide-react';
import Button from '@/components/common/Button';

// Sort options
const SORT_OPTIONS = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'accuracy', label: 'Highest Accuracy' },
    { value: 'alphabetical', label: 'A-Z' }
];

/**
 * SavedSentences Component
 * @param {Array} sentences - Array of saved sentence objects
 * @param {Function} onPractice - Callback when user wants to practice a sentence
 * @param {Function} onDelete - Callback when user wants to delete a sentence
 */
const SavedSentences = ({ sentences = [], onPractice, onDelete }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');

    // Filter and sort sentences
    const filteredSentences = useMemo(() => {
        let result = [...sentences];

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.original?.toLowerCase().includes(query) ||
                s.aslWords?.some(w => w.toLowerCase().includes(query))
            );
        }

        // Sort
        switch (sortBy) {
            case 'accuracy':
                result.sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
                break;
            case 'alphabetical':
                result.sort((a, b) => (a.original || '').localeCompare(b.original || ''));
                break;
            case 'recent':
            default:
                result.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
                break;
        }

        return result;
    }, [sentences, searchQuery, sortBy]);

    // Format date
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    // Get accuracy color
    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 90) return 'text-success';
        if (accuracy >= 70) return 'text-warning';
        return 'text-error';
    };

    // Empty state
    if (sentences.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 text-center"
            >
                <div className="p-4 rounded-full bg-dark-700/50 inline-flex mb-4">
                    <BookOpen className="w-12 h-12 text-dark-400" />
                </div>
                <h3 className="text-xl font-semibold text-dark-200 mb-2">No Saved Sentences</h3>
                <p className="text-dark-400 max-w-md mx-auto">
                    Sentences you practice will appear here. Start by entering a sentence to learn!
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                        <BookOpen className="w-5 h-5 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-100">
                        My Sentences ({sentences.length})
                    </h3>
                </div>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search sentences..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark-700/50 border border-dark-600 
                                 text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary/50"
                    />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <SortAsc className="w-5 h-5 text-dark-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-dark-700/50 border border-dark-600 
                                 text-dark-200 focus:outline-none focus:border-primary/50"
                    >
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sentences List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {filteredSentences.map((sentence, index) => (
                        <motion.div
                            key={sentence.id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="group p-4 rounded-xl bg-dark-700/30 border border-dark-600 
                                     hover:border-primary/30 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                {/* Sentence Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-dark-100 font-medium truncate mb-1">
                                        "{sentence.original}"
                                    </p>

                                    {/* ASL Words */}
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {sentence.aslWords?.slice(0, 5).map((word, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary"
                                            >
                                                {word}
                                            </span>
                                        ))}
                                        {sentence.aslWords?.length > 5 && (
                                            <span className="px-2 py-0.5 text-xs rounded-md bg-dark-600 text-dark-400">
                                                +{sentence.aslWords.length - 5} more
                                            </span>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Target className={`w-4 h-4 ${getAccuracyColor(sentence.accuracy)}`} />
                                            <span className={getAccuracyColor(sentence.accuracy)}>
                                                {sentence.accuracy}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-dark-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatDate(sentence.completedAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onDelete?.(sentence.id)}
                                        className="p-2 rounded-lg bg-dark-600 text-dark-400 
                                                 hover:bg-error/20 hover:text-error transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => onPractice?.(sentence)}
                                        leftIcon={<PlayCircle className="w-4 h-4" />}
                                    >
                                        Practice
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* No Results */}
            {filteredSentences.length === 0 && searchQuery && (
                <div className="text-center py-8">
                    <p className="text-dark-400">
                        No sentences match "{searchQuery}"
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default SavedSentences;
