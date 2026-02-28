/**
 * Gesture Recognition Service
 * Uses pattern matching to recognize hand gestures
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { getOpenCV } from './opencvLoader';

class GestureRecognizer {
    constructor() {
        this.cv = null;
        this.templates = new Map();
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            this.cv = await getOpenCV();
            this.loadTemplates();
            this.initialized = true;
        }
    }

    /**
     * Load gesture templates for known signs
     */
    loadTemplates() {
        // HELLO - side-to-side wave
        this.addTemplate('hello', {
            type: 'wave',
            pattern: 'side-to-side',
            minOscillations: 2,
            direction: 'horizontal',
            speed: 'moderate',
            features: {
                directionChanges: { min: 3, max: 8 },
                range: { min: 0.15, max: 0.5 },
                duration: { min: 1.0, max: 3.0 }
            }
        });

        // GOODBYE - similar to hello but may be slower
        this.addTemplate('goodbye', {
            type: 'wave',
            pattern: 'side-to-side',
            minOscillations: 2,
            direction: 'horizontal',
            speed: 'moderate',
            features: {
                directionChanges: { min: 3, max: 8 },
                range: { min: 0.15, max: 0.5 },
                duration: { min: 1.0, max: 3.0 }
            }
        });

        // THANK YOU - forward motion from chin
        this.addTemplate('thank-you', {
            type: 'linear',
            pattern: 'forward',
            direction: 'forward',
            startLocation: 'chin',
            speed: 'moderate',
            features: {
                forwardMotion: { min: 0.1, max: 0.3 },
                downwardMotion: { min: 0.05, max: 0.2 },
                duration: { min: 0.5, max: 2.0 }
            }
        });

        // SORRY - circular motion on chest
        this.addTemplate('sorry', {
            type: 'circular',
            pattern: 'circular',
            location: 'chest',
            direction: 'clockwise',
            speed: 'moderate',
            features: {
                circularity: { min: 0.7, max: 1.0 },
                radius: { min: 0.05, max: 0.15 },
                duration: { min: 1.0, max: 3.0 }
            }
        });

        // PLEASE - circular motion on chest
        this.addTemplate('please', {
            type: 'circular',
            pattern: 'circular',
            location: 'chest',
            direction: 'any',
            speed: 'moderate',
            features: {
                circularity: { min: 0.7, max: 1.0 },
                radius: { min: 0.05, max: 0.15 },
                duration: { min: 1.0, max: 3.0 }
            }
        });

        // YES - up-down nodding motion
        this.addTemplate('yes', {
            type: 'nod',
            pattern: 'up-down',
            direction: 'vertical',
            speed: 'moderate',
            features: {
                directionChanges: { min: 2, max: 6 },
                range: { min: 0.05, max: 0.2 },
                duration: { min: 0.5, max: 2.0 }
            }
        });

        // NO - side-to-side shake
        this.addTemplate('no', {
            type: 'shake',
            pattern: 'side-to-side',
            direction: 'horizontal',
            speed: 'fast',
            features: {
                directionChanges: { min: 2, max: 6 },
                range: { min: 0.05, max: 0.15 },
                duration: { min: 0.3, max: 1.5 }
            }
        });

        // HELP - upward motion
        this.addTemplate('help', {
            type: 'linear',
            pattern: 'upward',
            direction: 'up',
            speed: 'moderate',
            features: {
                upwardMotion: { min: 0.1, max: 0.3 },
                duration: { min: 0.5, max: 2.0 }
            }
        });

        // GO - forward motion
        this.addTemplate('go', {
            type: 'linear',
            pattern: 'forward',
            direction: 'forward',
            speed: 'fast',
            features: {
                forwardMotion: { min: 0.1, max: 0.4 },
                duration: { min: 0.3, max: 1.5 }
            }
        });

        // COME - toward body motion
        this.addTemplate('come', {
            type: 'linear',
            pattern: 'toward',
            direction: 'backward',
            speed: 'moderate',
            features: {
                backwardMotion: { min: 0.1, max: 0.3 },
                duration: { min: 0.5, max: 2.0 }
            }
        });
    }

    /**
     * Add a gesture template
     */
    addTemplate(name, template) {
        this.templates.set(name, template);
    }

    /**
     * Get template for a gesture
     */
    getTemplate(name) {
        return this.templates.get(name) || null;
    }

    /**
     * Recognize gesture from trajectory
     * @param {Array} trajectory Array of positions
     * @param {Object} motionAnalysis Motion analysis from motionTracker
     * @returns {Object} Recognition result
     */
    recognizeGesture(trajectory, motionAnalysis) {
        if (!trajectory || trajectory.length < 10) {
            return {
                recognized: false,
                gesture: null,
                confidence: 0,
                reason: 'Insufficient trajectory data'
            };
        }

        // Extract features from trajectory
        const features = this.extractFeatures(trajectory, motionAnalysis);

        // Match against all templates
        const matches = [];

        for (const [name, template] of this.templates.entries()) {
            const score = this.matchTemplate(features, template);

            if (score.confidence > 0.5) {
                matches.push({
                    gesture: name,
                    confidence: score.confidence,
                    details: score.details
                });
            }
        }

        // Sort by confidence
        matches.sort((a, b) => b.confidence - a.confidence);

        if (matches.length === 0) {
            return {
                recognized: false,
                gesture: null,
                confidence: 0,
                reason: 'No matching gesture found'
            };
        }

        return {
            recognized: true,
            gesture: matches[0].gesture,
            confidence: matches[0].confidence,
            details: matches[0].details,
            alternatives: matches.slice(1, 3)
        };
    }

    /**
     * Extract features from trajectory
     */
    extractFeatures(trajectory, motionAnalysis) {
        return {
            direction: motionAnalysis.direction,
            speed: motionAnalysis.speed,
            range: motionAnalysis.range,
            duration: (trajectory[trajectory.length - 1].timestamp -
                trajectory[0].timestamp) / 1000,
            startPosition: trajectory[0],
            endPosition: trajectory[trajectory.length - 1],
            directionChanges: this.countDirectionChanges(trajectory),
            circularity: this.calculateCircularity(trajectory),
            totalDisplacement: this.calculateDisplacement(
                trajectory[0],
                trajectory[trajectory.length - 1]
            ),
            horizontalMotion: this.calculateHorizontalMotion(trajectory),
            verticalMotion: this.calculateVerticalMotion(trajectory),
            depthMotion: this.calculateDepthMotion(trajectory),
            boundingBox: this.calculateBoundingBox(trajectory),
            speedVariation: this.calculateSpeedVariation(trajectory)
        };
    }

    /**
     * Match extracted features against a template
     */
    matchTemplate(features, template) {
        const scores = [];
        const details = {};

        // Match pattern type
        if (template.type === 'wave') {
            scores.push(this.matchWavePattern(features, template));
        } else if (template.type === 'circular') {
            scores.push(this.matchCircularPattern(features, template));
        } else if (template.type === 'linear') {
            scores.push(this.matchLinearPattern(features, template));
        } else if (template.type === 'nod' || template.type === 'shake') {
            scores.push(this.matchOscillationPattern(features, template));
        }

        // Match direction
        const directionScore = this.matchDirection(features.direction, template.direction);
        scores.push(directionScore);
        details.direction = directionScore;

        // Match speed
        const speedScore = this.matchSpeed(features.speed, template.speed);
        scores.push(speedScore);
        details.speed = speedScore;

        // Match duration
        if (template.features.duration) {
            const durationScore = this.matchRange(
                features.duration,
                template.features.duration.min,
                template.features.duration.max
            );
            scores.push(durationScore);
            details.duration = durationScore;
        }

        // Match range/size
        if (template.features.range) {
            const rangeScore = this.matchRange(
                features.range,
                template.features.range.min,
                template.features.range.max
            );
            scores.push(rangeScore);
            details.range = rangeScore;
        }

        // Calculate overall confidence (weighted average)
        const confidence = scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;

        return { confidence, details };
    }

    /**
     * Match wave pattern (side-to-side oscillation)
     */
    matchWavePattern(features, template) {
        const { directionChanges } = features;
        const { minOscillations, features: templateFeatures } = template;

        const oscillations = Math.floor(directionChanges / 2);
        if (oscillations < minOscillations) {
            return 0.0;
        }

        const rangeScore = this.matchRange(
            Math.abs(features.horizontalMotion),
            templateFeatures.range.min,
            templateFeatures.range.max
        );

        const changeScore = this.matchRange(
            directionChanges,
            templateFeatures.directionChanges.min,
            templateFeatures.directionChanges.max
        );

        return (rangeScore + changeScore) / 2;
    }

    /**
     * Match circular pattern
     */
    matchCircularPattern(features, template) {
        const { circularity, boundingBox } = features;
        const { features: templateFeatures } = template;

        const circScore = this.matchRange(
            circularity,
            templateFeatures.circularity.min,
            templateFeatures.circularity.max
        );

        const radius = Math.sqrt(
            boundingBox.width * boundingBox.width +
            boundingBox.height * boundingBox.height
        ) / 2;

        const radiusScore = this.matchRange(
            radius,
            templateFeatures.radius.min,
            templateFeatures.radius.max
        );

        return (circScore + radiusScore) / 2;
    }

    /**
     * Match linear pattern (straight motion)
     */
    matchLinearPattern(features, template) {
        const { features: templateFeatures } = template;

        let score = 0;
        let count = 0;

        if (templateFeatures.forwardMotion) {
            score += this.matchRange(
                Math.abs(features.depthMotion),
                templateFeatures.forwardMotion.min,
                templateFeatures.forwardMotion.max
            );
            count++;
        }

        if (templateFeatures.upwardMotion) {
            score += this.matchRange(
                Math.abs(features.verticalMotion),
                templateFeatures.upwardMotion.min,
                templateFeatures.upwardMotion.max
            );
            count++;
        }

        if (templateFeatures.downwardMotion) {
            score += this.matchRange(
                Math.abs(features.verticalMotion),
                templateFeatures.downwardMotion.min,
                templateFeatures.downwardMotion.max
            );
            count++;
        }

        if (templateFeatures.backwardMotion) {
            score += this.matchRange(
                Math.abs(features.depthMotion),
                templateFeatures.backwardMotion.min,
                templateFeatures.backwardMotion.max
            );
            count++;
        }

        return count > 0 ? score / count : 0;
    }

    /**
     * Match oscillation pattern (nodding, shaking)
     */
    matchOscillationPattern(features, template) {
        const { directionChanges, range } = features;
        const { features: templateFeatures } = template;

        const changeScore = this.matchRange(
            directionChanges,
            templateFeatures.directionChanges.min,
            templateFeatures.directionChanges.max
        );

        const rangeScore = this.matchRange(
            range,
            templateFeatures.range.min,
            templateFeatures.range.max
        );

        return (changeScore + rangeScore) / 2;
    }

    /**
     * Match direction
     */
    matchDirection(actual, expected) {
        if (expected === 'any') return 1.0;

        const directionMap = {
            'up': ['up'],
            'down': ['down'],
            'left': ['left'],
            'right': ['right'],
            'forward': ['forward'],
            'backward': ['backward'],
            'horizontal': ['left', 'right'],
            'vertical': ['up', 'down']
        };

        const validDirections = directionMap[expected] || [expected];
        return validDirections.includes(actual) ? 1.0 : 0.0;
    }

    /**
     * Match speed
     */
    matchSpeed(actual, expected) {
        const speedMap = {
            'slow': ['slow'],
            'moderate': ['slow', 'moderate'],
            'fast': ['moderate', 'fast'],
            'any': ['slow', 'moderate', 'fast']
        };

        const validSpeeds = speedMap[expected] || [expected];
        return validSpeeds.includes(actual) ? 1.0 : 0.5;
    }

    /**
     * Match value against range
     */
    matchRange(value, min, max) {
        if (value >= min && value <= max) {
            return 1.0;
        }

        // Partial credit if close
        const range = max - min || 1;
        if (value < min) {
            const diff = min - value;
            return Math.max(0, 1 - (diff / range));
        } else {
            const diff = value - max;
            return Math.max(0, 1 - (diff / range));
        }
    }

    // ── Helper methods ──

    countDirectionChanges(trajectory) {
        if (trajectory.length < 3) return 0;

        let changes = 0;
        let lastDx = trajectory[1].x - trajectory[0].x;
        let lastDy = trajectory[1].y - trajectory[0].y;

        for (let i = 2; i < trajectory.length; i++) {
            const dx = trajectory[i].x - trajectory[i - 1].x;
            const dy = trajectory[i].y - trajectory[i - 1].y;

            if ((lastDx > 0 && dx < 0) || (lastDx < 0 && dx > 0)) {
                if (Math.abs(dx) > 0.001) changes++;
            }

            if ((lastDy > 0 && dy < 0) || (lastDy < 0 && dy > 0)) {
                if (Math.abs(dy) > 0.001) changes++;
            }

            lastDx = dx;
            lastDy = dy;
        }

        return changes;
    }

    calculateCircularity(trajectory) {
        if (trajectory.length < 15) return 0;

        const centerX = trajectory.reduce((sum, p) => sum + p.x, 0) / trajectory.length;
        const centerY = trajectory.reduce((sum, p) => sum + p.y, 0) / trajectory.length;

        const distances = trajectory.map(p =>
            Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
        );

        const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;

        const variance = distances.reduce((sum, d) =>
            sum + Math.pow(d - avgRadius, 2), 0
        ) / distances.length;

        const stdDev = Math.sqrt(variance);

        if (avgRadius === 0) return 0;
        return Math.max(0, 1 - (stdDev / avgRadius));
    }

    calculateDisplacement(start, end) {
        return Math.sqrt(
            Math.pow(end.x - start.x, 2) +
            Math.pow(end.y - start.y, 2) +
            Math.pow((end.z || 0) - (start.z || 0), 2)
        );
    }

    calculateHorizontalMotion(trajectory) {
        if (trajectory.length < 2) return 0;
        return trajectory[trajectory.length - 1].x - trajectory[0].x;
    }

    calculateVerticalMotion(trajectory) {
        if (trajectory.length < 2) return 0;
        return trajectory[trajectory.length - 1].y - trajectory[0].y;
    }

    calculateDepthMotion(trajectory) {
        if (trajectory.length < 2) return 0;
        return (trajectory[trajectory.length - 1].z || 0) - (trajectory[0].z || 0);
    }

    calculateBoundingBox(trajectory) {
        const xValues = trajectory.map(p => p.x);
        const yValues = trajectory.map(p => p.y);

        return {
            minX: Math.min(...xValues),
            maxX: Math.max(...xValues),
            minY: Math.min(...yValues),
            maxY: Math.max(...yValues),
            width: Math.max(...xValues) - Math.min(...xValues),
            height: Math.max(...yValues) - Math.min(...yValues)
        };
    }

    calculateSpeedVariation(trajectory) {
        if (trajectory.length < 3) return 0;

        const speeds = [];
        for (let i = 1; i < trajectory.length; i++) {
            const dist = this.calculateDisplacement(trajectory[i - 1], trajectory[i]);
            const time = (trajectory[i].timestamp - trajectory[i - 1].timestamp) / 1000;
            speeds.push(time > 0 ? dist / time : 0);
        }

        const avgSpeed = speeds.reduce((sum, s) => sum + s, 0) / speeds.length;
        const variance = speeds.reduce((sum, s) =>
            sum + Math.pow(s - avgSpeed, 2), 0
        ) / speeds.length;

        return Math.sqrt(variance);
    }
}

// Export singleton instance
export const gestureRecognizer = new GestureRecognizer();
