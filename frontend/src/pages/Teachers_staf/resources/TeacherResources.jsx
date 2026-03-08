import React, { useState, useEffect } from 'react';
import { Upload, FileText, Video, Link as LinkIcon, X, Plus, Edit2, Trash2, Download, Eye } from 'lucide-react';

const TeacherResources = () => {
    const [resources, setResources] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        departmentId: '',
        year: '',
        semester: '',
        subjectId: '',
        file: null
    });

    useEffect(() => {
        fetchResources();
        fetchDepartments();
        fetchSubjects();
    }, []);

    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                console.error('Failed to fetch resources:', response.status, response.statusText);
                setResources([]); // Set empty array on error
                return;
            }

            const data = await response.json();
            setResources(data || []); // Ensure data is always an array
        } catch (error) {
            console.error('Error fetching resources:', error);
            setResources([]); // Set empty array on error
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.error('Failed to fetch departments');
                setDepartments([]);
                return;
            }
            const data = await response.json();
            setDepartments(data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setDepartments([]);
        }
    };

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.error('Failed to fetch subjects');
                setSubjects([]);
                return;
            }
            const data = await response.json();
            setSubjects(data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setSubjects([]);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);

        const data = new FormData();
        data.append('file', formData.file);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('departmentId', formData.departmentId);
        data.append('year', formData.year);
        if (formData.semester) data.append('semester', formData.semester);
        if (formData.subjectId) data.append('subjectId', formData.subjectId);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (response.ok) {
                alert('Resource uploaded successfully!');
                setShowUploadModal(false);
                setFormData({ title: '', description: '', departmentId: '', year: '', semester: '', subjectId: '', file: null });
                fetchResources();
            } else {
                const error = await response.json();
                alert(error.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchResources();
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf': case 'doc': case 'docx': case 'ppt': case 'pptx':
                return <FileText className="text-blue-600" size={24} />;
            case 'video':
                return <Video className="text-purple-600" size={24} />;
            case 'link':
                return <LinkIcon className="text-green-600" size={24} />;
            default:
                return <FileText className="text-gray-600" size={24} />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Resources</h1>
                    <p className="text-sm text-gray-500 mt-1">Upload and manage study materials</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors"
                >
                    <Plus size={18} />
                    <span>Upload Resource</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Uploads</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{resources.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Downloads</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {resources.reduce((sum, r) => sum + r.downloads, 0)}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {resources.reduce((sum, r) => sum + r.views, 0)}
                    </p>
                </div>
            </div>

            {/* Resources List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Uploaded Resources</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {resources.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Upload size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>No resources uploaded yet</p>
                            <p className="text-sm mt-1">Click "Upload Resource" to get started</p>
                        </div>
                    ) : (
                        resources.map((resource) => (
                            <div key={resource.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        {getFileIcon(resource.fileType)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {resource.department?.name} • Year {resource.year}
                                            {resource.semester && ` • Semester ${resource.semester}`}
                                            {resource.subject && ` • ${resource.subject.name}`}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span>{formatFileSize(resource.fileSize)}</span>
                                            <span>•</span>
                                            <span>{resource.downloads} downloads</span>
                                            <span>•</span>
                                            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}/api/resources/${resource.id}/download`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download size={18} />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(resource.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Upload Resource</h2>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                    <select
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select</option>
                                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester (Optional)</label>
                                    <select
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Semesters</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject (Optional)</label>
                                    <select
                                        value={formData.subjectId}
                                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">General</option>
                                        {subjects.map(subj => (
                                            <option key={subj.id} value={subj.id}>{subj.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">File * (Max 50MB)</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi"
                                    required
                                />
                                {formData.file && (
                                    <p className="text-xs text-gray-500 mt-1">{formData.file.name} ({formatFileSize(formData.file.size)})</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherResources;
