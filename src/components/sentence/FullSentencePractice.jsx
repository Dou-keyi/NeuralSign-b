/**
 * FullSentencePractice Component
 * Practice signing the entire sentence in sequence
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    Trophy,
    Clock,
    Target,
    RefreshCw,
    Home,
    ChevronRight,
    Loader2,
    Camera
} from 'lucide-react';
import Button from '@/components/common/Button';
import WordPractice from './WordPractice';

/**
 * FullSentencePractice Component
 * @param {string} sentence - Original sentence
 * @param {string[]} words - ASL words to practice
 * @param {Function} onComplete - Callback when practice is complete
 * @param {Function} onExit - Callback to exit practice
 */
const FullSentencePractice = ({ sentence = '', words = [], onComplete, onExit }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [wordAccuracies, setWordAccuracies] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [skippedWords, setSkippedWords] = useState([]);

    // Start timer on mount
    useEffect(() => {
        setStartTime(Date.now());
    }, []);

    // Calculate stats
    const calculateStats = useCallback(() => {
        const duration = endTime && startTime ? Math.round((endTime - startTime) / 1000) : 0;
        const validAccuracies = wordAccuracies.filter(a => a !== null);
        const averageAccuracy = validAccuracies.length > 0
            ? Math.round(validAccuracies.reduce((a, b) => a + b, 0) / validAccuracies.length)
            : 0;

        return {
            duration,
            averageAccuracy,
            wordsCompleted: validAccuracies.length,
            wordsSkipped: skippedWords.length,
            totalWords: words.length,
            wordAccuracies
        };
    }, [endTime, startTime, wordAccuracies, skippedWords, words.length]);

    // Handle word completion
    const handleWordComplete = useCallback((accuracy) => {
        const newAccuracies = [...wordAccuracies, accuracy];
        setWordAccuracies(newAccuracies);

        if (currentWordIndex < words.length - 1) {
            // Move to next word
            setCurrentWordIndex(currentWordIndex + 1);
        } else {
            // All words complete
            setEndTime(Date.now());
            setIsComplete(true);
        }
    }, [currentWordIndex, words.length, wordAccuracies]);

    // Handle word skip
    const handleWordSkip = useCallback(() => {
        setSkippedWords([...skippedWords, currentWordIndex]);
        setWordAccuracies([...wordAccuracies, null]);

        if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
        } else {
            setEndTime(Date.now());
            setIsComplete(true);
        }
    }, [currentWordIndex, words.length, skippedWords, wordAccuracies]);

    // Handle go back
    const handleBack = useCallback(() => {
        if (currentWordIndex > 0) {
            setCurrentWordIndex(currentWordIndex - 1);
            setWordAccuracies(wordAccuracies.slice(0, -1));
            setSkippedWords(skippedWords.filter(i => i !== currentWordIndex - 1));
        }
    }, [currentWordIndex, wordAccuracies, skippedWords]);

    // Handle restart
    const handleRestart = useCallback(() => {
        setCurrentWordIndex(0);
        setWordAccuracies([]);
        setSkippedWords([]);
        setStartTime(Date.now());
        setEndTime(null);
        setIsComplete(false);
    }, []);

    // Handle complete callback
    const handleFinish = useCallback(() => {
        const stats = calculateStats();
        onComplete?.(stats);
    }, [calculateStats, onComplete]);

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    // Completion Screen
    if (isComplete) {
        const stats = calculateStats();
        const isPerfect = stats.averageAccuracy === 100 && stats.wordsSkipped === 0;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 text-center"
            >
                {/* Trophy */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="mb-6"
                >
                    <div className={`inline-flex p-6 rounded-full ${isPerfect ? 'bg-warning/20' : 'bg-success/20'
                        }`}>
                        <Trophy className={`w-16 h-16 ${isPerfect ? 'text-warning' : 'text-success'
                            }`} />
                    </div>
                </motion.div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-dark-100 mb-2">
                    {isPerfect ? 'Perfect!' : stats.averageAccuracy >= 80 ? 'Great Job!' : 'Keep Practicing!'}
                </h2>
                <p className="text-dark-400 mb-8">
                    You completed: "{sentence}"
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-dark-700/50">
                        <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-dark-100">{stats.averageAccuracy}%</p>
                        <p className="text-sm text-dark-400">Accuracy</p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-700/50">
                        <Clock className="w-6 h-6 text-secondary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-dark-100">{formatTime(stats.duration)}</p>
                        <p className="text-sm text-dark-400">Time</p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-700/50">
                        <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                        <p className="text-2xl font-bold text-dark-100">{stats.wordsCompleted}</p>
                        <p className="text-sm text-dark-400">Completed</p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-700/50">
                        <XCircle className="w-6 h-6 text-warning mx-auto mb-2" />
                        <p className="text-2xl font-bold text-dark-100">{stats.wordsSkipped}</p>
                        <p className="text-sm text-dark-400">Skipped</p>
                    </div>
                </div>

                {/* Word-by-Word Breakdown */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-dark-200 mb-4">Word Breakdown</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {words.map((word, index) => {
                            const accuracy = stats.wordAccuracies[index];
                            const wasSkipped = accuracy === null;

                            return (
                                <div
                                    key={`result-${index}`}
                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 ${wasSkipped
                                            ? 'bg-warning/10 border border-warning/30'
                                            : accuracy >= 80
                                                ? 'bg-success/10 border border-success/30'
                                                : 'bg-error/10 border border-error/30'
                                        }`}
                                >
                                    {wasSkipped ? (
                                        <XCircle className="w-4 h-4 text-warning" />
                                    ) : accuracy >= 80 ? (
                                        <CheckCircle2 className="w-4 h-4 text-success" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-error" />
                                    )}
                                    <span className="font-medium text-dark-200">{word}</span>
                                    {!wasSkipped && (
                                        <span className="text-sm text-dark-400">{accuracy}%</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={handleRestart}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Practice Again
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleFinish}
                        leftIcon={<Home className="w-4 h-4" />}
                    >
                        Save & Exit
                    </Button>
                </div>
            </motion.div>
        );
    }

    // Practice Screen
    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4"
            >
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-dark-400">Sentence Progress</p>
                    <p className="text-sm text-dark-400">
                        {currentWordIndex + 1} / {words.length}
                    </p>
                </div>

                {/* Word Progress */}
                <div className="flex items-center gap-2">
                    {words.map((word, index) => {
                        const isCompleted = index < currentWordIndex;
                        const isCurrent = index === currentWordIndex;
                        const wasSkipped = skippedWords.includes(index);

                        return (
                            <div
                                key={`progress-${index}`}
                                className={`flex-1 h-2 rounded-full transition-all ${isCompleted
                                        ? wasSkipped
                                            ? 'bg-warning'
                                            : 'bg-success'
                                        : isCurrent
                                            ? 'bg-primary animate-pulse'
                                            : 'bg-dark-600'
                                    }`}
                            />
                        );
                    })}
                </div>

                {/* Current Word Display */}
                <div className="flex items-center justify-center gap-2 mt-4">
                    {words.map((word, index) => {
                        const isCompleted = index < currentWordIndex;
                        const isCurrent = index === currentWordIndex;
                        const wasSkipped = skippedWords.includes(index);

                        return (
                            <div
                                key={`word-${index}`}
                                className={`px-2 py-1 rounded text-sm font-medium transition-all ${isCompleted
                                        ? wasSkipped
                                            ? 'text-warning line-through'
                                            : 'text-success'
                                        : isCurrent
                                            ? 'text-primary bg-primary/10 px-3'
                                            : 'text-dark-500'
                                    }`}
                            >
                                {word}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Word Practice */}
            <WordPractice
                word={words[currentWordIndex]}
                wordIndex={currentWordIndex}
                totalWords={words.length}
                fullSentence={sentence}
                onComplete={handleWordComplete}
                onSkip={handleWordSkip}
                onBack={handleBack}
            />
        </div>
    );
};

export default FullSentencePractice;
