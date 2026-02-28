/**
 * Users Management
 * View and manage user accounts
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    UserCheck,
    UserX,
    Award,
    Calendar,
    TrendingUp,
    Activity
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0 });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const snapshot = await getDocs(collection(db, 'users'));
            const usersData = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            setUsers(usersData);
            setFilteredUsers(usersData);

            // Calculate stats
            const now = new Date();
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            const activeCount = usersData.filter(u => {
                const lastActive = u.lastActive?.toDate?.() || u.lastActive;
                return lastActive && new Date(lastActive) > weekAgo;
            }).length;

            setStats({ total: usersData.length, active: activeCount });
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        if (!searchTerm) {
            setFilteredUsers(users);
            return;
        }

        const search = searchTerm.toLowerCase();
        setFilteredUsers(users.filter(u =>
            u.displayName?.toLowerCase().includes(search) ||
            u.email?.toLowerCase().includes(search) ||
            u.id?.toLowerCase().includes(search)
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Users</h1>
                <p className="text-dark-400 text-sm mt-1">Manage and monitor user accounts</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                            <p className="text-dark-400 text-sm">Total Users</p>
                        </div>
                    </div>
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.active}</p>
                            <p className="text-dark-400 text-sm">Active This Week</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                    type="text"
                    placeholder="Search users by name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
            </div>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
                    <Users className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-1">No users found</h3>
                    <p className="text-dark-500 text-sm">
                        {searchTerm ? 'Try different search terms' : 'No registered users yet'}
                    </p>
                </div>
            ) : (
                <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-700">
                                    <th className="text-left text-dark-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">User</th>
                                    <th className="text-left text-dark-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Progress</th>
                                    <th className="text-left text-dark-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Activity</th>
                                    <th className="text-left text-dark-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700">
                                {filteredUsers.map(user => (
                                    <UserRow key={user.id} user={user} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

function UserRow({ user }) {
    const getActivityStatus = () => {
        const lastActive = user.lastActive?.toDate?.() || user.lastActive;
        if (!lastActive) return { label: 'Unknown', color: 'text-dark-500' };

        const now = new Date();
        const diff = now - new Date(lastActive);
        const hours = diff / (1000 * 60 * 60);

        if (hours < 1) return { label: 'Online', color: 'text-success' };
        if (hours < 24) return { label: 'Today', color: 'text-primary' };
        if (hours < 168) return { label: 'This Week', color: 'text-warning' };
        return { label: 'Inactive', color: 'text-dark-500' };
    };

    const activity = getActivityStatus();

    return (
        <tr className="hover:bg-dark-700/50 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                            <span className="text-white text-sm font-bold">
                                {(user.displayName || user.email || '?')[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-white text-sm font-medium">{user.displayName || 'Anonymous'}</p>
                        <p className="text-dark-500 text-xs truncate max-w-[200px]">{user.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="text-xs space-y-0.5">
                    <p className="text-dark-300">
                        <Award className="w-3 h-3 inline mr-1 text-primary" />
                        {user.wordsLearned || user.progress?.wordsLearned || 0} words
                    </p>
                    <p className="text-dark-400">
                        <TrendingUp className="w-3 h-3 inline mr-1 text-success" />
                        {user.accuracy || user.progress?.accuracy || 0}% accuracy
                    </p>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`text-xs font-medium ${activity.color}`}>
                    {activity.label}
                </span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-dark-500" />
                    <span className="text-dark-400 text-xs">
                        {user.createdAt?.toDate?.()
                            ? user.createdAt.toDate().toLocaleDateString()
                            : user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : 'N/A'
                        }
                    </span>
                </div>
            </td>
        </tr>
    );
}

export default UsersManagement;
