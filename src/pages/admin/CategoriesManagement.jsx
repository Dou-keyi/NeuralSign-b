/**
 * Categories Management
 * CRUD interface for managing word categories
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    FolderOpen,
    GripVertical,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAdmin } from '@/context/AdminContext';

const CategoriesManagement = () => {
    const { can } = useAdmin();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        icon: '📚',
        description: '',
        color: '#6366F1'
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const snapshot = await getDocs(collection(db, 'categories'));
            const data = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                order: d.data().order || 0
            }));
            data.sort((a, b) => a.order - b.order);
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', icon: '📚', description: '', color: '#6366F1' });
        setEditingId(null);
        setShowNewForm(false);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            alert('Category name is required');
            return;
        }

        try {
            if (editingId) {
                await updateDoc(doc(db, 'categories', editingId), {
                    ...formData,
                    updatedAt: new Date()
                });
            } else {
                const id = formData.name.toLowerCase().replace(/\s+/g, '-');
                await setDoc(doc(db, 'categories', id), {
                    ...formData,
                    order: categories.length,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            resetForm();
            loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            icon: category.icon,
            description: category.description || '',
            color: category.color || '#6366F1'
        });
        setEditingId(category.id);
        setShowNewForm(true);
    };

    const handleDelete = async (id) => {
        if (!can('deleteCategories')) {
            alert('You do not have permission to delete categories');
            return;
        }

        if (!confirm('Delete this category? This cannot be undone.')) return;

        try {
            await deleteDoc(doc(db, 'categories', id));
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    const handleReorder = async (index, direction) => {
        const newCategories = [...categories];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newCategories.length) return;

        [newCategories[index], newCategories[swapIndex]] = [newCategories[swapIndex], newCategories[index]];

        setCategories(newCategories);

        try {
            for (let i = 0; i < newCategories.length; i++) {
                await updateDoc(doc(db, 'categories', newCategories[i].id), { order: i });
            }
        } catch (error) {
            console.error('Error reordering:', error);
            loadCategories();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const EMOJI_OPTIONS = ['📚', '👋', '🔢', '🎨', '🏠', '🍎', '👨‍👩‍👧', '💬', '😀', '🌤️', '🏥', '✈️', '🎓', '💼', '🎮', '🐾'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Categories</h1>
                    <p className="text-dark-400 text-sm mt-1">{categories.length} categories total</p>
                </div>
                {can('createCategories') && (
                    <button
                        onClick={() => { resetForm(); setShowNewForm(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                )}
            </div>

            {/* New/Edit Form */}
            <AnimatePresence>
                {showNewForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-dark-800 border border-dark-700 rounded-xl p-6 overflow-hidden"
                    >
                        <h3 className="text-white font-semibold mb-4">
                            {editingId ? 'Edit Category' : 'New Category'}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-dark-300 text-sm font-medium mb-1.5">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    placeholder="Category name"
                                />
                            </div>

                            <div>
                                <label className="block text-dark-300 text-sm font-medium mb-1.5">Icon</label>
                                <div className="flex gap-1 flex-wrap">
                                    {EMOJI_OPTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, icon: emoji }))}
                                            className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${formData.icon === emoji
                                                    ? 'bg-primary/20 ring-2 ring-primary'
                                                    : 'bg-dark-700 hover:bg-dark-600'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-dark-300 text-sm font-medium mb-1.5">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    placeholder="Brief description"
                                />
                            </div>

                            <div>
                                <label className="block text-dark-300 text-sm font-medium mb-1.5">Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                        className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={formData.color}
                                        onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                        className="flex-1 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={resetForm} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium text-sm transition-colors">
                                <Save className="w-4 h-4" />
                                {editingId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Categories List */}
            {categories.length === 0 ? (
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
                    <FolderOpen className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-1">No categories yet</h3>
                    <p className="text-dark-500 text-sm">Create your first category to organize words</p>
                </div>
            ) : (
                <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden divide-y divide-dark-700">
                    {categories.map((category, index) => (
                        <div
                            key={category.id}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-dark-700/50 transition-colors"
                        >
                            {/* Reorder */}
                            <div className="flex flex-col gap-0.5">
                                <button
                                    onClick={() => handleReorder(index, 'up')}
                                    disabled={index === 0}
                                    className="text-dark-500 hover:text-white disabled:opacity-20 transition-colors"
                                >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleReorder(index, 'down')}
                                    disabled={index === categories.length - 1}
                                    className="text-dark-500 hover:text-white disabled:opacity-20 transition-colors"
                                >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Color indicator */}
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category.color || '#6366F1' }}
                            />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{category.icon}</span>
                                    <span className="text-white font-medium text-sm">{category.name}</span>
                                    <span className="text-dark-500 text-xs">#{category.id}</span>
                                </div>
                                {category.description && (
                                    <p className="text-dark-500 text-xs mt-0.5 truncate">{category.description}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                {can('editCategories') && (
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 text-dark-400 hover:text-green-400 hover:bg-green-400/10 rounded transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                )}
                                {can('deleteCategories') && (
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoriesManagement;
