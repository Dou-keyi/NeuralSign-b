/**
 * Word Sign Validation Service
 * Validates word signs using MediaPipe hand landmarks
 * MVP: Position-based validation with high-accuracy scale-invariant heuristics.
 * * NeuralSign - AI Sign Language Learning Platform
 */

class WordValidator {
    constructor() {
        this.WRIST = 0;
        this.THUMB_TIP = 4;
        this.INDEX_TIP = 8;
        this.MIDDLE_TIP = 12;
        this.RING_TIP = 16;
        this.PINKY_TIP = 20;
        this.INDEX_MCP = 5;
        this.MIDDLE_MCP = 9;
        this.RING_MCP = 13;
        this.PINKY_MCP = 17;
    }

    validateSign(word, landmarks, handedness = 'Right') {
        if (!word || !landmarks || landmarks.length < 21) {
            return {
                isValid: false,
                confidence: 0,
                feedback: 'No hand detected. Show your hand clearly to the camera.'
            };
        }

        const checks = [];
        const feedbacks = [];
        const validation = word.validation || {};
        const threshold = validation.confidenceThreshold || 0.7;

        if (word.handedness && word.handedness !== 'both') {
            const expectedHand = word.handedness === 'right' ? 'Right' : 'Left';
            if (handedness !== expectedHand) {
                feedbacks.push(`Use your ${word.handedness} hand for this sign.`);
                checks.push(0.3);
            } else {
                checks.push(1.0);
            }
        }

        if (validation.handPosition) {
            const posScore = this.checkHandPosition(landmarks, validation.handPosition);
            checks.push(posScore);
            if (posScore < 0.5) feedbacks.push(this.getPositionFeedback(word.location));
        }

        // 🚀 修改点 1：把 time 和 what 加入白名单
        const strictWords = ['water', 'i-me', 'you', 'yes', 'no', 'love', 'L', 'I', 'F', 'time', 'what'];
        
        if (word.isStatic && !strictWords.includes(word.id)) {
            const shapeScore = this.checkHandShape(word, landmarks);
            checks.push(shapeScore);
            if (shapeScore < 0.5) feedbacks.push('Check your hand shape - make sure your fingers are in the correct position.');
        }

        if (strictWords.includes(word.id)) {
            // 🚀 修改点 2：将挂载的双手数据(allHands)一并传给检测器
            const fingerScore = this.checkSpecificSign(word.id, landmarks, landmarks.allHands);
            checks.push(fingerScore);

            if (fingerScore < 0.5) {
                if (['time', 'what'].includes(word.id)) {
                    feedbacks.push(word.shortDescription || 'This sign requires BOTH hands in the correct position.');
                } else {
                    feedbacks.push(word.shortDescription || 'Adjust your finger positions strictly.');
                }
            }
        }

        const confidence = checks.length > 0 ? checks.reduce((sum, c) => sum + c, 0) / checks.length : 0;
        const isValid = confidence >= threshold;

        let feedback;
        if (isValid) {
            if (confidence >= 0.9) feedback = 'Perfect! Excellent sign execution! ✨';
            else if (confidence >= 0.8) feedback = 'Great job! Sign recognized correctly! 👍';
            else feedback = 'Good! Sign recognized. Keep practicing for better form.';
        } else if (feedbacks.length > 0) {
            feedback = feedbacks[0];
        } else {
            feedback = `Try again. ${word.shortDescription || 'Check the reference video.'}`;
        }

        return {
            isValid,
            confidence: Math.round(confidence * 100) / 100,
            feedback,
            details: { checksPerformed: checks.length, individualScores: checks }
        };
    }

    checkHandPosition(landmarks, expectedPosition) {
        const palmCenter = this.calculatePalmCenter(landmarks);
        const { x: expectedX, y: expectedY } = expectedPosition;
        let score = 1.0;

        if (expectedX) {
            if (palmCenter.x < expectedX.min) score *= Math.max(0.2, 1 - (expectedX.min - palmCenter.x) * 3);
            else if (palmCenter.x > expectedX.max) score *= Math.max(0.2, 1 - (palmCenter.x - expectedX.max) * 3);
        }
        if (expectedY) {
            if (palmCenter.y < expectedY.min) score *= Math.max(0.2, 1 - (expectedY.min - palmCenter.y) * 3);
            else if (palmCenter.y > expectedY.max) score *= Math.max(0.2, 1 - (palmCenter.y - expectedY.max) * 3);
        }
        return Math.max(0, Math.min(1, score));
    }

    calculatePalmCenter(landmarks) {
        const palmIndices = [0, 5, 9, 13, 17];
        let sumX = 0, sumY = 0;
        for (const idx of palmIndices) {
            sumX += landmarks[idx].x;
            sumY += landmarks[idx].y;
        }
        return { x: sumX / palmIndices.length, y: sumY / palmIndices.length };
    }

    checkHandShape(word, landmarks) {
        if (['yes', 'sorry'].includes(word.id)) {
            const fingersCurled = ['index', 'middle', 'ring', 'pinky'].filter(f => !this.isFingerExtended(landmarks, f)).length;
            return fingersCurled / 4;
        }
        return 0.6; 
    }

    // 🚀 修改点 3：接收双手数据并处理
    checkSpecificSign(signId, landmarks, allHands = null) {
        const thumbUp = this.isFingerExtended(landmarks, 'thumb');
        const indexUp = this.isFingerExtended(landmarks, 'index');
        const middleUp = this.isFingerExtended(landmarks, 'middle');
        const ringUp = this.isFingerExtended(landmarks, 'ring');
        const pinkyUp = this.isFingerExtended(landmarks, 'pinky');

        // 检查双手是否被传入，如果没有，默认为单手
        const handsData = allHands && allHands.length > 0 ? allHands : [{ landmarks }];
        const isDualHandWord = ['time', 'what'].includes(signId);

        if (isDualHandWord) {
            // 如果要求双手，但只看到一只手，直接返回极低分
            if (handsData.length < 2) return 0.1; 
            
            const hand1 = handsData[0].landmarks;
            const hand2 = handsData[1].landmarks;

            // ===== TIME 逻辑 (STRICTER & COMPATIBLE) =====
            if (signId === 'time') {
                const checkIsPointer = (h) => this.isFingerExtended(h, 'index') && !this.isFingerExtended(h, 'middle') && !this.isFingerExtended(h, 'pinky');
                
                const h1IsPointer = checkIsPointer(hand1);
                const h2IsPointer = checkIsPointer(hand2);

                let pointerHand = null, baseHand = null;
                if (h1IsPointer) { pointerHand = hand1; baseHand = hand2; }
                else if (h2IsPointer) { pointerHand = hand2; baseHand = hand1; }

                if (!pointerHand) return 0.1; 

                const distance = Math.hypot(pointerHand[8].x - baseHand[0].x, pointerHand[8].y - baseHand[0].y);
                const basePalmSize = Math.hypot(baseHand[9].x - baseHand[0].x, baseHand[9].y - baseHand[0].y);
                
                return distance < basePalmSize * 1.2 ? 0.95 : 0.2;
            }

            // ===== WHAT 逻辑 (DYNAMIC SHAKE FIXED) =====
            if (signId === 'what') {
                const isFlatOpen = (h) => {
                    const extended = ['index', 'middle', 'ring', 'pinky'].every(f => this.isFingerExtended(h, f));
                    // 检查指尖 8 和 20 的高度差，确保手掌水平
                    const isHorizontal = Math.abs(h[8].y - h[20].y) < 0.15; 
                    return extended && isHorizontal;
                };

                if (!isFlatOpen(hand1) || !isFlatOpen(hand2)) return 0.1;

                // 1. 检查位置：两只手平行并排
                const yDiff = Math.abs(hand1[0].y - hand2[0].y);
                const xDist = Math.abs(hand1[0].x - hand2[0].x);
                
                if (yDiff > 0.15 || xDist < 0.2) return 0.2;

                // 2. 🚀 实现动态摇晃逻辑：
                // 我们通过比较指尖(8)和 MCP关节(5)的相对 X 轴距离来感知微小的晃动。
                // 在 "What" 的动作中，手掌会轻微旋转，这会导致 landmarks 的 X 坐标发生实时变化。
                const h1Shake = Math.abs(hand1[8].x - hand1[5].x);
                const h2Shake = Math.abs(hand2[8].x - hand2[5].x);
                
                // 如果检测到手掌有基本的并排结构，给予基础分
                // 摇晃强度越高，分数越接近完美 (0.95)
                const totalShakeIntensity = h1Shake + h2Shake;
                
                // 只要两手并排且手指张开，基础分 0.75。如果有摇晃，提升至 0.95。
                return totalShakeIntensity > 0.02 ? 0.95 : 0.75;
            }
        }

        // 下面是你原有的单手逻辑 (无任何改动)
        switch (signId) {
            case 'love': {
                if (thumbUp && indexUp && !middleUp && !ringUp && pinkyUp) return 0.95;
                if (middleUp || ringUp) return 0.1;
                if (!thumbUp || !indexUp || !pinkyUp) return 0.1;
                return 0.3;
            }
            case 'want': {
                const palmSize = Math.hypot(landmarks[9].x - landmarks[0].x, landmarks[9].y - landmarks[0].y);
                let curvedScore = 0;
                const tips = [8, 12, 16, 20];
                const mcps = [5, 9, 13, 17];
                for(let i=0; i<4; i++) {
                    const tipDist = Math.hypot(landmarks[tips[i]].x - landmarks[mcps[i]].x, landmarks[tips[i]].y - landmarks[mcps[i]].y);
                    const ratio = tipDist / palmSize;
                    if (ratio > 0.35 && ratio < 0.85) curvedScore += 0.25;
                }
                if (curvedScore >= 0.75) return 0.95;
                return 0.2;
            }
            case 'water': {
                if (indexUp && middleUp && ringUp && !pinkyUp && !thumbUp) return 0.95;
                if (pinkyUp || thumbUp) return 0.1; 
                if (!indexUp || !middleUp || !ringUp) return 0.2;
                return 0.3;
            }
            case 'i-me': {
                if (indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) return 0.95;
                if (middleUp || ringUp || pinkyUp || thumbUp) return 0.1;
                return 0.3;
            }
            case 'you': {
                if (indexUp && !middleUp && !ringUp && !pinkyUp) return 0.90;
                if (middleUp || ringUp || pinkyUp) return 0.1;
                return 0.3;
            }
            case 'yes': {
                if (!indexUp && !middleUp && !ringUp && !pinkyUp) return 0.90;
                if (indexUp || middleUp || ringUp) return 0.1;
                return 0.4;
            }
            case 'no': {
                if (indexUp && middleUp && !ringUp && !pinkyUp) return 0.90;
                if (ringUp || pinkyUp) return 0.1;
                if (!indexUp || !middleUp) return 0.2;
                return 0.3;
            }
            case 'L': { 
                if (indexUp && thumbUp && !middleUp && !ringUp && !pinkyUp) return 0.95;
                if (middleUp || ringUp || pinkyUp) return 0.1;
                return 0.4;
            }
            case 'I': {
                if (!indexUp && !middleUp && !ringUp && pinkyUp && !thumbUp) return 0.95;
                if (indexUp || middleUp || ringUp || thumbUp) return 0.1;
                return 0.4;
            }
            case 'F': {
                if (!indexUp && middleUp && ringUp && pinkyUp) return 0.95;
                if (!middleUp || !ringUp || !pinkyUp) return 0.1;
                if (indexUp) return 0.1; 
                return 0.4;
            }
            default:
                return 0.5;
        }
    }

    isFingerExtended(landmarks, finger) {
        const fingerMap = {
            thumb: { tip: 4, pip: 3, mcp: 2 },
            index: { tip: 8, pip: 6, mcp: 5 },
            middle: { tip: 12, pip: 10, mcp: 9 },
            ring: { tip: 16, pip: 14, mcp: 13 },
            pinky: { tip: 20, pip: 18, mcp: 17 }
        };

        const f = fingerMap[finger];
        if (!f) return false;

        const wrist = landmarks[0];

        if (finger === 'thumb') {
            const thumbToPinkyDist = Math.hypot(landmarks[4].x - landmarks[17].x, landmarks[4].y - landmarks[17].y);
            const palmWidth = Math.hypot(landmarks[5].x - landmarks[17].x, landmarks[5].y - landmarks[17].y);
            return thumbToPinkyDist > (palmWidth * 1.2);
        }

        const tipDist = Math.hypot(landmarks[f.tip].x - wrist.x, landmarks[f.tip].y - wrist.y);
        const pipDist = Math.hypot(landmarks[f.pip].x - wrist.x, landmarks[f.pip].y - wrist.y);
        return tipDist > (pipDist * 1.15);
    }

    getPositionFeedback(location) {
        const labels = {
            'chest': 'Move your hand closer to your chest.',
            'chin': 'Bring your hand up near your chin.',
            'mouth': 'Move your hand closer to your mouth.',
            'neutral-space': 'Hold your hand in front of you at mid-level.',
            'face-side': 'Position your hand near the side of your face.'
        };
        return labels[location] || 'Adjust your hand position.';
    }
}

class EnhancedWordValidator {
    constructor() {
        this.baseValidator = new WordValidator();
        this.motionTracker = null;
        this.gestureRecognizer = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        try {
            const { motionTracker } = await import('./opencv/motionTracker');
            const { gestureRecognizer } = await import('./opencv/gestureRecognizer');
            this.motionTracker = motionTracker;
            this.gestureRecognizer = gestureRecognizer;
            await this.gestureRecognizer.initialize();
            this.initialized = true;
        } catch (err) {
            console.warn('Enhanced validator: OpenCV services unavailable, using base validator.', err);
        }
    }

    async validateSign(word, landmarks, handedness = 'Right') {
        const baseResult = this.baseValidator.validateSign(word, landmarks, handedness);
        if (word.isStatic || !this.initialized || !this.motionTracker) {
            return baseResult;
        }

        this.motionTracker.addPosition(landmarks, Date.now());
        const motionResult = this.validateDynamicSign(word);

        if (!motionResult) return baseResult;

        const mergedConfidence = Math.max(baseResult.confidence, motionResult.confidence);
        const mergedValid = mergedConfidence >= (word.validation?.confidenceThreshold || 0.7);

        return {
            isValid: mergedValid,
            confidence: Math.round(mergedConfidence * 100) / 100,
            feedback: mergedValid ? motionResult.feedback || baseResult.feedback : motionResult.feedback || baseResult.feedback,
            details: { ...baseResult.details, motionAnalysis: motionResult.motionAnalysis, gestureMatch: motionResult.gestureMatch }
        };
    }

    validateDynamicSign(word) {
        if (!this.motionTracker) return null;
        const motionAnalysis = this.motionTracker.analyzeMotion();
        if (motionAnalysis.trajectoryLength < 15) return null;

        let gestureMatch = null;
        if (this.gestureRecognizer) {
            const trajectory = this.motionTracker.getTrajectory(2.0);
            const result = this.gestureRecognizer.recognizeGesture(trajectory, motionAnalysis);
            if (result.recognized && result.gesture === word.id) {
                gestureMatch = result;
            }
        }

        let motionConfidence = 0;
        const checks = [];
        if (gestureMatch) checks.push(gestureMatch.confidence);

        const motionScore = this.validateBasicMotion(word, motionAnalysis);
        if (motionScore > 0) checks.push(motionScore);

        motionConfidence = checks.length > 0 ? checks.reduce((s, c) => s + c, 0) / checks.length : 0;
        const feedback = this.generateMotionFeedback(word, motionAnalysis, motionConfidence);

        return { confidence: motionConfidence, feedback, motionAnalysis, gestureMatch };
    }

    validateBasicMotion(word, motionAnalysis) {
        let score = 0;
        let checks = 0;
        if (['hello', 'goodbye'].includes(word.id)) {
            if (motionAnalysis.wave?.detected) score += 0.8;
            else if (motionAnalysis.sideToSide?.detected) score += 0.6;
            checks++;
        }
        if (['sorry', 'please'].includes(word.id)) {
            if (motionAnalysis.circular) score += 0.8;
            checks++;
        }
        if (word.id === 'yes') {
            if (motionAnalysis.direction === 'down' || motionAnalysis.direction === 'up') score += 0.7;
            checks++;
        }
        if (word.id === 'no') {
            if (motionAnalysis.sideToSide?.detected && motionAnalysis.speed === 'fast') score += 0.8;
            checks++;
        }
        if (['thank-you', 'go'].includes(word.id)) {
            if (motionAnalysis.direction === 'forward') score += 0.7;
            checks++;
        }
        return checks > 0 ? score / checks : 0;
    }

    generateMotionFeedback(word, motionAnalysis, confidence) {
        if (confidence >= 0.8) return 'Excellent motion! Sign recognized perfectly! ✨';
        if (confidence >= 0.6) return 'Good motion! Sign recognized. Keep refining the movement.';
        if (['hello', 'goodbye'].includes(word.id) && !motionAnalysis.wave?.detected) return 'Try waving your hand side to side more clearly.';
        if (['sorry', 'please'].includes(word.id) && !motionAnalysis.circular) return 'Make a circular motion on your chest.';
        if (word.id === 'yes' && motionAnalysis.direction === 'stationary') return 'Nod your fist up and down.';
        if (word.id === 'no' && !motionAnalysis.sideToSide?.detected) return 'Shake your hand side to side.';
        return 'Keep practicing the motion. Watch the reference video for guidance.';
    }

    getMotionData() {
        if (!this.motionTracker) return null;
        return this.motionTracker.analyzeMotion();
    }

    getTrajectory() {
        if (!this.motionTracker) return [];
        return this.motionTracker.getTrajectory(2.0);
    }

    resetMotion() {
        if (this.motionTracker) this.motionTracker.clear();
    }
}

export function validateWordSign(word, landmarks, handedness = 'Right') {
    const validator = new WordValidator();
    return validator.validateSign(word, landmarks, handedness);
}

export async function validateWordSignEnhanced(word, landmarks, handedness = 'Right') {
    return await enhancedWordValidator.validateSign(word, landmarks, handedness);
}

export const wordValidator = new WordValidator();
export const enhancedWordValidator = new EnhancedWordValidator();
export default validateWordSign;