/**
 * Login Form Component
 * Email/password login form with validation
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { cn, isValidEmail } from '@/utils/helpers';

/**
 * LoginForm Component
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler (email, password)
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.error - Error message
 * @param {Function} props.onClearError - Error clear handler
 */
const LoginForm = ({ onSubmit, isLoading, error, onClearError }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setLocalError('');
        if (onClearError) onClearError();
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

        if (formData.password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        // Submit
        try {
            await onSubmit(formData.email, formData.password);
        } catch {
            // Error handled by parent
        }
    };

    const displayError = localError || error;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {displayError && (
                <ErrorMessage
                    message={displayError}
                    onDismiss={() => {
                        setLocalError('');
                        if (onClearError) onClearError();
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="text-sm text-dark-400">Remember me</span>
                </label>
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
    );
};

export default LoginForm;
