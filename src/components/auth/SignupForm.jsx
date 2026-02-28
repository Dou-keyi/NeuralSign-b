/**
 * Signup Form Component
 * Registration form with password strength indicator
 */

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { cn, isValidEmail, isValidPassword } from '@/utils/helpers';

// Password requirements
const passwordRequirements = [
    { label: 'At least 8 characters', check: (p) => p.length >= 8 },
    { label: 'One uppercase letter', check: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', check: (p) => /[a-z]/.test(p) },
    { label: 'One number', check: (p) => /\d/.test(p) },
];

/**
 * Password Strength Indicator
 */
const PasswordStrength = ({ password }) => {
    if (!password) return null;

    const passedCount = passwordRequirements.filter((req) => req.check(password)).length;
    const strength = passedCount / passwordRequirements.length;

    let strengthLabel = 'Weak';
    let strengthColor = 'bg-error';

    if (strength >= 1) {
        strengthLabel = 'Strong';
        strengthColor = 'bg-success';
    } else if (strength >= 0.75) {
        strengthLabel = 'Good';
        strengthColor = 'bg-success/70';
    } else if (strength >= 0.5) {
        strengthLabel = 'Medium';
        strengthColor = 'bg-warning';
    }

    return (
        <div className="mt-2">
            {/* Strength Bar */}
            <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div
                        className={cn('h-full transition-all duration-300', strengthColor)}
                        style={{ width: `${strength * 100}%` }}
                    />
                </div>
                <span className={cn('text-xs font-medium', strength >= 0.75 ? 'text-success' : 'text-dark-400')}>
                    {strengthLabel}
                </span>
            </div>

            {/* Requirements List */}
            <div className="space-y-1">
                {passwordRequirements.map((req, index) => {
                    const passed = req.check(password);
                    return (
                        <div
                            key={index}
                            className={cn(
                                'flex items-center gap-2 text-xs',
                                passed ? 'text-success' : 'text-dark-400'
                            )}
                        >
                            {passed ? (
                                <CheckCircle className="w-3 h-3" />
                            ) : (
                                <XCircle className="w-3 h-3" />
                            )}
                            {req.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * SignupForm Component
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler (email, password, displayName)
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.error - Error message
 * @param {Function} props.onClearError - Error clear handler
 */
const SignupForm = ({ onSubmit, isLoading, error, onClearError }) => {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (formData.displayName.length < 2) {
            setLocalError('Display name must be at least 2 characters');
            return;
        }

        if (!isValidEmail(formData.email)) {
            setLocalError('Please enter a valid email address');
            return;
        }

        if (!isValidPassword(formData.password)) {
            setLocalError('Password does not meet requirements');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (!formData.acceptTerms) {
            setLocalError('Please accept the terms and conditions');
            return;
        }

        // Submit
        try {
            await onSubmit(formData.email, formData.password, formData.displayName);
        } catch {
            // Error handled by parent
        }
    };

    const displayError = localError || error;
    const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Display Name Field */}
            <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-dark-200 mb-2">
                    Display Name
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        placeholder="Your name"
                        autoComplete="name"
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
                        autoComplete="new-password"
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

                {/* Password Strength */}
                <PasswordStrength password={formData.password} />
            </div>

            {/* Confirm Password Field */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-200 mb-2">
                    Confirm Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={cn(
                            'w-full pl-10 pr-12 py-3 rounded-xl',
                            'bg-dark-700/50 border',
                            formData.confirmPassword && !passwordsMatch
                                ? 'border-error'
                                : formData.confirmPassword && passwordsMatch
                                    ? 'border-success'
                                    : 'border-dark-600',
                            'text-dark-100 placeholder-dark-400',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                            'transition-all duration-200'
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-xs text-error">Passwords do not match</p>
                )}
            </div>

            {/* Terms & Conditions */}
            <div>
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className="mt-0.5 w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="text-sm text-dark-400">
                        I agree to the{' '}
                        <a href="#" className="text-primary hover:text-primary-400 transition-colors">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-primary hover:text-primary-400 transition-colors">
                            Privacy Policy
                        </a>
                    </span>
                </label>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                leftIcon={<UserPlus className="w-5 h-5" />}
            >
                Create Account
            </Button>
        </form>
    );
};

export default SignupForm;
