/**
 * React hook to load and use OpenCV
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect } from 'react';
import { opencvLoader } from '../services/opencv/opencvLoader';

/**
 * React hook to load and use OpenCV
 * @returns {Object} { cv, isLoading, error, isReady }
 */
export function useOpenCV() {
    const [cv, setCV] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadOpenCV = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const cvInstance = await opencvLoader.load();

                if (!cancelled) {
                    setCV(cvInstance);
                }
            } catch (err) {
                console.error('Error loading OpenCV:', err);
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadOpenCV();

        return () => {
            cancelled = true;
        };
    }, []);

    return {
        cv,
        isLoading,
        error,
        isReady: cv !== null
    };
}
