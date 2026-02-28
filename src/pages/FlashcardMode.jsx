/**
 * Flashcard Mode Page
 * Quiz-style practice with random signs
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logEvent } from 'firebase/analytics';
import {
    Layers,
    ArrowLeft,
    Trophy,
    Target,
    Flame,
    Eye,
    SkipForward,
    RotateCcw,
    Home,
    ChevronRight
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import CameraFeed from '@/components/camera/CameraFeed';
import FlashcardCard from '@/components/practice/FlashcardCard';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Hooks
import { useHandDetection } from '@/hooks/useHandDetection';
import { useLevelUp } from '@/context/LevelUpContext';

// Services
import { savePracticeSession, updateStreak, updateAccuracyAverage } from '@/services/database';
import { checkChallengeCompletion, getTodayChallenge } from '@/services/challengeService';
import { analytics } from '@/services/firebase';

// Store
import useAuthStore from '@/store/authStore';

// Lazy load 3D viewer
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Score Display Component
 */
const ScoreDisplay = ({ correct, total, streak }) => (
    <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-success" />
            <span className="font-bold text-dark-100">{correct}/{total}</span>
            <span className="text-dark-400 text-sm">Correct</span>
        </div>
        <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-warning" />
            <span className="font-bold text-dark-100">{streak}</span>
            <span className="text-dark-400 text-sm">Streak</span>
        </div>
    </div>
);

/**
 * Session Summary Component
 */
const SessionSummary = ({ results, onRetry, onReviewMistakes, onExit }) => {
    const correct = results.filter(r => r.correct).length;
    const revealed = results.filter(r => r.revealed).length;
    const skipped = results.filter(r => r.skipped).length;
    const total = results.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const bestStreak = calculateBestStreak(results);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto"
        >
            <div className="glass-card p-8 text-center">
                {/* Trophy */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center"
                >
                    <Trophy className="w-10 h-10 text-warning" />
                </motion.div>

                <h2 className="text-2xl font-bold text-dark-100 mb-2">
                    Session Complete!
                </h2>
                <p className="text-dark-400 mb-6">
                    Great practice session! Here's how you did:
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="glass-card p-4">
                        <div className="text-3xl font-bold text-success mb-1">{correct}</div>
                        <div className="text-sm text-dark-400">Correct</div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="text-3xl font-bold text-primary mb-1">{accuracy}%</div>
                        <div className="text-sm text-dark-400">Accuracy</div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="text-3xl font-bold text-warning mb-1">{revealed}</div>
                        <div className="text-sm text-dark-400">Revealed</div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="text-3xl font-bold text-secondary mb-1">{bestStreak}</div>
                        <div className="text-sm text-dark-400">Best Streak</div>
                    </div>
                </div>

                {/* Skipped info */}
                {skipped > 0 && (
                    <p className="text-sm text-dark-400 mb-6">
                        {skipped} card{skipped > 1 ? 's' : ''} skipped
                    </p>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    {revealed > 0 || (total - correct) > 0 ? (
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={onReviewMistakes}
                            leftIcon={<Eye className="w-5 h-5" />}
                        >
                            Review Mistakes ({revealed + (total - correct - revealed - skipped)})
                        </Button>
                    ) : null}
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={onRetry}
                        leftIcon={<RotateCcw className="w-5 h-5" />}
                    >
                        Practice Again
                    </Button>
                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={onExit}
                        leftIcon={<Home className="w-5 h-5" />}
                    >
                        Back to Menu
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Calculate best streak from results
 */
function calculateBestStreak(results) {
    let currentStreak = 0;
    let bestStreak = 0;

    for (const result of results) {
        if (result.correct) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }

    return bestStreak;
}

/**
 * Flashcard Mode Page Component
 */
const FlashcardMode = () => {
    const navigate = useNavigate();
    const { user, userData } = useAuthStore();
    const { handleXPResult } = useLevelUp();
    const hasStartedRef = useRef(false);
    const startTimeRef = useRef(Date.now());

    // Get learned signs
    const learnedSigns = userData?.learnedSigns || [];

    // Shuffle signs for session
    const shuffledSigns = useMemo(() => shuffleArray(learnedSigns), []);

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
    const [results, setResults] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [cameraActive, setCameraActive] = useState(true);

    // Current sign
    const currentSign = shuffledSigns[currentIndex];

    // Detection hook
    const {
        videoRef,
        canvasRef,
        isDetecting,
        isValidating,
        isCameraActive,
        isCameraLoading,
        handDetected,
        validationResult,
        error,
        cooldownRemaining,
        startDetection,
        stopDetection,
        validateSign,
        clearValidation
    } = useHandDetection({
        targetLetter: currentSign,
        onCorrectSign: handleCorrectSign,
        onValidationResult: handleValidationResult
    });

    /**
     * Handle validation result
     */
    function handleValidationResult(result) {
        if (!result) return;

        const isCorrect = result.isCorrect;

        // Update score
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
            streak: isCorrect ? prev.streak + 1 : 0
        }));

        // Add to results
        setResults(prev => [...prev, {
            sign: currentSign,
            correct: isCorrect,
            revealed: false,
            skipped: false,
            accuracy: result.accuracy
        }]);
    }

    /**
     * Handle correct sign
     */
    async function handleCorrectSign(result) {
        if (!user?.uid || !currentSign) return;

        try {
            // savePracticeSession now returns XP result
            const xpResult = await savePracticeSession(user.uid, {
                sign: currentSign,
                accuracy: result.accuracy,
                attempts: 1,
                mode: 'flashcard'
            });

            // Show level-up modal if user leveled up
            if (xpResult) {
                handleXPResult(xpResult);
            }

            await updateStreak(user.uid);
            await updateAccuracyAverage(user.uid);
        } catch (error) {
            console.error('❌ Error saving practice:', error);
        }
    }

    /**
     * Handle validate
     */
    const handleValidate = useCallback(async () => {
        await validateSign();
    }, [validateSign]);

    /**
     * Handle reveal
     */
    const handleReveal = useCallback(() => {
        setRevealed(true);

        // Add to results as revealed
        setResults(prev => [...prev, {
            sign: currentSign,
            correct: false,
            revealed: true,
            skipped: false,
            accuracy: 0
        }]);

        setScore(prev => ({
            ...prev,
            total: prev.total + 1,
            streak: 0
        }));
    }, [currentSign]);

    /**
     * Handle skip
     */
    const handleSkip = useCallback(() => {
        setResults(prev => [...prev, {
            sign: currentSign,
            correct: false,
            revealed: false,
            skipped: true,
            accuracy: 0
        }]);

        goToNext();
    }, [currentSign]);

    /**
     * Go to next card
     */
    const goToNext = useCallback(async () => {
        clearValidation();
        setRevealed(false);

        if (currentIndex >= shuffledSigns.length - 1) {
            // Session complete
            setIsComplete(true);

            // Log analytics
            if (analytics) {
                const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
                logEvent(analytics, 'flashcard_session_complete', {
                    total_cards: shuffledSigns.length,
                    correct: score.correct,
                    accuracy: Math.round((score.correct / score.total) * 100),
                    duration
                });
            }

            // Check daily challenge
            if (user?.uid) {
                const challenge = getTodayChallenge();
                const challengeResult = await checkChallengeCompletion(user.uid, challenge.id, {
                    roundsCompleted: shuffledSigns.length,
                    accuracy: Math.round((score.correct / score.total) * 100)
                });

                // Show level-up modal if challenge completion caused level-up
                if (challengeResult?.xpResult) {
                    handleXPResult(challengeResult.xpResult);
                }
            }
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, shuffledSigns.length, clearValidation, score, user?.uid, handleXPResult]);

    /**
     * Retry session
     */
    const handleRetry = useCallback(() => {
        setCurrentIndex(0);
        setScore({ correct: 0, total: 0, streak: 0 });
        setResults([]);
        setIsComplete(false);
        setRevealed(false);
        startTimeRef.current = Date.now();
    }, []);

    /**
     * Review mistakes
     */
    const handleReviewMistakes = useCallback(() => {
        // Filter for mistakes
        const mistakes = results.filter(r => !r.correct && !r.skipped);
        // Navigate to free practice with these signs
        // For now, just restart with mistakes
        console.log('Review mistakes:', mistakes.map(m => m.sign));
        handleRetry();
    }, [results, handleRetry]);

    // Start camera detection
    useEffect(() => {
        if (cameraActive && !hasStartedRef.current && !isComplete) {
            hasStartedRef.current = true;
            const timer = setTimeout(() => {
                requestAnimationFrame(() => {
                    startDetection();
                });
            }, 150);
            return () => clearTimeout(timer);
        }

        if (!cameraActive || isComplete) {
            hasStartedRef.current = false;
        }
    }, [cameraActive, isComplete]);

    // Cleanup
    useEffect(() => {
        return () => {
            stopDetection();
        };
    }, []);

    // Log session start
    useEffect(() => {
        if (analytics) {
            logEvent(analytics, 'flashcard_session_start');
        }
    }, []);

    // No learned signs
    if (learnedSigns.length === 0) {
        return (
            <PageContainer>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto text-center py-12"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-dark-700 flex items-center justify-center">
                        <Layers className="w-10 h-10 text-dark-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-dark-100 mb-2">
                        No Signs Learned Yet
                    </h1>
                    <p className="text-dark-400 mb-6">
                        Flashcard mode requires at least one learned sign.
                    </p>
                    <Button variant="primary" onClick={() => navigate('/learn')}>
                        Start Learning
                    </Button>
                </motion.div>
            </PageContainer>
        );
    }

    // Session complete
    if (isComplete) {
        return (
            <PageContainer>
                <SessionSummary
                    results={results}
                    onRetry={handleRetry}
                    onReviewMistakes={handleReviewMistakes}
                    onExit={() => navigate('/practice')}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
            >
                <Button
                    variant="ghost"
                    onClick={() => navigate('/practice')}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Exit
                </Button>

                <ScoreDisplay
                    correct={score.correct}
                    total={score.total}
                    streak={score.streak}
                />

                <div className="text-dark-400">
                    {currentIndex + 1} / {shuffledSigns.length}
                </div>
            </motion.div>

            {/* Progress bar */}
            <div className="mb-6">
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / shuffledSigns.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Main content */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left: Flashcard */}
                <div>
                    <FlashcardCard
                        sign={currentSign}
                        revealed={revealed}
                        validationResult={validationResult}
                        isValidating={isValidating}
                        onValidate={handleValidate}
                        onReveal={handleReveal}
                        onSkip={handleSkip}
                        cooldownRemaining={cooldownRemaining}
                    />

                    {/* Next button after result */}
                    {validationResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4"
                        >
                            <Button
                                variant="primary"
                                fullWidth
                                size="lg"
                                onClick={goToNext}
                                rightIcon={<ChevronRight className="w-5 h-5" />}
                            >
                                Next Card
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Right: Camera feed */}
                <div className="space-y-4">
                    <CameraFeed
                        videoRef={videoRef}
                        canvasRef={canvasRef}
                        isActive={isCameraActive}
                        isLoading={isCameraLoading}
                        isDetecting={isDetecting}
                        handDetected={handDetected}
                        error={error}
                        onStart={startDetection}
                        onStop={stopDetection}
                        onRetry={startDetection}
                    />

                    {/* 3D model hint (hidden by default, shown when revealed) */}
                    {revealed && (
                        <Suspense fallback={
                            <div className="glass-card p-4 h-48 flex items-center justify-center">
                                <LoadingSpinner text="Loading model..." />
                            </div>
                        }>
                            <ModelViewer
                                letter={currentSign}
                                showControls={false}
                                height="200px"
                            />
                        </Suspense>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default FlashcardMode;
