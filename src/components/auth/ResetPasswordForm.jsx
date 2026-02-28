/**
 * Reset Password Form Component
 * Email input for password reset with success/error messaging
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { cn, isValidEmail } from '@/utils/helpers';

/**
 * ResetPasswordForm Component
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler (email)
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.error - Error message
 * @param {Function} props.onClearError - Error clear handler
 */
const ResetPasswordForm = ({ onSubmit, isLoading, error, onClearError }) => {
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        setEmail(e.target.value);
        setLocalError('');
        setIsSuccess(false);
        if (onClearError) onClearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setIsSuccess(false);

        // Validation
        if (!email) {
            setLocalError('Please enter your email address');
            return;
        }

        if (!isValidEmail(email)) {
            setLocalError('Please enter a valid email address');
            return;
        }

        // Submit
        try {
            await onSubmit(email);
            setIsSuccess(true);
        } catch {
            // Error handled by parent
        }
    };

    const displayError = localError || error;

    // Success State
    if (isSuccess) {
        return (
            <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
                    <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-dark-100 mb-2">
                    Check your email
                </h3>
                <p className="text-dark-400 mb-6">
                    We've sent a password reset link to <strong className="text-dark-200">{email}</strong>
                </p>
                <p className="text-sm text-dark-500 mb-6">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                        onClick={() => setIsSuccess(false)}
                        className="text-primary hover:text-primary-400 transition-colors"
                    >
                        try again
                    </button>
                </p>
                <Link to="/login">
                    <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                        Back to Login
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instructions */}
            <p className="text-dark-400 text-sm">
                Enter your email address and we'll send you a link to reset your password.
            </p>

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
                <label htmlFor="reset-email" className="block text-sm font-medium text-dark-200 mb-2">
                    Email Address
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="email"
                        id="reset-email"
                        name="email"
                        value={email}
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

            {/* Submit Button */}
            <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                leftIcon={<Send className="w-5 h-5" />}
            >
                Send Reset Link
            </Button>

            {/* Back to Login */}
            <div className="text-center">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-1 text-sm text-dark-400 hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>
            </div>
        </form>
    );
};

export default ResetPasswordForm;
