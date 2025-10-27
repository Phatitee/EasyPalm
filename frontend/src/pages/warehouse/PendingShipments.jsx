// frontend/src/pages/warehouse/PendingShipments.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const PendingShipments = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingShipments();
    }, []);

    const fetchPendingShipments = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/warehouse/pending-shipments');
            if (!response.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลได้');
            }
            const data = await response.json();
            setPendingOrders(data);
        } catch (error) {
            console.error('Error fetching pending shipments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmShipment = async (orderNumber) => {
        if (!window.confirm(`คุณต้องการยืนยันการเบิกสินค้าสำหรับ SO ${orderNumber} ใช่หรือไม่?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/warehouse/ship-order/${orderNumber}`, {
                method: 'POST',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'เกิดข้อผิดพลาด');
            }

            alert(`ยืนยันการเบิกสินค้า ${orderNumber} สำเร็จ!`);
            fetchPendingShipments(); // รีเฟรชข้อมูลในหน้านี้
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">กำลังโหลดรายการ...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">สินค้าที่รอเบิก</h1>

            {pendingOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 bg-white p-10 rounded-lg shadow">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                    <h2 className="text-xl font-semibold">ไม่มีรายการรอเบิกสินค้า</h2>
                    <p>ไม่มีใบสั่งขายที่รอการเบิกสินค้าในขณะนี้</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left">เลขที่ใบสั่งขาย</th>
                                <th className="px-6 py-3 text-left">วันที่สั่ง</th>
                                <th className="px-6 py-3 text-left">ชื่อลูกค้า</th>
                                <th className="px-6 py-3 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {pendingOrders.map(order => (
                                <tr key={order.sale_order_number}>
                                    <td className="px-6 py-4 font-mono">{order.sale_order_number}</td>
                                    <td className="px-6 py-4">{format(new Date(order.s_date), 'dd/MM/yyyy')}</td>
                                    <td className="px-6 py-4">{order.farmer_name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleConfirmShipment(order.sale_order_number)}
                                            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition flex items-center justify-center mx-auto"
                                        >
                                            <TruckIcon className="w-5 h-5 mr-2" />
                                            ยืนยันการเบิก
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PendingShipments;