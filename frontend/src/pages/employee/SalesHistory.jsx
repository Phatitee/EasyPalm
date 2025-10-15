// frontend/src/pages/SalesHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const SalesHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State สำหรับเก็บค่าในฟอร์มค้นหา
    const [filters, setFilters] = useState({
        name: '', // ค้นหาตามชื่อลูกค้า (Food Industry)
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
            // Backend endpoint: GET /salesorders รองรับ filter 'name' และช่วงวันที่
            if (currentFilters.name) params.append('name', currentFilters.name); 
            if (currentFilters.start_date) params.append('start_date', currentFilters.start_date);
            if (currentFilters.end_date) params.append('end_date', currentFilters.end_date);

            const response = await axios.get(`http://127.0.0.1:5000/salesorders?${params.toString()}`);
            setOrders(response.data);
            setError(null);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลประวัติการขายได้');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // โหลดข้อมูลทั้งหมดครั้งแรกเมื่อเปิดหน้า
    useEffect(() => {
        // ใน PurchaseHistory.jsx มีการเรียกใช้ fetchOrders(filters) 
        // โดยที่ filters ถูกกำหนดค่าเริ่มต้นเป็น string ว่าง (initial state)
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
            <h1 className="text-2xl font-bold mb-4">ประวัติการขายสินค้า (Sales History)</h1>

            {/* ฟอร์มค้นหา */}
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-end gap-4">
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700">ค้นหาชื่อลูกค้า</label>
                    <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="ค้นหาชื่อโรงงานลูกค้า..." className="mt-1 p-2 border rounded w-full" />
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
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เลขที่ใบขาย</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อลูกค้า (โรงงาน)</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">ยอดรวม (บาท)</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">สถานะ</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? orders.map((order) => (
                                <React.Fragment key={order.sale_order_number}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.sale_order_number}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(order.s_date).toLocaleDateString('th-TH')}</td>
                                        {/* สมมติว่า Backend ส่ง field 'food_industry_name' หรือ 'f_name' สำหรับชื่อลูกค้ามาให้ */}
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.food_industry_name || order.f_name || order.f_id}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right font-semibold">{order.s_total_price.toFixed(2)}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {/* สถานะการชำระเงินของ Sales Order มักจะเป็น Paid/Unpaid แต่ในระบบนี้ยังไม่ได้ระบุสถานะ payment_status ชัดเจนสำหรับ SalesOrder จึงใช้สีเดียวไปก่อน */}
                                            <span className={`px-2 py-1 font-semibold leading-tight rounded-full bg-green-200 text-green-900`}>
                                                เสร็จสิ้น {/* เนื่องจาก backend มีแค่ s_date แต่ไม่มี payment_status สำหรับ sales order จึงใช้ 'เสร็จสิ้น' */}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            <button onClick={() => toggleRowExpansion(order.sale_order_number)} className="text-blue-500 hover:text-blue-700">
                                                {expandedRow === order.sale_order_number ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                            </button>
                                        </td>
                                    </tr>
                                    {/* แถวสำหรับแสดงรายละเอียดสินค้า (ถ้าถูกขยาย) */}
                                    {expandedRow === order.sale_order_number && (
                                        <tr>
                                            <td colSpan="6" className="p-4 bg-gray-50">
                                                <h4 className="font-bold mb-2">รายการสินค้าในใบขาย:</h4>
                                                <ul>
                                                    {/* สมมติว่า field ของรายการสินค้ารายย่อยคือ 'items' */}
                                                    {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                                                        <li key={index} className="flex justify-between">
                                                            <span>- {item.product_name}</span>
                                                            <span>{item.quantity} กก. x {item.price_per_unit.toFixed(2)} บาท</span>
                                                        </li>
                                                    )) : (
                                                        <li className="text-gray-500">-- ไม่พบรายการสินค้า --</li>
                                                    )}
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

export default SalesHistory;