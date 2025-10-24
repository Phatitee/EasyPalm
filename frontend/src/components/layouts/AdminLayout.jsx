// frontend/src/components/AdminLayout.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    Users, FileText, DollarSign, LogOut, Menu, TreePalm 
} from 'lucide-react';

const adminMenuItems = [
    { icon: FileText, text: 'ภาพรวมระบบ', path: '/admin/dashboard' },
    { icon: Users, text: 'จัดการพนักงาน', path: '/admin/employees' },
    { icon: DollarSign, text: 'จัดการราคาสินค้า', path: '/products' },
];

const AdminLayout = ({ user, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        alert('ออกจากระบบสำเร็จ');
        navigate('/login');
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* --- Admin Sidebar --- */}
            <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} z-20 shadow-lg`}>
                <div className="flex items-center justify-center p-4 h-16">
                    
                    {/* --- START: ส่วนที่แก้ไข --- */}
                    {/* โลโก้และชื่อแอปสำหรับ Admin (เมื่อ Sidebar เปิด) */}
                    <div className={`flex items-center gap-3 ${!isOpen ? 'scale-0 w-0' : 'w-auto'} transition-transform duration-200`}>
                        {/* 2. ใช้ไอคอน TreePalm แทน img */}
                        <TreePalm className="text-blue-400 flex-shrink-0" size={32} />
                        <span className="font-bold text-2xl whitespace-nowrap">Admin Panel</span>
                    </div>
                    {/* โลโก้ (เมื่อ Sidebar ปิด) */}
                    {!isOpen && (
                         <TreePalm className="text-blue-400" size={32} />
                    )}
                    {/* --- END: ส่วนที่แก้ไข --- */}

                </div>

                <nav className="flex-1 px-3 py-4 space-y-2 border-t border-slate-700 mt-4 pt-4">
                    {adminMenuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `flex items-center p-3 text-sm rounded-lg hover:bg-slate-700 ${isActive ? 'bg-slate-700' : ''} ${!isOpen ? 'justify-center' : ''}`}
                        >
                            <item.icon size={20} />
                            <span className={`ml-4 whitespace-nowrap ${!isOpen && 'hidden'}`}>{item.text}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* --- Main Content --- */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-200">
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold">Admin Control Panel</h1>
                            <p className="text-sm text-gray-500">ยินดีต้อนรับ, {user?.e_name}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
                        <LogOut size={18} /> ออกจากระบบ
                    </button>
                </header>
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;