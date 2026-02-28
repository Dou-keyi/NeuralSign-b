/**
 * Words Management
 * List all words with search, filter, and CRUD actions
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAdmin } from '@/context/AdminContext';

const WordsManagement = () => {
    const { can } = useAdmin();
    const [words, setWords] = useState([]);
    const [filteredWords, setFilteredWords] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadWords();
        loadCategories();
    }, []);

    useEffect(() => {
        filterWords();
    }, [searchTerm, statusFilter, categoryFilter, words]);

    const loadWords = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'signs'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const wordsData = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            setWords(wordsData);
            setFilteredWords(wordsData);
        } catch (error) {
            console.error('Error loading words:', error);
            // Try without ordering if index doesn't exist
            try {
                const snapshot = await getDocs(collection(db, 'signs'));
                const wordsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setWords(wordsData);
                setFilteredWords(wordsData);
            } catch (err) {
                console.error('Error loading words (fallback):', err);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'categories'));
            const categoriesData = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const filterWords = () => {
        let filtered = [...words];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(word =>
                word.englishText?.toLowerCase().includes(search) ||
                word.aslGloss?.toLowerCase().includes(search) ||
                word.id?.toLowerCase().includes(search)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(word => word.status === statusFilter);
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(word => word.category === categoryFilter);
        }

        setFilteredWords(filtered);
    };

    const handleDelete = async (wordId) => {
        if (!can('deleteWords')) {
            alert('You do not have permission to delete words');
            return;
        }

        if (!confirm('Are you sure you want to delete this word? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'signs', wordId));
            setWords(words.filter(w => w.id !== wordId));
            alert('Word deleted successfully');
        } catch (error) {
            console.error('Error deleting word:', error);
            alert('Failed to delete word');
        }
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Words Management</h1>
                    <p className="text-dark-400 text-sm mt-1">Manage ASL word signs and content</p>
                </div>

                {can('createWords') && (
                    <Link
                        to="/admin/words/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Word
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                        <input
                            type="text"
                            placeholder="Search words..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="review">Under Review</option>
                    </select>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <p className="text-dark-500 text-xs">
                    Showing {filteredWords.length} of {words.length} words
                </p>
            </div>

            {/* Words Table */}
            {filteredWords.length === 0 ? (
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
                    <FileText className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-1">No words found</h3>
                    <p className="text-dark-500 text-sm mb-4">
                        {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by adding your first word'}
                    </p>
                    {can('createWords') && (
                        <Link
                            to="/admin/words/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add First Word
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-700">
                                    <th className="text-left text-dark-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Word</th>
                                    <th className="text-left text-dark-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Category</th>
                                    <th className="text-left text-dark-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Difficulty</th>
                                    <th className="text-left text-dark-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Status</th>
                                    <th className="text-left text-dark-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Stats</th>
                                    <th className="text-right text-dark-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700">
                                {filteredWords.map(word => (
                                    <WordRow
                                        key={word.id}
                                        word={word}
                                        onDelete={handleDelete}
                                        canEdit={can('editWords')}
                                        canDelete={can('deleteWords')}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Word Row ────────────────────────────────────────────

function WordRow({ word, onDelete, canEdit, canDelete }) {
    const getStatusBadge = (status) => {
        const styles = {
            published: 'bg-success/10 text-success border border-success/20',
            draft: 'bg-dark-600/50 text-dark-300 border border-dark-600',
            review: 'bg-warning/10 text-warning border border-warning/20'
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
                {status || 'draft'}
            </span>
        );
    };

    const getDifficultyStars = (difficulty) => {
        return '⭐'.repeat(Math.min(difficulty || 1, 5));
    };

    return (
        <tr className="hover:bg-dark-700/50 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    {word.thumbnailUrl && (
                        <img
                            src={word.thumbnailUrl}
                            alt={word.englishText}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                    )}
                    <div>
                        <p className="text-white text-sm font-medium">{word.englishText}</p>
                        <p className="text-dark-500 text-xs">{word.aslGloss}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-dark-300 text-sm capitalize">
                    {word.category?.replace('-', ' ') || '—'}
                </span>
            </td>
            <td className="px-4 py-3">
                <span className="text-xs">{getDifficultyStars(word.difficulty)}</span>
            </td>
            <td className="px-4 py-3">
                {getStatusBadge(word.status)}
            </td>
            <td className="px-4 py-3">
                <div className="text-xs text-dark-400 space-y-0.5">
                    <p>Learned: {word.learnedCount || 0}</p>
                    <p>Accuracy: {word.averageAccuracy || 0}%</p>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                    <Link
                        to={`/learn/words/${word.id}`}
                        className="p-2 text-dark-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                        title="Preview"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>

                    {canEdit && (
                        <Link
                            to={`/admin/words/${word.id}/edit`}
                            className="p-2 text-dark-400 hover:text-green-400 hover:bg-green-400/10 rounded transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                    )}

                    {canDelete && (
                        <button
                            onClick={() => onDelete(word.id)}
                            className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

export default WordsManagement;
