/**
 * SentenceInput Component
 * Dual input component with text and voice input options
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Type,
    Mic,
    MicOff,
    Send,
    Loader2,
    AlertCircle,
    X,
    RefreshCw
} from 'lucide-react';
import Button from '@/components/common/Button';
import { getSpeechService, isSpeechSupported } from '@/services/speechService';

// Example sentences for quick selection
const EXAMPLE_SENTENCES = [
    { text: "Hello, how are you?", category: "Greeting" },
    { text: "My name is John", category: "Introduction" },
    { text: "What time is it?", category: "Question" },
    { text: "I love learning sign language", category: "Expression" },
    { text: "Where are you going?", category: "Question" },
    { text: "Thank you very much", category: "Greeting" },
    { text: "I need help please", category: "Request" },
    { text: "Good morning", category: "Greeting" }
];

const MAX_CHARACTERS = 200;

/**
 * SentenceInput Component
 * @param {Function} onSentenceSubmit - Callback when sentence is submitted
 * @param {boolean} isLoading - Whether translation is in progress
 */
const SentenceInput = ({ onSentenceSubmit, isLoading = false }) => {
    const [inputMethod, setInputMethod] = useState('text'); // 'text' | 'voice'
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState(null);
    const [speechSupported, setSpeechSupported] = useState(true);

    // Check speech support on mount
    useEffect(() => {
        setSpeechSupported(isSpeechSupported());
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isListening) {
                const speechService = getSpeechService();
                speechService.stopListening();
            }
        };
    }, [isListening]);

    // Handle text input change
    const handleTextChange = useCallback((e) => {
        const value = e.target.value;
        if (value.length <= MAX_CHARACTERS) {
            setInputText(value);
            setError(null);
        }
    }, []);

    // Handle example click
    const handleExampleClick = useCallback((example) => {
        setInputText(example.text);
        setError(null);
    }, []);

    // Handle voice input
    const handleStartListening = useCallback(() => {
        if (!speechSupported) {
            setError({
                type: 'not-supported',
                message: getSpeechService().getSupportMessage()
            });
            return;
        }

        setError(null);
        setInterimTranscript('');

        const speechService = getSpeechService();

        const started = speechService.startListening(
            // onResult
            (result) => {
                if (result.isFinal) {
                    setInputText(result.transcript);
                    setInterimTranscript('');
                } else {
                    setInterimTranscript(result.transcript);
                }
            },
            // onError
            (err) => {
                setIsListening(false);
                setError({
                    type: err.error,
                    message: err.message
                });
            },
            // onEnd
            (result) => {
                setIsListening(false);
                if (result.transcript) {
                    setInputText(result.transcript);
                }
            }
        );

        if (started) {
            setIsListening(true);
        }
    }, [speechSupported]);

    // Handle stop listening
    const handleStopListening = useCallback(() => {
        const speechService = getSpeechService();
        speechService.stopListening();
        setIsListening(false);
    }, []);

    // Handle form submit
    const handleSubmit = useCallback((e) => {
        e?.preventDefault();

        const text = inputText.trim();
        if (!text) {
            setError({
                type: 'empty',
                message: 'Please enter a sentence to translate.'
            });
            return;
        }

        if (text.length > MAX_CHARACTERS) {
            setError({
                type: 'too-long',
                message: `Sentence is too long. Maximum ${MAX_CHARACTERS} characters.`
            });
            return;
        }

        setError(null);
        onSentenceSubmit?.(text);
    }, [inputText, onSentenceSubmit]);

    // Clear input
    const handleClear = useCallback(() => {
        setInputText('');
        setInterimTranscript('');
        setError(null);
    }, []);

    const displayText = isListening ? interimTranscript || inputText : inputText;
    const canSubmit = displayText.trim().length > 0 && !isLoading && !isListening;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setInputMethod('text')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${inputMethod === 'text'
                            ? 'bg-primary/20 text-primary border-2 border-primary/50'
                            : 'bg-dark-700/50 text-dark-300 border-2 border-transparent hover:bg-dark-700'
                        }`}
                >
                    <Type className="w-5 h-5" />
                    Type
                </button>
                <button
                    onClick={() => setInputMethod('voice')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${inputMethod === 'voice'
                            ? 'bg-primary/20 text-primary border-2 border-primary/50'
                            : 'bg-dark-700/50 text-dark-300 border-2 border-transparent hover:bg-dark-700'
                        }`}
                    disabled={!speechSupported}
                >
                    <Mic className="w-5 h-5" />
                    Speak
                    {!speechSupported && (
                        <span className="text-xs text-warning">(Not supported)</span>
                    )}
                </button>
            </div>

            {/* Input Area */}
            <AnimatePresence mode="wait">
                {inputMethod === 'text' ? (
                    <motion.div
                        key="text-input"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        {/* Textarea */}
                        <div className="relative">
                            <textarea
                                value={inputText}
                                onChange={handleTextChange}
                                placeholder="Type a sentence you want to learn in sign language..."
                                className="w-full h-32 px-4 py-3 rounded-xl bg-dark-700/50 border-2 border-dark-600 
                                         text-dark-100 placeholder-dark-400 resize-none
                                         focus:outline-none focus:border-primary/50 transition-colors"
                                disabled={isLoading}
                            />
                            {inputText && (
                                <button
                                    onClick={handleClear}
                                    className="absolute top-3 right-3 p-1 rounded-lg bg-dark-600/50 hover:bg-dark-600 transition-colors"
                                >
                                    <X className="w-4 h-4 text-dark-400" />
                                </button>
                            )}
                        </div>

                        {/* Character count */}
                        <div className="flex justify-between items-center mt-2">
                            <span className={`text-sm ${inputText.length > MAX_CHARACTERS * 0.8
                                    ? 'text-warning'
                                    : 'text-dark-400'
                                }`}>
                                {inputText.length}/{MAX_CHARACTERS} characters
                            </span>
                        </div>

                        {/* Example Sentences */}
                        <div className="mt-4">
                            <p className="text-sm text-dark-400 mb-2">Try an example:</p>
                            <div className="flex flex-wrap gap-2">
                                {EXAMPLE_SENTENCES.slice(0, 4).map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleExampleClick(example)}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-dark-700/50 text-dark-300 
                                                 hover:bg-dark-700 hover:text-primary transition-colors"
                                    >
                                        "{example.text}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="voice-input"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col items-center"
                    >
                        {/* Microphone Button */}
                        <div className="relative mb-6">
                            <motion.button
                                onClick={isListening ? handleStopListening : handleStartListening}
                                disabled={isLoading}
                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening
                                        ? 'bg-error text-white'
                                        : 'bg-primary text-white hover:bg-primary-dark'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isListening ? (
                                    <MicOff className="w-10 h-10" />
                                ) : (
                                    <Mic className="w-10 h-10" />
                                )}
                            </motion.button>

                            {/* Pulsing animation when listening */}
                            {isListening && (
                                <>
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-error/30"
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-error/20"
                                        animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                    />
                                </>
                            )}
                        </div>

                        {/* Status text */}
                        <p className="text-dark-300 mb-4">
                            {isListening ? 'Listening... Speak now' : 'Click to start speaking'}
                        </p>

                        {/* Transcript display */}
                        <div className="w-full min-h-[80px] p-4 rounded-xl bg-dark-700/50 border-2 border-dark-600">
                            {displayText ? (
                                <p className="text-dark-100">{displayText}</p>
                            ) : (
                                <p className="text-dark-400 text-center">
                                    Your words will appear here...
                                </p>
                            )}
                        </div>

                        {/* Edit/Re-record buttons */}
                        {displayText && !isListening && (
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleClear}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700/50 
                                             text-dark-300 hover:bg-dark-700 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Clear
                                </button>
                                <button
                                    onClick={handleStartListening}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700/50 
                                             text-dark-300 hover:bg-dark-700 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Re-record
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-3 rounded-xl bg-error/10 border border-error/30 flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-error text-sm">{error.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="mt-6">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    isDisabled={!canSubmit}
                    isLoading={isLoading}
                    leftIcon={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    className="w-full"
                >
                    {isLoading ? 'Translating...' : 'Translate to Sign Language'}
                </Button>
            </div>
        </motion.div>
    );
};

export default SentenceInput;
