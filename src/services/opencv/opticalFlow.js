/**
 * Optical Flow Service
 * Tracks motion using Lucas-Kanade optical flow
 * Provides dense motion information for complex gesture recognition
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { getOpenCV } from './opencvLoader';

class OpticalFlowAnalyzer {
    constructor() {
        this.cv = null;
        this.prevGray = null;
        this.featurePoints = [];
        this.initialized = false;
    }

    async initialize() {
        if (!this.cv) {
            this.cv = await getOpenCV();
            this.initialized = true;
        }
    }

    /**
     * Calculate optical flow between two frames
     * @param {cv.Mat} currentFrame Current frame
     * @param {Array} landmarks Hand landmarks to track
     * @returns {Object} Flow analysis
     */
    calculateFlow(currentFrame, landmarks) {
        if (!this.initialized || !this.cv) {
            throw new Error('OpticalFlowAnalyzer not initialized');
        }

        const cv = this.cv;

        // Convert to grayscale if needed
        let gray = new cv.Mat();
        if (currentFrame.channels() > 1) {
            cv.cvtColor(currentFrame, gray, cv.COLOR_RGBA2GRAY);
        } else {
            gray = currentFrame.clone();
        }

        // If no previous frame, initialize
        if (!this.prevGray) {
            this.prevGray = gray.clone();
            this.initializeFeaturePoints(landmarks);
            gray.delete();
            return {
                hasFlow: false,
                vectors: [],
                avgFlow: { x: 0, y: 0, magnitude: 0 }
            };
        }

        try {
            // Create feature points from landmarks
            const p0 = this.landmarksToPoints(landmarks);

            // Calculate optical flow using Lucas-Kanade
            const p1 = new cv.Mat();
            const st = new cv.Mat();
            const err = new cv.Mat();

            const winSize = new cv.Size(15, 15);
            const maxLevel = 2;
            const criteria = new cv.TermCriteria(
                cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT,
                10,
                0.03
            );

            cv.calcOpticalFlowPyrLK(
                this.prevGray,
                gray,
                p0,
                p1,
                st,
                err,
                winSize,
                maxLevel,
                criteria
            );

            // Extract motion vectors
            const vectors = this.extractMotionVectors(p0, p1, st);

            // Calculate average flow
            const avgFlow = this.calculateAverageFlow(vectors);

            // Update previous frame
            this.prevGray.delete();
            this.prevGray = gray.clone();

            // Clean up
            p0.delete();
            p1.delete();
            st.delete();
            err.delete();
            gray.delete();

            return {
                hasFlow: vectors.length > 0,
                vectors,
                avgFlow,
                pointCount: vectors.length
            };
        } catch (error) {
            console.error('Optical flow calculation error:', error);
            gray.delete();
            return {
                hasFlow: false,
                vectors: [],
                avgFlow: { x: 0, y: 0, magnitude: 0 }
            };
        }
    }

    /** Initialize feature points from landmarks */
    initializeFeaturePoints(landmarks) {
        this.featurePoints = landmarks.map(lm => ({
            x: lm.x,
            y: lm.y
        }));
    }

    /** Convert landmarks to OpenCV Point2f Mat */
    landmarksToPoints(landmarks) {
        if (!this.cv) return null;

        const cv = this.cv;
        const points = new cv.Mat(landmarks.length, 1, cv.CV_32FC2);

        for (let i = 0; i < landmarks.length; i++) {
            points.data32F[i * 2] = landmarks[i].x * 640;
            points.data32F[i * 2 + 1] = landmarks[i].y * 480;
        }

        return points;
    }

    /** Extract motion vectors from optical flow results */
    extractMotionVectors(p0, p1, status) {
        const vectors = [];

        for (let i = 0; i < status.rows; i++) {
            if (status.data[i] === 1) {
                const oldX = p0.data32F[i * 2];
                const oldY = p0.data32F[i * 2 + 1];
                const newX = p1.data32F[i * 2];
                const newY = p1.data32F[i * 2 + 1];

                const dx = newX - oldX;
                const dy = newY - oldY;
                const magnitude = Math.sqrt(dx * dx + dy * dy);

                vectors.push({
                    index: i,
                    oldPoint: { x: oldX, y: oldY },
                    newPoint: { x: newX, y: newY },
                    dx,
                    dy,
                    magnitude,
                    angle: Math.atan2(dy, dx) * 180 / Math.PI
                });
            }
        }

        return vectors;
    }

    /** Calculate average flow vector */
    calculateAverageFlow(vectors) {
        if (vectors.length === 0) {
            return { x: 0, y: 0, magnitude: 0, angle: 0 };
        }

        let sumDx = 0;
        let sumDy = 0;

        for (const vector of vectors) {
            sumDx += vector.dx;
            sumDy += vector.dy;
        }

        const avgDx = sumDx / vectors.length;
        const avgDy = sumDy / vectors.length;
        const magnitude = Math.sqrt(avgDx * avgDx + avgDy * avgDy);
        const angle = Math.atan2(avgDy, avgDx) * 180 / Math.PI;

        return { x: avgDx, y: avgDy, magnitude, angle };
    }

    /** Analyze flow pattern */
    analyzeFlowPattern(vectors) {
        if (vectors.length < 5) {
            return { pattern: 'insufficient', confidence: 0 };
        }

        const avgFlow = this.calculateAverageFlow(vectors);

        let similaritySum = 0;
        for (const vector of vectors) {
            const angleDiff = Math.abs(vector.angle - avgFlow.angle);
            const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);
            const similarity = 1 - (normalizedDiff / 180);
            similaritySum += similarity;
        }

        const avgSimilarity = similaritySum / vectors.length;

        let pattern = 'unknown';

        if (avgSimilarity > 0.8) {
            pattern = this.classifyLinearMotion(avgFlow);
        } else if (avgSimilarity > 0.5) {
            pattern = 'curved';
        } else {
            pattern = this.classifyComplexMotion(vectors);
        }

        return {
            pattern,
            confidence: avgSimilarity,
            avgFlow,
            vectorCount: vectors.length
        };
    }

    /** Classify linear motion direction */
    classifyLinearMotion(avgFlow) {
        const normalized = (avgFlow.angle + 360) % 360;

        if (normalized >= 337.5 || normalized < 22.5) return 'right';
        if (normalized >= 22.5 && normalized < 67.5) return 'down-right';
        if (normalized >= 67.5 && normalized < 112.5) return 'down';
        if (normalized >= 112.5 && normalized < 157.5) return 'down-left';
        if (normalized >= 157.5 && normalized < 202.5) return 'left';
        if (normalized >= 202.5 && normalized < 247.5) return 'up-left';
        if (normalized >= 247.5 && normalized < 292.5) return 'up';
        return 'up-right';
    }

    /** Classify complex motion pattern */
    classifyComplexMotion(vectors) {
        const angles = vectors.map(v => v.angle);

        let angleChanges = 0;
        for (let i = 1; i < angles.length; i++) {
            const diff = angles[i] - angles[i - 1];
            if (Math.abs(diff) > 30) {
                angleChanges++;
            }
        }

        if (angleChanges > vectors.length * 0.3) {
            return 'circular';
        }

        const positions = vectors.map(v => v.newPoint);
        if (this.detectOscillation(positions)) {
            return 'oscillating';
        }

        return 'complex';
    }

    /** Detect oscillation in positions */
    detectOscillation(positions) {
        if (positions.length < 5) return false;

        let xDirectionChanges = 0;
        let lastXDir = null;

        for (let i = 1; i < positions.length; i++) {
            const xDiff = positions[i].x - positions[i - 1].x;
            if (Math.abs(xDiff) > 1) {
                const xDir = xDiff > 0 ? 'right' : 'left';
                if (lastXDir && xDir !== lastXDir) {
                    xDirectionChanges++;
                }
                lastXDir = xDir;
            }
        }

        let yDirectionChanges = 0;
        let lastYDir = null;

        for (let i = 1; i < positions.length; i++) {
            const yDiff = positions[i].y - positions[i - 1].y;
            if (Math.abs(yDiff) > 1) {
                const yDir = yDiff > 0 ? 'down' : 'up';
                if (lastYDir && yDir !== lastYDir) {
                    yDirectionChanges++;
                }
                lastYDir = yDir;
            }
        }

        return xDirectionChanges >= 2 || yDirectionChanges >= 2;
    }

    /** Visualize optical flow (for debugging) */
    visualizeFlow(canvas, vectors, scale = 2) {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;

        for (const vector of vectors) {
            const x1 = vector.oldPoint.x;
            const y1 = vector.oldPoint.y;
            const x2 = x1 + vector.dx * scale;
            const y2 = y1 + vector.dy * scale;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            const angle = Math.atan2(vector.dy, vector.dx);
            const arrowSize = 5;

            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(
                x2 - arrowSize * Math.cos(angle - Math.PI / 6),
                y2 - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(x2, y2);
            ctx.lineTo(
                x2 - arrowSize * Math.cos(angle + Math.PI / 6),
                y2 - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
        }
    }

    /** Reset analyzer */
    reset() {
        if (this.prevGray) {
            this.prevGray.delete();
            this.prevGray = null;
        }
        this.featurePoints = [];
    }

    /** Clean up resources */
    cleanup() {
        this.reset();
    }
}

// Export singleton instance
export const opticalFlowAnalyzer = new OpticalFlowAnalyzer();
