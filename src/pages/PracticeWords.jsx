/**
 * PracticeWords Page
 * Practice mode for word signs with camera detection and validation
 * Enhanced with OpenCV.js for motion tracking and gesture recognition
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Camera, CameraOff, Video, RotateCcw,
    Check, X, Lightbulb, Target, TrendingUp,
    ChevronRight, Trophy, Star, Zap, Play, Eye, Activity
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import VideoPlayer from '@/components/video/VideoPlayer';
import CameraFeed from '@/components/camera/CameraFeed';

// OpenCV Components
import OpenCVLoader from '@/components/opencv/OpenCVLoader';
import MotionTrailOverlay from '@/components/opencv/MotionTrailOverlay';
import MotionAnalysisDisplay from '@/components/opencv/MotionAnalysisDisplay';
import OpenCVDebugPanel from '@/components/opencv/OpenCVDebugPanel';

// Services
import wordsService from '@/services/wordsService';
import { validateWordSign, enhancedWordValidator } from '@/services/wordValidation';
import { addXP, XP_SOURCES } from '@/services/xpService';

// Hooks
import { useHandDetection } from '@/hooks/useHandDetection';

// Store
import useAuthStore from '@/store/authStore';

/**
 * Practice Complete Screen
 */
const PracticeComplete = ({ stats, word, onRestart, onExit, onNextWord }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 text-center max-w-lg mx-auto"
    >
        <Trophy className="w-16 h-16 text-warning mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-dark-100 mb-2">Practice Complete!</h2>
        <p className="text-dark-400 mb-6">
            Great job practicing "{word?.englishText}"
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-3">
                <div className="text-2xl font-bold text-success">{stats.correct}</div>
                <div className="text-xs text-dark-400">Correct</div>
            </div>
            <div className="glass-card p-3">
                <div className="text-2xl font-bold text-primary">{stats.accuracy}%</div>
                <div className="text-xs text-dark-400">Accuracy</div>
            </div>
            <div className="glass-card p-3">
                <div className="text-2xl font-bold text-warning">+{stats.xpEarned}</div>
                <div className="text-xs text-dark-400">XP Earned</div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={onRestart} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice Again
            </Button>
            {onNextWord && (
                <Button variant="secondary" onClick={onNextWord} className="w-full">
                    Next Word
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            )}
            <Button variant="glass" onClick={onExit} className="w-full">
                Back to Words
            </Button>
        </div>
    </motion.div>
);


const PracticeWords = () => {
    const { wordId } = useParams();
    const navigate = useNavigate();
    const { user, userData } = useAuthStore();

    // Word data
    const [word, setWord] = useState(null);
    const [loading, setLoading] = useState(true);

    // Practice state
    const [practiceStarted, setPracticeStarted] = useState(false);
    const [practiceComplete, setPracticeComplete] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [validating, setValidating] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);

    // OpenCV / Enhanced Detection state
    const [useEnhanced, setUseEnhanced] = useState(true);
    const [showMotionTrail, setShowMotionTrail] = useState(true);
    const [enhancedReady, setEnhancedReady] = useState(false);
    const [motionData, setMotionData] = useState(null);
    const [trajectory, setTrajectory] = useState([]);
    const [showDebug, setShowDebug] = useState(false);

    const motionUpdateRef = useRef(null);

    const maxAttempts = 5;

    // Hand detection hook
    const {
        videoRef,
        canvasRef,
        isDetecting,
        isCameraActive,
        isCameraLoading,
        handDetected,
        detectionResult,
        validationResult,
        error: detectionError,
        cooldownRemaining,
        startDetection,
        stopDetection,
        validateSign: validateWithGemini,
        clearValidation
    } = useHandDetection({
        targetLetter: word?.englishText || '',
        onCorrectSign: null,
        onValidationResult: null
    });

    // Initialize enhanced validator when toggled on
    useEffect(() => {
        if (useEnhanced && !enhancedReady) {
            enhancedWordValidator.initialize().then(() => {
                setEnhancedReady(true);
                console.log('Enhanced word validator initialized');
            }).catch(err => {
                console.warn('Enhanced validator init failed:', err);
                setUseEnhanced(false);
            });
        }
    }, [useEnhanced, enhancedReady]);

    // Feed landmarks to motion tracker when detecting
    useEffect(() => {
        if (!isDetecting || !detectionResult?.landmarks || !useEnhanced || !enhancedReady) {
            return;
        }

        // Feed landmarks to enhanced validator's motion tracker
        enhancedWordValidator.motionTracker?.addPosition(
            detectionResult.landmarks,
            Date.now()
        );

        // Update motion data for UI (throttled)
        if (!motionUpdateRef.current || Date.now() - motionUpdateRef.current > 100) {
            motionUpdateRef.current = Date.now();
            setMotionData(enhancedWordValidator.getMotionData());
            setTrajectory(enhancedWordValidator.getTrajectory());
        }
    }, [isDetecting, detectionResult, useEnhanced, enhancedReady]);

    // Load word
    useEffect(() => {
        const loadWord = async () => {
            setLoading(true);
            try {
                if (wordId) {
                    const wordData = await wordsService.getWordById(wordId);
                    setWord(wordData);
                } else {
                    // Get a recommended word
                    const recommended = await wordsService.getRecommendedWords(
                        userData?.wordsProgress || {}, 1
                    );
                    if (recommended.length > 0) {
                        setWord(recommended[0]);
                    }
                }
            } catch (error) {
                console.error('Error loading word:', error);
            } finally {
                setLoading(false);
            }
        };
        loadWord();
    }, [wordId, userData?.wordsProgress]);

    // Start practice
    const handleStartPractice = useCallback(async () => {
        setPracticeStarted(true);
        setPracticeComplete(false);
        setAttempts(0);
        setCorrectCount(0);
        setXpEarned(0);
        setFeedback(null);
        setShowHint(false);
        setMotionData(null);
        setTrajectory([]);
        clearValidation();

        // Reset motion tracking
        if (enhancedReady) {
            enhancedWordValidator.resetMotion();
        }

        await startDetection();
    }, [startDetection, clearValidation, enhancedReady]);

    // Validate current sign using word validation
    const handleValidate = useCallback(async () => {
        if (!word || validating || cooldownRemaining > 0) return;

        setValidating(true);
        setFeedback(null);

        try {
            // Use Gemini for visual validation
            const geminiResult = await validateWithGemini();

            // Also use our word-specific validator if we have landmarks
            let wordResult = null;
            if (detectionResult?.landmarks) {
                if (useEnhanced && enhancedReady) {
                    // Use enhanced validator with motion analysis
                    wordResult = await enhancedWordValidator.validateSign(
                        word,
                        detectionResult.landmarks,
                        detectionResult.handedness || 'Right'
                    );
                } else {
                    // Fallback to base validator
                    wordResult = validateWordSign(
                        word,
                        detectionResult.landmarks,
                        detectionResult.handedness || 'Right'
                    );
                }
            }

            // Combine results: prefer Gemini accuracy if available
            const isCorrect = geminiResult?.isCorrect || wordResult?.isValid || false;
            const confidence = geminiResult?.accuracy ||
                (wordResult?.confidence ? Math.round(wordResult.confidence * 100) : 0);
            const feedbackMsg = geminiResult?.feedback || wordResult?.feedback || 'Try again!';

            setAttempts(prev => prev + 1);

            if (isCorrect) {
                setCorrectCount(prev => prev + 1);

                // Award XP
                const xpAmount = Math.round(XP_SOURCES.PRACTICE_SESSION.amount * (confidence / 100));
                if (user?.uid) {
                    try {
                        await addXP(user.uid, xpAmount, 'PRACTICE_SESSION', `Practiced: ${word.englishText}`);
                        setXpEarned(prev => prev + xpAmount);
                    } catch (e) {
                        console.warn('XP award failed', e);
                    }
                }

                setFeedback({
                    type: 'success',
                    message: feedbackMsg,
                    confidence
                });
            } else {
                setFeedback({
                    type: 'error',
                    message: feedbackMsg,
                    confidence
                });

                // Show hint after 3 failed attempts
                if (attempts >= 2) {
                    setShowHint(true);
                }
            }

            // Update accuracy in wordsService
            if (user?.uid) {
                await wordsService.updateWordAccuracy(user.uid, word.id, confidence);
            }

            // Reset motion tracking for next attempt
            if (enhancedReady) {
                enhancedWordValidator.resetMotion();
                setMotionData(null);
                setTrajectory([]);
            }

            // Check if practice is complete
            if (attempts + 1 >= maxAttempts) {
                setTimeout(() => {
                    stopDetection();
                    setPracticeComplete(true);
                }, 2000);
            }

        } catch (error) {
            console.error('Validation error:', error);
            setFeedback({
                type: 'error',
                message: 'Unable to validate. Make sure your hand is visible.',
                confidence: 0
            });
        } finally {
            setValidating(false);
        }
    }, [word, validating, cooldownRemaining, validateWithGemini, detectionResult, attempts, user?.uid, stopDetection, useEnhanced, enhancedReady]);

    // Restart practice
    const handleRestart = useCallback(async () => {
        setPracticeComplete(false);
        setAttempts(0);
        setCorrectCount(0);
        setXpEarned(0);
        setFeedback(null);
        setShowHint(false);
        setMotionData(null);
        setTrajectory([]);
        clearValidation();

        if (enhancedReady) {
            enhancedWordValidator.resetMotion();
        }

        await startDetection();
    }, [startDetection, clearValidation, enhancedReady]);

    // Load next word
    const handleNextWord = useCallback(async () => {
        const recommended = await wordsService.getRecommendedWords(
            userData?.wordsProgress || {}, 1
        );
        if (recommended.length > 0) {
            navigate(`/practice/words/${recommended[0].id}`);
        }
    }, [navigate, userData?.wordsProgress]);

    // Keep a ref to stopDetection so cleanup doesn't re-run on reference changes
    const stopDetectionRef = useRef(stopDetection);
    stopDetectionRef.current = stopDetection;

    // Cleanup on unmount only (empty deps avoids React StrictMode double-fire)
    useEffect(() => {
        return () => {
            stopDetectionRef.current();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 0;

    if (loading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner text="Loading practice..." />
                </div>
            </PageContainer>
        );
    }

    if (!word) {
        return (
            <PageContainer>
                <div className="text-center py-12">
                    <p className="text-dark-400 text-lg">No word selected for practice</p>
                    <Button variant="glass" onClick={() => navigate('/learn/words')} className="mt-4">
                        Browse Words
                    </Button>
                </div>
            </PageContainer>
        );
    }

    // Practice Complete Screen
    if (practiceComplete) {
        return (
            <PageContainer>
                <PracticeComplete
                    stats={{ correct: correctCount, accuracy, xpEarned }}
                    word={word}
                    onRestart={handleRestart}
                    onExit={() => navigate('/learn/words')}
                    onNextWord={handleNextWord}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-dark-400 hover:text-primary transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back</span>
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-100">
                            Practice: {word.englishText}
                        </h1>
                        <p className="text-dark-400 text-sm">{word.shortDescription}</p>
                    </div>

                    {/* Progress */}
                    {practiceStarted && (
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-lg font-bold text-dark-100">{attempts}/{maxAttempts}</div>
                                <div className="text-xs text-dark-400">Attempts</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-success">{correctCount}</div>
                                <div className="text-xs text-dark-400">Correct</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-primary">{accuracy}%</div>
                                <div className="text-xs text-dark-400">Accuracy</div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Pre-practice: Show reference */}
            {!practiceStarted && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-2xl mx-auto"
                >
                    {/* Reference Video */}
                    <div className="glass-card p-6 mb-6">
                        <h3 className="text-lg font-semibold text-dark-100 mb-3 flex items-center gap-2">
                            <Video className="w-5 h-5 text-primary" />
                            Reference Sign
                        </h3>
                        <VideoPlayer
                            videoUrl={word.videoUrl}
                            poster={word.thumbnailUrl}
                            loop={true}
                            autoplay={true}
                            className="mb-4"
                        />
                        <p className="text-dark-300 text-sm">{word.description}</p>
                    </div>

                    {/* Tips */}
                    {word.learningTips?.length > 0 && (
                        <div className="glass-card p-5 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-5 h-5 text-warning" />
                                <h3 className="font-semibold text-dark-100">Tips</h3>
                            </div>
                            <ul className="space-y-2">
                                {word.learningTips.map((tip, i) => (
                                    <li key={i} className="text-sm text-dark-300 flex items-start gap-2">
                                        <span className="text-warning">•</span> {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Start Button */}
                    <Button
                        variant="primary"
                        className="w-full py-4 text-lg"
                        onClick={handleStartPractice}
                        rightIcon={<Camera className="w-5 h-5" />}
                    >
                        Start Practice
                    </Button>
                </motion.div>
            )}

            {/* Practice Mode */}
            {practiceStarted && !practiceComplete && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Reference */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="glass-card p-4">
                            <h3 className="text-sm font-medium text-dark-300 mb-3 flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                Reference
                            </h3>
                            <VideoPlayer
                                videoUrl={word.videoUrl}
                                poster={word.thumbnailUrl}
                                loop={true}
                                autoplay={true}
                            />
                            <p className="text-xs text-dark-400 mt-2">{word.shortDescription}</p>
                        </div>

                        {/* Hint */}
                        <AnimatePresence>
                            {showHint && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="glass-card p-4 mt-3 border border-warning/20"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-warning" />
                                        <span className="text-sm font-medium text-warning">Hint</span>
                                    </div>
                                    <p className="text-sm text-dark-300">{word.description}</p>
                                    {word.learningTips?.[0] && (
                                        <p className="text-xs text-dark-400 mt-2">{word.learningTips[0]}</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Motion Analysis Panel */}
                        {useEnhanced && enhancedReady && motionData && (
                            <MotionAnalysisDisplay
                                motionData={motionData}
                                className="mt-3"
                            />
                        )}
                    </motion.div>

                    {/* Camera Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="space-y-4">
                            {/* Camera Feed - uses same CameraFeed as letter practice */}
                            <div className="relative">
                                <CameraFeed
                                    videoRef={videoRef}
                                    canvasRef={canvasRef}
                                    isActive={isCameraActive}
                                    isLoading={isCameraLoading}
                                    isDetecting={isDetecting}
                                    handDetected={handDetected}
                                    error={detectionError}
                                    onStart={startDetection}
                                    onStop={stopDetection}
                                    onRetry={startDetection}
                                />

                                {/* Motion Trail Overlay (sits on top of CameraFeed) */}
                                {useEnhanced && showMotionTrail && trajectory.length > 1 && (
                                    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                                        <MotionTrailOverlay trajectory={trajectory} />
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Detection Toggles */}
                            <div className="flex items-center gap-3 mb-3">
                                <button
                                    onClick={() => setUseEnhanced(!useEnhanced)}
                                    className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${useEnhanced
                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                        : 'bg-dark-800 text-dark-400 border border-dark-700'
                                        }`}
                                >
                                    <Activity className="w-3 h-3" />
                                    Enhanced Detection
                                </button>

                                {useEnhanced && (
                                    <button
                                        onClick={() => setShowMotionTrail(!showMotionTrail)}
                                        className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${showMotionTrail
                                            ? 'bg-secondary/20 text-secondary border border-secondary/30'
                                            : 'bg-dark-800 text-dark-400 border border-dark-700'
                                            }`}
                                    >
                                        <Eye className="w-3 h-3" />
                                        Motion Trail
                                    </button>
                                )}

                                {/* Debug panel toggle (dev only) */}
                                {import.meta.env.DEV && (
                                    <button
                                        onClick={() => setShowDebug(!showDebug)}
                                        className="text-xs px-2 py-1.5 rounded bg-dark-800 text-dark-500 hover:text-dark-300 ml-auto"
                                    >
                                        🐛
                                    </button>
                                )}
                            </div>

                            {/* Validate Button */}
                            <Button
                                variant="primary"
                                className="w-full py-3"
                                onClick={handleValidate}
                                disabled={!handDetected || validating || cooldownRemaining > 0}
                            >
                                {validating ? (
                                    <>Analyzing...</>
                                ) : cooldownRemaining > 0 ? (
                                    <>Wait {cooldownRemaining}s</>
                                ) : (
                                    <>
                                        <Target className="w-4 h-4 mr-2" />
                                        Validate My Sign
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Feedback */}
                        <AnimatePresence mode="wait">
                            {feedback && (
                                <motion.div
                                    key={feedback.type + attempts}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`glass-card p-4 mt-3 border ${feedback.type === 'success'
                                        ? 'border-success/30 bg-success/5'
                                        : 'border-error/30 bg-error/5'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {feedback.type === 'success' ? (
                                            <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <X className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${feedback.type === 'success' ? 'text-success' : 'text-error'
                                                }`}>
                                                {feedback.message}
                                            </p>
                                            {feedback.confidence > 0 && (
                                                <p className="text-xs text-dark-400 mt-1">
                                                    Confidence: {feedback.confidence}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}

            {/* OpenCV Debug Panel (dev only) */}
            <OpenCVDebugPanel
                motionData={motionData}
                visible={showDebug}
            />
        </PageContainer>
    );
};

export default PracticeWords;
