// frontend/src/pages/admin/WarehouseManagement.jsx
import React, { useState, useEffect } from 'react';

const WarehouseManagement = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({ warehouse_id: '', warehouse_name: '', location: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/warehouses');
            const data = await response.json();
            setWarehouses(data);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
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
                body: JSON.stringify(formData),
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

    const handleDelete = async (warehouseId) => {
        if (!window.confirm(`คุณต้องการลบคลังสินค้า ${warehouseId} จริงๆ หรือ?`)) return;
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
        setFormData({ warehouse_id: '', warehouse_name: '', location: '' });
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">จัดการคลังสินค้า</h1>
            
            {/* Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">{isEditing ? 'แก้ไขคลังสินค้า' : 'เพิ่มคลังสินค้าใหม่'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input name="warehouse_id" value={formData.warehouse_id} onChange={handleInputChange} placeholder="รหัสคลังสินค้า (เช่น W002)" required disabled={isEditing} className="px-4 py-2 border rounded-lg" />
                    <input name="warehouse_name" value={formData.warehouse_name} onChange={handleInputChange} placeholder="ชื่อคลังสินค้า" required className="px-4 py-2 border rounded-lg" />
                    <input name="location" value={formData.location} onChange={handleInputChange} placeholder="ที่ตั้ง (ถ้ามี)" className="px-4 py-2 border rounded-lg" />
                    <div className="md:col-span-3 flex justify-end gap-2">
                         <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">ยกเลิก</button>
                         <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">{isEditing ? 'บันทึก' : 'เพิ่ม'}</button>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัส</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อคลังสินค้า</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ที่ตั้ง</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading ? (<tr><td colSpan="4" className="text-center p-4">กำลังโหลด...</td></tr>) :
                        warehouses.map(w => (
                            <tr key={w.warehouse_id}>
                                <td className="px-6 py-4 whitespace-nowrap font-mono">{w.warehouse_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{w.warehouse_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{w.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(w)} className="text-indigo-600 hover:text-indigo-900 mr-4">แก้ไข</button>
                                    <button onClick={() => handleDelete(w.warehouse_id)} className="text-red-600 hover:text-red-900">ลบ</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WarehouseManagement;