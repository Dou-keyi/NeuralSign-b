/**
 * Learn Page
 * Main learning page with tabs for Alphabet signs and Word signs
 */

import { useState, useEffect, useCallback, useMemo, lazy, Suspense, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Trophy,
    XCircle,
    Search,
    Star,
    Target,
    TrendingUp,
    Sparkles,
    MessageSquare
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import AlphabetGrid from '@/components/learning/AlphabetGrid';
import SignInfo from '@/components/learning/SignInfo';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CategoryCard from '@/components/words/CategoryCard';
import WordCard from '@/components/words/WordCard';

// Data & Services
import { getSignByLetter, alphabetSigns } from '@/data/signsData';
import { addLearnedSign, removeLearnedSign, getUserProfile } from '@/services/database';
import wordsService from '@/services/wordsService';
import useAuthStore from '@/store/authStore';

// Lazy load the 3D viewer for performance
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));

/**
 * Progress Stats Component
 */
const ProgressStats = memo(({ learnedCount, totalCount }) => {
    const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 p-4 glass-card mb-6"
        >
            <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{learnedCount}</div>
                <div className="text-sm text-dark-400">Learned</div>
            </div>
            <div className="text-center border-x border-dark-700">
                <div className="text-2xl font-bold gradient-text">{totalCount}</div>
                <div className="text-sm text-dark-400">Total Signs</div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{progressPercent}%</div>
                <div className="text-sm text-dark-400">Complete</div>
            </div>
        </motion.div>
    );
});

ProgressStats.displayName = 'ProgressStats';

/**
 * Navigation Controls Component
 */
const NavigationControls = memo(({
    currentLetter,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext
}) => (
    <div className="flex items-center justify-between">
        <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={!hasPrevious}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
            Previous
        </Button>

        <span className="text-dark-400 text-sm">
            Letter {currentLetter}
        </span>

        <Button
            variant="ghost"
            onClick={onNext}
            disabled={!hasNext}
            rightIcon={<ChevronRight className="w-4 h-4" />}
        >
            Next
        </Button>
    </div>
));

NavigationControls.displayName = 'NavigationControls';

/**
 * Tab Button Component
 */
const TabButton = ({ active, icon: Icon, label, count, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
                ? 'bg-primary/15 text-primary border border-primary/30 shadow-lg shadow-primary/10'
                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 border border-transparent'
            }`}
    >
        <Icon className="w-4.5 h-4.5" />
        <span>{label}</span>
        {count !== undefined && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-primary/20 text-primary' : 'bg-dark-700 text-dark-400'
                }`}>
                {count}
            </span>
        )}
    </button>
);

/**
 * Words Tab Content Component
 */
const WordsTabContent = ({ navigate, userData }) => {
    const [categories, setCategories] = useState([]);
    const [allWords, setAllWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const wordsProgress = userData?.wordsProgress || {};
    const learnedWords = wordsProgress?.learned || [];
    const accuracyData = wordsProgress?.accuracy || {};

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [cats, words] = await Promise.all([
                    wordsService.getAllCategories(),
                    wordsService.getAllWords()
                ]);
                setCategories(cats);
                setAllWords(words);
            } catch (error) {
                console.error('Error loading words data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Progress stats
    const progressStats = useMemo(() => {
        return wordsService.getProgressSummary(wordsProgress);
    }, [wordsProgress]);

    // Filtered words for search
    const filteredWords = useMemo(() => {
        if (!searchQuery.trim()) return null;
        const query = searchQuery.toLowerCase();
        return allWords.filter(w =>
            w.englishText.toLowerCase().includes(query) ||
            w.aslGloss.toLowerCase().includes(query) ||
            w.description?.toLowerCase().includes(query)
        );
    }, [allWords, searchQuery]);

    const handleWordClick = (word) => {
        navigate(`/learn/words/${word.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <LoadingSpinner text="Loading words..." />
            </div>
        );
    }

    return (
        <div>
            {/* Progress Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
            >
                <div className="glass-card p-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                        <Target className="w-4 h-4 text-success" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-dark-100">
                            {progressStats.totalLearned}
                            <span className="text-xs text-dark-400 font-normal">/{progressStats.totalWords}</span>
                        </div>
                        <div className="text-xs text-dark-400">Learned</div>
                    </div>
                </div>
                <div className="glass-card p-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-dark-100">{progressStats.overallAccuracy}%</div>
                        <div className="text-xs text-dark-400">Accuracy</div>
                    </div>
                </div>
                <div className="glass-card p-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                        <Star className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-dark-100">{progressStats.completionPercentage}%</div>
                        <div className="text-xs text-dark-400">Complete</div>
                    </div>
                </div>
                <div className="glass-card p-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                        <Sparkles className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-dark-100">{progressStats.totalInProgress}</div>
                        <div className="text-xs text-dark-400">In Progress</div>
                    </div>
                </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-dark-400">Word Progress</span>
                    <span className="text-dark-300 font-medium">
                        {progressStats.totalLearned} / {progressStats.totalWords} words
                    </span>
                </div>
                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: `${progressStats.completionPercentage}%`
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    />
                </div>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6"
            >
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search words..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl
                                 text-dark-100 placeholder-dark-500 focus:border-primary focus:outline-none
                                 transition-colors text-sm"
                    />
                </div>
            </motion.div>

            {/* Search Results */}
            {filteredWords !== null ? (
                <>
                    <p className="text-sm text-dark-400 mb-4">
                        {filteredWords.length} result{filteredWords.length !== 1 ? 's' : ''} found
                    </p>
                    {filteredWords.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filteredWords.map((word, idx) => {
                                const cat = categories.find(c => c.id === word.category);
                                return (
                                    <WordCard
                                        key={word.id}
                                        word={word}
                                        isLearned={learnedWords.includes(word.id)}
                                        accuracy={accuracyData[word.id]?.avg || null}
                                        categoryColor={cat?.color || '#6366f1'}
                                        onClick={() => handleWordClick(word)}
                                        delay={0.03 * idx}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-dark-400">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p>No words match your search</p>
                        </div>
                    )}
                </>
            ) : (
                /* Category View (default) */
                <div className="space-y-4">
                    {categories.map((cat, idx) => {
                        const catWords = allWords.filter(w => w.category === cat.id);
                        return (
                            <CategoryCard
                                key={cat.id}
                                category={cat}
                                words={catWords}
                                userProgress={wordsProgress}
                                onWordClick={handleWordClick}
                                defaultExpanded={idx === 0}
                                delay={0.1 * idx}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/**
 * Learn Page Component
 */
const Learn = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { user, userData } = useAuthStore();

    // State
    const [activeTab, setActiveTab] = useState('alphabet');
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [learnedSigns, setLearnedSigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMarkingLearned, setIsMarkingLearned] = useState(false);

    // Fetch user's learned signs on mount
    useEffect(() => {
        const fetchLearnedSigns = async () => {
            if (!user?.uid) {
                setIsLoading(false);
                return;
            }

            try {
                const profile = await getUserProfile(user.uid);
                setLearnedSigns(profile?.learnedSigns || []);
            } catch (error) {
                console.error('Error fetching learned signs:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLearnedSigns();
    }, [user?.uid]);

    // Handle lesson ID from URL
    useEffect(() => {
        if (lessonId === 'words') {
            setActiveTab('words');
        } else if (lessonId && lessonId !== 'alphabet') {
            navigate('/learn', { replace: true });
        }
    }, [lessonId, navigate]);

    // Get current sign data
    const currentSign = selectedLetter ? getSignByLetter(selectedLetter) : null;

    // Check if current sign is learned
    const isCurrentSignLearned = selectedLetter && learnedSigns.includes(selectedLetter);

    // Navigation helpers
    const currentIndex = selectedLetter
        ? alphabetSigns.findIndex(s => s.letter === selectedLetter)
        : -1;
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < alphabetSigns.length - 1;

    // Handlers
    const handleSelectLetter = useCallback((letter) => {
        setSelectedLetter(letter);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBack = useCallback(() => {
        setSelectedLetter(null);
    }, []);

    const handlePrevious = useCallback(() => {
        if (hasPrevious) {
            setSelectedLetter(alphabetSigns[currentIndex - 1].letter);
        }
    }, [hasPrevious, currentIndex]);

    const handleNext = useCallback(() => {
        if (hasNext) {
            setSelectedLetter(alphabetSigns[currentIndex + 1].letter);
        }
    }, [hasNext, currentIndex]);

    const handleToggleLearned = useCallback(async () => {
        if (!user?.uid || !selectedLetter) return;

        setIsMarkingLearned(true);
        try {
            if (isCurrentSignLearned) {
                const wasRemoved = await removeLearnedSign(user.uid, selectedLetter);
                if (wasRemoved) {
                    setLearnedSigns(prev => prev.filter(s => s !== selectedLetter));
                }
            } else {
                const wasNew = await addLearnedSign(user.uid, selectedLetter);
                if (wasNew) {
                    setLearnedSigns(prev => [...prev, selectedLetter]);
                }
            }
        } catch (error) {
            console.error('Error toggling learned status:', error);
        } finally {
            setIsMarkingLearned(false);
        }
    }, [user?.uid, selectedLetter, isCurrentSignLearned]);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setSelectedLetter(null);
        if (tab === 'words') {
            navigate('/learn/words', { replace: true });
        } else {
            navigate('/learn', { replace: true });
        }
    }, [navigate]);

    // Word progress for tab badge
    const wordsProgress = userData?.wordsProgress || {};
    const wordsLearnedCount = wordsProgress?.learned?.length || 0;

    // Loading state
    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" text="Loading your progress..." />
                </div>
            </PageContainer>
        );
    }

    // Detail View (Alphabet letter selected)
    if (selectedLetter && currentSign) {
        return (
            <PageContainer>
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6"
                >
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                        Back to Alphabet
                    </Button>
                </motion.div>

                {/* Main content - responsive layout */}
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Left column: 3D Model */}
                    <div className="space-y-4">
                        <Suspense fallback={
                            <div className="aspect-square bg-dark-800 rounded-2xl flex items-center justify-center">
                                <LoadingSpinner text="Loading 3D viewer..." />
                            </div>
                        }>
                            <ModelViewer
                                letter={selectedLetter}
                                showControls={true}
                            />
                        </Suspense>

                        {/* Navigation controls */}
                        <NavigationControls
                            currentLetter={selectedLetter}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            hasPrevious={hasPrevious}
                            hasNext={hasNext}
                        />

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate(`/learn/letter/${selectedLetter}/practice`)}
                                leftIcon={<GraduationCap className="w-4 h-4" />}
                            >
                                Start Learning
                            </Button>

                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => navigate(`/practice?letter=${selectedLetter}`)}
                                leftIcon={<BookOpen className="w-4 h-4" />}
                            >
                                Practice
                            </Button>
                        </div>

                        {/* Practice prompt */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/20">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-dark-100">Ready to practice?</h4>
                                    <p className="text-xs text-dark-400 mt-0.5">
                                        Use the 3D model above to study the hand position
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right column: Sign Info */}
                    <div className="space-y-4">
                        <SignInfo signData={currentSign} />

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {isCurrentSignLearned ? (
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={handleToggleLearned}
                                    isLoading={isMarkingLearned}
                                    leftIcon={<XCircle className="w-4 h-4" />}
                                    className="border-success/30 text-success hover:bg-success/10"
                                >
                                    Unmark as Learned
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={handleToggleLearned}
                                    isLoading={isMarkingLearned}
                                    leftIcon={<Trophy className="w-4 h-4" />}
                                >
                                    Mark as Learned
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // Grid View (default - with tabs)
    return (
        <PageContainer>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
            >
                <div className="p-3 rounded-xl bg-primary/10">
                    <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-dark-100">
                        Learn Sign Language
                    </h1>
                    <p className="text-dark-400">
                        Master the ASL alphabet and common words
                    </p>
                </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex gap-2 mb-6 p-1.5 bg-dark-800/50 rounded-xl border border-dark-700/50"
            >
                <TabButton
                    active={activeTab === 'alphabet'}
                    icon={GraduationCap}
                    label="Alphabet"
                    count={`${learnedSigns.length}/26`}
                    onClick={() => handleTabChange('alphabet')}
                />
                <TabButton
                    active={activeTab === 'words'}
                    icon={MessageSquare}
                    label="Words & Phrases"
                    count={wordsLearnedCount > 0 ? wordsLearnedCount : undefined}
                    onClick={() => handleTabChange('words')}
                />
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'alphabet' ? (
                    <motion.div
                        key="alphabet-tab"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Progress Stats */}
                        <ProgressStats
                            learnedCount={learnedSigns.length}
                            totalCount={alphabetSigns.length}
                        />

                        {/* Progress bar */}
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            className="mb-8"
                        >
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-dark-400">Overall Progress</span>
                                <span className="text-dark-300 font-medium">
                                    {learnedSigns.length} / {alphabetSigns.length} letters
                                </span>
                            </div>
                            <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(learnedSigns.length / alphabetSigns.length) * 100}%`
                                    }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
                                />
                            </div>
                        </motion.div>

                        {/* Alphabet Grid */}
                        <AlphabetGrid
                            learnedSigns={learnedSigns}
                            onSelectLetter={handleSelectLetter}
                            selectedLetter={selectedLetter}
                            showFilters={true}
                        />

                        {/* Encouragement message */}
                        {learnedSigns.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center mt-8 p-6 glass-card"
                            >
                                <p className="text-dark-300">
                                    👋 Welcome! Click on any letter above to start learning.
                                </p>
                            </motion.div>
                        )}

                        {learnedSigns.length === alphabetSigns.length && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center mt-8 p-6 glass-card border-success/30"
                            >
                                <Trophy className="w-12 h-12 text-success mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-success mb-2">
                                    Congratulations! 🎉
                                </h3>
                                <p className="text-dark-300 mb-4">
                                    You've learned all 26 letters of the ASL alphabet!
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => handleTabChange('words')}
                                    rightIcon={<ChevronRight className="w-4 h-4" />}
                                >
                                    Continue with Words & Phrases
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="words-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <WordsTabContent navigate={navigate} userData={userData} />
                    </motion.div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};

export default Learn;
