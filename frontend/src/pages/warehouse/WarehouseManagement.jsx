import React, { useState, useEffect, useCallback } from 'react';
import { Archive, PlusCircle, Edit, Trash2, Loader, ServerCrash, Inbox } from 'lucide-react';
import WarehouseForm from '../../components/forms/WarehouseForm'; // Import the new form component

const WarehouseManagement = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for modal management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);

    const fetchWarehouses = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/warehouses', { cache: 'no-cache' });
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
        const url = isEditMode 
            ? `http://localhost:5000/warehouses/${warehouseData.warehouse_id}` 
            : 'http://localhost:5000/warehouses';
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(warehouseData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาดในการบันทึก');
            
            alert(`บันทึกข้อมูลคลังสินค้า '${result.warehouse_name}' สำเร็จ!`);
            handleCloseModal();
            fetchWarehouses(); // Refresh list
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    const handleDeleteWarehouse = async (warehouse) => {
        if (!window.confirm(`คุณต้องการลบคลังสินค้า '${warehouse.warehouse_name}' (${warehouse.warehouse_id}) ใช่หรือไม่?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/warehouses/${warehouse.warehouse_id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาดในการลบ');
            
            alert(result.message);
            fetchWarehouses(); // Refresh list
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Archive className="mr-3 text-blue-600"/>
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
                 <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>
            ) : error ? (
                <div className="flex flex-col justify-center items-center h-64 text-red-600 bg-red-50 p-10 rounded-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>
            ) : warehouses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <Inbox size={64} className="mx-auto text-gray-400" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700">ไม่พบคลังสินค้า</h2>
                    <p className="mt-2 text-gray-500">ยังไม่มีข้อมูลคลังสินค้าในระบบ คลิก 'เพิ่มคลังสินค้า' เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัส</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อคลังสินค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ที่ตั้ง</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ความจุ (kg)</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {warehouses.map(w => (
                                    <tr key={w.warehouse_id}>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-700">{w.warehouse_id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{w.warehouse_name}</td>
                                        <td className="px-6 py-4 text-gray-600">{w.location}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-800">{parseFloat(w.capacity).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-4">
                                                <button onClick={() => handleOpenModal(w)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                                <button onClick={() => handleDeleteWarehouse(w)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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