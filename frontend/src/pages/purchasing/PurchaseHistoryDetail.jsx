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
        // ★★★ FIX 1: Text colors for ActionDetail ★★★
        <div className="flex justify-between items-center text-sm py-1 text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
                {icon}
                <span className="font-semibold w-32 flex-shrink-0">{label}:</span>
                {/* ★★★ FIX 2: Strong Text color for person name ★★★ */}
                <span className="text-gray-800 dark:text-gray-100 whitespace-nowrap">{person}</span>
            </div>
            {/* ★★★ FIX 3: Date Text color ★★★ */}
            {date && <span className="text-gray-500 dark:text-gray-400 text-xs text-right whitespace-nowrap ml-4">({formattedDate})</span>}
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
                const response = await fetch(`http://127.0.0.1:5000/purchaseorders/${orderId}`);
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
                // คงสีเดิมเพื่อการเน้นที่ชัดเจน
                Paid: "bg-green-100 text-green-800",
                Unpaid: "bg-red-100 text-red-800",
            },
            stock: {
                // คงสีเดิมเพื่อการเน้นที่ชัดเจน
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
        // ★★★ FIX 4: Overlay Background ★★★
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 z-40 flex justify-center items-center" onClick={onClose}>
            {/* ★★★ FIX 5: Modal Container Background ★★★ */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl m-4" onClick={(e) => e.stopPropagation()}>
                {loading || !order ? (
                    // ★★★ FIX 6: Loading State Text Color ★★★
                    <div className="h-96 flex justify-center items-center text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={40} /></div>
                ) : (
                    <div className="p-8 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        {/* ★★★ FIX 7: Header Divider and Text Colors ★★★ */}
                        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                                    {/* ★★★ FIX 8: Icon Color ★★★ */}
                                    <Hash className="mr-2 text-purple-600 dark:text-purple-400"/>ใบสั่งซื้อ: {order.purchase_order_number}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">วันที่: {new Date(order.b_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                            </div>
                            {/* ★★★ FIX 9: Close Button Icon Color ★★★ */}
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"><X size={28} /></button>
                        </div>

                        <div className="space-y-8">
                            {/* Basic Info Section */}
                            <div>
                                {/* ★★★ FIX 10: Section Heading Text Color ★★★ */}
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                                    <User className="mr-2"/>ข้อมูลเกษตรกร
                                </h3>
                                {/* ★★★ FIX 11: Info Text Color ★★★ */}
                                <p className="text-gray-800 dark:text-gray-100 pl-8">{order.farmer_name}</p>
                            </div>

                            {/* Order Items & Total Section */}
                            {/* ★★★ FIX 12: Section Card Background and Border ★★★ */}
                            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                {/* ★★★ FIX 13: Section Heading Text Color ★★★ */}
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                                    <ShoppingCart className="mr-2"/>รายการสินค้า
                                </h3>
                                {/* ★★★ FIX 14: Table Border and Divider ★★★ */}
                                <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                    <table className="min-w-full">
                                        {/* ★★★ FIX 15: Table Header Background and Text ★★★ */}
                                        <thead className="bg-gray-50 dark:bg-gray-600">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">สินค้า</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">จำนวน</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">ราคา</th>
                                            </tr>
                                        </thead>
                                        {/* ★★★ FIX 16: Table Body Background and Text ★★★ */}
                                        <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                                            {order.items.map(item => (
                                                <tr key={item.p_id}>
                                                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">{item.p_name}</td>
                                                    <td className="px-4 py-2 text-sm text-right text-gray-600 dark:text-gray-300">{item.quantity.toLocaleString()}</td>
                                                    <td className="px-4 py-2 text-sm text-right font-semibold text-gray-800 dark:text-gray-100">{(item.quantity * item.price_per_unit).toLocaleString('th-TH')}</td>
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
                                        {/* ★★★ FIX 17: Total Text Colors ★★★ */}
                                        <span className="text-sm text-gray-600 dark:text-gray-400">ยอดรวมทั้งสิ้น</span>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {parseFloat(order.b_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            {/* ★★★ FIX 18: Divider Color ★★★ */}
                            <hr className="border-gray-200 dark:border-gray-700" />

                            {/* Action History Section */}
                            {/* ★★★ FIX 19: Action History Card Background ★★★ */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                                {/* ★★★ FIX 20: Section Heading Text Color ★★★ */}
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                                    <Calendar className="mr-2"/>ประวัติการดำเนินการ
                                </h3>
                                {/* ★★★ FIX 21: Action History Timeline Border Color ★★★ */}
                                <div className="space-y-2 pl-8 border-l-2 border-gray-200 dark:border-gray-600">
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