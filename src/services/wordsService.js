/**
 * Words Service
 * Manages word sign data operations with Firestore
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */


import {
    collection, doc, getDoc, getDocs, query,
    where, orderBy, updateDoc, 
    serverTimestamp, increment
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { seedWords, seedCategories } from '@/data/seedWords';

/**
 * Words Service Class
 * Provides CRUD operations for word signs and categories
 */
class WordsService {
    constructor() {
        this._wordsCache = null;
        this._categoriesCache = null;
        this._cacheTimestamp = null;
        this._cacheTTL = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Helper to populate default values for missing fields
     * @param {Object} word - The word object
     * @returns {Object|null} The word object with defaults
     */
    _populateDefaults(word) {
        if (!word) return null;
        const populated = { ...word };
        // If no video URL is provided, try to construct one based on English text
        if (!populated.videoUrl && populated.englishText) {
            const safeName = populated.englishText.replace(/ /g, '_');
            populated.videoUrl = `/videos/word/word_${safeName}.mp4`;
        }
        return populated;
    }

    /**
     * Check if cache is still valid
     */
    _isCacheValid() {
        return this._cacheTimestamp && (Date.now() - this._cacheTimestamp < this._cacheTTL);
    }

    /**
     * Invalidate the cache
     */
    invalidateCache() {
        this._wordsCache = null;
        this._categoriesCache = null;
        this._cacheTimestamp = null;
    }

    /**
     * Get all words - from Firestore or fallback to seed data
     * @returns {Promise<Array>} Array of word objects
     */
    async getAllWords() {
        if (this._wordsCache && this._isCacheValid()) {
            return this._wordsCache;
        }

        try {
            if (!db) {
                console.warn('⚠️ Firestore not available, using seed data');
                return seedWords.map(w => this._populateDefaults(w));
            }

            const signsRef = collection(db, 'signs');
            const q = query(signsRef, where('type', '==', 'word'), orderBy('category'), orderBy('difficulty'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log('📦 No words in Firestore, using seed data');
                this._wordsCache = seedWords.map(w => this._populateDefaults(w));
                this._cacheTimestamp = Date.now();
                return this._wordsCache;
            }

            const words = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this._wordsCache = words.map(w => this._populateDefaults(w));
            this._cacheTimestamp = Date.now();
            return this._wordsCache;
        } catch (error) {
            console.error('❌ Error fetching words:', error);
            return seedWords.map(w => this._populateDefaults(w));
        }
    }

    /**
     * Get words by category
     * @param {string} categoryId - Category identifier
     * @returns {Promise<Array>} Array of word objects in category
     */
    async getWordsByCategory(categoryId) {
        const words = await this.getAllWords();
        return words.filter(w => w.category === categoryId);
    }

    /**
     * Get a single word by ID
     * @param {string} wordId - Word identifier
     * @returns {Promise<Object|null>} Word object or null
     */
    async getWordById(wordId) {
        // Check cache first
        if (this._wordsCache && this._isCacheValid()) {
            const cached = this._wordsCache.find(w => w.id === wordId);
            if (cached) return cached;
        }

        try {
            if (!db) {
                const word = seedWords.find(w => w.id === wordId) || null;
                return this._populateDefaults(word);
            }

            const docRef = doc(db, 'signs', wordId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const word = { id: docSnap.id, ...docSnap.data() };
                return this._populateDefaults(word);
            }

            // Fallback to seed data
            const word = seedWords.find(w => w.id === wordId) || null;
            return this._populateDefaults(word);
        } catch (error) {
            console.error('❌ Error fetching word:', error);
            const word = seedWords.find(w => w.id === wordId) || null;
            return this._populateDefaults(word);
        }
    }

    /**
     * Get all categories
     * @returns {Promise<Array>} Array of category objects
     */
    async getAllCategories() {
        if (this._categoriesCache && this._isCacheValid()) {
            return this._categoriesCache;
        }

        try {
            if (!db) {
                return seedCategories;
            }

            const categoriesRef = collection(db, 'categories');
            const q = query(categoriesRef, orderBy('order'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log('📦 No categories in Firestore, using seed data');
                this._categoriesCache = seedCategories;
                this._cacheTimestamp = Date.now();
                return seedCategories;
            }

            const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this._categoriesCache = categories;
            this._cacheTimestamp = Date.now();
            return categories;
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            return seedCategories;
        }
    }

    /**
     * Get category by ID
     * @param {string} categoryId - Category identifier
     * @returns {Promise<Object|null>} Category object or null
     */
    async getCategoryById(categoryId) {
        const categories = await this.getAllCategories();
        return categories.find(c => c.id === categoryId) || null;
    }

    /**
     * Search words by query string
     * @param {string} searchQuery - Search text
     * @returns {Promise<Array>} Matching word objects
     */
    async searchWords(searchQuery) {
        const words = await this.getAllWords();
        const query = searchQuery.toLowerCase().trim();

        if (!query) return words;

        return words.filter(word =>
            word.englishText.toLowerCase().includes(query) ||
            word.aslGloss.toLowerCase().includes(query) ||
            word.description?.toLowerCase().includes(query) ||
            word.tags?.some(tag => tag.toLowerCase().includes(query))
        );
    }

    /**
     * Get words by difficulty level
     * @param {number} difficulty - Difficulty level (1-3)
     * @returns {Promise<Array>} Words matching difficulty
     */
    async getWordsByDifficulty(difficulty) {
        const words = await this.getAllWords();
        return words.filter(w => w.difficulty === difficulty);
    }

    /**
     * Get recommended words for a user based on progress
     * @param {Object} userProgress - User's words progress object
     * @param {number} limit - Max words to return
     * @returns {Promise<Array>} Recommended word objects
     */
    async getRecommendedWords(userProgress = {}, limit = 5) {
        const words = await this.getAllWords();
        const learnedIds = new Set(userProgress?.learned || []);

        // Filter unlearned, sort by difficulty and popularity
        const unlearned = words
            .filter(w => !learnedIds.has(w.id))
            .sort((a, b) => {
                // Prioritize: lower difficulty first, then higher popularity
                if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
                return (b.popularity || 0) - (a.popularity || 0);
            });

        return unlearned.slice(0, limit);
    }

    /**
     * Mark a word as learned for a user
     * @param {string} userId - User ID
     * @param {string} wordId - Word ID
     * @returns {Promise<boolean>} Whether the word was newly learned
     */
    async markWordAsLearned(userId, wordId) {
        if (!db || !userId) return false;

        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            const wordsProgress = userData.wordsProgress || { learned: [], inProgress: [], accuracy: {} };

            // Check if already learned
            if (wordsProgress.learned?.includes(wordId)) {
                return false;
            }

            // Add to learned
            wordsProgress.learned = [...(wordsProgress.learned || []), wordId];

            // Remove from inProgress if present
            wordsProgress.inProgress = (wordsProgress.inProgress || []).filter(id => id !== wordId);

            // Update category progress
            const word = await this.getWordById(wordId);
            if (word?.category) {
                const categoryProgress = wordsProgress.categoryProgress || {};
                const catWords = await this.getWordsByCategory(word.category);
                const learnedInCat = wordsProgress.learned.filter(id =>
                    catWords.some(w => w.id === id)
                ).length;

                categoryProgress[word.category] = {
                    learned: learnedInCat,
                    total: catWords.length,
                    percentage: Math.round((learnedInCat / catWords.length) * 100)
                };
                wordsProgress.categoryProgress = categoryProgress;
            }

            await updateDoc(userRef, {
                wordsProgress,
                updatedAt: serverTimestamp()
            });

            // Increment learned count on the sign document
            try {
                const signRef = doc(db, 'signs', wordId);
                await updateDoc(signRef, { learnedCount: increment(1) });
            } catch (e) {
                // Non-critical error
                console.warn('Could not increment learned count', e);
            }

            this.invalidateCache();
            return true;
        } catch (error) {
            console.error('❌ Error marking word as learned:', error);
            return false;
        }
    }

    /**
     * Update practice accuracy for a word
     * @param {string} userId - User ID
     * @param {string} wordId - Word ID
     * @param {number} accuracy - Accuracy percentage (0-100)
     */
    async updateWordAccuracy(userId, wordId, accuracy) {
        if (!db || !userId) return;

        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            const wordsProgress = userData.wordsProgress || { learned: [], inProgress: [], accuracy: {} };
            const wordAccuracy = wordsProgress.accuracy || {};

            // Rolling average
            const prev = wordAccuracy[wordId] || { avg: 0, count: 0 };
            const newAvg = Math.round(
                (prev.avg * prev.count + accuracy) / (prev.count + 1)
            );

            wordAccuracy[wordId] = {
                avg: newAvg,
                count: prev.count + 1,
                lastPracticed: new Date().toISOString()
            };

            // Add to inProgress if not already learned
            if (!wordsProgress.learned?.includes(wordId) &&
                !wordsProgress.inProgress?.includes(wordId)) {
                wordsProgress.inProgress = [...(wordsProgress.inProgress || []), wordId];
            }

            wordsProgress.accuracy = wordAccuracy;

            await updateDoc(userRef, {
                wordsProgress,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('❌ Error updating word accuracy:', error);
        }
    }

    /**
     * Get related words for a given word
     * @param {string} wordId - Word ID
     * @returns {Promise<Array>} Related word objects
     */
    async getRelatedWords(wordId) {
        const word = await this.getWordById(wordId);
        if (!word?.relatedSigns?.length) return [];

        const words = await this.getAllWords();
        return words.filter(w => word.relatedSigns.includes(w.id));
    }

    /**
     * Get user's words progress summary
     * @param {Object} userProgress - wordsProgress object from user profile
     * @returns {Object} Progress summary
     */
    getProgressSummary(userProgress = {}) {
        const learned = userProgress?.learned?.length || 0;
        const inProgress = userProgress?.inProgress?.length || 0;
        const accuracyData = userProgress?.accuracy || {};

        const accuracyValues = Object.values(accuracyData).map(a => a.avg);
        const overallAccuracy = accuracyValues.length > 0
            ? Math.round(accuracyValues.reduce((sum, a) => sum + a, 0) / accuracyValues.length)
            : 0;

        return {
            totalLearned: learned,
            totalInProgress: inProgress,
            totalWords: seedWords.length,
            overallAccuracy,
            completionPercentage: Math.round((learned / seedWords.length) * 100),
            categoryProgress: userProgress?.categoryProgress || {}
        };
    }
}

export const wordsService = new WordsService();
export default wordsService;
