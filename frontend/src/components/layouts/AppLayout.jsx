// frontend/src/components/layouts/AppLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu } from 'lucide-react';

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-200">
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-regular text-gray-800">
                                {user ? `ยินดีต้อนรับ, ${user.e_name}` : 'Dashboard'}
                            </h1>
                            <p className="text-sm text-gray-500">{user ? `(แผนก: ${user.position})` : ''}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-700 text-white font-regular py-2 px-4 rounded">
                        <LogOut size={18} /> ออกจากระบบ
                    </button>
                </header>
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
                    <Outlet /> {/* <-- หน้าลูกๆ จะถูกแสดงที่นี่ */}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;