/**
 * Leaderboard Entry Component
 * Individual row in the leaderboard list
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';

const LeaderboardEntry = ({
    rank,
    displayName,
    value,
    label = 'XP',
    isCurrentUser = false,
    photoURL = null,
    index = 0
}) => {
    // Get rank icon for top 3
    const getRankDisplay = () => {
        switch (rank) {
            case 1:
                return <Crown className="w-5 h-5 text-yellow-400" />;
            case 2:
                return <Medal className="w-5 h-5 text-gray-300" />;
            case 3:
                return <Medal className="w-5 h-5 text-amber-600" />;
            default:
                return <span className="text-dark-400 font-medium w-5 text-center">{rank}</span>;
        }
    };

    // Get avatar color based on rank
    const getAvatarGradient = () => {
        if (isCurrentUser) return 'from-primary to-secondary';
        if (rank === 1) return 'from-yellow-400 to-amber-500';
        if (rank === 2) return 'from-gray-300 to-gray-400';
        if (rank === 3) return 'from-amber-600 to-orange-600';
        return 'from-dark-600 to-dark-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`
        flex items-center gap-4 p-3 border-b border-dark-700 last:border-b-0
        transition-colors hover:bg-dark-700/30
        ${isCurrentUser ? 'bg-primary/10' : ''}
      `}
        >
            {/* Rank */}
            <div className="w-8 flex items-center justify-center">
                {getRankDisplay()}
            </div>

            {/* Avatar */}
            <div className={`
        w-10 h-10 rounded-full flex items-center justify-center overflow-hidden
        ${!photoURL ? `bg-gradient-to-br ${getAvatarGradient()}` : ''}
        ${isCurrentUser ? 'ring-2 ring-primary ring-offset-1 ring-offset-dark-800' : ''}
      `}>
                {photoURL ? (
                    <img
                        src={photoURL}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <span
                    className={`text-sm font-bold text-white ${photoURL ? 'hidden' : ''}`}
                    style={{ display: photoURL ? 'none' : 'flex' }}
                >
                    {displayName.charAt(0).toUpperCase()}
                </span>
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
                <h4 className={`
          font-medium truncate
          ${isCurrentUser ? 'text-primary' : 'text-dark-100'}
        `}>
                    {isCurrentUser ? 'You' : displayName}
                </h4>
                {isCurrentUser && (
                    <span className="text-xs text-dark-400">Your position</span>
                )}
            </div>

            {/* Score */}
            <div className="text-right">
                <span className={`
          text-lg font-bold
          ${rank <= 3 ? 'text-warning' : 'text-dark-200'}
          ${isCurrentUser ? 'text-primary' : ''}
        `}>
                    {value.toLocaleString()}
                </span>
                <span className="text-sm text-dark-500 ml-1">{label}</span>
            </div>
        </motion.div>
    );
};

export default LeaderboardEntry;
