import React, { useState, useEffect, useCallback } from 'react';
import { Loader, ServerCrash, CheckCircle, Truck, ClipboardList } from 'lucide-react';

const ConfirmDelivery = () => {
    const [shippedOrders, setShippedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ฟังก์ชันสำหรับดึงข้อมูล SO ที่มีสถานะ "Shipped" เท่านั้น
    const fetchShippedOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // ★★★ หัวใจหลัก: API นี้ถูกเรียกโดยมีการกรอง status=Shipped ★★★
            // ทำให้มั่นใจได้ว่าจะไม่มีสถานะ Delivered หรือ Pending ปนมา
            const response = await fetch('http://localhost:5000/salesorders?status=Shipped');
            
            if (!response.ok) {
                throw new Error('ไม่สามารถโหลดข้อมูลใบสั่งขายที่จัดส่งแล้วได้');
            }
            const data = await response.json();
            setShippedOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShippedOrders();
    }, [fetchShippedOrders]);

    // ฟังก์ชันสำหรับกดยืนยัน (จะเปลี่ยนสถานะเป็น Delivered และรายการจะหายไปจากหน้านี้)
    const handleConfirm = async (orderNumber) => {
        if (!window.confirm(`คุณต้องการยืนยันว่าลูกค้าได้รับสินค้าสำหรับ SO ${orderNumber} แล้วใช่หรือไม่?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/salesorders/${orderNumber}/confirm-delivery`, {
                method: 'PUT',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            alert(result.message);
            fetchShippedOrders(); // โหลดข้อมูลใหม่เพื่ออัปเดตรายการ
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-green-500" size={48} /></div>;
    }
    if (error) {
        return <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg"><ServerCrash className="mx-auto mb-2" />{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">ยืนยันการจัดส่งสินค้า</h1>
                <p className="text-lg text-gray-500 mt-2">รายการที่จัดส่งแล้วและรอการยืนยันจากลูกค้า</p>
            </div>

            {shippedOrders.length === 0 ? (
                <div className="text-center text-gray-500 bg-gray-50 p-10 rounded-lg">
                    <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold">ไม่มีรายการที่ต้องยืนยัน</h3>
                    <p>ไม่มีใบสั่งขายที่อยู่ในสถานะ "จัดส่งแล้ว" ในขณะนี้</p>
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
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ยอดรวม (บาท)</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {shippedOrders.map(order => (
                                    <tr key={order.sale_order_number} className="hover:bg-green-50/50">
                                        <td className="px-6 py-4 font-mono">{order.sale_order_number}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{order.customer_name}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(order.s_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 text-right font-semibold">
                                            {order.s_total_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                <Truck className="mr-1.5" size={14}/>
                                                {order.shipment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleConfirm(order.sale_order_number)}
                                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 mx-auto text-sm"
                                            >
                                                <CheckCircle size={16} />
                                                ยืนยันลูกค้าได้รับของ
                                            </button>
                                        </td>
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

export default ConfirmDelivery;