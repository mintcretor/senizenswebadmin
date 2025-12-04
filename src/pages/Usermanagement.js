import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Save,
    Eye,
    EyeOff,
    Building2,
    Briefcase,
    Mail,
    Phone,
    Calendar,
    UserCog,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    Upload
} from 'lucide-react';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDivision, setFilterDivision] = useState('');
    const [filterPosition, setFilterPosition] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        nickname: '',
        email: '',
        phone_number: '',
        position_id: '',
        division_id: '',
        ward: '',
        shift_type: '',
        employee_code: '',
        hire_date: '',
        status: 'active'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');


            const usersResponse = await fetch(`${API_BASE_URL}/users`);
            const divisionsResponse = await fetch(`${API_BASE_URL}/divisions`);
            const positionsResponse = await fetch(`${API_BASE_URL}/positions`);
            if (!usersResponse.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลได้');
            }
            const usersData = await usersResponse.json();

            console.log('Fetched users:', usersData);
            const divisionsData = await divisionsResponse.json();

            console.log('Fetched divisions:', divisionsData);
            const positionsData = await positionsResponse.json();
            console.log('Fetched positions:', positionsData);

            setUsers(usersData);
            setDivisions(divisionsData.data);
            setPositions(positionsData.data);

        } catch (error) {
            console.error('Error fetching data:', error);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchSearch = searchTerm === '' ||
            user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase());
        console.log('filterDivision:', filterDivision, 'user.division_id:', user.division_id);
        console.log('filterPosition:', filterPosition, 'user.position_id:', user.position_id);
        const matchDivision = filterDivision === '' || user.division_id === parseInt(filterDivision);
        const matchPosition = filterPosition === '' || user.position_id === parseInt(filterPosition);
        const matchStatus = filterStatus === '' || user.status === filterStatus;

        return matchSearch && matchDivision && matchPosition && matchStatus;
    });

    // Handle form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {

        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            setError('กรุณากรอกชื่อและนามสกุล');
            return false;
        }
        if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('รูปแบบอีเมลไม่ถูกต้อง');
            return false;
        }
        return true;
    };

    const openAddModal = () => {
        setModalMode('add');
        setFormData({
            username: '',
            password: '',
            first_name: '',
            last_name: '',
            nickname: '',
            email: '',
            phone_number: '',
            position_id: '',
            division_id: '',
            ward: '',
            shift_type: '',
            employee_code: '',
            hire_date: '',
            status: 'active'
        });
        setError('');
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            username: user.username || '',
            password: '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            nickname: user.nickname || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            position_id: user.position_id || '',
            division_id: user.division_id || '',
            ward: user.ward || '',
            shift_type: user.shift_type || '',
            employee_code: user.employee_code || '',
            hire_date: user.hire_date || '',
            status: user.status || 'active'
        });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setError('');
            let response;

            if (modalMode === 'add') {

                console.log('Creating user:', formData);

                response = await fetch(`${API_BASE_URL}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'ไม่สามารถเพิ่มพนักงานได้');
                }

                setSuccess('เพิ่มพนักงานสำเร็จ');

            } else {
                // --- กรณีแก้ไขข้อมูล (PUT) ---
                console.log('Updating user:', selectedUser.user_id, formData);

                // ตัด password ออกถ้าเป็นค่าว่าง เพื่อไม่ให้ส่งไป update (ขึ้นอยู่กับ backend ว่าจัดการอย่างไร)
                // แต่ถ้า backend แยก route เปลี่ยนรหัสผ่าน ก็ส่งไปทั้งก้อนได้เลย Backend ตัวที่ผมเขียนให้ก่อนหน้าจะไม่อัปเดตรหัสผ่านใน route นี้
                response = await fetch(`${API_BASE_URL}/users/${selectedUser.user_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'ไม่สามารถแก้ไขข้อมูลได้');
                }

                setSuccess('แก้ไขข้อมูลสำเร็จ');
            }

            setShowModal(false);
            setTimeout(() => setSuccess(''), 3000);
            fetchData(); // โหลดข้อมูลใหม่หลังจากบันทึกเสร็จ

        } catch (error) {
            console.error('Error saving user:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleDelete = async (userId, userName) => {
        if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบพนักงาน "${userName}"?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`)) {
            try {


                // --- กรณีลบข้อมูล (DELETE) ---
                const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('ไม่สามารถลบข้อมูลได้');
                }

                setSuccess('ลบพนักงานสำเร็จ');
                setTimeout(() => setSuccess(''), 3000);
                fetchData(); // โหลดข้อมูลใหม่หลังจากลบเสร็จ

            } catch (error) {
                console.error('Error deleting user:', error);
                setError(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };
    const getStatusBadge = (status) => {
        const configs = {
            active: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                icon: CheckCircle,
                label: 'ทำงานอยู่'
            },
            inactive: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                icon: AlertCircle,
                label: 'พักงาน'
            },
            resigned: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                icon: XCircle,
                label: 'ลาออก'
            }
        };

        const config = configs[status] || configs.inactive;
        const Icon = config.icon;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} flex items-center gap-1 w-fit`}>
                <Icon size={14} />
                {config.label}
            </span>
        );
    };

    const exportToCSV = () => {
        const headers = ['รหัส', 'ชื่อ', 'นามสกุล', 'ชื่อเล่น', 'ตำแหน่ง', 'แผนก', 'อีเมล', 'เบอร์โทร', 'สถานะ'];
        const rows = filteredUsers.map(u => [
            u.employee_code,
            u.first_name,
            u.last_name,
            u.nickname,
            u.position_name,
            u.division_name,
            u.email,
            u.phone_number,
            u.status === 'active' ? 'ทำงานอยู่' : u.status === 'inactive' ? 'พักงาน' : 'ลาออก'
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `พนักงาน_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3">
                        <CheckCircle className="text-green-500" size={24} />
                        <span className="text-green-800 font-medium">{success}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
                        <XCircle className="text-red-500" size={24} />
                        <span className="text-red-800 font-medium">{error}</span>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                                <Users className="text-white" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">จัดการพนักงาน</h1>
                                <p className="text-gray-600 mt-1">
                                    ข้อมูลพนักงานทั้งหมด <span className="font-semibold text-indigo-600">{filteredUsers.length}</span> คน
                                    {searchTerm || filterDivision || filterPosition || filterStatus ?
                                        ` (จากทั้งหมด ${users.length} คน)` : ''
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={exportToCSV}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                                title="Export ข้อมูล"
                            >
                                <Download size={20} />
                                Export
                            </button>
                            <button
                                onClick={openAddModal}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                            >
                                <Plus size={20} />
                                เพิ่มพนักงาน
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="ค้นหา ชื่อ, รหัส, username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <select
                            value={filterDivision}
                            onChange={(e) => setFilterDivision(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="">ทุกแผนก</option>
                            {divisions.map(div => (
                                <option key={div.division_id} value={div.division_id}>
                                    {div.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterPosition}
                            onChange={(e) => setFilterPosition(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="">ทุกตำแหน่ง</option>
                            {positions.map(pos => (
                                <option key={pos.position_id} value={pos.position_id}>
                                    {pos.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="">ทุกสถานะ</option>
                            <option value="active">ทำงานอยู่</option>
                            <option value="inactive">พักงาน</option>
                            <option value="resigned">ลาออก</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">รหัสพนักงาน</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">ชื่อ-นามสกุล</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">ชื่อเล่น</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">ตำแหน่ง</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">แผนก</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">อีเมล</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">สถานะ</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex justify-center items-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                <span className="text-gray-500">กำลังโหลดข้อมูล...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-500">
                                                <Users size={48} className="text-gray-300" />
                                                <p className="text-lg font-medium">ไม่พบข้อมูลพนักงาน</p>
                                                {(searchTerm || filterDivision || filterPosition || filterStatus) && (
                                                    <p className="text-sm">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, idx) => (
                                        <tr
                                            key={user.user_id}
                                            className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition-colors`}
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {user.employee_code || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {user.first_name} {user.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {user.nickname || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {user.position_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {user.division_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {user.email || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {getStatusBadge(user.status)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="แก้ไข"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.user_id, `${user.first_name} ${user.last_name}`)}
                                                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    {modalMode === 'add' ? (
                                        <>
                                            <Plus size={28} />
                                            เพิ่มพนักงานใหม่
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 size={28} />
                                            แก้ไขข้อมูลพนักงาน
                                        </>
                                    )}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                {error && (
                                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
                                        <XCircle className="text-red-500" size={20} />
                                        <span className="text-red-800">{error}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">




                                    {/* ข้อมูลส่วนตัว */}
                                    <div className="md:col-span-2 mt-4">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2 pb-2 border-b-2 border-indigo-200">
                                            <Users size={20} className="text-indigo-600" />
                                            ข้อมูลส่วนตัว
                                        </h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            ชื่อ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="ชื่อจริง"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            นามสกุล <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="นามสกุล"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            ชื่อเล่น
                                        </label>
                                        <input
                                            type="text"
                                            name="nickname"
                                            value={formData.nickname}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="ชื่อเล่น (ถ้ามี)"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                            <Mail size={16} />
                                            อีเมล
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="example@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                            <Phone size={16} />
                                            เบอร์โทรศัพท์
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="08x-xxx-xxxx"
                                        />
                                    </div>

                                    {/* ข้อมูลการทำงาน */}
                                    <div className="md:col-span-2 mt-4">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2 pb-2 border-b-2 border-indigo-200">
                                            <Briefcase size={20} className="text-indigo-600" />
                                            ข้อมูลการทำงาน
                                        </h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            รหัสพนักงาน
                                        </label>
                                        <input
                                            type="text"
                                            name="employee_code"
                                            value={formData.employee_code}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="เช่น 6604001"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                            <Calendar size={16} />
                                            วันที่เข้าทำงาน
                                        </label>
                                        <input
                                            type="date"
                                            name="hire_date"
                                            value={formData.hire_date}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                            <Building2 size={16} />
                                            แผนก
                                        </label>
                                        <select
                                            name="division_id"
                                            value={formData.division_id}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">เลือกแผนก</option>
                                            {divisions.map(div => (
                                                <option key={div.division_id} value={div.division_id}>
                                                    {div.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            ตำแหน่ง
                                        </label>
                                        <select
                                            name="position_id"
                                            value={formData.position_id}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">เลือกตำแหน่ง</option>
                                            {positions.map(pos => (
                                                <option key={pos.position_id} value={pos.position_id}>
                                                    {pos.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Ward (สำหรับพยาบาล)
                                        </label>
                                        <input
                                            type="text"
                                            name="ward"
                                            value={formData.ward}
                                            onChange={handleInputChange}
                                            placeholder="Ward 3, Ward 4, IPD..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Shift Type (สำหรับพยาบาล)
                                        </label>
                                        <select
                                            name="shift_type"
                                            value={formData.shift_type}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">ไม่ระบุ</option>
                                            <option value="PN">PN (เช้า-เย็น)</option>
                                            <option value="FN">FN (เช้า-บ่าย)</option>
                                            <option value="NA">NA (พยาบาลช่วย)</option>
                                            <option value="RN">RN (พยาบาลวิชาชีพ)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            สถานะ
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        >
                                            <option value="active">ทำงานอยู่</option>
                                            <option value="inactive">พักงาน</option>
                                            <option value="resigned">ลาออก</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-all"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                                    >
                                        <Save size={18} />
                                        {modalMode === 'add' ? 'เพิ่มพนักงาน' : 'บันทึกการแก้ไข'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagementPage;