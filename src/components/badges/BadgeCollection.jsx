/**
 * Badge Collection Component
 * Display badges in a carousel with a "View All" modal
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Check, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react';
import { achievements, tierColors, categories, getAchievementsByCategory } from '@/data/achievements';

const BadgeCollection = ({
    unlockedAchievements = [],
    className = ''
}) => {
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [showAllBadges, setShowAllBadges] = useState(false);
    const scrollContainerRef = useRef(null);

    // Create unlocked set for quick lookup
    const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

    // Calculate stats
    const stats = {
        total: achievements.length,
        unlocked: unlockedAchievements.length,
        percentage: Math.round((unlockedAchievements.length / achievements.length) * 100)
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-6 ${className}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-warning/10">
                            <Award className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-dark-100">Badge Collection</h3>
                            <p className="text-sm text-dark-400">
                                {stats.unlocked}/{stats.total} unlocked
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAllBadges(true)}
                        className="text-sm font-medium text-primary hover:text-primary-400 transition-colors cursor-pointer"
                    >
                        View All
                    </button>
                </div>

                {/* Carousel Container */}
                <div className="relative group">
                    {/* Left Scroll Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-dark-800/80 text-dark-200 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-dark-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Scrollable Area */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-5 overflow-x-auto py-4 px-2 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {achievements.map((badge) => (
                            <BadgeItem
                                key={badge.id}
                                badge={badge}
                                isUnlocked={unlockedIds.has(badge.id)}
                                onClick={() => setSelectedBadge(badge)}
                                compact
                            />
                        ))}
                    </div>

                    {/* Right Scroll Button */}
                    <button
                        onClick={() => scroll('right')}
                        className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-dark-800/80 text-dark-200 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-dark-700"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {/* View All Modal */}
            <AnimatePresence>
                {showAllBadges && (
                    <AllBadgesModal
                        onClose={() => setShowAllBadges(false)}
                        unlockedIds={unlockedIds}
                        unlockedAchievements={unlockedAchievements}
                        onSelectBadge={setSelectedBadge}
                    />
                )}
            </AnimatePresence>

            {/* Badge Detail Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <BadgeDetailModal
                        badge={selectedBadge}
                        isUnlocked={unlockedIds.has(selectedBadge.id)}
                        unlockedAt={unlockedAchievements.find(a => a.id === selectedBadge.id)?.unlockedAt}
                        onClose={() => setSelectedBadge(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

// Sub-components

const BadgeItem = ({ badge, isUnlocked, onClick, compact = false }) => {
    const rarity = tierColors[badge.tier];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}

            onClick={onClick}
            className={`
                relative flex-shrink-0 cursor-pointer transition-all
                ${compact ? 'w-32 h-32 px-3 py-3' : 'p-3 aspect-square'}
                ${compact ? 'rounded-lg' : 'rounded-xl'}
                ${isUnlocked
                    ? `bg-gradient-to-br ${rarity.bg} border-2 ${rarity.border.replace('border-', 'border-')} ${rarity.neonShadow}`
                    : 'bg-dark-700/50 border border-dark-600 opacity-60'
                }
            `}
            style={isUnlocked ? {
                borderColor: rarity.hex,
                borderWidth: '2px'
            } : {}}
        >
            <div className={`flex flex-col items-center justify-center gap-2 h-full text-center ${!isUnlocked && 'grayscale'}`}>
                <div className="text-3xl">{badge.icon}</div>

                <div className="w-full">
                    <h4 className={`text-xs font-medium mb-0.5 truncate w-full ${isUnlocked ? rarity.text : 'text-dark-200'}`}>
                        {badge.name}
                    </h4>
                    <p className="text-[10px] text-dark-400 line-clamp-2 leading-tight">
                        {badge.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

const AllBadgesModal = ({ onClose, unlockedIds, unlockedAchievements, onSelectBadge }) => {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredBadges = activeCategory === 'all'
        ? achievements
        : getAchievementsByCategory(activeCategory);

    const categoryList = [
        { id: 'all', name: 'All Badges', icon: '🏅' },
        ...Object.entries(categories).map(([id, cat]) => ({ id, ...cat }))
    ];

    return (
        <motion.div
            className="fixed inset-0 z-40 flex items-start justify-center px-4 pb-4 pt-24 bg-dark-900/90 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[85vh] bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-dark-700 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                            <Award className="w-6 h-6 text-warning" />
                            All Achievements
                        </h2>
                        <p className="text-sm text-dark-400 mt-1">
                            Collection of {achievements.length} badges
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-full transition-colors">
                        <X className="w-6 h-6 text-dark-400" />
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="px-6 py-4 border-b border-dark-700 overflow-x-auto shrink-0 flex gap-2 no-scrollbar">
                    {categoryList.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
                                text-sm font-medium transition-all
                                ${activeCategory === cat.id
                                    ? 'bg-primary text-white'
                                    : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                                }
                            `}
                        >
                            <span>{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {filteredBadges.map((badge) => (
                            <BadgeItem
                                key={badge.id}
                                badge={badge}
                                isUnlocked={unlockedIds.has(badge.id)}
                                onClick={() => onSelectBadge(badge)}
                            />
                        ))}
                    </div>

                    {filteredBadges.length === 0 && (
                        <div className="text-center py-12 text-dark-500">
                            No badges found in this category.
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const BadgeDetailModal = ({ badge, isUnlocked, unlockedAt, onClose }) => {
    const rarity = tierColors[badge.tier];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`
                    w-full max-w-sm rounded-2xl overflow-hidden 
                    bg-gradient-to-b from-dark-800 to-dark-900 
                    ${isUnlocked ? rarity.neonShadow : ''}
                `}
                style={{
                    borderColor: isUnlocked ? rarity.hex : '#374151',
                    borderWidth: isUnlocked ? '2px' : '1px',
                    borderStyle: 'solid'
                }}
            >
                {/* Detail Content */}
                <div className={`p-6 text-center ${isUnlocked ? `bg-gradient-to-br ${rarity.bg}` : 'bg-dark-700/50'}`}>
                    <div className={`text-6xl mb-3 ${!isUnlocked && 'grayscale'}`}>
                        {badge.icon}
                    </div>
                    <h3 className="text-xl font-bold text-dark-100">{badge.name}</h3>
                    <p className={`text-sm ${rarity.text} uppercase font-medium mt-1`}>
                        {badge.tier} Badge
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-dark-300 text-center">{badge.description}</p>

                    <div className="flex items-center justify-center gap-6 py-3 border-y border-dark-700">
                        <div className="text-center">
                            <span className="text-xs text-dark-500 block">XP Reward</span>
                            <span className="text-lg font-bold text-warning">+{badge.xpReward}</span>
                        </div>
                        <div className="text-center">
                            <span className="text-xs text-dark-500 block">Category</span>
                            <span className="text-lg font-medium text-dark-200">{categories[badge.category]?.name}</span>
                        </div>
                    </div>

                    {isUnlocked && unlockedAt && (
                        <div className="text-center text-sm text-dark-400">
                            <Check className="w-4 h-4 inline-block text-success mr-1" />
                            Unlocked on {new Date(unlockedAt?.toDate ? unlockedAt.toDate() : unlockedAt).toLocaleDateString()}
                        </div>
                    )}

                    {!isUnlocked && (
                        <div className="text-center text-sm text-dark-500">
                            <Lock className="w-4 h-4 inline-block mr-1" />
                            Keep practicing to unlock this badge!
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-2 rounded-lg bg-dark-700 text-dark-300 hover:bg-dark-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default BadgeCollection;
