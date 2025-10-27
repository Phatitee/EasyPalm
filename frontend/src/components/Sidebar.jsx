// frontend/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MENU_CONFIG } from '../config/menuConfig'; // <-- 1. Import พิมพ์เขียวเมนู
import { TreePalm } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
    const { user } = useAuth();

    // 2. ดึงเมนูที่ถูกต้องสำหรับ Role ปัจจุบัน, ถ้าไม่เจอให้ใช้ Array ว่าง
    const menuSections = MENU_CONFIG[user?.e_role] || [];

    const navLinkClass = ({ isActive }) =>
        `flex items-center p-3 text-sm rounded-lg transition-colors ${!isOpen ? 'justify-center' : ''} ${
            isActive
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-800 hover:bg-orange-50 hover:text-orange-700'
        }`;

    return (
        <aside className={`bg-white flex flex-col transition-all duration-300 ${isOpen ? 'w-60' : 'w-20'} z-20 shadow-lg`}>
            <div className="flex items-center justify-center p-4 h-16">
                <div className={`flex items-center gap-3 ${!isOpen ? 'scale-0 w-0' : 'w-auto'} transition-transform duration-200`}>
                    <TreePalm className="text-green-600 flex-shrink-0" size={32} />
                    <span className="font-semibold text-2xl whitespace-nowrap text-gray-800">EasyPalm</span>
                </div>
                {!isOpen && (
                    <TreePalm className="text-green-600" size={32} />
                )}
            </div>

            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto border-t border-gray-100 mt-4 pt-4">
                {menuSections.map(section => (
                    <div key={section.title}>
                        <p className={`px-3 text-xs text-gray-500 whitespace-nowrap ${!isOpen ? 'hidden' : ''}`}>{section.title}</p>
                        <div className="mt-2 space-y-1">
                            {section.items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={navLinkClass}
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
    );
};

export default Sidebar;