/**
 * Account Settings Component
 * Profile information, email/password, connected accounts
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, Lock, User, Link as LinkIcon, AlertCircle, Check } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { cn } from '@/utils/helpers';

const AccountSettings = () => {
    const { user, userData, updateProfile, isLoading } = useAuthStore();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState(userData?.bio || '');
    const [location, setLocation] = useState(userData?.location || '');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateProfile({
                displayName,
                bio,
                location
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            console.error('Error saving profile:', error);
        }
        setIsSaving(false);
    };

    const hasChanges = displayName !== (user?.displayName || '') ||
        bio !== (userData?.bio || '') ||
        location !== (userData?.location || '');

    // Get user initials
    const userInitials = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

    // Format join date
    const joinDate = userData?.createdAt
        ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : 'Recently';

    return (
        <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
                        <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                                <span className="text-2xl font-bold gradient-text">{userInitials}</span>
                            )}
                        </div>
                    </div>
                    <button
                        className="absolute bottom-0 right-0 p-1.5 rounded-full bg-dark-700 border border-dark-600 hover:bg-dark-600 transition-colors"
                        title="Change photo"
                    >
                        <Camera className="w-3.5 h-3.5 text-dark-300" />
                    </button>
                </div>
                <div>
                    <div className="text-dark-200 font-medium">{user?.displayName || 'User'}</div>
                    <div className="text-sm text-dark-400">Member since {joinDate}</div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">Display Name</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        maxLength={30}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-xl',
                            'bg-dark-700 border border-dark-600',
                            'text-dark-100 placeholder:text-dark-500',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                        )}
                    />
                    <div className="text-xs text-dark-500 mt-1">{displayName.length}/30 characters</div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">Bio (Optional)</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        maxLength={150}
                        rows={3}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-xl resize-none',
                            'bg-dark-700 border border-dark-600',
                            'text-dark-100 placeholder:text-dark-500',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                        )}
                    />
                    <div className="text-xs text-dark-500 mt-1">{bio.length}/150 characters</div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">Location (Optional)</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        maxLength={50}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-xl',
                            'bg-dark-700 border border-dark-600',
                            'text-dark-100 placeholder:text-dark-500',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                        )}
                    />
                </div>

                {/* Save Button */}
                <Button
                    onClick={handleSaveProfile}
                    isLoading={isSaving}
                    isDisabled={!hasChanges}
                    leftIcon={saveSuccess ? <Check className="w-4 h-4" /> : null}
                    variant={saveSuccess ? 'success' : 'primary'}
                >
                    {saveSuccess ? 'Saved!' : 'Save Changes'}
                </Button>
            </div>

            {/* Divider */}
            <div className="border-t border-dark-700" />

            {/* Email & Password */}
            <div className="space-y-3">
                <div className="text-sm font-medium text-dark-200">Account Security</div>

                {/* Email */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-dark-400" />
                        <div>
                            <div className="text-sm text-dark-300">Email</div>
                            <div className="text-dark-200">{user?.email || 'Not set'}</div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmailModal(true)}
                    >
                        Change
                    </Button>
                </div>

                {/* Password */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50">
                    <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-dark-400" />
                        <div>
                            <div className="text-sm text-dark-300">Password</div>
                            <div className="text-dark-200">••••••••</div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPasswordModal(true)}
                    >
                        Change
                    </Button>
                </div>
            </div>

            {/* Connected Accounts */}
            <div className="space-y-3">
                <div className="text-sm font-medium text-dark-200">Connected Accounts</div>

                {/* Google */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm text-dark-300">Google</div>
                            <div className="text-dark-200 text-sm">
                                {user?.providerData?.some(p => p.providerId === 'google.com')
                                    ? 'Connected'
                                    : 'Not connected'}
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" isDisabled>
                        {user?.providerData?.some(p => p.providerId === 'google.com') ? 'Connected' : 'Connect'}
                    </Button>
                </div>
            </div>

            {/* Password Change Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Change Password"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex gap-2">
                        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                        <p className="text-sm text-warning">
                            A password reset email will be sent to your registered email address.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary">
                            Send Reset Email
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Email Change Modal */}
            <Modal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                title="Change Email"
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1">New Email</label>
                        <input
                            type="email"
                            placeholder="newemail@example.com"
                            className={cn(
                                'w-full px-4 py-2.5 rounded-xl',
                                'bg-dark-700 border border-dark-600',
                                'text-dark-100 placeholder:text-dark-500',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                            )}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1">Current Password</label>
                        <input
                            type="password"
                            placeholder="Enter current password"
                            className={cn(
                                'w-full px-4 py-2.5 rounded-xl',
                                'bg-dark-700 border border-dark-600',
                                'text-dark-100 placeholder:text-dark-500',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                            )}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setShowEmailModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary">
                            Update Email
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AccountSettings;
