/**
 * Leaderboard Page
 * Global and weekly leaderboards for competitive engagement
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Trophy,
    Medal,
    Crown,
    TrendingUp,
    Users,
    Calendar,
    Flame,
    Star,
    ChevronLeft,
    Filter,
    RefreshCw
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LeaderboardEntry from '@/components/leaderboard/LeaderboardEntry';
import RankCard from '@/components/leaderboard/RankCard';

// Store
import useAuthStore from '@/store/authStore';

// Services
import { subscribeToLeaderboard, getLeaderboard, findUserRank } from '@/services/leaderboardService';

const Leaderboard = () => {
    const navigate = useNavigate();
    const { user, userData } = useAuthStore();

    const [activeTab, setActiveTab] = useState('xp'); // xp, signs, streak, weekly
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRank, setUserRank] = useState(null);

    // Process leaderboard data and mark current user
    const processLeaderboardData = useCallback((data) => {
        const processedData = data.map(entry => ({
            ...entry,
            isCurrentUser: user && entry.id === user.uid,
        }));

        // Find and set user's rank
        if (user) {
            const userEntry = findUserRank(user.uid, processedData);
            setUserRank(userEntry);
        } else {
            setUserRank(null);
        }

        setLeaderboardData(processedData);
        setIsLoading(false);
    }, [user]);

    // Subscribe to realtime leaderboard updates
    useEffect(() => {
        setIsLoading(true);

        // Subscribe to realtime updates
        const unsubscribe = subscribeToLeaderboard(activeTab, processLeaderboardData, 50);

        // Cleanup subscription on unmount or when activeTab changes
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [activeTab, processLeaderboardData]);

    // Manual refresh function
    const loadLeaderboard = async () => {
        setIsLoading(true);
        try {
            const data = await getLeaderboard(activeTab, 50);
            processLeaderboardData(data);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'xp', label: 'Total XP', icon: Star },
        { id: 'signs', label: 'Signs Learned', icon: Trophy },
        { id: 'streak', label: 'Streak', icon: Flame },
        { id: 'weekly', label: 'This Week', icon: Calendar }
    ];

    const getMetricValue = (entry) => {
        switch (activeTab) {
            case 'signs': return entry.signsLearned;
            case 'streak': return entry.streak;
            case 'weekly': return entry.weeklyXP;
            default: return entry.xp;
        }
    };

    const getMetricLabel = () => {
        switch (activeTab) {
            case 'signs': return 'signs';
            case 'streak': return 'days';
            case 'weekly': return 'XP';
            default: return 'XP';
        }
    };

    return (
        <PageContainer>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        leftIcon={<ChevronLeft className="w-4 h-4" />}
                    >
                        Back
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-warning/10">
                        <Trophy className="w-8 h-8 text-warning" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100">Leaderboard</h1>
                        <p className="text-dark-400">Compete with learners worldwide</p>
                    </div>
                </div>
            </motion.div>

            {/* User Rank Card */}
            {userRank && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <RankCard
                        rank={userRank.rank}
                        totalUsers={leaderboardData.length}
                        metric={activeTab}
                        value={getMetricValue(userRank)}
                    />
                </motion.div>
            )}

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex gap-2 mb-6 overflow-x-auto pb-2"
            >
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap
                transition-all font-medium text-sm
                ${activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                }
              `}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}

                <button
                    onClick={loadLeaderboard}
                    className="ml-auto p-2 rounded-lg bg-dark-700 text-dark-300 hover:bg-dark-600 transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </motion.div>

            {/* Leaderboard List */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner text="Loading leaderboard..." />
                    </div>
                ) : leaderboardData.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-dark-300 mb-2">No Data Yet</h3>
                        <p className="text-dark-500">Be the first to climb the leaderboard!</p>
                    </div>
                ) : (
                    <>
                        {/* Top 3 Special Display */}
                        {leaderboardData.slice(0, 3).length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[1, 0, 2].map((index) => {
                                    const entry = leaderboardData[index];
                                    if (!entry) return null;

                                    const isFirst = index === 0;
                                    const colors = [
                                        'from-yellow-500/20 to-amber-600/20 border-yellow-500/30',
                                        'from-gray-400/20 to-gray-500/20 border-gray-400/30',
                                        'from-amber-700/20 to-orange-700/20 border-amber-700/30'
                                    ];

                                    return (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + index * 0.1 }}
                                            className={`
                        relative p-4 rounded-xl text-center
                        bg-gradient-to-b ${colors[entry.rank - 1]}
                        border ${isFirst ? 'md:-mt-4' : ''}
                        ${entry.isCurrentUser ? 'ring-2 ring-primary' : ''}
                      `}
                                        >
                                            <div className="text-3xl mb-2">
                                                {entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : '🥉'}
                                            </div>
                                            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-2 overflow-hidden">
                                                {entry.photoURL ? (
                                                    <img
                                                        src={entry.photoURL}
                                                        alt={entry.displayName}
                                                        className="w-full h-full object-cover"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <span className="text-lg font-bold text-white">
                                                        {entry.displayName.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className={`font-medium truncate ${entry.isCurrentUser ? 'text-primary' : 'text-dark-100'}`}>
                                                {entry.isCurrentUser ? 'You' : entry.displayName}
                                            </h4>
                                            <p className="text-lg font-bold text-dark-200 mt-1">
                                                {getMetricValue(entry).toLocaleString()} {getMetricLabel()}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Rest of Leaderboard */}
                        <div className="glass-card overflow-hidden">
                            {leaderboardData.slice(3).map((entry, index) => (
                                <LeaderboardEntry
                                    key={entry.id}
                                    rank={entry.rank}
                                    displayName={entry.displayName}
                                    photoURL={entry.photoURL}
                                    value={getMetricValue(entry)}
                                    label={getMetricLabel()}
                                    isCurrentUser={entry.isCurrentUser}
                                    index={index}
                                />
                            ))}
                        </div>
                    </>
                )}
            </motion.div>

            {/* Weekly Reset Notice */}
            {activeTab === 'weekly' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-center text-sm text-dark-500"
                >
                    <Calendar className="w-4 h-4 inline-block mr-1" />
                    Weekly leaderboard resets every Monday at midnight
                </motion.div>
            )}
        </PageContainer>
    );
};

export default Leaderboard;
