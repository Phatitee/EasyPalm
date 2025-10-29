// frontend/src/components/layouts/AppLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext'; // ✅ import hook theme

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme(); // ✅ ใช้งาน theme context
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-10 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        {/* ปุ่มเมนู */}
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <Menu size={24} className="text-gray-800 dark:text-gray-100" /> 
                        </button>

                        {/* ข้อความต้อนรับ */}
                        <div>
                            <h1 className="text-xl font-regular text-gray-800 dark:text-gray-100">
                                {user ? `ยินดีต้อนรับ, ${user.e_name}` : 'Dashboard'}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user ? `(แผนก: ${user.position})` : ''}
                            </p>
                        </div>
                    </div>

                    {/* ปุ่มด้านขวา */}
                    <div className="flex items-center gap-3">
                        {/* ✅ ปุ่มสลับธีม */}
                        <button 
                            onClick={toggleTheme} 
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            title={theme === 'light' ? 'เปิดโหมดมืด' : 'เปิดโหมดสว่าง'}
                        >
                            {theme === 'light' ? (
                                <Moon size={20} className="text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Sun size={20} className="text-yellow-400" />
                            )}
                        </button>

                        {/* ปุ่มออกจากระบบ */}
                        <button 
                            onClick={handleLogout} 
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-700 text-white font-regular py-2 px-4 rounded"
                        >
                            <LogOut size={18} /> ออกจากระบบ
                        </button>
                    </div>
                </header>

                {/* ส่วนเนื้อหา */}
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    <Outlet /> {/* <-- หน้าลูกๆ จะถูกแสดงที่นี่ */}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
