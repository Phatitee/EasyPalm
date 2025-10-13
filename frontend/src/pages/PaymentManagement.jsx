// frontend/src/pages/PaymentManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, CheckCircle } from 'lucide-react'; // Import ไอคอน

const PaymentManagement = () => {
    // State สำหรับเก็บรายการที่ยังไม่จ่าย
    const [unpaidOrders, setUnpaidOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State สำหรับช่องค้นหา
    const [searchTerm, setSearchTerm] = useState('');

    // --- ฟังก์ชันสำหรับดึงข้อมูลใบเสร็จที่ยังไม่จ่าย ---
    const fetchUnpaidOrders = async () => {
        setLoading(true);
        try {
            // เราจะยิง API ไปที่ /purchaseorders พร้อมกับ query string `?status=unpaid`
            // เพื่อให้ Backend ส่งมาเฉพาะรายการที่ยังไม่จ่ายเงิน
            const response = await axios.get('http://127.0.0.1:5000/purchaseorders?status=unpaid');
            setUnpaidOrders(response.data);
            setError(null); // เคลียร์ error เก่าถ้ามี
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลใบเสร็จที่ต้องชำระได้');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- เรียกใช้ฟังก์ชัน fetchUnpaidOrders ตอนเปิดหน้าครั้งแรก ---
    useEffect(() => {
        fetchUnpaidOrders();
    }, []);

    // --- ฟังก์ชันเมื่อกดปุ่ม "ยืนยันการชำระเงิน" ---
    const handleConfirmPayment = async (orderNumber, farmerName) => {
        // มีการเตือนยืนยันก่อนเสมอ เพื่อป้องกันการกดผิดพลาด
        if (window.confirm(`คุณต้องการยืนยันการจ่ายเงินสำหรับใบเสร็จเลขที่ ${orderNumber}\nของ: ${farmerName}\nใช่หรือไม่?`)) {
            try {
                // ยิง API แบบ PUT ไปยัง Endpoint ที่เราสร้างไว้เพื่ออัปเดตสถานะ
                await axios.put(`http://127.0.0.1:5000/purchaseorders/${orderNumber}/pay`);
                alert('บันทึกการชำระเงินสำเร็จ!');
                
                // โหลดข้อมูลใหม่เพื่อให้รายการที่จ่ายแล้วหายไปจากลิสต์ทันที
                fetchUnpaidOrders(); 
            } catch (err) {
                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                console.error(err);
            }
        }
    };

    // --- กรองข้อมูลในตารางตามสิ่งที่พิมพ์ในช่องค้นหา ---
    const filteredOrders = unpaidOrders.filter(order =>
        order.purchase_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.farmer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- ส่วนของการแสดงผล ---
    if (loading) return <p className="text-center mt-8">กำลังโหลดรายการที่ต้องชำระ...</p>;
    if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">จัดการชำระเงิน (รายการค้างจ่าย)</h1>
            
            {/* ช่องค้นหา */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="ค้นหาตามเลขที่ใบเสร็จ หรือ ชื่อเกษตรกร..."
                    className="p-2 pl-10 border border-gray-300 rounded w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* ตารางแสดงข้อมูล */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เลขที่ใบเสร็จ</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อเกษตรกร</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">ยอดที่ต้องชำระ (บาท)</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                            <tr key={order.purchase_order_number}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-semibold">{order.purchase_order_number}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.farmer_name}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(order.b_date).toLocaleDateString('th-TH')}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right font-bold text-red-600">{order.b_total_price.toFixed(2)}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <button 
                                        onClick={() => handleConfirmPayment(order.purchase_order_number, order.farmer_name)}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        ยืนยันการชำระเงิน
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center py-10 text-gray-500">-- ไม่มีรายการค้างชำระ --</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentManagement;