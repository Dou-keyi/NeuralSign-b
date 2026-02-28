/**
 * Database Service
 * Firestore database functions for NeuralSign
 * 
 * Handles user profiles, progress tracking, signs, and achievements
 */

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    where,
    arrayUnion,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './collections';
export { COLLECTIONS };
import { addXP, awardPracticeXP, XP_SOURCES } from './xpService';
import { checkAndAwardMilestones } from './milestoneService';

// Collection names


// ============================================
// USER OPERATIONS
// ============================================

/**
 * Create initial user profile in Firestore
 * 
 * @param {string} userId - User ID
 * @param {Object} userData - User data object
 * @returns {Promise<void>}
 */
export async function createUserProfile(userId, userData) {
    try {
        console.log('📝 Creating user profile:', userId);

        const userRef = doc(db, COLLECTIONS.USERS, userId);

        await setDoc(userRef, {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ User profile created successfully');
    } catch (error) {
        console.error('❌ Error creating user profile:', error.message);
        throw new Error('Failed to create user profile. Please try again.');
    }
}

/**
 * Get user profile from Firestore
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User data or null if not found
 */
export async function getUserProfile(userId) {
    try {
        console.log('📖 Fetching user profile:', userId);

        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            console.log('✅ User profile fetched successfully');
            return {
                id: userSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || null,
                updatedAt: data.updatedAt?.toDate?.() || null,
            };
        }

        console.log('⚠️ User profile not found');
        return null;
    } catch (error) {
        console.error('❌ Error fetching user profile:', error.message);
        throw new Error('Failed to fetch user profile.');
    }
}

/**
 * Update user profile in Firestore
 * 
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateUserProfile(userId, updates) {
    try {
        console.log('📝 Updating user profile:', userId, updates);

        const userRef = doc(db, COLLECTIONS.USERS, userId);

        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ User profile updated successfully');
    } catch (error) {
        console.error('❌ Error updating user profile:', error.message);
        throw new Error('Failed to update user profile.');
    }
}

// ============================================
// PROGRESS OPERATIONS
// ============================================

/**
 * Save practice session data
 * 
 * @param {string} userId - User ID
 * @param {Object} sessionData - { sign, accuracy, attempts }
 * @returns {Promise<void>}
 */
export async function savePracticeSession(userId, sessionData) {
    try {
        console.log('📝 Saving practice session:', userId, sessionData);

        const userRef = doc(db, COLLECTIONS.USERS, userId);

        const practiceEntry = {
            ...sessionData,
            timestamp: Timestamp.now(),
        };

        await updateDoc(userRef, {
            practiceHistory: arrayUnion(practiceEntry),
            'progress.lastPractice': serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Award XP for practice session
        const xpResult = await awardPracticeXP(userId, sessionData.accuracy || 0, sessionData.sign);

        console.log('✅ Practice session saved successfully');
        console.log(`⭐ XP awarded: +${xpResult.xpGained}`);

        return xpResult;
    } catch (error) {
        console.error('❌ Error saving practice session:', error.message);
        throw new Error('Failed to save practice session.');
    }
}

/**
 * Add learned sign to user's collection
 * 
 * @param {string} userId - User ID
 * @param {string} signId - Sign ID
 * @returns {Promise<boolean>} True if new sign, false if already learned
 */
export async function addLearnedSign(userId, signId) {
    try {
        console.log('📝 Adding learned sign:', userId, signId);

        // First check if sign is already learned
        const userProfile = await getUserProfile(userId);

        if (userProfile?.learnedSigns?.includes(signId)) {
            console.log('ℹ️ Sign already learned');
            return { isNew: false, xpResult: null };
        }

        const userRef = doc(db, COLLECTIONS.USERS, userId);

        await updateDoc(userRef, {
            learnedSigns: arrayUnion(signId),
            'progress.totalSigns': (userProfile?.progress?.totalSigns || 0) + 1,
            updatedAt: serverTimestamp(),
        });

        // Award XP for learning a new sign
        const xpDetail = signId.length === 1 ? `Learned letter ${signId}` : `Learned sign ${signId}`;
        const xpResult = await addXP(userId, XP_SOURCES.SIGN_LEARNED.amount, 'SIGN_LEARNED', xpDetail);

        // Check if any milestones are completed
        const newSignCount = (userProfile?.learnedSigns?.length || 0) + 1;
        const milestoneResult = await checkAndAwardMilestones(userId, newSignCount);

        console.log('✅ Learned sign added successfully');
        console.log(`⭐ XP awarded: +${XP_SOURCES.SIGN_LEARNED.amount} for learning ${signId}`);

        // Return the most significant XP result (milestone XP if leveled up, otherwise sign XP)
        const finalXpResult = milestoneResult?.xpResult?.leveledUp
            ? milestoneResult.xpResult
            : xpResult;

        return {
            isNew: true,
            xpResult: finalXpResult,
            milestoneResult
        };
    } catch (error) {
        console.error('❌ Error adding learned sign:', error.message);
        throw new Error('Failed to add learned sign.');
    }
}

/**
 * Remove learned sign from user's collection
 * 
 * @param {string} userId - User ID
 * @param {string} signId - Sign ID
 * @returns {Promise<boolean>} True if removed, false if not in collection
 */
export async function removeLearnedSign(userId, signId) {
    try {
        console.log('📝 Removing learned sign:', userId, signId);

        // First check if sign is in the learned list
        const userProfile = await getUserProfile(userId);

        if (!userProfile?.learnedSigns?.includes(signId)) {
            console.log('ℹ️ Sign not in learned list');
            return false;
        }

        const userRef = doc(db, COLLECTIONS.USERS, userId);

        // Filter out the sign from the array
        const updatedLearnedSigns = userProfile.learnedSigns.filter(s => s !== signId);

        await updateDoc(userRef, {
            learnedSigns: updatedLearnedSigns,
            'progress.totalSigns': Math.max((userProfile?.progress?.totalSigns || 1) - 1, 0),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Learned sign removed successfully');
        return true;
    } catch (error) {
        console.error('❌ Error removing learned sign:', error.message);
        throw new Error('Failed to remove learned sign.');
    }
}

/**
 * Update user's average accuracy from practice history
 * 
 * @param {string} userId - User ID
 * @returns {Promise<number>} New average accuracy
 */
export async function updateAccuracyAverage(userId) {
    try {
        console.log('📊 Updating accuracy average:', userId);

        const userProfile = await getUserProfile(userId);
        const practiceHistory = userProfile?.practiceHistory || [];

        if (practiceHistory.length === 0) {
            console.log('ℹ️ No practice history, accuracy remains 0');
            return 0;
        }

        const totalAccuracy = practiceHistory.reduce((sum, session) => {
            return sum + (session.accuracy || 0);
        }, 0);

        const averageAccuracy = Math.round(totalAccuracy / practiceHistory.length);

        const userRef = doc(db, COLLECTIONS.USERS, userId);
        await updateDoc(userRef, {
            'progress.accuracy': averageAccuracy,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Accuracy average updated:', averageAccuracy);
        return averageAccuracy;
    } catch (error) {
        console.error('❌ Error updating accuracy average:', error.message);
        throw new Error('Failed to update accuracy.');
    }
}

/**
 * Update user's streak based on practice dates
 * 
 * @param {string} userId - User ID
 * @returns {Promise<number>} New streak value
 */
export async function updateStreak(userId) {
    try {
        console.log('🔥 Updating streak:', userId);

        const userProfile = await getUserProfile(userId);
        const lastPractice = userProfile?.progress?.lastPractice;
        const currentStreak = userProfile?.progress?.streak || 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let newStreak = 1;

        if (lastPractice) {
            const lastPracticeDate = lastPractice instanceof Date
                ? lastPractice
                : lastPractice.toDate?.() || new Date(lastPractice);

            lastPracticeDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((today - lastPracticeDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day, keep current streak
                newStreak = currentStreak;
                console.log('ℹ️ Same day practice, streak unchanged:', newStreak);
            } else if (daysDiff === 1) {
                // Consecutive day, increment streak
                newStreak = currentStreak + 1;
                console.log('🔥 Consecutive day! New streak:', newStreak);
            } else {
                // Gap in practice, reset streak
                newStreak = 1;
                console.log('⚠️ Streak broken, reset to 1');
            }
        }

        const userRef = doc(db, COLLECTIONS.USERS, userId);
        await updateDoc(userRef, {
            'progress.streak': newStreak,
            'progress.lastPractice': serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Streak updated:', newStreak);
        return newStreak;
    } catch (error) {
        console.error('❌ Error updating streak:', error.message);
        throw new Error('Failed to update streak.');
    }
}

// ============================================
// SIGNS OPERATIONS
// ============================================

/**
 * Get all signs from Firestore
 * 
 * @returns {Promise<Array>} Array of sign objects
 */
export async function getAllSigns() {
    try {
        console.log('📖 Fetching all signs...');

        const signsRef = collection(db, COLLECTIONS.SIGNS);
        const signsSnap = await getDocs(signsRef);

        const signs = signsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(`✅ Fetched ${signs.length} signs`);
        return signs;
    } catch (error) {
        console.error('❌ Error fetching signs:', error.message);
        throw new Error('Failed to fetch signs.');
    }
}

/**
 * Get sign by ID
 * 
 * @param {string} signId - Sign ID
 * @returns {Promise<Object|null>} Sign object or null
 */
export async function getSignById(signId) {
    try {
        console.log('📖 Fetching sign:', signId);

        const signRef = doc(db, COLLECTIONS.SIGNS, signId);
        const signSnap = await getDoc(signRef);

        if (signSnap.exists()) {
            console.log('✅ Sign fetched successfully');
            return {
                id: signSnap.id,
                ...signSnap.data(),
            };
        }

        console.log('⚠️ Sign not found');
        return null;
    } catch (error) {
        console.error('❌ Error fetching sign:', error.message);
        throw new Error('Failed to fetch sign.');
    }
}

/**
 * Get signs by category
 * 
 * @param {string} category - Category (alphabet, numbers, words)
 * @returns {Promise<Array>} Array of sign objects
 */
export async function getSignsByCategory(category) {
    try {
        console.log('📖 Fetching signs by category:', category);

        const signsRef = collection(db, COLLECTIONS.SIGNS);
        const q = query(signsRef, where('category', '==', category));
        const signsSnap = await getDocs(q);

        const signs = signsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(`✅ Fetched ${signs.length} signs in category "${category}"`);
        return signs;
    } catch (error) {
        console.error('❌ Error fetching signs by category:', error.message);
        throw new Error('Failed to fetch signs.');
    }
}

// ============================================
// ACHIEVEMENTS OPERATIONS
// ============================================

/**
 * Get all achievement definitions
 * 
 * @returns {Promise<Array>} Array of achievement objects
 */
export async function getAllAchievements() {
    try {
        console.log('📖 Fetching all achievements...');

        const achievementsRef = collection(db, COLLECTIONS.ACHIEVEMENTS);
        const achievementsSnap = await getDocs(achievementsRef);

        const achievements = achievementsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(`✅ Fetched ${achievements.length} achievements`);
        return achievements;
    } catch (error) {
        console.error('❌ Error fetching achievements:', error.message);
        throw new Error('Failed to fetch achievements.');
    }
}

/**
 * Unlock achievement for user
 * 
 * @param {string} userId - User ID
 * @param {string} achievementId - Achievement ID
 * @returns {Promise<void>}
 */
export async function unlockAchievement(userId, achievementId) {
    try {
        console.log('🏆 Unlocking achievement:', userId, achievementId);

        const userRef = doc(db, COLLECTIONS.USERS, userId);

        const achievementEntry = {
            id: achievementId,
            unlockedAt: Timestamp.now(),
        };

        await updateDoc(userRef, {
            achievements: arrayUnion(achievementEntry),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Achievement unlocked successfully');
    } catch (error) {
        console.error('❌ Error unlocking achievement:', error.message);
        throw new Error('Failed to unlock achievement.');
    }
}

// ============================================
// SENTENCES OPERATIONS
// ============================================

/**
 * Save practiced sentence
 * 
 * @param {string} userId - User ID
 * @param {Object} sentenceData - { text, words, practiced }
 * @returns {Promise<void>}
 */
export async function savePracticedSentence(userId, sentenceData) {
    try {
        console.log('📝 Saving practiced sentence:', userId);

        const userRef = doc(db, COLLECTIONS.USERS, userId);

        const sentenceEntry = {
            ...sentenceData,
            practicedAt: Timestamp.now(),
        };

        await updateDoc(userRef, {
            sentences: arrayUnion(sentenceEntry),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Sentence saved successfully');
    } catch (error) {
        console.error('❌ Error saving sentence:', error.message);
        throw new Error('Failed to save sentence.');
    }
}

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

export const getUserProgress = getUserProfile;
export const setUserProfile = createUserProfile;
export const updateUserProgress = updateUserProfile;
export const getLessons = async () => [];
export const getLessonById = async () => null;
export const getSignsForLesson = getAllSigns;
export const getUserAchievements = async (userId) => {
    const profile = await getUserProfile(userId);
    return profile?.achievements || [];
};
export const recordPracticeSession = savePracticeSession;

