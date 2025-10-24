// frontend/src/pages/employee/PaymentManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
// --- (★ แก้ไข) Import Modal Components ---
import ResultModal from '../../components/modals/ResultModal';
import ConfirmModal from '../../components/modals/ConfirmModal';

const PaymentManagement = () => {
    // --- State เดิม ---
    const [unpaidOrders, setUnpaidOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);

    // --- State สำหรับ Modal ---
    const [modalInfo, setModalInfo] = useState({ show: false, type: 'success', message: '' });
    const [confirmInfo, setConfirmInfo] = useState({ show: false, message: '', onConfirm: () => {} });

    // --- ฟังก์ชันดึงข้อมูล ---
    const fetchUnpaidOrders = async () => {
        // ... (เหมือนเดิม) ...
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:5000/purchaseorders?status=unpaid');
            setUnpaidOrders(response.data);
            setError(null);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลใบเสร็จที่ต้องชำระได้');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnpaidOrders();
    }, []);

    // --- ฟังก์ชัน Toggle แถว ---
    const toggleRowExpansion = (orderNumber) => {
        // ... (เหมือนเดิม) ...
        setExpandedRow(expandedRow === orderNumber ? null : orderNumber);
    };

    // --- ฟังก์ชันปิด Modal ---
    const handleCloseResultModal = () => setModalInfo({ ...modalInfo, show: false });
    const handleCloseConfirmModal = () => setConfirmInfo({ ...confirmInfo, show: false });

    // --- ฟังก์ชันยิง API ---
    const executePayment = async (orderNumber) => {
        // ... (เหมือนเดิม) ...
        handleCloseConfirmModal();
        try {
            await axios.put(`http://127.0.0.1:5000/purchaseorders/${orderNumber}/pay`);
            setModalInfo({ show: true, type: 'success', message: 'บันทึกการชำระเงินสำเร็จ!' });
            fetchUnpaidOrders();
        } catch (err) {
            setModalInfo({ show: true, type: 'error', message: 'เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message) });
            console.error(err);
        }
    };

    // --- ฟังก์ชันกดปุ่มยืนยัน ---
    const handleConfirmPayment = (orderNumber, farmerName) => {
        // ... (เหมือนเดิม) ...
        setConfirmInfo({
            show: true,
            message: `ยืนยันการจ่ายเงินสำหรับใบเสร็จ ${orderNumber}\nของ: ${farmerName}?`,
            onConfirm: () => executePayment(orderNumber)
        });
    };

    // --- กรองข้อมูล ---
    const filteredOrders = unpaidOrders.filter(order =>
        // ... (เหมือนเดิม) ...
        order.purchase_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.farmer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p className="text-center mt-8">กำลังโหลด...</p>;
    if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;

    return (
        <div className="container mx-auto px-4 py-6">

            {/* --- (★ แก้ไข) ใช้ ResultModal Component --- */}
            <ResultModal
                show={modalInfo.show}
                type={modalInfo.type}
                message={modalInfo.message}
                onClose={handleCloseResultModal}
            />

            {/* --- (★ แก้ไข) ใช้ ConfirmModal Component --- */}
            <ConfirmModal
                show={confirmInfo.show}
                message={confirmInfo.message}
                onConfirm={confirmInfo.onConfirm}
                onClose={handleCloseConfirmModal}
                confirmText="ยืนยัน"
                confirmColor="green" // หรือสีอื่นตามต้องการ
            />

            {/* --- Header --- */}
            <div className="text-center mb-6">
                {/* ... (เหมือนเดิม) ... */}
                 <h1 className="text-3xl md:text-4xl font-bold text-gray-800">จัดการชำระเงิน (รายการค้างจ่าย)</h1>
                 <p className="text-sm text-gray-500 mt-1">ยืนยันการชำระเงินสำหรับใบเสร็จที่ยังค้างชำระ</p>
            </div>

            {/* --- Main Content Card --- */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 md:p-6 flex justify-between items-end">
                    {/* ... (เหมือนเดิม) ... */}
                    <div className="w-full md:w-1/3">
                        <label htmlFor="payment-search" className="block text-sm font-medium text-gray-700 mb-1">
                            ค้นหารายการ
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                id="payment-search"
                                placeholder="ค้นหาตามเลขที่ใบเสร็จ หรือ ชื่อเกษตรกร..."
                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                           {/* ... Table Headers (เหมือนเดิม) ... */}
                           <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่ใบเสร็จ</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อเกษตรกร</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดที่ต้องชำระ (บาท)</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                <React.Fragment key={order.purchase_order_number}>
                                    {/* ... Table Row (เหมือนเดิม) ... */}
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.purchase_order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.farmer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(order.b_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">{order.b_total_price.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <button
                                                onClick={() => handleConfirmPayment(order.purchase_order_number, order.farmer_name)}
                                                className="bg-green-600 hover:bg-green-700 text-white font-regular py-2 px-4 rounded-lg inline-flex items-center gap-2 transition duration-150 ease-in-out"
                                            >
                                                <CheckCircle size={18} />
                                                ยืนยันการชำระเงิน
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button onClick={() => toggleRowExpansion(order.purchase_order_number)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100">
                                                {expandedRow === order.purchase_order_number ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Expanded Row */}
                                    {expandedRow === order.purchase_order_number && (
                                        // ... (เหมือนเดิม) ...
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
                                // ... No data row (เหมือนเดิม) ...
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">-- ไม่มีรายการค้างชำระ --</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentManagement;