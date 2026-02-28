/**
 * MediaPipe Hand Tracking Service
 * Handles MediaPipe Hands integration for real-time hand landmark detection
 * * NeuralSign - AI Sign Language Learning Platform
 */

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/';

const COLORS = {
    joint: '#6366F1',      
    connection: '#8B5CF6', 
    thumb: '#EC4899',      
};

const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17]
];

const FINGER_TIPS = [4, 8, 12, 16, 20];

let handsInstance = null;
let isLoading = false;
let loadError = null;

export async function initializeMediaPipe(onResultsCallback) {
    if (handsInstance) {
        console.log('ℹ️ MediaPipe already initialized, reusing instance');
        handsInstance.onResults(onResultsCallback);
        return handsInstance;
    }

    if (isLoading) {
        console.log('⏳ MediaPipe is loading, waiting...');
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (!isLoading) {
                    clearInterval(checkInterval);
                    if (loadError) reject(loadError);
                    else {
                        handsInstance.onResults(onResultsCallback);
                        resolve(handsInstance);
                    }
                }
            }, 100);
        });
    }

    isLoading = true;
    loadError = null;

    try {
        console.log('🤖 Initializing MediaPipe Hands...');
        const Hands = await loadMediaPipeHands();

        handsInstance = new Hands({
            locateFile: (file) => `${MEDIAPIPE_CDN}${file}`
        });

        handsInstance.setOptions({
            maxNumHands: 2,           // 🚀 修改点 1：允许识别双手！
            modelComplexity: 1,       
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        handsInstance.onResults(onResultsCallback);

        console.log('✅ MediaPipe Hands initialized successfully');
        isLoading = false;
        return handsInstance;
    } catch (error) {
        console.error('❌ Failed to initialize MediaPipe:', error);
        loadError = error;
        isLoading = false;
        throw error;
    }
}

async function loadMediaPipeHands() {
    return new Promise((resolve, reject) => {
        if (window.Hands) return resolve(window.Hands);
        const script = document.createElement('script');
        script.src = `${MEDIAPIPE_CDN}hands.js`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => window.Hands ? resolve(window.Hands) : reject(new Error('MediaPipe Hands not found'));
        script.onerror = () => reject(new Error('Failed to load script'));
        document.head.appendChild(script);
    });
}

export async function processVideoFrame(videoElement) {
    if (!handsInstance || !videoElement || videoElement.readyState < 2) return;
    try { await handsInstance.send({ image: videoElement }); } 
    catch (error) { console.warn('⚠️ Error processing video frame:', error); }
}

export function drawHandLandmarks(canvas, results, mirror = true) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!results?.multiHandLandmarks?.length) return;

    ctx.save();
    if (mirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    for (const landmarks of results.multiHandLandmarks) {
        drawConnections(ctx, landmarks, canvas.width, canvas.height);
        drawLandmarkDots(ctx, landmarks, canvas.width, canvas.height);
    }
    ctx.restore();
}

function drawConnections(ctx, landmarks, width, height) {
    ctx.strokeStyle = COLORS.connection;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const [start, end] of HAND_CONNECTIONS) {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        if (startPoint && endPoint) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x * width, startPoint.y * height);
            ctx.lineTo(endPoint.x * width, endPoint.y * height);
            ctx.stroke();
        }
    }
}

function drawLandmarkDots(ctx, landmarks, width, height) {
    for (let i = 0; i < landmarks.length; i++) {
        const landmark = landmarks[i];
        const x = landmark.x * width;
        const y = landmark.y * height;
        let color = COLORS.joint;
        let radius = 5;

        if (i === 0) radius = 8;
        else if (FINGER_TIPS.includes(i)) { color = COLORS.thumb; radius = 7; }
        else if (i >= 1 && i <= 4) color = COLORS.thumb;

        ctx.beginPath();
        ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
    }
}

export function extractHandLandmarks(results) {
    if (!results?.multiHandLandmarks?.length) {
        const emptyArr = [];
        emptyArr.allHands = []; // 防止报错
        return { detected: false, landmarks: emptyArr, handedness: null };
    }

    // 🚀 修改点 2：提取画面中所有手的数据
    const allHands = results.multiHandLandmarks.map((lm, index) => ({
        landmarks: lm.map((pt, i) => ({ index: i, x: pt.x, y: pt.y, z: pt.z })),
        handedness: results.multiHandedness?.[index]?.label || 'Unknown'
    }));

    // 🚀 修改点 3：依然返回第一只手给主程序，但在它身上“秘密挂载”所有手的数据！
    const primaryHand = allHands[0];
    const mappedLandmarks = primaryHand.landmarks;
    mappedLandmarks.allHands = allHands; 

    return {
        detected: true,
        landmarks: mappedLandmarks,
        handedness: primaryHand.handedness
    };
}

export function getLandmarkName(index) {
    const names = {
        0: 'Wrist', 1: 'Thumb CMC', 2: 'Thumb MCP', 3: 'Thumb IP', 4: 'Thumb Tip',
        5: 'Index MCP', 6: 'Index PIP', 7: 'Index DIP', 8: 'Index Tip',
        9: 'Middle MCP', 10: 'Middle PIP', 11: 'Middle DIP', 12: 'Middle Tip',
        13: 'Ring MCP', 14: 'Ring PIP', 15: 'Ring DIP', 16: 'Ring Tip',
        17: 'Pinky MCP', 18: 'Pinky PIP', 19: 'Pinky DIP', 20: 'Pinky Tip'
    };
    return names[index] || `Landmark ${index}`;
}

export function cleanupMediaPipe() {
    if (handsInstance) {
        try { handsInstance.close(); } catch (error) { console.warn('⚠️ Error closing MediaPipe:', error); }
        handsInstance = null;
    }
    isLoading = false;
    loadError = null;
    console.log('🧹 MediaPipe cleaned up');
}

export function isMediaPipeReady() {
    return handsInstance !== null && !isLoading;
}

export default {
    initializeMediaPipe, processVideoFrame, drawHandLandmarks,
    extractHandLandmarks, getLandmarkName, cleanupMediaPipe, isMediaPipeReady
};