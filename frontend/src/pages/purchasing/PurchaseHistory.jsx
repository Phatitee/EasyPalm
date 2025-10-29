// frontend/src/pages/purchasing/PurchaseHistory.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, List, Loader, ServerCrash, Inbox } from 'lucide-react';
import PurchaseHistoryDetail from './PurchaseHistoryDetail'; // Import the new modal

const PurchaseHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchPurchaseHistory = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);
            
            const response = await fetch(`http://127.0.0.1:5000/purchaseorders?${params.toString()}`);
            if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลประวัติการสั่งซื้อได้');
            
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPurchaseHistory();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchPurchaseHistory]);

    const handleRowClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
    };

    const getStatusChip = (status, type) => {
        // ใช้สี Light Mode สำหรับ Chip เพื่อเน้นสถานะให้ชัดเจนทั้งใน Light และ Dark Mode
        const colors = {
            payment: { Paid: "bg-green-100 text-green-800", Unpaid: "bg-red-100 text-red-800" },
            stock: { Completed: "bg-blue-100 text-blue-800", Pending: "bg-yellow-100 text-yellow-800", 'Not Received': "bg-gray-100 text-gray-800" }
        };
        const text = { 'Not Received': 'ยังไม่ได้รับ', Pending: 'รอรับเข้าคลัง', Completed: 'รับเข้าคลังแล้ว', Paid: 'จ่ายแล้ว', Unpaid: 'ยังไม่จ่าย' };
        return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colors[type][status]}`}>{text[status] || status}</span>;
    };

    return (
        // ★★★ FIX 1: พื้นหลังหน้าหลักและสี Text Default ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center dark:text-gray-100">
                {/* ★★★ FIX 2: ปรับสี Icon ★★★ */}
                <List className="mr-3 text-purple-600 dark:text-purple-400"/>
                ประวัติการสั่งซื้อ
            </h1>

            {/* Filter and Search Panel */}
            {/* ★★★ FIX 3: Panel Background ★★★ */}
            <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center dark:bg-gray-800 transition-colors duration-300">
                {/* Search Input */}
                <div className="relative w-full md:w-2/3">
                    {/* ★★★ FIX 4: Search Icon Color ★★★ */}
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input type="text" placeholder="ค้นหาตามเลขที่ PO หรือชื่อเกษตรกร..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        // ★★★ FIX 5: Input Field Styling ★★★
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                </div>
                {/* Status Filter */}
                <div className="relative w-full md:w-1/3">
                    {/* ★★★ FIX 6: Filter Icon Color ★★★ */}
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} 
                        // ★★★ FIX 7: Select Field Styling ★★★
                        className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="">สถานะทั้งหมด</option>
                        <option value="Unpaid">ยังไม่จ่าย</option>
                        <option value="Paid">จ่ายแล้ว</option>
                        <option value="Pending">รอรับเข้าคลัง</option>
                        <option value="Completed">รับเข้าคลังแล้ว</option>
                    </select>
                </div>
            </div>

            {loading ? (
                 // ★★★ FIX 8: Loading State ★★★
                 <div className="flex justify-center items-center h-64 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /></div>
            ) : error ? (
                // ★★★ FIX 9: Error State ★★★
                <div className="flex flex-col justify-center items-center h-64 text-red-600 bg-white dark:bg-gray-800 dark:text-red-400 p-10 rounded-lg shadow-lg">
                    <ServerCrash size={48} className="mb-4" /> 
                    <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2>
                    <p className="dark:text-gray-300">{error}</p>
                </div>
            ) : orders.length === 0 ? (
                // ★★★ FIX 10: Empty State Background และ Text ★★★
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg dark:bg-gray-800 transition-colors duration-300">
                    <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">ไม่พบข้อมูล</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">ไม่พบรายการสั่งซื้อที่ตรงกับเงื่อนไข</p>
                </div>
            ) : (
                // Main Table
                // ★★★ FIX 11: Table Container Background และ Divider ★★★
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-800 transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             {/* ★★★ FIX 12: Table Header Background และ Text ★★★ */}
                             <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">เลขที่ PO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">เกษตรกร</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">วันที่</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">ยอดรวม</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-300">สถานะ</th>
                                </tr>
                            </thead>
                            {/* ★★★ FIX 13: Table Body Background และ Divider ★★★ */}
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {orders.map(order => (
                                    // ★★★ FIX 14: Table Row Hover และ Text Colors ★★★
                                    <tr key={order.purchase_order_number} onClick={() => handleRowClick(order.purchase_order_number)} 
                                        className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{order.purchase_order_number}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{order.farmer_name}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(order.b_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-gray-200">{parseFloat(order.b_total_price).toLocaleString('th-TH')} บาท</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                {getStatusChip(order.payment_status, 'payment')}
                                                {getStatusChip(order.stock_status, 'stock')}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {isDetailModalOpen && <PurchaseHistoryDetail orderId={selectedOrderId} onClose={() => setIsDetailModalOpen(false)} />}
        </div>
    );
};

export default PurchaseHistory;