/**
 * SuccessPopup Component
 * Displays a congratulatory message when the user successfully validates a sign
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Star } from 'lucide-react';
import Button from '../common/Button';

const SuccessPopup = ({ isOpen, onClose, letter, score }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-dark-800 border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full relative overflow-hidden shadow-2xl shadow-yellow-500/10"
                    >
                        {/* Decorative background effects */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400" />
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center relative z-10">
                            {/* Trophy Icon with animation */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30"
                            >
                                <Trophy className="w-12 h-12 text-yellow-900 drop-shadow-md" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Congratulations!
                                </h2>

                                <p className="text-dark-300 mb-6 text-lg">
                                    You've successfully mastered the letter <span className="text-yellow-400 font-bold text-xl mx-1">{letter}</span>!
                                </p>

                                {score !== undefined && (
                                    <div className="bg-dark-900/50 rounded-xl p-4 mb-8 border border-dark-700 backdrop-blur-sm">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <p className="text-sm font-medium text-dark-300 uppercase tracking-wider">Accuracy Score</p>
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <p className="text-4xl font-bold text-success drop-shadow-sm">{score}%</p>
                                    </div>
                                )}

                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={onClose}
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 border-none font-bold shadow-lg shadow-yellow-500/20"
                                >
                                    Continue Learning
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SuccessPopup;
