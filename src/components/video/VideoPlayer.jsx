/**
 * VideoPlayer Component
 * Reusable video player with custom controls
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Loader2 } from 'lucide-react';

const VideoPlayer = ({
    videoUrl,
    autoplay = false,
    loop = true,
    showControls = true,
    className = '',
    onPlay = null,
    onPause = null,
    onEnd = null,
    poster = null,
    playbackRate = 1.0,
    onError = null
}) => {
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(autoplay);
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [speed, setSpeed] = useState(playbackRate);
    const [showOverlay, setShowOverlay] = useState(true);
    const hideOverlayTimeout = useRef(null);

    // Auto-hide overlay
    const resetOverlayTimer = useCallback(() => {
        setShowOverlay(true);
        if (hideOverlayTimeout.current) clearTimeout(hideOverlayTimeout.current);
        if (isPlaying) {
            hideOverlayTimeout.current = setTimeout(() => setShowOverlay(false), 1500);
        }
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            if (hideOverlayTimeout.current) clearTimeout(hideOverlayTimeout.current);
        };
    }, []);

    // Set initial timer when autoplay starts
    useEffect(() => {
        if (isPlaying) {
            resetOverlayTimer();
        }
    }, [isPlaying, resetOverlayTimer]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
        }
    }, [speed]);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
            onPlay?.();
        } else {
            video.pause();
            setIsPlaying(false);
            onPause?.();
        }
        resetOverlayTimer();
    }, [onPlay, onPause, resetOverlayTimer]);

    const replay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = 0;
        video.play();
        setIsPlaying(true);
        resetOverlayTimer();
    }, [resetOverlayTimer]);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    }, []);

    const cycleSpeed = useCallback(() => {
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
        const currentIdx = speeds.indexOf(speed);
        const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
        setSpeed(nextSpeed);
    }, [speed]);

    const handleSeek = useCallback((e) => {
        const video = videoRef.current;
        const bar = progressRef.current;
        if (!video || !bar) return;

        const rect = bar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * duration;
    }, [duration]);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (video) setCurrentTime(video.currentTime);
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        const video = videoRef.current;
        if (video) {
            setDuration(video.duration);
            setIsLoading(false);
        }
    }, []);

    const handleEnded = useCallback(() => {
        setIsPlaying(false);
        setShowOverlay(true);
        onEnd?.();
    }, [onEnd]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // No video URL placeholder
    if (!videoUrl) {
        return (
            <div className={`relative aspect-video bg-dark-800 rounded-xl flex items-center justify-center ${className}`}>
                <div className="text-center text-dark-400">
                    <Play className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Video not available</p>
                    <p className="text-xs mt-1 text-dark-500">Check back later for a demonstration</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative aspect-video bg-dark-900 rounded-xl overflow-hidden group ${className}`}
            onMouseMove={resetOverlayTimer}
            onMouseEnter={() => setShowOverlay(true)}
            onMouseLeave={() => {
                if (isPlaying) setShowOverlay(false);
            }}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={videoUrl}
                poster={poster}
                autoPlay={autoplay}
                loop={loop}
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onCanPlay={() => setIsLoading(false)}
                onWaiting={() => setIsLoading(true)}
                onError={onError}
                className={`w-full h-full cursor-pointer bg-transparent ${className.includes('object-cover') ? 'object-cover' : 'object-contain'}`}
                onClick={togglePlay}
            />

            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-dark-900/50"
                    >
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Play/Pause Center Icon */}
            <AnimatePresence>
                {!isPlaying && !isLoading && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary transition-colors">
                            <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Controls Overlay */}
            {showControls && (
                <AnimatePresence>
                    {showOverlay && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8"
                        >
                            {/* Progress Bar */}
                            <div
                                ref={progressRef}
                                className="w-full h-1.5 bg-dark-600 rounded-full mb-3 cursor-pointer group/progress"
                                onClick={handleSeek}
                            >
                                <div
                                    className="h-full bg-primary rounded-full relative transition-all"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={togglePlay}
                                    className="text-white hover:text-primary transition-colors"
                                >
                                    {isPlaying
                                        ? <Pause className="w-5 h-5" />
                                        : <Play className="w-5 h-5" />
                                    }
                                </button>

                                <button
                                    onClick={replay}
                                    className="text-white hover:text-primary transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={toggleMute}
                                    className="text-white hover:text-primary transition-colors"
                                >
                                    {isMuted
                                        ? <VolumeX className="w-4 h-4" />
                                        : <Volume2 className="w-4 h-4" />
                                    }
                                </button>

                                <button
                                    onClick={cycleSpeed}
                                    className="text-xs font-bold text-white hover:text-primary transition-colors px-1.5 py-0.5 rounded bg-dark-700/60"
                                >
                                    {speed}x
                                </button>

                                <span className="text-xs text-dark-300 ml-auto">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default VideoPlayer;
