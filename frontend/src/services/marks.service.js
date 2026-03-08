const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/exams`;

export const marksService = {
    // Fetch all necessary options for filters
    async getFilters(token) {
        try {
            // Parallel fetch for better performance
            const [deptsRes, examsRes, subjectsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/departments`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/exams`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/subjects`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const [departments, exams, subjects] = await Promise.all([
                deptsRes.json(),
                examsRes.json(),
                subjectsRes.json()
            ]);

            return {
                academicSessions: [...new Set(exams.map(e => e.academicYear) || ['2024-2025'])],
                departments: departments.map(d => d.name),
                examTypes: exams.map(e => ({ id: e.id, name: e.name, academicYear: e.academicYear })),
                subjects: subjects.map(s => ({ id: s.id, name: s.name, code: s.code, department: s.department })),
                studentYears: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
                semesters: ['1', '2', '3', '4', '5', '6', '7', '8'],
                sections: ['A', 'B', 'C', 'D']
            };
        } catch (error) {
            console.error('Error fetching filters:', error);
            throw error;
        }
    },

    // Fetch marks or students list for a class
    async getStudentMarks(filters, token) {
        try {
            const { examId, subjectId, department, studentYear, section, semester } = filters;

            // 1. Fetch existing marks for this combo
            const queryParams = new URLSearchParams({
                examId,
                subjectId,
                department,
                year: studentYear,
                section,
                semester
            }).toString();

            const marksRes = await fetch(`${API_BASE_URL}/exams/marks?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const existingMarks = await marksRes.json();

            // 2. Fetch the full student roster for this selection
            const rosterRes = await fetch(`${API_BASE_URL}/users/students?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const roster = await rosterRes.json();

            // 3. Merge roster with existing marks
            return roster.map(student => {
                const markRecord = existingMarks.find(m => m.studentId === student.id);
                const internal = markRecord ? markRecord.obtainedMarks : 0;

                return {
                    id: student.id,
                    studentId: student.studentId, // Profile ID
                    enrollmentNo: student.enrollmentNo,
                    name: student.name,
                    avatar: student.avatar,
                    internalMarks: internal,
                    externalMarks: 0,
                    maxInternal: 20,
                    maxExternal: 80,
                    total: internal,
                    grade: markRecord ? markRecord.grade : 'F',
                    status: internal >= 40 ? 'Pass' : 'Fail',
                    remarks: markRecord ? markRecord.remarks : ''
                };
            });
        } catch (error) {
            console.error('Error fetching student marks:', error);
            throw error;
        }
    },

    async saveMarks(examId, subjectId, students, token) {
        try {
            const marksData = students.map(s => ({
                studentId: s.id,
                obtained: s.internalMarks + s.externalMarks,
                maxMarks: s.maxInternal + s.maxExternal,
                remarks: s.remarks
            }));

            const response = await fetch(`${API_BASE_URL}/exams/marks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ examId, subjectId, marksData })
            });

            if (!response.ok) throw new Error('Failed to save marks');
            return await response.json();
        } catch (error) {
            console.error('Error saving marks:', error);
            throw error;
        }
    },

    async publishMarks(examId, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/exams/${examId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Published' })
            });

            if (!response.ok) throw new Error('Failed to publish marks');
            return await response.json();
        } catch (error) {
            console.error('Error publishing marks:', error);
            throw error;
        }
    }
};
