/**
 * Sentence Builder Page
 * FUSED VERSION: Guided Wizard + Free Flow Builder
 * NeuralSign - AI Sign Language Learning Platform
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Sparkles, GraduationCap, Camera,
    ChevronRight, ChevronLeft, ArrowLeft, BookOpen,
    Trophy, Home, Hand, CheckCircle, X, CheckCircle2, Info
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { savePracticedSentence, getUserProgress } from '@/services/database';
import { analyzeSentenceToSigns, translateASLSequence } from '@/services/geminiService';
import SentenceInput from '@/components/sentence/SentenceInput';
import WordBreakdown from '@/components/sentence/WordBreakdown';
import SignSequence from '@/components/sentence/SignSequence';
import FullSentencePractice from '@/components/sentence/FullSentencePractice';
import SavedSentences from '@/components/sentence/SavedSentences';
import Button from '@/components/common/Button';

import CameraFeed from '@/components/camera/CameraFeed';
import { useHandDetection } from '@/hooks/useHandDetection';
import { wordValidator } from '@/services/wordValidation';
import ModelViewer from '@/components/3d/ModelViewer';

const STEPS = { INPUT: 'input', BREAKDOWN: 'breakdown', LEARN: 'learn', PRACTICE: 'practice', COMPLETE: 'complete' };
const STEP_CONFIG = [
    { id: STEPS.INPUT, label: 'Input', icon: MessageSquare },
    { id: STEPS.BREAKDOWN, label: 'Breakdown', icon: Sparkles },
    { id: STEPS.LEARN, label: 'Learn', icon: GraduationCap },
    { id: STEPS.PRACTICE, label: 'Practice', icon: Camera }
];

const ACTIVE_VOCABULARY = [
    { id: 'i-me', englishText: 'I', isStatic: true },
    { id: 'love', englishText: 'Love', isStatic: true },
    { id: 'want', englishText: 'Want', isStatic: true }, 
    { id: 'water', englishText: 'Water', isStatic: true },
    { id: 'you', englishText: 'You', isStatic: true },
    { id: 'yes', englishText: 'Yes', isStatic: true },
    { id: 'no', englishText: 'No', isStatic: true },
    { id: 'what', englishText: 'What', isStatic: false }, 
    { id: 'time', englishText: 'Time', isStatic: false },
];

// ============================================================================
// FREE FLOW BUILDER (RESTORED VERSION)
// ============================================================================
const FreeFlowMode = () => {
    const [sentence, setSentence] = useState([]);
    const [bestMatch, setBestMatch] = useState(null); 
    const [handPosition, setHandPosition] = useState({ x: 50, y: 50 }); 
    const [dwellProgress, setDwellProgress] = useState(0);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationResult, setTranslationResult] = useState(null);
    const [practiceWord, setPracticeWord] = useState(null); 
    // eslint-disable-next-line no-unused-vars
    const [practiceProgress, setPracticeProgress] = useState(0);
    const [isPracticeSuccess, setIsPracticeSuccess] = useState(false);

    const lockedWordRef = useRef(null);
    const dwellStartTimeRef = useRef(null);

    const {
        videoRef, canvasRef, isDetecting, isCameraActive,
        isCameraLoading, handDetected, detectionResult, startDetection, stopDetection
    } = useHandDetection({}); 

    useEffect(() => {
        let frameId;
        const processFrame = () => {
            // Reset state if detection is inactive or no hand detected
            if (!isDetecting || !handDetected || !detectionResult?.landmarks) {
                setBestMatch(null); setDwellProgress(0); setPracticeProgress(0);
                dwellStartTimeRef.current = null; lockedWordRef.current = null; 
                frameId = requestAnimationFrame(processFrame);
                return;
            }
            const landmarks = detectionResult.landmarks;
            const handedness = detectionResult.handedness || 'Right';
            let minY = 1, meanX = 0;
            landmarks.forEach(lm => { if (lm.y < minY) minY = lm.y; meanX += lm.x; });
            meanX = meanX / landmarks.length;
            setHandPosition({ x: (1 - meanX) * 100, y: minY * 100 });

            // Handle practice word validation
            if (practiceWord) {
                if (isPracticeSuccess) { frameId = requestAnimationFrame(processFrame); return; }
                const targetWordObj = ACTIVE_VOCABULARY.find(w => w.id === practiceWord.toLowerCase());
                if (!targetWordObj) { frameId = requestAnimationFrame(processFrame); return; }
                const result = wordValidator.validateSign(targetWordObj, landmarks, handedness);
                if (result.confidence > 0.80) {
                    if (!dwellStartTimeRef.current) dwellStartTimeRef.current = Date.now();
                    else {
                        const elapsed = Date.now() - dwellStartTimeRef.current;
                        const pProgress = Math.min(100, (elapsed / 1500) * 100); 
                        setPracticeProgress(pProgress);
                        if (pProgress === 100 && !isPracticeSuccess) {
                            setIsPracticeSuccess(true);
                            setTimeout(() => { setPracticeWord(null); setIsPracticeSuccess(false); setPracticeProgress(0); }, 2000); 
                        }
                    }
                } else { setPracticeProgress(0); dwellStartTimeRef.current = null; }
            } else {
                // Regular mode: detect best matching word
                let highestScore = 0; let topWord = null;
                ACTIVE_VOCABULARY.forEach(word => {
                    const result = wordValidator.validateSign(word, landmarks, handedness);
                    if (result.confidence > highestScore) { highestScore = result.confidence; topWord = word; }
                });

                if (highestScore > 0.75) {
                    const currentWordText = topWord.englishText;
                    setBestMatch(currentWordText); 
                    if (lockedWordRef.current !== currentWordText) {
                        lockedWordRef.current = currentWordText; dwellStartTimeRef.current = Date.now(); setDwellProgress(0);
                    } else {
                        const elapsed = Date.now() - dwellStartTimeRef.current;
                        const progress = Math.min(100, (elapsed / 2000) * 100);
                        setDwellProgress(progress);
                        if (progress === 100) { setSentence(prev => [...prev, currentWordText]); dwellStartTimeRef.current = Date.now() + 1500; setDwellProgress(0); }
                    }
                } else { setBestMatch("Thinking..."); setDwellProgress(0); lockedWordRef.current = null; dwellStartTimeRef.current = null; }
            }
            frameId = requestAnimationFrame(processFrame);
        };
        frameId = requestAnimationFrame(processFrame);
        return () => cancelAnimationFrame(frameId);
    }, [isDetecting, handDetected, detectionResult, practiceWord, isPracticeSuccess, dwellProgress]);

    useEffect(() => { return () => stopDetection(); }, [stopDetection]);

    const handleTranslate = async () => {
        setIsTranslating(true);
        try {
            const result = await translateASLSequence(sentence);
            setTranslationResult(result);
            
        // eslint-disable-next-line no-unused-vars
        } catch (error) { setTranslationResult({ smoothEnglish: sentence.join(" "), feedback: "API connection failed.", missingSigns: [] }); }
        finally { setIsTranslating(false); }
    };

    return (
        <div className="max-w-6xl mx-auto mt-6 relative px-2">
            <AnimatePresence>
                {practiceWord && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card p-4 flex justify-between items-center border border-primary/50 mb-6 rounded-2xl">
                        <div><h2 className="text-xl font-bold text-white flex items-center gap-3"><Camera className="text-primary w-5 h-5" /> Practice Mode: <span className="text-primary capitalize">{practiceWord}</span></h2></div>
                        <Button variant="outline" onClick={() => setPracticeWord(null)} leftIcon={<X className="w-4 h-4"/>}>Cancel Practice</Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`flex flex-col ${practiceWord ? 'lg:flex-row items-stretch' : ''} gap-6`}>
                <div className={`relative glass-card p-2 rounded-2xl bg-dark-900 shadow-2xl flex flex-col justify-center ${practiceWord ? 'lg:flex-[2]' : 'w-full'}`}>
                    <div className="relative w-full rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                        <CameraFeed videoRef={videoRef} canvasRef={canvasRef} isActive={isCameraActive} isLoading={isCameraLoading} isDetecting={isDetecting} handDetected={handDetected} onStart={() => startDetection()} onStop={() => stopDetection()} onRetry={() => startDetection()} />
                        
                        {/* Progress Bar UI for Practice Mode Scanning */}
                        <AnimatePresence>
                            {practiceWord && isCameraActive && handDetected && !isPracticeSuccess && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-64">
                                    <div className="bg-dark-900/95 backdrop-blur-md p-3 rounded-xl border border-primary/40 shadow-xl flex flex-col items-center">
                                        <span className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">{practiceProgress > 0 ? "Hold still..." : "Show hand to start"}</span>
                                        <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${practiceProgress}%` }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <AnimatePresence>
                            {!practiceWord && handDetected && bestMatch && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute z-20" style={{ left: `${handPosition.x}%`, top: `${Math.max(5, handPosition.y - 15)}%`, transform: 'translateX(-50%)' }}>
                                    <div className="relative flex items-center justify-center">
                                        <svg width="80" height="80" className="absolute rotate-[-90deg]">
                                            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="6" />
                                            <circle cx="40" cy="40" r="36" fill="none" stroke="#6366F1" strokeWidth="6" strokeDasharray="226" strokeDashoffset={226 - (226 * dwellProgress) / 100} />
                                        </svg>
                                        <div className="bg-dark-900/90 px-4 py-2 rounded-full border border-primary/50 shadow-lg z-10"><span className="text-white font-bold">{bestMatch}</span></div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {practiceWord && isPracticeSuccess && (
                            <div className="absolute inset-0 z-30 bg-success/20 backdrop-blur-md flex flex-col items-center justify-center">
                                <CheckCircle2 className="w-16 h-16 text-success mb-4" />
                                <h1 className="text-5xl font-extrabold text-white">Perfect!</h1>
                            </div>
                        )}

                        {!isCameraActive && !isCameraLoading && (
                            <div className="absolute inset-0 z-40 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm">
                                <Button variant="primary" onClick={() => startDetection()}>Turn On Camera</Button>
                            </div>
                        )}
                    </div>
                </div>

                {practiceWord && (
                    <div className="lg:flex-[1] glass-card p-4 flex flex-col items-center justify-center border border-dark-600 rounded-2xl bg-dark-800/80 min-w-[300px]">
                        <div className="w-full flex-1 min-h-[300px] relative flex justify-center items-center">
                            <ModelViewer letter={practiceWord} className="w-full h-full" />
                        </div>
                        <div className="text-center mt-4 bg-dark-900/60 py-3 w-full rounded-xl border border-dark-700">
                            <p className="text-2xl font-black text-white capitalize">{practiceWord}</p>
                            <p className="text-xs text-primary mt-1 uppercase tracking-widest">Target Sign</p>
                        </div>
                    </div>
                )}
            </div>

            {!practiceWord && (
                <div className="glass-card p-6 border border-dark-700 mt-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-dark-300 uppercase">Your Sentence</h3>
                        <Button variant="outline" size="sm" onClick={() => { setSentence([]); setTranslationResult(null); }}>Clear</Button>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-4 bg-dark-800/50 p-4 rounded-xl border border-dark-600 min-h-[60px]">
                        {sentence.length === 0 ? <p className="text-dark-500 italic py-2">No words captured yet...</p> : sentence.map((word, idx) => (<div key={idx} className="bg-primary px-4 py-2 rounded-lg text-white font-bold shadow-lg">{word}</div>))}
                    </div>
                    {sentence.length > 0 && !translationResult && (
                        <Button variant="secondary" className="w-full" onClick={handleTranslate} isLoading={isTranslating} rightIcon={<Sparkles className="w-4 h-4"/>}>Translate & Check Grammar</Button>
                    )}
                    {translationResult && (
                        <div className="mt-4 p-4 rounded-xl bg-success/10 border border-success/20">
                            <h4 className="text-sm text-dark-300 uppercase mb-1">Smooth English</h4>
                            <p className="text-2xl font-bold text-white mb-4">{translationResult.smoothEnglish}</p>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <Info className="w-5 h-5 text-primary shrink-0" />
                                <div><p className="text-sm font-bold text-dark-200">Grammar Note</p><p className="text-sm text-dark-400">{translationResult.feedback}</p></div>
                            </div>
                            {translationResult.missingSigns?.length > 0 && (
                                <div className="mt-4 border-t border-success/20 pt-4 flex gap-4 flex-wrap">
                                    {translationResult.missingSigns.map((sign, idx) => (
                                        <div key={idx} onClick={() => setPracticeWord(sign)} className="group flex items-center gap-4 bg-dark-800 p-4 rounded-xl border border-dark-600 hover:border-primary cursor-pointer transition-all">
                                            <div className="w-16 h-16 rounded-xl bg-dark-900 border border-primary/20 flex items-center justify-center relative overflow-hidden">
                                                <Hand className="w-8 h-8 text-primary/20" />
                                                {/* Hand Bone SVG Diagram */}
                                                <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="90" r="3" fill="#EC4899"/>
                                                    <path d="M50 90 L30 50 M30 50 L20 30 M50 90 L45 45 M45 45 L40 20 M50 90 L60 45 M60 45 L65 20 M50 90 L75 50 M75 50 L85 30" stroke="rgba(99,102,241,0.5)" strokeWidth="2" fill="none"/>
                                                    <circle cx="30" cy="50" r="2" fill="#6366F1"/><circle cx="20" cy="30" r="2" fill="#6366F1"/>
                                                    <circle cx="45" cy="45" r="2" fill="#6366F1"/><circle cx="40" cy="20" r="2" fill="#6366F1"/>
                                                    <circle cx="60" cy="45" r="2" fill="#6366F1"/><circle cx="65" cy="20" r="2" fill="#6366F1"/>
                                                    <circle cx="75" cy="50" r="2" fill="#6366F1"/><circle cx="85" cy="30" r="2" fill="#6366F1"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-white font-extrabold text-xl capitalize tracking-wide">{sign}</p>
                                                <p className="text-xs text-primary mt-1 flex items-center gap-1"><Camera className="w-3 h-3"/> Practice</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// MAIN PAGE EXPORT
// ============================================================================
const SentenceBuilder = () => {
    const [mode, setMode] = useState('freeflow'); 
    const { user } = useAuthStore();

    const [currentStep, setCurrentStep] = useState(STEPS.INPUT);
    const [sentenceData, setSentenceData] = useState({ original: '', aslWords: [], explanation: '' });
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    
    const [savedSentences, setSavedSentences] = useState([]);
    const [showSavedSentences, setShowSavedSentences] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadSentences = async () => {
            if (user?.uid) {
                try {
                    const progress = await getUserProgress(user.uid);
                    if (progress?.practicedSentences) setSavedSentences(progress.practicedSentences);
                } catch (error) { console.error(error); }
            }
        };
        loadSentences();
    }, [user?.uid]);

    const handleSentenceSubmit = useCallback(async (sentence) => {
        setIsTranslating(true);
        try {
            const result = await analyzeSentenceToSigns(sentence);
            setSentenceData({ original: result.original || sentence, aslWords: result.aslWords || [], explanation: result.explanation || '' });
            setCurrentStep(STEPS.BREAKDOWN);
        } catch (error) { console.error(error); } finally { setIsTranslating(false); }
    }, []);

    const handleWordClick = useCallback((word, index) => { setCurrentWordIndex(index); setCurrentStep(STEPS.LEARN); }, []);
    const handleWordSelect = useCallback((word, index) => { setCurrentWordIndex(index); }, []);

    const handlePracticeComplete = useCallback(async (results) => {
        setCurrentStep(STEPS.COMPLETE);
        if (user?.uid) {
            setIsSaving(true);
            try {
                const sentenceRecord = { id: Date.now().toString(), original: sentenceData.original, aslWords: sentenceData.aslWords, accuracy: results.averageAccuracy, completedAt: Date.now() };
                await savePracticedSentence(user.uid, sentenceRecord);
                setSavedSentences(prev => [sentenceRecord, ...prev]);
            } catch (error) { console.error(error); } finally { setIsSaving(false); }
        }
    }, [user?.uid, sentenceData]);

    const handlePracticeExit = useCallback(() => {
        setCurrentStep(STEPS.INPUT); setSentenceData({ original: '', aslWords: [], explanation: '' });
        setCurrentWordIndex(0);
    }, []);

    const handlePracticeSaved = useCallback((sentence) => {
        setSentenceData({ original: sentence.original, aslWords: sentence.aslWords, explanation: '' });
        setShowSavedSentences(false); setCurrentStep(STEPS.BREAKDOWN);
    }, []);

    const handleDeleteSentence = useCallback((id) => { setSavedSentences(prev => prev.filter(s => s.id !== id)); }, []);

    const goToNextStep = useCallback(() => {
        const stepOrder = [STEPS.INPUT, STEPS.BREAKDOWN, STEPS.LEARN, STEPS.PRACTICE];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) setCurrentStep(stepOrder[currentIndex + 1]);
    }, [currentStep]);

    const goToPrevStep = useCallback(() => {
        const stepOrder = [STEPS.INPUT, STEPS.BREAKDOWN, STEPS.LEARN, STEPS.PRACTICE];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) setCurrentStep(stepOrder[currentIndex - 1]);
    }, [currentStep]);

    const getStepIndex = (step) => STEP_CONFIG.findIndex(s => s.id === step);

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
                        Sentence Builder
                    </h1>
                    <p className="text-dark-400 text-lg max-w-xl mx-auto mb-6">
                        Build sentences using sign language or learn pre-written ASL phrases.
                    </p>
                    
                    <div className="inline-flex bg-dark-800 p-1 rounded-xl border border-dark-700 shadow-inner">
                        <button onClick={() => setMode('freeflow')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'freeflow' ? 'bg-primary text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
                            <Hand className="w-4 h-4" /> Free Sign
                        </button>
                        <button onClick={() => setMode('guided')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'guided' ? 'bg-primary text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
                            <BookOpen className="w-4 h-4" /> Guided 
                        </button>
                    </div>
                </motion.div>

                {mode === 'freeflow' ? <FreeFlowMode /> : (
                    <div className="mt-8 max-w-4xl mx-auto">
                        {currentStep === STEPS.INPUT && (
                            <div className="text-center mb-6">
                                <button onClick={() => setShowSavedSentences(!showSavedSentences)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-dark-700 transition-colors">
                                    <BookOpen className="w-4 h-4" /> {showSavedSentences ? 'New Sentence' : `My Sentences (${savedSentences.length})`}
                                </button>
                            </div>
                        )}
                        {currentStep !== STEPS.COMPLETE && !showSavedSentences && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
                                <div className="flex items-center justify-center gap-2 md:gap-4">
                                    {STEP_CONFIG.map((step, index) => {
                                        const Icon = step.icon; 
                                        const isActive = step.id === currentStep; 
                                        const isCompleted = getStepIndex(currentStep) > index;
                                        const hasData = sentenceData.aslWords.length > 0;
                                        const isClickable = hasData || step.id === STEPS.INPUT;

                                        return (
                                            <div key={step.id} className="flex items-center">
                                                <button 
                                                    onClick={() => isClickable && setCurrentStep(step.id)}
                                                    disabled={!isClickable}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm ${
                                                        isActive ? 'bg-primary text-white shadow-primary/30 cursor-default' : 
                                                        isCompleted ? 'bg-success/20 text-success hover:bg-success/30 cursor-pointer hover:scale-105 active:scale-95' :
                                                        isClickable ? 'bg-dark-700/50 text-dark-300 hover:bg-dark-600 hover:text-white cursor-pointer hover:scale-105 active:scale-95' : 
                                                        'bg-dark-800/30 text-dark-600 cursor-not-allowed opacity-50'
                                                    }`}
                                                >
                                                    <Icon className="w-5 h-5" /> 
                                                    <span className="hidden md:inline text-sm font-bold tracking-wide">{step.label}</span>
                                                </button>
                                                {index < STEP_CONFIG.length - 1 && <ChevronRight className="w-5 h-5 text-dark-600 mx-1 md:mx-2" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {showSavedSentences && currentStep === STEPS.INPUT && (
                                <motion.div key="saved" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <SavedSentences sentences={savedSentences} onPractice={handlePracticeSaved} onDelete={handleDeleteSentence} />
                                </motion.div>
                            )}
                            {currentStep === STEPS.INPUT && !showSavedSentences && (
                                <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <SentenceInput onSentenceSubmit={handleSentenceSubmit} isLoading={isTranslating} />
                                </motion.div>
                            )}
                            {currentStep === STEPS.BREAKDOWN && (
                                <motion.div key="breakdown" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                                    <WordBreakdown original={sentenceData.original} aslWords={sentenceData.aslWords} explanation={sentenceData.explanation} onWordClick={handleWordClick} />
                                    <div className="flex flex-wrap gap-4 justify-between">
                                        <Button variant="outline" onClick={() => setCurrentStep(STEPS.INPUT)} leftIcon={<ChevronLeft className="w-4 h-4" />}>New Sentence</Button>
                                        <div className="flex gap-3">
                                            <Button variant="secondary" onClick={() => goToNextStep()} leftIcon={<GraduationCap className="w-4 h-4" />}>Watch Sequence</Button>
                                            <Button variant="primary" onClick={() => setCurrentStep(STEPS.PRACTICE)} leftIcon={<Camera className="w-4 h-4" />}>Start Practice</Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {currentStep === STEPS.LEARN && (
                                <motion.div key="learn" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                                    <SignSequence words={sentenceData.aslWords} currentWordIndex={currentWordIndex} onWordSelect={handleWordSelect} />
                                    <div className="flex flex-wrap gap-4 justify-between">
                                        <Button variant="outline" onClick={goToPrevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>Back to Breakdown</Button>
                                        <Button variant="primary" onClick={goToNextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>Start Practice</Button>
                                    </div>
                                </motion.div>
                            )}
                            {currentStep === STEPS.PRACTICE && (
                                <motion.div key="practice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <FullSentencePractice sentence={sentenceData.original} words={sentenceData.aslWords} onComplete={handlePracticeComplete} onExit={handlePracticeExit} />
                                </motion.div>
                            )}
                            {currentStep === STEPS.COMPLETE && (
                                <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-8 text-center">
                                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2 }} className="mb-6">
                                        <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-warning/20 to-secondary/20"><Trophy className="w-20 h-20 text-warning" /></div>
                                    </motion.div>
                                    <h2 className="text-3xl font-bold text-dark-100 mb-2">Sentence Completed!</h2>
                                    <p className="text-xl text-dark-300 mb-8">"{sentenceData.original}"</p>
                                    {isSaving && <p className="text-sm text-dark-400 mb-4">Saving your progress...</p>}
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <Button variant="outline" onClick={() => { setCurrentStep(STEPS.BREAKDOWN); }} leftIcon={<ArrowLeft className="w-4 h-4" />}>Practice Again</Button>
                                        <Button variant="primary" onClick={handlePracticeExit} leftIcon={<Home className="w-4 h-4" />}>New Sentence</Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SentenceBuilder;