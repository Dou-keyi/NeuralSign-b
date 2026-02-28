/**
 * Performance Optimization for OpenCV Operations
 * Manages frame processing rate and memory usage
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

class PerformanceOptimizer {
    constructor() {
        this.targetFPS = 15;
        this.lastProcessTime = 0;
        this.frameInterval = 1000 / this.targetFPS;
        this.skipFrames = 0;
        this.processedFrames = 0;
        this.totalFrames = 0;

        // Performance metrics
        this.metrics = {
            avgProcessingTime: 0,
            currentFPS: 0,
            memoryUsage: 0,
            frameSkipRate: 0
        };

        // Adaptive settings
        this.adaptiveMode = true;
        this.performanceLevel = 'high'; // 'low', 'medium', 'high'
    }

    /**
     * Check if should process this frame
     * @returns {boolean}
     */
    shouldProcessFrame() {
        const now = Date.now();
        const elapsed = now - this.lastProcessTime;

        this.totalFrames++;

        if (elapsed < this.frameInterval) {
            this.skipFrames++;
            return false;
        }

        this.lastProcessTime = now;
        this.processedFrames++;

        // Update metrics
        this.updateMetrics(elapsed);

        // Adapt performance if enabled
        if (this.adaptiveMode) {
            this.adaptPerformance();
        }

        return true;
    }

    /**
     * Update performance metrics
     */
    updateMetrics(elapsed) {
        // Calculate FPS
        this.metrics.currentFPS = elapsed > 0 ? 1000 / elapsed : 0;

        // Calculate frame skip rate
        this.metrics.frameSkipRate = this.totalFrames > 0
            ? (this.skipFrames / this.totalFrames) * 100
            : 0;

        // Estimate memory usage (approximate)
        if (typeof performance !== 'undefined' && performance.memory) {
            this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
        }
    }

    /**
     * Adapt performance based on current metrics
     */
    adaptPerformance() {
        const { currentFPS } = this.metrics;

        // If FPS too low, reduce quality
        if (currentFPS < 10 && this.performanceLevel !== 'low') {
            this.performanceLevel = 'low';
            this.targetFPS = 10;
            this.frameInterval = 1000 / this.targetFPS;
            console.log('Performance: Switched to LOW mode');
        }

        // If FPS recovering, increase quality
        if (currentFPS > 20 && this.performanceLevel === 'low') {
            this.performanceLevel = 'medium';
            this.targetFPS = 15;
            this.frameInterval = 1000 / this.targetFPS;
            console.log('Performance: Switched to MEDIUM mode');
        }

        if (currentFPS > 25 && this.performanceLevel === 'medium') {
            this.performanceLevel = 'high';
            this.targetFPS = 20;
            this.frameInterval = 1000 / this.targetFPS;
            console.log('Performance: Switched to HIGH mode');
        }

        // If memory usage too high, trigger cleanup warning
        if (this.metrics.memoryUsage > 500) {
            console.warn('High memory usage detected, consider cleanup');
        }
    }

    /**
     * Get processing settings based on performance level
     * @returns {Object} Settings for OpenCV operations
     */
    getProcessingSettings() {
        const settings = {
            low: {
                enablePreprocessing: false,
                enableBackgroundRemoval: false,
                enableMotionTracking: true,
                enableOpticalFlow: false,
                videoQuality: 'low',
                landmarkComplexity: 0,
                maxTrajectoryLength: 30
            },
            medium: {
                enablePreprocessing: true,
                enableBackgroundRemoval: false,
                enableMotionTracking: true,
                enableOpticalFlow: false,
                videoQuality: 'medium',
                landmarkComplexity: 1,
                maxTrajectoryLength: 60
            },
            high: {
                enablePreprocessing: true,
                enableBackgroundRemoval: true,
                enableMotionTracking: true,
                enableOpticalFlow: true,
                videoQuality: 'high',
                landmarkComplexity: 1,
                maxTrajectoryLength: 90
            }
        };

        return settings[this.performanceLevel];
    }

    /** Set target FPS */
    setTargetFPS(fps) {
        this.targetFPS = fps;
        this.frameInterval = 1000 / fps;
    }

    /** Enable/disable adaptive mode */
    setAdaptiveMode(enabled) {
        this.adaptiveMode = enabled;
    }

    /** Manually set performance level */
    setPerformanceLevel(level) {
        if (['low', 'medium', 'high'].includes(level)) {
            this.performanceLevel = level;
            const fpsMap = { low: 10, medium: 15, high: 20 };
            this.targetFPS = fpsMap[level];
            this.frameInterval = 1000 / this.targetFPS;
        }
    }

    /** Get current metrics */
    getMetrics() {
        return { ...this.metrics };
    }

    /** Reset metrics */
    reset() {
        this.skipFrames = 0;
        this.processedFrames = 0;
        this.totalFrames = 0;
        this.lastProcessTime = 0;
    }
}

// Export singleton
export const performanceOptimizer = new PerformanceOptimizer();
