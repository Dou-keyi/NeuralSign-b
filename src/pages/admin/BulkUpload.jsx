/**
 * Bulk Video Upload
 * Upload multiple sign videos simultaneously
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    X,
    Film,
    CheckCircle,
    AlertCircle,
    Trash2,
    Play,
    Loader2
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/services/firebase';

const BulkUpload = () => {
    const fileInputRef = useRef(null);
    const [uploads, setUploads] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFilesSelected = (e) => {
        const files = Array.from(e.target.files || []);

        const newUploads = files.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            file,
            fileName: file.name,
            size: file.size,
            signId: '',
            category: '',
            status: 'pending', // pending, uploading, completed, error
            progress: 0,
            error: null,
            videoUrl: null
        }));

        setUploads(prev => [...prev, ...newUploads]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const updateUpload = (id, updates) => {
        setUploads(prev =>
            prev.map(u => u.id === id ? { ...u, ...updates } : u)
        );
    };

    const removeUpload = (id) => {
        setUploads(prev => prev.filter(u => u.id !== id));
    };

    const uploadSingle = async (uploadItem) => {
        try {
            updateUpload(uploadItem.id, { status: 'uploading', progress: 0 });

            const ext = uploadItem.file.name.split('.').pop();
            const fileName = `${uploadItem.signId || uploadItem.id}_${Date.now()}.${ext}`;
            const storageRef = ref(storage, `signs/videos/${fileName}`);

            const metadata = { contentType: uploadItem.file.type };
            const uploadTask = uploadBytesResumable(storageRef, uploadItem.file, metadata);

            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        updateUpload(uploadItem.id, { progress });
                    },
                    (error) => {
                        updateUpload(uploadItem.id, { status: 'error', error: error.message });
                        reject(error);
                    },
                    async () => {
                        try {
                            const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);

                            // If signId provided, update the sign document
                            if (uploadItem.signId) {
                                try {
                                    await updateDoc(doc(db, 'signs', uploadItem.signId), {
                                        videoUrl,
                                        updatedAt: serverTimestamp()
                                    });
                                } catch (err) {
                                    console.warn('Could not update sign doc:', err);
                                }
                            }

                            updateUpload(uploadItem.id, {
                                status: 'completed',
                                progress: 100,
                                videoUrl
                            });
                            resolve(videoUrl);
                        } catch (error) {
                            updateUpload(uploadItem.id, { status: 'error', error: error.message });
                            reject(error);
                        }
                    }
                );
            });
        } catch (error) {
            updateUpload(uploadItem.id, { status: 'error', error: error.message });
        }
    };

    const handleStartUpload = async () => {
        const pendingUploads = uploads.filter(u => u.status === 'pending');
        if (pendingUploads.length === 0) return;

        setIsUploading(true);

        // Upload in parallel with concurrency limit of 3
        const concurrency = 3;
        const queue = [...pendingUploads];

        const workers = Array(Math.min(concurrency, queue.length))
            .fill(null)
            .map(async () => {
                while (queue.length > 0) {
                    const item = queue.shift();
                    if (item) await uploadSingle(item);
                }
            });

        await Promise.all(workers);
        setIsUploading(false);
    };

    const clearCompleted = () => {
        setUploads(prev => prev.filter(u => u.status !== 'completed'));
    };

    const pendingCount = uploads.filter(u => u.status === 'pending').length;
    const completedCount = uploads.filter(u => u.status === 'completed').length;
    const errorCount = uploads.filter(u => u.status === 'error').length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Bulk Video Upload</h1>
                <p className="text-dark-400 text-sm mt-1">Upload multiple sign videos at once</p>
            </div>

            {/* Upload Area */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                />

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-dark-600 rounded-xl hover:border-primary/50 transition-colors text-center"
                >
                    <Upload className="w-10 h-10 text-dark-400 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">Drop videos here or click to browse</p>
                    <p className="text-dark-500 text-sm">MP4, WebM, or MOV (max 50MB each)</p>
                </motion.button>
            </div>

            {/* Upload Queue */}
            {uploads.length > 0 && (
                <>
                    {/* Summary Bar */}
                    <div className="flex items-center justify-between bg-dark-800 border border-dark-700 rounded-xl p-4">
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-dark-400">{uploads.length} files</span>
                            {pendingCount > 0 && <span className="text-primary">{pendingCount} pending</span>}
                            {completedCount > 0 && <span className="text-success">{completedCount} completed</span>}
                            {errorCount > 0 && <span className="text-error">{errorCount} errors</span>}
                        </div>

                        <div className="flex gap-2">
                            {completedCount > 0 && (
                                <button
                                    onClick={clearCompleted}
                                    className="px-3 py-1.5 text-dark-400 hover:text-white text-sm transition-colors"
                                >
                                    Clear Completed
                                </button>
                            )}
                            <button
                                onClick={handleStartUpload}
                                disabled={isUploading || pendingCount === 0}
                                className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Start Upload ({pendingCount})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* File List */}
                    <div className="space-y-2">
                        <AnimatePresence>
                            {uploads.map(upload => (
                                <UploadItem
                                    key={upload.id}
                                    upload={upload}
                                    onUpdate={(updates) => updateUpload(upload.id, updates)}
                                    onRemove={() => removeUpload(upload.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Upload Item ─────────────────────────────────────────

function UploadItem({ upload, onUpdate, onRemove }) {
    const statusColors = {
        pending: 'border-dark-700',
        uploading: 'border-primary/30',
        completed: 'border-success/30',
        error: 'border-error/30'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`bg-dark-800 border ${statusColors[upload.status]} rounded-xl p-4`}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${upload.status === 'completed'
                        ? 'bg-success/10'
                        : upload.status === 'error'
                            ? 'bg-error/10'
                            : 'bg-dark-700'
                    }`}>
                    {upload.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                    ) : upload.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-error" />
                    ) : (
                        <Film className="w-5 h-5 text-dark-400" />
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium truncate">{upload.fileName}</p>
                        <span className="text-dark-500 text-xs">
                            {(upload.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                    </div>

                    {/* Metadata inputs (only for pending) */}
                    {upload.status === 'pending' && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Sign ID"
                                value={upload.signId}
                                onChange={(e) => onUpdate({ signId: e.target.value })}
                                className="flex-1 px-3 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                            <input
                                type="text"
                                placeholder="Category"
                                value={upload.category}
                                onChange={(e) => onUpdate({ category: e.target.value })}
                                className="flex-1 px-3 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                    )}

                    {/* Progress Bar */}
                    {upload.status === 'uploading' && (
                        <div className="space-y-1">
                            <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${upload.progress}%` }}
                                />
                            </div>
                            <p className="text-dark-500 text-xs">{upload.progress}%</p>
                        </div>
                    )}

                    {/* Error */}
                    {upload.error && (
                        <p className="text-error text-xs">{upload.error}</p>
                    )}
                </div>

                {/* Remove */}
                {(upload.status === 'pending' || upload.status === 'completed' || upload.status === 'error') && (
                    <button
                        onClick={onRemove}
                        className="p-1.5 text-dark-500 hover:text-error transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

export default BulkUpload;
