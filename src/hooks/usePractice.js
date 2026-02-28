/**
 * usePractice Hook
 * Manages practice session logic and state
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../services/firebase';
import {
    savePracticeSession,
    addLearnedSign,
    updateStreak,
    updateAccuracyAverage
} from '../services/database';
import { checkAndUnlockAchievements } from '../services/achievementService';
import useAuthStore from '../store/authStore';
import { alphabetSigns } from '../data/signsData';

/**
 * Custom hook for managing practice sessions
 * 
 * @returns {Object} Practice state and controls
 */
export function usePractice() {
    // Get URL params
    const [searchParams, setSearchParams] = useSearchParams();
    const initialLetter = searchParams.get('letter')?.toUpperCase() || 'A';

    // Auth store
    const { user, refreshUserData } = useAuthStore();

    // State
    const [targetLetter, setTargetLetterState] = useState(initialLetter);
    const [attempts, setAttempts] = useState(0);
    const [correctAttempts, setCorrectAttempts] = useState(0);
    const [bestAccuracy, setBestAccuracy] = useState(0);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState([]);
    const [lastXPResult, setLastXPResult] = useState(null);

    /**
     * Set target letter and update URL
     */
    const setTargetLetter = useCallback((letter) => {
        const normalizedLetter = letter.toUpperCase();
        setTargetLetterState(normalizedLetter);
        setSearchParams({ letter: normalizedLetter });

        // Reset session stats for new letter
        setAttempts(0);
        setCorrectAttempts(0);
        setBestAccuracy(0);
        setSessionHistory([]);
    }, [setSearchParams]);

    /**
     * Start a practice session
     */
    const startSession = useCallback(() => {
        console.log(`🎬 Starting practice session for letter "${targetLetter}"`);
        setIsSessionActive(true);

        // Log analytics event
        if (analytics) {
            logEvent(analytics, 'practice_session_start', {
                letter: targetLetter,
                source: 'practice_page'
            });
        }
    }, [targetLetter]);

    /**
     * End the practice session
     */
    const endSession = useCallback(() => {
        console.log('🛑 Ending practice session');

        // Log analytics event
        if (analytics) {
            logEvent(analytics, 'practice_session_end', {
                letter: targetLetter,
                attempts,
                correct_attempts: correctAttempts,
                best_accuracy: bestAccuracy,
                learned: correctAttempts > 0
            });
        }

        setIsSessionActive(false);
    }, [targetLetter, attempts, correctAttempts, bestAccuracy]);

    /**
     * Handle validation result from Gemini
     */
    const handleValidationResult = useCallback(async (result) => {
        if (!result) return;

        console.log('📊 Processing validation result:', result);

        // Increment attempts
        setAttempts(prev => prev + 1);

        // Add to history
        const historyEntry = {
            letter: targetLetter,
            accuracy: result.accuracy,
            isCorrect: result.isCorrect,
            feedback: result.feedback,
            timestamp: Date.now()
        };

        setSessionHistory(prev => [...prev, historyEntry]);

        // Update best accuracy
        if (result.accuracy > bestAccuracy) {
            setBestAccuracy(result.accuracy);
        }

        // Log analytics event
        if (analytics) {
            logEvent(analytics, 'practice_attempt', {
                letter: targetLetter,
                accuracy: result.accuracy,
                isCorrect: result.isCorrect,
                attempt_number: attempts + 1
            });
        }

        // If correct, trigger correct sign handling
        if (result.isCorrect) {
            setCorrectAttempts(prev => prev + 1);
        }
    }, [targetLetter, attempts, bestAccuracy]);

    /**
     * Handle a correct sign (save to Firestore, check achievements)
     */
    const handleCorrectSign = useCallback(async (result) => {
        if (!user?.uid) {
            console.warn('⚠️ No user logged in, cannot save progress');
            return null;
        }

        console.log('✅ Processing correct sign...');

        try {
            // Save practice session (now returns XP result)
            const practiceXPResult = await savePracticeSession(user.uid, {
                sign: targetLetter,
                accuracy: result.accuracy,
                attempts: 1
            });

            // Track XP result for level-up modal
            if (practiceXPResult) {
                setLastXPResult(practiceXPResult);
            }

            // Add learned sign (if first time) - also returns XP result
            const signResult = await addLearnedSign(user.uid, targetLetter);

            if (signResult?.isNew) {
                console.log(`🎉 New sign learned: ${targetLetter}`);

                // If learning new sign caused level-up, track that too
                if (signResult.xpResult) {
                    setLastXPResult(signResult.xpResult);
                }

                // Log analytics event
                if (analytics) {
                    logEvent(analytics, 'sign_learned', {
                        letter: targetLetter,
                        accuracy: result.accuracy
                    });
                }
            }

            // Update streak
            await updateStreak(user.uid);

            // Update accuracy average
            await updateAccuracyAverage(user.uid);

            // Check achievements
            const newAchievements = await checkAndUnlockAchievements(user.uid);

            if (newAchievements.length > 0) {
                console.log('🏆 New achievements unlocked:', newAchievements);
                setNewlyUnlockedAchievements(newAchievements);

                // Log analytics events
                if (analytics) {
                    newAchievements.forEach(achievement => {
                        logEvent(analytics, 'achievement_unlocked', {
                            achievement_id: achievement.id,
                            achievement_name: achievement.name
                        });
                    });
                }
            }

            // Refresh user data to update UI (level, XP, learned signs stats)
            await refreshUserData();

            // Return XP result for level-up modal handling
            return practiceXPResult || signResult?.xpResult || null;
        } catch (error) {
            console.error('❌ Error saving correct sign:', error);
            return null;
        }
    }, [user?.uid, targetLetter]);

    /**
     * Navigate to next letter
     */
    const nextLetter = useCallback(() => {
        const currentIndex = alphabetSigns.findIndex(s => s.letter === targetLetter);

        if (currentIndex < alphabetSigns.length - 1) {
            setTargetLetter(alphabetSigns[currentIndex + 1].letter);
        }
    }, [targetLetter, setTargetLetter]);

    /**
     * Navigate to previous letter
     */
    const prevLetter = useCallback(() => {
        const currentIndex = alphabetSigns.findIndex(s => s.letter === targetLetter);

        if (currentIndex > 0) {
            setTargetLetter(alphabetSigns[currentIndex - 1].letter);
        }
    }, [targetLetter, setTargetLetter]);

    /**
     * Check if there's a next letter
     */
    const hasNextLetter = useCallback(() => {
        const currentIndex = alphabetSigns.findIndex(s => s.letter === targetLetter);
        return currentIndex < alphabetSigns.length - 1;
    }, [targetLetter]);

    /**
     * Check if there's a previous letter
     */
    const hasPrevLetter = useCallback(() => {
        const currentIndex = alphabetSigns.findIndex(s => s.letter === targetLetter);
        return currentIndex > 0;
    }, [targetLetter]);

    /**
     * Clear newly unlocked achievements
     */
    const clearNewAchievements = useCallback(() => {
        setNewlyUnlockedAchievements([]);
    }, []);

    /**
     * Get current letter index
     */
    const currentLetterIndex = alphabetSigns.findIndex(s => s.letter === targetLetter);

    /**
     * Sync with URL params on mount
     */
    useEffect(() => {
        const letterParam = searchParams.get('letter')?.toUpperCase();
        if (letterParam && letterParam !== targetLetter) {
            const isValid = alphabetSigns.some(s => s.letter === letterParam);
            if (isValid) {
                setTargetLetterState(letterParam);
            }
        }
    }, [searchParams, targetLetter]);

    return {
        // State
        targetLetter,
        attempts,
        correctAttempts,
        bestAccuracy,
        sessionHistory,
        isSessionActive,
        newlyUnlockedAchievements,
        currentLetterIndex,
        totalLetters: alphabetSigns.length,
        lastXPResult,

        // Actions
        setTargetLetter,
        startSession,
        endSession,
        handleValidationResult,
        handleCorrectSign,
        nextLetter,
        prevLetter,
        hasNextLetter,
        hasPrevLetter,
        clearNewAchievements,
        clearLastXPResult: () => setLastXPResult(null)
    };
}

export default usePractice;
