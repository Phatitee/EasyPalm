import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, ServerCrash, CheckCircle, ArrowLeft, User, Calendar, Hash, Package } from 'lucide-react';

const ShipmentDetails = () => {
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

    const handleConfirmShipment = async () => {
        if (!window.confirm(`คุณต้องการยืนยันการเบิกสินค้าสำหรับ SO ${orderNumber} ใช่หรือไม่?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/warehouse/ship-order/${orderNumber}`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            alert(result.message);
            navigate('/warehouse/pending-shipments');
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-orange-500" size={48} /></div>;
    }
    if (error) {
        return <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg"><ServerCrash className="mx-auto mb-2" />{error}</div>;
    }
    if (!order) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold">
                <ArrowLeft size={18} />
                กลับไปหน้ารายการ
            </button>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex flex-wrap justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">รายละเอียดการขอเบิก</h1>
                        <p className="text-lg text-gray-500 mt-1">ตรวจสอบรายการสินค้าที่ต้องเบิกจากคลัง</p>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                         <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                             order.shipment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                         }`}>
                            สถานะ: {order.shipment_status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-b py-6 mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2"><User size={14}/>ลูกค้า</h3>
                        {/* ★★★ FIX: ใช้ customer_name ★★★ */}
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
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><Package/>รายการสินค้าที่ต้องเบิก</h2>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสสินค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อสินค้า</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จำนวนที่ต้องเบิก (กก.)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {order.items.map(item => (
                                    <tr key={item.p_id}>
                                        <td className="px-6 py-4 font-mono">{item.p_id}</td>
                                        <td className="px-6 py-4 font-medium">{item.product_name}</td>
                                        <td className="px-6 py-4 text-right font-bold text-lg text-orange-600">
                                            {item.quantity.toLocaleString('th-TH')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {order.shipment_status === 'Pending' && (
                    <div className="mt-8 text-right">
                        <button onClick={handleConfirmShipment} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 ml-auto text-base">
                            <CheckCircle size={20} />
                            ยืนยันการเบิกสินค้า
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShipmentDetails;