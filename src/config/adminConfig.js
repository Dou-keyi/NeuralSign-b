/**
 * Admin Configuration
 * Defines admin roles, permissions, and access control
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

// Admin role hierarchy
export const ADMIN_ROLES = {
    SUPER_ADMIN: 'super_admin',
    CONTENT_ADMIN: 'content_admin',
    MODERATOR: 'moderator',
    VIEWER: 'viewer'
};

// Permission sets for each role
export const ROLE_PERMISSIONS = {
    super_admin: {
        createWords: true,
        editWords: true,
        deleteWords: true,
        publishWords: true,
        createCategories: true,
        editCategories: true,
        deleteCategories: true,
        uploadVideos: true,
        deleteVideos: true,
        manageStorage: true,
        viewUsers: true,
        editUsers: true,
        deleteUsers: true,
        manageAdmins: true,
        viewAnalytics: true,
        exportData: true,
        systemSettings: true,
        manageDatabase: true
    },

    content_admin: {
        createWords: true,
        editWords: true,
        deleteWords: false,
        publishWords: true,
        createCategories: true,
        editCategories: true,
        deleteCategories: false,
        uploadVideos: true,
        deleteVideos: false,
        manageStorage: false,
        viewUsers: true,
        editUsers: false,
        deleteUsers: false,
        manageAdmins: false,
        viewAnalytics: true,
        exportData: true,
        systemSettings: false,
        manageDatabase: false
    },

    moderator: {
        createWords: false,
        editWords: true,
        deleteWords: false,
        publishWords: false,
        createCategories: false,
        editCategories: false,
        deleteCategories: false,
        uploadVideos: false,
        deleteVideos: false,
        manageStorage: false,
        viewUsers: true,
        editUsers: true,
        deleteUsers: false,
        manageAdmins: false,
        viewAnalytics: true,
        exportData: false,
        systemSettings: false,
        manageDatabase: false
    },

    viewer: {
        createWords: false,
        editWords: false,
        deleteWords: false,
        publishWords: false,
        createCategories: false,
        editCategories: false,
        deleteCategories: false,
        uploadVideos: false,
        deleteVideos: false,
        manageStorage: false,
        viewUsers: true,
        editUsers: false,
        deleteUsers: false,
        manageAdmins: false,
        viewAnalytics: true,
        exportData: false,
        systemSettings: false,
        manageDatabase: false
    }
};

// Admin user emails (for initial setup)
// In production, manage via Firestore
export const ADMIN_EMAILS = [
    'admin@neuralsign.com',
];

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole, permission) {
    const permissions = ROLE_PERMISSIONS[userRole];
    return permissions ? permissions[permission] === true : false;
}

/**
 * Check if user is admin
 */
export function isAdmin(user) {
    if (!user) return false;

    // Check if email is in admin list
    if (ADMIN_EMAILS.includes(user.email)) return true;

    // Check custom claims (set via Firebase Admin SDK)
    return user.customClaims?.admin === true;
}

/**
 * Get user role
 */
export function getUserRole(user) {
    if (!user) return null;

    // Check custom claims first
    if (user.customClaims?.role) {
        return user.customClaims.role;
    }

    return null;
}
