/**
 * SignSequence Component
 * Animated sequence showing how to fingerspell each word
 * * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    RotateCcw,
    Loader2,
    Box,
    Type
} from 'lucide-react';
import { getWordSign } from '@/data/commonWords';

// Lazy load 3D viewer
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

const SPEED_OPTIONS = {
    slow: { label: 'Slow', ms: 2500 },
    normal: { label: 'Normal', ms: 1500 },
    fast: { label: 'Fast', ms: 800 }
};

const SignSequence = ({ words = [], onWordSelect, currentWordIndex = 0 }) => {
    const [viewMode, setViewMode] = useState('word'); 
    const [activeTab, setActiveTab] = useState('3d'); // 🚀 NEW: Tracks 3D vs Video tab
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState('normal');
    const [loopEnabled, setLoopEnabled] = useState(false);
    const [currentWord, setCurrentWord] = useState(currentWordIndex);
    const [currentLetter, setCurrentLetter] = useState(0);

    const wordSign = getWordSign(words[currentWord] || '');
    const letters = wordSign?.letters || [];
    const currentLetterChar = letters[currentLetter] || '';

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentLetter(0);
            setIsPlaying(false); 
        }, 0);
        return () => clearTimeout(timer);
    }, [currentWord]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentWordIndex !== currentWord) {
                setCurrentWord(currentWordIndex);
                setCurrentLetter(0);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [currentWordIndex, currentWord]);

    useEffect(() => {
        if (!isPlaying || words.length === 0) return;
        const timer = setTimeout(() => {
            if (viewMode === 'spell' && currentLetter < letters.length - 1) {
                setCurrentLetter(currentLetter + 1);
            } else if (currentWord < words.length - 1) {
                setCurrentWord(currentWord + 1);
                setCurrentLetter(0);
                onWordSelect?.(words[currentWord + 1], currentWord + 1);
            } else if (loopEnabled) {
                setCurrentWord(0);
                setCurrentLetter(0);
                onWordSelect?.(words[0], 0);
            } else {
                setIsPlaying(false);
            }
        }, SPEED_OPTIONS[speed].ms);
        return () => clearTimeout(timer);
    }, [isPlaying, currentLetter, currentWord, letters.length, words, speed, loopEnabled, onWordSelect, viewMode]);

    const handlePrevLetter = useCallback(() => {
        if (viewMode === 'spell' && currentLetter > 0) {
            setCurrentLetter(currentLetter - 1);
        } else if (currentWord > 0) {
            const prevWord = currentWord - 1;
            const prevWordSign = getWordSign(words[prevWord] || '');
            setCurrentWord(prevWord);
            setCurrentLetter(viewMode === 'spell' ? (prevWordSign?.letters?.length || 1) - 1 : 0);
            onWordSelect?.(words[prevWord], prevWord);
        }
    }, [currentLetter, currentWord, words, onWordSelect, viewMode]);

    const handleNextLetter = useCallback(() => {
        if (viewMode === 'spell' && currentLetter < letters.length - 1) {
            setCurrentLetter(currentLetter + 1);
        } else if (currentWord < words.length - 1) {
            setCurrentWord(currentWord + 1);
            setCurrentLetter(0);
            onWordSelect?.(words[currentWord + 1], currentWord + 1);
        }
    }, [currentLetter, letters.length, currentWord, words, onWordSelect, viewMode]);

    const handlePlayPause = useCallback(() => setIsPlaying(!isPlaying), [isPlaying]);

    const handleRestart = useCallback(() => {
        setCurrentWord(0);
        setCurrentLetter(0);
        setIsPlaying(false);
        onWordSelect?.(words[0], 0);
    }, [words, onWordSelect]);

    const handleWordClick = useCallback((index) => {
        setCurrentWord(index);
        setCurrentLetter(0);
        onWordSelect?.(words[index], index);
    }, [words, onWordSelect]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="flex justify-center mb-8">
                <div className="inline-flex bg-dark-800 p-1 rounded-xl border border-dark-700 shadow-inner">
                    <button onClick={() => { setViewMode('word'); setIsPlaying(false); }} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'word' ? 'bg-primary text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
                        <Box className="w-4 h-4" /> Whole Word
                    </button>
                    <button onClick={() => { setViewMode('spell'); setIsPlaying(false); }} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'spell' ? 'bg-primary text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
                        <Type className="w-4 h-4" /> Fingerspelling
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                {words.map((word, index) => (
                    <button key={`word-${index}`} onClick={() => handleWordClick(index)} className={`group relative px-3 py-1 rounded-lg transition-all ${index === currentWord ? 'bg-primary text-white' : index < currentWord ? 'bg-success/20 text-success' : 'bg-dark-600 text-dark-400 hover:bg-dark-500'}`}>
                        <span className="text-sm font-medium">{word}</span>
                    </button>
                ))}
            </div>

            <div className="text-center mb-4">
                <p className="text-sm text-dark-400 mb-1">Word {currentWord + 1} of {words.length}</p>
                <h3 className="text-2xl font-bold text-dark-100 uppercase tracking-wider">{words[currentWord]}</h3>
                <p className="text-sm text-dark-400 mt-1">
                    {viewMode === 'spell' && letters.length > 1 ? `Fingerspelling: ${letters.join(' - ')}` : viewMode === 'word' ? 'Target Gesture' : 'Single letter sign'}
                </p>
            </div>

            {viewMode === 'spell' && letters.length > 1 && (
                <div className="flex items-center justify-center gap-1 mb-4 flex-wrap">
                    {letters.map((letter, index) => (
                        <div key={`letter-${index}`} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${index === currentLetter ? 'bg-primary text-white scale-125' : index < currentLetter ? 'bg-primary/30 text-primary' : 'bg-dark-600 text-dark-400'}`}>
                            {letter}
                        </div>
                    ))}
                </div>
            )}

            <div className="relative w-full min-h-[350px] md:min-h-[500px] mb-6 rounded-xl flex flex-col overflow-hidden bg-dark-700/50 border border-dark-600 shadow-inner">
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center flex-1"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
                    <AnimatePresence mode="wait">
                        <motion.div key={viewMode === 'word' ? words[currentWord] : currentLetterChar} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="w-full h-full flex-1 cursor-move flex flex-col">
                            <ModelViewer
                                letter={viewMode === 'word' ? words[currentWord] : currentLetterChar}
                                showControls={false}
                                hideBadge={false} 
                                onViewModeChange={setActiveTab} 
                                className="w-full h-full flex-1 border-none rounded-none"
                            />
                        </motion.div>
                    </AnimatePresence>
                </Suspense>

                {/* ONLY SHOW THESE OVERLAYS IN 3D MODE */}
                {activeTab === '3d' && (
                    <>
                        <div className="absolute top-16 right-4 px-3 py-1 rounded-lg bg-dark-800/90 backdrop-blur-sm border border-dark-600 z-10">
                            <span className="text-sm text-dark-300">
                                {viewMode === 'word' ? 'Reference' : `Letter ${currentLetter + 1}/${letters.length}`}
                            </span>
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-dark-400 uppercase tracking-widest bg-dark-900/60 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none z-10">
                            Drag to rotate
                        </div>
                    </>
                )}
            </div>

            {/* 🚀 ONLY SHOW CONTROLS IN 3D MODE */}
            {activeTab === '3d' && (
                <>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <button onClick={handleRestart} className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 transition-colors" title="Restart">
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button onClick={handlePrevLetter} disabled={currentWord === 0 && (viewMode === 'word' || currentLetter === 0)} className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 disabled:opacity-50 transition-colors">
                            <SkipBack className="w-5 h-5" />
                        </button>
                        <button onClick={handlePlayPause} className="p-4 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                        </button>
                        <button onClick={handleNextLetter} disabled={currentWord === words.length - 1 && (viewMode === 'word' || currentLetter === letters.length - 1)} className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 disabled:opacity-50 transition-colors">
                            <SkipForward className="w-5 h-5" />
                        </button>
                        <button onClick={() => setLoopEnabled(!loopEnabled)} className={`p-2 rounded-lg transition-colors ${loopEnabled ? 'bg-primary/20 text-primary' : 'bg-dark-600 text-dark-300 hover:bg-dark-500'}`} title={loopEnabled ? 'Loop on' : 'Loop off'}>
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-dark-400 mr-2">Speed:</span>
                        {Object.entries(SPEED_OPTIONS).map(([key, { label }]) => (
                            <button key={key} onClick={() => setSpeed(key)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${speed === key ? 'bg-primary/20 text-primary' : 'bg-dark-600 text-dark-400 hover:bg-dark-500'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default SignSequence;