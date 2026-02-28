/**
 * Word Editor
 * Create/edit word signs with comprehensive form
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Save, X, ArrowLeft } from 'lucide-react';
import VideoUploader from '@/components/admin/VideoUploader';
import { useAdmin } from '@/context/AdminContext';

const WordEditor = () => {
    const { wordId } = useParams();
    const navigate = useNavigate();
    const { can } = useAdmin();
    const isEditing = !!wordId;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        id: '',
        englishText: '',
        aslGloss: '',
        type: 'word',
        category: '',
        difficulty: 1,
        isStatic: false,
        videoUrl: '',
        thumbnailUrl: '',
        videoLength: 3,
        handedness: 'right',
        twoHanded: false,
        dominantHandShape: '',
        nonDominantHandShape: '',
        location: '',
        movement: '',
        movementSpeed: 'moderate',
        movementRange: 'medium',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: '',
        shortDescription: '',
        commonMistakes: [''],
        learningTips: [''],
        usage: '',
        exampleSentences: [''],
        relatedSigns: [],
        tags: [],
        status: 'draft',
        popularity: 50
    });

    useEffect(() => {
        loadCategories();
        if (isEditing) loadWord();
    }, [wordId]);

    const loadCategories = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'categories'));
            const cats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setCategories(cats);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadWord = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, 'signs', wordId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    commonMistakes: data.commonMistakes?.length ? data.commonMistakes : [''],
                    learningTips: data.learningTips?.length ? data.learningTips : [''],
                    exampleSentences: data.exampleSentences?.length ? data.exampleSentences : [''],
                    tags: data.tags || [],
                    relatedSigns: data.relatedSigns || []
                }));
            } else {
                alert('Word not found');
                navigate('/admin/words');
            }
        } catch (error) {
            console.error('Error loading word:', error);
            alert('Failed to load word');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.englishText || !formData.category) {
            alert('Please fill in required fields (English Word and Category)');
            return;
        }

        if (!can(isEditing ? 'editWords' : 'createWords')) {
            alert('You do not have permission to perform this action');
            return;
        }

        try {
            setSaving(true);

            const wordData = {
                ...formData,
                commonMistakes: formData.commonMistakes.filter(m => m.trim()),
                learningTips: formData.learningTips.filter(t => t.trim()),
                exampleSentences: formData.exampleSentences.filter(s => s.trim()),
                id: formData.id || formData.englishText.toLowerCase().replace(/\s+/g, '-'),
                aslGloss: formData.aslGloss || formData.englishText.toUpperCase(),
                updatedAt: new Date(),
                ...(isEditing ? {} : {
                    createdAt: new Date(),
                    learnedCount: 0,
                    averageAccuracy: 0
                })
            };

            const docId = isEditing ? wordId : wordData.id;

            if (isEditing) {
                await updateDoc(doc(db, 'signs', docId), wordData);
            } else {
                await setDoc(doc(db, 'signs', docId), wordData);
            }

            alert(`Word ${isEditing ? 'updated' : 'created'} successfully!`);
            navigate('/admin/words');
        } catch (error) {
            console.error('Error saving word:', error);
            alert('Failed to save word: ' + error.message);
        } finally {
            setSaving(false);
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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {isEditing ? 'Edit Word' : 'Add New Word'}
                    </h1>
                    <p className="text-dark-400 text-sm mt-1">
                        {isEditing ? `Editing: ${formData.englishText}` : 'Create a new ASL word sign'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/words')}
                    className="flex items-center gap-2 px-4 py-2 text-dark-400 hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Information */}
                <Section title="Basic Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="English Word *">
                            <input
                                type="text"
                                value={formData.englishText}
                                onChange={(e) => handleChange('englishText', e.target.value)}
                                className="input-field"
                                placeholder="e.g., Please"
                                required
                            />
                        </Field>

                        <Field label="ASL Gloss">
                            <input
                                type="text"
                                value={formData.aslGloss}
                                onChange={(e) => handleChange('aslGloss', e.target.value)}
                                className="input-field"
                                placeholder="Auto-generated if empty"
                            />
                        </Field>

                        <Field label="Category *">
                            <select
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="input-field"
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Difficulty (1-5)">
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.difficulty}
                                onChange={(e) => handleChange('difficulty', parseInt(e.target.value))}
                                className="input-field"
                            />
                        </Field>

                        <Field label="Status">
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="input-field"
                            >
                                <option value="draft">Draft</option>
                                <option value="review">Under Review</option>
                                <option value="published">Published</option>
                            </select>
                        </Field>

                        <div className="flex items-center gap-3 pt-7">
                            <input
                                type="checkbox"
                                id="isStatic"
                                checked={formData.isStatic}
                                onChange={(e) => handleChange('isStatic', e.target.checked)}
                                className="w-4 h-4 rounded bg-dark-900 border-dark-600 text-primary focus:ring-primary/50"
                            />
                            <label htmlFor="isStatic" className="text-dark-300 text-sm">
                                Static sign (no motion required)
                            </label>
                        </div>
                    </div>
                </Section>

                {/* Video & Media */}
                <Section title="Video & Media">
                    {formData.videoUrl && (
                        <div className="mb-4 p-3 bg-dark-700/50 rounded-lg">
                            <p className="text-dark-400 text-xs mb-2">Current Video</p>
                            <video
                                src={formData.videoUrl}
                                controls
                                className="w-full max-w-md rounded-lg"
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <p className="text-dark-300 text-sm font-medium mb-2">
                            {formData.videoUrl ? 'Replace Video' : 'Upload Video'}
                        </p>
                        <VideoUploader
                            signId={formData.id || formData.englishText?.toLowerCase().replace(/\s+/g, '-') || 'temp'}
                            signName={formData.englishText}
                            onUploadComplete={(result) => {
                                handleChange('videoUrl', result.videoUrl);
                                if (result.thumbnailUrl) handleChange('thumbnailUrl', result.thumbnailUrl);
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Video URL (or upload above)">
                            <input
                                type="url"
                                value={formData.videoUrl}
                                onChange={(e) => handleChange('videoUrl', e.target.value)}
                                className="input-field"
                                placeholder="https://..."
                            />
                        </Field>
                        <Field label="Thumbnail URL">
                            <input
                                type="url"
                                value={formData.thumbnailUrl}
                                onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                                className="input-field"
                                placeholder="https://..."
                            />
                        </Field>
                    </div>
                </Section>

                {/* Hand Configuration */}
                <Section title="Hand Configuration">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Handedness">
                            <select value={formData.handedness} onChange={(e) => handleChange('handedness', e.target.value)} className="input-field">
                                <option value="right">Right Hand</option>
                                <option value="left">Left Hand</option>
                                <option value="both">Both Hands</option>
                                <option value="either">Either Hand</option>
                            </select>
                        </Field>

                        <div className="flex items-center gap-3 pt-7">
                            <input
                                type="checkbox"
                                id="twoHanded"
                                checked={formData.twoHanded}
                                onChange={(e) => handleChange('twoHanded', e.target.checked)}
                                className="w-4 h-4 rounded bg-dark-900 border-dark-600 text-primary focus:ring-primary/50"
                            />
                            <label htmlFor="twoHanded" className="text-dark-300 text-sm">
                                Two-handed sign
                            </label>
                        </div>

                        <Field label="Dominant Hand Shape">
                            <input
                                type="text"
                                value={formData.dominantHandShape}
                                onChange={(e) => handleChange('dominantHandShape', e.target.value)}
                                className="input-field"
                                placeholder="e.g., flat-hand, fist, open-palm"
                            />
                        </Field>

                        {formData.twoHanded && (
                            <Field label="Non-Dominant Hand Shape">
                                <input
                                    type="text"
                                    value={formData.nonDominantHandShape}
                                    onChange={(e) => handleChange('nonDominantHandShape', e.target.value)}
                                    className="input-field"
                                    placeholder="e.g., flat-hand, fist"
                                />
                            </Field>
                        )}
                    </div>
                </Section>

                {/* Position & Motion */}
                <Section title="Position & Motion">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Location">
                            <select value={formData.location} onChange={(e) => handleChange('location', e.target.value)} className="input-field">
                                <option value="">Select location</option>
                                <option value="face">Face</option>
                                <option value="chin">Chin</option>
                                <option value="chest">Chest</option>
                                <option value="waist">Waist</option>
                                <option value="neutral-space">Neutral Space</option>
                                <option value="head">Head</option>
                                <option value="shoulder">Shoulder</option>
                            </select>
                        </Field>

                        <Field label="Movement">
                            <select value={formData.movement} onChange={(e) => handleChange('movement', e.target.value)} className="input-field">
                                <option value="">Select movement</option>
                                <option value="static">Static (no motion)</option>
                                <option value="forward">Forward</option>
                                <option value="backward">Backward</option>
                                <option value="upward">Upward</option>
                                <option value="downward">Downward</option>
                                <option value="circular">Circular</option>
                                <option value="side-to-side">Side to Side</option>
                                <option value="up-and-down">Up and Down</option>
                                <option value="arc">Arc</option>
                                <option value="tap">Tap</option>
                                <option value="wave">Wave</option>
                            </select>
                        </Field>

                        <Field label="Movement Speed">
                            <select value={formData.movementSpeed} onChange={(e) => handleChange('movementSpeed', e.target.value)} className="input-field">
                                <option value="slow">Slow</option>
                                <option value="moderate">Moderate</option>
                                <option value="fast">Fast</option>
                            </select>
                        </Field>

                        <Field label="Movement Range">
                            <select value={formData.movementRange} onChange={(e) => handleChange('movementRange', e.target.value)} className="input-field">
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </Field>
                    </div>
                </Section>

                {/* Descriptions */}
                <Section title="Descriptions & Instructions">
                    <div className="space-y-4">
                        <Field label="Full Description">
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows="4"
                                className="input-field"
                                placeholder="Detailed step-by-step instructions..."
                            />
                        </Field>

                        <Field label="Short Description">
                            <input
                                type="text"
                                value={formData.shortDescription}
                                onChange={(e) => handleChange('shortDescription', e.target.value)}
                                className="input-field"
                                placeholder="Brief one-line description"
                            />
                        </Field>

                        <Field label="Usage Context">
                            <textarea
                                value={formData.usage}
                                onChange={(e) => handleChange('usage', e.target.value)}
                                rows="2"
                                className="input-field"
                                placeholder="When and how this sign is typically used..."
                            />
                        </Field>
                    </div>
                </Section>

                {/* Dynamic Array Fields */}
                <ArraySection
                    title="Common Mistakes"
                    items={formData.commonMistakes}
                    field="commonMistakes"
                    placeholder="Describe a common mistake..."
                    onAdd={addArrayItem}
                    onRemove={removeArrayItem}
                    onChange={handleArrayChange}
                />

                <ArraySection
                    title="Learning Tips"
                    items={formData.learningTips}
                    field="learningTips"
                    placeholder="Helpful tip for learning..."
                    onAdd={addArrayItem}
                    onRemove={removeArrayItem}
                    onChange={handleArrayChange}
                />

                <ArraySection
                    title="Example Sentences"
                    items={formData.exampleSentences}
                    field="exampleSentences"
                    placeholder="Example sentence..."
                    onAdd={addArrayItem}
                    onRemove={removeArrayItem}
                    onChange={handleArrayChange}
                />

                {/* Tags */}
                <Section title="Tags">
                    <Field label="Tags (comma-separated)">
                        <input
                            type="text"
                            value={formData.tags.join(', ')}
                            onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                            className="input-field"
                            placeholder="e.g., basic, polite, essential"
                        />
                    </Field>
                    <p className="text-dark-500 text-xs mt-1">Separate multiple tags with commas</p>
                </Section>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/words')}
                        className="px-6 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : isEditing ? 'Update Word' : 'Create Word'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ─── Helper Components ───────────────────────────────────

function Section({ title, children }) {
    return (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            {children}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-dark-300 text-sm font-medium mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function ArraySection({ title, items, field, placeholder, onAdd, onRemove, onChange }) {
    return (
        <Section title={title}>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => onChange(field, index, e.target.value)}
                            className="input-field flex-1"
                            placeholder={placeholder}
                        />
                        {items.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onRemove(field, index)}
                                className="px-3 py-2 bg-error/10 text-error hover:bg-error/20 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={() => onAdd(field)}
                className="mt-3 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded-lg text-sm transition-colors"
            >
                + Add Item
            </button>
        </Section>
    );
}

export default WordEditor;
