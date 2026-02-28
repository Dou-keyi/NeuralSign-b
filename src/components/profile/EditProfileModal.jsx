/**
 * Edit Profile Modal Component
 * Modal for editing user profile information
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Camera, Save, Loader2 } from 'lucide-react';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { cn } from '@/utils/helpers';

/**
 * EditProfileModal Component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.user - Current user data
 * @param {Function} props.onSave - Save handler ({ displayName, photoURL })
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.error - Error message
 */
const EditProfileModal = ({ isOpen, onClose, user, onSave, isLoading, error }) => {
    const [displayName, setDisplayName] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);
    const [localError, setLocalError] = useState('');

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setPhotoPreview(user.photoURL || null);
        }
    }, [user, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        // Validation
        if (!displayName.trim()) {
            setLocalError('Display name is required');
            return;
        }

        if (displayName.trim().length < 2) {
            setLocalError('Display name must be at least 2 characters');
            return;
        }

        try {
            await onSave({ displayName: displayName.trim() });
            onClose();
        } catch (err) {
            // Error handled by parent
        }
    };

    const handlePhotoClick = () => {
        // Placeholder for photo upload functionality
        console.log('Photo upload coming soon');
        setLocalError('Photo upload will be available in a future update');
    };

    const displayError = localError || error;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <div className="glass-card p-6 m-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-dark-100">Edit Profile</h2>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Error Message */}
                                {displayError && (
                                    <ErrorMessage
                                        message={displayError}
                                        onDismiss={() => setLocalError('')}
                                    />
                                )}

                                {/* Profile Photo */}
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={handlePhotoClick}
                                        className="relative group"
                                        disabled={isLoading}
                                    >
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                                            <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                                                {photoPreview ? (
                                                    <img
                                                        src={photoPreview}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <span className="text-3xl font-bold gradient-text">
                                                        {displayName?.[0]?.toUpperCase() || 'U'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </button>
                                </div>
                                <p className="text-center text-xs text-dark-500">
                                    Click to change photo (coming soon)
                                </p>

                                {/* Display Name */}
                                <div>
                                    <label htmlFor="displayName" className="block text-sm font-medium text-dark-200 mb-2">
                                        Display Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                        <input
                                            type="text"
                                            id="displayName"
                                            value={displayName}
                                            onChange={(e) => {
                                                setDisplayName(e.target.value);
                                                setLocalError('');
                                            }}
                                            placeholder="Your name"
                                            disabled={isLoading}
                                            className={cn(
                                                'w-full pl-10 pr-4 py-3 rounded-xl',
                                                'bg-dark-700/50 border border-dark-600',
                                                'text-dark-100 placeholder-dark-400',
                                                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                                'transition-all duration-200',
                                                'disabled:opacity-50 disabled:cursor-not-allowed'
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-dark-400 mb-2">
                                        Email Address
                                    </label>
                                    <div className="px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 text-dark-400">
                                        {user?.email || 'Not available'}
                                    </div>
                                    <p className="mt-1 text-xs text-dark-500">
                                        Email cannot be changed
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={isLoading}
                                        leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        className="flex-1"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditProfileModal;
