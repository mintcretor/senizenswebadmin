import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight, ArrowLeft, Shield, Search, CheckCircle, Building2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SenizensRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        code: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [employeeData, setEmployeeData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    // ค้นหาข้อมูลพนักงานจากรหัส
    const handleSearchEmployee = async (e) => {
        e.preventDefault();

        if (!formData.code) {
            setError('กรุณากรอกรหัสพนักงาน');
            return;
        }

        setIsSearching(true);
        setError('');
        setEmployeeData(null);

        try {
            // เรียก API เพื่อค้นหาข้อมูลพนักงาน
            const response = await axios.get(`${API_BASE_URL}/auth/search-employee/${formData.code}`);

            if (response.data.success) {
                const employee = response.data.data;

                // ตรวจสอบว่าพนักงานคนนี้มี username แล้วหรือยัง
                if (employee.username) {
                    setError('รหัสพนักงานนี้ได้ลงทะเบียนแล้ว กรุณาเข้าสู่ระบบหรือติดต่อผู้ดูแลระบบ');
                    setEmployeeData(null);
                } else {
                    // แสดงข้อมูลพนักงาน
                    setEmployeeData(employee);
                }
            }
        } catch (err) {
            console.error("Employee search failed:", err);
            if (err.response?.status === 404) {
                setError('ไม่พบรหัสพนักงานในระบบ กรุณาตรวจสอบอีกครั้งหรือติดต่อแผนก HR');
            } else {
                setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง');
            }
            setEmployeeData(null);
        } finally {
            setIsSearching(false);
        }
    };

    // สมัครสมาชิก
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validation
        if (!formData.username.trim()) {
            setError('กรุณากรอกชื่อผู้ใช้');
            setIsLoading(false);
            return;
        }

        if (formData.username.length < 4) {
            setError('ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร');
            setIsLoading(false);
            return;
        }

        if (!formData.password) {
            setError('กรุณากรอกรหัสผ่าน');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร เพื่อความปลอดภัย');
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
            setIsLoading(false);
            return;
        }

        // ตรวจสอบความแข็งแรงของรหัสผ่าน
        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasNumber = /[0-9]/.test(formData.password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            setError('รหัสผ่านต้องประกอบด้วย ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                code: formData.code,
                username: formData.username.trim(),
                password: formData.password,
                first_name: employeeData.first_name,
                last_name: employeeData.last_name,
                nickname: employeeData.nickname,
                email: employeeData.email,
                phone_number: employeeData.phone_number,
                role_id: employeeData.role_id
            });

            if (response.data.success) {
                // แสดง dialog แทน alert
                const confirmLogin = window.confirm(
                    `ลงทะเบียนสำเร็จ!\n\nชื่อผู้ใช้: ${formData.username}\nคุณสามารถเข้าสู่ระบบได้ทันที\n\nต้องการเข้าสู่ระบบเลยหรือไม่?`
                );

                if (confirmLogin) {
                    navigate('/login', { state: { username: formData.username } });
                } else {
                    navigate('/login');
                }
            }
        } catch (err) {
            console.error("Registration failed:", err);
            if (err.response?.status === 409) {
                setError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น');
            } else {
                setError(err.response?.data?.message || 'การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง หรือติดต่อ IT Support');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToSearch = () => {
        setEmployeeData(null);
        setFormData({
            code: '',
            username: '',
            password: '',
            confirmPassword: ''
        });
        setError('');
    };

    // ตรวจสอบความแข็งแรงของรหัสผ่าน
    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength, label: 'อ่อน', color: 'bg-red-500' };
        if (strength <= 4) return { strength, label: 'ปานกลาง', color: 'bg-yellow-500' };
        return { strength, label: 'แข็งแรง', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
            {/* Left Side - Animated Background */}
            <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-center items-center p-12 text-white">
                    <div className="max-w-md text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20">
                            <Building2 className="w-12 h-12 text-white" />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-fade-in">
                                ลงทะเบียนพนักงาน
                            </h1>
                            <p className="text-xl text-purple-100 opacity-90 animate-fade-in-delay">
                                ระบบสำหรับพนักงานองค์กรเท่านั้น
                            </p>
                        </div>

                        <div className="space-y-4 text-purple-100/80 animate-fade-in-delay-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <span>ใช้รหัสพนักงานในการยืนยันตัวตน</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                                <span>ระบบความปลอดภัยขององค์กร</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-400"></div>
                                <span>เข้าถึงข้อมูลภายในองค์กร</span>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <p className="text-sm text-purple-200">
                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                หากไม่ทราบรหัสพนักงาน กรุณาติดต่อแผนก HR
                            </p>
                        </div>
                    </div>
                </div>

                <div className="absolute top-10 right-10 w-20 h-20 border border-white/10 rounded-full animate-spin-slow"></div>
                <div className="absolute bottom-20 left-10 w-16 h-16 border-2 border-purple-400/20 rounded-lg rotate-45 animate-bounce-slow"></div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <Building2 className="w-12 h-12 mx-auto mb-2" />
                    <h1 className="text-3xl font-bold mb-2">SENIZENS</h1>
                    <p className="text-purple-100">ลงทะเบียนพนักงาน</p>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4 sm:p-8 relative min-h-screen lg:min-h-auto overflow-y-auto">
                <div className="absolute inset-0 opacity-5 hidden lg:block">
                    <div className="absolute top-0 left-0 w-full h-full"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)',
                            backgroundSize: '20px 20px'
                        }}></div>
                </div>

                <div className="w-full max-w-md relative z-10 my-8">
                    {/* Logo Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-xl animate-fade-in">
                            <span className="text-2xl font-bold text-white">S</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            {!employeeData ? 'ยืนยันตัวตนพนักงาน' : 'ตั้งค่าบัญชีผู้ใช้'}
                        </h2>
                        <p className="text-gray-500">
                            {!employeeData ? 'กรุณากรอกรหัสพนักงานเพื่อเริ่มต้นลงทะเบียน' : 'สร้างชื่อผู้ใช้และรหัสผ่านสำหรับเข้าสู่ระบบ'}
                        </p>
                    </div>

                    {/* Search Employee Code Form */}
                    {!employeeData ? (
                        <form onSubmit={handleSearchEmployee} className="space-y-6">
                            {/* Info Box */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">สำหรับพนักงานองค์กรเท่านั้น</p>
                                        <p className="text-blue-700">ใช้รหัสพนักงานที่ได้รับจากแผนก HR ในการยืนยันตัวตน</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    รหัสพนักงาน (Employee Code) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Shield className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'code' ? 'text-purple-500' : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('code')}
                                        onBlur={() => setFocusedField('')}
                                        placeholder="ตัวอย่าง: EMP001"
                                        className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400 hover:border-gray-300 group-hover:shadow-md text-base"
                                        autoComplete="off"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-600 text-sm font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSearching}
                                className={`group relative w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform ${isSearching
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:scale-95 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/30'
                                    } overflow-hidden`}
                            >
                                <div className="relative flex items-center justify-center">
                                    {isSearching ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                            <span>กำลังตรวจสอบ...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-3 w-5 h-5" />
                                            <span>ตรวจสอบรหัสพนักงาน</span>
                                        </>
                                    )}
                                </div>
                            </button>

                            <div className="text-center space-y-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 hover:underline"
                                >
                                    ลงทะเบียนแล้ว? เข้าสู่ระบบ
                                </button>
                                <p className="text-xs text-gray-500">
                                    หากมีปัญหาการลงทะเบียน กรุณาติดต่อ IT Support
                                </p>
                            </div>
                        </form>
                    ) : (
                        // Registration Form
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Display Employee Info */}
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-green-700">ข้อมูลพนักงาน</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">รหัสพนักงาน</p>
                                        <p className="font-medium text-gray-800">{employeeData.code}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">ชื่อเล่น</p>
                                        <p className="font-medium text-gray-800">{employeeData.nickname || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-600">ชื่อ-นามสกุล</p>
                                        <p className="font-medium text-gray-800">{employeeData.first_name} {employeeData.last_name}</p>
                                    </div>
                                    {employeeData.email && (
                                        <div className="col-span-2">
                                            <p className="text-gray-600">อีเมล</p>
                                            <p className="font-medium text-gray-800">{employeeData.email}</p>
                                        </div>
                                    )}
                                    {employeeData.phone_number && (
                                        <div className="col-span-2">
                                            <p className="text-gray-600">เบอร์โทรศัพท์</p>
                                            <p className="font-medium text-gray-800">{employeeData.phone_number}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Username Field */}
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ชื่อผู้ใช้ (Username) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'username' ? 'text-purple-500' : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField('')}
                                        placeholder="สร้างชื่อผู้ใช้ (อย่างน้อย 4 ตัวอักษร)"
                                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400 hover:border-gray-300 group-hover:shadow-md"
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">ใช้สำหรับเข้าสู่ระบบ (ภาษาอังกฤษและตัวเลขเท่านั้น)</p>
                            </div>

                            {/* Password Field */}
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    รหัสผ่าน (Password) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'password' ? 'text-purple-500' : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField('')}
                                        placeholder="สร้างรหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                                        className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400 hover:border-gray-300 group-hover:shadow-md"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-gray-400 hover:text-purple-500" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400 hover:text-purple-500" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-600">ความแข็งแรง:</span>
                                            <span className={`text-xs font-medium ${passwordStrength.label === 'อ่อน' ? 'text-red-600' :
                                                    passwordStrength.label === 'ปานกลาง' ? 'text-yellow-600' :
                                                        'text-green-600'
                                                }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                                style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-2 text-xs text-gray-500 space-y-1">
                                    <p>รหัสผ่านต้องมี:</p>
                                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                                        <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                                            อย่างน้อย 8 ตัวอักษร
                                        </li>
                                        <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                                            ตัวพิมพ์ใหญ่ (A-Z)
                                        </li>
                                        <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                                            ตัวพิมพ์เล็ก (a-z)
                                        </li>
                                        <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                                            ตัวเลข (0-9)
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'confirmPassword' ? 'text-purple-500' : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('confirmPassword')}
                                        onBlur={() => setFocusedField('')}
                                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                                        className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400 hover:border-gray-300 group-hover:shadow-md"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5 text-gray-400 hover:text-purple-500" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400 hover:text-purple-500" />
                                        )}
                                    </button>
                                </div>
                                {formData.confirmPassword && (
                                    <p className={`mt-1 text-xs ${formData.password === formData.confirmPassword
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        }`}>
                                        {formData.password === formData.confirmPassword
                                            ? '✓ รหัสผ่านตรงกัน'
                                            : '✗ รหัสผ่านไม่ตรงกัน'}
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-600 text-sm font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Terms and Conditions */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="text-xs text-gray-600">
                                    <Shield className="w-4 h-4 inline mr-1" />
                                    การลงทะเบียนนี้เป็นการยืนยันว่าคุณเป็นพนักงานขององค์กร
                                    และจะใช้บัญชีนี้เพื่อวัตถุประสงค์ทางบริบทขององค์กรเท่านั้น
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`group relative w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform ${isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:scale-95 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/30'
                                    } overflow-hidden`}
                            >
                                <div className="relative flex items-center justify-center">
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                            <span>กำลังลงทะเบียน...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>ยืนยันการลงทะเบียน</span>
                                            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </>
                                    )}
                                </div>
                            </button>

                            {/* Back Button */}
                            <button
                                type="button"
                                onClick={handleBackToSearch}
                                className="w-full py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                            >
                                <ArrowLeft className="mr-2 w-5 h-5" />
                                <span>ใช้รหัสพนักงานอื่น</span>
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center space-y-2">
                        <p className="text-sm text-gray-400">
                            © 2024 SENIZENS. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-400">
                            Internal Use Only • Employee Access System
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fade-in-delay {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fade-in-delay-2 {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes bounce-slow {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0) rotate(45deg); }
                    40% { transform: translateY(-10px) rotate(45deg); }
                    60% { transform: translateY(-5px) rotate(45deg); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                
                .animate-fade-in-delay {
                    animation: fade-in-delay 0.8s ease-out 0.3s both;
                }
                
                .animate-fade-in-delay-2 {
                    animation: fade-in-delay-2 0.8s ease-out 0.6s both;
                }
                
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
                
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite;
                }

                .delay-200 {
                    animation-delay: 0.2s;
                }

                .delay-400 {
                    animation-delay: 0.4s;
                }

                .delay-500 {
                    animation-delay: 0.5s;
                }

                .delay-1000 {
                    animation-delay: 1s;
                }

                @media (max-width: 640px) {
                    .min-h-screen {
                        min-height: -webkit-fill-available;
                    }
                }

                @supports (-webkit-touch-callout: none) {
                    input[type="text"],
                    input[type="password"] {
                        font-size: 16px;
                    }
                }
            `}</style>
        </div>
    );
};

export default SenizensRegister;