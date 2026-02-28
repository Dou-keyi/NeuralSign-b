# OpenCV.js Integration Guide

## Architecture

```
src/
├── services/opencv/
│   ├── opencvLoader.js         # CDN loader (singleton)
│   ├── motionTracker.js        # Trajectory & velocity tracking
│   ├── gestureRecognizer.js    # Template-based gesture matching
│   ├── videoPreprocessor.js    # Frame enhancement pipeline
│   ├── opticalFlow.js          # Lucas-Kanade optical flow
│   └── performanceOptimizer.js # Adaptive FPS management
├── hooks/
│   └── useOpenCV.js            # React hook
└── components/opencv/
    ├── OpenCVLoader.jsx        # Loading gate
    ├── MotionTrailOverlay.jsx  # Trajectory canvas
    ├── MotionAnalysisDisplay.jsx # Live metrics card
    └── OpenCVDebugPanel.jsx    # Dev debug panel
```

## How It Works

1. **OpenCV loads lazily** from CDN when the user first enables enhanced detection.
2. **MediaPipe** detects hand landmarks (21 points per hand).
3. **MotionTracker** records palm-center positions over time (up to 60 frames).
4. **GestureRecognizer** matches trajectory features (direction changes, circularity, speed) against predefined templates.
5. **EnhancedWordValidator** merges base position-check scores with motion/gesture scores.

## Usage in Components

```jsx
import { enhancedWordValidator } from '@/services/wordValidation';

// Initialize once
await enhancedWordValidator.initialize();

// Feed landmarks every frame
enhancedWordValidator.motionTracker.addPosition(landmarks, Date.now());

// Validate
const result = await enhancedWordValidator.validateSign(word, landmarks, 'Right');
```

## Supported Gesture Templates

| Sign       | Pattern       | Key Feature              |
|------------|---------------|--------------------------|
| hello      | wave          | Side-to-side oscillation |
| goodbye    | wave          | Side-to-side oscillation |
| thank-you  | linear        | Forward from chin        |
| sorry      | circular      | Circle on chest          |
| please     | circular      | Circle on chest          |
| yes        | nod           | Up-down oscillation      |
| no         | shake         | Fast side-to-side        |
| help       | linear        | Upward motion            |
| go         | linear        | Forward thrust           |
| come       | linear        | Toward body              |

## Memory Management

**Critical:** Always delete OpenCV Mat objects after use:

```js
const frame = cv.imread(video);
try {
  // process frame...
} finally {
  frame.delete();
}
```

## Performance Levels

| Level  | FPS | Preprocessing | Optical Flow | Trajectory |
|--------|-----|---------------|--------------|------------|
| Low    | 10  | ❌             | ❌            | 30 frames  |
| Medium | 15  | ✅             | ❌            | 60 frames  |
| High   | 20  | ✅             | ✅            | 90 frames  |

## Browser Compatibility

- **Chrome 80+** ✅
- **Firefox 78+** ✅
- **Safari 14+** ✅ (WebAssembly support required)
- **Edge 80+** ✅

## Troubleshooting

| Issue | Solution |
|-------|----------|
| OpenCV load timeout | Check network; CDN may be blocked |
| High memory usage | Ensure Mat.delete() is called |
| Low FPS | Switch to low performance level |
| Motion not detected | Ensure hand moves clearly in frame |
