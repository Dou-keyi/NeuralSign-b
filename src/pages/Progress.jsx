/**
 * Progress Page
 * Track learning progress, achievements, and streaks
 * Enhanced with real data and charts
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Flame,
    Target,
    Clock,
    Zap,
    BookOpen,
    Award,
    ChevronRight
} from 'lucide-react';


// Components
import PageContainer from '@/components/layout/PageContainer';
import StatsCard from '@/components/progress/StatsCard';
import AccuracyChart from '@/components/progress/AccuracyChart';
import LearningProgressChart from '@/components/progress/LearningProgressChart';
import ActivityHeatmap from '@/components/progress/ActivityHeatmap';
import LearningPath from '@/components/learning/LearningPath';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import XPBar from '@/components/xp/XPBar';
import RankCard from '@/components/leaderboard/RankCard';
import BadgeUnlockModal from '@/components/badges/BadgeUnlockModal';
import BadgeCollection from '@/components/badges/BadgeCollection';

// Services
import { getUserAchievements } from '@/services/database';
import { checkAndUnlockAchievements } from '@/services/achievementService';
import { subscribeToLeaderboard, findUserRank } from '@/services/leaderboardService';

// Store
import useAuthStore from '@/store/authStore';

// Data
import { alphabetSigns } from '@/data/signsData';
import { achievements as ACHIEVEMENT_DEFINITIONS, LEGACY_ID_MAP } from '@/data/achievements';

/**
 * Sign Mastery Grid Component
 */
const SignMasteryGrid = ({ learnedSigns = [], practiceHistory = [] }) => {
    // Calculate mastery level for each letter
    const masteryLevels = useMemo(() => {
        const levels = {};

        alphabetSigns.forEach(sign => {
            const sessions = practiceHistory.filter(s => s.sign === sign.letter);
            const isLearned = learnedSigns.includes(sign.letter);

            if (!isLearned) {
                levels[sign.letter] = 0; // Not learned
            } else if (sessions.length === 0) {
                levels[sign.letter] = 1; // Just learned
            } else {
                const avgAccuracy = sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.length;
                if (avgAccuracy >= 90) levels[sign.letter] = 4; // Mastered
                else if (avgAccuracy >= 70) levels[sign.letter] = 3; // Proficient
                else if (avgAccuracy >= 50) levels[sign.letter] = 2; // Learning
                else levels[sign.letter] = 1; // Needs practice
            }
        });

        return levels;
    }, [learnedSigns, practiceHistory]);

    const getMasteryColor = (level) => {
        switch (level) {
            case 4: return 'bg-success text-white';
            case 3: return 'bg-primary text-white';
            case 2: return 'bg-secondary/50 text-white';
            case 1: return 'bg-warning/30 text-warning';
            default: return 'bg-dark-700 text-dark-500';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-dark-100">Sign Mastery</h3>
                </div>
                <span className="text-sm text-dark-400">
                    {learnedSigns.length}/26 learned
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-13 gap-1 mb-4">
                {alphabetSigns.map((sign, idx) => (
                    <motion.div
                        key={sign.letter}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.35 + idx * 0.02 }}
                        className={`
                            aspect-square rounded flex items-center justify-center
                            text-xs font-bold transition-all cursor-default
                            ${getMasteryColor(masteryLevels[sign.letter])}
                        `}
                        title={`${sign.letter}: ${['Not learned', 'Needs practice', 'Learning', 'Proficient', 'Mastered'][masteryLevels[sign.letter]]}`}
                    >
                        {sign.letter}
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-dark-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-dark-700" />
                    <span>Not learned</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-warning/30" />
                    <span>Needs practice</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-secondary/50" />
                    <span>Learning</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-primary" />
                    <span>Proficient</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-success" />
                    <span>Mastered</span>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Achievements Section Component
 */


/**
 * Progress Page Component
 */
const Progress = () => {
    const navigate = useNavigate();
    const { user, userData, isLoading } = useAuthStore();
    const [achievements, setAchievements] = useState([]);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState([]);

    // Leaderboard state for real-time ranking
    const [userRank, setUserRank] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);

    // Subscribe to real-time leaderboard for user ranking
    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = subscribeToLeaderboard('xp', (leaderboardData) => {
            setTotalUsers(leaderboardData.length);
            const rankEntry = findUserRank(user.uid, leaderboardData);
            setUserRank(rankEntry);
        }, 100); // Get top 100 to find user rank

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user?.uid]);

    // Load achievements with sync
    useEffect(() => {
        const syncAndLoad = async () => {
            if (!user?.uid) return;

            try {
                // 1. Force check for new unlocks (handles retroactive unlocks)
                // Pass null to force fetching latest data from DB to ensure we have the most up-to-date progress
                const newUnlocks = await checkAndUnlockAchievements(user.uid, null);

                if (newUnlocks && newUnlocks.length > 0) {
                    setNewlyUnlockedBadges(newUnlocks);
                    setShowUnlockModal(true);
                }

                // 2. Load updated list
                const savedAchievements = await getUserAchievements(user.uid);

                // 3. Normalize legacy IDs
                const normalized = savedAchievements.map(a => {
                    const newId = LEGACY_ID_MAP[a.id] || a.id;
                    return { ...a, id: newId };
                });

                const unique = Array.from(new Map(normalized.map(item => [item.id, item])).values());
                setAchievements(unique);
            } catch (error) {
                console.error("Error syncing achievements:", error);
            }
        };

        syncAndLoad();
    }, [user?.uid, userData]); // Re-run if userData changes (e.g. sign learned)

    // Extract user data
    const learnedSigns = userData?.learnedSigns || [];
    const practiceHistory = userData?.practiceHistory || [];
    // Calculate streak dynamically to match ActivityHeatmap logic
    const streak = useMemo(() => {
        if (!practiceHistory?.length) return 0;

        const sessionsByDay = new Set();
        practiceHistory.forEach(session => {
            const date = session.timestamp?.toDate?.() || new Date(session.timestamp);
            date.setHours(0, 0, 0, 0);
            const dateKey = date.toISOString().split('T')[0];
            sessionsByDay.add(dateKey);
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentStreak = 0;
        // Check up to 365 days back
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const dateKey = d.toISOString().split('T')[0];

            if (sessionsByDay.has(dateKey)) {
                currentStreak++;
            } else if (i > 0) {
                // Determine if streak is broken (allow missing today)
                break;
            }
        }

        return currentStreak;
    }, [practiceHistory]);
    const accuracy = userData?.progress?.accuracy || 0;
    const totalXP = userData?.progress?.totalXP || 0;

    // Calculate practice time (estimate based on sessions, ~2 min per session)
    const practiceMinutes = useMemo(() => {
        return practiceHistory.length * 2;
    }, [practiceHistory]);

    // Calculate trend (compare last 7 days to previous 7 days)
    const accuracyTrend = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const recentSessions = practiceHistory.filter(s => {
            const date = s.timestamp?.toDate?.() || new Date(s.timestamp);
            return date >= weekAgo;
        });

        const olderSessions = practiceHistory.filter(s => {
            const date = s.timestamp?.toDate?.() || new Date(s.timestamp);
            return date >= twoWeeksAgo && date < weekAgo;
        });

        if (olderSessions.length === 0) return 0;

        const recentAvg = recentSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / recentSessions.length || 0;
        const olderAvg = olderSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / olderSessions.length || 0;

        return Math.round(((recentAvg - olderAvg) / (olderAvg || 1)) * 100);
    }, [practiceHistory]);

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner text="Loading your progress..." />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-success/10">
                        <TrendingUp className="w-8 h-8 text-success" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-dark-100">Your Progress</h1>
                        <p className="text-dark-400">Track your learning journey and achievements</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/practice')}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                        Practice Now
                    </Button>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    icon={Target}
                    iconColor="text-success"
                    bgColor="from-success/20 to-success/5"
                    label="Signs Learned"
                    value={learnedSigns.length}
                    subValue="/ 26"
                    delay={0}
                />
                <StatsCard
                    icon={Award}
                    iconColor="text-primary"
                    bgColor="from-primary/20 to-primary/5"
                    label="Accuracy"
                    value={`${accuracy}%`}
                    trend={accuracyTrend}
                    delay={0.05}
                />
                <StatsCard
                    icon={Flame}
                    iconColor="text-warning"
                    bgColor="from-warning/20 to-warning/5"
                    label="Current Streak"
                    value={streak}
                    subValue="days"
                    delay={0.1}
                />
                <StatsCard
                    icon={Clock}
                    iconColor="text-secondary"
                    bgColor="from-secondary/20 to-secondary/5"
                    label="Practice Time"
                    value={practiceMinutes}
                    subValue="mins"
                    delay={0.15}
                />
            </div>

            {/* XP Progress Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8 cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => navigate('/xp-history')}
                title="View XP History"
            >
                <h2 className="text-lg font-semibold text-dark-100 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-warning" />
                    Level Progress
                </h2>
                <XPBar totalXP={totalXP} size="large" />
            </motion.div>

            {/* Leaderboard + Activity Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Leaderboard Section */}
                <div
                    onClick={() => navigate('/leaderboard')}
                    className="cursor-pointer transition-transform hover:scale-[1.01]"
                    title="View full leaderboard"
                >
                    <RankCard
                        rank={userRank?.rank || 0}
                        totalUsers={totalUsers}
                        value={userRank?.xp || totalXP}
                        metric="xp"
                    />
                </div>

                {/* Activity Heatmap */}
                <ActivityHeatmap practiceHistory={practiceHistory} days={90} />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <AccuracyChart data={practiceHistory} height={220} />
                <LearningProgressChart
                    practiceHistory={practiceHistory}
                    learnedSigns={learnedSigns}
                    height={220}
                />
            </div>

            {/* Bottom Row: Mastery + Learning Path */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <SignMasteryGrid
                    learnedSigns={learnedSigns}
                    practiceHistory={practiceHistory}
                />
                <LearningPath learnedSigns={learnedSigns} />
            </div>

            {/* Achievements */}
            <BadgeCollection unlockedAchievements={achievements} />

            {/* Achievement Unlock Modal */}
            <BadgeUnlockModal
                isOpen={showUnlockModal}
                onClose={() => setShowUnlockModal(false)}
                badges={newlyUnlockedBadges}
                onCollect={() => setShowUnlockModal(false)}
            />
        </PageContainer>
    );
};

export default Progress;
