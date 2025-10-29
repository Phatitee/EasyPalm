import React, { useState, useEffect } from 'react';
import { Save, X, Archive, MapPin, Hash, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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
        if (error) setError(''); // Clear error on change
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

    // Helper class for Input styling
    const inputClasses = (disabled) => `w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 
                                      dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${disabled ? 'disabled:bg-gray-600 disabled:text-gray-400' : ''}`;
    const plainInputClasses = (disabled) => `w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 
                                            dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${disabled ? 'disabled:bg-gray-600 disabled:text-gray-400' : ''}`;


    return (
        // ★★★ Dark Mode FIX: Modal Overlay Background ★★★
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 z-40 flex justify-center items-center" onClick={onClose}>
            {/* ★★★ Dark Mode FIX: Modal Container Background ★★★ */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4 p-8" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                            <Archive className="mr-3 text-blue-600 dark:text-blue-400" />
                            {isEditMode ? 'แก้ไขข้อมูลคลังสินค้า' : 'เพิ่มคลังสินค้าใหม่'}
                        </h2>
                        {/* ★★★ Dark Mode FIX: Close Button Color ★★★ */}
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"><X size={28} /></button>
                    </div>

                    {/* ★★★ Dark Mode FIX: Error Text Color ★★★ */}
                    {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4 flex items-center"><AlertTriangle size={16} className="mr-2"/>{error}</p>}

                    <div className="space-y-4">
                        <div>
                            {/* ★★★ Dark Mode FIX: Label Text Color ★★★ */}
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รหัสคลังสินค้า</label>
                            <div className="relative">
                                {/* ★★★ Dark Mode FIX: Icon Color ★★★ */}
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                <input
                                    type="text"
                                    name="warehouse_id"
                                    value={warehouse.warehouse_id}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    placeholder="เช่น W003"
                                    className={inputClasses(isEditMode)}
                                />
                            </div>
                        </div>
                        <div>
                            {/* ★★★ Dark Mode FIX: Label Text Color ★★★ */}
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อคลังสินค้า</label>
                             <div className="relative">
                                {/* ★★★ Dark Mode FIX: Icon Color ★★★ */}
                                <Archive className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                <input
                                    type="text"
                                    name="warehouse_name"
                                    value={warehouse.warehouse_name}
                                    onChange={handleChange}
                                    placeholder="เช่น คลังสินค้าภาคใต้"
                                    className={inputClasses(false)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                {/* ★★★ Dark Mode FIX: Label Text Color ★★★ */}
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ที่ตั้ง</label>
                                <div className="relative">
                                    {/* ★★★ Dark Mode FIX: Icon Color ★★★ */}
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={warehouse.location}
                                        onChange={handleChange}
                                        placeholder="เช่น อ.เมือง จ.สุราษฎร์ธานี"
                                        className={inputClasses(false)}
                                    />
                                </div>
                            </div>
                            <div>
                                {/* ★★★ Dark Mode FIX: Label Text Color ★★★ */}
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ความจุ (kg)</label>
                                 <input
                                    type="text"
                                    name="capacity"
                                    value={warehouse.capacity}
                                    onChange={handleChange}
                                    placeholder="เช่น 100000"
                                    className={plainInputClasses(false)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ★★★ Dark Mode FIX: Footer Divider and Button Styling ★★★ */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} 
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100">
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