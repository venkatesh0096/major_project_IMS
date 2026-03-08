import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Filter, Search, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { useUsers } from '../../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

const Academics = () => {
    const navigate = useNavigate();
    const { users } = useUsers();
    const [activeTab, setActiveTab] = useState('students'); // 'students' or 'subjects'

    // Student Filter States
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedSem, setSelectedSem] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Subject States
    const [subjects, setSubjects] = useState([]);
    const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
    const [newSubject, setNewSubject] = useState({
        name: '', code: '', department: 'Computer Science', semester: '1', credits: 4
    });

    // Fetch Subjects
    useEffect(() => {
        if (activeTab === 'subjects') {
            fetchSubjects();
        }
    }, [activeTab]);

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subjects`);
            const data = await response.json();
            setSubjects(data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subjects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubject)
            });
            if (response.ok) {
                setIsAddSubjectOpen(false);
                fetchSubjects();
                setNewSubject({ name: '', code: '', department: 'Computer Science', semester: '1', credits: 4 });
            }
        } catch (error) {
            console.error('Error adding subject:', error);
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/subjects/${id}`, { method: 'DELETE' });
            fetchSubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
        }
    };

    // Filter Logic
    const students = users.filter(user => user.role === 'Student');
    const filteredStudents = students.filter(student => {
        const matchesDept = selectedDept === 'All' || student.department === selectedDept;
        const matchesYear = selectedYear === 'All' || student.year === selectedYear;
        const matchesSem = selectedSem === 'All' || student.semester === selectedSem;
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDept && matchesYear && matchesSem && matchesSearch;
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="text-green-600" />
                        Academics Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage students, subjects, and curriculum</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'students' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Students
                    </button>
                    <button
                        onClick={() => setActiveTab('subjects')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'subjects' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Subjects Repository
                    </button>
                </div>

                {activeTab === 'subjects' && (
                    <button
                        onClick={() => setIsAddSubjectOpen(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus size={18} /> Add Subject
                    </button>
                )}
            </div>

            {/* CONTENT AREA */}
            <AnimatePresence mode="wait">
                {activeTab === 'students' ? (
                    <motion.div
                        key="students"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Existing Student Filters & Table... */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                                <div className="flex items-center gap-2 text-gray-500 min-w-fit"><Filter size={20} /><span className="font-medium">Filters:</span></div>
                                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
                                    <option value="All">All Departments</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Information Tech">Information Tech</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                </select>
                                <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
                                    <option value="All">All Semesters</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                </select>
                            </div>
                            <div className="relative w-full lg:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Semester</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} onClick={() => navigate(`/admin/users/${student.id}`)} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">{student.name.charAt(0)}</div>
                                                    <div><div className="text-sm font-medium text-gray-900">{student.name}</div><div className="text-xs text-gray-500">{student.email}</div></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{student.department}</td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-600">Sem {student.semester}</td>
                                            <td className="px-6 py-4 text-center"><span className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">Active</span></td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No students found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="subjects"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {subjects.map((subject) => (
                            <div key={subject.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">{subject.code}</span>
                                    <span className="text-xs text-gray-500">{subject.credits} Credits</span>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{subject.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{subject.department} • <span className="text-gray-700 font-medium">Sem {subject.semester}</span></p>

                                <button
                                    onClick={() => handleDeleteSubject(subject.id)}
                                    className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {subjects.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                                <BookOpen className="mx-auto text-gray-300 mb-2" size={48} />
                                <p className="text-gray-500">No subjects found. Add a new subject to get started.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Subject Modal */}
            {isAddSubjectOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Subject</h2>
                        <form onSubmit={handleAddSubject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                                <input required type="text" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Data Structures" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                                    <input required type="text" value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. CS101" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                                    <input required type="number" value={newSubject.credits} onChange={e => setNewSubject({ ...newSubject, credits: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select value={newSubject.department} onChange={e => setNewSubject({ ...newSubject, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                                        <option>Computer Science</option>
                                        <option>Information Tech</option>
                                        <option>Electronics</option>
                                        <option>Mechanical</option>
                                        <option>Civil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                    <select value={newSubject.semester} onChange={e => setNewSubject({ ...newSubject, semester: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAddSubjectOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add Subject</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Academics;
