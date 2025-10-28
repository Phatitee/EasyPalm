import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, ServerCrash, ArrowLeft, User, Calendar, Hash, Package, Truck, CheckCheck } from 'lucide-react';

// Component สำหรับแสดง Badge สถานะ (เหมือนกับหน้าหลัก)
const StatusBadge = ({ status }) => {
    const statusConfig = {
        Pending: { icon: Package, text: 'รอเบิก', color: 'yellow' },
        Shipped: { icon: Truck, text: 'จัดส่งแล้ว', color: 'blue' },
        Delivered: { icon: CheckCheck, text: 'ส่งมอบสำเร็จ', color: 'green' },
    };
    const config = statusConfig[status] || { icon: null, text: status, color: 'gray' };
    
    return (
        <span className={`px-4 py-2 text-sm font-semibold rounded-full bg-${config.color}-100 text-${config.color}-800 inline-flex items-center gap-2`}>
            {config.icon && <config.icon size={16} />}
            {config.text}
        </span>
    );
};

const SalesHistoryDetail = () => {
    const { orderNumber } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrderDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/salesorders/${orderNumber}`);
            if (!response.ok) {
                throw new Error('ไม่พบข้อมูลใบสั่งขาย');
            }
            setOrder(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [orderNumber]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
    if (error) return <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg"><ServerCrash className="mx-auto mb-2" />{error}</div>;
    if (!order) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold">
                <ArrowLeft size={18} />
                กลับไปหน้าประวัติ
            </button>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex flex-wrap justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">รายละเอียดใบสั่งขาย</h1>
                        <p className="text-lg text-gray-500 mt-1">ข้อมูลสรุปของใบสั่งขาย</p>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                         <StatusBadge status={order.shipment_status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-b py-6 mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2"><User size={14}/>ลูกค้า</h3>
                        <p className="text-lg font-medium text-gray-900">{order.customer_name}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2"><Hash size={14}/>เลขที่ใบสั่งขาย</h3>
                        <p className="text-lg font-mono text-gray-900">{order.sale_order_number}</p>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2"><Calendar size={14}/>วันที่สั่ง</h3>
                        <p className="text-lg font-medium text-gray-900">{new Date(order.s_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><Package/>รายการสินค้า</h2>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสสินค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อสินค้า</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จำนวน (กก.)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ราคา/หน่วย (บาท)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ราคารวม (บาท)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {order.items.map(item => (
                                    <tr key={item.p_id}>
                                        <td className="px-6 py-4 font-mono">{item.p_id}</td>
                                        <td className="px-6 py-4 font-medium">{item.product_name}</td>
                                        <td className="px-6 py-4 text-right">{item.quantity.toLocaleString('th-TH')}</td>
                                        <td className="px-6 py-4 text-right">{item.price_per_unit.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-semibold">{(item.quantity * item.price_per_unit).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                             <tfoot className="bg-gray-100">
                                <tr>
                                    <td colSpan="4" className="px-6 py-3 text-right font-bold text-gray-700">ยอดรวมสุทธิ</td>
                                    <td className="px-6 py-3 text-right font-bold text-xl text-blue-600">{order.s_total_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesHistoryDetail;