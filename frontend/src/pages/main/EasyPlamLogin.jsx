// frontend/src/pages/main/EasyPlamLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, User, Lock } from 'lucide-react';
import palmLeafImage from '../../components/Gemini_Generated_Image_y930e8y930e8y930-removebg.png'; // Import the image

const EasyPlamLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true); // Start loading

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
                case 'admin':
                    navigate('/admin/employees');
                    break;
                case 'purchasing':
                    navigate('/purchasing/create-po');
                    break;
                case 'warehouse':
                    navigate('/warehouse/pending-storage');
                    break;
                case 'sales':
                    navigate('/sales/create-so');
                    break;
                case 'accountant':
                    navigate('/accountant/po-payments');
                    break;
                case 'executive':
                    navigate('/executive/dashboard');
                    break;
                default:
                    navigate('/login');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                
                {/* Left Side: Branding and Image */}
                <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-200 p-12 text-center">
                    <img src={palmLeafImage} alt="EasyPalm Logo" className="w-48 h-auto" />
                    <h1 className="text-4xl font-bold text-green-800 mt-4">EasyPalm</h1>
                    <p className="text-gray-600 mt-2">ระบบจัดการสวนปาล์มครบวงจร</p>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="md:hidden text-center mb-8">
                        <img src={palmLeafImage} alt="EasyPalm Logo" className="w-24 h-auto mx-auto" />
                        <h1 className="text-3xl font-bold text-green-800 mt-2">EasyPalm</h1>
                    </div>
                
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">เข้าสู่ระบบ</h2>
                    <p className="text-gray-500 mb-8">สำหรับพนักงานและผู้ดูแลระบบ</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="username">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 flex items-center justify-center gap-2"
                        >
                            <LogIn size={20} />
                            {loading ? 'กำลังตรวจสอบ...' : 'Login'}
                        </button>
                    </form>
                     <p className="text-center text-sm text-gray-400 mt-8">
                        ไม่ใช่พนักงาน? <a href="/" className="text-green-600 hover:underline">กลับสู่หน้าหลัก</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EasyPlamLogin;