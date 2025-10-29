// frontend/src/pages/sales/SalesHistory.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, List, Loader, ServerCrash, Inbox } from 'lucide-react';
import SalesHistoryDetail from './SalesHistoryDetail'; // Import the modal component

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
            // Build the query string
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);
            
            const response = await fetch(`http://127.0.0.1:5000/salesorders?${params.toString()}`);
            if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลประวัติการขายได้');
            
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
            fetchSalesHistory();
        }, 500); // Debounce search input
        return () => clearTimeout(timer);
    }, [fetchSalesHistory]);

    const handleRowClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'Paid': return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">ชำระเงินแล้ว</span>;
            case 'Unpaid': return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">ยังไม่ชำระ</span>;
            default: return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <List className="mr-3 text-blue-600"/>
                ประวัติการขาย
            </h1>

            {/* Search and Filter Controls */}
            <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-2/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตามเลขที่ SO หรือชื่อลูกค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="relative w-full md:w-1/3">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">สถานะทั้งหมด</option>
                        <option value="Paid">ชำระเงินแล้ว</option>
                        <option value="Unpaid">ยังไม่ชำระ</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                 <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>
            ) : error ? (
                <div className="flex flex-col justify-center items-center h-64 text-red-600 bg-red-50 p-10 rounded-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <Inbox size={64} className="mx-auto text-gray-400" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700">ไม่พบข้อมูล</h2>
                    <p className="mt-2 text-gray-500">ไม่พบรายการขายที่ตรงกับเงื่อนไขการค้นหาของคุณ</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เลขที่ SO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลูกค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ยอดรวม</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะชำระเงิน</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map(order => (
                                    <tr key={order.sale_order_number} onClick={() => handleRowClick(order.sale_order_number)} className="hover:bg-gray-100 cursor-pointer">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.sale_order_number}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.customer_name}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(order.s_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-800">{parseFloat(order.s_total_price).toLocaleString('th-TH')} บาท</td>
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