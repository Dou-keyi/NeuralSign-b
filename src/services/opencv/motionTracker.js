/**
 * Motion Tracking Service
 * Tracks hand movement over time to detect gestures and patterns
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { getOpenCV } from './opencvLoader';

class MotionTracker {
    constructor() {
        this.cv = null;
        this.trajectoryHistory = [];
        this.maxHistoryLength = 60; // Store last 60 frames (2 seconds at 30fps)
        this.previousFrame = null;
        this.velocityHistory = [];
    }

    async initialize() {
        if (!this.cv) {
            this.cv = await getOpenCV();
        }
    }

    /**
     * Add new hand position to trajectory
     * @param {Array} landmarks MediaPipe hand landmarks
     * @param {number} timestamp Frame timestamp
     */
    addPosition(landmarks, timestamp) {
        if (!landmarks || landmarks.length === 0) {
            return;
        }

        // Calculate palm center (average of key landmarks)
        const palmCenter = this.calculatePalmCenter(landmarks);

        // Create position entry
        const position = {
            x: palmCenter.x,
            y: palmCenter.y,
            z: palmCenter.z,
            timestamp,
            landmarks: landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }))
        };

        // Add to history
        this.trajectoryHistory.push(position);

        // Calculate velocity if we have previous position
        if (this.trajectoryHistory.length > 1) {
            const velocity = this.calculateVelocity(
                this.trajectoryHistory[this.trajectoryHistory.length - 2],
                position
            );
            this.velocityHistory.push(velocity);
        }

        // Limit history length
        if (this.trajectoryHistory.length > this.maxHistoryLength) {
            this.trajectoryHistory.shift();
            this.velocityHistory.shift();
        }
    }

    /**
     * Calculate palm center from landmarks
     * @param {Array} landmarks Hand landmarks
     * @returns {Object} {x, y, z}
     */
    calculatePalmCenter(landmarks) {
        // Use wrist (0), index base (5), middle base (9), ring base (13), pinky base (17)
        const keyPoints = [0, 5, 9, 13, 17];

        let sumX = 0, sumY = 0, sumZ = 0;

        for (const idx of keyPoints) {
            if (landmarks[idx]) {
                sumX += landmarks[idx].x;
                sumY += landmarks[idx].y;
                sumZ += landmarks[idx].z || 0;
            }
        }

        return {
            x: sumX / keyPoints.length,
            y: sumY / keyPoints.length,
            z: sumZ / keyPoints.length
        };
    }

    /**
     * Calculate velocity between two positions
     * @param {Object} pos1 Previous position
     * @param {Object} pos2 Current position
     * @returns {Object} Velocity vector
     */
    calculateVelocity(pos1, pos2) {
        const dt = (pos2.timestamp - pos1.timestamp) / 1000; // Convert to seconds

        if (dt === 0) return { vx: 0, vy: 0, vz: 0, magnitude: 0 };

        const vx = (pos2.x - pos1.x) / dt;
        const vy = (pos2.y - pos1.y) / dt;
        const vz = (pos2.z - pos1.z) / dt;

        const magnitude = Math.sqrt(vx * vx + vy * vy + vz * vz);

        return { vx, vy, vz, magnitude };
    }

    /**
     * Get current trajectory (recent positions)
     * @param {number} duration Duration in seconds (default: 1 second)
     * @returns {Array} Recent positions
     */
    getTrajectory(duration = 1.0) {
        if (this.trajectoryHistory.length === 0) return [];

        const now = this.trajectoryHistory[this.trajectoryHistory.length - 1].timestamp;
        const cutoff = now - (duration * 1000);

        return this.trajectoryHistory.filter(pos => pos.timestamp >= cutoff);
    }

    /**
     * Detect motion direction
     * @returns {string} Direction: 'up', 'down', 'left', 'right', 'forward', 'backward', 'stationary', 'circular'
     */
    detectDirection() {
        if (this.trajectoryHistory.length < 10) {
            return 'stationary';
        }

        // Get recent trajectory
        const trajectory = this.getTrajectory(0.5); // Last 0.5 seconds

        if (trajectory.length < 5) {
            return 'stationary';
        }

        // Calculate average velocity
        const avgVelocity = this.calculateAverageVelocity(trajectory);

        // If magnitude too low, stationary
        if (avgVelocity.magnitude < 0.5) {
            return 'stationary';
        }

        // Check for circular motion
        if (this.isCircularMotion(trajectory)) {
            return 'circular';
        }

        // Determine primary direction based on largest velocity component
        const absVx = Math.abs(avgVelocity.vx);
        const absVy = Math.abs(avgVelocity.vy);
        const absVz = Math.abs(avgVelocity.vz);

        // Horizontal movement (left/right)
        if (absVx > absVy && absVx > absVz) {
            return avgVelocity.vx > 0 ? 'right' : 'left';
        }

        // Vertical movement (up/down)
        if (absVy > absVx && absVy > absVz) {
            return avgVelocity.vy > 0 ? 'down' : 'up';
        }

        // Depth movement (forward/backward)
        return avgVelocity.vz > 0 ? 'forward' : 'backward';
    }

    /**
     * Calculate average velocity over trajectory
     * @param {Array} trajectory Trajectory positions
     * @returns {Object} Average velocity
     */
    calculateAverageVelocity(trajectory) {
        if (trajectory.length < 2) {
            return { vx: 0, vy: 0, vz: 0, magnitude: 0 };
        }

        let sumVx = 0, sumVy = 0, sumVz = 0;
        let count = 0;

        for (let i = 1; i < trajectory.length; i++) {
            const velocity = this.calculateVelocity(trajectory[i - 1], trajectory[i]);
            sumVx += velocity.vx;
            sumVy += velocity.vy;
            sumVz += velocity.vz;
            count++;
        }

        const vx = sumVx / count;
        const vy = sumVy / count;
        const vz = sumVz / count;
        const magnitude = Math.sqrt(vx * vx + vy * vy + vz * vz);

        return { vx, vy, vz, magnitude };
    }

    /**
     * Detect circular motion pattern
     * @param {Array} trajectory Trajectory positions
     * @returns {boolean} True if circular motion detected
     */
    isCircularMotion(trajectory) {
        if (trajectory.length < 15) return false;

        // Calculate center of trajectory
        const centerX = trajectory.reduce((sum, pos) => sum + pos.x, 0) / trajectory.length;
        const centerY = trajectory.reduce((sum, pos) => sum + pos.y, 0) / trajectory.length;

        // Calculate distances from center
        const distances = trajectory.map(pos =>
            Math.sqrt(
                Math.pow(pos.x - centerX, 2) +
                Math.pow(pos.y - centerY, 2)
            )
        );

        // Calculate average distance (radius)
        const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

        // Check variance in distances (should be low for circular motion)
        const variance = distances.reduce((sum, d) =>
            sum + Math.pow(d - avgDistance, 2), 0
        ) / distances.length;

        const stdDev = Math.sqrt(variance);

        // If standard deviation is low relative to radius, it's circular
        // Also check that radius is reasonable (not too small)
        return (stdDev / avgDistance) < 0.3 && avgDistance > 0.05;
    }

    /**
     * Detect side-to-side motion (e.g., "Hello" sign)
     * @returns {Object} { detected: boolean, oscillations: number }
     */
    detectSideToSideMotion() {
        if (this.trajectoryHistory.length < 20) {
            return { detected: false, oscillations: 0 };
        }

        // Get X positions over time
        const xPositions = this.trajectoryHistory.map(pos => pos.x);

        // Count direction changes (oscillations)
        let directionChanges = 0;
        let lastDirection = null;

        for (let i = 1; i < xPositions.length; i++) {
            const diff = xPositions[i] - xPositions[i - 1];

            if (Math.abs(diff) < 0.001) continue; // Ignore tiny changes

            const currentDirection = diff > 0 ? 'right' : 'left';

            if (lastDirection && currentDirection !== lastDirection) {
                directionChanges++;
            }

            lastDirection = currentDirection;
        }

        // Check range of motion
        const minX = Math.min(...xPositions);
        const maxX = Math.max(...xPositions);
        const range = maxX - minX;

        // Side-to-side motion should have:
        // - At least 2 direction changes (one complete wave)
        // - Reasonable range of motion (> 0.15)
        const detected = directionChanges >= 2 && range > 0.15;

        return {
            detected,
            oscillations: Math.floor(directionChanges / 2), // Full cycles
            range
        };
    }

    /**
     * Detect wave motion (repeated side-to-side)
     * @returns {Object} { detected: boolean, waves: number }
     */
    detectWaveMotion() {
        const sideToSide = this.detectSideToSideMotion();

        // Wave is side-to-side with multiple oscillations
        return {
            detected: sideToSide.detected && sideToSide.oscillations >= 2,
            waves: sideToSide.oscillations
        };
    }

    /**
     * Get motion speed
     * @returns {string} 'slow', 'moderate', 'fast'
     */
    getSpeed() {
        if (this.velocityHistory.length === 0) {
            return 'stationary';
        }

        // Get recent velocities (last 0.5 seconds)
        const recentVelocities = this.velocityHistory.slice(-15);
        const avgMagnitude = recentVelocities.reduce((sum, v) =>
            sum + v.magnitude, 0
        ) / recentVelocities.length;

        if (avgMagnitude < 0.5) return 'slow';
        if (avgMagnitude < 2.0) return 'moderate';
        return 'fast';
    }

    /**
     * Get motion range (how far hand moved)
     * @returns {number} Range in normalized coordinates
     */
    getMotionRange() {
        if (this.trajectoryHistory.length < 2) return 0;

        const xPositions = this.trajectoryHistory.map(pos => pos.x);
        const yPositions = this.trajectoryHistory.map(pos => pos.y);

        const rangeX = Math.max(...xPositions) - Math.min(...xPositions);
        const rangeY = Math.max(...yPositions) - Math.min(...yPositions);

        // Return diagonal distance
        return Math.sqrt(rangeX * rangeX + rangeY * rangeY);
    }

    /**
     * Clear trajectory history
     */
    clear() {
        this.trajectoryHistory = [];
        this.velocityHistory = [];
        this.previousFrame = null;
    }

    /**
     * Get full motion analysis
     * @returns {Object} Complete motion analysis
     */
    analyzeMotion() {
        return {
            direction: this.detectDirection(),
            speed: this.getSpeed(),
            range: this.getMotionRange(),
            sideToSide: this.detectSideToSideMotion(),
            wave: this.detectWaveMotion(),
            circular: this.isCircularMotion(this.getTrajectory()),
            trajectoryLength: this.trajectoryHistory.length,
            avgVelocity: this.calculateAverageVelocity(this.getTrajectory())
        };
    }
}

// Export singleton instance
export const motionTracker = new MotionTracker();
