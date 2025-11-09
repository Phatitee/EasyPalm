// frontend/src/pages/warehouse/PendingStorage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PackagePlus, CheckCircle, Loader, ServerCrash, Inbox, Archive, AlertTriangle, XCircle, Users, Truck, RefreshCw } from 'lucide-react';
import StorageDetail from './StorageDetail';
import SalesHistoryDetail from '../sales/SalesHistoryDetail';

// (Component ConfirmDialog และ ResultDialog ไม่มีการแก้ไข)
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, actionType }) => {
    if (!isOpen) return null;
    const confirmButtonColor = actionType === 'SO_Return' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600';
    const iconContainerColor = actionType === 'SO_Return' ? 'bg-blue-100' : 'bg-orange-100';
    const iconColor = actionType === 'SO_Return' ? 'text-blue-600' : 'text-orange-600';

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
    const [items, setItems] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submittingId, setSubmittingId] = useState(null);
    const { user } = useAuth();

    const [selectedItem, setSelectedItem] = useState({ id: null, type: null });
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null, warehouseId: null, title: '', message: '', actionType: '' });
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' });

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // (สันนิษฐานว่า /pending-storage-items สำหรับ SO_Return จะมี field 'warehouse_id' มาให้ด้วย)
            const [itemsRes, warehousesRes] = await Promise.all([
                fetch('http://127.0.0.1:5000/warehouse/pending-storage-items'),
                fetch('http://127.0.0.1:5000/warehouses')
            ]);

            if (!itemsRes.ok || !warehousesRes.ok) throw new Error('ไม่สามารถดึงข้อมูลเริ่มต้นได้');

            const itemsData = await itemsRes.json();
            const warehousesData = await warehousesRes.json();

            setItems(itemsData);
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

    // --- ( ★★★ เริ่มส่วนที่แก้ไข ★★★ ) ---
    // (ปรับปรุง) ฟังก์ชันเปิด Dialog ให้รองรับทั้ง PO และ SO_Return
    const handleOpenConfirmDialog = (e, item) => {
        e.stopPropagation();

        const isReturn = item.type === 'SO_Return';
        let warehouseId = null;
        let warehouseName = null;

        if (isReturn) {
            // 1. ถ้าเป็น "รับคืน" -> ดึง ID คลังจาก `item` โดยตรง
            warehouseId = item.warehouse_id; // (สำคัญ: ต้องมีข้อมูลนี้จาก Backend)
            warehouseName = warehouses.find(w => w.warehouse_id === warehouseId)?.warehouse_name || 'ไม่พบคลัง';
        } else {
            // 2. ถ้าเป็น "รับเข้า (PO)" -> อ่านค่าจาก <select>
            const form = e.currentTarget.form;
            warehouseId = form.elements[`warehouse-select-${item.order_number}`].value;
            warehouseName = warehouses.find(w => w.warehouse_id === warehouseId)?.warehouse_name || 'ไม่ระบุคลัง';
        }

        if (!warehouseId) {
            setResultDialog({ isOpen: true, type: 'error', message: 'กรุณาเลือกคลังสินค้าที่จะจัดเก็บ' });
            return;
        }

        setConfirmDialog({
            isOpen: true,
            item: item,
            warehouseId: warehouseId, // (ID คลังที่ถูกต้อง ไม่ว่าจะมาจาก <select> หรือ `item`)
            actionType: item.type,
            title: isReturn ? 'ยืนยันรับคืนสินค้า' : 'ยืนยันรับสินค้าเข้าคลัง',
            message: isReturn
                ? `คุณต้องการยืนยันรับคืนสินค้าจาก SO ${item.order_number} เข้าคลัง ${warehouseName} ใช่หรือไม่?`
                : `คุณต้องการยืนยันการรับสินค้าจาก PO ${item.order_number} เข้าคลัง ${warehouseName} ใช่หรือไม่?`
        });
    };
    // --- ( ★★★ จบส่วนที่แก้ไข ★★★ ) ---

    // (ฟังก์ชัน handleExecuteConfirm ไม่ต้องแก้ไข ตรรกะถูกต้องแล้ว)
    const handleExecuteConfirm = async () => {
        const { item, warehouseId } = confirmDialog;
        setSubmittingId(item.order_number);
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        const isReturn = item.type === 'SO_Return';
        const url = isReturn
            ? 'http://127.0.0.1:5000/warehouse/confirm-return'
            : 'http://127.0.0.1:5000/warehouse/receive-items';

        const body = isReturn
            ? { sales_order_number: item.order_number, warehouse_id: warehouseId, employee_id: user.e_id }
            : { purchase_order_number: item.order_number, warehouse_id: warehouseId, employee_id: user.e_id };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
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

    const handleRowDoubleClick = (item) => {
        setSelectedItem({ id: item.order_number, type: item.type });
        setIsDetailModalOpen(true);
    };

    const renderDetailModal = () => {
        if (!isDetailModalOpen) return null;
        if (selectedItem.type === 'PO') return <StorageDetail orderId={selectedItem.id} onClose={() => setIsDetailModalOpen(false)} />;
        if (selectedItem.type === 'SO_Return') return <SalesHistoryDetail orderId={selectedItem.id} onClose={() => setIsDetailModalOpen(false)} />;
        return null;
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /> <span className="ml-4 text-lg">กำลังโหลดข้อมูล...</span></div>;
    if (error) return <div className="flex flex-col justify-center items-center h-screen text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={handleExecuteConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                actionType={confirmDialog.actionType}
            />
            <ResultDialog isOpen={resultDialog.isOpen} onClose={() => setResultDialog({ ...resultDialog, isOpen: false })} type={resultDialog.type} message={resultDialog.message} />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center"><PackagePlus className="inline-block mr-3 text-orange-600 dark:text-orange-400" />รายการรอจัดเก็บเข้าคลัง</h1>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                    <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">ไม่มีรายการที่ต้องดำเนินการ</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">ไม่มีรายการที่รอจัดเก็บเข้าคลังในขณะนี้</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ประเภท</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">เลขที่เอกสาร</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ที่มา</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">วันที่</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {items.map((item) => {

                                    // --- ( ★★★ เริ่มส่วนที่แก้ไข ★★★ ) ---
                                    // (คำนวณชื่อคลังสำหรับ 'SO_Return' ไว้ล่วงหน้า)
                                    const returnWarehouseName = item.type === 'SO_Return'
                                        ? (warehouses.find(w => w.warehouse_id === item.warehouse_id)?.warehouse_name || 'ไม่พบคลัง')
                                        : null;
                                    // --- ( ★★★ จบส่วนที่แก้ไข ★★★ ) ---

                                    return (
                                        <tr key={`${item.type}-${item.order_number}`} onDoubleClick={() => handleRowDoubleClick(item)} className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {item.type === 'PO' ? (<span className="flex items-center text-blue-600 dark:text-blue-400 font-semibold"><Users className="mr-2" size={16} /> รับเข้าใหม่</span>) : (<span className="flex items-center text-red-600 dark:text-red-400 font-semibold"><Truck className="mr-2" size={16} /> รับคืน</span>)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.order_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.source_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(item.order_date + 'Z').toLocaleString('th-TH', {
                                                year: '2-digit', month: '2-digit', day: '2-digit',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

                                                <form className="flex items-center justify-center gap-2">

                                                    {/* ( ★★★ ) ส่วนที่แก้ไข: แสดงผลแบบมีเงื่อนไข ( ★★★ ) */}
                                                    <div className="relative w-48">
                                                        {item.type === 'PO' ? (
                                                            // 1. ถ้าเป็น 'PO' -> แสดง Dropdown ให้เลือก
                                                            <>
                                                                <Archive className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                                                <select
                                                                    id={`warehouse-select-${item.order_number}`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="w-full pl-9 pr-4 py-2 border rounded-lg appearance-none bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                                                >
                                                                    <option value="">-- เลือกคลัง --</option>
                                                                    {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                                                                </select>
                                                            </>
                                                        ) : (
                                                            // 2. ถ้าเป็น 'SO_Return' -> แสดง Text (ReadOnly)
                                                            <div className="flex items-center justify-start h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700">
                                                                <Archive className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" size={16} />
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={returnWarehouseName}>
                                                                    {returnWarehouseName}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button type="button" onClick={(e) => handleOpenConfirmDialog(e, item)} disabled={submittingId === item.order_number} className={`flex items-center justify-center font-bold py-2 px-4 rounded-lg transition text-white disabled:bg-gray-400 ${item.type === 'SO_Return' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600'}`}>
                                                        {submittingId === item.order_number ? (<Loader className="animate-spin mr-2" size={16} />) : (item.type === 'SO_Return' ? <RefreshCw className="mr-2" size={16} /> : <CheckCircle className="mr-2" size={16} />)}
                                                        {submittingId === item.order_number ? 'กำลังบันทึก...' : (item.type === 'SO_Return' ? 'ยืนยันรับคืน' : 'ยืนยัน')}
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {renderDetailModal()}
        </div>
    );
};

export default PendingStorage;