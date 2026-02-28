/**
 * Comprehensive Achievement System
 * 20+ achievements across 6 categories with tiers and XP rewards
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================

export const achievements = [
    // ============================================
    // LEARNING MILESTONES
    // ============================================
    {
        id: 'first_sign',
        name: 'First Sign',
        description: 'Learn your very first sign',
        icon: '🎉',
        category: 'learning',
        tier: 'bronze',
        xpReward: 10,
        criteria: { type: 'signsLearned', value: 1 }
    },
    {
        id: 'alphabet_beginner',
        name: 'Alphabet Beginner',
        description: 'Learn 5 letters of the alphabet',
        icon: '📝',
        category: 'learning',
        tier: 'bronze',
        xpReward: 25,
        criteria: { type: 'signsLearned', value: 5 }
    },
    {
        id: 'alphabet_intermediate',
        name: 'Alphabet Intermediate',
        description: 'Learn 13 letters (halfway there!)',
        icon: '📚',
        category: 'learning',
        tier: 'silver',
        xpReward: 50,
        criteria: { type: 'signsLearned', value: 13 }
    },
    {
        id: 'alphabet_master',
        name: 'Alphabet Master',
        description: 'Master all 26 letters of the alphabet',
        icon: '🏆',
        category: 'learning',
        tier: 'gold',
        xpReward: 100,
        criteria: { type: 'signsLearned', value: 26 }
    },
    {
        id: 'quick_learner',
        name: 'Quick Learner',
        description: 'Learn 10 signs in one day',
        icon: '⚡',
        category: 'learning',
        tier: 'silver',
        xpReward: 40,
        criteria: { type: 'signsLearnedInDay', value: 10 }
    },

    // ============================================
    // PRACTICE ACHIEVEMENTS
    // ============================================
    {
        id: 'dedicated_student',
        name: 'Dedicated Student',
        description: 'Complete 10 practice sessions',
        icon: '📖',
        category: 'practice',
        tier: 'bronze',
        xpReward: 20,
        criteria: { type: 'practiceSessions', value: 10 }
    },
    {
        id: 'practice_warrior',
        name: 'Practice Warrior',
        description: 'Complete 50 practice sessions',
        icon: '⚔️',
        category: 'practice',
        tier: 'silver',
        xpReward: 75,
        criteria: { type: 'practiceSessions', value: 50 }
    },
    {
        id: 'hundred_sessions',
        name: 'Century Club',
        description: 'Complete 100 practice sessions',
        icon: '💯',
        category: 'practice',
        tier: 'platinum',
        xpReward: 200,
        criteria: { type: 'practiceSessions', value: 100 }
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve 100% accuracy 10 times',
        icon: '🎯',
        category: 'practice',
        tier: 'silver',
        xpReward: 50,
        criteria: { type: 'perfectSessions', value: 10 }
    },
    {
        id: 'consistent_practice',
        name: 'Consistent Practice',
        description: 'Practice 5 days in a row',
        icon: '📅',
        category: 'practice',
        tier: 'silver',
        xpReward: 35,
        criteria: { type: 'streak', value: 5 }
    },

    // ============================================
    // STREAK ACHIEVEMENTS
    // ============================================
    {
        id: 'three_day_streak',
        name: 'Getting Started',
        description: 'Maintain a 3-day practice streak',
        icon: '🔥',
        category: 'streak',
        tier: 'bronze',
        xpReward: 25,
        criteria: { type: 'streak', value: 3 }
    },
    {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day practice streak',
        icon: '🔥',
        category: 'streak',
        tier: 'silver',
        xpReward: 50,
        criteria: { type: 'streak', value: 7 }
    },
    {
        id: 'two_week_streak',
        name: 'Two Week Champion',
        description: 'Maintain a 14-day practice streak',
        icon: '🌟',
        category: 'streak',
        tier: 'silver',
        xpReward: 75,
        criteria: { type: 'streak', value: 14 }
    },
    {
        id: 'month_master',
        name: 'Month Master',
        description: 'Maintain a 30-day practice streak',
        icon: '📆',
        category: 'streak',
        tier: 'gold',
        xpReward: 150,
        criteria: { type: 'streak', value: 30 }
    },
    {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 100-day practice streak',
        icon: '🚀',
        category: 'streak',
        tier: 'platinum',
        xpReward: 500,
        criteria: { type: 'streak', value: 100 }
    },

    // ============================================
    // SPEED & ACCURACY
    // ============================================
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete 10 signs in under 3 minutes',
        icon: '⚡',
        category: 'speed',
        tier: 'gold',
        xpReward: 75,
        criteria: { type: 'speedChallenge', time: 180, signs: 10 }
    },
    {
        id: 'accuracy_master',
        name: 'Accuracy Master',
        description: 'Maintain 90%+ accuracy across 20 sessions',
        icon: '🎯',
        category: 'accuracy',
        tier: 'gold',
        xpReward: 80,
        criteria: { type: 'averageAccuracy', value: 90, sessions: 20 }
    },
    {
        id: 'sharpshooter',
        name: 'Sharpshooter',
        description: 'Get 5 perfect scores in a row',
        icon: '🎪',
        category: 'accuracy',
        tier: 'gold',
        xpReward: 100,
        criteria: { type: 'consecutivePerfect', value: 5 }
    },

    // ============================================
    // SENTENCE ACHIEVEMENTS
    // ============================================
    {
        id: 'first_sentence',
        name: 'First Sentence',
        description: 'Complete your first sentence',
        icon: '💬',
        category: 'sentences',
        tier: 'bronze',
        xpReward: 15,
        criteria: { type: 'sentencesCompleted', value: 1 }
    },
    {
        id: 'sentence_builder',
        name: 'Sentence Builder',
        description: 'Complete 10 different sentences',
        icon: '🗨️',
        category: 'sentences',
        tier: 'silver',
        xpReward: 50,
        criteria: { type: 'sentencesCompleted', value: 10 }
    },
    {
        id: 'conversation_ready',
        name: 'Conversation Ready',
        description: 'Complete 25 different sentences',
        icon: '🗣️',
        category: 'sentences',
        tier: 'gold',
        xpReward: 100,
        criteria: { type: 'sentencesCompleted', value: 25 }
    },

    // ============================================
    // SOCIAL & SPECIAL
    // ============================================
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Practice before 8 AM',
        icon: '🌅',
        category: 'special',
        tier: 'bronze',
        xpReward: 15,
        criteria: { type: 'earlyPractice', value: 1 }
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Practice after 10 PM',
        icon: '🦉',
        category: 'special',
        tier: 'bronze',
        xpReward: 15,
        criteria: { type: 'latePractice', value: 1 }
    },
    {
        id: 'weekend_warrior',
        name: 'Weekend Warrior',
        description: 'Practice on both Saturday and Sunday',
        icon: '🎮',
        category: 'special',
        tier: 'bronze',
        xpReward: 20,
        criteria: { type: 'weekendPractice', value: 1 }
    },
    {
        id: 'daily_challenger',
        name: 'Daily Challenger',
        description: 'Complete 7 daily challenges',
        icon: '🎯',
        category: 'special',
        tier: 'silver',
        xpReward: 60,
        criteria: { type: 'dailyChallenges', value: 7 }
    },

    // ============================================
    // WORD SIGN ACHIEVEMENTS
    // ============================================
    {
        id: 'first_word',
        name: 'First Word',
        description: 'Learn your first word sign',
        icon: '🔤',
        category: 'words',
        tier: 'bronze',
        xpReward: 15,
        criteria: { type: 'wordsLearned', value: 1 }
    },
    {
        id: 'five_words',
        name: 'Word Explorer',
        description: 'Learn 5 word signs',
        icon: '📖',
        category: 'words',
        tier: 'bronze',
        xpReward: 30,
        criteria: { type: 'wordsLearned', value: 5 }
    },
    {
        id: 'ten_words',
        name: 'Word Builder',
        description: 'Learn 10 word signs',
        icon: '🔠',
        category: 'words',
        tier: 'silver',
        xpReward: 50,
        criteria: { type: 'wordsLearned', value: 10 }
    },
    {
        id: 'twenty_words',
        name: 'Vocabulary Master',
        description: 'Learn all 20 word signs',
        icon: '🏅',
        category: 'words',
        tier: 'gold',
        xpReward: 100,
        criteria: { type: 'wordsLearned', value: 20 }
    },
    {
        id: 'category_complete',
        name: 'Category Champion',
        description: 'Complete all words in any category',
        icon: '🏆',
        category: 'words',
        tier: 'silver',
        xpReward: 40,
        criteria: { type: 'categoryComplete', value: 1 }
    },
    {
        id: 'word_accuracy_90',
        name: 'Word Sharpshooter',
        description: 'Achieve 90%+ accuracy on 5 word signs',
        icon: '🎯',
        category: 'words',
        tier: 'gold',
        xpReward: 60,
        criteria: { type: 'wordAccuracy90', value: 5 }
    },
    {
        id: 'all_categories',
        name: 'Well-Rounded',
        description: 'Learn at least one word from every category',
        icon: '🌟',
        category: 'words',
        tier: 'silver',
        xpReward: 45,
        criteria: { type: 'allCategoriesStarted', value: 4 }
    }
];

// ============================================
// TIER COLORS
// ============================================

export const tierColors = {
    bronze: {
        bg: 'from-amber-700/20 to-amber-900/20',
        border: 'border-amber-600/30',
        text: 'text-amber-500',
        hex: '#CD7F32',
        neonShadow: 'shadow-[0_0_10px_rgba(205,127,50,0.6),0_0_20px_rgba(205,127,50,0.4),inset_0_0_15px_rgba(205,127,50,0.2)]',
        ring: 'ring-2 ring-amber-500/60'
    },
    silver: {
        bg: 'from-slate-400/20 to-slate-600/20',
        border: 'border-slate-400/50',
        text: 'text-slate-200',
        hex: '#C0C0C0',
        neonShadow: 'shadow-[0_0_10px_rgba(192,192,192,0.7),0_0_20px_rgba(192,192,192,0.5),inset_0_0_15px_rgba(192,192,192,0.2)]',
        ring: 'ring-2 ring-slate-300/70'
    },
    gold: {
        bg: 'from-yellow-500/20 to-yellow-700/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        hex: '#FFD700',
        neonShadow: 'shadow-[0_0_12px_rgba(255,215,0,0.7),0_0_25px_rgba(255,215,0,0.4),inset_0_0_20px_rgba(255,215,0,0.15)]',
        ring: 'ring-2 ring-yellow-400/70'
    },
    platinum: {
        bg: 'from-cyan-400/20 to-purple-500/20',
        border: 'border-cyan-400/30',
        text: 'text-cyan-300',
        hex: '#67E8F9',
        neonShadow: 'shadow-[0_0_12px_rgba(103,232,249,0.6),0_0_25px_rgba(168,85,247,0.5),inset_0_0_20px_rgba(103,232,249,0.15)]',
        ring: 'ring-2 ring-cyan-400/60'
    }
};

// ============================================
// CATEGORY INFO
// ============================================

export const categories = {
    learning: {
        name: 'Learning',
        icon: '📚',
        color: 'text-primary'
    },
    practice: {
        name: 'Practice',
        icon: '💪',
        color: 'text-success'
    },
    streak: {
        name: 'Streak',
        icon: '🔥',
        color: 'text-warning'
    },
    speed: {
        name: 'Speed',
        icon: '⚡',
        color: 'text-secondary'
    },
    accuracy: {
        name: 'Accuracy',
        icon: '🎯',
        color: 'text-accent'
    },
    sentences: {
        name: 'Sentences',
        icon: '💬',
        color: 'text-cyan-400'
    },
    special: {
        name: 'Special',
        icon: '✨',
        color: 'text-purple-400'
    },
    words: {
        name: 'Words',
        icon: '🔤',
        color: 'text-indigo-400'
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get achievements filtered by category
 */
export function getAchievementsByCategory(category) {
    return achievements.filter(a => a.category === category);
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id) {
    return achievements.find(a => a.id === id);
}

/**
 * Get tier color configuration
 */
export function getTierColor(tier) {
    return tierColors[tier] || tierColors.bronze;
}

/**
 * Get achievements grouped by category
 */
export function getAchievementsGrouped() {
    const grouped = {};
    for (const category of Object.keys(categories)) {
        grouped[category] = getAchievementsByCategory(category);
    }
    return grouped;
}

/**
 * Calculate total possible XP from all achievements
 */
export function getTotalPossibleXP() {
    return achievements.reduce((total, a) => total + a.xpReward, 0);
}

/**
 * Get achievements count by tier
 */
export function getAchievementCountByTier() {
    return {
        bronze: achievements.filter(a => a.tier === 'bronze').length,
        silver: achievements.filter(a => a.tier === 'silver').length,
        gold: achievements.filter(a => a.tier === 'gold').length,
        platinum: achievements.filter(a => a.tier === 'platinum').length
    };
}

export const LEGACY_ID_MAP = {
    'getting_started': 'alphabet_beginner',
    'alphabet_half': 'alphabet_intermediate',
    'streak_3': 'three_day_streak',
    'streak_7': 'week_warrior',
    'streak_30': 'month_master',
    'perfect_practice': 'perfectionist', // Approximate
    'speed_learner': 'quick_learner'     // Approximate
};

export default achievements;
