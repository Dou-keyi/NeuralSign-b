/**
 * Admin Context
 * Provides admin authentication state and permission checking
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import useAuthStore from '@/store/authStore';
import { isAdmin as checkIsAdmin, hasPermission, ROLE_PERMISSIONS } from '@/config/adminConfig';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
    const { user } = useAuthStore();
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [adminRole, setAdminRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState({});

    useEffect(() => {
        checkAdminStatus();
    }, [user]);

    const checkAdminStatus = async () => {
        if (!user) {
            setIsAdminUser(false);
            setAdminRole(null);
            setPermissions({});
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Check if user is admin
            const adminStatus = checkIsAdmin(user);
            setIsAdminUser(adminStatus);

            if (!adminStatus) {
                setAdminRole(null);
                setPermissions({});
                setLoading(false);
                return;
            }

            // Get admin role from Firestore
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));

            if (adminDoc.exists()) {
                const role = adminDoc.data().role;
                setAdminRole(role);

                // Load permissions for role
                const rolePermissions = {};
                const permissionKeys = Object.keys(ROLE_PERMISSIONS.super_admin || {});

                permissionKeys.forEach(key => {
                    rolePermissions[key] = hasPermission(role, key);
                });

                setPermissions(rolePermissions);
            } else {
                // Default to viewer role if admin doc doesn't exist
                setAdminRole('viewer');
                const rolePermissions = {};
                const permissionKeys = Object.keys(ROLE_PERMISSIONS.viewer || {});
                permissionKeys.forEach(key => {
                    rolePermissions[key] = hasPermission('viewer', key);
                });
                setPermissions(rolePermissions);
            }

        } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdminUser(false);
            setAdminRole(null);
            setPermissions({});
        } finally {
            setLoading(false);
        }
    };

    const can = (permission) => {
        return permissions[permission] === true;
    };

    return (
        <AdminContext.Provider value={{
            isAdmin: isAdminUser,
            adminRole,
            loading,
            permissions,
            can
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
};

export default AdminContext;
