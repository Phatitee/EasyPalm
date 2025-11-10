// frontend/src/pages/shared/StockLevel.jsx (FIXED)

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Search, Filter, Loader, ServerCrash, Inbox } from 'lucide-react';

// 1. ★★★ Import ฟังก์ชันจาก api.js ★★★
import { getStockLevels, getWarehouses } from '../../services/api';

// 2. ★★★ ลบ API_URL ทิ้งไป ★★★
// const API_URL = process.env.REACT_APP_API_URL;

const StockLevel = () => {
    const [stockLevels, setStockLevels] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for filtering and searching
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');

    const fetchStockLevels = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (warehouseFilter) params.warehouse_id = warehouseFilter;
            
            // 3. ★★★ แก้ไข: นี่คือบรรทัดที่ 39 ที่ Error ★★★
            // เปลี่ยนจาก fetch มาใช้ getStockLevels
            const data = await getStockLevels(params);
            setStockLevels(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, warehouseFilter]);
    
    // Fetch warehouses only once for the filter dropdown
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                // 4. ★★★ แก้ไข: ใช้ getWarehouses ★★★
                const data = await getWarehouses();
                setWarehouses(data);
            } catch (err) {
                console.error(err);
                // Set a user-friendly error if warehouses fail to load
                setError('ไม่สามารถโหลดตัวเลือกคลังสินค้าได้');
            }
        };
        fetchWarehouses();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStockLevels();
        }, 500); // Debounce search input
        return () => clearTimeout(timer);
    }, [fetchStockLevels]);

    const totalStockValue = stockLevels.reduce((total, item) => total + (item.quantity * item.average_cost), 0);

    return (
        // ★★★ FIX 1: Main Container Background ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    {/* ★★★ FIX 2: Header Icon Color ★★★ */}
                    <Layers className="mr-3 text-green-600 dark:text-green-400"/>
                    ภาพรวมสต็อกคงคลัง
                </h1>
                <div className="text-right">
                    {/* ★★★ FIX 3: Summary Text Colors ★★★ */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">มูลค่าสต็อกรวมโดยประมาณ</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {totalStockValue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                    </p>
                </div>
            </div>

            {/* Search and Filter Controls */}
            {/* ★★★ FIX 4: Panel Background and Shadow ★★★ */}
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center transition-colors duration-300">
                <div className="relative w-full md:w-2/3">
                    {/* ★★★ FIX 5: Search Icon Color ★★★ */}
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตามชื่อสินค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        // ★★★ FIX 6: Search Input Styling ★★★
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                </div>
                <div className="relative w-full md:w-1/3">
                    {/* ★★★ FIX 7: Filter Icon Color ★★★ */}
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <select
                        value={warehouseFilter}
                        onChange={(e) => setWarehouseFilter(e.target.value)}
                        // ★★★ FIX 8: Select Input Styling ★★★
                        className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="">คลังสินค้าทั้งหมด</option>
                        {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                 // ★★★ FIX 9: Loading State ★★★
                 <div className="flex justify-center items-center h-64 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /></div>
            ) : error ? (
                // ★★★ FIX 10: Error State ★★★
                <div className="flex flex-col justify-center items-center h-64 text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>
            ) : stockLevels.length === 0 ? (
                // ★★★ FIX 11: Empty State Background and Text ★★★
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                    <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">ไม่พบข้อมูลสต็อก</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">ไม่พบสินค้าคงคลังที่ตรงกับเงื่อนไขการค้นหาของคุณ</p>
                </div>
            ) : (
                // ★★★ FIX 12: Table Container Background and Shadow ★★★
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             {/* ★★★ FIX 13: Table Header Background and Text ★★★ */}
                             <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">คลังสินค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">สินค้า</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ปริมาณคงเหลือ (kg)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ต้นทุนเฉลี่ย/หน่วย</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">มูลค่าสต็อกรวม</th>
                                </tr>
                            </thead>
                            {/* ★★★ FIX 14: Table Body Background and Divider ★★★ */}
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {stockLevels.map(item => (
                                    <tr key={`${item.warehouse_id}-${item.p_id}`} className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150">
                                        {/* ★★★ FIX 15: Text Colors ★★★ */}
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.warehouse_name}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{item.product_name}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-blue-600 dark:text-blue-400 text-lg">{item.quantity.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{item.average_cost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-800 dark:text-gray-200">{(item.quantity * item.average_cost).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockLevel;