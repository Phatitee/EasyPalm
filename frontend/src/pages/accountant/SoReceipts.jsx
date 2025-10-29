import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, CheckCircle, Loader, ServerCrash, Inbox } from 'lucide-react';
import ReceiptDetail from './ReceiptDetail';

const SoReceipts = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submittingId, setSubmittingId] = useState(null);
    const { user } = useAuth();

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchPendingPayments = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://127.0.0.1:5000/salesorders/pending-payment');
            if (!response.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลได้');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingPayments();
    }, [fetchPendingPayments]);

    const handleRowDoubleClick = async (orderNumber) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/salesorders/${orderNumber}`);
            if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลรายละเอียดได้');
            
            const data = await response.json();
            setSelectedOrder(data);
            setIsDetailModalOpen(true);
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    // ★★★ FIX: เพิ่ม 'e' (event object) เข้าไปในฟังก์ชัน ★★★
    const handleConfirmPayment = async (e, orderNumber) => {
        // ★★★ FIX: เรียก e.stopPropagation() เพื่อหยุดไม่ให้ event ของปุ่มไปรบกวน event ของแถว ★★★
        e.stopPropagation(); 

        if (!window.confirm(`คุณต้องการยืนยันการชำระเงินสำหรับ SO ${orderNumber} ใช่หรือไม่?`)) {
            return;
        }

        setSubmittingId(orderNumber);
        try {
            const response = await fetch(`http://127.0.0.1:5000/salesorders/${orderNumber}/confirm-payment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: user.e_id }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'เกิดข้อผิดพลาดในการยืนยัน');
            }
            
            alert(result.message);
            fetchPendingPayments();

        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        } finally {
            setSubmittingId(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-500" size={48} /> <span className="ml-4 text-lg">กำลังโหลดข้อมูล...</span></div>;
    }

    if (error) {
        return <div className="flex flex-col justify-center items-center h-screen text-red-600 bg-red-50 p-10 rounded-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <DollarSign className="inline-block mr-3 text-green-600" />
                    ยืนยันการรับชำระเงิน
                </h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <Inbox size={64} className="mx-auto text-gray-400" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700">ไม่มีรายการที่ต้องดำเนินการ</h2>
                    <p className="mt-2 text-gray-500">ไม่มีรายการสั่งขายที่รอการยืนยันชำระเงินในขณะนี้</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่ SO</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อลูกค้า</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สั่งซื้อ</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr 
                                        key={order.sale_order_number} 
                                        onDoubleClick={() => handleRowDoubleClick(order.sale_order_number)}
                                        className="hover:bg-gray-100 cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.sale_order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.s_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">
                                            {parseFloat(order.s_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                // ★★★ FIX: ส่ง event object (e) เข้าไปในฟังก์ชัน ★★★
                                                onClick={(e) => handleConfirmPayment(e, order.sale_order_number)}
                                                disabled={submittingId === order.sale_order_number}
                                                className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-gray-400"
                                            >
                                                {submittingId === order.sale_order_number ? (
                                                    <Loader className="animate-spin mr-2" size={16} />
                                                ) : (
                                                    <CheckCircle className="mr-2" size={16} />
                                                )}
                                                {submittingId === order.sale_order_number ? 'กำลังยืนยัน...' : 'ยืนยันการชำระเงิน'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* Modal should be here, and it's correctly placed */}
            {isDetailModalOpen && (
                <ReceiptDetail 
                    order={selectedOrder} 
                    onClose={() => setIsDetailModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default SoReceipts;