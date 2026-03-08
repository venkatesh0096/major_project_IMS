import { useState } from 'react';
import { User, GraduationCap, ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useUsers } from '../../../context/UserContext';

const AddUser = () => {
    const navigate = useNavigate();
    const { addUser } = useUsers();
    const [role, setRole] = useState('student'); // 'student' or 'teacher'
    const [previewUrl, setPreviewUrl] = useState(null);

    const [formData, setFormData] = useState({
        // Common
        fullName: '',
        email: '',
        password: '',
        phone: '',
        dob: '',
        gender: '',
        address: '',
        department: '',
        avatar: null,

        // Student Specific
        rollNo: '',
        year: '',
        semester: '',
        guardianName: '',
        guardianPhone: '',
        joiningYear: new Date().getFullYear(),

        // Teacher Specific
        designation: '',
        qualification: '',
        experience: ''
    });

    const [departments, setDepartments] = useState([]);

    // Fetch departments on mount
    useState(() => {
        const fetchDepts = async () => {
            try {
                // Using local fetch instead of context for now to keep it simple, 
                // or assume we have a Department Context coming later.
                // Since this is an admin page, we can assume token is in localStorage or handled by context helper if available.
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, avatar: null });
        setPreviewUrl(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newUser = {
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: role === 'student' ? 'Student' : 'Teacher',
            department: formData.department,
            phone: formData.phone,
            dob: formData.dob,
            gender: formData.gender,
            address: formData.address,
            avatar: previewUrl, // Storing URL for mock purposes

            // Spread role specific fields
            ...(role === 'student' ? {
                rollNo: formData.rollNo,
                year: formData.year,
                semester: formData.semester,
                guardianName: formData.guardianName,
                guardianPhone: formData.guardianPhone,
                joiningYear: formData.joiningYear
            } : {
                designation: formData.designation,
                qualification: formData.qualification,
                experience: formData.experience
            })
        };

        addUser(newUser);
        navigate('/admin/users');
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
                    <p className="text-gray-500">Create a new student or staff account</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Role & Photo */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Role Selection */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">Select Role</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setRole('student')}
                                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${role === 'student'
                                    ? 'border-green-600 bg-green-50 text-green-700'
                                    : 'border-gray-100 hover:border-green-200 text-gray-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${role === 'student' ? 'bg-green-200' : 'bg-gray-100'}`}>
                                    <GraduationCap size={20} />
                                </div>
                                <span className="font-medium">Student</span>
                            </button>

                            <button
                                onClick={() => setRole('teacher')}
                                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${role === 'teacher'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-100 hover:border-blue-200 text-gray-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${role === 'teacher' ? 'bg-blue-200' : 'bg-gray-100'}`}>
                                    <User size={20} />
                                </div>
                                <span className="font-medium">Teacher / Staff</span>
                            </button>
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">Profile Photo</h3>
                        <div className="flex flex-col items-center">
                            <div className="relative w-32 h-32 mb-4">
                                {previewUrl ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full rounded-full object-cover border-4 border-gray-100"
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-inner">
                                        <User size={40} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="photo-upload"
                                />
                                <label
                                    htmlFor="photo-upload"
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <Upload size={16} />
                                    Upload Photo
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                JPG, PNG or GIF. Max size 2MB.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">

                        {/* Personal Details */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        required
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        rows="3"
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                        placeholder="Full residential address"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Academic/Professional Details */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                {role === 'student' ? 'Academic Details' : 'Professional Details'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {role === 'student' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.rollNo}
                                                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="e.g. CS21001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Joining Year</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.joiningYear}
                                                onChange={(e) => setFormData({ ...formData, joiningYear: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Year</label>
                                            <select
                                                required
                                                value={formData.year}
                                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                            <select
                                                required
                                                value={formData.semester}
                                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="">Select Semester</option>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                    <option key={sem} value={sem}>{sem}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.designation}
                                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="e.g. Assistant Professor"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.experience}
                                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.qualification}
                                                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="e.g. M.Tech in Computer Science, PhD"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="username@nit.edu.in"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Set a password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                {role === 'student' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.guardianName}
                                                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.guardianPhone}
                                                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/users')}
                                className="px-6 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium flex items-center gap-2 transition-colors shadow-lg shadow-green-600/20"
                            >
                                <Save size={18} />
                                Create User
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUser;
