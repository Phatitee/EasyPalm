// frontend/src/pages/employee/PaymentManagement.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

// --- (สร้างใหม่) Component สำหรับ Modal เลือกคลังสินค้า ---
const WarehouseSelectionModal = ({ order, warehouses, onClose, onConfirm }) => {
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
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">ยืนยันการรับสินค้าเข้าคลัง</h2>
                <p className="mb-2"><strong>เลขที่ใบสั่งซื้อ:</strong> {order.purchase_order_number}</p>
                <p className="mb-4"><strong>จาก:</strong> {order.farmer_name}</p>
                
                <div className="mb-6">
                    <label htmlFor="warehouse-select" className="block text-sm font-medium text-gray-700 mb-2">
                        เลือกคลังสินค้าที่ต้องการรับเข้า:
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
                    <button onClick={handleConfirm} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">
                        ยืนยันและจ่ายเงิน
                    </button>
                </div>
            </div>
        </div>
    );
};


const PaymentManagement = () => {
    const [unpaidOrders, setUnpaidOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- (เพิ่ม) State สำหรับ Modal และ Warehouses ---
    const [warehouses, setWarehouses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);


    useEffect(() => {
        fetchUnpaidOrders();
        fetchWarehouses(); // ดึงข้อมูลคลังสินค้าเมื่อ component โหลด
    }, []);

    const fetchUnpaidOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/purchaseorders?status=unpaid');
            const data = await response.json();
            setUnpaidOrders(data);
        } catch (error) {
            console.error('Error fetching unpaid orders:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // --- (เพิ่ม) ฟังก์ชันดึงข้อมูลคลังสินค้า ---
    const fetchWarehouses = async () => {
        try {
            const response = await fetch('http://localhost:5000/warehouses');
            const data = await response.json();
            setWarehouses(data);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    // --- (แก้ไข) ฟังก์ชันนี้จะเปิด Modal แทนการยิง API ตรงๆ ---
    const handleOpenPayModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    // --- (แก้ไข) ฟังก์ชันยิง API จะถูกเรียกจาก Modal ---
    const handleConfirmPayment = async (orderNumber, warehouseId) => {
        try {
            const response = await fetch(`http://localhost:5000/purchaseorders/${orderNumber}/pay`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ warehouse_id: warehouseId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'เกิดข้อผิดพลาด');
            }
            
            alert('บันทึกการจ่ายเงินและรับเข้าสต็อกสำเร็จ!');
            setIsModalOpen(false);
            setSelectedOrder(null);
            fetchUnpaidOrders(); // รีเฟรชรายการ

        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">จัดการการจ่ายเงิน</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left">เลขที่ใบสั่งซื้อ</th>
                            <th className="px-6 py-3 text-left">วันที่</th>
                            <th className="px-6 py-3 text-left">ชื่อเกษตรกร</th>
                            <th className="px-6 py-3 text-right">ยอดรวม (บาท)</th>
                            <th className="px-6 py-3 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-4">กำลังโหลด...</td></tr>
                        ) : unpaidOrders.length === 0 ? (
                            <tr><td colSpan="5" className="text-center p-4 text-gray-500">ไม่มีรายการที่ต้องจ่ายเงิน</td></tr>
                        ) : (
                            unpaidOrders.map(order => (
                                <tr key={order.purchase_order_number}>
                                    <td className="px-6 py-4 font-mono">{order.purchase_order_number}</td>
                                    <td className="px-6 py-4">{format(new Date(order.b_date), 'dd/MM/yyyy')}</td>
                                    <td className="px-6 py-4">{order.farmer_name}</td>
                                    <td className="px-6 py-4 text-right">{order.b_total_price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleOpenPayModal(order)}
                                            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600"
                                        >
                                            จ่ายเงิน
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <WarehouseSelectionModal
                    order={selectedOrder}
                    warehouses={warehouses}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmPayment}
                />
            )}
        </div>
    );
};

export default PaymentManagement;