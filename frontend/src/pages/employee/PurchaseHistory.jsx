// frontend/src/pages/PurchaseHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';

const PurchaseHistory = () => {
    // --- State and Logic (คงไว้เหมือนเดิมทั้งหมด) ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        name: '',
        start_date: '',
        end_date: '',
    });
    const [expandedRow, setExpandedRow] = useState(null);

    const fetchOrders = async (currentFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentFilters.name) params.append('name', currentFilters.name);
            if (currentFilters.start_date) params.append('start_date', currentFilters.start_date);
            if (currentFilters.end_date) params.append('end_date', currentFilters.end_date);

            const response = await axios.get(`http://127.0.0.1:5000/purchaseorders?${params.toString()}`);
            setOrders(response.data);
            setError(null);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลประวัติการซื้อได้');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(filters);
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchOrders(filters);
    };

    const toggleRowExpansion = (orderNumber) => {
        setExpandedRow(expandedRow === orderNumber ? null : orderNumber);
    };

    // --- โครงสร้าง JSX ที่ปรับปรุงใหม่ทั้งหมด ---
    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">ประวัติการรับซื้อสินค้า</h1>
                <p className="mt-2 text-gray-500">ค้นหาและดูรายละเอียดใบเสร็จการรับซื้อย้อนหลัง</p>
            </div>

            {/* Card 1: Search Filters */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">ตัวกรองการค้นหา</h2>
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเกษตรกร</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="ค้นหาด้วยชื่อ..." className="w-full p-2 pl-10 border-gray-300 rounded-lg" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">จากวันที่</label>
                        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="w-full p-2 border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ถึงวันที่</label>
                        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="w-full p-2 border-gray-300 rounded-lg" />
                    </div>
                    <button type="submit" className="md:col-start-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg inline-flex items-center justify-center gap-2">
                        <Search size={18} /> ค้นหา
                    </button>
                </form>
            </div>

            {/* Card 2: Search Results */}
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                 <h2 className="text-xl font-semibold text-gray-700 p-6">ผลการค้นหา</h2>
                {loading ? (
                    <p className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</p>
                ) : error ? (
                    <p className="text-center py-10 text-red-500">{error}</p>
                ) : (
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่ใบเสร็จ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อเกษตรกร</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม (บาท)</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length > 0 ? orders.map((order) => (
                                <React.Fragment key={order.purchase_order_number}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.purchase_order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.b_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.farmer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-medium">{order.b_total_price.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`px-3 py-1 text-xs font-medium leading-tight rounded-full ${order.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {order.payment_status || 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button onClick={() => toggleRowExpansion(order.purchase_order_number)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100">
                                                {expandedRow === order.purchase_order_number ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === order.purchase_order_number && (
                                        <tr>
                                            <td colSpan="6" className="p-4 bg-gray-50 border-t border-gray-200">
                                                <h4 className="font-bold mb-2 text-gray-700">รายการสินค้าในใบเสร็จ:</h4>
                                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                                    {order.items.map((item, index) => (
                                                        <li key={index} className="flex justify-between text-sm">
                                                            <span>{item.product_name}</span>
                                                            <span className="font-mono">{item.quantity} กก. x {item.price_per_unit.toFixed(2)} บาท</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-500">-- ไม่พบข้อมูล --</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PurchaseHistory;