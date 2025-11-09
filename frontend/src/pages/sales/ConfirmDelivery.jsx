import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Truck, CheckCircle, Loader, ServerCrash, Inbox, AlertTriangle, RefreshCw } from 'lucide-react'; // (เพิ่ม) Import ไอคอน RefreshCw
import SalesHistoryDetail from './SalesHistoryDetail';
import { XCircle } from "lucide-react";

// (ปรับปรุง) Helper Modal (ConfirmDialog) - เพิ่ม actionType เพื่อเปลี่ยนสีปุ่มและไอคอน
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, actionType }) => {
    if (!isOpen) return null;
    // (ปรับปรุง) เปลี่ยนสีปุ่มยืนยันตามประเภทของการกระทำ
    const confirmButtonColor = actionType === 'return'
        ? 'bg-red-500 hover:bg-red-600'
        : 'bg-orange-500 hover:bg-orange-600';
    // (ปรับปรุง) เปลี่ยนสีไอคอนใน Modal
    const iconContainerColor = actionType === 'return'
        ? 'bg-red-100'
        : 'bg-orange-100';
    const iconColor = actionType === 'return'
        ? 'text-red-600'
        : 'text-orange-600';


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm transform transition-all animate-fade-in-up">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconContainerColor}`}>
                    <AlertTriangle className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button onClick={onClose} type="button" className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">ยกเลิก</button>
                    <button onClick={onConfirm} type="button" className={`w-full px-4 py-2 text-white rounded-md font-semibold ${confirmButtonColor}`}>ยืนยัน</button>
                </div>
            </div>
        </div>
    );
};


// Helper Modal (ResultDialog) - สำหรับแจ้งผลลัพธ์ (ไม่มีการเปลี่ยนแปลง)
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

const ConfirmDelivery = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submittingId, setSubmittingId] = useState(null);
    const { user } = useAuth();

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    // (ปรับปรุง) เพิ่ม action ใน state เพื่อแยกแยะการทำงาน
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, orderNumber: null, title: '', message: '', action: null });
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' });


    const fetchPendingDeliveries = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/salesorders/pending-delivery', { cache: 'no-cache' });
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
        fetchPendingDeliveries();
    }, [fetchPendingDeliveries]);

    // (ปรับปรุง) ทำให้ฟังก์ชันรองรับได้ทั้ง 'confirm' และ 'return'
    const handleOpenConfirmDialog = (e, orderNumber, actionType) => {
        e.stopPropagation();
        if (actionType === 'confirm') {
            setConfirmDialog({
                isOpen: true,
                orderNumber: orderNumber,
                title: 'ยืนยันการจัดส่ง',
                message: `คุณต้องการยืนยันว่าสินค้า SO ${orderNumber} จัดส่งถึงลูกค้าแล้วใช่หรือไม่?`,
                action: 'confirm'
            });
        } else if (actionType === 'return') {
            setConfirmDialog({
                isOpen: true,
                orderNumber: orderNumber,
                title: 'ยืนยันการขอคืนสินค้า',
                message: `คุณต้องการยืนยันการขอคืนสินค้าสำหรับ SO ${orderNumber} ใช่หรือไม่?`,
                action: 'return'
            });
        }
    };

    // (ปรับปรุง) เปลี่ยนชื่อและปรับ Logic ให้เป็นฟังก์ชันกลางสำหรับจัดการ Action
    const handleExecuteAction = async () => {
        const { orderNumber, action } = confirmDialog;
        setSubmittingId(orderNumber);
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        let url = '';
        if (action === 'confirm') {
            url = `/api/salesorders/${orderNumber}/confirm-delivery`;
        } else if (action === 'return') {
            url = `/api/salesorders/${orderNumber}/request-return`;
        } else {
            console.error("Unknown action type:", action);
            setSubmittingId(null);
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: user.e_id }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
            }

            setResultDialog({ isOpen: true, type: 'success', message: result.message });
            fetchPendingDeliveries(); // Refresh list

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
        return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /> <span className="ml-4 text-lg">กำลังโหลดข้อมูล...</span></div>;
    }

    if (error) {
        return <div className="flex flex-col justify-center items-center h-screen text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <Truck className="inline-block mr-3 text-orange-600 dark:text-orange-400" />
                    ยืนยันการจัดส่งสินค้า
                </h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                    <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">ไม่มีรายการที่ต้องดำเนินการ</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">ไม่มีรายการที่รอการยืนยันจัดส่งในขณะนี้</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">เลขที่ SO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ลูกค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">วันที่เบิกสินค้า</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ยอดรวม</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map((order) => (
                                    <tr
                                        key={order.sale_order_number}
                                        onDoubleClick={() => handleRowDoubleClick(order.sale_order_number)}
                                        className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{order.sale_order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.shipped_date + 'Z').toLocaleString('th-TH', {
                                            year: '2-digit', month: '2-digit', day: '2-digit',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-800 dark:text-gray-200">
                                            {parseFloat(order.s_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {/* (ปรับปรุง) เพิ่มปุ่มขอคืนสินค้าและจัดกลุ่มปุ่ม */}
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    onClick={(e) => handleOpenConfirmDialog(e, order.sale_order_number, 'return')}
                                                    disabled={submittingId === order.sale_order_number}
                                                    className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {submittingId === order.sale_order_number ? <Loader className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                                    <span className="ml-2">ขอคืนสินค้า</span>
                                                </button>
                                                <button
                                                    onClick={(e) => handleOpenConfirmDialog(e, order.sale_order_number, 'confirm')}
                                                    disabled={submittingId === order.sale_order_number}
                                                    className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {submittingId === order.sale_order_number ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                                    <span className="ml-2">ยืนยันจัดส่ง</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={handleExecuteAction} // (ปรับปรุง) เรียกใช้ฟังก์ชันใหม่
                title={confirmDialog.title}
                message={confirmDialog.message}
                actionType={confirmDialog.action} // (ปรับปรุง) ส่ง action type ไปด้วย
            />

            <ResultDialog
                isOpen={resultDialog.isOpen}
                onClose={() => setResultDialog({ ...resultDialog, isOpen: false })}
                type={resultDialog.type}
                message={resultDialog.message}
            />

            {isDetailModalOpen && (
                <SalesHistoryDetail
                    orderId={selectedOrderId}
                    onClose={() => setIsDetailModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ConfirmDelivery;