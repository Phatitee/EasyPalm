// frontend/src/components/Layout.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ user, children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // ล้างข้อมูล user ออกจาก State และ localStorage
        localStorage.removeItem('user');
        alert('ออกจากระบบสำเร็จ');
        navigate('/login'); // กลับไปหน้า login
        window.location.reload(); // รีเฟรชเพื่อให้ State user ใน App.js เป็น null
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="p-4 text-xl font-bold border-b border-gray-700">
                    EasyPalm
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <p className="px-2 text-xs text-gray-400">ธุรกรรมหลัก</p>
                    <Link to="/purchase" className="block px-2 py-2 text-sm rounded hover:bg-gray-700">รับซื้อสินค้า</Link>
                    <Link to="/sell" className="block px-2 py-2 text-sm rounded hover:bg-gray-700">ขายสินค้า</Link>

                    <p className="px-2 pt-4 text-xs text-gray-400">รายการ</p>
                    <Link to="/purchase-history" className="block px-2 py-2 text-sm rounded hover:bg-gray-700">ประวัติการซื้อ</Link>
                    <Link to="/sales-history" className="block px-2 py-2 text-sm rounded hover:bg-gray-700">ประวัติการขาย</Link>

                    <p className="px-2 pt-4 text-xs text-gray-400">ข้อมูล</p>
                    <Link to="/stock" className="block px-2 py-2 text-sm rounded hover:bg-gray-700">ตรวจสอบสต็อก</Link>
                    <Link to="/farmers" className="block px-2 py-2 text-sm rounded hover:bg-gray-700">ข้อมูลเกษตรกร</Link>
                    <Link to="/industry" className="block px-2 py-2 text-sm rounded hover:bg-gray-700">ข้อมูลโรงงานลูกค้า</Link>

                    <p className="px-2 pt-4 text-xs text-gray-400">การเงิน</p>
                    <Link to="/payments" className="block px-2 py-2 text-sm rounded hover:bg-gray-700">จัดการชำระเงิน</Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md p-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-semibold">
                            {user ? `ยินดีต้อนรับ, ${user.e_name}` : 'Sales Dashboard'}
                        </h1>
                        <p className="text-sm text-gray-500">{user ? `(Role: ${user.e_role})` : ''}</p>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        ออกจากระบบ
                    </button>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;