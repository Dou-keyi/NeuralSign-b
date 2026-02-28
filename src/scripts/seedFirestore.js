/**
 * Firestore Seeding Script
 * Seeds the Firestore database with word signs and categories
 * 
 * Usage: Import and call seedDatabase() from browser console or admin page
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { collection, doc, setDoc, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { seedWords, seedCategories } from '@/data/seedWords';

/**
 * Seed all word signs into Firestore
 * @param {boolean} force - Whether to overwrite existing data
 * @returns {Promise<Object>} Result with counts
 */
export async function seedWordSigns(force = false) {
    if (!db) {
        throw new Error('Firebase not initialized');
    }

    console.log('🌱 Starting word signs seeding...');
    const signsRef = collection(db, 'signs');

    // Check for existing data
    if (!force) {
        const existing = await getDocs(signsRef);
        if (!existing.empty) {
            console.log(`⚠️ Signs collection already has ${existing.size} documents. Use force=true to overwrite.`);
            return { skipped: true, existing: existing.size };
        }
    }

    // Use batched writes (max 500 per batch)
    const batch = writeBatch(db);
    let count = 0;

    for (const word of seedWords) {
        const docRef = doc(signsRef, word.id);
        batch.set(docRef, {
            ...word,
            videoUrl: '', // Placeholder - upload videos separately
            thumbnailUrl: '',
            videoLength: 0,
            status: 'active',
            source: 'official',
            contributor: 'NeuralSign Team',
            learnedCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        count++;
    }

    await batch.commit();
    console.log(`✅ Seeded ${count} word signs`);
    return { wordsSeeded: count };
}

/**
 * Seed all categories into Firestore
 * @param {boolean} force - Whether to overwrite existing data
 * @returns {Promise<Object>} Result with counts
 */
export async function seedWordCategories(force = false) {
    if (!db) {
        throw new Error('Firebase not initialized');
    }

    console.log('🌱 Starting categories seeding...');
    const categoriesRef = collection(db, 'categories');

    if (!force) {
        const existing = await getDocs(categoriesRef);
        if (!existing.empty) {
            console.log(`⚠️ Categories collection already has ${existing.size} documents. Use force=true to overwrite.`);
            return { skipped: true, existing: existing.size };
        }
    }

    const batch = writeBatch(db);
    let count = 0;

    for (const category of seedCategories) {
        const docRef = doc(categoriesRef, category.id);
        batch.set(docRef, {
            ...category,
            totalLearners: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        count++;
    }

    await batch.commit();
    console.log(`✅ Seeded ${count} categories`);
    return { categoriesSeeded: count };
}

/**
 * Seed everything (words + categories)
 * @param {boolean} force - Whether to overwrite existing data
 * @returns {Promise<Object>} Combined results
 */
export async function seedDatabase(force = false) {
    console.log('🌱 Starting full database seeding...');
    console.log(`📦 Words to seed: ${seedWords.length}`);
    console.log(`📂 Categories to seed: ${seedCategories.length}`);

    try {
        const wordsResult = await seedWordSigns(force);
        const categoriesResult = await seedWordCategories(force);

        const result = { ...wordsResult, ...categoriesResult };
        console.log('✅ Database seeding complete:', result);
        return result;
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

export default seedDatabase;
