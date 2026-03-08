import React, { useState, useEffect } from 'react';
import { BookOpen, Download, Eye, FileText, Video, Link as LinkIcon, Filter } from 'lucide-react';

const StudentResources = () => {
    const [resources, setResources] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filters, setFilters] = useState({
        semester: '',
        subjectId: ''
    });

    useEffect(() => {
        fetchResources();
        fetchSubjects();
    }, [filters]);

    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = `${import.meta.env.VITE_API_URL}/api/resources`;
            const params = new URLSearchParams();
            if (filters.semester) params.append('semester', filters.semester);
            if (filters.subjectId) params.append('subjectId', filters.subjectId);
            if (params.toString()) url += `?${params}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                console.error('Failed to fetch resources:', response.status);
                setResources([]);
                return;
            }

            const data = await response.json();
            setResources(data || []);
        } catch (error) {
            console.error('Error fetching resources:', error);
            setResources([]);
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

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf': case 'doc': case 'docx': case 'ppt': case 'pptx':
                return <FileText className="text-blue-600" size={32} />;
            case 'video':
                return <Video className="text-purple-600" size={32} />;
            case 'link':
                return <LinkIcon className="text-green-600" size={32} />;
            default:
                return <FileText className="text-gray-600" size={32} />;
        }
    };

    const getUserData = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user;
    };

    const user = getUserData();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="text-blue-600" />
                    Study Resources
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Resources for Year {user.year} students
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <Filter size={20} className="text-gray-500" />
                    <div className="flex gap-4 flex-1">
                        <select
                            value={filters.semester}
                            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>

                        <select
                            value={filters.subjectId}
                            onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(subj => (
                                <option key={subj.id} value={subj.id}>{subj.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-sm text-gray-500">
                        {resources.length} resource{resources.length !== 1 ? 's' : ''} found
                    </div>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">No resources available yet</p>
                        <p className="text-sm text-gray-400 mt-1">Check back later for study materials</p>
                    </div>
                ) : (
                    resources.map((resource) => (
                        <div key={resource.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        {getFileIcon(resource.fileType)}
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                        {resource.fileType.toUpperCase()}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {resource.title}
                                </h3>

                                {resource.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {resource.description}
                                    </p>
                                )}

                                <div className="space-y-1 text-xs text-gray-500 mb-4">
                                    <p className="flex items-center gap-1">
                                        <span className="font-medium">Uploaded by:</span>
                                        <span>{resource.uploader?.User?.name || 'Teacher'}</span>
                                    </p>
                                    {resource.subject && (
                                        <p className="flex items-center gap-1">
                                            <span className="font-medium">Subject:</span>
                                            <span>{resource.subject.name}</span>
                                        </p>
                                    )}
                                    {resource.semester && (
                                        <p className="flex items-center gap-1">
                                            <span className="font-medium">Semester:</span>
                                            <span>{resource.semester}</span>
                                        </p>
                                    )}
                                    <p className="flex items-center gap-1">
                                        <span className="font-medium">Size:</span>
                                        <span>{formatFileSize(resource.fileSize)}</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span>{resource.downloads} downloads</span>
                                        <span>•</span>
                                        <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
                                <a
                                    href={`${import.meta.env.VITE_API_URL}/api/resources/${resource.id}/download`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download size={16} />
                                    <span>Download</span>
                                </a>
                                <a
                                    href={`http://localhost:5001${resource.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                                    title="View"
                                >
                                    <Eye size={16} />
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentResources;
