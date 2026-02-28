/**
 * Video Storage Service
 * Handles Firebase Storage operations for sign videos
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/services/firebase';

// Constants
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const VIDEO_PATH = 'signs/videos';
const THUMBNAIL_PATH = 'signs/thumbnails';

/**
 * Video Storage Service Class
 */
class VideoStorageService {

    /**
     * Upload a sign video to Firebase Storage
     * @param {File} file - Video file
     * @param {string} signId - Sign identifier
     * @param {Function} onProgress - Progress callback (0-100)
     * @returns {Promise<Object>} Upload result with URLs
     */
    async uploadSignVideo(file, signId, onProgress = null) {
        // Validate file
        if (!file) throw new Error('No file provided');
        if (file.size > MAX_VIDEO_SIZE) {
            throw new Error(`File too large. Maximum size is ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`);
        }
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            throw new Error(`Invalid file type. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}`);
        }

        const ext = file.name.split('.').pop();
        const fileName = `${signId}.${ext}`;
        const videoRef = ref(storage, `${VIDEO_PATH}/${fileName}`);

        return new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(videoRef, file, {
                contentType: file.type,
                customMetadata: {
                    signId,
                    uploadedAt: new Date().toISOString()
                }
            });

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    console.error('❌ Upload failed:', error);
                    reject(error);
                },
                async () => {
                    try {
                        const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);

                        // Generate thumbnail
                        let thumbnailUrl = '';
                        try {
                            thumbnailUrl = await this.generateThumbnail(file, signId);
                        } catch (thumbErr) {
                            console.warn('⚠️ Thumbnail generation failed:', thumbErr.message);
                        }

                        // Update Firestore document
                        await this.updateSignVideoData(signId, videoUrl, thumbnailUrl, file);

                        resolve({
                            videoUrl,
                            thumbnailUrl,
                            fileName,
                            fileSize: file.size,
                            fileType: file.type
                        });
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    }

    /**
     * Generate a thumbnail from the first frame of a video
     * @param {File} videoFile - Video file
     * @param {string} signId - Sign identifier
     * @returns {Promise<string>} Thumbnail download URL
     */
    async generateThumbnail(videoFile, signId) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            video.preload = 'metadata';

            video.onloadeddata = () => {
                video.currentTime = 0.5; // Capture at 0.5s
            };

            video.onseeked = async () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create thumbnail blob'));
                        return;
                    }

                    try {
                        const thumbRef = ref(storage, `${THUMBNAIL_PATH}/${signId}.jpg`);
                        await uploadBytesResumable(thumbRef, blob, {
                            contentType: 'image/jpeg'
                        });
                        const url = await getDownloadURL(thumbRef);
                        URL.revokeObjectURL(video.src);
                        resolve(url);
                    } catch (err) {
                        reject(err);
                    }
                }, 'image/jpeg', 0.8);
            };

            video.onerror = () => {
                URL.revokeObjectURL(video.src);
                reject(new Error('Failed to load video for thumbnail'));
            };

            video.src = URL.createObjectURL(videoFile);
        });
    }

    /**
     * Update Firestore sign document with video data
     * @param {string} signId - Sign identifier
     * @param {string} videoUrl - Video download URL
     * @param {string} thumbnailUrl - Thumbnail download URL
     * @param {File} file - Original video file
     */
    async updateSignVideoData(signId, videoUrl, thumbnailUrl, file) {
        if (!db) return;

        const signRef = doc(db, 'signs', signId);
        await updateDoc(signRef, {
            videoUrl,
            thumbnailUrl,
            videoSize: file.size,
            videoType: file.type,
            updatedAt: serverTimestamp()
        });

        console.log(`✅ Updated Firestore for sign: ${signId}`);
    }

    /**
     * Delete a sign video and its thumbnail
     * @param {string} signId - Sign identifier
     * @param {string} ext - File extension
     */
    async deleteSignVideo(signId, ext = 'mp4') {
        try {
            const videoRef = ref(storage, `${VIDEO_PATH}/${signId}.${ext}`);
            await deleteObject(videoRef);
            console.log(`🗑️ Deleted video for: ${signId}`);
        } catch (error) {
            if (error.code !== 'storage/object-not-found') {
                throw error;
            }
        }

        try {
            const thumbRef = ref(storage, `${THUMBNAIL_PATH}/${signId}.jpg`);
            await deleteObject(thumbRef);
            console.log(`🗑️ Deleted thumbnail for: ${signId}`);
        } catch (error) {
            if (error.code !== 'storage/object-not-found') {
                throw error;
            }
        }

        // Clear URLs in Firestore
        if (db) {
            const signRef = doc(db, 'signs', signId);
            await updateDoc(signRef, {
                videoUrl: '',
                thumbnailUrl: '',
                updatedAt: serverTimestamp()
            });
        }
    }

    /**
     * Get a video URL for a sign
     * @param {string} signId - Sign identifier
     * @param {string} ext - File extension
     * @returns {Promise<string>} Video download URL
     */
    async getVideoUrl(signId, ext = 'mp4') {
        const videoRef = ref(storage, `${VIDEO_PATH}/${signId}.${ext}`);
        return await getDownloadURL(videoRef);
    }

    /**
     * List all uploaded sign videos
     * @returns {Promise<Array>} List of video references
     */
    async listAllVideos() {
        const listRef = ref(storage, VIDEO_PATH);
        const result = await listAll(listRef);
        return result.items.map(item => ({
            name: item.name,
            fullPath: item.fullPath
        }));
    }
}

export const videoStorageService = new VideoStorageService();
export default videoStorageService;
