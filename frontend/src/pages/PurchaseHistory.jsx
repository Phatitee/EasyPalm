// frontend/src/pages/PurchaseHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const PurchaseHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State สำหรับเก็บค่าในฟอร์มค้นหา
    const [filters, setFilters] = useState({
        name: '',
        start_date: '',
        end_date: '',
    });

    // State สำหรับติดตามว่าแถวไหนถูกขยายเพื่อดูรายละเอียด
    const [expandedRow, setExpandedRow] = useState(null);

    const fetchOrders = async (currentFilters) => {
        setLoading(true);
        try {
            // สร้าง params สำหรับส่งไปกับ URL
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

    // โหลดข้อมูลทั้งหมดครั้งแรกเมื่อเปิดหน้า
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

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">ประวัติการรับซื้อสินค้า</h1>

            {/* ฟอร์มค้นหา */}
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-end gap-4">
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700">ค้นหาชื่อเกษตรกร</label>
                    <input type="text" name="name" value={filters.name} onChange={handleFilterChange} className="mt-1 p-2 border rounded w-full" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">จากวันที่</label>
                    <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="mt-1 p-2 border rounded w-full" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ถึงวันที่</label>
                    <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="mt-1 p-2 border rounded w-full" />
                </div>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2">
                    <Search size={18} /> ค้นหา
                </button>
            </form>

            {/* ตารางแสดงข้อมูล */}
            {loading && <p>กำลังโหลด...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เลขที่ใบเสร็จ</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อเกษตรกร</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">ยอดรวม (บาท)</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">สถานะ</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? orders.map((order) => (
                                <React.Fragment key={order.purchase_order_number}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.purchase_order_number}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(order.b_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.farmer_name}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right font-semibold">{order.b_total_price.toFixed(2)}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${order.payment_status === 'Paid' ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}>
                                                {order.payment_status || 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            <button onClick={() => toggleRowExpansion(order.purchase_order_number)} className="text-blue-500 hover:text-blue-700">
                                                {expandedRow === order.purchase_order_number ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                            </button>
                                        </td>
                                    </tr>
                                    {/* แถวสำหรับแสดงรายละเอียดสินค้า (ถ้าถูกขยาย) */}
                                    {expandedRow === order.purchase_order_number && (
                                        <tr>
                                            <td colSpan="6" className="p-4 bg-gray-50">
                                                <h4 className="font-bold mb-2">รายการสินค้าในใบเสร็จ:</h4>
                                                <ul>
                                                    {order.items.map((item, index) => (
                                                        <li key={index} className="flex justify-between">
                                                            <span>- {item.product_name}</span>
                                                            <span>{item.quantity} กก. x {item.price_per_unit.toFixed(2)} บาท</span>
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
                </div>
            )}
        </div>
    );
};

export default PurchaseHistory;