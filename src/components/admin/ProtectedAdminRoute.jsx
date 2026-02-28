/**
 * Protected Admin Route
 * Route protection for admin pages
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Loader2, ShieldX, Lock } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useAdmin } from '@/context/AdminContext';

const ProtectedAdminRoute = ({ children, requirePermission }) => {
    const { isAuthenticated, isLoading: authLoading } = useAuthStore();
    const { isAdmin, loading: adminLoading, can } = useAdmin();

    if (authLoading || adminLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative inline-block mb-4">
                        <Brain className="w-16 h-16 text-primary" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Loader2 className="w-20 h-20 text-primary/30" />
                        </motion.div>
                    </div>
                    <p className="text-dark-400 text-sm">Verifying admin access...</p>
                </motion.div>
            </div>
        );
    }

    // Not logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Not admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto px-6"
                >
                    <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
                        <ShieldX className="w-10 h-10 text-error" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
                    <p className="text-dark-400 mb-6">
                        You don't have permission to access the admin panel.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors"
                    >
                        Go to Home
                    </button>
                </motion.div>
            </div>
        );
    }

    // Check specific permission if required
    if (requirePermission && !can(requirePermission)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto px-6"
                >
                    <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-warning" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Insufficient Permissions</h2>
                    <p className="text-dark-400 mb-6">
                        You don't have permission to access this section.
                    </p>
                    <button
                        onClick={() => window.location.href = '/admin'}
                        className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors"
                    >
                        Back to Admin Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedAdminRoute;
