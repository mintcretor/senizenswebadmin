import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SenizensLogin = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
 const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); // เคลียร์ข้อความ error เก่า

        try {
            // เปลี่ยน URL เป็น URL ของ API Login ของคุณ
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username: formData.username,
                password: formData.password
            });

            // ตรวจสอบว่า API ตอบกลับมาสำเร็จ
            const { token, user } = response.data;

            // เก็บ token และข้อมูลผู้ใช้ใน localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));

            // นำทางไปยังหน้า Dashboard
            navigate('/dashboard');

        } catch (err) {
            // หากเกิดข้อผิดพลาดในการเรียก API
            console.error("Login failed:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'การเข้าสู่ระบบล้มเหลว. กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
            {/* Left Side - Animated Background (Hidden on mobile, visible on tablet+) */}
            <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-48 h-48 lg:w-72 lg:h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-64 h-64 lg:w-96 lg:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-52 h-52 lg:w-80 lg:h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 lg:p-12 text-white">
                    <div className="max-w-md text-center space-y-6">
                        <div className="space-y-4">
                            <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-fade-in">
                                Welcome Back
                            </h1>
                            <p className="text-lg lg:text-xl text-purple-100 opacity-90 animate-fade-in-delay">
                                ยินดีต้อนรับสู่ระบบ SENIZENS
                            </p>
                        </div>
                        
                        <div className="space-y-4 text-purple-100/80 animate-fade-in-delay-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <span className="text-sm lg:text-base">ระบบจัดการที่ทันสมัย</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                                <span className="text-sm lg:text-base">ความปลอดภัยระดับสูง</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-400"></div>
                                <span className="text-sm lg:text-base">ประสบการณ์ที่เหนือกว่า</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-10 right-10 w-16 h-16 lg:w-20 lg:h-20 border border-white/10 rounded-full animate-spin-slow"></div>
                <div className="absolute bottom-20 left-10 w-12 h-12 lg:w-16 lg:h-16 border-2 border-purple-400/20 rounded-lg rotate-45 animate-bounce-slow"></div>
            </div>

            {/* Mobile Header - Only visible on mobile */}
            <div className="lg:hidden bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">SENIZENS</h1>
                    <p className="text-purple-100 text-sm sm:text-base">ระบบจัดการที่ทันสมัย</p>
                </div>
                {/* Mobile background decoration */}
                <div className="absolute top-2 right-2 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/10 rounded-full blur-lg"></div>
            </div>

            {/* Right Side - Modern Login Form */}
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative min-h-screen lg:min-h-auto">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-5 hidden lg:block">
                    <div className="absolute top-0 left-0 w-full h-full" 
                         style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)', 
                                 backgroundSize: '20px 20px'}}></div>
                </div>

                <div className="w-full max-w-sm sm:max-w-md relative z-10">
                    {/* Logo Section */}
                    <div className="text-center mb-8 lg:mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4 sm:mb-6 shadow-xl animate-fade-in">
                            <span className="text-xl sm:text-2xl font-bold text-white">S</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">เข้าสู่ระบบ</h2>
                        <p className="text-gray-500 text-sm sm:text-base px-4">กรอกข้อมูลเพื่อเข้าสู่ระบบ SENIZENS</p>
                    </div>

                    {/* Login Form */}
                    <div className="space-y-5 sm:space-y-6">
                        {/* Username Field */}
                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ชื่อผู้ใช้
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                    <User className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${
                                        focusedField === 'username' ? 'text-purple-500' : 'text-gray-400'
                                    }`} />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField('')}
                                    placeholder="กรุณากรอกชื่อผู้ใช้"
                                    className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400 hover:border-gray-300 group-hover:shadow-md text-base"
                                    autoComplete="username"
                                    inputMode="text"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                    <Lock className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${
                                        focusedField === 'password' ? 'text-purple-500' : 'text-gray-400'
                                    }`} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField('')}
                                    placeholder="กรุณากรอกรหัสผ่าน"
                                    className="block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400 hover:border-gray-300 group-hover:shadow-md text-base"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center hover:scale-110 transition-transform duration-200 touch-manipulation"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-purple-500" />
                                    ) : (
                                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-purple-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 animate-fade-in">
                                <p className="text-red-600 text-sm font-medium text-center">{error}</p>
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`group relative w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-white font-semibold text-base sm:text-lg transition-all duration-300 transform touch-manipulation ${
                                isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:scale-95 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/30'
                            } overflow-hidden`}
                            style={{ minHeight: '48px' }} // Minimum touch target for accessibility
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-center">
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-2 sm:mr-3"></div>
                                        <span>กำลังเข้าสู่ระบบ...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>เข้าสู่ระบบ</span>
                                        <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </>
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Additional Options */}
                    <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4">
                        <button 
                            className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 hover:underline text-sm sm:text-base touch-manipulation"
                            style={{ minHeight: '44px' }}
                        >
                            ลืมรหัสผ่าน?
                        </button>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-gray-500">
                            <span>ยังไม่มีบัญชี?</span>
                            <button 
                                className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 touch-manipulation"
                                style={{ minHeight: '44px' }}
                            >
                                สมัครสมาชิก
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-gray-400">
                        <p>© 2024 SENIZENS. All rights reserved.</p>
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

                /* Mobile-specific optimizations */
                @media (max-width: 640px) {
                    .min-h-screen {
                        min-height: -webkit-fill-available;
                    }
                }

                /* Prevent zoom on input focus in iOS */
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

export default SenizensLogin;