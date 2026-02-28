/**
 * OpenCV Loader Wrapper Component
 * Shows loading spinner/error state while OpenCV initializes
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useOpenCV } from '@/hooks/useOpenCV';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const OpenCVLoader = ({ children, fallback = null }) => {
    const { isLoading, error, isReady } = useOpenCV();

    if (isLoading) {
        return fallback || (
            <div className="flex items-center justify-center p-4">
                <LoadingSpinner text="Loading OpenCV..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-4 border border-error/30 bg-error/5">
                <p className="text-sm text-error">
                    ⚠️ OpenCV failed to load: {error}
                </p>
                <p className="text-xs text-dark-400 mt-1">
                    Enhanced detection features will be unavailable.
                </p>
            </div>
        );
    }

    if (!isReady) {
        return fallback || null;
    }

    return children;
};

export default OpenCVLoader;
