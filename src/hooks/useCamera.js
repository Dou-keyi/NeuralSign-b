/**
 * useCamera Hook
 * Custom React hook for camera management
 * * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Camera configuration options (Preserved from teammate's code)
 */
const DEFAULT_CONSTRAINTS = {
    video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user' // Front camera
    },
    audio: false
};

/**
 * Custom hook for managing camera access
 * * @returns {Object} Camera state and controls
 */
export function useCamera() {
    // State
    const [stream, setStream] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Refs
    const videoRef = useRef(null);
    const streamRef = useRef(null); // 🚀 Added to safely track stream for cleanup

    /**
     * Start the camera
     */
    const startCamera = useCallback(async () => {
        // Prevent multiple starts
        if (isActive || isLoading) {
            console.log('ℹ️ Camera already active or loading');
            return true;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('📷 Requesting camera access...');

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser');
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia(DEFAULT_CONSTRAINTS);

            console.log('✅ Camera access granted');

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;

                await new Promise((resolve, reject) => {
                    const video = videoRef.current;

                    video.onloadedmetadata = () => {
                        video.play()
                            .then(resolve)
                            .catch(reject);
                    };

                    video.onerror = () => reject(new Error('Video loading failed'));
                    setTimeout(() => reject(new Error('Video loading timeout')), 10000);
                });

                console.log(`📹 Video ready: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
            }

            setStream(mediaStream);
            streamRef.current = mediaStream; // 🚀 Sync ref for stable cleanup
            setIsActive(true);
            setIsLoading(false);

            return true;
        } catch (err) {
            console.error('❌ Camera error:', err);
            let errorMessage = 'Failed to start camera.';

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMessage = 'Camera permission denied. Please allow camera access.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                errorMessage = 'No camera found.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                errorMessage = 'Camera is in use by another app.';
            } else {
                errorMessage = err.message || errorMessage;
            }

            setError(errorMessage);
            setIsLoading(false);
            setIsActive(false);
            return false;
        }
    }, [isActive, isLoading]);

    /**
     * Stop the camera
     */
    const stopCamera = useCallback(() => {
        console.log('🛑 Stopping camera...');

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log(`⏹️ Stopped track: ${track.kind}`);
            });
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setStream(null);
        streamRef.current = null;
        setIsActive(false);
        setError(null);

        console.log('✅ Camera stopped');
    }, []);

    const retry = useCallback(() => {
        setError(null);
        startCamera();
    }, [startCamera]);

    /**
     * 🚀 FIX: Stable Cleanup Logic
     * Removed [stream] dependency to prevent "auth-then-immediate-kill" loop.
     * Uses streamRef to ensure cleanup only happens when the component is TRULY unmounted.
     */
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                console.log('🧹 Cleaning up camera ONCE on true unmount...');
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // 👈 Empty dependency array is critical for stability

    return {
        stream,
        isActive,
        isLoading,
        error,
        videoRef,
        startCamera,
        stopCamera,
        retry
    };
}

export default useCamera;