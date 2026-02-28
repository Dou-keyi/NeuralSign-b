/**
 * Streak Calendar Component
 * GitHub-style contribution calendar for practice history
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame } from 'lucide-react';

const StreakCalendar = ({
    practiceHistory = {},
    currentStreak = 0,
    days = 90,
    className = ''
}) => {
    // Generate calendar data
    const calendarData = useMemo(() => {
        const data = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];

            data.push({
                date: dateKey,
                dayOfWeek: date.getDay(),
                isToday: i === 0,
                practiced: !!practiceHistory[dateKey],
                sessions: practiceHistory[dateKey]?.sessions || 0,
                accuracy: practiceHistory[dateKey]?.averageAccuracy || 0
            });
        }

        return data;
    }, [practiceHistory, days]);

    // Get intensity level based on sessions
    const getIntensityLevel = (sessions, accuracy) => {
        if (sessions === 0) return 0;
        if (sessions >= 5 && accuracy >= 90) return 4;
        if (sessions >= 3 && accuracy >= 80) return 3;
        if (sessions >= 2) return 2;
        return 1;
    };

    // Get color class based on intensity
    const getColorClass = (level, isToday) => {
        const colors = {
            0: 'bg-dark-700/50',
            1: 'bg-success/30',
            2: 'bg-success/50',
            3: 'bg-success/70',
            4: 'bg-success'
        };

        const todayBorder = isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-dark-800' : '';

        return `${colors[level]} ${todayBorder}`;
    };

    // Group data by weeks
    const weeks = useMemo(() => {
        const result = [];
        let currentWeek = [];

        calendarData.forEach((day, index) => {
            currentWeek.push(day);

            // Start new week on Sunday or if it's the last day
            if (day.dayOfWeek === 6 || index === calendarData.length - 1) {
                result.push([...currentWeek]);
                currentWeek = [];
            }
        });

        return result;
    }, [calendarData]);

    // Get month labels
    const monthLabels = useMemo(() => {
        const months = [];
        let lastMonth = -1;

        calendarData.forEach((day, index) => {
            const date = new Date(day.date);
            const month = date.getMonth();

            if (month !== lastMonth) {
                months.push({
                    month: date.toLocaleDateString('en-US', { month: 'short' }),
                    index: Math.floor(index / 7)
                });
                lastMonth = month;
            }
        });

        return months;
    }, [calendarData]);

    // Calculate stats
    const stats = useMemo(() => {
        let totalDays = 0;
        let totalSessions = 0;

        Object.values(practiceHistory).forEach(day => {
            if (day.sessions > 0) {
                totalDays++;
                totalSessions += day.sessions;
            }
        });

        return { totalDays, totalSessions };
    }, [practiceHistory]);

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-4 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-dark-100">Practice Activity</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-dark-400">
                    <span>{stats.totalDays} days practiced</span>
                    <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-warning" />
                        <span>{currentStreak} day streak</span>
                    </div>
                </div>
            </div>

            {/* Month Labels */}
            <div className="flex mb-1 ml-7">
                {monthLabels.map((m, i) => (
                    <span
                        key={i}
                        className="text-xs text-dark-500"
                        style={{ marginLeft: i === 0 ? 0 : `${(m.index - (monthLabels[i - 1]?.index || 0)) * 12 - 24}px` }}
                    >
                        {m.month}
                    </span>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex gap-1">
                {/* Day Labels */}
                <div className="flex flex-col gap-1 mr-1">
                    {dayLabels.map((day, i) => (
                        <div key={i} className="w-4 h-3 flex items-center justify-center">
                            {i % 2 !== 0 && (
                                <span className="text-[10px] text-dark-500">{day}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Weeks */}
                <div className="flex gap-1 overflow-x-auto pb-2">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {/* Pad first week if it doesn't start on Sunday */}
                            {weekIndex === 0 && week[0]?.dayOfWeek > 0 && (
                                Array.from({ length: week[0].dayOfWeek }).map((_, i) => (
                                    <div key={`pad-${i}`} className="w-3 h-3" />
                                ))
                            )}

                            {week.map((day, dayIndex) => {
                                const level = getIntensityLevel(day.sessions, day.accuracy);

                                return (
                                    <motion.div
                                        key={day.date}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                                        className={`
                      w-3 h-3 rounded-sm cursor-default
                      ${getColorClass(level, day.isToday)}
                      transition-all hover:ring-2 hover:ring-primary/50
                    `}
                                        title={`${new Date(day.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}${day.practiced
                                            ? `\n${day.sessions} session${day.sessions !== 1 ? 's' : ''}\n${day.accuracy}% accuracy`
                                            : '\nNo practice'
                                            }`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-700">
                <span className="text-xs text-dark-500">Less</span>
                <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map(level => (
                        <div
                            key={level}
                            className={`w-3 h-3 rounded-sm ${getColorClass(level, false)}`}
                            title={['No practice', '1 session', '2 sessions', '3+ sessions', '5+ sessions'][level]}
                        />
                    ))}
                </div>
                <span className="text-xs text-dark-500">More</span>
            </div>
        </motion.div>
    );
};

export default StreakCalendar;
