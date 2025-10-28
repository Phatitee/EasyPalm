import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PackagePlus, CheckCircle, Loader, ServerCrash, Inbox, Archive } from 'lucide-react';
import StorageDetail from './StorageDetail';

const PendingStorage = () => {
    const [orders, setOrders] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submittingId, setSubmittingId] = useState(null);
    const { user } = useAuth();

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ordersRes, warehousesRes] = await Promise.all([
                fetch('http://localhost:5000/warehouse/pending-receipts'),
                fetch('http://localhost:5000/warehouses')
            ]);
            
            if (!ordersRes.ok || !warehousesRes.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลเริ่มต้นได้');
            }
            
            const ordersData = await ordersRes.json();
            const warehousesData = await warehousesRes.json();
            
            setOrders(ordersData);
            setWarehouses(warehousesData);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleReceiveItems = async (e, orderNumber) => {
        e.stopPropagation();
        
        // ★★★ FIX: Changed e.target.form to e.currentTarget.form ★★★
        const form = e.currentTarget.form;
        if (!form) {
            console.error("Button is not associated with a form.");
            return;
        }
        const warehouseId = form.elements[`warehouse-select-${orderNumber}`].value;
        // ★★★ END FIX ★★★

        if (!warehouseId) {
            return alert('กรุณาเลือกคลังสินค้าที่จะจัดเก็บ');
        }

        if (!window.confirm(`คุณต้องการยืนยันการรับสินค้าจาก PO ${orderNumber} เข้าคลัง ${warehouseId} ใช่หรือไม่?`)) {
            return;
        }

        setSubmittingId(orderNumber);
        try {
            const response = await fetch('http://localhost:5000/warehouse/receive-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchase_order_number: orderNumber,
                    warehouse_id: warehouseId,
                    employee_id: user.e_id,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'เกิดข้อผิดพลาด');
            }
            alert(result.message);
            fetchInitialData();
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        } finally {
            setSubmittingId(null);
        }
    };

    const handleRowDoubleClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-500" size={48} /> <span className="ml-4 text-lg">กำลังโหลดข้อมูล...</span></div>;
    }

    if (error) {
        return <div className="flex flex-col justify-center items-center h-screen text-red-600 bg-red-50 p-10 rounded-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <PackagePlus className="inline-block mr-3 text-orange-600" />
                    ยืนยันรับสินค้าเข้าคลัง
                </h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <Inbox size={64} className="mx-auto text-gray-400" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700">ไม่มีรายการที่ต้องดำเนินการ</h2>
                    <p className="mt-2 text-gray-500">ไม่มีรายการสั่งซื้อที่รอการรับเข้าคลังในขณะนี้</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เลขที่ PO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เกษตรกร</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่สั่งซื้อ</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr 
                                        key={order.purchase_order_number}
                                        onDoubleClick={() => handleRowDoubleClick(order.purchase_order_number)}
                                        className="hover:bg-gray-100 cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.purchase_order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.farmer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.b_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <form className="flex items-center justify-center gap-2">
                                                <div className="relative w-48">
                                                     <Archive className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <select 
                                                        id={`warehouse-select-${order.purchase_order_number}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full pl-9 pr-4 py-2 border rounded-lg appearance-none bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">-- เลือกคลัง --</option>
                                                        {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                                                    </select>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleReceiveItems(e, order.purchase_order_number)}
                                                    disabled={submittingId === order.purchase_order_number}
                                                    className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400"
                                                >
                                                    {submittingId === order.purchase_order_number ? (
                                                        <Loader className="animate-spin mr-2" size={16} />
                                                    ) : (
                                                        <CheckCircle className="mr-2" size={16} />
                                                    )}
                                                    {submittingId === order.purchase_order_number ? 'กำลังบันทึก...' : 'ยืนยัน'}
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {isDetailModalOpen && (
                <StorageDetail
                    orderId={selectedOrderId} 
                    onClose={() => setIsDetailModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default PendingStorage;