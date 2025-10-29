import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PackagePlus, CheckCircle, Loader, ServerCrash, Inbox, Archive, AlertTriangle, XCircle } from 'lucide-react';
import StorageDetail from './StorageDetail';

// Helper Modal (ConfirmDialog) - สำหรับยืนยัน
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm transform transition-all animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button onClick={onClose} type="button" className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">ยกเลิก</button>
                    <button onClick={onConfirm} type="button" className="w-full px-4 py-2 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600">ยืนยัน</button>
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


const PendingStorage = () => {
    const [orders, setOrders] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submittingId, setSubmittingId] = useState(null);
    const { user } = useAuth();

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, orderNumber: null, warehouseId: null, title: '', message: '' });
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' });

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ordersRes, warehousesRes] = await Promise.all([
                fetch('http://127.0.0.1:5000/warehouse/pending-receipts'),
                fetch('http://127.0.0.1:5000/warehouses')
            ]);
            
            if (!ordersRes.ok || !warehousesRes.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลเริ่มต้นได้');
            }
            
            const ordersData = await ordersRes.json();
            const warehousesData = await warehousesRes.json();
            
            setOrders(ordersData);
            setWarehouses(warehousesData);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleOpenConfirmDialog = (e, orderNumber) => {
        e.stopPropagation();
        
        const form = e.currentTarget.form;
        const warehouseId = form.elements[`warehouse-select-${orderNumber}`].value;
        const warehouseName = warehouses.find(w => w.warehouse_id === warehouseId)?.warehouse_name || 'ไม่ระบุคลัง';

        if (!warehouseId) {
            setResultDialog({ isOpen: true, type: 'error', message: 'กรุณาเลือกคลังสินค้าที่จะจัดเก็บ' });
            return;
        }

        setConfirmDialog({
            isOpen: true,
            orderNumber: orderNumber,
            warehouseId: warehouseId,
            title: 'ยืนยันรับสินค้าเข้าคลัง',
            message: `คุณต้องการยืนยันการรับสินค้าจาก PO ${orderNumber} เข้าคลัง ${warehouseName} ใช่หรือไม่?`
        });
    };

    const handleExecuteReceiveItems = async () => {
        const { orderNumber, warehouseId } = confirmDialog;
        setSubmittingId(orderNumber);
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        try {
            const response = await fetch('http://127.0.0.1:5000/warehouse/receive-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchase_order_number: orderNumber,
                    warehouse_id: warehouseId,
                    employee_id: user.e_id,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'เกิดข้อผิดพลาด');
            }
            
            setResultDialog({ isOpen: true, type: 'success', message: result.message });
            fetchInitialData();
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
                onConfirm={handleExecuteReceiveItems}
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
                    <PackagePlus className="inline-block mr-3 text-orange-600 dark:text-orange-400" />
                    ยืนยันรับสินค้าเข้าคลัง
                </h1>
            </div>

            {orders.length === 0 ? (
                // ★★★ Dark Mode FIX: Empty State Background and Text ★★★
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                    <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">ไม่มีรายการที่ต้องดำเนินการ</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">ไม่มีรายการสั่งซื้อที่รอการรับเข้าคลังในขณะนี้</p>
                </div>
            ) : (
                // ★★★ Dark Mode FIX: Table Container Background and Shadow ★★★
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             {/* ★★★ Dark Mode FIX: Table Header Background and Text ★★★ */}
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">เลขที่ PO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">เกษตรกร</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">วันที่สั่งซื้อ</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">จัดการ</th>
                                </tr>
                            </thead>
                            {/* ★★★ Dark Mode FIX: Table Body Background and Divider ★★★ */}
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map((order) => (
                                    <tr 
                                        key={order.purchase_order_number}
                                        onDoubleClick={() => handleRowDoubleClick(order.purchase_order_number)}
                                        className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150"
                                    >
                                        {/* ★★★ Dark Mode FIX: Text Colors ★★★ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{order.purchase_order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.farmer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.b_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <form className="flex items-center justify-center gap-2">
                                                <div className="relative w-48">
                                                     <Archive className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                                    <select 
                                                        id={`warehouse-select-${order.purchase_order_number}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        // ★★★ Dark Mode FIX: Select Input Styling ★★★
                                                        className="w-full pl-9 pr-4 py-2 border rounded-lg appearance-none bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                                    >
                                                        <option value="">-- เลือกคลัง --</option>
                                                        {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                                                    </select>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleOpenConfirmDialog(e, order.purchase_order_number)}
                                                    disabled={submittingId === order.purchase_order_number}
                                                    className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400"
                                                >
                                                    {submittingId === order.purchase_order_number ? (
                                                        <Loader className="animate-spin mr-2" size={16} />
                                                    ) : (
                                                        <CheckCircle className="mr-2" size={16} />
                                                    )}
                                                    {submittingId === order.purchase_order_number ? 'กำลังบันทึก...' : 'ยืนยัน'}
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {isDetailModalOpen && (
                <StorageDetail
                    orderId={selectedOrderId} 
                    onClose={() => setIsDetailModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default PendingStorage;