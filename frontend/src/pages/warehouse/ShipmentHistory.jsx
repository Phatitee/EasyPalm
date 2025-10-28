import React, { useState, useEffect, useCallback } from 'react';
import { Search, List, Loader, ServerCrash, Inbox } from 'lucide-react';
import ShipmentDetails from './ShipmentDetails'; // Reuse the existing detail modal

const ShipmentHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for searching
    const [searchTerm, setSearchTerm] = useState('');

    // State for modal
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchShipmentHistory = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            
            const response = await fetch(`http://localhost:5000/warehouse/shipment-history?${params.toString()}`, { cache: 'no-cache' });
            if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลประวัติการเบิกได้');
            
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchShipmentHistory();
        }, 500); // Debounce search input
        return () => clearTimeout(timer);
    }, [fetchShipmentHistory]);

    const handleRowClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
    };

    const getStatusChip = (status) => {
        const colors = {
            Shipped: "bg-yellow-100 text-yellow-800",
            Delivered: "bg-blue-100 text-blue-800",
        };
        const text = {
            Shipped: 'อยู่ระหว่างจัดส่ง',
            Delivered: 'จัดส่งสำเร็จ',
        };
        return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colors[status]}`}>{text[status] || status}</span>;
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <List className="mr-3 text-purple-600"/>
                ประวัติการเบิกสินค้า
            </h1>

            {/* Search Controls */}
            <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg flex items-center">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตามเลขที่ SO หรือชื่อลูกค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
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
                    <p className="mt-2 text-gray-500">ไม่พบประวัติการเบิกสินค้าที่ตรงกับเงื่อนไข</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เลขที่ SO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลูกค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่เบิก</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ผู้รับผิดชอบ</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map(order => (
                                    <tr key={order.sale_order_number} onClick={() => handleRowClick(order.sale_order_number)} className="hover:bg-gray-100 cursor-pointer">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.sale_order_number}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.customer_name}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(order.shipped_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{order.shipped_by_name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-center">{getStatusChip(order.shipment_status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {isDetailModalOpen && <ShipmentDetails orderId={selectedOrderId} onClose={() => setIsDetailModalOpen(false)} />}
        </div>
    );
};

export default ShipmentHistory;