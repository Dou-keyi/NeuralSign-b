/**
 * Notification Service
 * Manages in-app notifications with Firestore integration
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { doc, updateDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './database';

// ============================================
// NOTIFICATION TYPES
// ============================================

export const NOTIFICATION_TYPES = {
    ACHIEVEMENT: 'achievement',
    STREAK_WARNING: 'streak_warning',
    STREAK_MILESTONE: 'streak_milestone',
    LEVEL_UP: 'level_up',
    DAILY_CHALLENGE: 'daily_challenge',
    REMINDER: 'reminder'
};

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Create a new notification for a user
 * 
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification(userId, notification) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);

        const newNotification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: notification.type || NOTIFICATION_TYPES.REMINDER,
            title: notification.title,
            message: notification.message || '',
            data: notification.data || {},
            read: false,
            timestamp: new Date().toISOString(),
            createdAt: serverTimestamp()
        };

        await updateDoc(userRef, {
            notifications: arrayUnion(newNotification),
            updatedAt: serverTimestamp()
        });

        console.log('🔔 Notification created:', newNotification.title);
        return newNotification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        throw error;
    }
}

/**
 * Get notifications for a user
 * 
 * @param {string} userId - User ID
 * @param {number} limit - Maximum notifications to return
 * @returns {Promise<Array>} User's notifications
 */
export async function getNotifications(userId, limit = 50) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return [];
        }

        const userData = userSnap.data();
        const notifications = userData?.notifications || [];

        // Sort by timestamp (newest first) and limit
        return notifications
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    } catch (error) {
        console.error('❌ Error getting notifications:', error);
        return [];
    }
}

/**
 * Mark a notification as read
 * 
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export async function markAsRead(userId, notificationId) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const notifications = userData?.notifications || [];

        const updatedNotifications = notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );

        await updateDoc(userRef, {
            notifications: updatedNotifications,
            updatedAt: serverTimestamp()
        });

        console.log('✓ Notification marked as read:', notificationId);
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Mark all notifications as read
 * 
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function markAllAsRead(userId) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const notifications = userData?.notifications || [];

        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));

        await updateDoc(userRef, {
            notifications: updatedNotifications,
            updatedAt: serverTimestamp()
        });

        console.log('✓ All notifications marked as read');
    } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
        throw error;
    }
}

/**
 * Clear all notifications
 * 
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function clearAllNotifications(userId) {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);

        await updateDoc(userRef, {
            notifications: [],
            updatedAt: serverTimestamp()
        });

        console.log('🗑️ All notifications cleared');
    } catch (error) {
        console.error('❌ Error clearing notifications:', error);
        throw error;
    }
}

/**
 * Get unread notification count
 * 
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount(userId) {
    try {
        const notifications = await getNotifications(userId);
        return notifications.filter(n => !n.read).length;
    } catch (error) {
        console.error('❌ Error getting unread count:', error);
        return 0;
    }
}

// ============================================
// NOTIFICATION CREATORS
// ============================================

/**
 * Create achievement unlocked notification
 */
export async function notifyAchievementUnlocked(userId, achievement) {
    return createNotification(userId, {
        type: NOTIFICATION_TYPES.ACHIEVEMENT,
        title: `Achievement Unlocked: ${achievement.name}!`,
        message: achievement.description,
        data: { achievementId: achievement.id }
    });
}

/**
 * Create streak warning notification
 */
export async function notifyStreakAtRisk(userId, currentStreak) {
    return createNotification(userId, {
        type: NOTIFICATION_TYPES.STREAK_WARNING,
        title: "🔥 Your streak is at risk!",
        message: `Practice today to keep your ${currentStreak} day streak!`,
        data: { streak: currentStreak }
    });
}

/**
 * Create streak milestone notification
 */
export async function notifyStreakMilestone(userId, days) {
    return createNotification(userId, {
        type: NOTIFICATION_TYPES.STREAK_MILESTONE,
        title: `🔥 ${days} Day Streak!`,
        message: `Amazing! You've practiced for ${days} days in a row!`,
        data: { streak: days }
    });
}

/**
 * Create level up notification
 */
export async function notifyLevelUp(userId, newLevel) {
    return createNotification(userId, {
        type: NOTIFICATION_TYPES.LEVEL_UP,
        title: `⭐ Level Up!`,
        message: `Congratulations! You've reached Level ${newLevel}!`,
        data: { level: newLevel }
    });
}

/**
 * Create daily challenge notification
 */
export async function notifyDailyChallenge(userId, challenge) {
    return createNotification(userId, {
        type: NOTIFICATION_TYPES.DAILY_CHALLENGE,
        title: "🎯 Daily Challenge Available!",
        message: challenge.name,
        data: { challengeId: challenge.id }
    });
}

export default {
    NOTIFICATION_TYPES,
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    getUnreadCount,
    notifyAchievementUnlocked,
    notifyStreakAtRisk,
    notifyStreakMilestone,
    notifyLevelUp,
    notifyDailyChallenge
};
