// frontend/src/pages/warehouse/WarehouseManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader, ServerCrash } from 'lucide-react';

const WarehouseManagement = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ warehouse_id: '', warehouse_name: '', location: '', capacity: 100000 });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/warehouses');
            if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลคลังสินค้าได้');
            const data = await response.json();
            setWarehouses(data);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing
            ? `http://localhost:5000/warehouses/${formData.warehouse_id}`
            : 'http://localhost:5000/warehouses';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    capacity: parseFloat(formData.capacity) // Ensure capacity is a number
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            alert(`ดำเนินการสำเร็จ!`);
            resetForm();
            fetchWarehouses();
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const handleEdit = (warehouse) => {
        setIsEditing(true);
        setFormData(warehouse);
    };

    const handleDelete = async (warehouseId, warehouseName) => {
        if (!window.confirm(`คุณต้องการลบคลังสินค้า "${warehouseName}" (${warehouseId}) จริงๆ หรือ?`)) return;
        try {
            const response = await fetch(`http://localhost:5000/warehouses/${warehouseId}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            alert(result.message);
            fetchWarehouses();
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };
    
    const resetForm = () => {
        setIsEditing(false);
        setFormData({ warehouse_id: '', warehouse_name: '', location: '', capacity: 100000 });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">จัดการคลังสินค้า</h1>
                <p className="text-lg text-gray-500 mt-2">เพิ่ม แก้ไข หรือลบคลังสินค้าในระบบ</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{isEditing ? `แก้ไขคลังสินค้า: ${formData.warehouse_id}` : 'เพิ่มคลังสินค้าใหม่'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">รหัสคลังสินค้า</label>
                        <input name="warehouse_id" value={formData.warehouse_id} onChange={handleInputChange} placeholder="เช่น W003" required disabled={isEditing} className="w-full px-4 py-2 border rounded-lg bg-gray-50 disabled:bg-gray-200" />
                    </div>
                     <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อคลังสินค้า</label>
                        <input name="warehouse_name" value={formData.warehouse_name} onChange={handleInputChange} placeholder="เช่น คลังสินค้า B" required className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                     <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">ที่ตั้ง</label>
                        <input name="location" value={formData.location} onChange={handleInputChange} placeholder="เช่น อ.เมือง จ.กระบี่" className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div className="lg:col-span-4 flex justify-end gap-3 mt-4">
                         <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">ยกเลิก</button>
                         <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                            {isEditing ? <Edit size={16} /> : <Plus size={16} />}
                            {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มคลังสินค้า'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อคลังสินค้า</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ที่ตั้ง</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan="4" className="text-center p-10"><Loader className="animate-spin text-blue-500 mx-auto" /></td></tr>
                            ) : error ? (
                                <tr><td colSpan="4" className="text-center p-10 text-red-500"><ServerCrash className="mx-auto mb-2" />{error}</td></tr>
                            ) : warehouses.map(w => (
                                <tr key={w.warehouse_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-mono">{w.warehouse_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{w.warehouse_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{w.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center justify-center gap-4">
                                            <button onClick={() => handleEdit(w)} className="text-yellow-600 hover:text-yellow-800 transition-transform transform hover:scale-110" title="แก้ไข"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(w.warehouse_id, w.warehouse_name)} className="text-red-600 hover:text-red-800 transition-transform transform hover:scale-110" title="ลบ"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {warehouses.length === 0 && !isLoading && !error && (
                    <p className="text-center py-10 text-gray-500">-- ไม่พบข้อมูลคลังสินค้า --</p>
                )}
            </div>
        </div>
    );
};

export default WarehouseManagement;