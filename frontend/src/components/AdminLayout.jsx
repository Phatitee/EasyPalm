// frontend/src/components/AdminLayout.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, FileText, DollarSign, LogOut } from 'lucide-react';

const AdminLayout = ({ user, children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        alert('ออกจากระบบสำเร็จ');
        navigate('/login');
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-4 text-xl font-bold border-b border-slate-700">
                    EasyPalm (Admin)
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-2 py-2 text-sm rounded hover:bg-slate-700">
                        <FileText size={18} /> ภาพรวมระบบ
                    </Link>
                    <Link to="/admin/employees" className="flex items-center gap-3 px-2 py-2 text-sm rounded hover:bg-slate-700">
                        <Users size={18} /> จัดการพนักงาน
                    </Link>
                     <Link to="/products" className="flex items-center gap-3 px-2 py-2 text-sm rounded hover:bg-slate-700">
                       <DollarSign size={18} /> จัดการราคาสินค้า
                    </Link>

                    {/* เอาไว้ลบ */}
                    <Link to="/admin/warehouse-management" className="flex items-center gap-3 px-2 py-2 text-sm rounded hover:bg-slate-700">
                       <Users size={18} /> จัดการคลังสินค้า
                    </Link>



                    {/* สามารถเพิ่มเมนูอื่นๆ สำหรับ Admin ได้ที่นี่ */}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md p-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-semibold">Admin Control Panel</h1>
                        <p className="text-sm text-gray-500">ยินดีต้อนรับ, {user?.e_name}</p>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
                        <LogOut size={18} /> ออกจากระบบ
                    </button>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;