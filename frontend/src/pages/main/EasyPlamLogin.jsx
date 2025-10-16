import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react'; // 1. Import ไอคอนที่ต้องการเข้ามา

// รับ props ที่ชื่อ setUser จาก App.js
const EasyPlamLogin = ({ setUser }) => {
    // 2. สร้าง State ทั้งหมดที่จำเป็น
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false); // State สำหรับ "จำฉันไว้"
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://127.0.0.1:5000/login', {
                username,
                password,
            });
            
            console.log('Login สำเร็จ:', response.data);
            
            // นำข้อมูล user ที่ได้จาก Backend มาเก็บใน State หลักของ App.js
            setUser(response.data.user);
            
            // (ทางเลือก) เก็บข้อมูล user ลงใน localStorage เพื่อให้ login ค้างไว้แม้จะรีเฟรชหน้า
            localStorage.setItem('user', JSON.stringify(response.data.user));

            alert('Login สำเร็จ!');

            // ตรวจสอบ Role แล้วส่งไปยังหน้าที่ถูกต้อง
            const userRole = response.data.user.e_role;
            if (userRole === 'Admin' || userRole === 'Manager') {
                navigate('/admin/dashboard'); 
            } else if (userRole === 'Sales' || userRole === 'Finance') {
                navigate('/purchase'); 
            } else if (userRole === 'Finance') { // <--- เพิ่มส่วนนี้
                navigate('/payments');}
              else {
                navigate('/'); // ถ้าไม่มี Role ที่ตรงกัน ให้กลับไปหน้าแรก
            }

        } catch (err) {
            console.error('Login ล้มเหลว:', err);
            if (err.response && err.response.data) {
                setError(err.response.data.message);
            } else {
                setError('ไม่สามารถเชื่อมต่อ Server ได้');
            }
        }
    };

    // ส่วน JSX ของคุณเหมือนเดิม แต่ตอนนี้จะหา User, Lock, LogIn เจอแล้ว
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">เข้าสู่ระบบ</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            ชื่อผู้ใช้
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <User className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Username"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            รหัสผ่าน
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="******************"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic">{error}</p>}
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <label className="flex items-center text-sm text-gray-600">
                            <input
                                className="mr-2 leading-tight"
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            <span className="text-sm">จำฉันไว้ในระบบ</span>
                        </label>
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center gap-2"
                            type="submit"
                        >
                            <LogIn className="h-5 w-5" />
                            เข้าสู่ระบบ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// 3. export default เพื่อให้ไฟล์อื่นนำไปใช้ได้
export default EasyPlamLogin;