import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, CheckCircle, Loader, ServerCrash, Inbox } from 'lucide-react';
import PurchaseOrderDetail from './PurchaseOrderDetail';

const PaymentManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payingOrderId, setPayingOrderId] = useState(null);
    const { user } = useAuth();

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchUnpaidOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // ★★★ FIX: เพิ่ม cache: 'no-cache' เพื่อบังคับให้ดึงข้อมูลใหม่เสมอ ★★★
            const response = await fetch('http://127.0.0.1:5000/purchaseorders?status=unpaid', {
                cache: 'no-cache' 
            });
            // ★★★ END FIX ★★★

            if (!response.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลรายการที่ยังไม่จ่ายได้');
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
        fetchUnpaidOrders();
    }, [fetchUnpaidOrders]);

    const handleMarkAsPaid = async (e, orderNumber) => {
        e.stopPropagation(); 
        if (!window.confirm(`คุณต้องการยืนยันการจ่ายเงินสำหรับ PO ${orderNumber} ใช่หรือไม่?`)) {
            return;
        }
        setPayingOrderId(orderNumber);
        try {
            const response = await fetch(`http://127.0.0.1:5000/purchaseorders/${orderNumber}/pay`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: user.e_id }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
            }
            alert(`PO ${orderNumber} ถูกทำเครื่องหมายว่าจ่ายแล้ว!`);
            
            // เมื่อสำเร็จ คำสั่งนี้จะไปดึงข้อมูลใหม่ (แบบไม่ติด Cache) มาแสดง
            fetchUnpaidOrders(); 
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        } finally {
            setPayingOrderId(null);
        }
    };

    const handleRowDoubleClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
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
                    <FileText className="inline-block mr-3 text-purple-600" />
                    จัดการการจ่ายเงิน (Purchase Orders)
                </h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <Inbox size={64} className="mx-auto text-gray-400" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700">ไม่มีรายการที่ต้องดำเนินการ</h2>
                    <p className="mt-2 text-gray-500">ไม่มีรายการสั่งซื้อที่รอการจ่ายเงินในขณะนี้</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่ PO</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อเกษตรกร</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สั่งซื้อ</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr 
                                        key={order.purchase_order_number}
                                        onDoubleClick={() => handleRowDoubleClick(order.purchase_order_number)}
                                        className="hover:bg-gray-100 cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.purchase_order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.farmer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.b_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">
                                            {parseFloat(order.b_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={(e) => handleMarkAsPaid(e, order.purchase_order_number)}
                                                disabled={payingOrderId === order.purchase_order_number}
                                                className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-gray-400"
                                            >
                                                {payingOrderId === order.purchase_order_number ? (
                                                    <Loader className="animate-spin mr-2" size={16} />
                                                ) : (
                                                    <CheckCircle className="mr-2" size={16} />
                                                )}
                                                {payingOrderId === order.purchase_order_number ? 'กำลังบันทึก...' : 'ทำเครื่องหมายว่าจ่ายแล้ว'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {isDetailModalOpen && (
                <PurchaseOrderDetail 
                    orderId={selectedOrderId} 
                    onClose={() => setIsDetailModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default PaymentManagement;