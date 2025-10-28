import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader, ServerCrash, ClipboardList, User, Package, Truck, CheckCheck } from 'lucide-react';

// --- Component สำหรับแสดง Badge สถานะ (เหมือนกับหน้า SalesHistory) ---
const StatusBadge = ({ status }) => {
    const statusConfig = {
        Pending: { icon: Package, text: 'รอเบิก', color: 'yellow' },
        Shipped: { icon: Truck, text: 'จัดส่งแล้ว', color: 'blue' },
        Delivered: { icon: CheckCheck, text: 'ส่งมอบสำเร็จ', color: 'green' },
    };
    const config = statusConfig[status] || { icon: null, text: status, color: 'gray' };
    
    return (
        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-${config.color}-100 text-${config.color}-800`}>
            {config.icon && <config.icon className="mr-1.5" size={14} />}
            {config.text}
        </span>
    );
};

const ShipmentHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchHistory = useCallback(async (name = '') => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (name) params.append('name', name);

            const response = await fetch(`http://localhost:5000/api/warehouse/shipment-history?${params.toString()}`);
            if (!response.ok) {
                throw new Error('ไม่สามารถโหลดข้อมูลประวัติการเบิกได้');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchHistory(searchTerm);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">ประวัติการเบิกสินค้า</h1>
                <p className="text-lg text-gray-500 mt-2">ตรวจสอบรายการใบสั่งขายที่เบิกออกจากคลังแล้ว</p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-lg mb-8">
                <form onSubmit={handleSearch} className="flex items-center gap-4">
                    <div className="relative flex-grow">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            placeholder="ค้นหาด้วยชื่อลูกค้า..." 
                            className="w-full p-2 pl-10 border rounded-lg" 
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                        <Search size={18} />
                        <span>ค้นหา</span>
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="flex justify-center items-center p-16"><Loader className="animate-spin text-blue-500" size={48} /></div>
            ) : error ? (
                <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg"><ServerCrash className="mx-auto mb-2" />{error}</div>
            ) : orders.length === 0 ? (
                <div className="text-center text-gray-500 bg-gray-50 p-10 rounded-lg">
                    <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold">ไม่พบข้อมูลประวัติการเบิก</h3>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เลขที่ SO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อลูกค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่สั่ง</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr 
                                        key={order.sale_order_number}
                                        onDoubleClick={() => navigate(`/sales/history/${order.sale_order_number}`)}
                                        className="hover:bg-blue-50/50 cursor-pointer"
                                        title="ดับเบิ้ลคลิกเพื่อดูรายละเอียด"
                                    >
                                        <td className="px-6 py-4 font-mono">{order.sale_order_number}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{order.customer_name}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(order.s_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 text-center"><StatusBadge status={order.shipment_status} /></td>
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

export default ShipmentHistory;