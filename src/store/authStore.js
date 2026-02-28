/**
 * NeuralSign Auth Store
 * Zustand store for authentication state management
 * 
 * Integrates with Firebase Auth and Firestore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChange, signIn, signUp, signInWithGoogle, logOut, resetPassword, updateUserProfile as authUpdateProfile } from '@/services/auth';
import { auth, db } from '@/services/firebase'; // Ensure db is imported if used directly or remove if not
import {
    createUserProfile,
    getUserProfile
} from '@/services/database';
import { checkAndUnlockAchievements } from '@/services/achievementService';

/**
 * Auth Store
 * Manages user authentication state with Firebase integration
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,           // Firebase user object
            userData: null,       // Firestore user data
            isAuthenticated: false,
            isLoading: true,
            error: null,
            unsubscribe: null,    // Auth listener unsubscribe function

            // ============================================
            // INITIALIZATION
            // ============================================

            /**
             * Initialize auth state with Firebase onAuthStateChanged listener
             * Should be called once when app loads
             */
            initAuth: () => {
                console.log('🔐 Initializing auth listener...');

                // Unsubscribe from previous listener if exists
                const currentUnsubscribe = get().unsubscribe;
                if (currentUnsubscribe) {
                    currentUnsubscribe();
                }

                const unsubscribe = onAuthStateChange(async (firebaseUser) => {
                    console.log('🔔 Auth state changed:', firebaseUser ? firebaseUser.uid : 'null');

                    if (firebaseUser) {
                        // User is signed in
                        try {
                            // Fetch user data from Firestore
                            const userData = await getUserProfile(firebaseUser.uid);

                            // Check for missed achievements
                            const newAchievements = await checkAndUnlockAchievements(firebaseUser.uid, userData);

                            // Merge new achievements into local state if any were found
                            let initialUserData = userData;
                            if (newAchievements.length > 0) {
                                console.log('🏆 Retroactively unlocked achievements:', newAchievements.length);
                                const current = userData.achievements || [];
                                const newEntries = newAchievements.map(a => ({
                                    id: a.id,
                                    unlockedAt: new Date().toISOString()
                                }));
                                initialUserData = {
                                    ...userData,
                                    achievements: [...current, ...newEntries]
                                };
                            }

                            set({
                                user: {
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email,
                                    displayName: firebaseUser.displayName,
                                    photoURL: firebaseUser.photoURL,
                                    emailVerified: firebaseUser.emailVerified,
                                    metadata: firebaseUser.metadata,
                                },
                                userData: initialUserData,
                                isAuthenticated: true,
                                isLoading: false,
                                error: null,
                            });

                            console.log('✅ User authenticated and data loaded');
                        } catch (error) {
                            console.error('❌ Error fetching user data:', error);
                            set({
                                user: {
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email,
                                    displayName: firebaseUser.displayName,
                                    photoURL: firebaseUser.photoURL,
                                },
                                userData: null,
                                isAuthenticated: true,
                                isLoading: false,
                                error: 'Failed to load user data',
                            });
                        }
                    } else {
                        // User is signed out
                        set({
                            user: null,
                            userData: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                        });
                        console.log('👋 User signed out');
                    }
                });

                set({ unsubscribe });
                console.log('✅ Auth listener initialized');
            },

            // ============================================
            // STATE SETTERS
            // ============================================

            /**
             * Set the Firebase user
             */
            setUser: (user) => {
                set({
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                    error: null,
                });
            },

            /**
             * Set the Firestore user data
             */
            setUserData: (userData) => {
                set({ userData });
            },

            /**
             * Set loading state
             */
            setLoading: (isLoading) => {
                set({ isLoading });
            },

            /**
             * Set error state
             */
            setError: (error) => {
                set({ error });
            },

            /**
             * Clear error state
             */
            clearError: () => {
                set({ error: null });
            },

            // ============================================
            // AUTH ACTIONS
            // ============================================

            /**
             * Login user with email and password
             */
            login: async (email, password) => {
                set({ isLoading: true, error: null });

                try {
                    const userCredential = await signIn(email, password);
                    // Auth state will be updated by onAuthStateChanged listener
                    console.log('✅ Login successful');
                    return userCredential;
                } catch (error) {
                    set({
                        error: error.message,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            /**
             * Sign up new user
             */
            signup: async (email, password, displayName) => {
                set({ isLoading: true, error: null });

                try {
                    await signUp(email, password, displayName);
                    // Auth state will be updated by onAuthStateChanged listener
                    console.log('✅ Signup successful');
                } catch (error) {
                    set({
                        error: error.message,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            /**
             * Sign in with Google
             */
            loginWithGoogle: async () => {
                set({ isLoading: true, error: null });

                try {
                    const result = await signInWithGoogle();
                    // Auth state will be updated by onAuthStateChanged listener
                    console.log('✅ Google sign-in successful', result.isNewUser ? '(new user)' : '');
                    return result;
                } catch (error) {
                    set({
                        error: error.message,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            /**
             * Logout user
             */
            logout: async () => {
                set({ isLoading: true });

                try {
                    await logOut();
                    // Auth state will be updated by onAuthStateChanged listener
                    console.log('✅ Logout successful');
                } catch (error) {
                    set({
                        error: error.message,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            /**
             * Reset password
             */
            resetPassword: async (email) => {
                set({ isLoading: true, error: null });

                try {
                    await resetPassword(email);
                    set({ isLoading: false });
                    console.log('✅ Password reset email sent');
                } catch (error) {
                    set({
                        error: error.message,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            /**
             * Update user profile
             */
            updateProfile: async (updates) => {
                set({ isLoading: true, error: null });

                try {
                    await authUpdateProfile(updates);

                    // Update local state immediately
                    const currentUser = get().user;
                    const currentUserData = get().userData;

                    set({
                        user: { ...currentUser, ...updates },
                        userData: currentUserData ? { ...currentUserData, ...updates } : null,
                        isLoading: false,
                    });

                    console.log('✅ Profile updated');
                } catch (error) {
                    set({
                        error: error.message,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            /**
             * Refresh user data from Firestore
             */
            refreshUserData: async () => {
                const user = get().user;
                if (!user?.uid) return;

                try {
                    const userData = await getUserProfile(user.uid);
                    set({ userData });
                    console.log('✅ User data refreshed');
                } catch (error) {
                    console.error('❌ Error refreshing user data:', error);
                }
            },
        }),
        {
            name: 'neuralsign-auth',
            partialize: (state) => ({
                // Only persist essential user data (not the unsubscribe function)
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
