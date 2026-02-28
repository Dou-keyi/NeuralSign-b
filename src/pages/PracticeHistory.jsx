/**
 * Practice History Page
 * View all past practice sessions with filtering
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    History,
    ArrowLeft,
    Filter,
    Calendar,
    Search,
    X,
    TrendingUp,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import SessionCard from '@/components/history/SessionCard';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Store
import useAuthStore from '@/store/authStore';

// Constants
const ITEMS_PER_PAGE = 10;
const MODE_OPTIONS = [
    { value: 'all', label: 'All Modes' },
    { value: 'free_practice', label: 'Free Practice' },
    { value: 'flashcard', label: 'Flashcard' },
    { value: 'timed_challenge', label: 'Timed Challenge' },
    { value: 'practice', label: 'Practice' }
];

/**
 * Filter Bar Component
 */
const FilterBar = ({ filters, onFilterChange, onClear, hasFilters }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-6"
        >
            <div className="flex flex-wrap items-center gap-4">
                {/* Search by sign */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search by sign (e.g., A, B, C)"
                        value={filters.sign}
                        onChange={(e) => onFilterChange('sign', e.target.value.toUpperCase())}
                        className="w-full pl-9 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary"
                        maxLength={1}
                    />
                </div>

                {/* Mode filter */}
                <div className="relative">
                    <select
                        value={filters.mode}
                        onChange={(e) => onFilterChange('mode', e.target.value)}
                        className="px-4 py-2 pr-8 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-100 appearance-none focus:outline-none focus:border-primary"
                    >
                        {MODE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                </div>

                {/* Date filter */}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-dark-400" />
                    <select
                        value={filters.dateRange}
                        onChange={(e) => onFilterChange('dateRange', e.target.value)}
                        className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-100 appearance-none focus:outline-none focus:border-primary"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>

                {/* Clear filters */}
                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        leftIcon={<X className="w-4 h-4" />}
                    >
                        Clear
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

/**
 * Pagination Component
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                    // Show first, last, and pages around current
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                })
                .map((page, idx, arr) => {
                    // Add ellipsis
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && page - prev > 1;

                    return (
                        <div key={page} className="flex items-center gap-1">
                            {showEllipsis && (
                                <span className="px-2 text-dark-400">...</span>
                            )}
                            <Button
                                variant={page === currentPage ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </Button>
                        </div>
                    );
                })}

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
};

/**
 * Summary Stats Component
 */
const SummaryStats = ({ sessions }) => {
    const stats = useMemo(() => {
        if (sessions.length === 0) {
            return { total: 0, avgAccuracy: 0, successRate: 0 };
        }

        const total = sessions.length;
        const avgAccuracy = Math.round(
            sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / total
        );
        const successRate = Math.round(
            (sessions.filter(s => s.accuracy >= 70).length / total) * 100
        );

        return { total, avgAccuracy, successRate };
    }, [sessions]);

    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-dark-100">{stats.total}</div>
                <div className="text-xs text-dark-400">Total Sessions</div>
            </div>
            <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.avgAccuracy}%</div>
                <div className="text-xs text-dark-400">Avg Accuracy</div>
            </div>
            <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.successRate}%</div>
                <div className="text-xs text-dark-400">Success Rate</div>
            </div>
        </div>
    );
};

/**
 * Practice History Page Component
 */
const PracticeHistory = () => {
    const navigate = useNavigate();
    const { userData, isLoading } = useAuthStore();

    // Filters
    const [filters, setFilters] = useState({
        sign: '',
        mode: 'all',
        dateRange: 'all'
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Get practice history
    const practiceHistory = userData?.practiceHistory || [];

    // Filter sessions
    const filteredSessions = useMemo(() => {
        let filtered = [...practiceHistory];

        // Sort by date (newest first)
        filtered.sort((a, b) => {
            const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp);
            const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp);
            return dateB - dateA;
        });

        // Filter by sign
        if (filters.sign) {
            filtered = filtered.filter(s => s.sign === filters.sign);
        }

        // Filter by mode
        if (filters.mode !== 'all') {
            filtered = filtered.filter(s => s.mode === filters.mode);
        }

        // Filter by date range
        if (filters.dateRange !== 'all') {
            const now = new Date();
            let cutoff = new Date();

            switch (filters.dateRange) {
                case 'today':
                    cutoff.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    cutoff.setDate(cutoff.getDate() - 7);
                    break;
                case 'month':
                    cutoff.setMonth(cutoff.getMonth() - 1);
                    break;
            }

            filtered = filtered.filter(s => {
                const date = s.timestamp?.toDate?.() || new Date(s.timestamp);
                return date >= cutoff;
            });
        }

        return filtered;
    }, [practiceHistory, filters]);

    // Paginate
    const paginatedSessions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSessions.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredSessions, currentPage]);

    const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);

    // Handlers
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({ sign: '', mode: 'all', dateRange: 'all' });
        setCurrentPage(1);
    }, []);

    const hasFilters = filters.sign || filters.mode !== 'all' || filters.dateRange !== 'all';

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner text="Loading history..." />
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
                className="flex items-center justify-between mb-6"
            >
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/practice')}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <History className="w-6 h-6 text-dark-300" />
                        <h1 className="text-2xl font-bold text-dark-100">Practice History</h1>
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={() => navigate('/progress')}
                    leftIcon={<TrendingUp className="w-4 h-4" />}
                >
                    View Progress
                </Button>
            </motion.div>

            {/* Summary stats */}
            <SummaryStats sessions={filteredSessions} />

            {/* Filters */}
            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                hasFilters={hasFilters}
            />

            {/* Sessions list */}
            {paginatedSessions.length > 0 ? (
                <div className="space-y-3">
                    {paginatedSessions.map((session, idx) => (
                        <SessionCard
                            key={session.id || idx}
                            session={session}
                            index={idx}
                        />
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                >
                    <History className="w-12 h-12 mx-auto mb-4 text-dark-500" />
                    <h3 className="text-lg font-medium text-dark-300 mb-2">
                        {hasFilters ? 'No sessions match your filters' : 'No practice sessions yet'}
                    </h3>
                    <p className="text-dark-400 mb-4">
                        {hasFilters
                            ? 'Try adjusting your filters or clear them to see all sessions.'
                            : 'Start practicing to see your session history here!'}
                    </p>
                    {hasFilters ? (
                        <Button variant="secondary" onClick={handleClearFilters}>
                            Clear Filters
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={() => navigate('/practice')}>
                            Start Practicing
                        </Button>
                    )}
                </motion.div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </PageContainer>
    );
};

export default PracticeHistory;
