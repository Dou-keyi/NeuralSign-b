/**
 * Level Up Context
 * Global context for managing level-up celebrations
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { createContext, useContext, useState, useCallback } from 'react';
import LevelUpModal from '@/components/xp/LevelUpModal';

const LevelUpContext = createContext(null);

/**
 * Level Up Provider
 * Wrap your app with this to enable level-up celebrations globally
 */
export const LevelUpProvider = ({ children }) => {
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
    const [levelUpData, setLevelUpData] = useState(null);

    /**
     * Trigger the level-up celebration modal
     * Call this when addXP returns leveledUp: true
     * 
     * @param {Object} data - Level up data from xpService
     * @param {number} data.oldLevel - Previous level
     * @param {number} data.newLevelNum - New level number
     * @param {number} data.xpGained - XP gained in this action
     * @param {Array} data.newPerks - New perks unlocked
     */
    const showLevelUp = useCallback((data) => {
        setLevelUpData({
            oldLevel: data.oldLevel || data.newLevelNum - 1,
            newLevel: data.newLevelNum,
            xpGained: data.xpGained || 0,
            newPerks: data.newPerks || []
        });
        setIsLevelUpModalOpen(true);
    }, []);

    /**
     * Close the level-up modal
     */
    const closeLevelUp = useCallback(() => {
        setIsLevelUpModalOpen(false);
        setLevelUpData(null);
    }, []);

    /**
     * Check XP result and show level-up if applicable
     * Convenience function to call after any XP-granting action
     * 
     * @param {Object} xpResult - Result from addXP or awardPracticeXP
     */
    const handleXPResult = useCallback((xpResult) => {
        if (xpResult?.leveledUp) {
            showLevelUp(xpResult);
        }
    }, [showLevelUp]);

    const value = {
        showLevelUp,
        closeLevelUp,
        handleXPResult,
        isLevelUpModalOpen,
        levelUpData
    };

    return (
        <LevelUpContext.Provider value={value}>
            {children}

            {/* Level Up Modal - renders globally */}
            <LevelUpModal
                isOpen={isLevelUpModalOpen}
                onClose={closeLevelUp}
                oldLevel={levelUpData?.oldLevel || 1}
                newLevel={levelUpData?.newLevel || 2}
                xpGained={levelUpData?.xpGained || 0}
                newPerks={levelUpData?.newPerks || []}
            />
        </LevelUpContext.Provider>
    );
};

/**
 * Hook to access level-up context
 * 
 * @returns {Object} Level up context with showLevelUp, closeLevelUp, handleXPResult
 */
export const useLevelUp = () => {
    const context = useContext(LevelUpContext);

    if (!context) {
        console.warn('useLevelUp must be used within a LevelUpProvider');
        // Return no-op functions if not wrapped in provider
        return {
            showLevelUp: () => { },
            closeLevelUp: () => { },
            handleXPResult: () => { },
            isLevelUpModalOpen: false,
            levelUpData: null
        };
    }

    return context;
};

export default LevelUpContext;
