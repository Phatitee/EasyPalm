// frontend/src/components/Layout.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    ShoppingCart, DollarSign, FileText, Package, Users, BarChart2, Banknote,
    LogOut, Menu, TreePalm, 
    Factory
} from 'lucide-react';

const menuSections = [
    {
        title: 'ธุรกรรมหลัก',
        items: [
            { icon: ShoppingCart, text: 'รับซื้อสินค้า', path: '/purchase' },
            { icon: DollarSign, text: 'ขายสินค้า', path: '/sell' },
        ]
    },
    {
        title: 'รายการ',
        items: [
            { icon: FileText, text: 'ประวัติการซื้อ', path: '/purchase-history' },
        ]
    },
    {
        title: 'ข้อมูล',
        items: [
            { icon: Package, text: 'ตรวจสอบสต็อก', path: '/stock' },
            { icon: BarChart2, text: 'จัดการราคาสินค้า', path: '/products' },
            { icon: Users, text: 'ข้อมูลเกษตรกร', path: '/farmers' },
            { icon: Factory, text: 'ข้อมูลโรงงานลูกค้า', path: '/industry' },
        ]
    },
    {
        title: 'การเงิน',
        items: [
            { icon: Banknote, text: 'จัดการชำระเงิน', path: '/payments' },
        ]
    }
];

const Layout = ({ user, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        alert('ออกจากระบบสำเร็จ');
        navigate('/mainpage');
        window.location.reload();
    };

    return (

        <div className="flex h-screen bg-gray-100"> 

            <aside className={`bg-white flex flex-col transition-all duration-300 ${isOpen ? 'w-60' : 'w-20'} z-20 shadow-lg`}>
                <div className="flex items-center justify-center p-4 h-16">
                    
                    <div className={`flex items-center gap-3 ${!isOpen ? 'scale-0 w-0' : 'w-auto'} transition-transform duration-200`}>
                        {/* เปลี่ยนสีไอคอนโลโก้ให้ชัดขึ้น */}
                        <TreePalm className="text-green-600 flex-shrink-0" size={32} /> 
                        <span className="font-semibold text-2xl whitespace-nowrap text-gray-800">EasyPalm</span>
                    </div>

                    {!isOpen && (
                         <TreePalm className="text-green-600" size={32} />
                    )} 

                </div>

                {/* แก้ไขสี border ให้สวยงามขึ้น */}
                <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto border-t border-gray-100 mt-4 pt-4">
                    {menuSections.map(section => (
                        <div key={section.title}>
                             <p className={`px-3 text-xs text-gray-500 whitespace-nowrap ${!isOpen ? 'hidden' : ''}`}>{section.title}</p>
                            <div className="mt-2 space-y-1">
                                {section.items.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}

                                        className={({ isActive }) => 
                                            `flex items-center p-3 text-sm rounded-lg transition-colors ${!isOpen ? 'justify-center' : ''} ${
                                                isActive 
                                                ? 'bg-orange-500 text-white shadow-md' 
                                                : 'text-gray-800 hover:bg-orange-50 hover:text-orange-700'
                                            }`
                                        }
                                    >
                                        <item.icon size={20} />
                                        <span className={`ml-4 whitespace-nowrap ${!isOpen && 'hidden'}`}>{item.text}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* --- Main Content --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-200">
                             <Menu size={24} />
                        </button>
                        <div>
                            {/* เพิ่มสี text-gray-800 ให้ชัดเจน */}
                            <h1 className="text-xl font-regular text-gray-800">
                                {user ? `ยินดีต้อนรับ, ${user.e_name}` : 'Sales Dashboard'}
                            </h1>
                            <p className="text-sm text-gray-500">{user ? `(Role: ${user.e_role})` : ''}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-700 text-white font-regular py-2 px-4 rounded">
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

export default Layout;