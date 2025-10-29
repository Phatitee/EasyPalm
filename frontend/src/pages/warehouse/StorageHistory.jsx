import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, List, Loader, ServerCrash, Inbox, Archive } from 'lucide-react';
import StorageDetail from './StorageDetail'; // Reuse the existing detail modal

const StorageHistory = () => {
    const [orders, setOrders] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for filtering and searching
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');

    // State for modal
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchStorageHistory = useCallback(async () => {
        setLoading(true);
        try {
            // Build the query string with a default status of 'Completed'
            const params = new URLSearchParams({ status: 'Completed' });
            if (searchTerm) params.append('search', searchTerm);
            if (warehouseFilter) params.append('warehouse_id', warehouseFilter);
            
            const response = await fetch(`http://127.0.0.1:5000/purchaseorders?${params.toString()}`);
            if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลประวัติการจัดเก็บได้');
            
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, warehouseFilter]);
    
    // Fetch warehouses for the filter dropdown
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await fetch('http://127.0.0.1:5000/warehouses');
                if (!res.ok) throw new Error('Failed to fetch warehouses');
                setWarehouses(await res.json());
            } catch (err) {
                console.error(err);
            }
        };
        fetchWarehouses();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStorageHistory();
        }, 500); // Debounce search input
        return () => clearTimeout(timer);
    }, [fetchStorageHistory]);

    const handleRowClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <List className="mr-3 text-orange-600"/>
                ประวัติการจัดเก็บ
            </h1>

            {/* Search and Filter Controls */}
            <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-2/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตามเลขที่ PO หรือชื่อเกษตรกร..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="relative w-full md:w-1/3">
                    <Archive className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <Inbox size={64} className="mx-auto text-gray-400" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700">ไม่พบข้อมูล</h2>
                    <p className="mt-2 text-gray-500">ไม่พบประวัติการจัดเก็บที่ตรงกับเงื่อนไข</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เลขที่ PO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เกษตรกร</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่รับเข้าคลัง</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ยอดรวม</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ผู้รับผิดชอบ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map(order => (
                                    <tr key={order.purchase_order_number} onClick={() => handleRowClick(order.purchase_order_number)} className="hover:bg-gray-100 cursor-pointer">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.purchase_order_number}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.farmer_name}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(order.received_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-800">{parseFloat(order.b_total_price).toLocaleString('th-TH')} บาท</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{order.received_by_name || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {isDetailModalOpen && <StorageDetail orderId={selectedOrderId} onClose={() => setIsDetailModalOpen(false)} />}
        </div>
    );
};

export default StorageHistory;