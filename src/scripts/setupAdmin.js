/**
 * Setup Admin Script
 * Run once to set up the first super admin user in Firestore
 * 
 * Usage: Update the ADMIN_UID below, then run this module
 * or call setupSuperAdmin(uid) from the browser console.
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';

/**
 * Create a super admin document in Firestore
 * 
 * @param {string} uid - Firebase Auth UID of the user to make admin
 * @param {string} email - Email address of the admin
 */
export async function setupSuperAdmin(uid, email = '') {
    if (!uid) {
        console.error('❌ Please provide a valid Firebase Auth UID');
        return;
    }

    try {
        await setDoc(doc(db, 'admins', uid), {
            role: 'super_admin',
            email: email,
            grantedBy: 'system',
            grantedAt: serverTimestamp(),
            active: true
        });

        console.log('✅ Super admin created successfully!');
        console.log(`   UID: ${uid}`);
        console.log(`   Email: ${email}`);
        console.log(`   Role: super_admin`);
        console.log('\n📋 Next steps:');
        console.log('   1. Add your email to ADMIN_EMAILS in src/config/adminConfig.js');
        console.log('   2. Navigate to /admin to access the admin panel');

        return true;
    } catch (error) {
        console.error('❌ Failed to create admin:', error);
        return false;
    }
}

/**
 * Grant an admin role to a user
 * 
 * @param {string} uid - Firebase Auth UID 
 * @param {string} role - Admin role (super_admin, content_admin, moderator, viewer)
 * @param {string} grantedByUid - UID of the admin granting the role
 */
export async function grantAdminRole(uid, role, grantedByUid = 'system') {
    const validRoles = ['super_admin', 'content_admin', 'moderator', 'viewer'];

    if (!validRoles.includes(role)) {
        console.error(`❌ Invalid role "${role}". Valid roles: ${validRoles.join(', ')}`);
        return false;
    }

    try {
        await setDoc(doc(db, 'admins', uid), {
            role,
            grantedBy: grantedByUid,
            grantedAt: serverTimestamp(),
            active: true
        }, { merge: true });

        console.log(`✅ Role "${role}" granted to UID: ${uid}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to grant role:', error);
        return false;
    }
}

// Make available globally for browser console usage
if (typeof window !== 'undefined') {
    window.setupSuperAdmin = setupSuperAdmin;
    window.grantAdminRole = grantAdminRole;
}
