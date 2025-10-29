import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Search, Filter, Loader, ServerCrash, Inbox } from 'lucide-react';

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
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (warehouseFilter) params.append('warehouse_id', warehouseFilter);
            
            const response = await fetch(`http://127.0.0.1:5000/stock?${params.toString()}`, { cache: 'no-cache' });
            if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลสต็อกได้');
            
            const data = await response.json();
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
                const res = await fetch('http://127.0.0.1:5000/warehouses');
                if (!res.ok) throw new Error('Failed to fetch warehouses');
                setWarehouses(await res.json());
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
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Layers className="mr-3 text-green-600"/>
                    ภาพรวมสต็อกคงคลัง
                </h1>
                <div className="text-right">
                    <p className="text-sm text-gray-500">มูลค่าสต็อกรวมโดยประมาณ</p>
                    <p className="text-2xl font-bold text-green-700">
                        {totalStockValue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                    </p>
                </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-2/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตามชื่อสินค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="relative w-full md:w-1/3">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                        value={warehouseFilter}
                        onChange={(e) => setWarehouseFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">คลังสินค้าทั้งหมด</option>
                        {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                 <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>
            ) : error ? (
                <div className="flex flex-col justify-center items-center h-64 text-red-600 bg-red-50 p-10 rounded-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>
            ) : stockLevels.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <Inbox size={64} className="mx-auto text-gray-400" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700">ไม่พบข้อมูลสต็อก</h2>
                    <p className="mt-2 text-gray-500">ไม่พบสินค้าคงคลังที่ตรงกับเงื่อนไขการค้นหาของคุณ</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คลังสินค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สินค้า</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ปริมาณคงเหลือ (kg)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ต้นทุนเฉลี่ย/หน่วย</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">มูลค่าสต็อกรวม</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stockLevels.map(item => (
                                    <tr key={`${item.warehouse_id}-${item.p_id}`}>
                                        <td className="px-6 py-4 text-gray-600">{item.warehouse_name}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.product_name}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-blue-600 text-lg">{item.quantity.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-gray-700">{item.average_cost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-800">{(item.quantity * item.average_cost).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</td>
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