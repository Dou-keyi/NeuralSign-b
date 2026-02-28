/**
 * Streak Service
 * Manages user practice streaks with rewards and milestone tracking
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './database';

// ============================================
// STREAK MILESTONES & REWARDS
// ============================================

export const STREAK_MILESTONES = {
    3: { xp: 25, badge: 'three_day_streak', name: 'Getting Started' },
    7: { xp: 50, badge: 'week_warrior', name: 'Week Warrior' },
    14: { xp: 75, badge: 'two_week_streak', name: 'Two Week Champion' },
    30: { xp: 150, badge: 'month_master', name: 'Month Master' },
    60: { xp: 250, badge: null, name: 'Two Month Legend' },
    100: { xp: 500, badge: 'unstoppable', name: 'Unstoppable' }
};

// ============================================
// STREAK FUNCTIONS
// ============================================

/**
 * Get streak status for a user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Streak status
 */
export async function getStreakStatus(userId) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return getDefaultStreakStatus();
        }

        const userData = userSnap.data();
        const streak = userData?.streak || {};
        const progress = userData?.progress || {};

        const current = streak.current || progress.streak || 0;
        const longest = streak.longest || current;
        const lastPractice = streak.lastPractice || progress.lastPractice;

        // Calculate if streak is at risk
        const isAtRisk = checkStreakAtRisk(lastPractice);
        const daysUntilReset = calculateDaysUntilReset(lastPractice);

        // Find next milestone
        const milestones = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b);
        const nextMilestone = milestones.find(m => m > current) || null;
        const daysToMilestone = nextMilestone ? nextMilestone - current : 0;

        return {
            current,
            longest,
            lastPractice: lastPractice?.toDate?.() || (lastPractice ? new Date(lastPractice) : null),
            isAtRisk,
            daysUntilReset,
            nextMilestone,
            daysToMilestone,
            achievedMilestones: milestones.filter(m => m <= current),
            isNewRecord: current >= longest && current > 0
        };
    } catch (error) {
        console.error('❌ Error getting streak status:', error);
        return getDefaultStreakStatus();
    }
}

/**
 * Default streak status for new users
 */
function getDefaultStreakStatus() {
    return {
        current: 0,
        longest: 0,
        lastPractice: null,
        isAtRisk: false,
        daysUntilReset: null,
        nextMilestone: 3,
        daysToMilestone: 3,
        achievedMilestones: [],
        isNewRecord: false
    };
}

/**
 * Check if last practice was yesterday (streak at risk)
 */
function checkStreakAtRisk(lastPractice) {
    if (!lastPractice) return false;

    const lastDate = lastPractice?.toDate?.() || new Date(lastPractice);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDateNormalized = new Date(lastDate);
    lastDateNormalized.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastDateNormalized) / (1000 * 60 * 60 * 24));

    // At risk if last practice was yesterday and not yet practiced today
    return daysDiff === 1;
}

/**
 * Calculate days until streak resets
 */
function calculateDaysUntilReset(lastPractice) {
    if (!lastPractice) return null;

    const lastDate = lastPractice?.toDate?.() || new Date(lastPractice);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDateNormalized = new Date(lastDate);
    lastDateNormalized.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastDateNormalized) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return 2; // Practiced today, resets in 2 days if no practice tomorrow
    if (daysDiff === 1) return 1; // Practiced yesterday, resets tomorrow if no practice today
    return 0; // Already reset
}

/**
 * Update streak after practice
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated streak info with any rewards
 */
export async function updateStreak(userId) {
    try {
        console.log('🔥 Updating streak:', userId);

        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const userData = userSnap.data();
        const streak = userData?.streak || {};
        const progress = userData?.progress || {};

        const currentStreak = streak.current || progress.streak || 0;
        const longestStreak = streak.longest || currentStreak;
        const lastPractice = streak.lastPractice || progress.lastPractice;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let newStreak = 1;
        let milestonesReached = [];

        if (lastPractice) {
            const lastDate = lastPractice?.toDate?.() || new Date(lastPractice);
            const lastDateNormalized = new Date(lastDate);
            lastDateNormalized.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((today - lastDateNormalized) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day - keep current streak
                newStreak = currentStreak;
                console.log('ℹ️ Same day practice, streak unchanged:', newStreak);
            } else if (daysDiff === 1) {
                // Consecutive day - increment streak
                newStreak = currentStreak + 1;
                console.log('🔥 Consecutive day! New streak:', newStreak);

                // Check for milestone rewards
                for (const [milestone, reward] of Object.entries(STREAK_MILESTONES)) {
                    if (newStreak === parseInt(milestone)) {
                        milestonesReached.push({
                            days: parseInt(milestone),
                            ...reward
                        });
                    }
                }
            } else {
                // Gap in practice - reset streak
                newStreak = 1;
                console.log('⚠️ Streak broken, reset to 1');
            }
        }

        const newLongest = Math.max(longestStreak, newStreak);
        const achievedMilestones = streak.milestones || [];
        const newMilestones = milestonesReached
            .map(m => m.days)
            .filter(d => !achievedMilestones.includes(d));

        // Update Firestore
        await updateDoc(userRef, {
            'streak.current': newStreak,
            'streak.longest': newLongest,
            'streak.lastPractice': serverTimestamp(),
            'streak.milestones': [...new Set([...achievedMilestones, ...newMilestones])],
            'progress.streak': newStreak,
            'progress.lastPractice': serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        console.log('✅ Streak updated:', newStreak, 'Longest:', newLongest);

        return {
            current: newStreak,
            longest: newLongest,
            previousStreak: currentStreak,
            milestonesReached,
            isNewRecord: newStreak > longestStreak,
            streakBroken: currentStreak > 1 && newStreak === 1
        };
    } catch (error) {
        console.error('❌ Error updating streak:', error);
        throw error;
    }
}

/**
 * Check if streak is at risk (should show warning)
 * 
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Whether streak is at risk
 */
export async function isStreakAtRisk(userId) {
    const status = await getStreakStatus(userId);
    return status.isAtRisk;
}

/**
 * Get streak rewards for a milestone
 * 
 * @param {number} streakDays - Number of streak days
 * @returns {Object|null} Reward info or null
 */
export function getStreakReward(streakDays) {
    return STREAK_MILESTONES[streakDays] || null;
}

/**
 * Get practice history for calendar display
 * 
 * @param {string} userId - User ID
 * @param {number} days - Number of days to fetch
 * @returns {Promise<Object>} Practice dates map
 */
export async function getPracticeCalendar(userId, days = 90) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return {};
        }

        const userData = userSnap.data();
        const practiceHistory = userData?.practiceHistory || [];

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        cutoffDate.setHours(0, 0, 0, 0);

        const calendar = {};

        for (const session of practiceHistory) {
            const sessionDate = session.timestamp?.toDate?.() || new Date(session.timestamp);
            if (sessionDate >= cutoffDate) {
                const dateKey = sessionDate.toISOString().split('T')[0];
                if (!calendar[dateKey]) {
                    calendar[dateKey] = {
                        date: dateKey,
                        sessions: 0,
                        totalAccuracy: 0,
                        signs: []
                    };
                }
                calendar[dateKey].sessions++;
                calendar[dateKey].totalAccuracy += session.accuracy || 0;
                if (session.sign) {
                    calendar[dateKey].signs.push(session.sign);
                }
            }
        }

        // Calculate average accuracy for each day
        for (const day of Object.values(calendar)) {
            day.averageAccuracy = day.sessions > 0
                ? Math.round(day.totalAccuracy / day.sessions)
                : 0;
        }

        return calendar;
    } catch (error) {
        console.error('❌ Error getting practice calendar:', error);
        return {};
    }
}

export default {
    STREAK_MILESTONES,
    getStreakStatus,
    updateStreak,
    isStreakAtRisk,
    getStreakReward,
    getPracticeCalendar
};
