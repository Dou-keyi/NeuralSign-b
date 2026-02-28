/**
 * Leaderboard Service
 * Fetches and caches leaderboard data from Firestore with realtime updates
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './collections';

/**
 * Get leaderboard data based on metric type
 * 
 * @param {string} metric - 'xp' | 'signs' | 'streak' | 'weekly'
 * @param {number} maxUsers - Maximum users to fetch (default 50)
 * @returns {Promise<Array>} Sorted array of user leaderboard entries
 */
export async function getLeaderboard(metric = 'xp', maxUsers = 50) {
    try {
        console.log('🏆 Fetching leaderboard:', metric);

        const usersRef = collection(db, COLLECTIONS.USERS);

        // Determine the field to sort by
        let sortField;
        switch (metric) {
            case 'signs':
                sortField = 'progress.totalSigns';
                break;
            case 'streak':
                sortField = 'progress.streak';
                break;
            case 'weekly':
                sortField = 'xp.weeklyXP';
                break;
            case 'xp':
            default:
                sortField = 'xp.total';
                break;
        }

        // Fetch all users and sort client-side to handle missing fields
        const usersSnap = await getDocs(usersRef);

        console.log(`📊 Firestore returned ${usersSnap.docs.length} user documents`);

        const users = usersSnap.docs.map(doc => {
            const data = doc.data();
            console.log(`👤 User ${doc.id}:`, {
                displayName: data.displayName,
                xp: data.xp,
                progress: data.progress,
                learnedSigns: data.learnedSigns,
                streak: data.streak
            });
            return {
                id: doc.id,
                displayName: data.displayName || data.email?.split('@')[0] || 'Anonymous',
                xp: data.xp?.total || data.progress?.totalXP || 0,
                signsLearned: data.learnedSigns?.length || data.progress?.totalSigns || 0,
                streak: data.streak?.current || data.progress?.streak || 0,
                weeklyXP: data.xp?.weeklyXP || 0,
                photoURL: data.photoURL || null,
            };
        });

        // Sort based on metric
        let sortedUsers;
        switch (metric) {
            case 'signs':
                sortedUsers = users.sort((a, b) => b.signsLearned - a.signsLearned);
                break;
            case 'streak':
                sortedUsers = users.sort((a, b) => b.streak - a.streak);
                break;
            case 'weekly':
                sortedUsers = users.sort((a, b) => b.weeklyXP - a.weeklyXP);
                break;
            case 'xp':
            default:
                sortedUsers = users.sort((a, b) => b.xp - a.xp);
                break;
        }

        // Assign ranks and limit results
        const rankedUsers = sortedUsers.slice(0, maxUsers).map((user, index) => ({
            ...user,
            rank: index + 1,
        }));

        console.log(`✅ Fetched ${rankedUsers.length} users for leaderboard`);
        return rankedUsers;
    } catch (error) {
        console.error('❌ Error fetching leaderboard:', error.message);
        throw new Error('Failed to fetch leaderboard data.');
    }
}

/**
 * Subscribe to realtime leaderboard updates
 * 
 * @param {string} metric - 'xp' | 'signs' | 'streak' | 'weekly'
 * @param {Function} onUpdate - Callback when data changes
 * @param {number} maxUsers - Maximum users to fetch
 * @returns {Function} Unsubscribe function
 */
export function subscribeToLeaderboard(metric = 'xp', onUpdate, maxUsers = 50) {
    console.log('📡 Subscribing to realtime leaderboard:', metric);

    const usersRef = collection(db, COLLECTIONS.USERS);

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        console.log(`📡 Realtime: Firestore returned ${snapshot.docs.length} user documents`);

        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log(`👤 Realtime User ${doc.id}:`, {
                displayName: data.displayName,
                xp: data.xp,
                progress: data.progress,
                learnedSigns: data.learnedSigns?.length,
                streak: data.streak
            });
            return {
                id: doc.id,
                displayName: data.displayName || data.email?.split('@')[0] || 'Anonymous',
                xp: data.xp?.total || data.progress?.totalXP || 0,
                signsLearned: data.learnedSigns?.length || data.progress?.totalSigns || 0,
                streak: data.streak?.current || data.progress?.streak || 0,
                weeklyXP: data.xp?.weeklyXP || 0,
                photoURL: data.photoURL || null,
            };
        });

        // Sort based on metric
        let sortedUsers;
        switch (metric) {
            case 'signs':
                sortedUsers = users.sort((a, b) => b.signsLearned - a.signsLearned);
                break;
            case 'streak':
                sortedUsers = users.sort((a, b) => b.streak - a.streak);
                break;
            case 'weekly':
                sortedUsers = users.sort((a, b) => b.weeklyXP - a.weeklyXP);
                break;
            case 'xp':
            default:
                sortedUsers = users.sort((a, b) => b.xp - a.xp);
                break;
        }

        // Assign ranks
        const rankedUsers = sortedUsers.slice(0, maxUsers).map((user, index) => ({
            ...user,
            rank: index + 1,
        }));

        console.log(`📊 Realtime update: ${rankedUsers.length} users`);
        onUpdate(rankedUsers);
    }, (error) => {
        console.error('❌ Leaderboard subscription error:', error.message);
    });

    return unsubscribe;
}

/**
 * Find user's rank in the leaderboard
 * 
 * @param {string} userId - User ID to find
 * @param {Array} leaderboardData - Array of leaderboard entries
 * @returns {Object|null} User's leaderboard entry with rank, or null
 */
export function findUserRank(userId, leaderboardData) {
    const userEntry = leaderboardData.find(entry => entry.id === userId);
    return userEntry || null;
}

export default {
    getLeaderboard,
    subscribeToLeaderboard,
    findUserRank,
};
