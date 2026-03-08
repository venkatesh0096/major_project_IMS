import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NoticeContext = createContext();

export const useNotices = () => useContext(NoticeContext);

export const NoticeProvider = ({ children }) => {
    const { token } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotices = async (audience = '') => {
        try {
            const url = audience
                ? `${import.meta.env.VITE_API_URL}/api/notices?audience=${audience}`
                : `${import.meta.env.VITE_API_URL}/api/notices`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setNotices(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notices:', error);
            setLoading(false);
        }
    };

    const addNotice = async (noticeData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(noticeData)
            });

            if (response.ok) {
                const newNotice = await response.json();
                setNotices([newNotice, ...notices]);
                return { success: true };
            } else {
                return { success: false, message: 'Failed to create notice' };
            }
        } catch (error) {
            console.error('Error adding notice:', error);
            return { success: false, message: error.message };
        }
    };

    const deleteNotice = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notices/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotices(notices.filter(n => n.id !== id));
                return { success: true };
            }
        } catch (error) {
            console.error('Error deleting notice:', error);
        }
    };

    const getStats = () => {
        return {
            total: notices.length,
            unread: notices.filter(n => n.views === 0).length,
            pinned: notices.filter(n => n.pinned).length,
            pending: notices.filter(n => n.status === 'Pending Approval').length
        };
    };

    const togglePin = async (id) => {
        const notice = notices.find(n => n.id === id);
        if (notice) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notices/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ pinned: !notice.pinned })
                });
                if (response.ok) {
                    const updatedNotice = await response.json();
                    setNotices(notices.map(n => n.id === id ? updatedNotice : n));
                }
            } catch (error) {
                console.error('Error toggling pin:', error);
            }
        }
    };

    const approveNotice = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notices/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Published' })
            });
            if (response.ok) {
                const updatedNotice = await response.json();
                setNotices(notices.map(n => n.id === id ? updatedNotice : n));
            }
        } catch (error) {
            console.error('Error approving notice:', error);
        }
    };

    const archiveNotice = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notices/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Archived' })
            });
            if (response.ok) {
                const updatedNotice = await response.json();
                setNotices(notices.map(n => n.id === id ? updatedNotice : n));
            }
        } catch (error) {
            console.error('Error archiving notice:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotices();
        }
    }, [token]);

    return (
        <NoticeContext.Provider value={{
            notices,
            loading,
            fetchNotices,
            addNotice,
            deleteNotice,
            getStats,       // Exposed
            togglePin,      // Exposed
            approveNotice,  // Exposed
            archiveNotice,  // Exposed
            categories: ['General', 'Exam', 'Event', 'Holiday', 'Urgent'] // Exposed
        }}>
            {children}
        </NoticeContext.Provider>
    );
};
