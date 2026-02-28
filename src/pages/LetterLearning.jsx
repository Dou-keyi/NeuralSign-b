/**
 * LetterLearning Page
 * Interactive learning page with camera view, 3D model, score, and tips
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Camera,
    Zap,
    Loader2,
    Lightbulb,
    Target,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import CameraFeed from '@/components/camera/CameraFeed';
import ValidationFeedback from '@/components/feedback/ValidationFeedback';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Hooks
import { useHandDetection } from '@/hooks/useHandDetection';
import { useLevelUp } from '@/context/LevelUpContext';
import useAuthStore from '@/store/authStore';

// Data & Services
import { getSignByLetter, alphabetSigns } from '@/data/signsData';
import { addLearnedSign } from '@/services/database';

// Lazy load 3D viewer
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

import SuccessPopup from '@/components/feedback/SuccessPopup';

/**
 * Tips panel component
 */
const TipsPanel = ({ signData }) => {
    if (!signData) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
        >
            <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-dark-100">Tips for Letter {signData.letter}</h3>
            </div>

            <p className="text-dark-300 text-sm mb-3">{signData.description}</p>

            {signData.tips && signData.tips.length > 0 && (
                <ul className="space-y-2">
                    {signData.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-dark-400">
                            <Target className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                            {tip}
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
};

/**
 * Letter Learning Page Component
 */
const LetterLearning = () => {
    const { letter } = useParams();
    const navigate = useNavigate();
    const { user, refreshUserData } = useAuthStore();
    const { handleXPResult } = useLevelUp();

    // Normalize letter to uppercase
    const targetLetter = letter?.toUpperCase() || 'A';

    // State
    const [isPracticing, setIsPracticing] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const hasStartedRef = useRef(false);
    const resultRef = useRef(null);
    const cameraRef = useRef(null);

    // Get sign data
    const signData = getSignByLetter(targetLetter);

    // Find current letter index for navigation
    const currentIndex = alphabetSigns.findIndex(s => s.letter === targetLetter);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < alphabetSigns.length - 1;

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
        onValidationResult: async (result) => {
            console.log('Validation result:', result);
            if (result.isCorrect) {
                setShowSuccessPopup(true);

                // Save progress to database
                if (user?.uid) {
                    try {
                        const { xpResult, isNew } = await addLearnedSign(user.uid, targetLetter);

                        // Handle XP / Level up
                        if (xpResult) {
                            handleXPResult(xpResult);
                        }

                        // Refresh user data if it was a new sign
                        if (isNew) {
                            refreshUserData();
                        }
                    } catch (error) {
                        console.error('Failed to save progress:', error);
                    }
                }
            }

            // Scroll to result section after a short delay to ensure rendering
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    });

    // Start detection when isPracticing becomes true
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

    // Cleanup on unmount only - use empty dependency array
    useEffect(() => {
        // Auto-start by setting isPracticing to true after mount
        setIsPracticing(true);

        return () => {
            stopDetection();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle back navigation
    const handleBack = useCallback(() => {
        stopDetection();
        navigate(`/learn`);
    }, [navigate, stopDetection]);

    // Handle validate button click
    const handleValidate = useCallback(async () => {
        await validateSign();
    }, [validateSign]);

    // Handle try again
    const handleTryAgain = useCallback(() => {
        clearValidation();
        // Scroll back to camera
        setTimeout(() => {
            cameraRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }, [clearValidation]);

    // Navigate to previous letter
    const handlePrevLetter = useCallback(() => {
        if (hasPrevious) {
            const prevLetter = alphabetSigns[currentIndex - 1].letter;
            clearValidation();
            navigate(`/learn/letter/${prevLetter}/practice`);
        }
    }, [hasPrevious, currentIndex, navigate, clearValidation]);

    // Navigate to next letter
    const handleNextLetter = useCallback(() => {
        if (hasNext) {
            const nextLetter = alphabetSigns[currentIndex + 1].letter;
            clearValidation();
            navigate(`/learn/letter/${nextLetter}/practice`);
        }
    }, [hasNext, currentIndex, navigate, clearValidation]);

    // Redirect if invalid letter
    useEffect(() => {
        if (!signData) {
            navigate('/learn', { replace: true });
        }
    }, [signData, navigate]);

    if (!signData) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" text="Loading..." />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header with back button */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
            >
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Back to Learn
                </Button>

                <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full">
                    <Camera className="w-4 h-4 text-primary" />
                    <span className="text-dark-200 font-medium">
                        Learning: <span className="text-primary font-bold">{targetLetter}</span>
                    </span>
                </div>
            </motion.div>

            {/* Main content - two column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left column: Camera + Validate button */}
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
                </div>

                {/* Right column: 3D Model */}
                <div className="space-y-4">
                    <Suspense fallback={
                        <div className="glass-card p-4 aspect-square flex items-center justify-center">
                            <LoadingSpinner text="Loading 3D model..." />
                        </div>
                    }>
                        <ModelViewer
                            letter={targetLetter}
                            showControls={true}
                        />
                    </Suspense>

                    {/* Letter navigation */}
                    <div className="flex items-center justify-between glass-card p-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePrevLetter}
                            disabled={!hasPrevious}
                            leftIcon={<ChevronLeft className="w-4 h-4" />}
                        >
                            Previous
                        </Button>

                        <span className="text-dark-400 text-sm">
                            Letter {currentIndex + 1} of {alphabetSigns.length}
                        </span>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNextLetter}
                            disabled={!hasNext}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom section: Score and Tips */}
            <div ref={resultRef} className="grid lg:grid-cols-2 gap-6 mt-6">
                {/* Validation feedback / Score */}
                <ValidationFeedback
                    result={validationResult}
                    isValidating={isValidating}
                    targetLetter={targetLetter}
                    onTryAgain={handleTryAgain}
                    onNext={handleNextLetter}
                    cooldownRemaining={cooldownRemaining}
                />

                {/* Tips panel */}
                <TipsPanel signData={signData} />

                {/* Success Popup */}
                <SuccessPopup
                    isOpen={showSuccessPopup}
                    onClose={() => setShowSuccessPopup(false)}
                    letter={targetLetter}
                    score={validationResult?.accuracy}
                />
            </div>
        </PageContainer>
    );
};

export default LetterLearning;
