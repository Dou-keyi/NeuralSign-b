/**
 * Motion Analysis Display Component
 * Shows real-time motion metrics: direction, speed, range, and patterns
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion } from 'framer-motion';
import { Activity, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, Waves } from 'lucide-react';

const directionIcons = {
    up: ArrowUp,
    down: ArrowDown,
    left: ArrowLeft,
    right: ArrowRight,
    circular: RotateCw,
    stationary: Activity,
    forward: ArrowUp,
    backward: ArrowDown
};

const speedColors = {
    stationary: 'text-dark-500',
    slow: 'text-blue-400',
    moderate: 'text-warning',
    fast: 'text-error'
};

const MotionAnalysisDisplay = ({ motionData, className = '' }) => {
    if (!motionData) {
        return null;
    }

    const {
        direction = 'stationary',
        speed = 'stationary',
        range = 0,
        wave,
        circular,
        sideToSide
    } = motionData;

    const DirectionIcon = directionIcons[direction] || Activity;

    const patterns = [];
    if (wave?.detected) patterns.push({ label: 'Wave', icon: Waves, color: 'text-primary' });
    if (circular) patterns.push({ label: 'Circular', icon: RotateCw, color: 'text-secondary' });
    if (sideToSide?.detected) patterns.push({ label: 'Side-to-Side', icon: ArrowLeft, color: 'text-accent' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-3 ${className}`}
        >
            <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-dark-300">Motion Analysis</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {/* Direction */}
                <div className="text-center">
                    <DirectionIcon className="w-5 h-5 mx-auto text-primary mb-1" />
                    <div className="text-xs text-dark-300 capitalize">{direction}</div>
                </div>

                {/* Speed */}
                <div className="text-center">
                    <div className={`text-sm font-bold capitalize ${speedColors[speed]}`}>
                        {speed}
                    </div>
                    <div className="text-xs text-dark-400">Speed</div>
                </div>

                {/* Range */}
                <div className="text-center">
                    <div className="text-sm font-bold text-dark-200">
                        {(range * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-dark-400">Range</div>
                </div>
            </div>

            {/* Detected Patterns */}
            {patterns.length > 0 && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-dark-700">
                    {patterns.map(({ label, icon: Icon, color }) => (
                        <span
                            key={label}
                            className={`text-xs px-2 py-0.5 rounded-full bg-dark-800 flex items-center gap-1 ${color}`}
                        >
                            <Icon className="w-3 h-3" />
                            {label}
                        </span>
                    ))}
                </div>
            )}

            {/* Velocity Bar */}
            <div className="mt-2">
                <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(range * 200, 100)}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default MotionAnalysisDisplay;
