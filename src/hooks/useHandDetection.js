/**
 * useHandDetection Hook
 * Combines camera + MediaPipe + Gemini for hand sign detection and validation
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useCamera } from './useCamera';
import {
    initializeMediaPipe,
    processVideoFrame,
    drawHandLandmarks,
    extractHandLandmarks,
    cleanupMediaPipe
} from '../services/mediapipeService';
import { captureFrameFromVideo, validateHandSign, getCooldownRemaining } from '../services/geminiService';

// Cooldown between validations (in milliseconds)
// Note: Gemini API has rate limits, 5s helps avoid hitting them
const VALIDATION_COOLDOWN = 5000;
const FRAME_PROCESS_INTERVAL = 33; // ~30fps

/**
 * Custom hook for hand detection and sign validation
 * 
 * @param {Object} options - Hook options
 * @param {string} options.targetLetter - Target letter to practice
 * @param {Function} options.onCorrectSign - Callback when sign is correct
 * @param {Function} options.onValidationResult - Callback with validation result
 * @returns {Object} Detection state and controls
 */
export function useHandDetection({
    targetLetter = 'A',
    onCorrectSign = null,
    onValidationResult = null
} = {}) {
    // Use camera hook
    const {
        videoRef,
        isActive: isCameraActive,
        isLoading: isCameraLoading,
        error: cameraError,
        startCamera,
        stopCamera: stopCameraBase
    } = useCamera();

    // State
    const [isDetecting, setIsDetecting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [handDetected, setHandDetected] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [detectionResult, setDetectionResult] = useState(null);
    const [error, setError] = useState(null);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [dwellProgress, setDwellProgress] = useState(0);
    const dwellStartTimeRef = useRef(null);

    // Refs
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const lastProcessTime = useRef(0);
    const lastValidationTime = useRef(0);
    const isProcessingRef = useRef(false);
    const mediaPipeReadyRef = useRef(false);

    /**
     * Handle MediaPipe results
     */
    const handleMediaPipeResults = useCallback((results) => {
        // Draw landmarks on canvas
        if (canvasRef.current) {
            drawHandLandmarks(canvasRef.current, results, false);
        }

        // Extract landmark data
        const landmarkData = extractHandLandmarks(results);
        setHandDetected(landmarkData.detected);
        setDetectionResult(landmarkData);
    }, []);

    /**
     * Process video frames in a loop
     */
    const processFrameLoop = useCallback(async () => {
        if (!isDetecting || !videoRef.current || !mediaPipeReadyRef.current) {
            return;
        }

        const now = performance.now();

        // Throttle processing to ~30fps
        if (now - lastProcessTime.current >= FRAME_PROCESS_INTERVAL) {
            if (!isProcessingRef.current && videoRef.current.readyState >= 2) {
                isProcessingRef.current = true;

                try {
                    await processVideoFrame(videoRef.current);
                } catch (err) {
                    console.warn('⚠️ Frame processing error:', err);
                }

                isProcessingRef.current = false;
            }
            lastProcessTime.current = now;
        }

        // Continue loop
        animationFrameRef.current = requestAnimationFrame(processFrameLoop);
    }, [isDetecting, videoRef]);

    /**
     * Start detection
     */
    const startDetection = useCallback(async () => {
        setError(null);
        setValidationResult(null);

        try {
            // Start camera first
            console.log('🎬 Starting detection...');
            const cameraStarted = await startCamera();

            if (!cameraStarted) {
                setError('Failed to start camera');
                return false;
            }

            // Initialize MediaPipe
            console.log('🤖 Initializing MediaPipe...');
            await initializeMediaPipe(handleMediaPipeResults);
            mediaPipeReadyRef.current = true;

            // Start detection
            setIsDetecting(true);

            console.log('✅ Detection started');
            return true;
        } catch (err) {
            console.error('❌ Failed to start detection:', err);
            setError(err.message || 'Failed to start hand detection');
            mediaPipeReadyRef.current = false;
            return false;
        }
    }, [startCamera, handleMediaPipeResults]);

    /**
     * Stop detection
     */
    const stopDetection = useCallback(() => {
        console.log('🛑 Stopping detection...');

        // Cancel animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Stop camera
        stopCameraBase();

        // Clear canvas
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }

        // Reset state
        setIsDetecting(false);
        setHandDetected(false);
        setDetectionResult(null);
        mediaPipeReadyRef.current = false;

        console.log('✅ Detection stopped');
    }, [stopCameraBase]);

    /**
     * Validate the current sign
     */
    const validateSign = useCallback(async () => {
        // Check cooldown
        const now = Date.now();
        const timeSinceLastValidation = now - lastValidationTime.current;

        if (timeSinceLastValidation < VALIDATION_COOLDOWN) {
            const remaining = Math.ceil((VALIDATION_COOLDOWN - timeSinceLastValidation) / 1000);
            console.log(`⏳ Cooldown: ${remaining}s remaining`);
            return null;
        }

        // Check if we can validate
        if (!videoRef.current || !isCameraActive) {
            console.warn('⚠️ Camera not ready for validation');
            return null;
        }

        if (isValidating) {
            console.log('ℹ️ Already validating');
            return null;
        }

        try {
            setIsValidating(true);
            console.log(`🔍 Validating sign for letter "${targetLetter}"...`);

            // Capture frame
            const imageBase64 = captureFrameFromVideo(videoRef.current);

            if (!imageBase64) {
                throw new Error('Failed to capture video frame');
            }

            // Validate with Gemini
            const result = await validateHandSign(imageBase64, targetLetter);

            // Update last validation time
            lastValidationTime.current = Date.now();

            // Update state
            setValidationResult(result);

            // Call callbacks
            if (onValidationResult) {
                onValidationResult(result);
            }

            if (result.isCorrect && onCorrectSign) {
                onCorrectSign(result);
            }

            console.log('✅ Validation complete:', result);
            return result;
        } catch (err) {
            console.error('❌ Validation error:', err);

            const errorResult = {
                isCorrect: false,
                accuracy: 0,
                feedback: 'Unable to analyze. Please try again.',
                suggestions: ['Check your hand position', 'Try again']
            };

            setValidationResult(errorResult);

            if (onValidationResult) {
                onValidationResult(errorResult);
            }

            return errorResult;
        } finally {
            setIsValidating(false);
        }
    }, [targetLetter, isCameraActive, isValidating, onCorrectSign, onValidationResult, videoRef]);

    /**
     * Clear validation result
     */
    const clearValidation = useCallback(() => {
        setValidationResult(null);
    }, []);

    /**
     * Start frame processing loop when detecting
     */
    useEffect(() => {
        if (isDetecting && isCameraActive && mediaPipeReadyRef.current) {
            console.log('🔄 Starting frame processing loop');
            processFrameLoop();
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isDetecting, isCameraActive, processFrameLoop]);

    /**
     * 🚀 NEW: 5-Second Dwell Progress Timer
     * Fills up a progress bar. When it hits 100%, it automatically sends the photo to Gemini!
     */
    useEffect(() => {
        let frameId;
        const processDwell = () => {
            // If camera is off, no hand is visible, we are currently validating, or we are in cooldown
            if (!isDetecting || !handDetected || isValidating || cooldownRemaining > 0) {
                setDwellProgress(0);
                dwellStartTimeRef.current = null;
                frameId = requestAnimationFrame(processDwell);
                return;
            }

            // Start or update the timer
            if (!dwellStartTimeRef.current) {
                dwellStartTimeRef.current = Date.now();
            } else {
                const elapsed = Date.now() - dwellStartTimeRef.current;
                const progress = Math.min(100, (elapsed / 5000) * 100); // 5000ms = 5 seconds
                setDwellProgress(progress);

                // When the bar hits 100%, trigger Gemini automatically!
                if (progress === 100) {
                    console.log('⏱️ 5 seconds complete! Auto-triggering Gemini...');
                    setDwellProgress(0);
                    dwellStartTimeRef.current = null;
                    validateSign();
                    return; // Stop this loop temporarily while it validates
                }
            }
            frameId = requestAnimationFrame(processDwell);
        };
        
        frameId = requestAnimationFrame(processDwell);
        return () => cancelAnimationFrame(frameId);
    }, [isDetecting, handDetected, isValidating, cooldownRemaining, validateSign]);
    /**
     * Update cooldown timer - polls geminiService for API cooldown
     */
    useEffect(() => {
        let interval;

        const updateCooldown = () => {
            // Get API-level cooldown from geminiService
            const apiCooldown = getCooldownRemaining();

            // Calculate local validation cooldown
            const now = Date.now();
            const timeSinceLastValidation = now - lastValidationTime.current;
            const localCooldown = Math.max(0, VALIDATION_COOLDOWN - timeSinceLastValidation);

            // Use the larger of the two cooldowns
            const totalCooldown = Math.max(apiCooldown, localCooldown);
            const remainingSeconds = Math.ceil(totalCooldown / 1000);

            setCooldownRemaining(remainingSeconds);
        };

        // Update immediately
        updateCooldown();

        // Poll every 500ms while there's a cooldown
        interval = setInterval(updateCooldown, 500);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [validationResult]); // Re-run when validation result changes

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            cleanupMediaPipe();
        };
    }, []);

    return {
        // Refs
        videoRef,
        canvasRef,

        // State
        isDetecting,
        isValidating,
        isCameraActive,
        isCameraLoading,
        handDetected,
        detectionResult,
        validationResult,
        error: error || cameraError,
        cooldownRemaining,
        dwellProgress,

        // Actions
        startDetection,
        stopDetection,
        validateSign,
        clearValidation
    };
}

export default useHandDetection;
