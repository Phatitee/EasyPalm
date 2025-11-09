// frontend/src/pages/main/EasyPalmLogin.jsx (PREMIUM VERSION)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, User, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import palmLeafImage from '../../components/Gemini_Generated_Image_y930e8y930e8y930-removebg.png';

const EasyPalmLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login ไม่สำเร็จ');
            }
            
            login(data.user);

            // Navigate based on user role
            switch (data.user.e_role) {
                case 'admin': navigate('/admin/employees'); break;
                case 'purchasing': navigate('/purchasing/create-po'); break;
                case 'warehouse': navigate('/warehouse/pending-storage'); break;
                case 'sales': navigate('/sales/create-so'); break;
                case 'accountant': navigate('/accountant/po-payments'); break;
                case 'executive': navigate('/executive/dashboard'); break;
                default: navigate('/login');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left Side: Branding */}
                <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 p-12">
                    {/* Logo with Glow */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full blur-3xl opacity-30 animate-pulse" />
                        <img 
                            src={palmLeafImage} 
                            alt="EasyPalm Logo" 
                            className="relative w-64 h-auto drop-shadow-2xl transform hover:scale-110 transition-transform duration-500" 
                        />
                    </div>

                    {/* Brand Text */}
                    <div className="space-y-4">
                  
                        <div className="flex items-center justify-center gap-2">
                
                         
                        </div>
                        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                            ระบบจัดการสวนปาล์มครบวงจร เพิ่มประสิทธิภาพการทำงาน ด้วยเทคโนโลยีที่ทันสมัย
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-6 pt-8">
                        {[
                            { label: 'ปลอดภัย', icon: ShieldCheck },
                            { label: 'รวดเร็ว', icon: Sparkles },
                            { label: 'ครบวงจร', icon: LogIn }
                        ].map((feature, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-8 h-8 text-emerald-600" />
                                </div>
                                <p className="text-sm text-gray-600 font-medium">{feature.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <img src={palmLeafImage} alt="EasyPalm Logo" className="w-24 h-auto mx-auto mb-4" />
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                EasyPalm
                            </h1>
                        </div>

                        {/* Form Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">ยินดีต้อนรับกลับ 👋</h2>
                            <p className="text-gray-500">เข้าสู่ระบบเพื่อเริ่มต้นการทำงาน</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Username Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700" htmlFor="username">
                                    ชื่อผู้ใช้
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 outline-none"
                                        placeholder="กรอกชื่อผู้ใช้"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
                                    รหัสผ่าน
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 outline-none"
                                        placeholder="กรอกรหัสผ่าน"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        {showPassword ? 
                                            <EyeOff className="w-5 h-5 text-gray-400" /> : 
                                            <Eye className="w-5 h-5 text-gray-400" />
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl animate-shake">
                                    <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    w-full px-6 py-4
                                    bg-gradient-to-r from-emerald-500 to-teal-600
                                    hover:from-emerald-600 hover:to-teal-700
                                    disabled:from-gray-400 disabled:to-gray-500
                                    text-white font-bold rounded-2xl
                                    shadow-xl shadow-emerald-500/30
                                    hover:shadow-2xl hover:shadow-emerald-500/50
                                    transform transition-all duration-300
                                    hover:scale-[1.02] active:scale-[0.98]
                                    disabled:cursor-not-allowed disabled:hover:scale-100
                                    flex items-center justify-center gap-3
                                    relative overflow-hidden
                                    group
                                "
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>กำลังเข้าสู่ระบบ...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        <span>เข้าสู่ระบบ</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                                {/* Button Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <p className="text-sm text-gray-500">
                                ไม่ใช่พนักงาน? {' '}
                                <a href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                                    กลับสู่หน้าหลัก
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>การเข้าสู่ระบบปลอดภัยด้วย SSL Encryption</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EasyPalmLogin;

/* Add to your global CSS */
/*
@keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}

.animate-blob {
    animation: blob 7s infinite;
}

.animation-delay-2000 {
    animation-delay: 2s;
}

.animation-delay-4000 {
    animation-delay: 4s;
}

.animate-shake {
    animation: shake 0.5s ease-in-out;
}
*/