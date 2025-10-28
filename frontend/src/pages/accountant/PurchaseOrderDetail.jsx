// frontend/src/pages/purchasing/PurchaseHistoryDetail.jsx

import React, { useState, useEffect } from 'react';
import { X, User, Calendar, ShoppingCart, Hash, Loader, Package, DollarSign } from 'lucide-react';

// Component ย่อยสำหรับแสดงประวัติ
const ActionDetail = ({ icon, label, person, date }) => {
    if (!person) return null;
    const formattedDate = date 
        ? new Date(date).toLocaleString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        : '';
    return (
        <div className="flex justify-between items-center text-sm py-1">
            <div className="flex items-center">
                {icon}
                <span className="font-semibold w-32 flex-shrink-0">{label}:</span>
                <span className="text-gray-800 whitespace-nowrap">{person}</span>
            </div>
            {date && <span className="text-gray-500 text-xs text-right whitespace-nowrap ml-4">({formattedDate})</span>}
        </div>
    );
};

const PurchaseHistoryDetail = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;
        const fetchOrderDetail = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/purchaseorders/${orderId}`);
                if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลรายละเอียดได้');
                const data = await response.json();
                setOrder(data);
            } catch (error) {
                console.error("Failed to fetch PO details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [orderId]);

    const getStatusChip = (status, type) => {
        const colors = {
            payment: {
                Paid: "bg-green-100 text-green-800",
                Unpaid: "bg-red-100 text-red-800",
            },
            stock: {
                Completed: "bg-blue-100 text-blue-800",
                Pending: "bg-yellow-100 text-yellow-800",
                'Not Received': "bg-gray-100 text-gray-800",
            }
        };
        const text = {
            'Not Received': 'ยังไม่ได้รับ',
            Pending: 'รอรับเข้าคลัง',
            Completed: 'รับเข้าคลังแล้ว',
            Paid: 'จ่ายแล้ว',
            Unpaid: 'ยังไม่จ่าย',
        };
        return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colors[type][status]}`}>{text[status] || status}</span>;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl m-4" onClick={(e) => e.stopPropagation()}>
                {loading || !order ? (
                    <div className="h-96 flex justify-center items-center"><Loader className="animate-spin text-blue-500" size={40} /></div>
                ) : (
                    <div className="p-8 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <Hash className="mr-2 text-purple-600"/>ใบสั่งซื้อ: {order.purchase_order_number}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">วันที่: {new Date(order.b_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={28} /></button>
                        </div>

                        <div className="space-y-8">
                            {/* Basic Info Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                                    <User className="mr-2"/>ข้อมูลเกษตรกร
                                </h3>
                                <p className="text-gray-800 pl-8">{order.farmer_name}</p>
                            </div>

                            {/* Order Items & Total Section */}
                            <div className="bg-white rounded-lg border p-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                    <ShoppingCart className="mr-2"/>รายการสินค้า
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">สินค้า</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">ราคา</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {order.items.map(item => (
                                                <tr key={item.p_id}>
                                                    <td className="px-4 py-2 text-sm">{item.p_name}</td>
                                                    <td className="px-4 py-2 text-sm text-right">{item.quantity.toLocaleString()}</td>
                                                    <td className="px-4 py-2 text-sm text-right font-semibold">{(item.quantity * item.price_per_unit).toLocaleString('th-TH')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Status and Total */}
                                <div className="mt-4 flex justify-between items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        {getStatusChip(order.payment_status, 'payment')}
                                        {getStatusChip(order.stock_status, 'stock')}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm text-gray-600">ยอดรวมทั้งสิ้น</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {parseFloat(order.b_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <hr className="border-gray-200" />

                            {/* Action History Section */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                                    <Calendar className="mr-2"/>ประวัติการดำเนินการ
                                </h3>
                                <div className="space-y-2 pl-8 border-l-2">
                                    <ActionDetail icon={<User size={16} className="mr-3 text-blue-500"/>} 
                                        label="สร้างรายการโดย" 
                                        person={order.created_by_name} 
                                        date={order.created_date} />
                                    <ActionDetail icon={<DollarSign size={16} className="mr-3 text-green-500"/>} 
                                        label="ยืนยันจ่ายเงินโดย" 
                                        person={order.paid_by_name} 
                                        date={order.paid_date} />
                                    <ActionDetail icon={<Package size={16} className="mr-3 text-orange-500"/>} 
                                        label="รับเข้าคลังโดย" 
                                        person={order.received_by_name} 
                                        date={order.received_date} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseHistoryDetail;