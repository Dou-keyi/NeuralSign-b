/**
 * Free Practice Page
 * Relaxed practice mode for learned signs
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Infinity,
    ArrowLeft,
    Camera,
    CameraOff,
    Zap,
    Clock,
    Target,
    Check,
    Loader2,
    Sparkles
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import CameraFeed from '@/components/camera/CameraFeed';
import ValidationFeedback from '@/components/feedback/ValidationFeedback';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SignSelector from '@/components/practice/SignSelector';

// Hooks
import { useHandDetection } from '@/hooks/useHandDetection';
import { useLevelUp } from '@/context/LevelUpContext';

// Services
import { savePracticeSession, updateStreak, updateAccuracyAverage } from '@/services/database';

// Data
import { getSignByLetter } from '@/data/signsData';

// Store
import useAuthStore from '@/store/authStore';

// Lazy load 3D viewer
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

/**
 * Session Stats Component
 */
const SessionStats = ({ startTime, signsReviewed, validationAttempts }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Session Stats
            </h3>
            <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                    <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-dark-100">{formatTime(elapsed)}</div>
                    <div className="text-xs text-dark-400">Duration</div>
                </div>
                <div className="text-center">
                    <Target className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <div className="text-lg font-bold text-dark-100">{signsReviewed}</div>
                    <div className="text-xs text-dark-400">Signs</div>
                </div>
                <div className="text-center">
                    <Zap className="w-5 h-5 text-accent mx-auto mb-1" />
                    <div className="text-lg font-bold text-dark-100">{validationAttempts}</div>
                    <div className="text-xs text-dark-400">Validations</div>
                </div>
            </div>
        </div>
    );
};

/**
 * Free Practice Page Component
 */
const FreePractice = () => {
    const navigate = useNavigate();
    const { user, userData } = useAuthStore();
    const { handleXPResult } = useLevelUp();
    const hasStartedRef = useRef(false);

    // State
    const [selectedSign, setSelectedSign] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        startTime: Date.now(),
        signsReviewed: new Set(),
        validationAttempts: 0
    });

    // Get learned signs from user data
    const learnedSigns = userData?.learnedSigns || [];

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
        targetLetter: selectedSign,
        onCorrectSign: handleCorrectSign,
        onValidationResult: handleValidationResult
    });

    // Get sign data for selected sign
    const signData = selectedSign ? getSignByLetter(selectedSign) : null;

    /**
     * Handle sign selection
     */
    const handleSignSelect = useCallback((sign) => {
        setSelectedSign(sign);
        clearValidation();

        // Track signs reviewed
        setSessionStats(prev => ({
            ...prev,
            signsReviewed: new Set([...prev.signsReviewed, sign])
        }));
    }, [clearValidation]);

    /**
     * Toggle camera
     */
    const handleToggleCamera = useCallback(() => {
        if (cameraActive) {
            stopDetection();
            setCameraActive(false);
        } else {
            setCameraActive(true);
        }
    }, [cameraActive, stopDetection]);

    /**
     * Handle validate button click
     */
    const handleValidate = useCallback(async () => {
        setSessionStats(prev => ({
            ...prev,
            validationAttempts: prev.validationAttempts + 1
        }));
        await validateSign();
    }, [validateSign]);

    /**
     * Handle validation result
     */
    function handleValidationResult(result) {
        if (!result) return;
        console.log('📊 Validation result:', result);
    }

    /**
     * Handle correct sign
     */
    async function handleCorrectSign(result) {
        if (!user?.uid || !selectedSign) return;

        try {
            // Save practice session and get XP result
            const xpResult = await savePracticeSession(user.uid, {
                sign: selectedSign,
                accuracy: result.accuracy,
                attempts: 1,
                mode: 'free_practice'
            });

            // Show level-up modal if user leveled up
            if (xpResult) {
                handleXPResult(xpResult);
            }

            // Update streak and accuracy
            await updateStreak(user.uid);
            await updateAccuracyAverage(user.uid);

            console.log('✅ Practice saved');
        } catch (error) {
            console.error('❌ Error saving practice:', error);
        }
    }

    /**
     * Handle try again
     */
    const handleTryAgain = useCallback(() => {
        clearValidation();
    }, [clearValidation]);

    // Start camera detection when camera becomes active
    useEffect(() => {
        if (cameraActive && !hasStartedRef.current) {
            hasStartedRef.current = true;
            const timer = setTimeout(() => {
                requestAnimationFrame(() => {
                    startDetection();
                });
            }, 150);
            return () => clearTimeout(timer);
        }

        if (!cameraActive) {
            hasStartedRef.current = false;
        }
    }, [cameraActive]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopDetection();
        };
    }, []);

    // Set initial sign if learned signs exist
    useEffect(() => {
        if (learnedSigns.length > 0 && !selectedSign) {
            setSelectedSign(learnedSigns[0]);
        }
    }, [learnedSigns, selectedSign]);

    // No learned signs state
    if (learnedSigns.length === 0) {
        return (
            <PageContainer>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto text-center py-12"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-dark-700 flex items-center justify-center">
                        <Infinity className="w-10 h-10 text-dark-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-dark-100 mb-2">
                        No Signs Learned Yet
                    </h1>
                    <p className="text-dark-400 mb-6">
                        Free Practice mode requires at least one learned sign.
                        Head to the Learn section to get started!
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/learn')}
                    >
                        Start Learning
                    </Button>
                </motion.div>
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
                    Practice Menu
                </Button>

                <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full">
                    <Infinity className="w-4 h-4 text-primary" />
                    <span className="text-dark-200 font-medium">Free Practice</span>
                </div>
            </motion.div>

            {/* Main content */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left column: Sign selector + 3D model */}
                <div className="space-y-4">
                    {/* Sign Selector */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <label className="block text-sm font-medium text-dark-300 mb-3">
                            Select a sign to practice:
                        </label>
                        <SignSelector
                            learnedSigns={learnedSigns}
                            selectedSign={selectedSign}
                            onSelect={handleSignSelect}
                            viewMode="grid"
                        />
                    </motion.div>

                    {/* 3D Model */}
                    {selectedSign && (
                        <motion.div
                            key={selectedSign}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Suspense fallback={
                                <div className="glass-card p-4 aspect-square flex items-center justify-center">
                                    <LoadingSpinner text="Loading model..." />
                                </div>
                            }>
                                <ModelViewer
                                    letter={selectedSign}
                                    showControls={true}
                                    height="300px"
                                />
                            </Suspense>

                            {/* Sign Tips */}
                            {signData && (
                                <div className="glass-card p-4 mt-4">
                                    <h3 className="font-medium text-dark-100 mb-2">Tips</h3>
                                    <ul className="space-y-1">
                                        {signData.tips.slice(0, 3).map((tip, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-dark-400">
                                                <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Right column: Camera + Controls + Stats */}
                <div className="space-y-4">
                    {/* Camera toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {cameraActive ? (
                                    <Camera className="w-5 h-5 text-success" />
                                ) : (
                                    <CameraOff className="w-5 h-5 text-dark-400" />
                                )}
                                <div>
                                    <div className="font-medium text-dark-100">
                                        Camera {cameraActive ? 'Active' : 'Off'}
                                    </div>
                                    <div className="text-xs text-dark-400">
                                        {cameraActive ? 'Ready to validate' : 'Toggle to practice with camera'}
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant={cameraActive ? 'secondary' : 'primary'}
                                size="sm"
                                onClick={handleToggleCamera}
                            >
                                {cameraActive ? 'Turn Off' : 'Turn On'}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Camera feed */}
                    <AnimatePresence>
                        {cameraActive && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
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
                                {isCameraActive && selectedSign && (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        className="mt-4"
                                        onClick={handleValidate}
                                        disabled={isValidating || cooldownRemaining > 0}
                                        leftIcon={
                                            isValidating
                                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                                : <Zap className="w-5 h-5" />
                                        }
                                    >
                                        {isValidating
                                            ? 'Analyzing...'
                                            : cooldownRemaining > 0
                                                ? `Wait ${cooldownRemaining}s...`
                                                : 'Validate Sign'
                                        }
                                    </Button>
                                )}

                                {/* Validation feedback */}
                                <div className="mt-4">
                                    <ValidationFeedback
                                        result={validationResult}
                                        isValidating={isValidating}
                                        targetLetter={selectedSign}
                                        onTryAgain={handleTryAgain}
                                        onNext={() => { }}
                                        cooldownRemaining={cooldownRemaining}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Target letter display (when camera off) */}
                    {!cameraActive && selectedSign && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 text-center"
                        >
                            <div className="text-sm text-dark-400 mb-2">Selected Sign</div>
                            <div className="text-8xl font-bold gradient-text mb-4">
                                {selectedSign}
                            </div>
                            {signData && (
                                <p className="text-sm text-dark-400">
                                    {signData.description}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* Session stats */}
                    <SessionStats
                        startTime={sessionStats.startTime}
                        signsReviewed={sessionStats.signsReviewed.size}
                        validationAttempts={sessionStats.validationAttempts}
                    />
                </div>
            </div>
        </PageContainer>
    );
};

export default FreePractice;
