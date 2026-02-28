/**
 * Analytics Dashboard
 * Visual analytics with charts and data exports
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Users,
    BookOpen,
    Download,
    Calendar,
    Award,
    Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAdmin } from '@/context/AdminContext';

const CHART_COLORS = [
    '#6366F1', '#8B5CF6', '#EC4899', '#10B981',
    '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6'
];

const Analytics = () => {
    const { can } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        userGrowth: [],
        wordsByCategory: [],
        difficultyDistribution: [],
        statusBreakdown: [],
        summaryStats: { totalUsers: 0, totalWords: 0, totalCategories: 0, avgAccuracy: 0 }
    });

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            // Load users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Load signs
            const signsSnapshot = await getDocs(collection(db, 'signs'));
            const signs = signsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Load categories
            const catsSnapshot = await getDocs(collection(db, 'categories'));
            const categories = catsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Process user growth (by month)
            const userGrowth = processUserGrowth(users);

            // Words by category
            const wordsByCategory = categories.map(cat => ({
                name: cat.name || cat.id,
                count: signs.filter(s => s.category === cat.id).length
            })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

            // Difficulty distribution
            const diffCounts = {};
            signs.forEach(s => {
                const d = s.difficulty || 1;
                diffCounts[d] = (diffCounts[d] || 0) + 1;
            });
            const difficultyDistribution = Object.entries(diffCounts).map(([level, count]) => ({
                name: `Level ${level}`,
                value: count
            }));

            // Status breakdown
            const statusCounts = {};
            signs.forEach(s => {
                const status = s.status || 'draft';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: count
            }));

            // Average accuracy
            const accuracies = users.filter(u => u.accuracy || u.progress?.accuracy).map(u => u.accuracy || u.progress?.accuracy || 0);
            const avgAccuracy = accuracies.length > 0
                ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
                : 0;

            setData({
                userGrowth,
                wordsByCategory,
                difficultyDistribution,
                statusBreakdown,
                summaryStats: {
                    totalUsers: users.length,
                    totalWords: signs.length,
                    totalCategories: categories.length,
                    avgAccuracy
                }
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const processUserGrowth = (users) => {
        const months = {};
        const now = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            months[key] = { name: label, users: 0 };
        }

        users.forEach(u => {
            const createdAt = u.createdAt?.toDate?.() || (u.createdAt ? new Date(u.createdAt) : null);
            if (createdAt) {
                const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
                if (months[key]) months[key].users++;
            }
        });

        return Object.values(months);
    };

    const handleExport = () => {
        const exportData = {
            exportedAt: new Date().toISOString(),
            summary: data.summaryStats,
            userGrowth: data.userGrowth,
            wordsByCategory: data.wordsByCategory,
            difficultyDistribution: data.difficultyDistribution,
            statusBreakdown: data.statusBreakdown
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neuralsign-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-dark-400 text-sm mt-1">Platform insights and statistics</p>
                </div>
                {can('exportData') && (
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    label="Total Users"
                    value={data.summaryStats.totalUsers}
                    icon={Users}
                    color="text-primary"
                    bgColor="bg-primary/10"
                />
                <SummaryCard
                    label="Total Words"
                    value={data.summaryStats.totalWords}
                    icon={BookOpen}
                    color="text-secondary"
                    bgColor="bg-secondary/10"
                />
                <SummaryCard
                    label="Categories"
                    value={data.summaryStats.totalCategories}
                    icon={BarChart3}
                    color="text-accent"
                    bgColor="bg-accent/10"
                />
                <SummaryCard
                    label="Avg Accuracy"
                    value={`${data.summaryStats.avgAccuracy}%`}
                    icon={Award}
                    color="text-success"
                    bgColor="bg-success/10"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth */}
                <ChartCard title="User Growth" subtitle="New registrations over time">
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={data.userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                            <YAxis stroke="#64748B" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E293B',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#6366F1"
                                fill="#6366F1"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Words by Category */}
                <ChartCard title="Words by Category" subtitle="Content distribution">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data.wordsByCategory} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis type="number" stroke="#64748B" fontSize={12} />
                            <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={12} width={80} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E293B',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {data.wordsByCategory.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Difficulty Distribution */}
                <ChartCard title="Difficulty Distribution" subtitle="Word difficulty levels">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={data.difficultyDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {data.difficultyDistribution.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E293B',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Status Breakdown */}
                <ChartCard title="Content Status" subtitle="Published vs draft">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={data.statusBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {data.statusBreakdown.map((entry, i) => {
                                    const statusColors = {
                                        Published: '#10B981',
                                        Draft: '#64748B',
                                        Review: '#F59E0B'
                                    };
                                    return <Cell key={i} fill={statusColors[entry.name] || CHART_COLORS[i]} />;
                                })}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E293B',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

function SummaryCard({ label, value, icon: Icon, color, bgColor }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800 border border-dark-700 rounded-xl p-4"
        >
            <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-dark-400 text-xs mt-0.5">{label}</p>
        </motion.div>
    );
}

function ChartCard({ title, subtitle, children }) {
    return (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-0.5">{title}</h3>
            <p className="text-dark-500 text-xs mb-4">{subtitle}</p>
            {children}
        </div>
    );
}

export default Analytics;
