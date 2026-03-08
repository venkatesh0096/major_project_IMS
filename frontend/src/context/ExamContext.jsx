import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
    const { token } = useAuth();
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all examinations
    const fetchExams = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exams`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setExams(data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch personal results for student
    const fetchMyResults = async (examId = '') => {
        if (!token) return;
        setLoading(true);
        try {
            const url = examId
                ? `${import.meta.env.VITE_API_URL}/api/exams/my-results?examId=${examId}`
                : `${import.meta.env.VITE_API_URL}/api/exams`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    // Bulk Submit Marks (Teacher)
    const submitMarks = async (examId, subjectId, marksData) => {
        if (!token) return { success: false };
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ examId, subjectId, marksData })
            });

            if (response.ok) {
                return { success: true };
            }
            const errorData = await response.json();
            return { success: false, message: errorData.message };
        } catch (error) {
            console.error('Error submitting marks:', error);
            return { success: false };
        }
    };

    // Create New Exam (Admin)
    const createExam = async (examData) => {
        if (!token) return { success: false };
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(examData)
            });

            if (response.ok) {
                fetchExams(); // Refresh list
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            console.error('Error creating exam:', error);
            return { success: false };
        }
    };

    useEffect(() => {
        if (token) {
            fetchExams();
        }
    }, [token]);

    return (
        <ExamContext.Provider value={{
            exams,
            results,
            loading,
            fetchExams,
            fetchMyResults,
            submitMarks,
            createExam
        }}>
            {children}
        </ExamContext.Provider>
    );
};

export const useExam = () => useContext(ExamContext);
