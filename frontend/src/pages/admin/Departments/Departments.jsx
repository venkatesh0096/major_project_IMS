import { useState, useEffect } from 'react';
import { Building2, Users, GraduationCap, MoreVertical, Edit, ArrowRight, Plus, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import AddDepartment from './AddDepartment';

const Departments = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/departments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [token]);

    const handleAddDepartment = async (deptData) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/departments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(deptData)
        });

        if (response.ok) {
            fetchDepartments();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create');
        }
    };

    const handleViewDetails = (deptName) => {
        navigate(`/admin/departments/${encodeURIComponent(deptName)}`);
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.hod && dept.hod.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const stats = [
        { label: 'Total Departments', value: departments.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Faculty', value: departments.reduce((acc, d) => acc + (d.faculty || 0), 0), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Total Students', value: departments.reduce((acc, d) => acc + (d.students || 0), 0), icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <motion.div variants={itemVariants}>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Academic Departments</h1>
                        <p className="mt-2 text-lg text-gray-500">Overview and management of institute faculties.</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search departments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 w-full md:w-64 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-600/30"
                        >
                            <Plus size={20} />
                            New Department
                        </button>
                    </motion.div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5"
                        >
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
                        <p className="text-gray-500 font-medium animate-pulse">Fetching department data...</p>
                    </div>
                ) : filteredDepartments.length === 0 ? (
                    <motion.div
                        variants={itemVariants}
                        className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200"
                    >
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Building2 size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">No departments found</h3>
                        <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                            {searchQuery ? "We couldn't find any department matching your search." : "Ready to set up your institute? Start by adding your first department."}
                        </p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="mt-8 text-green-600 font-bold hover:text-green-700 underline-offset-4 hover:underline transition-all"
                        >
                            Create your first department
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDepartments.map((dept) => (
                            <motion.div
                                key={dept.id}
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                                className="group relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-green-50 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-extrabold text-gray-900 mb-2 truncate">
                                    {dept.name}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                    <Users size={16} className="text-gray-400" />
                                    <span>HOD: <span className="font-semibold text-gray-900">{dept.hod || 'Unassigned'}</span></span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Students</p>
                                        <p className="text-xl font-black text-gray-900">{dept.students || 0}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Faculty</p>
                                        <p className="text-xl font-black text-gray-900">{dept.faculty || 0}</p>
                                    </div>
                                </div>

                                <motion.button
                                    onClick={() => handleViewDetails(dept.name)}
                                    className="w-full mt-8 py-3 bg-gray-50 rounded-2xl flex items-center justify-center gap-2 font-bold text-gray-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300"
                                >
                                    Explorer Details
                                    <ArrowRight size={18} />
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <AddDepartment
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        onAdd={handleAddDepartment}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Departments;
