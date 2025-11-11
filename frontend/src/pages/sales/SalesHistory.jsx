// frontend/src/pages/sales/SalesHistory.jsx (FIXED)

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, List, Loader, ServerCrash, Inbox } from 'lucide-react';
import SalesHistoryDetail from './SalesHistoryDetail'; // Import the modal component

// 1. ★★★ Import ฟังก์ชันจาก api.js ★★★
import { getSalesOrders } from '../../services/api';

// 2. ★★★ ลบ API_URL ทิ้งไป ★★★
// const API_URL = process.env.REACT_APP_API_URL;

const SalesHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for filtering and searching
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // State for modal
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchSalesHistory = useCallback(async () => {
        setLoading(true);
        try {
            // 3. ★★★ แก้ไข: สร้าง params เป็น Object ธรรมดา ★★★
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (statusFilter) params.status = statusFilter;

            // 4. ★★★ แก้ไข: เรียกใช้ getSalesOrders จาก api.js ★★★
            const data = await getSalesOrders(params);
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSalesHistory();
        }, 500); // Debounce search input
        return () => clearTimeout(timer);
    }, [fetchSalesHistory]);

    const handleRowClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
    };

    const getStatusChip = (status) => {
        // Chip uses fixed light colors - OK for visibility in Dark Mode
        switch (status) {
            case 'Paid': return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">ชำระเงินแล้ว</span>;
            case 'Unpaid': return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">ยังไม่ชำระ</span>;
            default: return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        // ★★★ Dark Mode FIX: Main Container Background ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <List className="mr-3 text-blue-600 dark:text-blue-400" />
                ประวัติการขาย
            </h1>

            {/* Search and Filter Controls */}
            {/* ★★★ Dark Mode FIX: Panel Background and Shadow ★★★ */}
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center transition-colors duration-300">
                <div className="relative w-full md:w-2/3">
                    {/* ★★★ Dark Mode FIX: Search Icon Color ★★★ */}
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตามเลขที่ SO หรือชื่อลูกค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        // ★★★ Dark Mode FIX: Search Input Styling ★★★
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                </div>
                <div className="relative w-full md:w-1/3">
                    {/* ★★★ Dark Mode FIX: Filter Icon Color ★★★ */}
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        // ★★★ Dark Mode FIX: Select Input Styling ★★★
                        className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="">สถานะทั้งหมด</option>
                        <option value="Paid">ชำระเงินแล้ว</option>
                        <option value="Unpaid">ยังไม่ชำระ</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                // ★★★ Dark Mode FIX: Loading State ★★★
                <div className="flex justify-center items-center h-64 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /></div>
            ) : error ? (
                // ★★★ Dark Mode FIX: Error State ★★★
                <div className="flex flex-col justify-center items-center h-64 text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>
            ) : orders.length === 0 ? (
                // ★★★ Dark Mode FIX: Empty State Background and Text ★★★
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                    <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">ไม่พบข้อมูล</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">ไม่พบรายการขายที่ตรงกับเงื่อนไขการค้นหาของคุณ</p>
                </div>
            ) : (
                // ★★★ Dark Mode FIX: Table Container Background and Shadow ★★★
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* ★★★ Dark Mode FIX: Table Header Background and Text ★★★ */}
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">เลขที่ SO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ลูกค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">วันที่</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ยอดรวม</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">สถานะชำระเงิน</th>
                                </tr>
                            </thead>
                            {/* ★★★ Dark Mode FIX: Table Body Background and Divider ★★★ */}
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map(order => (
                                    <tr key={order.sale_order_number} onClick={() => handleRowClick(order.sale_order_number)} className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150">
                                        {/* ★★★ Dark Mode FIX: Text Colors ★★★ */}
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{order.sale_order_number}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{order.customer_name}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(order.s_date + 'Z').toLocaleString('th-TH', {
                                            year: '2-digit', month: '2-digit', day: '2-digit',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-gray-200">{parseFloat(order.s_total_price).toLocaleString('th-TH')} บาท</td>
                                        <td className="px-6 py-4 text-center">{getStatusChip(order.payment_status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isDetailModalOpen && <SalesHistoryDetail orderId={selectedOrderId} onClose={() => setIsDetailModalOpen(false)} />}
        </div>
    );
};

export default SalesHistory;