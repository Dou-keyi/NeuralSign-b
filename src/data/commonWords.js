/**
 * Common Words Database
 * Database of common ASL words with fingerspelling data
 * 
 * Since we only have alphabet 3D models, all words are fingerspelled
 * This is educational as fingerspelling is a core ASL skill
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

// ============================================
// COMMON WORDS BY CATEGORY
// ============================================

export const commonWords = {
    greetings: {
        HELLO: { fingerspell: true, letters: ['H', 'E', 'L', 'L', 'O'] },
        HI: { fingerspell: true, letters: ['H', 'I'] },
        GOODBYE: { fingerspell: true, letters: ['G', 'O', 'O', 'D', 'B', 'Y', 'E'] },
        BYE: { fingerspell: true, letters: ['B', 'Y', 'E'] },
        THANKS: { fingerspell: true, letters: ['T', 'H', 'A', 'N', 'K', 'S'] },
        PLEASE: { fingerspell: true, letters: ['P', 'L', 'E', 'A', 'S', 'E'] },
        SORRY: { fingerspell: true, letters: ['S', 'O', 'R', 'R', 'Y'] },
        WELCOME: { fingerspell: true, letters: ['W', 'E', 'L', 'C', 'O', 'M', 'E'] }
    },
    questions: {
        WHAT: { fingerspell: true, letters: ['W', 'H', 'A', 'T'] },
        WHERE: { fingerspell: true, letters: ['W', 'H', 'E', 'R', 'E'] },
        WHEN: { fingerspell: true, letters: ['W', 'H', 'E', 'N'] },
        WHO: { fingerspell: true, letters: ['W', 'H', 'O'] },
        WHY: { fingerspell: true, letters: ['W', 'H', 'Y'] },
        HOW: { fingerspell: true, letters: ['H', 'O', 'W'] },
        WHICH: { fingerspell: true, letters: ['W', 'H', 'I', 'C', 'H'] }
    },
    pronouns: {
        I: { fingerspell: true, letters: ['I'] },
        YOU: { fingerspell: true, letters: ['Y', 'O', 'U'] },
        ME: { fingerspell: true, letters: ['M', 'E'] },
        MY: { fingerspell: true, letters: ['M', 'Y'] },
        YOUR: { fingerspell: true, letters: ['Y', 'O', 'U', 'R'] },
        WE: { fingerspell: true, letters: ['W', 'E'] },
        THEY: { fingerspell: true, letters: ['T', 'H', 'E', 'Y'] },
        HE: { fingerspell: true, letters: ['H', 'E'] },
        SHE: { fingerspell: true, letters: ['S', 'H', 'E'] },
        IT: { fingerspell: true, letters: ['I', 'T'] }
    },
    common_verbs: {
        GO: { fingerspell: true, letters: ['G', 'O'] },
        EAT: { fingerspell: true, letters: ['E', 'A', 'T'] },
        DRINK: { fingerspell: true, letters: ['D', 'R', 'I', 'N', 'K'] },
        SLEEP: { fingerspell: true, letters: ['S', 'L', 'E', 'E', 'P'] },
        WORK: { fingerspell: true, letters: ['W', 'O', 'R', 'K'] },
        HELP: { fingerspell: true, letters: ['H', 'E', 'L', 'P'] },
        WANT: { fingerspell: true, letters: ['W', 'A', 'N', 'T'] },
        NEED: { fingerspell: true, letters: ['N', 'E', 'E', 'D'] },
        LIKE: { fingerspell: true, letters: ['L', 'I', 'K', 'E'] },
        LOVE: { fingerspell: true, letters: ['L', 'O', 'V', 'E'] },
        HAVE: { fingerspell: true, letters: ['H', 'A', 'V', 'E'] },
        KNOW: { fingerspell: true, letters: ['K', 'N', 'O', 'W'] },
        LEARN: { fingerspell: true, letters: ['L', 'E', 'A', 'R', 'N'] },
        TEACH: { fingerspell: true, letters: ['T', 'E', 'A', 'C', 'H'] },
        SEE: { fingerspell: true, letters: ['S', 'E', 'E'] },
        HEAR: { fingerspell: true, letters: ['H', 'E', 'A', 'R'] },
        SAY: { fingerspell: true, letters: ['S', 'A', 'Y'] },
        TELL: { fingerspell: true, letters: ['T', 'E', 'L', 'L'] },
        COME: { fingerspell: true, letters: ['C', 'O', 'M', 'E'] },
        GIVE: { fingerspell: true, letters: ['G', 'I', 'V', 'E'] },
        TAKE: { fingerspell: true, letters: ['T', 'A', 'K', 'E'] },
        MAKE: { fingerspell: true, letters: ['M', 'A', 'K', 'E'] },
        GET: { fingerspell: true, letters: ['G', 'E', 'T'] },
        FEEL: { fingerspell: true, letters: ['F', 'E', 'E', 'L'] },
        THINK: { fingerspell: true, letters: ['T', 'H', 'I', 'N', 'K'] }
    },
    common_nouns: {
        NAME: { fingerspell: true, letters: ['N', 'A', 'M', 'E'] },
        HOME: { fingerspell: true, letters: ['H', 'O', 'M', 'E'] },
        HOUSE: { fingerspell: true, letters: ['H', 'O', 'U', 'S', 'E'] },
        STORE: { fingerspell: true, letters: ['S', 'T', 'O', 'R', 'E'] },
        SCHOOL: { fingerspell: true, letters: ['S', 'C', 'H', 'O', 'O', 'L'] },
        WORK: { fingerspell: true, letters: ['W', 'O', 'R', 'K'] },
        FOOD: { fingerspell: true, letters: ['F', 'O', 'O', 'D'] },
        WATER: { fingerspell: true, letters: ['W', 'A', 'T', 'E', 'R'] },
        TIME: { fingerspell: true, letters: ['T', 'I', 'M', 'E'] },
        DAY: { fingerspell: true, letters: ['D', 'A', 'Y'] },
        NIGHT: { fingerspell: true, letters: ['N', 'I', 'G', 'H', 'T'] },
        WEEK: { fingerspell: true, letters: ['W', 'E', 'E', 'K'] },
        MONTH: { fingerspell: true, letters: ['M', 'O', 'N', 'T', 'H'] },
        YEAR: { fingerspell: true, letters: ['Y', 'E', 'A', 'R'] },
        FRIEND: { fingerspell: true, letters: ['F', 'R', 'I', 'E', 'N', 'D'] },
        FAMILY: { fingerspell: true, letters: ['F', 'A', 'M', 'I', 'L', 'Y'] },
        MOM: { fingerspell: true, letters: ['M', 'O', 'M'] },
        DAD: { fingerspell: true, letters: ['D', 'A', 'D'] },
        CAT: { fingerspell: true, letters: ['C', 'A', 'T'] },
        DOG: { fingerspell: true, letters: ['D', 'O', 'G'] }
    },
    common_adjectives: {
        GOOD: { fingerspell: true, letters: ['G', 'O', 'O', 'D'] },
        BAD: { fingerspell: true, letters: ['B', 'A', 'D'] },
        BIG: { fingerspell: true, letters: ['B', 'I', 'G'] },
        SMALL: { fingerspell: true, letters: ['S', 'M', 'A', 'L', 'L'] },
        NEW: { fingerspell: true, letters: ['N', 'E', 'W'] },
        OLD: { fingerspell: true, letters: ['O', 'L', 'D'] },
        HAPPY: { fingerspell: true, letters: ['H', 'A', 'P', 'P', 'Y'] },
        SAD: { fingerspell: true, letters: ['S', 'A', 'D'] },
        FAST: { fingerspell: true, letters: ['F', 'A', 'S', 'T'] },
        SLOW: { fingerspell: true, letters: ['S', 'L', 'O', 'W'] },
        HOT: { fingerspell: true, letters: ['H', 'O', 'T'] },
        COLD: { fingerspell: true, letters: ['C', 'O', 'L', 'D'] }
    },
    time_words: {
        NOW: { fingerspell: true, letters: ['N', 'O', 'W'] },
        TODAY: { fingerspell: true, letters: ['T', 'O', 'D', 'A', 'Y'] },
        TOMORROW: { fingerspell: true, letters: ['T', 'O', 'M', 'O', 'R', 'R', 'O', 'W'] },
        YESTERDAY: { fingerspell: true, letters: ['Y', 'E', 'S', 'T', 'E', 'R', 'D', 'A', 'Y'] },
        LATER: { fingerspell: true, letters: ['L', 'A', 'T', 'E', 'R'] },
        SOON: { fingerspell: true, letters: ['S', 'O', 'O', 'N'] },
        ALWAYS: { fingerspell: true, letters: ['A', 'L', 'W', 'A', 'Y', 'S'] },
        NEVER: { fingerspell: true, letters: ['N', 'E', 'V', 'E', 'R'] },
        MORNING: { fingerspell: true, letters: ['M', 'O', 'R', 'N', 'I', 'N', 'G'] },
        AFTERNOON: { fingerspell: true, letters: ['A', 'F', 'T', 'E', 'R', 'N', 'O', 'O', 'N'] },
        EVENING: { fingerspell: true, letters: ['E', 'V', 'E', 'N', 'I', 'N', 'G'] }
    },
    other: {
        YES: { fingerspell: true, letters: ['Y', 'E', 'S'] },
        NO: { fingerspell: true, letters: ['N', 'O'] },
        MAYBE: { fingerspell: true, letters: ['M', 'A', 'Y', 'B', 'E'] },
        OK: { fingerspell: true, letters: ['O', 'K'] },
        NOT: { fingerspell: true, letters: ['N', 'O', 'T'] },
        VERY: { fingerspell: true, letters: ['V', 'E', 'R', 'Y'] },
        MORE: { fingerspell: true, letters: ['M', 'O', 'R', 'E'] },
        LESS: { fingerspell: true, letters: ['L', 'E', 'S', 'S'] },
        ALL: { fingerspell: true, letters: ['A', 'L', 'L'] },
        SOME: { fingerspell: true, letters: ['S', 'O', 'M', 'E'] },
        AND: { fingerspell: true, letters: ['A', 'N', 'D'] },
        BUT: { fingerspell: true, letters: ['B', 'U', 'T'] },
        WITH: { fingerspell: true, letters: ['W', 'I', 'T', 'H'] },
        FOR: { fingerspell: true, letters: ['F', 'O', 'R'] }
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get sign data for a specific word
 * Falls back to fingerspelling if word not in database
 * 
 * @param {string} word - The word to look up
 * @returns {Object} Sign data with fingerspell flag and letters
 */
export function getWordSign(word) {
    if (!word) return { fingerspell: true, letters: [] };

    const upperWord = word.toUpperCase().trim();

    // Search all categories for the word
    for (const category in commonWords) {
        if (commonWords[category][upperWord]) {
            return {
                ...commonWords[category][upperWord],
                category: category
            };
        }
    }

    // If not found, return fingerspelling for the word
    // Filter to only valid letters (A-Z)
    const letters = upperWord.split('').filter(char => /[A-Z]/.test(char));

    return {
        fingerspell: true,
        letters: letters,
        category: 'custom'
    };
}

/**
 * Get all words in a category
 * 
 * @param {string} category - Category name
 * @returns {Object} Dictionary of words in that category
 */
export function getWordsByCategory(category) {
    return commonWords[category] || {};
}

/**
 * Get all available categories
 * 
 * @returns {string[]} Array of category names
 */
export function getCategories() {
    return Object.keys(commonWords);
}

/**
 * Check if a word is in the database
 * 
 * @param {string} word - Word to check
 * @returns {boolean} Whether the word is in the database
 */
export function isWordInDatabase(word) {
    if (!word) return false;

    const upperWord = word.toUpperCase().trim();

    for (const category in commonWords) {
        if (commonWords[category][upperWord]) {
            return true;
        }
    }

    return false;
}

/**
 * Get total letter count for a word
 * Useful for estimating practice time
 * 
 * @param {string} word - Word to count letters for
 * @returns {number} Number of letters
 */
export function getLetterCount(word) {
    const sign = getWordSign(word);
    return sign.letters?.length || 0;
}

/**
 * Get lettrs for an array of words
 * 
 * @param {string[]} words - Array of words
 * @returns {Object[]} Array of sign data for each word
 */
export function getSignsForWords(words) {
    if (!Array.isArray(words)) return [];
    return words.map(word => ({
        word: word.toUpperCase(),
        ...getWordSign(word)
    }));
}

export default commonWords;
