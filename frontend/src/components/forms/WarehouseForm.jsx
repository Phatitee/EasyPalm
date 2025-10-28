import React, { useState, useEffect } from 'react';
import { Save, X, Archive, MapPin, Hash } from 'lucide-react';

const WarehouseForm = ({ initialData, onSave, onClose }) => {
    const [warehouse, setWarehouse] = useState({
        warehouse_id: '',
        warehouse_name: '',
        location: '',
        capacity: ''
    });
    const [error, setError] = useState('');

    const isEditMode = Boolean(initialData);

    useEffect(() => {
        if (initialData) {
            setWarehouse({
                warehouse_id: initialData.warehouse_id || '',
                warehouse_name: initialData.warehouse_name || '',
                location: initialData.location || '',
                capacity: initialData.capacity || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Allow only numbers for capacity
        if (name === 'capacity' && value && !/^\d*\.?\d*$/.test(value)) {
            return;
        }
        setWarehouse(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!warehouse.warehouse_id || !warehouse.warehouse_name || !warehouse.capacity) {
            setError('กรุณากรอกข้อมูล: รหัสคลังสินค้า, ชื่อคลังสินค้า และความจุ');
            return;
        }
        setError('');
        onSave(warehouse);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4 p-8" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Archive className="mr-3 text-blue-600" />
                            {isEditMode ? 'แก้ไขข้อมูลคลังสินค้า' : 'เพิ่มคลังสินค้าใหม่'}
                        </h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={28} /></button>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสคลังสินค้า</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    name="warehouse_id"
                                    value={warehouse.warehouse_id}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    placeholder="เช่น W003"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อคลังสินค้า</label>
                             <div className="relative">
                                <Archive className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    name="warehouse_name"
                                    value={warehouse.warehouse_name}
                                    onChange={handleChange}
                                    placeholder="เช่น คลังสินค้าภาคใต้"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ที่ตั้ง</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={warehouse.location}
                                        onChange={handleChange}
                                        placeholder="เช่น อ.เมือง จ.สุราษฎร์ธานี"
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ความจุ (kg)</label>
                                 <input
                                    type="text"
                                    name="capacity"
                                    value={warehouse.capacity}
                                    onChange={handleChange}
                                    placeholder="เช่น 100000"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">
                            ยกเลิก
                        </button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center">
                            <Save className="mr-2" size={18} />
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WarehouseForm;