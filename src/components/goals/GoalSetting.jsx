/**
 * Goal Setting Component
 * Personal goal tracker with progress visualization
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Plus,
    X,
    Check,
    Calendar,
    TrendingUp,
    Award,
    Clock,
    ChevronRight,
    Trash2,
    Edit2
} from 'lucide-react';
import Button from '@/components/common/Button';

// Preset goal templates
const GOAL_TEMPLATES = [
    {
        id: 'learn_alphabet',
        title: 'Master the Alphabet',
        type: 'learning',
        target: 26,
        unit: 'signs',
        icon: '🔤',
        description: 'Learn all 26 letters of the ASL alphabet'
    },
    {
        id: 'daily_practice',
        title: 'Daily Practice',
        type: 'streak',
        target: 7,
        unit: 'days',
        icon: '🔥',
        description: 'Practice every day for a week'
    },
    {
        id: 'accuracy_goal',
        title: 'Accuracy Master',
        type: 'accuracy',
        target: 90,
        unit: '%',
        icon: '🎯',
        description: 'Achieve 90% accuracy in practice sessions'
    },
    {
        id: 'xp_milestone',
        title: 'XP Milestone',
        type: 'xp',
        target: 500,
        unit: 'XP',
        icon: '⭐',
        description: 'Earn 500 XP this week'
    },
    {
        id: 'session_goal',
        title: 'Consistent Learner',
        type: 'sessions',
        target: 20,
        unit: 'sessions',
        icon: '📚',
        description: 'Complete 20 practice sessions'
    }
];

const GoalSetting = ({
    activeGoals = [],
    userData = {},
    onCreateGoal,
    onDeleteGoal,
    onCompleteGoal,
    className = ''
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [customGoal, setCustomGoal] = useState({
        title: '',
        target: 10,
        type: 'learning',
        deadline: ''
    });

    // Calculate progress for each goal
    const goalsWithProgress = useMemo(() => {
        return activeGoals.map(goal => {
            let current = 0;

            switch (goal.type) {
                case 'learning':
                    current = userData.signsLearned || 0;
                    break;
                case 'streak':
                    current = userData.streak || 0;
                    break;
                case 'accuracy':
                    current = userData.averageAccuracy || 0;
                    break;
                case 'xp':
                    current = userData.weeklyXP || userData.totalXP || 0;
                    break;
                case 'sessions':
                    current = userData.sessionsCount || 0;
                    break;
                default:
                    current = goal.current || 0;
            }

            const progress = Math.min(Math.round((current / goal.target) * 100), 100);
            const isComplete = current >= goal.target;

            return { ...goal, current, progress, isComplete };
        });
    }, [activeGoals, userData]);

    const handleCreateGoal = () => {
        const goalData = selectedTemplate
            ? {
                ...selectedTemplate,
                id: `goal_${Date.now()}`,
                createdAt: new Date().toISOString(),
                deadline: customGoal.deadline || null
            }
            : {
                ...customGoal,
                id: `goal_${Date.now()}`,
                icon: '🎯',
                createdAt: new Date().toISOString()
            };

        if (onCreateGoal) {
            onCreateGoal(goalData);
        }

        setIsModalOpen(false);
        setSelectedTemplate(null);
        setCustomGoal({ title: '', target: 10, type: 'learning', deadline: '' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-6 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-dark-100">My Goals</h3>
                        <p className="text-sm text-dark-400">
                            {goalsWithProgress.filter(g => g.isComplete).length}/{goalsWithProgress.length} completed
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                >
                    Add Goal
                </Button>
            </div>

            {/* Goals List */}
            {goalsWithProgress.length === 0 ? (
                <div className="text-center py-8">
                    <Target className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-500 mb-3">No active goals yet</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Set Your First Goal
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {goalsWithProgress.map((goal, index) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                p-4 rounded-xl border transition-all
                ${goal.isComplete
                                    ? 'bg-success/10 border-success/30'
                                    : 'bg-dark-700/30 border-dark-600'
                                }
              `}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className="text-2xl">{goal.icon}</div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`font-medium ${goal.isComplete ? 'text-success' : 'text-dark-100'}`}>
                                            {goal.title}
                                        </h4>
                                        {goal.isComplete && (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-success/20 text-success rounded-full">
                                                Complete!
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress */}
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-dark-400">
                                                {goal.current} / {goal.target} {goal.unit}
                                            </span>
                                            <span className={goal.isComplete ? 'text-success' : 'text-dark-400'}>
                                                {goal.progress}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${goal.progress}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                className={`h-full rounded-full ${goal.isComplete
                                                        ? 'bg-success'
                                                        : 'bg-gradient-to-r from-primary to-secondary'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    {goal.deadline && !goal.isComplete && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-dark-500">
                                            <Calendar className="w-3 h-3" />
                                            Due: {new Date(goal.deadline).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    {goal.isComplete ? (
                                        <div className="p-2 rounded-full bg-success/20">
                                            <Check className="w-4 h-4 text-success" />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onDeleteGoal?.(goal.id)}
                                            className="p-2 text-dark-500 hover:text-red-400 transition-colors"
                                            title="Remove goal"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Goal Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-dark-700">
                                <h3 className="text-lg font-semibold text-dark-100">Set a New Goal</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-dark-500 hover:text-dark-300 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4 max-h-[60vh] overflow-y-auto">
                                <p className="text-sm text-dark-400 mb-4">Choose a goal template or create your own:</p>

                                {/* Templates */}
                                <div className="space-y-2 mb-4">
                                    {GOAL_TEMPLATES.map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => setSelectedTemplate(
                                                selectedTemplate?.id === template.id ? null : template
                                            )}
                                            className={`
                        w-full p-3 rounded-xl text-left transition-all
                        border flex items-center gap-3
                        ${selectedTemplate?.id === template.id
                                                    ? 'bg-primary/10 border-primary'
                                                    : 'bg-dark-700/50 border-dark-600 hover:border-dark-500'
                                                }
                      `}
                                        >
                                            <span className="text-2xl">{template.icon}</span>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-dark-100">{template.title}</h4>
                                                <p className="text-xs text-dark-500">{template.description}</p>
                                            </div>
                                            {selectedTemplate?.id === template.id && (
                                                <Check className="w-5 h-5 text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Optional Deadline */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Deadline (optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={customGoal.deadline}
                                        onChange={e => setCustomGoal({ ...customGoal, deadline: e.target.value })}
                                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex gap-3 p-4 border-t border-dark-700">
                                <Button
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    disabled={!selectedTemplate}
                                    onClick={handleCreateGoal}
                                >
                                    Set Goal
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GoalSetting;
