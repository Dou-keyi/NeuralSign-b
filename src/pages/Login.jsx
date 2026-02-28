/**
 * Login Page
 * User authentication login form
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import useAuthStore from '@/store/authStore';
import { useAdmin } from '@/context/AdminContext';
import { isAdmin as checkAdmin } from '@/config/adminConfig';
import { cn, isValidEmail } from '@/utils/helpers';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    // Get redirect path from location state or default to /learn
    const from = location.state?.from?.pathname || '/learn';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setLocalError('');
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        // Validation
        if (!formData.email || !formData.password) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (!isValidEmail(formData.email)) {
            setLocalError('Please enter a valid email address');
            return;
        }

        try {
            const user = await login(formData.email, formData.password);

            // If there's a specific 'from' path, go there (unless it's just /learn and they are admin)
            const isAdmin = checkAdmin(user);

            if (location.state?.from && !isAdmin) {
                navigate(from, { replace: true });
            } else {
                // Otherwise check if user is admin
                navigate(isAdmin ? '/admin' : '/learn', { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await loginWithGoogle();
            const user = result.user || result; // Handle both return shapes

            const isAdmin = checkAdmin(user);
            if (location.state?.from && !isAdmin) {
                navigate(from, { replace: true });
            } else {
                navigate(isAdmin ? '/admin' : '/learn', { replace: true });
            }
        } catch (err) {
            console.error('Google sign-in error:', err);
        }
    };

    const displayError = localError || error;

    return (
        <PageContainer className="min-h-screen flex items-center justify-center py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <Brain className="w-10 h-10 text-primary" />
                        <span className="text-2xl font-bold gradient-text">NeuralSign</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-dark-100 mb-2">Welcome Back</h1>
                    <p className="text-dark-400">Sign in to continue your learning journey</p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {displayError && (
                            <ErrorMessage
                                message={displayError}
                                onDismiss={() => {
                                    setLocalError('');
                                    clearError();
                                }}
                            />
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    className={cn(
                                        'w-full pl-10 pr-4 py-3 rounded-xl',
                                        'bg-dark-700/50 border border-dark-600',
                                        'text-dark-100 placeholder-dark-400',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                        'transition-all duration-200'
                                    )}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={cn(
                                        'w-full pl-10 pr-12 py-3 rounded-xl',
                                        'bg-dark-700/50 border border-dark-600',
                                        'text-dark-100 placeholder-dark-400',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                        'transition-all duration-200'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <Link
                                to="/reset-password"
                                className="text-sm text-primary hover:text-primary-400 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                            leftIcon={<LogIn className="w-5 h-5" />}
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-dark-600" />
                        <span className="text-dark-400 text-sm">or</span>
                        <div className="flex-1 h-px bg-dark-600" />
                    </div>

                    {/* Google Sign In */}
                    <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={isLoading} />
                </motion.div>

                {/* Sign Up Link */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-6 text-dark-400"
                >
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        className="text-primary hover:text-primary-400 font-medium transition-colors inline-flex items-center gap-1"
                    >
                        Sign up <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.p>
            </div>
        </PageContainer>
    );
};

export default Login;
