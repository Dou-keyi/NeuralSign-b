/**
 * Motion Trail Overlay Component
 * Draws a gradient trail of hand trajectory over the video feed
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useEffect, useRef } from 'react';

const MotionTrailOverlay = ({
    trajectory = [],
    width = 640,
    height = 480,
    color = '#6366F1',
    fadeColor = '#EC4899',
    lineWidth = 3,
    className = ''
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || trajectory.length < 2) return;

        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw trail with gradient
        for (let i = 1; i < trajectory.length; i++) {
            const t = i / trajectory.length; // 0 to 1

            // Interpolate color from fadeColor to color
            ctx.strokeStyle = interpolateColor(fadeColor, color, t);
            ctx.lineWidth = lineWidth * (0.5 + t * 0.5); // Thinner at start
            ctx.globalAlpha = 0.3 + t * 0.7; // More transparent at start
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            // Mirror X for webcam, convert normalized to pixel coords
            ctx.moveTo((1 - trajectory[i - 1].x) * canvas.width, trajectory[i - 1].y * canvas.height);
            ctx.lineTo((1 - trajectory[i].x) * canvas.width, trajectory[i].y * canvas.height);
            ctx.stroke();
        }

        // Draw current position dot
        if (trajectory.length > 0) {
            const lastPoint = trajectory[trajectory.length - 1];
            ctx.globalAlpha = 1;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.arc(
                (1 - lastPoint.x) * canvas.width,
                lastPoint.y * canvas.height,
                6,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Reset shadow
            ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
    }, [trajectory, color, fadeColor, lineWidth]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
            style={{ zIndex: 10 }}
        />
    );
};

/**
 * Interpolate between two hex colors
 */
function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `rgb(${r}, ${g}, ${b})`;
}

export default MotionTrailOverlay;
