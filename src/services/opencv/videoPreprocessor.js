/**
 * Video Preprocessing Service using OpenCV
 * Enhances video frames for better hand detection
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { getOpenCV } from './opencvLoader';

class VideoPreprocessor {
    constructor() {
        this.cv = null;
    }

    async initialize() {
        if (!this.cv) {
            this.cv = await getOpenCV();
        }
    }

    /**
     * Remove background from video frame using skin detection
     * @param {HTMLVideoElement|HTMLCanvasElement} source
     * @returns {cv.Mat} Processed frame with background removed
     */
    removeBackground(source) {
        if (!this.cv) throw new Error('OpenCV not initialized');

        const cv = this.cv;
        const src = cv.imread(source);
        const dst = new cv.Mat();

        try {
            // Convert to HSV for skin detection
            const hsv = new cv.Mat();
            cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
            cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

            // Define skin color range in HSV
            const lowerSkin = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 20, 70, 0]);
            const upperSkin = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [20, 255, 255, 255]);

            // Create mask for skin pixels
            const mask = new cv.Mat();
            cv.inRange(hsv, lowerSkin, upperSkin, mask);

            // Apply morphological operations to clean up mask
            const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5));
            cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);
            cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);

            // Apply mask to original image
            cv.bitwise_and(src, src, dst, mask);

            // Clean up
            hsv.delete();
            lowerSkin.delete();
            upperSkin.delete();
            mask.delete();
            kernel.delete();
            src.delete();

            return dst;
        } catch (error) {
            console.error('Background removal error:', error);
            src.delete();
            if (!dst.empty?.()) dst.delete();
            throw error;
        }
    }

    /**
     * Enhance lighting and contrast
     * @param {cv.Mat} src Source frame
     * @returns {cv.Mat} Enhanced frame
     */
    enhanceLighting(src) {
        if (!this.cv) throw new Error('OpenCV not initialized');

        const cv = this.cv;
        const dst = new cv.Mat();

        try {
            // Convert to LAB color space
            const lab = new cv.Mat();
            cv.cvtColor(src, lab, cv.COLOR_RGB2Lab);

            // Split channels
            const channels = new cv.MatVector();
            cv.split(lab, channels);

            // Apply CLAHE to L channel
            const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
            const lChannel = channels.get(0);
            clahe.apply(lChannel, lChannel);

            // Merge channels back
            cv.merge(channels, lab);

            // Convert back to RGB
            cv.cvtColor(lab, dst, cv.COLOR_Lab2RGB);

            // Clean up
            lab.delete();
            channels.delete();

            return dst;
        } catch (error) {
            console.error('Lighting enhancement error:', error);
            if (!dst.empty?.()) dst.delete();
            throw error;
        }
    }

    /**
     * Reduce noise in frame
     * @param {cv.Mat} src Source frame
     * @returns {cv.Mat} Denoised frame
     */
    reduceNoise(src) {
        if (!this.cv) throw new Error('OpenCV not initialized');

        const cv = this.cv;
        const dst = new cv.Mat();

        try {
            cv.bilateralFilter(src, dst, 9, 75, 75, cv.BORDER_DEFAULT);
            return dst;
        } catch (error) {
            console.error('Noise reduction error:', error);
            if (!dst.empty?.()) dst.delete();
            throw error;
        }
    }

    /**
     * Stabilize video by reducing jitter
     * @param {cv.Mat} currentFrame Current frame
     * @param {cv.Mat} previousFrame Previous frame (optional)
     * @returns {cv.Mat} Stabilized frame
     */
    stabilizeFrame(currentFrame, previousFrame) {
        if (!this.cv || !previousFrame) {
            return currentFrame.clone();
        }

        const cv = this.cv;
        const dst = new cv.Mat();

        try {
            const alpha = 0.7;
            const beta = 0.3;
            cv.addWeighted(currentFrame, alpha, previousFrame, beta, 0, dst);
            return dst;
        } catch (error) {
            console.error('Frame stabilization error:', error);
            if (!dst.empty?.()) dst.delete();
            return currentFrame.clone();
        }
    }

    /**
     * Complete preprocessing pipeline
     * @param {HTMLVideoElement|HTMLCanvasElement} source
     * @param {Object} options Preprocessing options
     * @returns {cv.Mat} Fully preprocessed frame
     */
    preprocessFrame(source, options = {}) {
        const {
            removeBackground: removeBg = true,
            enhanceLighting: enhanceLight = true,
            reduceNoise: noise = true,
            stabilize = false,
            previousFrame = null
        } = options;

        if (!this.cv) throw new Error('OpenCV not initialized');

        const cv = this.cv;
        let frame = cv.imread(source);

        try {
            if (noise) {
                const denoised = this.reduceNoise(frame);
                frame.delete();
                frame = denoised;
            }

            if (enhanceLight) {
                const enhanced = this.enhanceLighting(frame);
                frame.delete();
                frame = enhanced;
            }

            if (removeBg) {
                const noBg = this.removeBackground(frame);
                frame.delete();
                frame = noBg;
            }

            if (stabilize && previousFrame) {
                const stabilized = this.stabilizeFrame(frame, previousFrame);
                frame.delete();
                frame = stabilized;
            }

            return frame;
        } catch (error) {
            console.error('Preprocessing pipeline error:', error);
            if (frame) frame.delete();
            throw error;
        }
    }

    /**
     * Convert Mat to Canvas for display
     * @param {cv.Mat} mat OpenCV Mat
     * @param {HTMLCanvasElement} canvas Target canvas
     */
    matToCanvas(mat, canvas) {
        if (!this.cv) throw new Error('OpenCV not initialized');
        this.cv.imshow(canvas, mat);
    }

    /** Clean up resources */
    cleanup() {
        // OpenCV Mats are cleaned up individually
    }
}

// Export singleton instance
export const videoPreprocessor = new VideoPreprocessor();
