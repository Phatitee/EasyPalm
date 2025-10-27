// frontend/src/pages/main/EasyPlamLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // <-- 1. Import useAuth

const EasyPlamLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // <-- 2. เรียกใช้ useNavigate
    const { login } = useAuth();    // <-- 3. ดึงฟังก์ชัน login จาก Context

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

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

            // --- 4. (จุดแก้ไขหลัก) ---
            // ใช้ฟังก์ชัน login จาก Context เพื่อเก็บข้อมูล user และบันทึกลง localStorage
            login(data.user);

            // สั่งเปลี่ยนหน้าตาม Role ของ user
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
                    navigate('/login')
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">EasyPalm Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EasyPlamLogin;