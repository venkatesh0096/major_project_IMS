import React, { createContext, useContext, useState, useEffect } from 'react';

const TimetableContext = createContext();

export const useTimetable = () => useContext(TimetableContext);

export const TimetableProvider = ({ children }) => {
    const [schedule, setSchedule] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [filters, setFilters] = useState({
        departmentId: '',
        year: 3,
        semester: 6,
        section: 'A'
    });
    const [loading, setLoading] = useState(false);

    const rooms = ['LH-101', 'LH-102', 'LH-103', 'Lab-1', 'Lab-2', 'Lab-3', 'Seminar Hall'];
    const timeSlots = [
        '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 01:00',
        '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00'
    ];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Get auth token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Fetch departments on mount
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/timetable`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                setDepartments(data || []);
                if (data && data.length > 0 && !filters.departmentId) {
                    setFilters(prev => ({ ...prev, departmentId: data[0].id }));
                }
            })
            .catch(err => {
                console.error('Error fetching departments:', err);
                setDepartments([]);
            });
    }, []);

    // Fetch subjects
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/timetable`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => setSubjects(data || []))
            .catch(err => {
                console.error('Error fetching subjects:', err);
                setSubjects([]);
            });
    }, []);

    // Fetch teachers
    useEffect(() => {
        // Fetch from Teachers table (not Users) - includes user data
        fetch(`${import.meta.env.VITE_API_URL}/api/timetable`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                setTeachers(data || []);
            })
            .catch(err => {
                console.error('Error fetching teachers:', err);
                setTeachers([]);
            });
    }, []);

    // Fetch timetable when filters change
    useEffect(() => {
        if (filters.departmentId) {
            fetchSchedule();
        }
    }, [filters]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                departmentId: filters.departmentId,
                year: filters.year,
                semester: filters.semester,
                section: filters.section
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/timetable?${queryParams}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();

            // Transform API data to match expected format
            const transformedData = data.map(slot => ({
                id: slot.id,
                day: slot.day,
                time: `${slot.startTime} - ${slot.endTime}`,
                startTime: slot.startTime,
                endTime: slot.endTime,
                subject: slot.subject?.name || '',
                subjectId: slot.subjectId,
                teacher: slot.teacher?.user?.name || '',
                teacherId: slot.teacherId,
                room: slot.room,
                type: slot.type
            }));

            setSchedule(transformedData);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSlot = async (newSlot) => {
        try {
            // Extract times from time string if needed
            let startTime = newSlot.startTime;
            let endTime = newSlot.endTime;

            if (newSlot.time && newSlot.time.includes(' - ')) {
                [startTime, endTime] = newSlot.time.split(' - ');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/timetable`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ...filters,
                    year: parseInt(filters.year),
                    semester: parseInt(filters.semester),
                    day: newSlot.day,
                    startTime: startTime,
                    endTime: endTime,
                    subjectId: newSlot.subjectId || newSlot.subject,
                    teacherId: newSlot.teacherId || newSlot.teacher,
                    room: newSlot.room,
                    type: newSlot.type
                })
            });

            if (response.ok) {
                await fetchSchedule();
                return true;
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to add slot');
                return false;
            }
        } catch (error) {
            console.error('Error adding slot:', error);
            alert('Network error. Please try again.');
            return false;
        }
    };

    const updateSlot = async (id, updatedSlot) => {
        try {
            let startTime = updatedSlot.startTime;
            let endTime = updatedSlot.endTime;

            if (updatedSlot.time && updatedSlot.time.includes(' - ')) {
                [startTime, endTime] = updatedSlot.time.split(' - ');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/timetable/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    day: updatedSlot.day,
                    startTime: startTime,
                    endTime: endTime,
                    subjectId: updatedSlot.subjectId || updatedSlot.subject,
                    teacherId: updatedSlot.teacherId || updatedSlot.teacher,
                    room: updatedSlot.room,
                    type: updatedSlot.type
                })
            });

            if (response.ok) {
                await fetchSchedule();
                return true;
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to update slot');
                return false;
            }
        } catch (error) {
            console.error('Error updating slot:', error);
            alert('Network error. Please try again.');
            return false;
        }
    };

    const deleteSlot = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/timetable/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                await fetchSchedule();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting slot:', error);
            return false;
        }
    };

    const checkConflict = (newSlot) => {
        return schedule.some(slot =>
            slot.day === newSlot.day &&
            slot.time === newSlot.time &&
            (slot.room === newSlot.room || slot.teacher === newSlot.teacher) &&
            slot.id !== newSlot.id
        );
    };

    const getStats = () => {
        return {
            totalHours: schedule.length,
            conflicts: 0,
            freeRooms: rooms.length - new Set(schedule.map(s => s.room)).size
        };
    };

    return (
        <TimetableContext.Provider value={{
            schedule,
            rooms,
            teachers,
            subjects,
            departments,
            timeSlots,
            days,
            filters,
            setFilters,
            loading,
            addSlot,
            updateSlot,
            deleteSlot,
            checkConflict,
            getStats,
            fetchSchedule
        }}>
            {children}
        </TimetableContext.Provider>
    );
};
