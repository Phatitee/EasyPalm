// src/components/Sidebar.jsx
import React from 'react';
import { LayoutDashboard, ShoppingCart, DollarSign, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

// สร้างข้อมูลเมนูเพื่อให้จัดการง่าย
const menuItems = [
    { icon: LayoutDashboard, text: 'ภาพรวมหลัก', path: '/' },
    { icon: ShoppingCart, text: 'รับซื้อสินค้า', path: '/purchase' },
    { icon: DollarSign, text: 'ขายสินค้า', path: '/sell' },
    { icon: FileText, text: 'รายการ', path: '/transactions' },
    { icon: Settings, text: 'ตั้งค่า', path: '/settings' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <aside 
            className={`
                bg-[#111827] text-gray-200 flex flex-col 
                transition-all duration-300 ease-in-out
                ${isOpen ? 'w-64' : 'w-20'}
            `}
        >
            {/* Logo and Toggle Button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16">
                <span className={`font-regular text-xl whitespace-nowrap ${!isOpen && 'hidden'}`}>
                    EasyPalm
                </span>
                <button 
                    onClick={toggleSidebar} 
                    className="p-2 rounded-full hover:bg-gray-700"
                >
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 py-4 space-y-2">
                {menuItems.map((item, index) => (
                    <a 
                        key={index} 
                        href={item.path} 
                        className={`
                            flex items-center p-3 rounded-lg hover:bg-gray-700
                            ${item.text === 'รับซื้อสินค้า' ? 'bg-gray-900' : ''} // Active state example
                        `}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${!isOpen && 'hidden'}`}>
                            {item.text}
                        </span>
                    </a>
                ))}
            </nav>

            {/* Sidebar Footer (Optional) */}
            <div className="p-4 border-t border-gray-700">
                {/* You can add user profile or other info here */}
            </div>
        </aside>
    );
};

export default Sidebar;