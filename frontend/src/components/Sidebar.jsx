// frontend/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MENU_CONFIG } from '../config/menuConfig';
import { TreePalm } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
    const { user } = useAuth();
    // ใช้ Optional Chaining (?) เพื่อป้องกัน Error ถ้า user ยังโหลดไม่เสร็จ
    const menuSections = MENU_CONFIG[user?.e_role] || [];

    const navLinkClass = ({ isActive }) =>
        `flex items-center p-3 text-sm rounded-lg transition-colors ${
            !isOpen ? 'justify-center' : ''
        } ${
            isActive
                ? 'bg-orange-500 text-white shadow-md' // Active State (สีส้ม)
                // ★★★ FIX: ปรับสี Text และ Icon ใน Dark Mode ★★★
                : 'text-gray-800 hover:bg-orange-50 hover:text-orange-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-orange-400' 
        }`;

    return (
        <aside
            // ★★★ FIX: Dark Mode BG for aside ★★★
            className={`bg-white flex flex-col transition-all duration-300 ${
                isOpen ? 'w-60' : 'w-20'
            } z-20 shadow-lg dark:bg-gray-800`}
        >
            {/* ===== LOGO ===== */}
            <div className="flex items-center justify-center p-4 h-16 border-b border-gray-100 dark:border-gray-700">
                <div
                    className={`flex items-center gap-3 ${
                        !isOpen ? 'scale-0 w-0' : 'w-auto'
                    } transition-transform duration-300 ease-in-out`}
                >
                    <TreePalm
                        className="text-green-600 flex-shrink-0 transition-all duration-300"
                        size={isOpen ? 28 : 32}
                    />
                    <span className="font-semibold text-2xl whitespace-nowrap text-gray-800 dark:text-white"> {/* ★★★ FIX: Dark Mode Text ★★★ */}
                        EasyPalm
                    </span>
                </div>
                {!isOpen && (
                    <TreePalm
                        className="text-green-600 transition-all duration-300"
                        size={32}
                    />
                )}
            </div>

            {/* ===== MENU ===== */}
            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto border-t border-gray-100 mt-4 pt-4 dark:border-gray-700">
                {menuSections.map((section) => (
                    <div key={section.title}>
                        <p
                            // ★★★ FIX: ปรับสี Text ของ Section Title ใน Dark Mode ★★★
                            className={`px-3 text-xs text-gray-500 whitespace-nowrap dark:text-gray-400 ${
                                !isOpen ? 'hidden' : ''
                            }`}
                        >
                            {section.title}
                        </p>
                        <div className="mt-2 space-y-1">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={navLinkClass}
                                >
                                    {/* ★★★ FIX: Icon color is inherited from NavLink class (current text color) ★★★ */}
                                    <item.icon
                                        className={`${
                                            isOpen
                                                ? 'w-8 h-8 scale-95'
                                                : 'w-10 h-10 scale-100'
                                        } transition-all duration-300 ease-in-out`}
                                    />
                                    <span
                                        className={`ml-4 whitespace-nowrap ${
                                            !isOpen && 'hidden'
                                        }`}
                                    >
                                        {item.text}
                                    </span>
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