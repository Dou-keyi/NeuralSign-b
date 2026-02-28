/**
 * LearnWords Page
 * Browse and discover ASL word signs by category
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Search, Filter, Grid3X3, List,
    TrendingUp, Target, Star, ChevronRight,
    Sparkles
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CategoryCard from '@/components/words/CategoryCard';
import WordCard from '@/components/words/WordCard';

// Services
import wordsService from '@/services/wordsService';

// Store
import useAuthStore from '@/store/authStore';

const LearnWords = () => {
    const navigate = useNavigate();
    const { user, userData } = useAuthStore();

    // Data state
    const [categories, setCategories] = useState([]);
    const [allWords, setAllWords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState(0); // 0 = all
    const [viewMode, setViewMode] = useState('categories'); // 'categories' or 'grid'

    // User progress
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

    // Filtered words
    const filteredWords = useMemo(() => {
        let words = allWords;

        // Category filter
        if (selectedCategory !== 'all') {
            words = words.filter(w => w.category === selectedCategory);
        }

        // Difficulty filter
        if (selectedDifficulty > 0) {
            words = words.filter(w => w.difficulty === selectedDifficulty);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            words = words.filter(w =>
                w.englishText.toLowerCase().includes(query) ||
                w.aslGloss.toLowerCase().includes(query) ||
                w.description?.toLowerCase().includes(query)
            );
        }

        return words;
    }, [allWords, selectedCategory, selectedDifficulty, searchQuery]);

    // Progress stats
    const progressStats = useMemo(() => {
        return wordsService.getProgressSummary(wordsProgress);
    }, [wordsProgress]);

    const handleWordClick = (word) => {
        navigate(`/learn/words/${word.id}`);
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner text="Loading words & phrases..." />
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
                    <div className="p-3 rounded-xl bg-primary/10">
                        <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-dark-100">Words & Phrases</h1>
                        <p className="text-dark-400">Learn common ASL signs beyond the alphabet</p>
                    </div>
                </div>
            </motion.div>

            {/* Progress Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                <div className="glass-card p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                        <Target className="w-5 h-5 text-success" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-dark-100">
                            {progressStats.totalLearned}
                            <span className="text-sm text-dark-400 font-normal">/{progressStats.totalWords}</span>
                        </div>
                        <div className="text-xs text-dark-400">Words Learned</div>
                    </div>
                </div>

                <div className="glass-card p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-dark-100">
                            {progressStats.overallAccuracy}%
                        </div>
                        <div className="text-xs text-dark-400">Accuracy</div>
                    </div>
                </div>

                <div className="glass-card p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                        <Star className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-dark-100">
                            {progressStats.completionPercentage}%
                        </div>
                        <div className="text-xs text-dark-400">Complete</div>
                    </div>
                </div>

                <div className="glass-card p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                        <Sparkles className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-dark-100">
                            {progressStats.totalInProgress}
                        </div>
                        <div className="text-xs text-dark-400">In Progress</div>
                    </div>
                </div>
            </motion.div>

            {/* Search & Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col sm:flex-row gap-3 mb-6"
            >
                {/* Search */}
                <div className="relative flex-1">
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

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl
                             text-dark-200 text-sm focus:border-primary focus:outline-none cursor-pointer"
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                </select>

                {/* Difficulty Filter */}
                <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
                    className="px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl
                             text-dark-200 text-sm focus:border-primary focus:outline-none cursor-pointer"
                >
                    <option value={0}>All Difficulties</option>
                    <option value={1}>⭐ Easy</option>
                    <option value={2}>⭐⭐ Medium</option>
                    <option value={3}>⭐⭐⭐ Hard</option>
                </select>

                {/* View Toggle */}
                <div className="flex border border-dark-600 rounded-xl overflow-hidden">
                    <button
                        onClick={() => setViewMode('categories')}
                        className={`px-3 py-2 text-sm transition-colors ${viewMode === 'categories'
                                ? 'bg-primary text-white'
                                : 'bg-dark-800 text-dark-400 hover:text-dark-200'
                            }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid'
                                ? 'bg-primary text-white'
                                : 'bg-dark-800 text-dark-400 hover:text-dark-200'
                            }`}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* Category View */}
            {viewMode === 'categories' && selectedCategory === 'all' && !searchQuery && (
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

            {/* Grid View or Filtered View */}
            {(viewMode === 'grid' || selectedCategory !== 'all' || searchQuery) && (
                <>
                    {/* Results Count */}
                    <p className="text-sm text-dark-400 mb-4">
                        {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''} found
                    </p>

                    {filteredWords.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                        <div className="text-center py-12 text-dark-400">
                            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium">No words found</p>
                            <p className="text-sm mt-1">Try adjusting your filters</p>
                        </div>
                    )}
                </>
            )}
        </PageContainer>
    );
};

export default LearnWords;
