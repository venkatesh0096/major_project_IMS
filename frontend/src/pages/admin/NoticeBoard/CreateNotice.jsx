
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Calendar, AlertCircle, FileText, Send } from 'lucide-react';
import { useNotices } from '../../../context/NoticeContext';

const CreateNotice = () => {
    const navigate = useNavigate();
    const { addNotice } = useNotices();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        department: 'all'
    });

    const [departments, setDepartments] = useState([]);

    React.useEffect(() => {
        const fetchDepts = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/departments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDepartments(data);
                }
            } catch (err) {
                console.error("Failed to fetch departments", err);
            }
        };
        fetchDepts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addNotice(formData);
        navigate('/admin/notice-board');
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/notice-board')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Notice Board</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Create New Notice</h1>
                <p className="text-sm text-gray-500 mt-1">Draft and publish a new announcement for the institute</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Notice Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., End Semester Examination Schedule"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Content</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    rows="8"
                                    placeholder="Type the details of the notice here..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Attachments</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50/30 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-green-100 flex items-center justify-center mx-auto mb-3 transition-colors">
                                        <Upload size={24} className="text-gray-400 group-hover:text-green-600" />
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, DOCX, JPG or PNG (Max 10MB)</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar Options */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText size={20} className="text-green-600" />
                            Publishing Options
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Publish Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Priority Level</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-white"
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Target Audience</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-white"
                                >
                                    <option value="all">All Departments</option>
                                    <option value="Student">All Students</option>
                                    <option value="Teacher">All Teachers</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Publish Notice
                            </button>
                            <button
                                onClick={() => navigate('/admin/notice-board')}
                                className="w-full bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Save as Draft
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex gap-3">
                        <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                        <p className="text-sm text-blue-700 leading-relaxed">
                            High priority notices will trigger an immediate notification to all selected users.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNotice;
