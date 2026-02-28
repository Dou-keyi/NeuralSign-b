/**
 * WordPractice Component
 * 🚀 FIXED VERSION: Combining stable container with professional 2:1 layout
 * * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
    Loader2, Target, Box, Type, Sparkles
} from 'lucide-react';
import Button from '@/components/common/Button';
import { getWordSign } from '@/data/commonWords';

import { validateSentenceSign, validateWholeWordSign, captureFrameFromVideo, canMakeRequest } from '@/services/geminiService';
import CameraFeed from '@/components/camera/CameraFeed';
import { useHandDetection } from '@/hooks/useHandDetection';

// 🤝 Merged: Teammate switched to ModelViewer to support full-word 3D models 
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

const WordPractice = ({
    word,
    wordIndex = 0,
    totalWords = 1,
    fullSentence = '',
    onComplete,
    onSkip,
    onBack
}) => {
    const [practiceMode, setPracticeMode] = useState('word'); 
    const [validationResult, setValidationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [currentLetter, setCurrentLetter] = useState(0);
    const [practiceProgress, setPracticeProgress] = useState(0);
    const dwellStartTimeRef = useRef(null);

    const {
        videoRef, canvasRef, isDetecting, isCameraActive,
        isCameraLoading, handDetected, startDetection, stopDetection
    } = useHandDetection({});

    const wordSign = getWordSign(word || '');
    const letters = wordSign?.letters || [];
    
    const currentLetterChar = letters[currentLetter] || word?.charAt(0) || 'A';
    const isWholeWordMode = practiceMode === 'word';
    const targetSignDisplay = isWholeWordMode ? word : currentLetterChar;

    useEffect(() => {
        setCurrentLetter(0);
    }, [word, practiceMode]);

    // Reset UI validation state when any context changes
    useEffect(() => {
        setValidationResult(null);
        setPracticeProgress(0);
        dwellStartTimeRef.current = null;
    }, [word, practiceMode, currentLetter]);

    const handleValidate = useCallback(async () => {
        if (!videoRef.current || !isCameraActive) return;
        if (!canMakeRequest()) return;

        setIsValidating(true);
        try {
            const imageBase64 = captureFrameFromVideo(videoRef.current);
            if (!imageBase64) throw new Error('Capture failed');

            const result = isWholeWordMode 
                ? await validateWholeWordSign(imageBase64, word, fullSentence)
                : await validateSentenceSign(imageBase64, currentLetterChar, fullSentence);
            
            setValidationResult(result);

            if (result.isCorrect) {
                setTimeout(() => {
                    if (isWholeWordMode) onComplete?.(result.accuracy);
                    else if (currentLetter < letters.length - 1) {
                        setCurrentLetter(prev => prev + 1);
                    } else onComplete?.(result.accuracy);
                }, 1500);
            }
        } catch (err) { console.error(err); }
        finally { setIsValidating(false); setPracticeProgress(0); dwellStartTimeRef.current = null; }
    }, [isCameraActive, isWholeWordMode, word, currentLetterChar, fullSentence, currentLetter, letters.length, onComplete, videoRef]);

    useEffect(() => {
        let frameId;
        const processFrame = () => {
            if (!isDetecting || !handDetected || isValidating || validationResult?.isCorrect) {
                setPracticeProgress(0); dwellStartTimeRef.current = null;
                frameId = requestAnimationFrame(processFrame);
                return;
            }
            if (!dwellStartTimeRef.current) dwellStartTimeRef.current = Date.now();
            else {
                const elapsed = Date.now() - dwellStartTimeRef.current;
                const progress = Math.min(100, (elapsed / 1500) * 100);
                setPracticeProgress(progress);
                if (progress === 100) { dwellStartTimeRef.current = null; handleValidate(); }
            }
            frameId = requestAnimationFrame(processFrame);
        };
        frameId = requestAnimationFrame(processFrame);
        return () => cancelAnimationFrame(frameId);
    }, [isDetecting, handDetected, isValidating, validationResult, handleValidate]);

    const handleDynamicSkip = () => {
        if (!isWholeWordMode && currentLetter < letters.length - 1) {
            setCurrentLetter(prev => prev + 1);
        } else {
            onSkip(); 
        }
    };

    const handleDynamicPrev = () => {
        if (!isWholeWordMode && currentLetter > 0) {
            setCurrentLetter(prev => prev - 1);
        } else {
            onBack(); 
        }
    };

    if (!word) return null;

    return (
        <div className="space-y-6">
            {/* Top-center mode switcher */}
            <div className="flex justify-center">
                <div className="inline-flex bg-dark-800 p-1 rounded-xl border border-dark-700">
                    <button onClick={() => setPracticeMode('word')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${isWholeWordMode ? 'bg-primary text-white shadow-lg' : 'text-dark-400 hover:text-white'}`}>
                        <Box className="w-4 h-4" /> Whole Word
                    </button>
                    <button onClick={() => setPracticeMode('spell')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${!isWholeWordMode ? 'bg-primary text-white shadow-lg' : 'text-dark-400 hover:text-white'}`}>
                        <Type className="w-4 h-4" /> Fingerspelling
                    </button>
                </div>
            </div>

            {/* 🤝 Merged: Teammate's Letter Progress Bar (Only visible in spelling mode) */}
            {!isWholeWordMode && letters.length > 1 && (
                <div className="flex items-center justify-center gap-1 mb-2">
                    {letters.map((letter, index) => (
                        <div
                            key={`letter-${index}`}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${index === currentLetter
                                ? 'bg-primary text-white scale-110'
                                : index < currentLetter
                                    ? 'bg-success/20 text-success'
                                    : 'bg-dark-600 text-dark-400'
                                }`}
                        >
                            {letter}
                        </div>
                    ))}
                </div>
            )}

            {/* Core 2:1 split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* 🚀 Your Fixed: Free Sign-style centered flex-column layout */}
                <div className="lg:col-span-2 relative glass-card p-2 rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl flex flex-col justify-center">
                    <div className="relative w-full rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                        <CameraFeed
                            videoRef={videoRef} canvasRef={canvasRef} isActive={isCameraActive}
                            isLoading={isCameraLoading} isDetecting={isDetecting} handDetected={handDetected}
                            onStart={() => startDetection()} onStop={() => stopDetection()} onRetry={() => startDetection()}
                        />
                        
                        {/* Floating progress indicator */}
                        <AnimatePresence>
                            {isCameraActive && handDetected && !isValidating && !validationResult?.isCorrect && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-64">
                                    <div className="bg-dark-900/95 backdrop-blur-md p-3 rounded-xl border border-primary/40 shadow-xl flex flex-col items-center">
                                        <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${practiceProgress}%` }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 🤝 Merged: Teammate's Big Validation Flash Overlay */}
                        <AnimatePresence>
                            {validationResult && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`absolute inset-0 flex items-center justify-center z-30 backdrop-blur-sm ${validationResult.isCorrect ? 'bg-success/20' : 'bg-error/20'}`}
                                >
                                    {validationResult.isCorrect ? (
                                        <CheckCircle2 className="w-24 h-24 text-success drop-shadow-lg" />
                                    ) : (
                                        <XCircle className="w-24 h-24 text-error drop-shadow-lg" />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Camera start overlay */}
                        {!isCameraActive && !isCameraLoading && (
                            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-dark-900/90 backdrop-blur-sm">
                                <Camera className="w-12 h-12 text-dark-400" />
                                <Button variant="primary" onClick={() => startDetection()}>Start Camera</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right-side 3D reference panel WITH BUTTONS */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="glass-card flex-1 flex flex-col border border-dark-600 rounded-2xl bg-dark-800/80 overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-dark-700 bg-dark-900/40">
                            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> 3D REFERENCE
                            </h3>
                        </div>
                        
                        <div className="flex-1 relative min-h-[300px] flex items-center justify-center">
                            <Suspense fallback={<Loader2 className="animate-spin text-primary" />}>
                                {/* 🤝 Merged: Using ModelViewer to support teammate's complete words */}
                                <ModelViewer
                                    letter={targetSignDisplay}
                                    showControls={false}
                                    hideBadge={true} // 🚀 Tells ModelViewer to hide its internal target badge
                                    className="w-full h-full border-none rounded-none bg-transparent shadow-none"
                                />
                            </Suspense>
                        </div>

                        <div className="p-5 bg-dark-900/60 border-t border-dark-700">
                            <p className="text-xs text-dark-400 uppercase font-bold mb-1">Target Sign</p>
                            <h4 className="text-2xl font-black text-white capitalize">
                                {isWholeWordMode ? word : `Letter ${currentLetter + 1}: ${currentLetterChar}`}
                            </h4>
                            <p className="text-xs text-dark-400 mt-2">Word {wordIndex + 1} of {totalWords}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={handleDynamicPrev} 
                            disabled={wordIndex === 0 && (isWholeWordMode || currentLetter === 0)} 
                            className="flex-1 p-3 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 disabled:opacity-30 flex items-center justify-center gap-2 font-bold text-sm transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> {isWholeWordMode ? 'Previous' : 'Prev Letter'}
                        </button>

                        <button 
                            onClick={handleDynamicSkip} 
                            className="flex-1 p-3 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 flex items-center justify-center gap-2 font-bold text-sm transition-colors"
                        >
                            {isWholeWordMode ? 'Skip Word' : 'Skip Letter'} <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Validation feedback panel */}
            <AnimatePresence>
                {validationResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`mt-2 p-4 rounded-xl border ${validationResult.isCorrect ? 'bg-success/10 border-success/30' : 'bg-error/10 border-error/30'}`}>
                        <div className="flex items-center gap-4">
                            {validationResult.isCorrect ? <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" /> : <XCircle className="w-6 h-6 text-error flex-shrink-0" />}
                            <div className="flex-1">
                                <p className={`font-bold ${validationResult.isCorrect ? 'text-success' : 'text-error'}`}>{validationResult.isCorrect ? 'Great Accuracy!' : 'Keep Trying'}</p>
                                <p className="text-sm text-dark-200">{validationResult.feedback}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WordPractice;