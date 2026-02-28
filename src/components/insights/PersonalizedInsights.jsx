/**
 * Personalized Insights Component
 * AI/rule-based learning insights and recommendations
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Lightbulb,
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    Flame,
    Award,
    Calendar,
    AlertCircle,
    ChevronRight,
    Sparkles
} from 'lucide-react';

const PersonalizedInsights = ({
    userData = {},
    className = ''
}) => {
    // Generate insights based on user data
    const insights = useMemo(() => {
        const generatedInsights = [];

        const {
            signsLearned = 0,
            totalSigns = 26,
            streak = 0,
            averageAccuracy = 0,
            practiceHistory = [],
            lastPractice = null,
            weeklyPractice = 0,
            bestDay = null,
            weakSigns = [],
            level = 1,
            totalXP = 0
        } = userData;

        // Progress insight
        const progressPercent = Math.round((signsLearned / totalSigns) * 100);
        if (progressPercent >= 90) {
            generatedInsights.push({
                type: 'achievement',
                icon: Award,
                color: 'text-warning',
                bg: 'bg-warning/10',
                title: "You're almost there!",
                message: `Just ${totalSigns - signsLearned} more signs to master the entire alphabet!`,
                priority: 1
            });
        } else if (progressPercent >= 50) {
            generatedInsights.push({
                type: 'progress',
                icon: TrendingUp,
                color: 'text-success',
                bg: 'bg-success/10',
                title: 'Great progress!',
                message: `You've learned ${progressPercent}% of the alphabet. Keep it up!`,
                priority: 2
            });
        }

        // Streak insight
        if (streak >= 7) {
            generatedInsights.push({
                type: 'streak',
                icon: Flame,
                color: 'text-warning',
                bg: 'bg-warning/10',
                title: `${streak} day streak! 🔥`,
                message: streak >= 30
                    ? "You're on fire! Your dedication is inspiring."
                    : `Keep going! ${30 - streak} more days to the monthly milestone.`,
                priority: 1
            });
        } else if (streak > 0 && streak < 7) {
            generatedInsights.push({
                type: 'motivation',
                icon: Target,
                color: 'text-primary',
                bg: 'bg-primary/10',
                title: 'Building momentum',
                message: `${7 - streak} more days to reach a week streak!`,
                priority: 3
            });
        }

        // Accuracy insight
        if (averageAccuracy >= 90) {
            generatedInsights.push({
                type: 'accuracy',
                icon: Target,
                color: 'text-success',
                bg: 'bg-success/10',
                title: 'Excellent accuracy!',
                message: `Your ${averageAccuracy}% accuracy shows great mastery. Challenge yourself with faster practice!`,
                priority: 2
            });
        } else if (averageAccuracy < 70 && averageAccuracy > 0) {
            generatedInsights.push({
                type: 'improvement',
                icon: Lightbulb,
                color: 'text-secondary',
                bg: 'bg-secondary/10',
                title: 'Tip for improvement',
                message: 'Try slowing down and focusing on form. Accuracy improves with deliberate practice.',
                priority: 2
            });
        }

        // Weak signs insight
        if (weakSigns.length > 0) {
            generatedInsights.push({
                type: 'practice',
                icon: AlertCircle,
                color: 'text-accent',
                bg: 'bg-accent/10',
                title: 'Focus areas',
                message: `Signs that need more practice: ${weakSigns.slice(0, 3).join(', ')}`,
                action: 'Practice these signs',
                priority: 1
            });
        }

        // Best practice time insight
        if (bestDay) {
            generatedInsights.push({
                type: 'pattern',
                icon: Calendar,
                color: 'text-cyan-400',
                bg: 'bg-cyan-400/10',
                title: 'Your best day',
                message: `You perform best on ${bestDay}s. Consider scheduling more practice then!`,
                priority: 4
            });
        }

        // Practice frequency insight
        if (weeklyPractice >= 5) {
            generatedInsights.push({
                type: 'consistency',
                icon: Clock,
                color: 'text-green-400',
                bg: 'bg-green-400/10',
                title: 'Consistent learner',
                message: `You've practiced ${weeklyPractice} times this week. Consistency is key!`,
                priority: 3
            });
        }

        // Level milestone prediction
        if (level < 10) {
            const xpToLevel10 = 1000 - totalXP; // Simplified calculation
            if (xpToLevel10 > 0) {
                generatedInsights.push({
                    type: 'milestone',
                    icon: Sparkles,
                    color: 'text-purple-400',
                    bg: 'bg-purple-400/10',
                    title: 'Milestone ahead',
                    message: `About ${Math.ceil(xpToLevel10 / 20)} more practice sessions to reach Level 10!`,
                    priority: 4
                });
            }
        }

        // Sort by priority
        return generatedInsights.sort((a, b) => a.priority - b.priority).slice(0, 4);
    }, [userData]);

    if (insights.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-6 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-secondary/10">
                    <Lightbulb className="w-5 h-5 text-secondary" />
                </div>
                <div>
                    <h3 className="font-semibold text-dark-100">Personal Insights</h3>
                    <p className="text-sm text-dark-400">Based on your learning patterns</p>
                </div>
            </div>

            {/* Insights Grid */}
            <div className="grid gap-3">
                {insights.map((insight, index) => {
                    const Icon = insight.icon;

                    return (
                        <motion.div
                            key={insight.type + index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                flex items-start gap-3 p-3 rounded-xl
                ${insight.bg} border border-dark-600/50
                transition-colors hover:border-dark-500
              `}
                        >
                            <div className={`flex-shrink-0 p-2 rounded-lg ${insight.bg}`}>
                                <Icon className={`w-4 h-4 ${insight.color}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-dark-100 text-sm">
                                    {insight.title}
                                </h4>
                                <p className="text-xs text-dark-400 mt-0.5">
                                    {insight.message}
                                </p>
                            </div>

                            {insight.action && (
                                <button className="flex-shrink-0 text-xs text-primary hover:text-primary-400 transition-colors flex items-center gap-1">
                                    {insight.action}
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default PersonalizedInsights;
