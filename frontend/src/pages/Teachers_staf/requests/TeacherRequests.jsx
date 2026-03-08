import React, { useState, useEffect } from 'react';
import { Send, FileText, Plus } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import RequestList from './RequestList';
import CreateRequestModal from './CreateRequestModal';
import { toast } from 'react-toastify';

const TeacherRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch My Requests on component mount
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

    const handleCreateRequest = async (formData) => {
        if (!user || !user.id) {
            toast.error('User not logged in. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    role: 'teacher',
                    type: formData.type,
                    subject: formData.subject,
                    description: formData.description
                })
            });

            if (response.ok) {
                toast.success('Request submitted successfully!');
                setIsModalOpen(false);
                fetchRequests(); // Refresh list
            } else {
                const errorData = await response.json();
                toast.error(`Failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Network error. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="text-blue-600" />
                            My Requests
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Submit and track your administrative requests.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold transition-all shadow-md shadow-blue-200 hover:shadow-lg"
                    >
                        <Send size={18} />
                        <span>New Request</span>
                    </button>
                </div>

                {/* Content */}
                <RequestList requests={requests} />

                {/* Modal */}
                <CreateRequestModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateRequest}
                />
            </div>
        </div>
    );
};

export default TeacherRequests;
