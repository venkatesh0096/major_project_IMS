import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AttendanceContext = createContext();

export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Fetch Classes (Departments)
    const fetchClasses = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setClasses(data.map(d => d.name) || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    // Fetch Subjects (Static list or from DB)
    const fetchSubjects = async () => {
        const defaultSubjects = [
            'Mathematics', 'Physics', 'Computer Science',
            'Software Engineering', 'Database Systems', 'Networks'
        ];
        setSubjects(defaultSubjects);
    };

    // Fetch Attendance Records
    const fetchAttendance = async (filters = {}) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setAttendanceRecords(data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    // Aggregate Stats for Admin
    const getStats = () => {
        const total = attendanceRecords.length;
        const present = attendanceRecords.filter(r => r.status === 'Present').length;
        const absent = attendanceRecords.filter(r => r.status === 'Absent').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        return { total, present, absent, percentage };
    };

    // Mark Attendance (Bulk)
    const markAttendance = async (records, date, subject, className) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ records, date, subject, class: className })
            });

            if (response.ok) {
                await fetchAttendance({ date });
                if (user?.role === 'student') await fetchStats(user.id);
                return { success: true };
            }
            return { success: false, message: 'Failed to mark attendance' };
        } catch (error) {
            console.error('Error marking attendance:', error);
            return { success: false, message: error.message };
        }
    };

    // Fetch Stats for Students
    const fetchStats = async (studentId) => {
        const id = studentId || user?.id;
        if (!id || id === 'undefined' || id === 'null') return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/stats/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Fetch Monthly Summary
    const getMonthlySummary = async (month, year, studentId) => {
        const id = studentId || user?.id;
        if (!id || id === 'undefined' || id === 'null' || !month || !year) return [];

        try {
            const queryParams = new URLSearchParams({
                month: month.toString(),
                year: year.toString(),
                studentId: id
            }).toString();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/summary?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching summary:', error);
            return [];
        }
    };

    // Correct Attendance Record (Admin/HOD)
    const correctAttendance = async (id, status) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                setAttendanceRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            console.error('Error correcting attendance:', error);
            return { success: false };
        }
    };

    useEffect(() => {
        if (token) {
            fetchAttendance();
            fetchClasses();
            fetchSubjects();
            if (user?.role === 'student') {
                fetchStats(user.id);
            }
        }
    }, [token, user]);

    return (
        <AttendanceContext.Provider value={{
            attendanceRecords,
            stats,
            loading,
            classes,
            subjects,
            getStats,
            markAttendance,
            fetchAttendance,
            fetchStats,
            getMonthlySummary,
            correctAttendance
        }}>
            {children}
        </AttendanceContext.Provider>
    );
};
