import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SenizensLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate login API call
        setTimeout(() => {
            setIsLoading(false);
            
            // เก็บ token หรือ user data ใน localStorage หรือ state management
            localStorage.setItem('authToken', 'your-jwt-token');
            localStorage.setItem('user', JSON.stringify({
                username: formData.username,
                loginTime: new Date().toISOString()
            }));
            
            // นำทางไปยังหน้า Dashboard
            navigate('/dashboard');
        }, 2000);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image */}
            <div className="flex-1 relative">
                {/* Background Image */}
                <div
                    className="h-full bg-cover bg-center bg-no-repeat relative"
                    style={{
                        backgroundImage: `url('/images/senizens.png')`
                    }}
                >

                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-50 h-50 ">
                            <img src="/images/logo.png"  />
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Username"
                                    className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="password"
                                    className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`w-full py-4 px-4 rounded-xl text-white font-medium transition-all duration-200 ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transform hover:scale-105'
                                }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    กำลังเข้าสู่ระบบ...
                                </div>
                            ) : (
                                'เข้าสู่ระบบ'
                            )}
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>© 2024 SENIZENS. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SenizensLogin;