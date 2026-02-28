/**
 * OpenCV.js Loader and Initialization Service
 * Handles async loading of OpenCV and provides ready state
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

// Use jsDelivr CDN — much faster and more reliable than docs.opencv.org
const OPENCV_CDN_URL = 'https://cdn.jsdelivr.net/npm/opencv.js@1.2.1/opencv.min.js';
const LOAD_TIMEOUT_MS = 60000; // 60 seconds (OpenCV WASM is ~8 MB)

class OpenCVLoader {
    constructor() {
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
        this.cv = null;
    }

    /**
     * Load OpenCV.js library
     * @returns {Promise} OpenCV cv object
     */
    async load() {
        // If already loaded, return immediately
        if (this.isLoaded && this.cv) {
            return this.cv;
        }

        // If currently loading, wait for that promise
        if (this.isLoading && this.loadPromise) {
            return this.loadPromise;
        }

        // Start loading
        this.isLoading = true;

        this.loadPromise = new Promise((resolve, reject) => {
            // Check if OpenCV is already available globally
            if (typeof window.cv !== 'undefined' && window.cv.Mat) {
                console.log('OpenCV already loaded');
                this.cv = window.cv;
                this.isLoaded = true;
                this.isLoading = false;
                resolve(this.cv);
                return;
            }

            // Set up the Module config BEFORE loading the script
            // OpenCV.js looks for this to know when WASM is ready
            window.Module = {
                onRuntimeInitialized: () => {
                    console.log('OpenCV.js WASM runtime initialized');
                    this.cv = window.cv;
                    this.isLoaded = true;
                    this.isLoading = false;
                    resolve(this.cv);
                }
            };

            // Create and inject script element
            const script = document.createElement('script');
            script.async = true;
            script.src = OPENCV_CDN_URL;

            script.onerror = () => {
                console.error('Failed to load OpenCV.js from CDN');
                this.isLoading = false;
                reject(new Error('Failed to load OpenCV.js — check your internet connection.'));
            };

            // Timeout
            const timer = setTimeout(() => {
                if (!this.isLoaded) {
                    console.error('OpenCV.js loading timeout after', LOAD_TIMEOUT_MS / 1000, 's');
                    this.isLoading = false;
                    reject(new Error('OpenCV.js loading timeout. The library is ~8 MB — try on a faster connection.'));
                }
            }, LOAD_TIMEOUT_MS);

            // Clear timeout on success
            const originalOnInit = window.Module.onRuntimeInitialized;
            window.Module.onRuntimeInitialized = () => {
                clearTimeout(timer);
                originalOnInit();
            };

            document.head.appendChild(script);
        });

        return this.loadPromise;
    }

    /**
     * Get OpenCV instance (must be loaded first)
     * @returns {Object|null} OpenCV cv object
     */
    getCV() {
        return this.cv;
    }

    /**
     * Check if OpenCV is loaded
     * @returns {boolean}
     */
    isReady() {
        return this.isLoaded && this.cv !== null;
    }

    /**
     * Wait for OpenCV to be ready
     * @returns {Promise}
     */
    async waitForReady() {
        if (this.isReady()) {
            return this.cv;
        }
        return await this.load();
    }
}

// Export singleton instance
export const opencvLoader = new OpenCVLoader();

// Helper function to get cv
export async function getOpenCV() {
    return await opencvLoader.load();
}

// Helper function to check if ready
export function isOpenCVReady() {
    return opencvLoader.isReady();
}
