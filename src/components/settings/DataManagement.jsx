/**
 * Data Management Component
 * Export data, clear cache, reset progress, delete account
 */

import { useState } from 'react';
import { Download, Trash2, RefreshCcw, AlertTriangle, Check, Loader2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useSettings } from '@/context/SettingsContext';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { cn } from '@/utils/helpers';

const DataManagement = () => {
    const { user, logout } = useAuthStore();
    const { settings, resetSettings } = useSettings();

    const [exportLoading, setExportLoading] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [cacheCleared, setCacheCleared] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [resetOptions, setResetOptions] = useState({
        progress: true,
        achievements: false,
        settings: false
    });

    const handleExportData = async () => {
        setExportLoading(true);
        try {
            // Compile user data
            const exportData = {
                exportDate: new Date().toISOString(),
                user: {
                    email: user?.email,
                    displayName: user?.displayName,
                    createdAt: user?.metadata?.creationTime
                },
                settings: settings,
                // Add more data here as needed
            };

            // Create and download JSON file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `neuralsign-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (error) {
            console.error('Export error:', error);
        }
        setExportLoading(false);
    };

    const handleClearCache = () => {
        // Clear localStorage cache
        localStorage.removeItem('neuralsign-settings-cache');

        // Clear other cached data
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }

        setCacheCleared(true);
        setTimeout(() => setCacheCleared(false), 3000);
    };

    const handleResetProgress = async () => {
        // This would call the database to reset selected data
        if (resetOptions.settings) {
            await resetSettings();
        }
        // TODO: Implement progress and achievements reset
        setShowResetModal(false);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') return;

        // TODO: Implement account deletion
        // This should:
        // 1. Delete user data from Firestore
        // 2. Delete user from Firebase Auth
        // 3. Log out

        setShowDeleteModal(false);
        await logout();
    };

    return (
        <div className="space-y-6">
            {/* Export Data */}
            <div className="p-4 rounded-xl bg-dark-700/50 border border-dark-600">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-dark-200">Export Your Data</div>
                        <p className="text-xs text-dark-400 mt-1">
                            Download a copy of all your NeuralSign data including settings, progress, and achievements.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={handleExportData}
                            isLoading={exportLoading}
                            leftIcon={exportSuccess ? <Check className="w-4 h-4" /> : null}
                        >
                            {exportSuccess ? 'Downloaded!' : 'Export as JSON'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Clear Cache */}
            <div className="p-4 rounded-xl bg-dark-700/50 border border-dark-600">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-secondary/10">
                        <RefreshCcw className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-dark-200">Clear Cache</div>
                        <p className="text-xs text-dark-400 mt-1">
                            Clear locally stored data. This won't affect your saved progress or settings.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={handleClearCache}
                            leftIcon={cacheCleared ? <Check className="w-4 h-4" /> : null}
                        >
                            {cacheCleared ? 'Cache Cleared!' : 'Clear Cache'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reset Progress */}
            <div className="p-4 rounded-xl bg-dark-700/50 border border-warning/30">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-warning/10">
                        <RefreshCcw className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-dark-200">Reset Progress</div>
                        <p className="text-xs text-dark-400 mt-1">
                            Start fresh by resetting your learning progress. You can choose what to reset.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 border-warning/50 text-warning hover:bg-warning/10"
                            onClick={() => setShowResetModal(true)}
                        >
                            Reset Progress
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Account */}
            <div className="p-4 rounded-xl bg-dark-700/50 border border-error/30">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-error/10">
                        <Trash2 className="w-5 h-5 text-error" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-dark-200">Delete Account</div>
                        <p className="text-xs text-dark-400 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button
                            variant="danger"
                            size="sm"
                            className="mt-3"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reset Progress Modal */}
            <Modal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                title="Reset Progress"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex gap-2">
                        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                        <p className="text-sm text-warning">
                            This will permanently reset your selected data. This cannot be undone.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium text-dark-200">Reset options:</div>

                        <label className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 cursor-pointer hover:bg-dark-700">
                            <input
                                type="checkbox"
                                checked={resetOptions.progress}
                                onChange={(e) => setResetOptions({ ...resetOptions, progress: e.target.checked })}
                                className="w-4 h-4 rounded border-dark-500 text-primary focus:ring-primary focus:ring-offset-dark-800"
                            />
                            <div>
                                <div className="text-sm text-dark-200">Learning Progress</div>
                                <div className="text-xs text-dark-400">Signs learned, practice history</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 cursor-pointer hover:bg-dark-700">
                            <input
                                type="checkbox"
                                checked={resetOptions.achievements}
                                onChange={(e) => setResetOptions({ ...resetOptions, achievements: e.target.checked })}
                                className="w-4 h-4 rounded border-dark-500 text-primary focus:ring-primary focus:ring-offset-dark-800"
                            />
                            <div>
                                <div className="text-sm text-dark-200">Achievements & XP</div>
                                <div className="text-xs text-dark-400">Badges, level, experience points</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 cursor-pointer hover:bg-dark-700">
                            <input
                                type="checkbox"
                                checked={resetOptions.settings}
                                onChange={(e) => setResetOptions({ ...resetOptions, settings: e.target.checked })}
                                className="w-4 h-4 rounded border-dark-500 text-primary focus:ring-primary focus:ring-offset-dark-800"
                            />
                            <div>
                                <div className="text-sm text-dark-200">Settings</div>
                                <div className="text-xs text-dark-400">Reset to default settings</div>
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowResetModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleResetProgress}
                            isDisabled={!resetOptions.progress && !resetOptions.achievements && !resetOptions.settings}
                        >
                            Reset Selected
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Account Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-error/10 border border-error/20 flex gap-2">
                        <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
                        <div className="text-sm text-error">
                            <p className="font-medium">This action is permanent!</p>
                            <p className="mt-1">All your data will be deleted and cannot be recovered.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1">
                            Type DELETE to confirm
                        </label>
                        <input
                            type="text"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            placeholder="DELETE"
                            className={cn(
                                'w-full px-4 py-2.5 rounded-xl',
                                'bg-dark-700 border border-dark-600',
                                'text-dark-100 placeholder:text-dark-500',
                                'focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent'
                            )}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            isDisabled={deleteConfirm !== 'DELETE'}
                        >
                            Delete My Account
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DataManagement;
