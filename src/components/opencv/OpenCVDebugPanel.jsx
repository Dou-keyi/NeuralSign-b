/**
 * OpenCV Debug Panel Component
 * Developer-only panel showing performance metrics, motion data, and controls
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ChevronDown, ChevronUp, Activity, Cpu, MemoryStick } from 'lucide-react';
import { performanceOptimizer } from '@/services/opencv/performanceOptimizer';

const OpenCVDebugPanel = ({ motionData, visible = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!visible) return null;

    const metrics = performanceOptimizer.getMetrics();
    const settings = performanceOptimizer.getProcessingSettings();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-4 right-4 z-50"
            style={{ maxWidth: '320px' }}
        >
            {/* Toggle Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-dark-900/95 backdrop-blur-sm border border-dark-700 rounded-t-xl text-xs text-dark-300 hover:text-dark-100 transition-colors"
            >
                <Bug className="w-3.5 h-3.5 text-warning" />
                <span className="font-mono font-medium">OpenCV Debug</span>
                <span className="ml-auto flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${performanceOptimizer.performanceLevel === 'high' ? 'bg-success' :
                            performanceOptimizer.performanceLevel === 'medium' ? 'bg-warning' : 'bg-error'
                        }`} />
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </span>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-dark-900/95 backdrop-blur-sm border border-t-0 border-dark-700 rounded-b-xl overflow-hidden"
                    >
                        <div className="p-3 space-y-3">
                            {/* Performance Metrics */}
                            <div>
                                <div className="flex items-center gap-1 mb-1.5">
                                    <Cpu className="w-3 h-3 text-primary" />
                                    <span className="text-xs font-medium text-dark-300">Performance</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-dark-800 rounded px-2 py-1">
                                        <div className="text-xs font-mono font-bold text-primary">
                                            {metrics.currentFPS.toFixed(1)}
                                        </div>
                                        <div className="text-[10px] text-dark-500">FPS</div>
                                    </div>
                                    <div className="bg-dark-800 rounded px-2 py-1">
                                        <div className="text-xs font-mono font-bold text-warning">
                                            {metrics.frameSkipRate.toFixed(0)}%
                                        </div>
                                        <div className="text-[10px] text-dark-500">Skip</div>
                                    </div>
                                    <div className="bg-dark-800 rounded px-2 py-1">
                                        <div className="text-xs font-mono font-bold text-secondary">
                                            {metrics.memoryUsage.toFixed(0)}MB
                                        </div>
                                        <div className="text-[10px] text-dark-500">Memory</div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Level */}
                            <div>
                                <div className="flex items-center gap-1 mb-1.5">
                                    <Activity className="w-3 h-3 text-secondary" />
                                    <span className="text-xs font-medium text-dark-300">Level</span>
                                </div>
                                <div className="flex gap-1">
                                    {['low', 'medium', 'high'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => performanceOptimizer.setPerformanceLevel(level)}
                                            className={`flex-1 text-[10px] px-2 py-1 rounded capitalize transition-colors ${performanceOptimizer.performanceLevel === level
                                                    ? 'bg-primary text-white'
                                                    : 'bg-dark-800 text-dark-400 hover:text-dark-200'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Motion Data */}
                            {motionData && (
                                <div>
                                    <div className="flex items-center gap-1 mb-1.5">
                                        <MemoryStick className="w-3 h-3 text-accent" />
                                        <span className="text-xs font-medium text-dark-300">Motion</span>
                                    </div>
                                    <pre className="text-[10px] font-mono text-dark-400 bg-dark-800 rounded p-2 max-h-32 overflow-y-auto">
                                        {JSON.stringify({
                                            dir: motionData.direction,
                                            spd: motionData.speed,
                                            rng: motionData.range?.toFixed(3),
                                            wave: motionData.wave?.detected,
                                            circ: motionData.circular,
                                            pts: motionData.trajectoryLength
                                        }, null, 1)}
                                    </pre>
                                </div>
                            )}

                            {/* Settings */}
                            <div className="border-t border-dark-700 pt-2">
                                <div className="text-[10px] text-dark-500 space-y-0.5">
                                    <div>Preprocess: {settings.enablePreprocessing ? '✅' : '❌'}</div>
                                    <div>BG Remove: {settings.enableBackgroundRemoval ? '✅' : '❌'}</div>
                                    <div>Optical Flow: {settings.enableOpticalFlow ? '✅' : '❌'}</div>
                                    <div>Max Trajectory: {settings.maxTrajectoryLength}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default OpenCVDebugPanel;
