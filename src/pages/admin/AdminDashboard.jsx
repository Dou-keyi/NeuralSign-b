/**
 * Admin Dashboard
 * Main admin layout with sidebar navigation and stats overview
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdmin } from '@/context/AdminContext';
import Button from '@/components/common/Button';
import { cn } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';
import UserMenu from '@/components/layout/UserMenu';
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    Menu,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Upload,
    BookOpen,
    CheckCircle,
    FolderOpen,
    Shield,
    Brain,
    BarChart3,
    X,
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { isAdmin, adminRole, can } = useAdmin();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        totalWords: 0,
        totalCategories: 0,
        totalUsers: 0,
        publishedWords: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const wordsSnapshot = await getDocs(collection(db, 'signs'));
            const totalWords = wordsSnapshot.size;

            let publishedWords = 0;
            wordsSnapshot.docs.forEach(doc => {
                if (doc.data().status === 'published') publishedWords++;
            });

            const categoriesSnapshot = await getDocs(collection(db, 'categories'));
            const totalCategories = categoriesSnapshot.size;

            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnapshot.size;

            setStats({ totalWords, totalCategories, totalUsers, publishedWords });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const navigationItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, permission: null },
        { name: 'Words', path: '/admin/words', icon: FileText, permission: 'editWords' },
        { name: 'Categories', path: '/admin/categories', icon: FolderOpen, permission: 'editCategories' },
        { name: 'Upload', path: '/admin/upload', icon: Upload, permission: 'uploadVideos' },
        { name: 'Users', path: '/admin/users', icon: Users, permission: 'viewUsers' },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3, permission: 'viewAnalytics' },
        { name: 'Settings', path: '/admin/settings', icon: Settings, permission: 'systemSettings' }
    ];

    const filteredNav = navigationItems.filter(item =>
        !item.permission || can(item.permission)
    );

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen overflow-hidden text-dark-100 relative">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
                className="glass-card m-3 mr-0 border-dark-700/50 flex-shrink-0 overflow-hidden flex flex-col z-20"
            >
                <div className="w-[280px] min-w-[280px] h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-dark-700/50">
                        <div className="flex items-center justify-between">
                            <Link to="/" className="flex items-center gap-2 group">
                                <motion.div
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                    className="relative"
                                >
                                    <Brain className="w-8 h-8 text-primary" />
                                    <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                                <span className="text-xl font-bold gradient-text">NeuralSign</span>
                            </Link>

                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-dark-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>


                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {filteredNav.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/admin'}
                                    className={({ isActive }) => cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-primary/15 text-primary border border-primary/20 shadow-lg shadow-primary/10'
                                            : 'text-dark-400 hover:bg-dark-700/50 hover:text-white border border-transparent'
                                    )}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {item.name}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-dark-700/50 mt-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                Admin Dashboard
                            </span>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden neural-bg">
                {/* Top Bar */}
                <header className="h-16 glass-card m-3 border-dark-700/50 flex items-center justify-between px-6 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen ? (
                            <Link to="/" className="flex items-center gap-2 group">
                                <motion.div
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    className="relative"
                                >
                                    <Brain className="w-8 h-8 text-primary" />
                                </motion.div>
                                <span className="text-xl font-bold gradient-text">NeuralSign</span>
                            </Link>
                        ) : (
                            <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-wider">
                                {location.pathname === '/admin' ? 'Dashboard' : location.pathname.split('/').pop()?.replace('-', ' ')}
                            </h2>
                        )}

                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="text-dark-400 hover:text-white ml-2 transition-colors p-2 rounded-lg hover:bg-dark-800"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">

                        <UserMenu
                            user={user}
                            isAdmin={isAdmin}
                            variant="admin"
                            onExitAdmin={() => navigate('/')}
                        />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {location.pathname === '/admin' ? (
                        <DashboardOverview stats={stats} />
                    ) : (
                        <Outlet />
                    )}
                </main>
            </div>
        </div>
    );
};

// ─── Dashboard Overview ──────────────────────────────────

function DashboardOverview({ stats }) {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold gradient-text">Dashboard Overview</h1>
                <p className="text-dark-400 mt-2">Welcome back to the NeuralSign admin panel</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Words" value={stats.totalWords} icon={BookOpen} color="text-primary" bgColor="bg-primary/10" />
                <StatCard title="Published" value={stats.publishedWords} icon={CheckCircle} color="text-success" bgColor="bg-success/10" />
                <StatCard title="Categories" value={stats.totalCategories} icon={FolderOpen} color="text-secondary" bgColor="bg-secondary/10" />
                <StatCard title="Users" value={stats.totalUsers} icon={Users} color="text-accent" bgColor="bg-accent/10" />
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-8 border-dark-700/50">
                <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        to="/admin/words/new"
                        className="flex items-center gap-4 p-5 bg-dark-700/30 rounded-xl hover:bg-dark-700/50 border border-dark-600/30 hover:border-primary/50 transition-all duration-300 group"
                    >
                        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <FileText className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Add Word</p>
                            <p className="text-dark-400 text-xs mt-0.5">Create a new sign</p>
                        </div>
                    </Link>
                    <Link
                        to="/admin/upload"
                        className="flex items-center gap-4 p-5 bg-dark-700/30 rounded-xl hover:bg-dark-700/50 border border-dark-600/30 hover:border-secondary/50 transition-all duration-300 group"
                    >
                        <div className="p-3 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                            <Upload className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Upload Videos</p>
                            <p className="text-dark-400 text-xs mt-0.5">Bulk video upload</p>
                        </div>
                    </Link>
                    <Link
                        to="/admin/analytics"
                        className="flex items-center gap-4 p-5 bg-dark-700/30 rounded-xl hover:bg-dark-700/50 border border-dark-600/30 hover:border-accent/50 transition-all duration-300 group"
                    >
                        <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                            <TrendingUp className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Analytics</p>
                            <p className="text-dark-400 text-xs mt-0.5">Usage statistics</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bgColor }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-dark-700/50 hover:border-primary/30 transition-all duration-300 group"
        >
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-white tabular-nums mb-1">{value}</p>
            <p className="text-dark-400 text-sm font-medium">{title}</p>
        </motion.div>
    );
}

export default AdminDashboard;
