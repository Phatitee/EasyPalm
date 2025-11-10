// frontend/src/pages/warehouse/WarehouseManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Archive, PlusCircle, Edit, Trash2, Loader, ServerCrash, Inbox, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import WarehouseForm from '../../components/forms/WarehouseForm';


const API_URL = process.env.REACT_APP_API_URL;
// Helper Modal (ConfirmDialog) - สำหรับยืนยัน
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm transform transition-all animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button onClick={onClose} type="button" className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">ยกเลิก</button>
                    <button onClick={onConfirm} type="button" className="w-full px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700">ยืนยัน</button>
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

const WarehouseManagement = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, warehouse: null, title: '', message: '', onConfirm: () => {} });
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' });

    const fetchWarehouses = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('${API_URL}/purchasing/warehouse-summary', { cache: 'no-cache' });
            
            if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลคลังสินค้าได้');
            const data = await response.json();
            setWarehouses(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const handleOpenModal = (warehouse = null) => {
        setEditingWarehouse(warehouse);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingWarehouse(null);
        setIsModalOpen(false);
    };

    const handleSaveWarehouse = async (warehouseData) => {
        const isEditMode = Boolean(warehouseData && warehouseData.warehouse_id && editingWarehouse);
        
        if (isEditMode) {
            const newCapacity = parseFloat(warehouseData.capacity);
            const originalWarehouse = warehouses.find(w => w.warehouse_id === warehouseData.warehouse_id);
            
            if (originalWarehouse) {
                const currentStock = parseFloat(originalWarehouse.current_stock || 0);
                
                if (newCapacity < currentStock) {
                    setResultDialog({ 
                        isOpen: true, 
                        type: 'error', 
                        message: `ไม่สามารถลดความจุ (${newCapacity.toLocaleString()} kg) ให้ต่ำกว่าสต็อกปัจจุบัน (${currentStock.toLocaleString()} kg) ได้` 
                    });
                    return; 
                }
            }
        }

        const url = isEditMode 
            ? `${API_URL}/warehouses/${warehouseData.warehouse_id}` 
            : '${API_URL}/warehouses';
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(warehouseData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาดในการบันทึก');
            
            setResultDialog({ isOpen: true, type: 'success', message: `บันทึกข้อมูลคลังสินค้า '${result.warehouse_name}' สำเร็จ!` });
            handleCloseModal();
            fetchWarehouses();
        } catch (err) {
            setResultDialog({ isOpen: true, type: 'error', message: `เกิดข้อผิดพลาด: ${err.message}` });
        }
    };

    const handleDeleteClick = (warehouse) => {
        setConfirmDialog({
            isOpen: true,
            warehouse: warehouse,
            title: 'ยืนยันการลบคลังสินค้า',
            message: `คุณต้องการลบคลังสินค้า '${warehouse.warehouse_name}' (${warehouse.warehouse_id}) ใช่หรือไม่?`,
            onConfirm: handleExecuteDelete
        });
    };

    const handleExecuteDelete = async () => {
        const warehouse = confirmDialog.warehouse;
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        try {
            const response = await fetch(`${API_URL}/warehouses/${warehouse.warehouse_id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาดในการลบ');
            
            setResultDialog({ isOpen: true, type: 'success', message: result.message });
            fetchWarehouses();
        } catch (err) {
            setResultDialog({ isOpen: true, type: 'error', message: `เกิดข้อผิดพลาด: ${err.message}` });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <ConfirmDialog {...confirmDialog} onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} />
            <ResultDialog {...resultDialog} onClose={() => setResultDialog({ ...resultDialog, isOpen: false })} />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <Archive className="mr-3 text-blue-600 dark:text-blue-400"/>
                    จัดการคลังสินค้า
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                    <PlusCircle size={20} />
                    เพิ่มคลังสินค้า
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /></div>
            ) : error ? (
                <div className="flex flex-col justify-center items-center h-64 text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>
            ) : warehouses.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                    <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">ไม่พบคลังสินค้า</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">ยังไม่มีข้อมูลคลังสินค้าในระบบ คลิก 'เพิ่มคลังสินค้า' เพื่อเริ่มต้น</p>
                </div>
            ) : (
                // ★★★ MODIFY START: แก้ไขปัญหา Overflow โดยย้าย overflow-x-auto มาที่นี่ ★★★
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-x-auto transition-colors duration-300">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">รหัส</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ชื่อคลังสินค้า</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ที่ตั้ง</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">สินค้าปัจจุบัน (kg)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ความจุ (kg)</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {warehouses.map(w => (
                                <tr key={w.warehouse_id} className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-700 dark:text-gray-300">{w.warehouse_id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{w.warehouse_name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{w.location}</td>
                                    <td className="px-6 py-4 text-right font-medium text-blue-600 dark:text-blue-400">{parseFloat(w.current_stock || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-gray-200">{parseFloat(w.capacity).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button onClick={() => handleOpenModal(w)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"><Edit size={18} /></button>
                                            <button onClick={() => handleDeleteClick(w)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                // ★★★ MODIFY END ★★★
            )}
            
            {isModalOpen && (
                <WarehouseForm 
                    initialData={editingWarehouse}
                    onSave={handleSaveWarehouse}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default WarehouseManagement;