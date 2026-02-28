/**
 * XP (Experience Points) & Leveling Service
 * Manages XP gains, level calculations, and level perks
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { doc, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './collections';

// ============================================
// XP CONSTANTS
// ============================================

export const XP_SOURCES = {
    SIGN_LEARNED: { amount: 10, label: 'Learned a sign' },
    PRACTICE_SESSION: { amount: 5, label: 'Practice session' },
    PERFECT_ACCURACY: { amount: 10, label: 'Perfect accuracy bonus' },
    HIGH_ACCURACY: { amount: 5, label: 'High accuracy bonus (90%+)' },
    SENTENCE_COMPLETED: { amount: 15, label: 'Completed sentence' },
    DAILY_CHALLENGE: { amount: 20, label: 'Daily challenge' },
    STREAK_MILESTONE: { amount: 25, label: 'Streak milestone' },
    ACHIEVEMENT_UNLOCKED: { amount: 50, label: 'Achievement unlocked' },
    LEVEL_BONUS: { amount: 50, label: 'Level up bonus' }
};

// Level perks unlocked at specific levels
export const LEVEL_PERKS = {
    5: { name: 'Streak Protector', description: 'One free streak freeze per week', icon: '🛡️' },
    10: { name: 'Leaderboard Access', description: 'Join global leaderboards', icon: '🏆' },
    15: { name: 'Advanced Insights', description: 'Detailed learning analytics', icon: '📊' },
    20: { name: 'Expert Badge', description: 'Exclusive Expert badge', icon: '🎓' },
    25: { name: 'Custom Themes', description: 'Unlock custom app themes', icon: '🎨' },
    30: { name: 'Priority Support', description: 'Access to priority support', icon: '⭐' }
};

// ============================================
// LEVEL CALCULATIONS
// ============================================

/**
 * Calculate XP needed for a specific level
 * Uses exponential formula: 100 * 1.5^(level-1)
 * 
 * @param {number} level - Target level
 * @returns {number} XP required to reach this level
 */
export function xpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Calculate cumulative XP needed to reach a level
 * 
 * @param {number} level - Target level
 * @returns {number} Total XP required
 */
export function cumulativeXpForLevel(level) {
    let total = 0;
    for (let i = 2; i <= level; i++) {
        total += xpForLevel(i);
    }
    return total;
}

/**
 * Calculate current level from total XP
 * 
 * @param {number} totalXP - User's total XP
 * @returns {Object} Level information
 */
export function calculateLevel(totalXP) {
    let level = 1;
    let xpSpent = 0;

    while (true) {
        const xpNeeded = xpForLevel(level + 1);
        if (xpSpent + xpNeeded > totalXP) {
            break;
        }
        xpSpent += xpNeeded;
        level++;
    }

    const currentLevelXP = totalXP - xpSpent;
    const xpForNextLevel = xpForLevel(level + 1);
    const progress = xpForNextLevel > 0 ? (currentLevelXP / xpForNextLevel) * 100 : 100;

    return {
        level,
        currentXP: currentLevelXP,
        xpForNextLevel,
        progress: Math.min(Math.round(progress), 100),
        totalXP,
        xpToNextLevel: xpForNextLevel - currentLevelXP
    };
}

/**
 * Get perks for a specific level
 * 
 * @param {number} level - Current level
 * @returns {Array} Array of unlocked perks
 */
export function getLevelPerks(level) {
    const perks = [];
    for (const [perkLevel, perk] of Object.entries(LEVEL_PERKS)) {
        if (parseInt(perkLevel) <= level) {
            perks.push({ level: parseInt(perkLevel), ...perk });
        }
    }
    return perks;
}

/**
 * Get next perk to unlock
 * 
 * @param {number} level - Current level
 * @returns {Object|null} Next perk info or null
 */
export function getNextPerk(level) {
    const perkLevels = Object.keys(LEVEL_PERKS).map(Number).sort((a, b) => a - b);
    const nextPerkLevel = perkLevels.find(l => l > level);

    if (nextPerkLevel) {
        return {
            level: nextPerkLevel,
            ...LEVEL_PERKS[nextPerkLevel],
            levelsAway: nextPerkLevel - level
        };
    }
    return null;
}

// ============================================
// XP OPERATIONS
// ============================================

/**
 * Add XP to user account
 * 
 * @param {string} userId - User ID
 * @param {number} amount - XP amount to add
 * @param {string} source - Source of XP (from XP_SOURCES)
 * @param {string} details - Optional details (e.g., "Learned 'A'")
 * @returns {Promise<Object>} Result with new total, level info, and level-up status
 */
export async function addXP(userId, amount, source, details = null) {
    try {
        console.log(`⭐ Adding ${amount} XP for ${source}:`, userId);

        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const userData = userSnap.data();
        const currentXP = userData?.xp?.total || 0;
        const oldLevel = calculateLevel(currentXP);
        const newTotal = currentXP + amount;
        const newLevel = calculateLevel(newTotal);

        const xpEntry = {
            amount,
            source,
            timestamp: new Date().toISOString(),
            details // Add details if provided
        };

        // Update user document
        await updateDoc(userRef, {
            'xp.total': newTotal,
            'xp.level': newLevel.level,
            'xp.history': arrayUnion(xpEntry),
            'progress.totalXP': newTotal,
            updatedAt: serverTimestamp()
        });

        const leveledUp = newLevel.level > oldLevel.level;

        console.log(`✅ XP added: ${currentXP} → ${newTotal} (Level ${newLevel.level})`);

        return {
            previousTotal: currentXP,
            newTotal,
            xpGained: amount,
            source,
            levelInfo: newLevel,
            leveledUp,
            oldLevel: oldLevel.level,
            newLevelNum: newLevel.level,
            newPerks: leveledUp ? getNewPerksForLevel(oldLevel.level, newLevel.level) : []
        };
    } catch (error) {
        console.error('❌ Error adding XP:', error);
        throw error;
    }
}

/**
 * Get perks unlocked between two levels
 */
function getNewPerksForLevel(oldLevel, newLevel) {
    const perks = [];
    for (const [perkLevel, perk] of Object.entries(LEVEL_PERKS)) {
        const lvl = parseInt(perkLevel);
        if (lvl > oldLevel && lvl <= newLevel) {
            perks.push({ level: lvl, ...perk });
        }
    }
    return perks;
}

/**
 * Get XP breakdown by source for a time range
 * 
 * @param {string} userId - User ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} XP breakdown by source
 */
export async function getXPBreakdown(userId, days = 7) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { total: 0, breakdown: {} };
        }

        const userData = userSnap.data();
        const history = userData?.xp?.history || [];

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const breakdown = {};
        let total = 0;

        for (const entry of history) {
            const entryDate = new Date(entry.timestamp);
            if (entryDate >= cutoffDate) {
                const source = entry.source || 'unknown';
                breakdown[source] = (breakdown[source] || 0) + entry.amount;
                total += entry.amount;
            }
        }

        return { total, breakdown, days };
    } catch (error) {
        console.error('❌ Error getting XP breakdown:', error);
        return { total: 0, breakdown: {}, days };
    }
}

/**
 * Get user's XP and level info
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} XP and level information
 */
export async function getUserXPInfo(userId) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return calculateLevel(0);
        }

        const userData = userSnap.data();
        const totalXP = userData?.xp?.total || userData?.progress?.totalXP || 0;

        return {
            ...calculateLevel(totalXP),
            perks: getLevelPerks(calculateLevel(totalXP).level),
            nextPerk: getNextPerk(calculateLevel(totalXP).level)
        };
    } catch (error) {
        console.error('❌ Error getting user XP info:', error);
        return calculateLevel(0);
    }
}

/**
 * Award XP for practice session based on accuracy
 * 
 * @param {string} userId - User ID
 * @param {number} accuracy - Session accuracy (0-100)
 * @param {string} sign - The sign/letter practiced (optional)
 * @returns {Promise<Object>} XP result
 */
export async function awardPracticeXP(userId, accuracy, sign = null) {
    let totalXP = XP_SOURCES.PRACTICE_SESSION.amount;
    const sources = ['PRACTICE_SESSION'];

    if (accuracy === 100) {
        totalXP += XP_SOURCES.PERFECT_ACCURACY.amount;
        sources.push('PERFECT_ACCURACY');
    } else if (accuracy >= 90) {
        totalXP += XP_SOURCES.HIGH_ACCURACY.amount;
        sources.push('HIGH_ACCURACY');
    }

    const detailParts = [`Practice Accuracy: ${accuracy}%`];
    if (sign) detailParts.unshift(`Practiced '${sign}'`);

    return addXP(userId, totalXP, sources.join('+'), detailParts.join(' • '));
}

export default {
    XP_SOURCES,
    LEVEL_PERKS,
    xpForLevel,
    cumulativeXpForLevel,
    calculateLevel,
    getLevelPerks,
    getNextPerk,
    addXP,
    getXPBreakdown,
    getUserXPInfo,
    awardPracticeXP
};
