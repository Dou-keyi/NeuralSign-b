/**
 * Challenge Service
 * Manages daily challenges and challenge completion
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { doc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getUserProfile, COLLECTIONS } from './database';
import { addXP } from './xpService';

// ============================================
// CHALLENGE DEFINITIONS
// ============================================

const CHALLENGE_TYPES = {
    MONDAY: {
        type: 'accuracy',
        title: 'Perfect Monday',
        description: 'Get 3 signs with 100% accuracy',
        criteria: { type: 'accuracy', count: 3, minAccuracy: 100 },
        reward: { xp: 50, badge: null }
    },
    TUESDAY: {
        type: 'speed',
        title: 'Speed Tuesday',
        description: 'Complete 5 signs in under 2 minutes',
        criteria: { type: 'speed', count: 5, timeLimit: 120 },
        reward: { xp: 50, badge: 'speed_demon' }
    },
    WEDNESDAY: {
        type: 'review',
        title: 'Review Wednesday',
        description: 'Practice 5 signs you haven\'t practiced this week',
        criteria: { type: 'review', count: 5 },
        reward: { xp: 40, badge: null }
    },
    THURSDAY: {
        type: 'streak',
        title: 'Streak Thursday',
        description: 'Maintain or extend your learning streak',
        criteria: { type: 'streak', maintain: true },
        reward: { xp: 30, badge: null }
    },
    FRIDAY: {
        type: 'flashcard',
        title: 'Flashcard Friday',
        description: 'Complete 10 flashcard rounds with 80%+ accuracy',
        criteria: { type: 'flashcard', count: 10, minAccuracy: 80 },
        reward: { xp: 60, badge: null }
    },
    SATURDAY: {
        type: 'practice',
        title: 'Practice Saturday',
        description: 'Spend at least 10 minutes practicing',
        criteria: { type: 'practice', minutes: 10 },
        reward: { xp: 50, badge: null }
    },
    SUNDAY: {
        type: 'personal_best',
        title: 'Challenge Sunday',
        description: 'Beat your personal best in Timed Challenge',
        criteria: { type: 'personal_best' },
        reward: { xp: 75, badge: 'challenger' }
    }
};

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

// ============================================
// CHALLENGE FUNCTIONS
// ============================================

/**
 * Get today's challenge
 * 
 * @returns {Object} Today's challenge object
 */
export function getTodayChallenge() {
    const today = new Date();
    const dayOfWeek = DAYS_OF_WEEK[today.getDay()];
    const challengeTemplate = CHALLENGE_TYPES[dayOfWeek];

    // Generate unique ID for today
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    return {
        id: dateStr,
        date: dateStr,
        dayOfWeek,
        ...challengeTemplate
    };
}

/**
 * Check if a practice session completes the daily challenge
 * 
 * @param {string} userId - User ID
 * @param {string} challengeId - Challenge ID (date string)
 * @param {Object} practiceData - Practice session data
 * @returns {Promise<Object>} Result with completion status and reward
 */
export async function checkChallengeCompletion(userId, challengeId, practiceData) {
    try {
        const challenge = getTodayChallenge();

        // Make sure we're checking the right challenge
        if (challenge.id !== challengeId) {
            return { completed: false, reason: 'Challenge date mismatch' };
        }

        // Check if already completed
        const userProfile = await getUserProfile(userId);
        const alreadyCompleted = userProfile?.completedChallenges?.some(
            c => c.challengeId === challengeId
        );

        if (alreadyCompleted) {
            return { completed: false, reason: 'Already completed today' };
        }

        // Check criteria based on challenge type
        let meetsRequirements = false;

        switch (challenge.criteria.type) {
            case 'accuracy':
                meetsRequirements = practiceData.accuracy >= challenge.criteria.minAccuracy;
                break;

            case 'speed':
                meetsRequirements = practiceData.signsCompleted >= challenge.criteria.count &&
                    practiceData.duration <= challenge.criteria.timeLimit;
                break;

            case 'streak':
                meetsRequirements = userProfile?.progress?.streak > 0;
                break;

            case 'flashcard':
                meetsRequirements = practiceData.roundsCompleted >= challenge.criteria.count &&
                    practiceData.accuracy >= challenge.criteria.minAccuracy;
                break;

            case 'practice':
                meetsRequirements = (practiceData.duration / 60) >= challenge.criteria.minutes;
                break;

            case 'personal_best':
                meetsRequirements = practiceData.isPersonalBest === true;
                break;

            case 'review':
                meetsRequirements = practiceData.uniqueSignsPracticed >= challenge.criteria.count;
                break;

            default:
                meetsRequirements = false;
        }

        if (meetsRequirements) {
            // Mark challenge as completed and award XP
            const xpResult = await markChallengeCompleted(userId, challengeId, challenge.reward);

            return {
                completed: true,
                reward: challenge.reward,
                message: `Challenge completed! +${challenge.reward.xp} XP`,
                xpResult // Include level-up info if applicable
            };
        }

        return { completed: false, reason: 'Criteria not met' };

    } catch (error) {
        console.error('❌ Error checking challenge completion:', error);
        return { completed: false, error: error.message };
    }
}

/**
 * Mark a challenge as completed and award XP
 * 
 * @param {string} userId - User ID
 * @param {string} challengeId - Challenge ID
 * @param {Object} reward - Reward object
 * @returns {Promise<Object>} XP result including level-up info
 */
async function markChallengeCompleted(userId, challengeId, reward) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);

        const completedChallenge = {
            challengeId,
            completedAt: Timestamp.now(),
            reward
        };

        // Record the completed challenge
        await updateDoc(userRef, {
            completedChallenges: arrayUnion(completedChallenge),
            updatedAt: serverTimestamp()
        });

        // Award XP using the xpService (handles leveling automatically)
        const xpResult = await addXP(userId, reward.xp, 'DAILY_CHALLENGE');

        console.log('✅ Challenge marked as completed:', challengeId);
        console.log(`⭐ XP awarded: +${reward.xp} (Total: ${xpResult.newTotal})`);

        if (xpResult.leveledUp) {
            console.log(`🎉 Level up! Now level ${xpResult.newLevelNum}`);
        }

        return xpResult;

    } catch (error) {
        console.error('❌ Error marking challenge completed:', error);
        throw error;
    }
}

/**
 * Get user's progress on today's challenge
 * 
 * @param {string} userId - User ID
 * @param {string} challengeId - Challenge ID
 * @returns {Promise<number>} Progress percentage (0-1)
 */
export async function getChallengeProgress(userId, challengeId) {
    try {
        const userProfile = await getUserProfile(userId);

        if (!userProfile) return 0;

        // Check if already completed
        const completed = userProfile?.completedChallenges?.some(
            c => c.challengeId === challengeId
        );

        if (completed) return 1;

        // Calculate progress based on today's practice
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysPractice = userProfile?.practiceHistory?.filter(session => {
            const sessionDate = session.timestamp?.toDate?.() || new Date(session.timestamp);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime();
        }) || [];

        const challenge = getTodayChallenge();

        // Calculate progress based on challenge type
        switch (challenge.criteria.type) {
            case 'accuracy':
                const perfectSigns = todaysPractice.filter(s => s.accuracy >= 100).length;
                return Math.min(perfectSigns / challenge.criteria.count, 1);

            case 'speed':
            case 'flashcard':
                return Math.min(todaysPractice.length / challenge.criteria.count, 1);

            case 'streak':
                return userProfile?.progress?.streak > 0 ? 1 : 0;

            case 'practice':
                // Rough estimate: each session is about 2 minutes
                const estimatedMinutes = todaysPractice.length * 2;
                return Math.min(estimatedMinutes / challenge.criteria.minutes, 1);

            case 'review':
                const uniqueSigns = new Set(todaysPractice.map(s => s.sign)).size;
                return Math.min(uniqueSigns / challenge.criteria.count, 1);

            default:
                return 0;
        }

    } catch (error) {
        console.error('❌ Error getting challenge progress:', error);
        return 0;
    }
}

/**
 * Get user's challenge history
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of completed challenges
 */
export async function getUserChallengeHistory(userId) {
    try {
        const userProfile = await getUserProfile(userId);
        return userProfile?.completedChallenges || [];
    } catch (error) {
        console.error('❌ Error getting challenge history:', error);
        return [];
    }
}

/**
 * Get challenge streak (consecutive days completed)
 * 
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of consecutive days
 */
export async function getChallengeStreak(userId) {
    try {
        const history = await getUserChallengeHistory(userId);

        if (history.length === 0) return 0;

        // Sort by date descending
        const sortedHistory = [...history].sort((a, b) => {
            const dateA = new Date(a.challengeId);
            const dateB = new Date(b.challengeId);
            return dateB - dateA;
        });

        // Count consecutive days
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedHistory.length; i++) {
            const challengeDate = new Date(sortedHistory[i].challengeId);
            challengeDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);
            expectedDate.setHours(0, 0, 0, 0);

            if (challengeDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else {
                break;
            }
        }

        return streak;

    } catch (error) {
        console.error('❌ Error getting challenge streak:', error);
        return 0;
    }
}

export default {
    getTodayChallenge,
    checkChallengeCompletion,
    getChallengeProgress,
    getUserChallengeHistory,
    getChallengeStreak
};
