/**
 * VideoUploader Component
 * Admin interface for uploading sign videos
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Check, AlertCircle, Film, X } from 'lucide-react';
import { videoStorageService } from '@/services/videoStorage';

const VideoUploader = ({ signId, signName, onUploadComplete = null }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setError(null);
        setResult(null);
    };

    const handleUpload = async () => {
        if (!selectedFile || !signId) return;

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            const uploadResult = await videoStorageService.uploadSignVideo(
                selectedFile,
                signId,
                (prog) => setProgress(prog)
            );

            setResult(uploadResult);
            onUploadComplete?.(uploadResult);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setError(null);
        setResult(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
                <Film className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-dark-100">
                    Upload Video {signName ? `for "${signName}"` : ''}
                </h4>
            </div>

            {/* File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileSelect}
                className="hidden"
            />

            {!selectedFile && !result && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-dark-600 rounded-xl
                             hover:border-primary/50 transition-colors text-center"
                >
                    <Upload className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                    <p className="text-dark-300 text-sm">Click to select a video file</p>
                    <p className="text-dark-500 text-xs mt-1">MP4, WebM, or MOV (max 50MB)</p>
                </motion.button>
            )}

            {/* Selected File Preview */}
            {selectedFile && !result && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg">
                        <Film className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-dark-100 truncate">{selectedFile.name}</p>
                            <p className="text-xs text-dark-400">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>
                        <button onClick={clearSelection} className="text-dark-400 hover:text-error">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="space-y-1">
                            <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-dark-400 text-center">{progress}%</p>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-2 rounded-lg bg-primary hover:bg-primary/80
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 text-white font-medium text-sm transition-colors"
                    >
                        {uploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                </div>
            )}

            {/* Success */}
            {result && (
                <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-success font-medium">Upload complete!</p>
                        <p className="text-xs text-dark-400 mt-0.5">{result.fileName}</p>
                    </div>
                    <button onClick={clearSelection} className="text-dark-400 hover:text-dark-200 text-xs">
                        Upload another
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-lg mt-2">
                    <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error">{error}</p>
                </div>
            )}
        </div>
    );
};

export default VideoUploader;
