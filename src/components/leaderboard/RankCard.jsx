/**
 * Rank Card Component
 * Displays user's current rank and percentile
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';

const RankCard = ({
    rank,
    totalUsers,
    metric = 'xp',
    value = 0
}) => {
    // Calculate percentile
    const percentile = totalUsers > 0
        ? Math.round(((totalUsers - rank) / totalUsers) * 100)
        : 0;

    // Get encouraging message based on rank
    const getMessage = () => {
        if (rank === 1) return "🎉 You're #1! Amazing!";
        if (rank <= 3) return "🏆 You're on the podium!";
        if (percentile >= 90) return "🌟 Top 10%! Keep it up!";
        if (percentile >= 75) return "💪 You're in the top quarter!";
        if (percentile >= 50) return "📈 Above average! Nice work!";
        return "🚀 Keep practicing to climb higher!";
    };

    // Get rank color
    const getRankColor = () => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-gray-300';
        if (rank === 3) return 'text-amber-600';
        return 'text-primary';
    };

    // Get metric label
    const getMetricLabel = () => {
        switch (metric) {
            case 'signs': return 'signs learned';
            case 'streak': return 'day streak';
            case 'weekly': return 'XP this week';
            default: return 'total XP';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold text-dark-100">Your Ranking</h3>
            </div>

            <div className="flex items-center justify-between gap-6">
                {/* Rank Display */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        {/* Rank Badge */}
                        <div className={`
              absolute -bottom-1 -right-1 
              w-8 h-8 rounded-full 
              bg-dark-800 border-2 border-dark-700
              flex items-center justify-center
            `}>
                            <span className={`text-sm font-bold ${getRankColor()}`}>
                                #{rank}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-dark-100">
                            Rank <span className={getRankColor()}>#{rank}</span>
                        </h3>
                        <p className="text-dark-400">{getMessage()}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                    {/* Percentile */}
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-dark-400 text-sm mb-1">
                            <TrendingUp className="w-4 h-4" />
                            Percentile
                        </div>
                        <span className="text-2xl font-bold text-success">Top {100 - percentile}%</span>
                    </div>

                    {/* Total Users */}
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-dark-400 text-sm mb-1">
                            <Users className="w-4 h-4" />
                            Total Learners
                        </div>
                        <span className="text-2xl font-bold text-dark-200">{totalUsers}</span>
                    </div>

                    {/* Your Score */}
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-dark-400 text-sm mb-1">
                            <Target className="w-4 h-4" />
                            Your Score
                        </div>
                        <span className="text-2xl font-bold text-primary">
                            {value.toLocaleString()}
                        </span>
                        <span className="text-sm text-dark-500 block">{getMetricLabel()}</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-dark-500 mb-1">
                    <span>Your position</span>
                    <span>{rank} of {totalUsers}</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentile}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default RankCard;
