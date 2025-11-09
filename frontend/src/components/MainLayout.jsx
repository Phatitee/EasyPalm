// src/components/MainLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex justify-between items-center p-4 bg-white border-b">
                    <div>
                        {/* You can add Breadcrumbs or Page Title here */}
                        <h1 className="text-xl font-medium">ยินดีต้อนรับ, สมศรี ฝ่ายขาย</h1>
                    </div>
                    <div>
                        <button className="font-semibold p-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                            ออกจากระบบ
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    {/* The actual page content will be rendered here */}
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;