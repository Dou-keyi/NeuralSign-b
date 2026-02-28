/**
 * XP History Page
 * View comprehensive XP progress and earning history
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    History,
    ArrowLeft,
    TrendingUp,
    Zap,
    Calendar,
    Star,
    Award
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import XPBar from '@/components/xp/XPBar';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Store
import useAuthStore from '@/store/authStore';
import { XP_SOURCES } from '@/services/xpService';
import { MILESTONES } from '@/services/milestoneService';

/**
 * Helper to format date
 */
const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }).format(date);
};

/**
 * Helper to get icon for source
 */
const getSourceIcon = (source) => {
    if (source?.includes('SIGN_LEARNED')) return <Star className="w-4 h-4 text-warning" />;
    if (source?.includes('PRACTICE')) return <Zap className="w-4 h-4 text-primary" />;
    if (source?.includes('CHALLENGE')) return <Award className="w-4 h-4 text-secondary" />;
    if (source?.includes('MILESTONE')) return <Award className="w-4 h-4 text-purple-400" />;
    return <Zap className="w-4 h-4 text-dark-300" />;
};

/**
 * Helper to get simplified label
 */
const getSourceLabel = (source) => {
    // Check for combined sources first
    if (source?.includes('+')) return 'Practice Bonus';

    // Check known sources
    for (const [key, val] of Object.entries(XP_SOURCES)) {
        if (source === key) return val.label;
    }

    // Fallback for milestones or custom formatted strings
    if (source?.startsWith('MILESTONE_')) return 'Leveled Up Milestone';

    return source?.replace(/_/g, ' ') || 'XP Earned';
};

/**
 * Helper to get details (with fallback for legacy entries)
 */
const getEntryDetails = (entry) => {
    if (entry.details) return entry.details;

    // Fallback for legacy entries based on source
    const source = entry.source || '';
    if (source === 'SIGN_LEARNED') return 'Learned a new sign';
    if (source.includes('PRACTICE')) return 'Practice session completed';
    if (source === 'DAILY_CHALLENGE') return 'Completed daily challenge';
    if (source.includes('MILESTONE')) return 'Milestone achievement unlocked';
    if (source === 'SENTENCE_COMPLETED') return 'Completed a sentence';

    return 'Activity completed';
};

/**
 * XP History Page Component
 */
const XPHistory = () => {
    const navigate = useNavigate();
    const { userData, isLoading, refreshUserData } = useAuthStore();

    useEffect(() => {
        refreshUserData();
    }, [refreshUserData]);

    const [page, setPage] = useState(1);
    const [showDetails, setShowDetails] = useState(false);
    const ITEMS_PER_PAGE = 20;

    const totalXP = userData?.xp?.total || userData?.progress?.totalXP || 0;

    // Inferred details for legacy signs
    const legacySignMapping = useMemo(() => {
        if (!userData?.xp?.history || !userData?.learnedSigns) return {};

        const mapping = {};
        const signs = [...userData.learnedSigns]; // Array of sign IDs ['A', 'B'...]

        // Filter history for SIGN_LEARNED events and sort by timestamp ASC (oldest first)
        const learningEvents = userData.xp.history
            .filter(e => e.source === 'SIGN_LEARNED')
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Map events to signs
        learningEvents.forEach((event, index) => {
            if (index < signs.length) {
                mapping[event.timestamp] = signs[index];
            }
        });

        return mapping;
    }, [userData]);

    // Inferred details for legacy practice sessions
    const legacyPracticeMapping = useMemo(() => {
        if (!userData?.xp?.history || !userData?.practiceHistory) return {};

        const mapping = {};

        // Filter history for PRACTICE events and sort by timestamp ASC
        const xpEvents = userData.xp.history
            .filter(e => e.source && e.source.includes('PRACTICE'))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Sort practice history by timestamp ASC
        // Handle Firestore timestamps which have seconds/nanoseconds
        const getMillis = (ts) => ts?.seconds ? ts.seconds * 1000 : new Date(ts).getTime();

        const practiceEvents = [...userData.practiceHistory]
            .sort((a, b) => getMillis(a.timestamp) - getMillis(b.timestamp));

        // Map events
        xpEvents.forEach((event, index) => {
            if (index < practiceEvents.length) {
                const practiceData = practiceEvents[index];
                if (practiceData.sign) {
                    mapping[event.timestamp] = {
                        sign: practiceData.sign,
                        accuracy: practiceData.accuracy
                    };
                }
            }
        });

        return mapping;
    }, [userData]);

    const history = useMemo(() => {
        const h = userData?.xp?.history || [];
        return [...h].reverse(); // Newest first
    }, [userData]);

    const paginatedHistory = useMemo(() => {
        return history.slice(0, page * ITEMS_PER_PAGE);
    }, [history, page]);

    const hasMore = paginatedHistory.length < history.length;

    // Helper to get details with inference
    const getEntryDetails = (entry) => {
        if (entry.details) return entry.details;

        const source = entry.source || '';

        if (source === 'SIGN_LEARNED') {
            const inferredSign = legacySignMapping[entry.timestamp];
            if (inferredSign) {
                return inferredSign.length === 1
                    ? `Learned letter ${inferredSign}`
                    : `Learned sign ${inferredSign}`;
            }
            return 'Learned a new sign';
        }

        if (source.includes('PRACTICE')) {
            const legacyData = legacyPracticeMapping[entry.timestamp];
            if (legacyData) {
                return `Practiced '${legacyData.sign}' • Accuracy: ${legacyData.accuracy}%`;
            }
            return 'Practice session completed';
        }

        if (source === 'DAILY_CHALLENGE') return 'Completed daily challenge';

        if (source.includes('MILESTONE')) {
            const prefix = 'MILESTONE_';
            if (source.startsWith(prefix)) {
                const id = source.substring(prefix.length).toLowerCase();
                const milestone = MILESTONES.find(m => m.id === id);
                if (milestone) return `Achieved: ${milestone.title}`;
            }
            return 'Milestone achievement unlocked';
        }

        if (source === 'SENTENCE_COMPLETED') return 'Completed a sentence';

        return 'Activity completed';
    };

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner text="Loading XP Data..." />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-6"
            >
                <Button
                    variant="ghost"
                    onClick={() => navigate('/progress')}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Back to Progress
                </Button>
                <h1 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
                    <History className="w-6 h-6 text-primary" />
                    XP History
                </h1>
            </motion.div>

            {/* XP Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <h2 className="text-lg font-semibold text-dark-100 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-warning" />
                    Current Level & Progress
                </h2>
                <XPBar totalXP={totalXP} size="large" />
            </motion.div>

            {/* History List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-success" />
                        Earning History
                    </h2>

                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 text-sm text-dark-300 hover:text-primary transition-colors focus:outline-none"
                    >
                        <span>View Details</span>
                        <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-200 ease-in-out ${showDetails ? 'bg-primary' : 'bg-dark-600'}`}>
                            <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${showDetails ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </button>
                </div>

                <div className="space-y-3">
                    {history.length > 0 ? (
                        paginatedHistory.map((entry, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * Math.min(idx, 10) }}
                                className="glass-card p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center border border-dark-700">
                                        {getSourceIcon(entry.source)}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-medium text-dark-100">
                                            {getSourceLabel(entry.source)}
                                        </p>

                                        {/* Details row */}
                                        {showDetails && (
                                            <p className="text-sm text-primary/90 mt-0.5 font-medium">
                                                {getEntryDetails(entry)}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 text-xs text-dark-400 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(entry.timestamp)}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-bold text-success text-lg">
                                    +{entry.amount} XP
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-dark-400 bg-dark-800/30 rounded-xl">
                            <p>No XP history available yet.</p>
                            <p className="text-sm mt-2">Start learning to earn XP!</p>
                        </div>
                    )}
                </div>

                {hasMore && (
                    <div className="mt-6 text-center">
                        <Button
                            variant="secondary"
                            onClick={() => setPage(p => p + 1)}
                        >
                            Load More
                        </Button>
                    </div>
                )}
            </motion.div>
        </PageContainer>
    );
};

export default XPHistory;
