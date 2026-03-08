import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const { token, user } = useAuth();

    // States
    const [profile, setProfile] = useState({
        name: user?.name || 'Loading...',
        email: user?.email || '',
        phone: user?.phone || '',
        department: user?.department || '',
        avatar: user?.avatar || null
    });

    const [institution, setInstitution] = useState({
        name: 'NIT Nagpur',
        address: '',
        email: '',
        website: '',
        logo: null
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false,
        newsletter: true,
        securityAlerts: true
    });

    // Mock data for things not yet in DB
    const [roles] = useState([
        { id: 1, name: 'Super Admin', users: 2, permissions: ['all'] },
        { id: 2, name: 'Admin', users: 5, permissions: ['manage_users', 'manage_content'] },
        { id: 3, name: 'Staff', users: 145, permissions: ['view_reports', 'take_attendance'] },
        { id: 4, name: 'Student', users: 2543, permissions: ['view_own_data'] }
    ]);

    const [apiKeys, setApiKeys] = useState([
        { id: 1, name: 'Mobile App', key: 'pk_live_...', created: '2024-01-15', lastUsed: '2 mins ago' },
    ]);

    const [systemNotifications, setSystemNotifications] = useState([]);

    // Fetch Settings from Backend
    const fetchSettings = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();

                // Map DB keys back to state
                if (data.institution_name) {
                    setInstitution({
                        name: data.institution_name,
                        address: data.institution_address,
                        email: data.institution_email,
                        website: data.institution_website,
                        logo: data.institution_logo || null
                    });
                }

                if (data.notification_emailAlerts !== undefined) {
                    setNotifications({
                        emailAlerts: data.notification_emailAlerts,
                        smsAlerts: data.notification_smsAlerts,
                        newsletter: data.notification_newsletter,
                        securityAlerts: data.notification_securityAlerts
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [token]);

    // Update Profile (Persists to User table)
    const updateProfile = async (data) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    address: data.address
                })
            });

            if (response.ok) {
                const result = await response.json();
                setProfile(prev => ({ ...prev, ...data }));
                return { success: true, message: 'Profile updated successfully' };
            }
            return { success: false, message: 'Failed to update profile' };
        } catch (error) {
            console.error('Error updating profile:', error);
            return { success: false, message: error.message };
        }
    };

    // Update Password (Persists to User table)
    const updatePassword = async (currentPassword, newPassword) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (response.ok) {
                return { success: true, message: 'Password updated successfully' };
            }
            const errorData = await response.json();
            return { success: false, message: errorData.message || 'Failed to update password' };
        } catch (error) {
            console.error('Error updating password:', error);
            return { success: false, message: error.message };
        }
    };

    // Update Institution (Persists to DB)
    const updateInstitution = async (data) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    group: 'institution',
                    settings: {
                        institution_name: data.name,
                        institution_address: data.address,
                        institution_email: data.email,
                        institution_website: data.website
                    }
                })
            });

            if (response.ok) {
                setInstitution(data);
                return { success: true, message: 'Institution details updated' };
            }
            return { success: false, message: 'Failed to update settings' };
        } catch (error) {
            console.error('Error updating institution:', error);
            return { success: false, message: error.message };
        }
    };

    const toggleNotification = async (key) => {
        const newVal = !notifications[key];
        const updatedNotifications = { ...notifications, [key]: newVal };

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    group: 'notifications',
                    settings: {
                        [`notification_${key}`]: newVal
                    }
                })
            });
            setNotifications(updatedNotifications);
        } catch (error) {
            console.error('Error toggling notification:', error);
        }
    };

    // Theme Management
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'Light');

    useEffect(() => {
        const root = window.document.documentElement;
        const applyTheme = (selectedTheme) => {
            if (selectedTheme === 'Dark') root.classList.add('dark');
            else if (selectedTheme === 'Light') root.classList.remove('dark');
            else if (selectedTheme === 'System') {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
                else root.classList.remove('dark');
            }
            localStorage.setItem('theme', selectedTheme);
        };
        applyTheme(theme);
    }, [theme]);

    return (
        <SettingsContext.Provider value={{
            theme,
            setTheme,
            profile,
            institution,
            notifications,
            roles,
            apiKeys,
            systemNotifications,
            updateProfile,
            updatePassword,
            updateInstitution,
            toggleNotification,
            fetchSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
