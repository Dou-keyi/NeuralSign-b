/**
 * Practice Page
 * Combined practice hub with tabs for Practice Modes and Camera Practice
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hand,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Camera,
    CameraOff,
    Zap,
    Target,
    Trophy,
    Flame,
    BarChart3,
    Loader2,
    Infinity,
    Layers,
    Timer,
    History,
    ArrowRight,
    Sparkles
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import CameraFeed from '@/components/camera/CameraFeed';
import ValidationFeedback from '@/components/feedback/ValidationFeedback';
import LetterNav from '@/components/practice/LetterNav';
import BadgeUnlockModal from '@/components/badges/BadgeUnlockModal';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DailyChallenge from '@/components/challenges/DailyChallenge';

// Hooks
import { useHandDetection } from '@/hooks/useHandDetection';
import { usePractice } from '@/hooks/usePractice';
import { useLevelUp } from '@/context/LevelUpContext';
import useAuthStore from '@/store/authStore';

// Data
import { getSignByLetter } from '@/data/signsData';

import SuccessPopup from '@/components/feedback/SuccessPopup';

// Lazy load 3D viewer
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

// ============= PRACTICE MODE TAB COMPONENTS =============

/**
 * Practice Mode Card
 */
const PracticeModeCard = ({
    icon: Icon,
    iconColor,
    bgGradient,
    title,
    description,
    stats,
    onClick,
    disabled = false
}) => (
    <motion.div
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -4 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`
            glass-card p-6 cursor-pointer transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-primary/10'}
        `}
        onClick={disabled ? undefined : onClick}
    >
        <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-semibold text-dark-100 mb-1">{title}</h3>
                <p className="text-sm text-dark-400">{description}</p>
            </div>
        </div>

        {stats && (
            <div className="flex items-center gap-4 mb-4 text-sm">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-dark-300">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span>{stat.value}</span>
                    </div>
                ))}
            </div>
        )}

        <div className="flex items-center justify-between">
            <span className="text-xs text-dark-500 uppercase tracking-wider">
                {disabled ? 'Coming Soon' : 'Start Practice'}
            </span>
            <ArrowRight className="w-5 h-5 text-dark-400" />
        </div>
    </motion.div>
);

/**
 * Quick Stats Sidebar
 */
const QuickStats = ({ userData }) => {
    const learnedCount = userData?.learnedSigns?.length || 0;
    const streak = userData?.progress?.streak || 0;
    const accuracy = userData?.progress?.accuracy || 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
        >
            <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warning" />
                Your Stats
            </h3>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-dark-400">Signs Learned</span>
                    <span className="text-xl font-bold text-primary">{learnedCount}/26</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(learnedCount / 26) * 100}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                </div>

                <div className="pt-4 border-t border-dark-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-warning" />
                            <span className="text-dark-400">Streak</span>
                        </div>
                        <span className="font-bold text-dark-100">{streak} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-success" />
                            <span className="text-dark-400">Accuracy</span>
                        </div>
                        <span className="font-bold text-dark-100">{accuracy}%</span>
                    </div>
                </div>
            </div>

            <Button
                variant="ghost"
                fullWidth
                className="mt-4"
                onClick={() => window.location.href = '/progress'}
            >
                View Full Progress
            </Button>
        </motion.div>
    );
};

// ============= CAMERA PRACTICE TAB COMPONENTS =============

/**
 * Session stats card
 */
const SessionStats = ({ attempts, bestAccuracy, correctAttempts }) => (
    <div className="grid grid-cols-3 gap-3">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-3 text-center"
        >
            <Target className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-xl font-bold text-dark-100">{attempts}</div>
            <div className="text-xs text-dark-400">Attempts</div>
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-3 text-center"
        >
            <BarChart3 className="w-5 h-5 text-secondary mx-auto mb-1" />
            <div className="text-xl font-bold text-dark-100">{bestAccuracy}%</div>
            <div className="text-xs text-dark-400">Best</div>
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-3 text-center"
        >
            <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
            <div className="text-xl font-bold text-dark-100">{correctAttempts}</div>
            <div className="text-xs text-dark-400">Correct</div>
        </motion.div>
    </div>
);

// ============= MAIN PRACTICE COMPONENT =============

/**
 * Practice Page Component
 */
const Practice = () => {
    const navigate = useNavigate();
    const { userData } = useAuthStore();
    const learnedCount = userData?.learnedSigns?.length || 0;

    const [searchParams] = useSearchParams();
    const letterParam = searchParams.get('letter');

    // Tab state
    const [activeTab, setActiveTab] = useState('modes'); // 'modes' or 'practice'

    // Handle initial redirect from Learn page
    useEffect(() => {
        if (letterParam) {
            setActiveTab('practice');
        }
    }, [letterParam]);

    // Practice state
    const [isPracticing, setIsPracticing] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const hasStartedRef = useRef(false);
    const resultRef = useRef(null);
    const cameraRef = useRef(null);

    // Level up context
    const { handleXPResult } = useLevelUp();

    // Practice hook
    const {
        targetLetter,
        setTargetLetter,
        attempts,
        correctAttempts,
        bestAccuracy,
        handleValidationResult,
        handleCorrectSign,
        nextLetter,
        prevLetter,
        hasNextLetter,
        hasPrevLetter,
        newlyUnlockedAchievements,
        clearNewAchievements,
        currentLetterIndex,
        totalLetters,
        lastXPResult,
        clearLastXPResult
    } = usePractice();

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
        targetLetter,
        onCorrectSign: handleCorrectSign,
        onValidationResult: async (result) => {
            // Call the original handler from usePractice
            await handleValidationResult(result);

            if (result?.isCorrect) {
                setShowSuccessPopup(true);
            }

            // Scroll to result section after a short delay
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    });

    // Get sign data for current letter
    const signData = getSignByLetter(targetLetter);

    // Practice modes config
    const practiceModes = [
        {
            id: 'free',
            icon: Infinity,
            iconColor: 'text-white',
            bgGradient: 'from-indigo-500 to-purple-600',
            title: 'Free Practice',
            description: 'Practice any learned sign at your own pace. No pressure, no time limits.',
            route: '/practice/free',
            disabled: learnedCount === 0,
            stats: [
                { icon: Target, value: `${learnedCount} signs available`, color: 'text-success' }
            ]
        },
        {
            id: 'flashcard',
            icon: Layers,
            iconColor: 'text-white',
            bgGradient: 'from-pink-500 to-rose-600',
            title: 'Flashcard Mode',
            description: 'Quiz yourself with random signs. Validate, reveal, or skip.',
            route: '/practice/flashcard',
            disabled: learnedCount === 0,
            stats: [
                { icon: Layers, value: 'Random order', color: 'text-secondary' }
            ]
        },
        {
            id: 'timed',
            icon: Timer,
            iconColor: 'text-white',
            bgGradient: 'from-amber-500 to-orange-600',
            title: 'Timed Challenge',
            description: '60-second sprint! How many signs can you complete?',
            route: '/practice/timed',
            disabled: learnedCount < 3,
            stats: [
                { icon: Timer, value: '60 seconds', color: 'text-warning' }
            ]
        }
    ];

    // Tab definitions
    const tabs = [
        { id: 'modes', label: 'Practice Mode', icon: Target },
        { id: 'practice', label: 'Practice', icon: Camera }
    ];

    /**
     * Start practice mode - just set state, detection starts via useEffect
     */
    const handleStartPractice = useCallback(() => {
        setIsPracticing(true);
    }, []);

    /**
     * Stop practice mode
     */
    const handleStopPractice = useCallback(() => {
        stopDetection();
        setIsPracticing(false);
    }, [stopDetection]);

    /**
     * Handle validate button click
     */
    const handleValidate = useCallback(async () => {
        await validateSign();
    }, [validateSign]);

    /**
     * Handle try again
     */
    const handleTryAgain = useCallback(() => {
        clearValidation();
        // Scroll back to camera
        setTimeout(() => {
            cameraRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }, [clearValidation]);

    /**
     * Handle next letter
     */
    const handleNextLetter = useCallback(() => {
        clearValidation();
        nextLetter();
    }, [clearValidation, nextLetter]);

    /**
     * Handle letter change
     */
    const handleLetterChange = useCallback((letter) => {
        clearValidation();
        setTargetLetter(letter);
    }, [clearValidation, setTargetLetter]);

    /**
     * Handle prev letter
     */
    const handlePrevLetter = useCallback(() => {
        clearValidation();
        prevLetter();
    }, [clearValidation, prevLetter]);

    // Start detection after video element is mounted
    useEffect(() => {
        if (isPracticing && !hasStartedRef.current) {
            hasStartedRef.current = true;
            const timer = setTimeout(() => {
                requestAnimationFrame(() => {
                    startDetection();
                });
            }, 150);
            return () => clearTimeout(timer);
        }

        if (!isPracticing) {
            hasStartedRef.current = false;
        }
    }, [isPracticing]);

    // Cleanup on unmount only
    useEffect(() => {
        return () => {
            stopDetection();
        };
    }, []);

    // Handle level-up when XP result comes in
    useEffect(() => {
        if (lastXPResult) {
            handleXPResult(lastXPResult);
            clearLastXPResult();
        }
    }, [lastXPResult, handleXPResult, clearLastXPResult]);

    // Sync target letter from URL
    useEffect(() => {
        if (letterParam) {
            setTargetLetter(letterParam);
        }
    }, [letterParam, setTargetLetter]);

    // ============= RENDER: PRACTICE MODES TAB =============
    const renderPracticeModesTab = () => (
        <>
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main content - practice modes */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Daily Challenge */}
                    <DailyChallenge />

                    {/* Practice mode cards */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {practiceModes.map((mode, index) => (
                            <motion.div
                                key={mode.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.1 }}
                            >
                                <PracticeModeCard
                                    {...mode}
                                    onClick={() => navigate(mode.route)}
                                />
                            </motion.div>
                        ))}

                        {/* Practice History Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <PracticeModeCard
                                icon={History}
                                iconColor="text-white"
                                bgGradient="from-slate-500 to-slate-600"
                                title="Practice History"
                                description="Review your past practice sessions and track improvement."
                                onClick={() => navigate('/practice/history')}
                            />
                        </motion.div>
                    </div>

                    {/* No learned signs warning */}
                    {learnedCount === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card p-6 border border-warning/20 bg-warning/5"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-warning/10">
                                    <Sparkles className="w-5 h-5 text-warning" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-dark-100 mb-1">
                                        Learn some signs first!
                                    </h3>
                                    <p className="text-sm text-dark-400 mb-3">
                                        Practice modes require you to have learned at least one sign.
                                        Head to the Learn section to get started.
                                    </p>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => navigate('/learn')}
                                    >
                                        Start Learning
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar - Quick stats */}
                <div className="space-y-6">
                    <QuickStats userData={userData} />
                </div>
            </div>
        </>
    );

    // ============= RENDER: CAMERA PRACTICE TAB =============
    const renderCameraPracticeTab = () => {
        // Not practicing state - show letter selection
        if (!isPracticing) {
            return (
                <>
                    {/* Camera Practice Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6 mb-6"
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-dark-100 mb-1">
                                    Camera Practice
                                </h2>
                                <p className="text-dark-400 text-sm">
                                    Use your camera to practice signs with real-time AI feedback.
                                    Make the sign, then tap Validate to check your accuracy.
                                </p>
                            </div>
                        </div>

                        {/* Target letter selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-dark-300 mb-3">
                                Select letter to practice:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
                                    <button
                                        key={letter}
                                        onClick={() => handleLetterChange(letter)}
                                        className={`
                                            w-10 h-10 rounded-lg font-bold text-lg transition-all duration-200
                                            ${targetLetter === letter
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-dark-100'
                                            }
                                        `}
                                    >
                                        {letter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start button */}
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleStartPractice}
                            leftIcon={<Camera className="w-5 h-5" />}
                        >
                            Start Practice with Letter {targetLetter}
                        </Button>
                    </motion.div>

                    {/* AI Features Note */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6 flex items-start gap-4"
                    >
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-dark-100 mb-1">Powered by AI</h3>
                            <p className="text-sm text-dark-400">
                                NeuralSign uses Google's Gemini AI to analyze your hand positions
                                and provide personalized feedback. MediaPipe tracks your hand in
                                real-time for accurate detection.
                            </p>
                        </div>
                    </motion.div>
                </>
            );
        }

        // Active practice state - show camera and validation
        return (
            <>
                {/* Header with back button */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <Button
                        variant="ghost"
                        onClick={handleStopPractice}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                        Exit Practice
                    </Button>

                    <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full">
                        <Flame className="w-4 h-4 text-accent" />
                        <span className="text-dark-200 font-medium">
                            Practicing: <span className="text-primary font-bold">{targetLetter}</span>
                        </span>
                    </div>
                </motion.div>

                {/* Main content - two column layout */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left column: Camera + Controls */}
                    <div ref={cameraRef} className="space-y-4">
                        {/* Camera feed */}
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

                        {/* Validate button */}
                        <AnimatePresence>
                            {isCameraActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                >
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        onClick={handleValidate}
                                        disabled={isValidating || cooldownRemaining > 0}
                                        leftIcon={
                                            isValidating
                                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                                : <Zap className="w-5 h-5" />
                                        }
                                        className={`
                                            ${!isValidating && cooldownRemaining === 0
                                                ? 'animate-pulse-subtle'
                                                : ''
                                            }
                                        `}
                                    >
                                        {isValidating
                                            ? 'Analyzing...'
                                            : cooldownRemaining > 0
                                                ? `Wait ${cooldownRemaining}s...`
                                                : 'Validate Sign'
                                        }
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Letter navigation */}
                        <LetterNav
                            currentLetter={targetLetter}
                            currentIndex={currentLetterIndex}
                            total={totalLetters}
                            onPrev={handlePrevLetter}
                            onNext={handleNextLetter}
                            hasPrev={hasPrevLetter()}
                            hasNext={hasNextLetter()}
                        />
                    </div>

                    {/* Right column: Target + Feedback + Stats */}
                    <div ref={resultRef} className="space-y-4">
                        {/* Target letter display */}
                        <motion.div
                            key={targetLetter}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-6 text-center"
                        >
                            <div className="text-sm text-dark-400 mb-2">Make this sign:</div>
                            <div className="text-8xl font-bold gradient-text mb-4">
                                {targetLetter}
                            </div>
                            {signData && (
                                <div className="text-sm text-dark-400">
                                    {signData.description}
                                </div>
                            )}
                        </motion.div>

                        {/* Success Popup */}
                        <SuccessPopup
                            isOpen={showSuccessPopup}
                            onClose={() => setShowSuccessPopup(false)}
                            letter={targetLetter}
                            score={validationResult?.accuracy || 0}
                        />

                        {/* 3D Model (optional) */}
                        <Suspense fallback={
                            <div className="glass-card p-4 aspect-square flex items-center justify-center">
                                <LoadingSpinner text="Loading model..." />
                            </div>
                        }>
                            <div className="hidden lg:block">
                                <ModelViewer
                                    letter={targetLetter}
                                    showControls={false}
                                    height="250px"
                                />
                            </div>
                        </Suspense>

                        {/* Validation feedback */}
                        <ValidationFeedback
                            result={validationResult}
                            isValidating={isValidating}
                            targetLetter={targetLetter}
                            onTryAgain={handleTryAgain}
                            onNext={handleNextLetter}
                            cooldownRemaining={cooldownRemaining}
                        />

                        {/* Session stats */}
                        <SessionStats
                            attempts={attempts}
                            bestAccuracy={bestAccuracy}
                            correctAttempts={correctAttempts}
                        />
                    </div>
                </div>
            </>
        );
    };

    // ============= MAIN RENDER =============
    return (
        <PageContainer>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                        <Hand className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100">Practice</h1>
                        <p className="text-dark-400">Practice ASL signs with AI validation</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                {!isPracticing && (
                    <div className="flex gap-2 mt-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-primary text-white'
                                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-dark-100'
                                    }
                                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'modes' && !isPracticing ? (
                    <motion.div
                        key="modes"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        {renderPracticeModesTab()}
                    </motion.div>
                ) : (
                    <motion.div
                        key="practice"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {renderCameraPracticeTab()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Achievement Unlock Modal */}
            <BadgeUnlockModal
                isOpen={newlyUnlockedAchievements.length > 0}
                onClose={clearNewAchievements}
                badges={newlyUnlockedAchievements}
            />
        </PageContainer>
    );
};

export default Practice;
