/**
 * Achievement Service
 * Handles checking and unlocking achievements based on user progress
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { getUserProfile, getAllAchievements, unlockAchievement } from './database';
import { addXP, XP_SOURCES } from './xpService';

import { achievements as DEFAULT_ACHIEVEMENTS } from '@/data/achievements';

/**
 * Check and unlock achievements based on user data
 * 
 * @param {string} userId - User ID to check achievements for
 * @param {Object} userData - Optional user data (will be fetched if not provided)
 * @returns {Promise<Array>} Array of newly unlocked achievements
 */
export async function checkAndUnlockAchievements(userId, userData = null) {
    try {
        console.log('🏆 Checking achievements for user:', userId);

        // Get user profile if not provided
        const userProfile = userData || await getUserProfile(userId);

        if (!userProfile) {
            console.error('❌ User profile not found for achievement check');
            return [];
        }

        // Get unlocked achievements
        const unlockedIds = userProfile.achievements || [];
        const unlockedIdsSet = new Set(
            unlockedIds.map(a => typeof a === 'string' ? a : a.id)
        );
        console.log('🔓 Previously unlocked:', Array.from(unlockedIdsSet));

        // Always use local definitions to ensure consistency with UI
        const definitions = DEFAULT_ACHIEVEMENTS;
        console.log(`📋 Checking against ${definitions.length} achievement definitions`);
        console.log(`👤 User Stats: Signs=${userProfile.learnedSigns?.length || 0}, Sessions=${userProfile.practiceHistory?.length || 0}, Streak=${userProfile.progress?.streak || 0}`);

        const newlyUnlocked = [];

        for (const achievement of definitions) {
            // Skip if already unlocked
            if (unlockedIdsSet.has(achievement.id)) {
                continue;
            }

            // Check if criteria is met
            const isMet = checkAchievementCriteria(achievement, userProfile);

            if (isMet) {
                console.log(`🏆 Unlocking achievement: ${achievement.name}`);

                try {
                    // Unlock in DB
                    await unlockAchievement(userId, achievement.id);

                    // Award XP
                    const xpAmount = achievement.xpReward || XP_SOURCES.ACHIEVEMENT_UNLOCKED.amount;
                    const xpResult = await addXP(
                        userId,
                        xpAmount,
                        'ACHIEVEMENT_UNLOCKED',
                        `Unlocked: ${achievement.name}`
                    );

                    newlyUnlocked.push({
                        ...achievement,
                        xpResult
                    });
                } catch (error) {
                    console.error(`❌ Failed to unlock achievement ${achievement.id}:`, error);
                }
            }
        }

        if (newlyUnlocked.length > 0) {
            console.log(`✅ Unlocked ${newlyUnlocked.length} new achievements`);
        }

        return newlyUnlocked;

    } catch (error) {
        console.error('❌ Error checking achievements:', error);
        return [];
    }
}

/**
 * Check if an achievement's criteria is met
 * 
 * @param {Object} achievement - Achievement definition
 * @param {Object} userProfile - User profile data
 * @returns {boolean} Whether criteria is met
 */
function checkAchievementCriteria(achievement, userProfile) {
    const { criteria } = achievement;

    if (!criteria || !criteria.type) {
        return false;
    }

    const progress = userProfile.progress || {};
    const learnedSigns = userProfile.learnedSigns || [];
    const practiceHistory = userProfile.practiceHistory || [];
    const sentences = userProfile.sentences || [];

    // Debug log for criterion check
    // console.log(`Checking ${achievement.id}: type=${criteria.type}, val=${criteria.value}, userVal=${getValueForCriteria(criteria.type, userProfile)}`);

    switch (criteria.type) {
        // Learning
        case 'signsLearned':
            return learnedSigns.length >= criteria.value;

        case 'signsLearnedInDay': {
            // Check if X signs learned within 24 hours
            // This requires timestamp on learnedSigns usually, but currently learnedSigns is array of strings
            // We can approximate by checking 'updatedAt' if we tracked daily learning count separately
            // For now, fallback to returning false until we track daily learning count
            // Or check practice history for unique signs today?
            // Simplified: check total signs if we don't have daily tracking
            // Use progress.dailySignsLearned if available (we need to track this)
            return (progress.dailySignsLearned || 0) >= criteria.value;
        }

        // Streak
        case 'streak':
            return (progress.streak || 0) >= criteria.value;

        // Practice Sessions
        case 'practiceSessions':
            return practiceHistory.length >= criteria.value;

        case 'perfectSessions': {
            const perfectSessions = practiceHistory.filter(p => p.accuracy === 100);
            return perfectSessions.length >= criteria.value;
        }

        case 'perfectSession': // Alias
            return practiceHistory.some(p => p.accuracy === 100);

        // Accuracy
        case 'averageAccuracy':
            return (progress.accuracy || 0) >= criteria.value;

        case 'consecutivePerfect': {
            // Check for N consecutive perfect sessions in history (sorted by date desc usually?)
            // Assuming practiceHistory is ordered by timestamp asc or desc
            // We need to check the array
            let maxConsecutive = 0;
            let current = 0;
            // Iterate history (assuming appends to end)
            for (const session of practiceHistory) {
                if (session.accuracy === 100) {
                    current++;
                    maxConsecutive = Math.max(maxConsecutive, current);
                } else {
                    current = 0;
                }
            }
            return maxConsecutive >= criteria.value;
        }

        // Speed
        case 'speedChallenge':
            // Need challenge history. userProfile.challengeHistory?
            // For now, check if any challenge met time/signs
            // Fallback false
            return false;

        // Sentences
        case 'sentencesCompleted':
            return sentences.length >= criteria.value;

        // Special (simplified)
        case 'earlyPractice': {
            // Check if any session was between 5am and 8am
            return practiceHistory.some(s => {
                const date = s.timestamp?.toDate?.() || new Date(s.timestamp);
                const hour = date.getHours();
                return hour >= 5 && hour < 8;
            });
        }
        case 'latePractice': {
            // Check if any session was after 10pm (22:00)
            return practiceHistory.some(s => {
                const date = s.timestamp?.toDate?.() || new Date(s.timestamp);
                const hour = date.getHours();
                return hour >= 22;
            });
        }
        case 'weekendPractice': {
            // Check if practice on Sat (6) and Sun (0)
            const hasSat = practiceHistory.some(s => {
                const param = s.timestamp?.toDate?.() || new Date(s.timestamp);
                return param.getDay() === 6;
            });
            const hasSun = practiceHistory.some(s => {
                const param = s.timestamp?.toDate?.() || new Date(s.timestamp);
                return param.getDay() === 0;
            });
            return hasSat && hasSun;
        }
        case 'dailyChallenges':
            // Need challenge tracking
            return (progress.challengesCompleted || 0) >= criteria.value;

        // Word sign achievements
        case 'wordsLearned': {
            const wordsProgress = userProfile.wordsProgress || {};
            const learnedWordsList = wordsProgress.learned || [];
            return learnedWordsList.length >= criteria.value;
        }

        case 'categoryComplete': {
            const wp = userProfile.wordsProgress || {};
            const catProgress = wp.categoryProgress || {};
            const completedCategories = Object.values(catProgress)
                .filter(c => c.percentage === 100).length;
            return completedCategories >= criteria.value;
        }

        case 'wordAccuracy90': {
            const wp2 = userProfile.wordsProgress || {};
            const accData = wp2.accuracy || {};
            const highAccuracyCount = Object.values(accData)
                .filter(a => a.avg >= 90).length;
            return highAccuracyCount >= criteria.value;
        }

        case 'allCategoriesStarted': {
            const wp3 = userProfile.wordsProgress || {};
            const catProg = wp3.categoryProgress || {};
            const startedCategories = Object.values(catProg)
                .filter(c => c.learned > 0).length;
            return startedCategories >= criteria.value;
        }

        default:
            console.warn(`⚠️ Unknown criteria type: ${criteria.type}`);
            return false;
    }
}

/**
 * Get all achievement definitions
 * 
 * @returns {Promise<Array>} Array of achievement definitions
 */
export async function getAchievementDefinitions() {
    // Always return default achievements to ensure consistency
    return DEFAULT_ACHIEVEMENTS;
}

/**
 * Get user's unlocked achievements with full details
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of unlocked achievements with details
 */
export async function getUserAchievementsWithDetails(userId) {
    if (!userId) return [];

    try {
        const profile = await getUserProfile(userId);
        const userAchievements = profile?.achievements || [];
        // Always use local definitions
        const definitions = DEFAULT_ACHIEVEMENTS;

        // Map unlocked achievements to their definitions
        return userAchievements.map(ua => {
            const definition = definitions.find(a => a.id === ua.id);
            return {
                ...definition,
                ...ua,
                unlockedAt: ua.unlockedAt?.toDate?.() || ua.unlockedAt
            };
        });
    } catch (error) {
        console.error('❌ Error getting user achievements:', error);
        return [];
    }
}

export default {
    checkAndUnlockAchievements,
    getAchievementDefinitions,
    getUserAchievementsWithDetails
};
