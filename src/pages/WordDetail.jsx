/**
 * WordDetail Page
 * Detailed view of a single word sign with learning resources
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, Target, Lightbulb, AlertTriangle,
    Check, Play, Star, Hand, MessageSquare, Link2, ChevronRight
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import VideoPlayer from '@/components/video/VideoPlayer';

// Services
import wordsService from '@/services/wordsService';
import { addXP, XP_SOURCES } from '@/services/xpService';

// Store
import useAuthStore from '@/store/authStore';

const WordDetail = () => {
    const { wordId } = useParams();
    const navigate = useNavigate();
    const { user, userData } = useAuthStore();

    const [word, setWord] = useState(null);
    const [category, setCategory] = useState(null);
    const [relatedWords, setRelatedWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingLearned, setMarkingLearned] = useState(false);

    const wordsProgress = userData?.wordsProgress || {};
    const isLearned = wordsProgress?.learned?.includes(wordId);
    const wordAccuracy = wordsProgress?.accuracy?.[wordId];

    // Load word data
    useEffect(() => {
        const loadWord = async () => {
            setLoading(true);
            try {
                const [wordData, related] = await Promise.all([
                    wordsService.getWordById(wordId),
                    wordsService.getRelatedWords(wordId)
                ]);

                if (wordData) {
                    setWord(wordData);
                    const catData = await wordsService.getCategoryById(wordData.category);
                    setCategory(catData);
                }
                setRelatedWords(related);
            } catch (error) {
                console.error('Error loading word:', error);
            } finally {
                setLoading(false);
            }
        };

        if (wordId) loadWord();
    }, [wordId]);

    const handleMarkLearned = async () => {
        if (!user?.uid || isLearned || markingLearned) return;

        setMarkingLearned(true);
        try {
            const isNew = await wordsService.markWordAsLearned(user.uid, wordId);
            if (isNew) {
                await addXP(user.uid, XP_SOURCES.SIGN_LEARNED.amount, 'SIGN_LEARNED', `Learned word: ${word.englishText}`);
            }
        } catch (error) {
            console.error('Error marking word as learned:', error);
        } finally {
            setMarkingLearned(false);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner text="Loading word details..." />
                </div>
            </PageContainer>
        );
    }

    if (!word) {
        return (
            <PageContainer>
                <div className="text-center py-12">
                    <p className="text-dark-400 text-lg">Word not found</p>
                    <Button variant="glass" onClick={() => navigate('/learn/words')} className="mt-4">
                        Back to Words
                    </Button>
                </div>
            </PageContainer>
        );
    }

    const difficultyLabel = ['', 'Easy', 'Medium', 'Hard'][word.difficulty] || 'Unknown';

    return (
        <PageContainer>
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/learn/words')}
                className="flex items-center gap-2 text-dark-400 hover:text-primary transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Words</span>
            </motion.button>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column: Video + Actions */}
                <div>
                    {/* Video Player */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <VideoPlayer
                            videoUrl={word.videoUrl}
                            poster={word.thumbnailUrl}
                            loop={true}
                            autoplay={true}
                            className="mb-4"
                        />
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-3 mb-6"
                    >
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => navigate(`/practice/words/${wordId}`)}
                            rightIcon={<Play className="w-4 h-4" />}
                        >
                            Practice This Sign
                        </Button>

                        <Button
                            variant={isLearned ? 'glass' : 'secondary'}
                            onClick={handleMarkLearned}
                            disabled={isLearned || markingLearned}
                            rightIcon={isLearned ? <Check className="w-4 h-4" /> : null}
                        >
                            {isLearned ? 'Learned' : markingLearned ? 'Saving...' : 'Mark as Learned'}
                        </Button>
                    </motion.div>

                    {/* Accuracy Card */}
                    {wordAccuracy && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="glass-card p-4 mb-4"
                        >
                            <h4 className="text-sm font-medium text-dark-300 mb-2">Your Progress</h4>
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className="text-2xl font-bold text-primary">{wordAccuracy.avg}%</span>
                                    <span className="text-xs text-dark-400 ml-1">accuracy</span>
                                </div>
                                <div className="text-sm text-dark-400">
                                    Practiced {wordAccuracy.count} time{wordAccuracy.count !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column: Word Info */}
                <div>
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        {/* Category Badge */}
                        {category && (
                            <span
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-3"
                                style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                                {category.icon} {category.name}
                            </span>
                        )}

                        <h1 className="text-4xl font-bold text-dark-100 mb-2">{word.englishText}</h1>
                        <p className="text-lg text-dark-400">{word.aslGloss}</p>

                        {/* Difficulty & Tags */}
                        <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 3 }, (_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < word.difficulty
                                            ? 'text-warning fill-warning'
                                            : 'text-dark-600'
                                            }`}
                                    />
                                ))}
                                <span className="text-xs text-dark-400 ml-1">{difficultyLabel}</span>
                            </div>
                            {word.twoHanded && (
                                <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                                    Two-Handed
                                </span>
                            )}
                            {word.isStatic && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                    Static
                                </span>
                            )}
                        </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-card p-5 mb-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Hand className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-dark-100">How to Sign</h3>
                        </div>
                        <p className="text-dark-300 leading-relaxed">{word.description}</p>
                    </motion.div>

                    {/* Learning Tips */}
                    {word.learningTips?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-5 mb-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-5 h-5 text-warning" />
                                <h3 className="font-semibold text-dark-100">Learning Tips</h3>
                            </div>
                            <ul className="space-y-2">
                                {word.learningTips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-dark-300 text-sm">
                                        <span className="text-warning mt-0.5">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {/* Common Mistakes */}
                    {word.commonMistakes?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="glass-card p-5 mb-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5 text-error" />
                                <h3 className="font-semibold text-dark-100">Common Mistakes</h3>
                            </div>
                            <ul className="space-y-2">
                                {word.commonMistakes.map((mistake, i) => (
                                    <li key={i} className="flex items-start gap-2 text-dark-300 text-sm">
                                        <span className="text-error mt-0.5">✕</span>
                                        {mistake}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {/* Usage & Examples */}
                    {word.exampleSentences?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-5 mb-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <MessageSquare className="w-5 h-5 text-secondary" />
                                <h3 className="font-semibold text-dark-100">Usage Examples</h3>
                            </div>
                            <p className="text-sm text-dark-400 mb-3">{word.usage}</p>
                            <div className="space-y-2">
                                {word.exampleSentences.map((sentence, i) => (
                                    <div key={i} className="text-sm text-dark-300 bg-dark-700/30 px-3 py-2 rounded-lg">
                                        "{sentence}"
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Related Signs */}
                    {relatedWords.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="glass-card p-5"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Link2 className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold text-dark-100">Related Signs</h3>
                            </div>
                            <div className="space-y-2">
                                {relatedWords.map(related => (
                                    <button
                                        key={related.id}
                                        onClick={() => navigate(`/learn/words/${related.id}`)}
                                        className="w-full flex items-center gap-3 p-3 bg-dark-700/30
                                                 rounded-lg hover:bg-dark-700/50 transition-colors text-left"
                                    >
                                        <span className="text-xl">
                                            {related.category === 'greetings' ? '👋' :
                                                related.category === 'pronouns' ? '👤' :
                                                    related.category === 'nouns' ? '🏠' : '🏃'}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-dark-100">{related.englishText}</p>
                                            <p className="text-xs text-dark-400">{related.shortDescription}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-dark-500" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default WordDetail;
