/**
 * Speech Recognition Service
 * Handles voice-to-text conversion using Web Speech API
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

/**
 * SpeechRecognitionService class
 * Provides voice input functionality using browser's Speech Recognition API
 */
export class SpeechRecognitionService {
    constructor() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        this.isAvailable = !!SpeechRecognition;
        this.recognition = null;
        this.transcript = '';
        this.isListening = false;

        if (this.isAvailable) {
            this.recognition = new SpeechRecognition();
            this.setupRecognition();
        }
    }

    /**
     * Configure speech recognition settings
     */
    setupRecognition() {
        if (!this.recognition) return;

        // Configuration
        this.recognition.lang = 'en-US';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
    }

    /**
     * Check if Speech Recognition is supported in current browser
     * @returns {boolean} Whether speech recognition is available
     */
    isSupported() {
        return this.isAvailable;
    }

    /**
     * Get browser compatibility message
     * @returns {string} Message about browser support
     */
    getSupportMessage() {
        if (this.isAvailable) {
            return 'Voice input is supported in your browser.';
        }

        // Detect browser for helpful message
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('firefox')) {
            return 'Voice input has limited support in Firefox. Please use Chrome or Edge for the best experience.';
        } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
            return 'Voice input is supported in Safari. Please allow microphone access when prompted.';
        }

        return 'Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.';
    }

    /**
     * Start listening for speech
     * @param {Function} onResult - Callback for transcript updates (interim and final)
     * @param {Function} onError - Callback for errors
     * @param {Function} onEnd - Callback when recognition ends
     * @returns {boolean} Whether listening started successfully
     */
    startListening(onResult, onError, onEnd) {
        if (!this.isAvailable || !this.recognition) {
            onError?.({
                error: 'not-supported',
                message: this.getSupportMessage()
            });
            return false;
        }

        if (this.isListening) {
            console.warn('⚠️ Already listening');
            return false;
        }

        this.transcript = '';
        this.isListening = true;

        // Set up event handlers
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Update stored transcript
            if (finalTranscript) {
                this.transcript += finalTranscript;
            }

            // Call result callback with current state
            onResult?.({
                transcript: this.transcript + interimTranscript,
                isFinal: !!finalTranscript,
                interimTranscript
            });
        };

        this.recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error);
            this.isListening = false;

            const errorMessages = {
                'no-speech': 'No speech detected. Please try again.',
                'audio-capture': 'No microphone found. Please check your device.',
                'not-allowed': 'Microphone permission denied. Please allow access in your browser settings.',
                'network': 'Network error. Please check your connection.',
                'aborted': 'Speech recognition was aborted.',
                'service-not-allowed': 'Speech recognition service is not allowed.'
            };

            onError?.({
                error: event.error,
                message: errorMessages[event.error] || `Speech recognition error: ${event.error}`
            });
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('🎤 Speech recognition ended');
            onEnd?.({
                transcript: this.transcript
            });
        };

        this.recognition.onspeechend = () => {
            // Auto-stop after speech ends
            console.log('🎙️ Speech ended, stopping recognition...');
        };

        // Start recognition
        try {
            this.recognition.start();
            console.log('🎤 Speech recognition started');
            return true;
        } catch (error) {
            console.error('❌ Failed to start speech recognition:', error);
            this.isListening = false;
            onError?.({
                error: 'start-failed',
                message: 'Failed to start speech recognition. Please try again.'
            });
            return false;
        }
    }

    /**
     * Stop listening for speech
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
                console.log('🎤 Speech recognition stopped');
            } catch (error) {
                console.error('❌ Error stopping speech recognition:', error);
            }
            this.isListening = false;
        }
    }

    /**
     * Abort speech recognition (cancel without triggering onend)
     */
    abort() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.abort();
                console.log('🎤 Speech recognition aborted');
            } catch (error) {
                console.error('❌ Error aborting speech recognition:', error);
            }
            this.isListening = false;
        }
    }

    /**
     * Get the current transcript
     * @returns {string} The current transcript
     */
    getTranscript() {
        return this.transcript;
    }

    /**
     * Check if currently listening
     * @returns {boolean} Whether recognition is active
     */
    getIsListening() {
        return this.isListening;
    }

    /**
     * Clear the current transcript
     */
    clearTranscript() {
        this.transcript = '';
    }
}

// Singleton instance
let speechServiceInstance = null;

/**
 * Get the shared SpeechRecognitionService instance
 * @returns {SpeechRecognitionService} The service instance
 */
export function getSpeechService() {
    if (!speechServiceInstance) {
        speechServiceInstance = new SpeechRecognitionService();
    }
    return speechServiceInstance;
}

/**
 * Check if speech recognition is supported
 * @returns {boolean} Whether speech recognition is available
 */
export function isSpeechSupported() {
    return getSpeechService().isSupported();
}

export default SpeechRecognitionService;
