import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, FileText, CheckCircle, XCircle,
    Clock, ChevronRight, Calendar, User, ArrowLeft, Upload, MoreVertical, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

const StudentRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedType, setSelectedType] = useState("All");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    // Form State
    const [newRequest, setNewRequest] = useState({ type: 'Bonafide Certificate', purpose: '', description: '', department: '' });

    // Fetch My Requests
    useEffect(() => {
        if (user?.id) {
            fetchRequests();
        }
    }, [user]);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/my?userId=${user.id}`);
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.id) {
            alert('User not logged in. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    role: 'student',
                    type: newRequest.type,
                    subject: newRequest.purpose,
                    description: newRequest.description
                })
            });

            if (response.ok) {
                alert('Request submitted successfully!');
                setIsCreating(false);
                setNewRequest({ type: 'Bonafide Certificate', purpose: '', description: '', department: '' });
                fetchRequests();
            } else {
                const errorData = await response.json();
                alert(`Failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Network error. Please try again.');
        }
    };

    const handleDelete = async (requestId) => {
        if (!window.confirm('Are you sure you want to delete this request?')) {
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchRequests(); // Refresh list
            } else {
                alert('Failed to delete request');
            }
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('Network error. Please try again.');
        }
        setOpenDropdown(null);
    };

    // Filter Logic
    const filteredRequests = requests.filter(req => {
        const matchesSearch = (req.subject && req.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (req.type && req.type.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = selectedStatus === "All" || req.status === selectedStatus;
        const matchesType = selectedType === "All" || req.type === selectedType;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Stats
    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'Pending').length,
        approved: requests.filter(r => r.status === 'Approved').length,
        rejected: requests.filter(r => r.status === 'Rejected').length
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Requests</h1>
                        <p className="text-gray-500">Manage your applications and check their status.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all font-medium"
                    >
                        <Plus size={20} /> New Request
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Requests', val: stats.total, color: 'bg-white text-gray-900', icon: <FileText /> },
                        { label: 'Pending', val: stats.pending, color: 'bg-yellow-50 text-yellow-700', icon: <Clock /> },
                        { label: 'Approved', val: stats.approved, color: 'bg-green-50 text-green-700', icon: <CheckCircle /> },
                        { label: 'Rejected', val: stats.rejected, color: 'bg-red-50 text-red-700', icon: <XCircle /> },
                    ].map((stat, i) => (
                        <div key={i} className={`p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-28 ${stat.color}`}>
                            <div className="flex justify-between items-start opacity-80">
                                <span className="text-sm font-medium">{stat.label}</span>
                                {stat.icon}
                            </div>
                            <span className="text-3xl font-bold">{stat.val}</span>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">All Types</option>
                            <option value="Bonafide Certificate">Bonafide</option>
                            <option value="Gate Pass">Gate Pass</option>
                            <option value="Leave Application">Leave</option>
                        </select>
                    </div>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                    {filteredRequests.map(req => (
                        <div
                            key={req.id}
                            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group relative"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                    onClick={() => setSelectedRequest(req)}
                                >
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {req.type}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                </div>

                                {/* Three-dot menu */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdown(openDropdown === req.id ? null : req.id);
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <MoreVertical size={16} className="text-gray-500" />
                                    </button>

                                    {openDropdown === req.id && (
                                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(req.id);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div
                                className="cursor-pointer"
                                onClick={() => setSelectedRequest(req)}
                            >
                                <span className="text-sm text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                <p className="text-gray-600 text-sm mb-3 mt-2">{req.subject}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{req.department || 'General'}</span>
                                    <span className="flex items-center gap-1 text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Details <ChevronRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredRequests.length === 0 && (
                        <div className="text-center py-10 text-gray-500">No requests found.</div>
                    )}
                </div>
            </div>

            {/* Create Request Modal */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900">New Request</h2>
                                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newRequest.type}
                                        onChange={e => setNewRequest({ ...newRequest, type: e.target.value })}
                                    >
                                        <option>Bonafide Certificate</option>
                                        <option>Gate Pass</option>
                                        <option>Leave Application</option>
                                        <option>Bus Pass Renewal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / Subject</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newRequest.purpose}
                                        onChange={e => setNewRequest({ ...newRequest, purpose: e.target.value })}
                                        placeholder="e.g. Scholarship Application"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        rows="3"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newRequest.description}
                                        onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                                        placeholder="Provide more details..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newRequest.department}
                                        onChange={e => setNewRequest({ ...newRequest, department: e.target.value })}
                                        placeholder="e.g. Admin Office"
                                    />
                                </div>

                                <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all mt-4">
                                    Submit Request
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Request Detail Panel (Slide-over) */}
            <AnimatePresence>
                {selectedRequest && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-40 border-l border-gray-200 overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 sticky top-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{selectedRequest.type}</h2>
                                <p className="text-sm text-gray-500">ID: #{selectedRequest.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <XCircle size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-xl border flex items-center gap-3 ${getStatusColor(selectedRequest.status)} bg-opacity-10 border-opacity-20`}>
                                {selectedRequest.status === 'Approved' ? <CheckCircle /> : selectedRequest.status === 'Rejected' ? <XCircle /> : <Clock />}
                                <div>
                                    <p className="font-bold">Status: {selectedRequest.status}</p>
                                    <p className="text-xs opacity-80">Last updated on {selectedRequest.date}</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Request Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500">Purpose</label>
                                        <p className="font-medium text-gray-900">{selectedRequest.purpose}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Description</label>
                                        <p className="text-gray-700 text-sm leading-relaxed">{selectedRequest.description}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Department</label>
                                        <p className="font-medium text-gray-900">{selectedRequest.department}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Timeline</h3>
                                <div className="border-l-2 border-gray-100 ml-2 space-y-6">
                                    {selectedRequest.timeline?.map((event, i) => (
                                        <div key={i} className="relative pl-6">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-500"></div>
                                            <p className="text-sm font-bold text-gray-900">{event.status}</p>
                                            <p className="text-xs text-gray-500">{event.date} • {event.by}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Comments */}
                            {selectedRequest.comments && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">Staff Comments</h4>
                                    <p className="text-gray-600 text-sm italic">"{selectedRequest.comments}"</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay for Mobile */}
            {selectedRequest && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setSelectedRequest(null)}
                ></div>
            )}

        </div>
    );
};

export default StudentRequests;
