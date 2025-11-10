// frontend/src/pages/warehouse/PendingShipments.jsx (FIXED)

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Truck, CheckCircle, Loader, ServerCrash, Inbox, AlertTriangle, XCircle } from 'lucide-react';
import ShipmentDetails from './ShipmentDetails';

// 1. ★★★ Import ฟังก์ชันจาก api.js ★★★
import { getPendingShipments, shipSalesOrder } from '../../services/api';

// 2. ★★★ ลบ API_URL ทิ้งไป ★★★
// const API_URL = process.env.REACT_APP_API_URL;

// Helper Modal (ConfirmDialog) - สำหรับยืนยัน
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm transform transition-all animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                    <AlertTriangle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button onClick={onClose} type="button" className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">ยกเลิก</button>
                    <button onClick={onConfirm} type="button" className="w-full px-4 py-2 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700">ยืนยัน</button>
                </div>
            </div>
        </div>
    );
};

// Helper Modal (ResultDialog) - สำหรับแจ้งผลลัพธ์
const ResultDialog = ({ isOpen, onClose, type, message }) => {
    if (!isOpen) return null;
    const isSuccess = type === 'success';
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm text-center transform transition-all animate-fade-in-up">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isSuccess ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                </div>
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{isSuccess ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="mt-6">
                    <button onClick={onClose} type="button" className={`w-full px-4 py-2 text-white rounded-lg font-semibold ${isSuccess ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>ตกลง</button>
                </div>
            </div>
        </div>
    );
}

const PendingShipments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submittingId, setSubmittingId] = useState(null);
    const { user } = useAuth();

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, orderNumber: null, title: '', message: '' });
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' });

    const fetchPendingOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // 3. ★★★ แก้ไข: นี่คือบรรทัดที่ 68 ที่ Error ★★★
            const data = await getPendingShipments();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingOrders();
    }, [fetchPendingOrders]);

    const handleOpenConfirmDialog = (e, orderNumber) => {
        e.stopPropagation();
        setConfirmDialog({
            isOpen: true,
            orderNumber: orderNumber,
            title: 'ยืนยันการเบิกสินค้า',
            message: `คุณต้องการยืนยันการเบิกสินค้าสำหรับ SO ${orderNumber} ใช่หรือไม่?`
        });
    };

    const handleExecuteConfirmShipment = async () => {
        const orderNumber = confirmDialog.orderNumber;
        setSubmittingId(orderNumber);
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        try {
            // 4. ★★★ แก้ไข: ใช้ api.js ★★★
            const result = await shipSalesOrder(orderNumber, user.e_id);

            setResultDialog({ isOpen: true, type: 'success', message: result.message });
            fetchPendingOrders();

        } catch (err) {
            setResultDialog({ isOpen: true, type: 'error', message: `เกิดข้อผิดพลาด: ${err.message}` });
        } finally {
            setSubmittingId(null);
        }
    };

    const handleRowDoubleClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
    };

    if (loading) {
        // ★★★ Dark Mode FIX: Loading State ★★★
        return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /> <span className="ml-4 text-lg">กำลังโหลดข้อมูล...</span></div>;
    }

    if (error) {
        // ★★★ Dark Mode FIX: Error State ★★★
        return <div className="flex flex-col justify-center items-center h-screen text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;
    }

    return (
        // ★★★ Dark Mode FIX: Main Container Background ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={handleExecuteConfirmShipment}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />
            <ResultDialog
                isOpen={resultDialog.isOpen}
                onClose={() => setResultDialog({ ...resultDialog, isOpen: false })}
                type={resultDialog.type}
                message={resultDialog.message}
            />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <Truck className="inline-block mr-3 text-purple-600 dark:text-purple-400" />
                    สินค้าที่รอเบิก
                </h1>
            </div>

            {orders.length === 0 ? (
                // ★★★ Dark Mode FIX: Empty State Background and Text ★★★
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                    <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">ไม่มีรายการที่ต้องดำเนินการ</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">ไม่มีรายการสั่งขายที่รอการเบิกสินค้าในขณะนี้</p>
                </div>
            ) : (
                // ★★★ Dark Mode FIX: Table Container Background and Shadow ★★★
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* ★★★ Dark Mode FIX: Table Header Background and Text ★★★ */}
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">เลขที่ SO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ลูกค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">วันที่สั่งซื้อ</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ยอดรวม</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">จัดการ</th>
                                </tr>
                            </thead>
                            {/* ★★★ Dark Mode FIX: Table Body Background and Divider ★★★ */}
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map((order) => (
                                    <tr
                                        key={order.sale_order_number}
                                        onDoubleClick={() => handleRowDoubleClick(order.sale_order_number)}
                                        className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150"
                                    >
                                        {/* ★★★ Dark Mode FIX: Text Colors ★★★ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{order.sale_order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.s_date + 'Z').toLocaleString('th-TH', {
                                            year: '2-digit', month: '2-digit', day: '2-digit',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-800 dark:text-gray-200">
                                            {parseFloat(order.s_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={(e) => handleOpenConfirmDialog(e, order.sale_order_number)}
                                                disabled={submittingId === order.sale_order_number}
                                                className="flex items-center justify-center w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400"
                                            >
                                                {submittingId === order.sale_order_number ? (
                                                    <Loader className="animate-spin mr-2" size={16} />
                                                ) : (
                                                    <CheckCircle className="mr-2" size={16} />
                                                )}
                                                {submittingId === order.sale_order_number ? 'กำลังยืนยัน...' : 'ยืนยันการเบิก'}
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
                <ShipmentDetails
                    orderId={selectedOrderId}
                    onClose={() => setIsDetailModalOpen(false)}
                />
            )}
        </div>
    );
};

export default PendingShipments;