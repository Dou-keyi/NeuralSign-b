/**
 * Milestone Service
 * Manages learning path milestones and XP rewards
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './collections';
import { addXP } from './xpService';

// ============================================
// MILESTONE DEFINITIONS
// ============================================

export const MILESTONES = [
    {
        id: 'beginner',
        title: 'Beginner',
        description: 'Learn your first 5 signs',
        requirement: 5,
        icon: '🌱',
        xpReward: 50
    },
    {
        id: 'intermediate',
        title: 'Intermediate',
        description: 'Master 13 signs (half the alphabet)',
        requirement: 13,
        icon: '📚',
        xpReward: 100
    },
    {
        id: 'advanced',
        title: 'Advanced',
        description: 'Learn 20 signs with 70%+ accuracy',
        requirement: 20,
        icon: '🎓',
        xpReward: 150
    },
    {
        id: 'expert',
        title: 'Expert',
        description: 'Master all 26 letters',
        requirement: 26,
        icon: '👑',
        xpReward: 250
    }
];

// ============================================
// MILESTONE FUNCTIONS
// ============================================

/**
 * Check and award milestones based on current sign count
 * 
 * @param {string} userId - User ID
 * @param {number} signCount - Current number of learned signs
 * @returns {Promise<Object>} Result with newly completed milestones and XP
 */
export async function checkAndAwardMilestones(userId, signCount) {
    try {
        console.log(`🎯 Checking milestones for ${signCount} signs...`);

        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const userData = userSnap.data();
        const completedMilestones = userData?.completedMilestones || [];

        const newlyCompleted = [];
        let totalXPAwarded = 0;
        let xpResult = null;

        for (const milestone of MILESTONES) {
            // Check if milestone is newly completed
            if (signCount >= milestone.requirement && !completedMilestones.includes(milestone.id)) {
                console.log(`🏆 Milestone completed: ${milestone.title}`);

                // Award XP for milestone
                xpResult = await addXP(userId, milestone.xpReward, `MILESTONE_${milestone.id.toUpperCase()}`, `Achieved: ${milestone.title}`);
                totalXPAwarded += milestone.xpReward;

                // Record milestone completion
                await updateDoc(userRef, {
                    completedMilestones: arrayUnion(milestone.id),
                    updatedAt: serverTimestamp()
                });

                newlyCompleted.push({
                    ...milestone,
                    xpResult
                });
            }
        }

        if (newlyCompleted.length > 0) {
            console.log(`✅ Awarded ${totalXPAwarded} XP for ${newlyCompleted.length} milestone(s)`);
        }

        return {
            newlyCompleted,
            totalXPAwarded,
            xpResult: newlyCompleted.length > 0 ? newlyCompleted[newlyCompleted.length - 1].xpResult : null
        };

    } catch (error) {
        console.error('❌ Error checking milestones:', error);
        return { newlyCompleted: [], totalXPAwarded: 0, xpResult: null };
    }
}

/**
 * Get user's completed milestones
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of completed milestone IDs
 */
export async function getCompletedMilestones(userId) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return [];
        }

        return userSnap.data()?.completedMilestones || [];
    } catch (error) {
        console.error('❌ Error getting completed milestones:', error);
        return [];
    }
}

/**
 * Get milestone info by ID
 * 
 * @param {string} milestoneId - Milestone ID
 * @returns {Object|null} Milestone info or null
 */
export function getMilestoneById(milestoneId) {
    return MILESTONES.find(m => m.id === milestoneId) || null;
}

export default {
    MILESTONES,
    checkAndAwardMilestones,
    getCompletedMilestones,
    getMilestoneById
};
