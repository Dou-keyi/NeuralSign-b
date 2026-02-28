/**
 * Default Settings Configuration
 * Complete default values for all NeuralSign settings
 */

export const defaultSettings = {
    // ============================================
    // APPEARANCE
    // ============================================
    appearance: {
        theme: 'dark', // 'light', 'dark', 'auto'
        accentColor: '#6366F1',
        backgroundStyle: 'gradient', // 'solid', 'gradient', 'animated'
        font: 'inter',
        fontSize: 16, // base font size in px
        animations: {
            pageTransitions: true,
            achievements: true,
            confetti: true,
            particles: true
        },
        reducedMotion: false
    },

    // ============================================
    // LEARNING PREFERENCES
    // ============================================
    learningPreferences: {
        difficulty: 'intermediate', // 'beginner', 'intermediate', 'advanced'
        defaultPracticeMode: 'free', // 'free', 'flashcard', 'timed'
        defaultDuration: 10, // minutes
        autoStartNext: true,
        feedback: {
            instant: true,
            showAccuracy: true,
            improvementTips: true,
            celebrateAchievements: true
        },
        hints: {
            showAfterAttempts: 3,
            detailLevel: 'medium', // 'low', 'medium', 'high'
            showHandGuides: true,
            show3DReference: true
        },
        aiSensitivity: 50, // 0-100
        autoAdvance: {
            enabled: true,
            waitTime: 2 // seconds
        },
        dailyGoals: {
            practiceMinutes: 15,
            signsCount: 5,
            showNotifications: true
        },
        learningPath: 'alphabet' // 'alphabet', 'common', 'custom'
    },

    // ============================================
    // NOTIFICATIONS
    // ============================================
    notifications: {
        push: {
            enabled: false,
            fcmToken: null
        },
        email: {
            enabled: true
        },
        types: {
            dailyReminder: {
                enabled: true,
                time: '18:00'
            },
            streakWarning: true,
            streakMilestone: true,
            achievements: true,
            achievementProgress: true,
            levelUp: true,
            xpMilestones: true,
            weeklyProgress: {
                enabled: true,
                day: 'sunday',
                time: '08:00'
            },
            dailyChallenge: {
                newChallenge: true,
                time: '08:00',
                expiringSoon: true
            },
            learningReminders: {
                inactivity: true,
                reviewSuggestions: true,
                goalReminders: true
            }
        },
        quietHours: {
            enabled: false,
            from: '22:00',
            to: '08:00'
        }
    },

    // ============================================
    // ACCESSIBILITY
    // ============================================
    accessibility: {
        textSize: 16, // px
        contrast: 'normal', // 'normal', 'high', 'extra-high'
        colorBlindMode: 'none', // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
        reducedMotion: false,
        disableParallax: false,
        disableAutoplay: false,
        screenReader: {
            enhanced: true,
            announceRegions: true,
            describeImages: true
        },
        keyboard: {
            focusIndicators: true,
            shortcuts: true
        },
        timing: {
            autoAdvanceDelay: 3 // seconds
        },
        captions: true,
        handDetection: {
            extendedTime: false,
            lenientValidation: false,
            extraGuidance: false
        }
    },

    // ============================================
    // PRIVACY
    // ============================================
    privacy: {
        profileVisibility: 'public', // 'public', 'friends', 'private'
        leaderboard: {
            appear: true,
            showUsername: true,
            showPicture: false,
            displayAs: 'username' // 'fullName', 'firstName', 'username', 'anonymous'
        },
        activitySharing: {
            achievements: true,
            practice: false,
            progress: false
        },
        dataCollection: {
            analytics: true,
            crashReports: true,
            usageData: false
        },
        thirdParty: {
            sponsorResume: false,
            partnerStats: false
        },
        cookies: 'essential', // 'essential', 'analytics', 'all'
        marketing: {
            emails: false,
            updates: true,
            surveys: false
        }
    },

    // ============================================
    // CAMERA & HAND DETECTION
    // ============================================
    camera: {
        deviceId: 'default',
        mirror: true,
        autoCenter: true,
        quality: 'high', // 'low', 'medium', 'high'
        detection: {
            sensitivity: 50, // 0-100
            confidenceThreshold: 70, // 50-95
            processingFPS: 15, // 10, 15, 20, 30
            showLandmarks: true,
            showFingerMarkers: true,
            showPalmCenter: true,
            colorCodeFingers: true,
            feedback: {
                showStatus: true,
                showConfidence: true,
                highlight: true,
                audio: false
            }
        },
        background: {
            type: 'camera', // 'camera', 'blur', 'solid', 'custom'
            color: '#0F172A',
            imageUrl: null
        },
        lighting: {
            brightness: 50,
            contrast: 50
        }
    },

    // ============================================
    // AUDIO
    // ============================================
    audio: {
        masterVolume: 80,
        soundEffects: {
            enabled: true,
            volume: 80,
            buttonClicks: false,
            success: true,
            error: true,
            achievement: true,
            levelUp: true,
            milestone: true,
            streak: true,
            handDetection: false
        },
        voiceFeedback: {
            enabled: false,
            volume: 80,
            voice: 'en-US-female',
            speed: 'normal', // 'slow', 'normal', 'fast'
            pitch: 50, // 0-100
            announceSignNames: false,
            provideInstructions: false,
            readFeedback: false,
            announceAchievements: false
        },
        backgroundMusic: {
            enabled: false,
            volume: 40,
            style: 'ambient' // 'ambient', 'focus', 'upbeat', 'none'
        },
        haptic: {
            enabled: true,
            intensity: 'medium' // 'low', 'medium', 'high'
        },
        outputDevice: 'default'
    },

    // ============================================
    // LANGUAGE
    // ============================================
    language: {
        app: 'en-US',
        signVariant: 'ASL', // 'ASL', 'BSL', etc.
        regional: {
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h', // '12h', '24h'
            firstDayOfWeek: 'sunday'
        },
        translation: {
            showTranslations: true,
            phonetics: false
        }
    }
};

// Accent color presets
export const accentColors = {
    indigo: '#6366F1',
    purple: '#8B5CF6',
    pink: '#EC4899',
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
    teal: '#14B8A6'
};

// Font options
export const fontOptions = [
    { value: 'inter', label: 'Inter', family: "'Inter', sans-serif" },
    { value: 'system', label: 'System Default', family: 'system-ui, sans-serif' },
    { value: 'roboto', label: 'Roboto', family: "'Roboto', sans-serif" },
    { value: 'opensans', label: 'Open Sans', family: "'Open Sans', sans-serif" }
];

// Language options
export const appLanguages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' }
];

// Sign language variants
export const signLanguageVariants = [
    { value: 'ASL', label: 'ASL (American Sign Language)' },
    { value: 'BSL', label: 'BSL (British Sign Language)' }
];

export default defaultSettings;
