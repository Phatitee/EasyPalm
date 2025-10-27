// frontend/src/pages/warehouse/PendingStorage.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { InboxIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// --- Modal Component สำหรับยืนยันการรับเข้า ---
const ReceiveConfirmationModal = ({ order, warehouses, onClose, onConfirm }) => {
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]?.warehouse_id || '');

    if (!order) return null;

    const handleConfirm = () => {
        if (!selectedWarehouse) {
            alert('กรุณาเลือกคลังสินค้า');
            return;
        }
        onConfirm(order.purchase_order_number, selectedWarehouse);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up">
                <h2 className="text-xl font-bold mb-4">บันทึกการจัดเก็บสินค้า</h2>
                <p className="mb-1"><strong>เลขที่ใบสั่งซื้อ:</strong> {order.purchase_order_number}</p>
                <p className="mb-4"><strong>จากเกษตรกร:</strong> {order.farmer_name}</p>
                
                <div className="mb-4 border rounded-lg p-3 max-h-48 overflow-y-auto">
                    <p className="font-semibold mb-2">รายการสินค้า:</p>
                    <ul className="list-disc pl-5 text-sm">
                        {order.items.map((item, index) => (
                            <li key={index}>{item.product_name} - จำนวน: {item.quantity}</li>
                        ))}
                    </ul>
                </div>

                <div className="mb-6">
                    <label htmlFor="warehouse-select" className="block text-sm font-medium text-gray-700 mb-2">
                        จัดเก็บเข้าคลังสินค้า:
                    </label>
                    <select
                        id="warehouse-select"
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {warehouses.length > 0 ? (
                            warehouses.map(w => (
                                <option key={w.warehouse_id} value={w.warehouse_id}>
                                    {w.warehouse_name} ({w.warehouse_id})
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>ไม่พบคลังสินค้า</option>
                        )}
                    </select>
                </div>

                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400">
                        ยกเลิก
                    </button>
                    <button onClick={handleConfirm} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                        ยืนยันการจัดเก็บ
                    </button>
                </div>
            </div>
        </div>
    );
};


const PendingStorage = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, warehousesRes] = await Promise.all([
                fetch('http://localhost:5000/api/warehouse/pending-receipts'),
                fetch('http://localhost:5000/warehouses')
            ]);
            const ordersData = await ordersRes.json();
            const warehousesData = await warehousesRes.json();
            setPendingOrders(ordersData);
            setWarehouses(warehousesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleConfirmReceipt = async (orderNumber, warehouseId) => {
        try {
            const response = await fetch('http://localhost:5000/api/warehouse/receive-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchase_order_number: orderNumber,
                    warehouse_id: warehouseId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'เกิดข้อผิดพลาด');
            }

            alert(`รับสินค้าจาก PO ${orderNumber} เข้าคลังสำเร็จ!`);
            setIsModalOpen(false);
            setSelectedOrder(null);
            fetchData(); // รีเฟรชข้อมูล
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">กำลังโหลดรายการ...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">สินค้าที่รอการจัดเก็บ</h1>
            
            {pendingOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 bg-white p-10 rounded-lg shadow">
                    <InboxIcon className="w-16 h-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold">ไม่มีรายการรอจัดเก็บ</h2>
                    <p>ไม่มีใบสั่งซื้อที่จ่ายเงินแล้วและรอการนำเข้าคลังในขณะนี้</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left">เลขที่ใบสั่งซื้อ</th>
                                <th className="px-6 py-3 text-left">วันที่จ่ายเงิน</th>
                                <th className="px-6 py-3 text-left">ชื่อเกษตรกร</th>
                                <th className="px-6 py-3 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {pendingOrders.map(order => (
                                <tr key={order.purchase_order_number}>
                                    <td className="px-6 py-4 font-mono">{order.purchase_order_number}</td>
                                    <td className="px-6 py-4">{format(new Date(order.b_date), 'dd/MM/yyyy')}</td>
                                    <td className="px-6 py-4">{order.farmer_name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleOpenModal(order)}
                                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                                        >
                                            บันทึกการจัดเก็บ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <ReceiveConfirmationModal
                    order={selectedOrder}
                    warehouses={warehouses}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmReceipt}
                />
            )}
        </div>
    );
};

export default PendingStorage;