/**
 * Timed Challenge Page
 * 60-second speed challenge mode
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logEvent } from 'firebase/analytics';
import {
    Timer,
    ArrowLeft,
    Play,
    Target,
    Flame,
    Zap,
    Trophy
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import CameraFeed from '@/components/camera/CameraFeed';
import ChallengeTimer from '@/components/practice/ChallengeTimer';
import ChallengeResults from '@/components/practice/ChallengeResults';
import Button from '@/components/common/Button';

// Hooks
import { useHandDetection } from '@/hooks/useHandDetection';
import { useLevelUp } from '@/context/LevelUpContext';

// Services
import { savePracticeSession, updateStreak, getUserProfile } from '@/services/database';
import { checkChallengeCompletion, getTodayChallenge } from '@/services/challengeService';
import { analytics } from '@/services/firebase';

// Store
import useAuthStore from '@/store/authStore';

// Constants
const CHALLENGE_DURATION = 60; // 60 seconds

/**
 * Get random sign from pool, avoiding recent ones
 */
function getRandomSign(pool, recentSigns, maxRecent = 3) {
    // Filter out recently used signs if enough options
    let available = pool.filter(s => !recentSigns.includes(s));
    if (available.length === 0) available = pool;

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
}

/**
 * Countdown Screen Component
 */
const CountdownScreen = ({ count, onComplete }) => {
    useEffect(() => {
        if (count === 0) {
            onComplete?.();
        }
    }, [count, onComplete]);

    return (
        <motion.div
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/90"
        >
            <div className="text-center">
                {count > 0 ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-9xl font-bold gradient-text"
                    >
                        {count}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-6xl font-bold text-success"
                    >
                        GO!
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

/**
 * Start Screen Component
 */
const StartScreen = ({ learnedCount, personalBest, onStart }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-12"
    >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Timer className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-dark-100 mb-2">
            60-Second Challenge
        </h1>
        <p className="text-dark-400 mb-8">
            How many signs can you complete in 60 seconds?
            Test your speed and accuracy!
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-card p-4">
                <div className="text-sm text-dark-400 mb-1">Signs Available</div>
                <div className="text-2xl font-bold text-primary">{learnedCount}</div>
            </div>
            <div className="glass-card p-4">
                <div className="text-sm text-dark-400 mb-1">Personal Best</div>
                <div className="text-2xl font-bold text-warning">
                    {personalBest > 0 ? personalBest : '-'}
                </div>
            </div>
        </div>

        {/* Rules */}
        <div className="glass-card p-4 text-left mb-8">
            <h3 className="font-semibold text-dark-100 mb-2">How it works:</h3>
            <ul className="text-sm text-dark-400 space-y-1">
                <li>• Random signs appear - make them as fast as you can</li>
                <li>• Each correct sign adds to your score</li>
                <li>• Keep a streak going for bonus points</li>
                <li>• Try to beat your personal best!</li>
            </ul>
        </div>

        <Button
            variant="primary"
            size="xl"
            onClick={onStart}
            leftIcon={<Play className="w-6 h-6" />}
        >
            Start Challenge
        </Button>
    </motion.div>
);

/**
 * Timed Challenge Page Component
 */
const TimedChallenge = () => {
    const navigate = useNavigate();
    const { user, userData } = useAuthStore();
    const { handleXPResult } = useLevelUp();
    const hasStartedRef = useRef(false);

    // Get learned signs
    const learnedSigns = userData?.learnedSigns || [];

    // State
    const [gameState, setGameState] = useState('start'); // start, countdown, playing, results
    const [countdown, setCountdown] = useState(3);
    const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_DURATION);
    const [currentSign, setCurrentSign] = useState(null);
    const [recentSigns, setRecentSigns] = useState([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [correctAttempts, setCorrectAttempts] = useState(0);
    const [personalBest, setPersonalBest] = useState(0);

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
     * Load personal best on mount
     */
    useEffect(() => {
        if (user?.uid) {
            getUserProfile(user.uid).then(profile => {
                const pb = profile?.progress?.timedChallengeBest || 0;
                setPersonalBest(pb);
            });
        }
    }, [user?.uid]);

    /**
     * Handle game start
     */
    const handleStart = useCallback(() => {
        setGameState('countdown');
        setCountdown(3);

        // Start countdown
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    /**
     * Handle countdown complete
     */
    const handleCountdownComplete = useCallback(() => {
        setGameState('playing');
        setTimeRemaining(CHALLENGE_DURATION);

        // Set first sign
        const firstSign = getRandomSign(learnedSigns, []);
        setCurrentSign(firstSign);
        setRecentSigns([firstSign]);

        // Log analytics
        if (analytics) {
            logEvent(analytics, 'timed_challenge_start');
        }
    }, [learnedSigns]);

    /**
     * Handle timer
     */
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    /**
     * Handle timer complete
     */
    const handleTimerComplete = useCallback(async () => {
        stopDetection();
        setGameState('results');

        // Calculate results
        const accuracy = attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : 0;
        const isNewPersonalBest = score > personalBest;

        // Save results
        if (user?.uid) {
            try {
                // Save practice session and get XP result
                const xpResult = await savePracticeSession(user.uid, {
                    sign: 'challenge',
                    accuracy,
                    attempts,
                    mode: 'timed_challenge',
                    score,
                    bestStreak,
                    duration: CHALLENGE_DURATION
                });

                // Show level-up modal if user leveled up from practice XP
                if (xpResult) {
                    handleXPResult(xpResult);
                }

                await updateStreak(user.uid);

                // Check daily challenge
                const challenge = getTodayChallenge();
                const challengeResult = await checkChallengeCompletion(user.uid, challenge.id, {
                    score,
                    isPersonalBest: isNewPersonalBest
                });

                // Show level-up modal if challenge completion caused level-up
                if (challengeResult?.xpResult) {
                    handleXPResult(challengeResult.xpResult);
                }

                // Log analytics
                if (analytics) {
                    logEvent(analytics, 'timed_challenge_complete', {
                        score,
                        accuracy,
                        best_streak: bestStreak,
                        is_personal_best: isNewPersonalBest
                    });
                }
            } catch (error) {
                console.error('❌ Error saving challenge results:', error);
            }
        }
    }, [user?.uid, score, attempts, personalBest, bestStreak, correctAttempts, stopDetection, handleXPResult]);

    /**
     * Handle validation result
     */
    function handleValidationResult(result) {
        if (!result || gameState !== 'playing') return;

        setAttempts(prev => prev + 1);

        if (result.isCorrect) {
            setCorrectAttempts(prev => prev + 1);
        }
    }

    /**
     * Handle correct sign
     */
    function handleCorrectSign(result) {
        if (gameState !== 'playing') return;

        // Update score and streak
        setScore(prev => prev + 1);
        setStreak(prev => {
            const newStreak = prev + 1;
            setBestStreak(current => Math.max(current, newStreak));
            return newStreak;
        });

        // Get next sign
        const nextSign = getRandomSign(learnedSigns, recentSigns);
        setCurrentSign(nextSign);
        setRecentSigns(prev => [...prev.slice(-2), nextSign]);
        clearValidation();
    }

    /**
     * Handle retry
     */
    const handleRetry = useCallback(() => {
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setAttempts(0);
        setCorrectAttempts(0);
        setRecentSigns([]);
        hasStartedRef.current = false;
        handleStart();
    }, [handleStart]);

    // Start camera when playing
    useEffect(() => {
        if (gameState === 'playing' && !hasStartedRef.current) {
            hasStartedRef.current = true;
            const timer = setTimeout(() => {
                requestAnimationFrame(() => {
                    startDetection();
                });
            }, 150);
            return () => clearTimeout(timer);
        }

        if (gameState !== 'playing') {
            hasStartedRef.current = false;
        }
    }, [gameState]);

    // Cleanup
    useEffect(() => {
        return () => {
            stopDetection();
        };
    }, []);

    // Not enough signs
    if (learnedSigns.length < 3) {
        return (
            <PageContainer>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto text-center py-12"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-dark-700 flex items-center justify-center">
                        <Timer className="w-10 h-10 text-dark-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-dark-100 mb-2">
                        Learn More Signs First
                    </h1>
                    <p className="text-dark-400 mb-6">
                        Timed Challenge requires at least 3 learned signs.
                        You have {learnedSigns.length} sign{learnedSigns.length !== 1 ? 's' : ''} learned.
                    </p>
                    <Button variant="primary" onClick={() => navigate('/learn')}>
                        Continue Learning
                    </Button>
                </motion.div>
            </PageContainer>
        );
    }

    // Start screen
    if (gameState === 'start') {
        return (
            <PageContainer>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/practice')}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    className="mb-4"
                >
                    Back
                </Button>
                <StartScreen
                    learnedCount={learnedSigns.length}
                    personalBest={personalBest}
                    onStart={handleStart}
                />
            </PageContainer>
        );
    }

    // Countdown
    if (gameState === 'countdown') {
        return (
            <AnimatePresence>
                <CountdownScreen count={countdown} onComplete={handleCountdownComplete} />
            </AnimatePresence>
        );
    }

    // Results
    if (gameState === 'results') {
        const accuracy = attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : 0;

        return (
            <PageContainer>
                <ChallengeResults
                    results={{
                        score,
                        accuracy,
                        bestStreak,
                        duration: CHALLENGE_DURATION,
                        attempts,
                        isPersonalBest: score > personalBest,
                        personalBest
                    }}
                    onRetry={handleRetry}
                    onExit={() => navigate('/practice')}
                />
            </PageContainer>
        );
    }

    // Playing
    return (
        <PageContainer>
            {/* Header with timer and score */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
            >
                {/* Timer */}
                <ChallengeTimer
                    timeRemaining={timeRemaining}
                    totalTime={CHALLENGE_DURATION}
                    isActive={gameState === 'playing'}
                    onComplete={handleTimerComplete}
                />

                {/* Live stats */}
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-2xl">
                        <Trophy className="w-6 h-6 text-warning" />
                        <span className="font-bold text-dark-100">{score}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-warning" />
                            <span className="text-dark-300">{streak}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Target className="w-4 h-4 text-success" />
                            <span className="text-dark-300">{correctAttempts}/{attempts}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main content */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left: Current sign */}
                <motion.div
                    key={currentSign}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-8 text-center"
                >
                    <div className="text-sm text-dark-400 mb-2">Make this sign:</div>
                    <div className="text-9xl font-bold gradient-text mb-4">
                        {currentSign}
                    </div>

                    {/* Validate button */}
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={validateSign}
                        disabled={isValidating || cooldownRemaining > 0}
                        leftIcon={<Zap className="w-5 h-5" />}
                    >
                        {isValidating ? 'Checking...' : 'Validate'}
                    </Button>

                    {/* Validation feedback */}
                    <AnimatePresence>
                        {validationResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`
                                    mt-4 p-3 rounded-xl text-center
                                    ${validationResult.isCorrect
                                        ? 'bg-success/10 text-success'
                                        : 'bg-error/10 text-error'
                                    }
                                `}
                            >
                                {validationResult.isCorrect ? '✓ Correct!' : '✗ Try again'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Right: Camera feed */}
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
            </div>
        </PageContainer>
    );
};

export default TimedChallenge;
