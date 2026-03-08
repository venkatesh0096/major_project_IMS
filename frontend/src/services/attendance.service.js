const API_URL = `${import.meta.env.VITE_API_URL}/api/attendance`;

export const attendanceService = {
    // Fetch departments to populate classes list
    async getClasses() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/departments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const departments = await response.json();
            // Map departments to a "class" format for the UI
            return departments.map(d => ({
                id: d.id,
                name: d.name,
                code: d.code
            }));
        } catch (error) {
            console.error('Error fetching departments:', error);
            return [];
        }
    },

    // Fetch students from the real user management API
    async getStudents(classId, date, departmentName) {
        const token = localStorage.getItem('token');
        try {
            // Fetch students for the specific department
            const response = await fetch(`${API_URL}/users/students?department=${departmentName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const students = await response.json();

            // Also fetch existing attendance for this date/class to pre-populate statuses
            const attResponse = await fetch(`${API_URL}/attendance?date=${date}&class=${departmentName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const existingAttendance = await attResponse.json();

            return students.map(s => {
                const record = existingAttendance.find(r => r.studentId === s.id);
                return {
                    id: s.id,
                    studentId: s.id,
                    rollNo: s.enrollmentNo || 'N/A',
                    name: s.name,
                    avatar: s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.id}`,
                    status: record ? record.status.toLowerCase() : 'present',
                    note: '',
                };
            });
        } catch (error) {
            console.error('Error fetching students:', error);
            return [];
        }
    },

    // Bulk submit attendance (Upsert handled by backend)
    async submitAttendance(data) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    records: data.students.map(s => ({
                        studentId: s.id,
                        status: s.status.charAt(0).toUpperCase() + s.status.slice(1) // 'present' -> 'Present'
                    })),
                    date: data.date,
                    class: data.className,
                    subject: data.subject || 'General'
                })
            });

            if (!response.ok) throw new Error('Failed to submit');
            return await response.json();
        } catch (error) {
            console.error('Submit error:', error);
            throw error;
        }
    },

    // Mock save draft (can be added to DB later if needed)
    async saveDraft(data) {
        localStorage.setItem(`attendance_draft_${data.classId}_${data.date}`, JSON.stringify(data.students));
        return { success: true, message: 'Draft saved locally' };
    }
};
