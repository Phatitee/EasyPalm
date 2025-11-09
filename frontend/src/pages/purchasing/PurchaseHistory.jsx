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
            
            const response = await fetch(`/api/purchaseorders?${params.toString()}`);
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
        const colors = {
            payment: {
                Paid: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
                Unpaid: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
            },
            stock: {
                Completed: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
                Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
                'Not Received': "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800"
            }
        };
        const text = {
            'Not Received': 'ยังไม่ได้รับ',
            Pending: 'รอรับเข้าคลัง',
            Completed: 'รับเข้าคลังแล้ว',
            Paid: 'จ่ายแล้ว',
            Unpaid: 'ยังไม่จ่าย'
        };
        return (
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${colors[type][status]} transition-all duration-200 shadow-sm hover:shadow-md`}>
                {text[status] || status}
            </span>
        );
    };

    return (
        // ★★★ FIX 1: พื้นหลังหน้าหลักและสี Text Default ★★★
        <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Header Section with modern styling */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8 transform hover:scale-[1.01] transition-all duration-300">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-4">
                    <List className="text-purple-600 dark:text-purple-400" size={32}/>
                    ประวัติการสั่งซื้อ
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 ml-12">ค้นหาและตรวจสอบรายการสั่งซื้อทั้งหมด</p>
            </div>

            {/* Enhanced Filter and Search Panel */}
            <div className="mb-8 p-6 bg-white rounded-3xl shadow-xl flex flex-col md:flex-row gap-6 items-center dark:bg-gray-800 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                {/* Improved Search Input */}
                <div className="relative w-full md:w-2/3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 dark:text-purple-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="ค้นหาตามเลขที่ PO หรือชื่อเกษตรกร..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 transition-all duration-200"
                    />
                </div>
                {/* Enhanced Status Filter */}
                <div className="relative w-full md:w-1/3">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" size={20} />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 bg-white dark:bg-gray-700 transition-all duration-200"
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
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-16 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-purple-100 dark:border-purple-900 animate-pulse"></div>
                        <Loader className="animate-spin text-purple-600 dark:text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={32} />
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">กำลังโหลดข้อมูล...</p>
                </div>
            ) : error ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-16 border border-red-200 dark:border-red-800">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 text-center">
                        <ServerCrash size={48} className="mx-auto mb-4 text-red-500 dark:text-red-400" />
                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">เกิดข้อผิดพลาด</h2>
                        <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    </div>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-16 text-center border border-gray-100 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-8">
                        <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-3">ไม่พบข้อมูล</h2>
                        <p className="text-gray-500 dark:text-gray-400">ไม่พบรายการสั่งซื้อที่ตรงกับเงื่อนไข</p>
                    </div>
                </div>
            ) : (
                // Main Table
                // ★★★ FIX 11: Table Container Background และ Divider ★★★
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden dark:bg-gray-800 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                                        เลขที่ PO
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                                        เกษตรกร
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                                        วันที่
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                                        ยอดรวม
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                                        สถานะ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800 dark:divide-gray-700">
                                {orders.map(order => (
                                    <tr 
                                        key={order.purchase_order_number} 
                                        onClick={() => handleRowClick(order.purchase_order_number)}
                                        className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-all duration-150"
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