/**
 * Notification Center Component
 * In-app notification system with bell icon and dropdown
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    X,
    Check,
    CheckCheck,
    Trophy,
    Flame,
    Star,
    Target,
    Clock,
    AlertTriangle,
    Trash2
} from 'lucide-react';

// Notification types with icons and colors
const NOTIFICATION_TYPES = {
    achievement: { icon: Trophy, color: 'text-warning', bg: 'bg-warning/10' },
    streak_warning: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    streak_milestone: { icon: Flame, color: 'text-warning', bg: 'bg-warning/10' },
    level_up: { icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
    daily_challenge: { icon: Target, color: 'text-success', bg: 'bg-success/10' },
    reminder: { icon: Clock, color: 'text-secondary', bg: 'bg-secondary/10' }
};

const NotificationCenter = ({
    notifications = [],
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll,
    onNotificationClick
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.read && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
        if (onNotificationClick) {
            onNotificationClick(notification);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
            >
                <Bell className="w-5 h-5" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-accent rounded-full"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 max-h-[70vh] bg-dark-800 border border-dark-600 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-dark-700">
                            <h3 className="font-semibold text-dark-100">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && onMarkAllAsRead && (
                                    <button
                                        onClick={onMarkAllAsRead}
                                        className="text-xs text-primary hover:text-primary-400 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && onClearAll && (
                                    <button
                                        onClick={onClearAll}
                                        className="p-1 text-dark-500 hover:text-dark-300 transition-colors"
                                        title="Clear all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="overflow-y-auto max-h-[60vh]">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                                    <p className="text-dark-500">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification, index) => {
                                    const type = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.reminder;
                                    const Icon = type.icon;

                                    return (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`
                        flex gap-3 p-3 cursor-pointer transition-colors
                        border-b border-dark-700 last:border-b-0
                        ${notification.read ? 'bg-dark-800' : 'bg-dark-700/50'}
                        hover:bg-dark-700
                      `}
                                        >
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${type.bg} flex items-center justify-center`}>
                                                <Icon className={`w-5 h-5 ${type.color}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${notification.read ? 'text-dark-300' : 'text-dark-100 font-medium'}`}>
                                                    {notification.title}
                                                </p>
                                                {notification.message && (
                                                    <p className="text-xs text-dark-500 truncate mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                )}
                                                <span className="text-xs text-dark-600 mt-1 block">
                                                    {formatTime(notification.timestamp)}
                                                </span>
                                            </div>

                                            {/* Read Indicator */}
                                            {!notification.read && (
                                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * Toast Notification Component
 * For temporary popup notifications
 */
export const NotificationToast = ({
    isVisible,
    notification,
    onClose,
    duration = 5000
}) => {
    useEffect(() => {
        if (isVisible && notification) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, notification, duration, onClose]);

    if (!notification) return null;

    const type = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.reminder;
    const Icon = type.icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className="fixed top-4 left-1/2 z-50"
                >
                    <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl
            bg-dark-800 border border-dark-600
            shadow-xl shadow-dark-900/50
          `}>
                        <div className={`w-8 h-8 rounded-full ${type.bg} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${type.color}`} />
                        </div>
                        <div>
                            <p className="font-medium text-dark-100">{notification.title}</p>
                            {notification.message && (
                                <p className="text-sm text-dark-400">{notification.message}</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-2 p-1 text-dark-500 hover:text-dark-300 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationCenter;
