/**
 * UserMenu Component
 * Reusable user profile dropdown menu
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Settings,
    LogOut,
    ChevronDown,
    Shield
} from 'lucide-react';
import { cn } from '@/utils/helpers';

const userMenuItems = [
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
];

const UserMenu = ({
    user,
    isAdmin,
    onLogout,
    variant = 'navbar', // 'navbar' or 'admin'
    onExitAdmin
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userInitials = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl',
                    'text-dark-300 hover:text-white hover:bg-dark-800',
                    'transition-all duration-200',
                    isOpen && 'bg-dark-800 text-white'
                )}
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
                    <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <span className="text-xs font-bold text-primary">
                                {userInitials}
                            </span>
                        )}
                    </div>
                </div>
                <span className="text-sm font-medium max-w-24 truncate">
                    {user?.displayName || 'User'}
                </span>
                <ChevronDown
                    className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 py-2 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-[100]"
                    >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-dark-700">
                            <p className="text-sm font-medium text-dark-100 truncate">
                                {user?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-dark-400 truncate">
                                {user?.email}
                            </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            {isAdmin && variant === 'navbar' && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
                                >
                                    <Shield className="w-4 h-4" />
                                    Admin Dashboard
                                </Link>
                            )}
                            {userMenuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Action (Logout or Exit Admin) */}
                        <div className="pt-2 border-t border-dark-700">
                            {variant === 'admin' ? (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        onExitAdmin?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Exit Admin
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        onLogout?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserMenu;
