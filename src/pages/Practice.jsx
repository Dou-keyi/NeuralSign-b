/**
 * Practice Page
 * Combined practice hub with tabs for Practice Modes and Camera Practice
 * * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hand, ArrowLeft, ChevronLeft, ChevronRight, Camera,
    CameraOff, Zap, Target, Trophy, Flame, BarChart3,
    Loader2, Infinity as InfinityIcon, Layers, Timer, History, ArrowRight, Sparkles
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
import SuccessPopup from '@/components/feedback/SuccessPopup';

// Hooks
import { useHandDetection } from '@/hooks/useHandDetection';
import { usePractice } from '@/hooks/usePractice';
import { useLevelUp } from '@/context/LevelUpContext';
import useAuthStore from '@/store/authStore';

// Data
import { getSignByLetter } from '@/data/signsData';

// Lazy load 3D viewer
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

// ============= HELPER COMPONENTS =============
const PracticeModeCard = ({ icon: Icon, iconColor, bgGradient, title, description, stats, onClick, disabled = false }) => (
    <motion.div
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -4 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`glass-card p-6 cursor-pointer transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-primary/10'}`}
        onClick={disabled ? undefined : onClick}
    >
        <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient}`}><Icon className={`w-6 h-6 ${iconColor}`} /></div>
            <div className="flex-1"><h3 className="text-xl font-semibold text-dark-100 mb-1">{title}</h3><p className="text-sm text-dark-400">{description}</p></div>
        </div>
        {stats && (
            <div className="flex items-center gap-4 mb-4 text-sm">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-dark-300"><stat.icon className={`w-4 h-4 ${stat.color}`} /><span>{stat.value}</span></div>
                ))}
            </div>
        )}
        <div className="flex items-center justify-between"><span className="text-xs text-dark-500 uppercase tracking-wider">{disabled ? 'Coming Soon' : 'Start Practice'}</span><ArrowRight className="w-5 h-5 text-dark-400" /></div>
    </motion.div>
);

const QuickStats = ({ userData }) => {
    const learnedCount = userData?.learnedSigns?.length || 0;
    const streak = userData?.progress?.streak || 0;
    const accuracy = userData?.progress?.accuracy || 0;
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-warning" />Your Stats</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between"><span className="text-dark-400">Signs Learned</span><span className="text-xl font-bold text-primary">{learnedCount}/26</span></div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(learnedCount / 26) * 100}%` }} className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" /></div>
                <div className="pt-4 border-t border-dark-700">
                    <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Flame className="w-4 h-4 text-warning" /><span className="text-dark-400">Streak</span></div><span className="font-bold text-dark-100">{streak} days</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-success" /><span className="text-dark-400">Accuracy</span></div><span className="font-bold text-dark-100">{accuracy}%</span></div>
                </div>
            </div>
            <Button variant="ghost" fullWidth className="mt-4" onClick={() => window.location.href = '/progress'}>View Full Progress</Button>
        </motion.div>
    );
};

const SessionStats = ({ attempts, bestAccuracy, correctAttempts }) => (
    <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center"><Target className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xl font-bold text-dark-100">{attempts}</div><div className="text-xs text-dark-400">Attempts</div></div>
        <div className="glass-card p-3 text-center"><BarChart3 className="w-5 h-5 text-secondary mx-auto mb-1" /><div className="text-xl font-bold text-dark-100">{bestAccuracy}%</div><div className="text-xs text-dark-400">Best</div></div>
        <div className="glass-card p-3 text-center"><Trophy className="w-5 h-5 text-accent mx-auto mb-1" /><div className="text-xl font-bold text-dark-100">{correctAttempts}</div><div className="text-xs text-dark-400">Correct</div></div>
    </div>
);

// ============= MAIN PRACTICE COMPONENT =============
const Practice = () => {
    const navigate = useNavigate();
    const { userData } = useAuthStore();
    const learnedCount = userData?.learnedSigns?.length || 0;
    const [searchParams] = useSearchParams();
    const letterParam = searchParams.get('letter');

    const [activeTab, setActiveTab] = useState('modes');
    const [isPracticing, setIsPracticing] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const hasStartedRef = useRef(false);
    const resultRef = useRef(null);
    const cameraRef = useRef(null);

    const { handleXPResult } = useLevelUp();

    const {
        targetLetter, setTargetLetter, attempts, correctAttempts, bestAccuracy,
        handleValidationResult, handleCorrectSign, nextLetter, prevLetter,
        hasNextLetter, hasPrevLetter, newlyUnlockedAchievements, clearNewAchievements,
        currentLetterIndex, totalLetters, lastXPResult, clearLastXPResult
    } = usePractice();

    // 🚀 CLEANED: Removed unused validateSign function so you get no ESLint warnings!
    const {
        videoRef, canvasRef, isDetecting, isValidating, isCameraActive,
        isCameraLoading, handDetected, validationResult, error,
        cooldownRemaining, startDetection, stopDetection, clearValidation,
        dwellProgress, detectionResult
    } = useHandDetection({
        targetLetter,
        onCorrectSign: handleCorrectSign,
        onValidationResult: async (result) => {
            await handleValidationResult(result);
            if (result?.isCorrect) setShowSuccessPopup(true);
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
    });

    const [handPosition, setHandPosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        if (handDetected && detectionResult?.landmarks) {
            const landmarks = detectionResult.landmarks;
            let minY = 1, meanX = 0;
            landmarks.forEach(lm => { if (lm.y < minY) minY = lm.y; meanX += lm.x; });
            meanX = meanX / landmarks.length;
            setHandPosition({ x: (1 - meanX) * 100, y: minY * 100 });
        }
    }, [handDetected, detectionResult]);

    useEffect(() => {
        if (letterParam) setActiveTab('practice');
    }, [letterParam]);

    useEffect(() => {
        if (isPracticing && !hasStartedRef.current) {
            hasStartedRef.current = true;
            setTimeout(() => startDetection(), 150);
        }
        if (!isPracticing) hasStartedRef.current = false;
    }, [isPracticing, startDetection]);

    useEffect(() => { return () => stopDetection(); }, [stopDetection]);

    useEffect(() => {
        if (lastXPResult) { handleXPResult(lastXPResult); clearLastXPResult(); }
    }, [lastXPResult, handleXPResult, clearLastXPResult]);

    const handleStartPractice = useCallback(() => setIsPracticing(true), []);
    const handleStopPractice = useCallback(() => { stopDetection(); setIsPracticing(false); }, [stopDetection]);
    const handleTryAgain = useCallback(() => { clearValidation(); setTimeout(() => cameraRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }, [clearValidation]);
    const handleNextLetter = useCallback(() => { clearValidation(); nextLetter(); }, [clearValidation, nextLetter]);
    const handlePrevLetter = useCallback(() => { clearValidation(); prevLetter(); }, [clearValidation, prevLetter]);
    const handleLetterChange = useCallback((letter) => { clearValidation(); setTargetLetter(letter); }, [clearValidation, setTargetLetter]);

    const signData = getSignByLetter(targetLetter);

    const renderPracticeModesTab = () => (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <DailyChallenge />
                <div className="grid md:grid-cols-2 gap-4">
                    <PracticeModeCard icon={InfinityIcon} iconColor="text-white" bgGradient="from-indigo-500 to-purple-600" title="Free Practice" description="Practice at your own pace." onClick={() => navigate('/practice/free')} disabled={learnedCount === 0} />
                    <PracticeModeCard icon={Layers} iconColor="text-white" bgGradient="from-pink-500 to-rose-600" title="Flashcard Mode" description="Quiz yourself." onClick={() => navigate('/practice/flashcard')} disabled={learnedCount === 0} />
                    <PracticeModeCard icon={Timer} iconColor="text-white" bgGradient="from-amber-500 to-orange-600" title="Timed Challenge" description="60-second sprint!" onClick={() => navigate('/practice/timed')} disabled={learnedCount < 3} />
                    <PracticeModeCard icon={History} iconColor="text-white" bgGradient="from-slate-500 to-slate-600" title="History" description="Review past sessions." onClick={() => navigate('/practice/history')} />
                </div>
            </div>
            <QuickStats userData={userData} />
        </div>
    );

    const renderCameraPracticeTab = () => {
        if (!isPracticing) {
            return (
                <div className="glass-card p-6">
                    <div className="flex gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary"><Camera className="text-white" /></div>
                        <div><h2 className="text-xl font-bold text-white">Camera Practice</h2><p className="text-dark-400">Real-time AI sign checking.</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
                            <button key={l} onClick={() => handleLetterChange(l)} className={`w-10 h-10 rounded-lg font-bold transition-all ${targetLetter === l ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}>{l}</button>
                        ))}
                    </div>
                    <Button variant="primary" size="lg" fullWidth onClick={handleStartPractice} leftIcon={<Camera className="w-5 h-5" />}>Start Practice with Letter {targetLetter}</Button>
                </div>
            );
        }

        return (
            <>
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={handleStopPractice} leftIcon={<ArrowLeft className="w-4 h-4" />}>Exit Practice</Button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full"><Flame className="w-4 h-4 text-accent" /><span className="text-dark-200 font-medium">Practicing: <span className="text-primary font-bold">{targetLetter}</span></span></div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <div ref={cameraRef} className="space-y-4">
                        <div className="relative w-full rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-dark-700">
                            <CameraFeed videoRef={videoRef} canvasRef={canvasRef} isActive={isCameraActive} isLoading={isCameraLoading} isDetecting={isDetecting} handDetected={handDetected} error={error} onStart={startDetection} onStop={stopDetection} onRetry={startDetection} />
                            
                            {/* Floating Circular UI */}
                            <AnimatePresence>
                                {isCameraActive && handDetected && !isValidating && cooldownRemaining === 0 && (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute z-30 pointer-events-none" style={{ left: `${handPosition.x}%`, top: `${Math.max(10, handPosition.y - 15)}%`, transform: 'translate(-50%, -50%)' }}>
                                        <div className="relative flex items-center justify-center">
                                            <svg width="100" height="100" className="absolute rotate-[-90deg]">
                                                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="6" />
                                                <circle cx="50" cy="50" r="46" fill="none" stroke="#6366F1" strokeWidth="6" strokeDasharray="289" strokeDashoffset={289 - (289 * (dwellProgress || 0)) / 100} className="transition-all duration-75" />
                                            </svg>
                                            <div className="bg-dark-900/90 w-12 h-12 flex items-center justify-center rounded-full border border-primary/50 shadow-xl"><span className="text-white font-black text-2xl">{targetLetter}</span></div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* State Overlays */}
                            <AnimatePresence mode="wait">
                                {isValidating && (
                                    <motion.div key="v" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-primary/90 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 shadow-2xl"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Sign...</motion.div>
                                )}
                                {cooldownRemaining > 0 && !isValidating && (
                                    <motion.div key="c" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-dark-800/95 backdrop-blur-md px-4 py-2 rounded-xl text-dark-300 font-bold shadow-xl border border-dark-600">Ready in {cooldownRemaining}s</motion.div>
                                )}
                                {!handDetected && isCameraActive && !isValidating && cooldownRemaining === 0 && (
                                    <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-dark-900/80 backdrop-blur-md px-4 py-2 rounded-xl text-dark-400 border border-dashed border-dark-600 uppercase tracking-widest text-xs font-bold flex items-center gap-2"><Hand className="w-4 h-4" /> Show Hand</motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <LetterNav currentLetter={targetLetter} currentIndex={currentLetterIndex} total={totalLetters} onPrev={handlePrevLetter} onNext={handleNextLetter} hasPrev={hasPrevLetter()} hasNext={hasNextLetter()} />
                    </div>

                    <div ref={resultRef} className="space-y-4">
                        <motion.div key={targetLetter} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 text-center">
                            <div className="text-sm text-dark-400 mb-2">Make this sign:</div>
                            <div className="text-8xl font-bold gradient-text mb-4">{targetLetter}</div>
                            {signData && <div className="text-sm text-dark-400 italic">{signData.description}</div>}
                        </motion.div>
                        <SuccessPopup isOpen={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} letter={targetLetter} score={validationResult?.accuracy || 0} />
                        <ValidationFeedback result={validationResult} isValidating={isValidating} targetLetter={targetLetter} onTryAgain={handleTryAgain} onNext={handleNextLetter} cooldownRemaining={cooldownRemaining} />
                        <SessionStats attempts={attempts} bestAccuracy={bestAccuracy} correctAttempts={correctAttempts} />
                    </div>
                </div>
            </>
        );
    };

    return (
        <PageContainer>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary"><Hand className="w-8 h-8 text-white" /></div>
                    <div><h1 className="text-3xl font-bold text-dark-100">Practice</h1><p className="text-dark-400">Improve your sign accuracy with real-time AI validation.</p></div>
                </div>
                {!isPracticing && (
                    <div className="flex gap-2 mt-4">
                        <button onClick={() => setActiveTab('modes')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'modes' ? 'bg-primary text-white shadow-lg' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}><Target className="w-4 h-4" /> Practice Mode</button>
                        <button onClick={() => setActiveTab('practice')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'practice' ? 'bg-primary text-white shadow-lg' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}><Camera className="w-4 h-4" /> Practice</button>
                    </div>
                )}
            </motion.div>

            <AnimatePresence mode="wait">
                {activeTab === 'modes' && !isPracticing ? (
                    <motion.div key="modes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>{renderPracticeModesTab()}</motion.div>
                ) : (
                    <motion.div key="practice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>{renderCameraPracticeTab()}</motion.div>
                )}
            </AnimatePresence>

            <BadgeUnlockModal isOpen={newlyUnlockedAchievements.length > 0} onClose={clearNewAchievements} badges={newlyUnlockedAchievements} />
        </PageContainer>
    );
};

export default Practice;