// frontend/src/pages/warehouse/StorageDetail.jsx (FIXED)

import React, { useState, useEffect } from 'react';
import { X, User, Calendar, ShoppingCart, Hash, Loader, Package, DollarSign } from 'lucide-react';

// 1. ★★★ Import ฟังก์ชันจาก api.js ★★★
import { getPurchaseOrder } from '../../services/api';

// 2. ★★★ ลบ API_URL ทิ้งไป ★★★
// const API_URL = process.env.REACT_APP_API_URL;

// Component ย่อยสำหรับแสดงประวัติ
const ActionDetail = ({ icon, label, person, date }) => {
    if (!person) return null;
    const formattedDate = date
        ? new Date(date + 'Z').toLocaleString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
        : '';
    return (
        // ★★★ Dark Mode FIX: Container Text Color ★★★
        <div className="flex justify-between items-center text-sm py-1 text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
                {icon}
                <span className="font-semibold w-32 flex-shrink-0">{label}:</span>
                {/* ★★★ Dark Mode FIX: Person Name Color ★★★ */}
                <span className="text-gray-800 dark:text-gray-100 whitespace-nowrap">{person}</span>
            </div>
            {/* ★★★ Dark Mode FIX: Date Text Color ★★★ */}
            {date && <span className="text-gray-500 dark:text-gray-400 text-xs text-right whitespace-nowrap ml-4">({formattedDate})</span>}
        </div>
    );
};

const StorageDetail = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;
        const fetchOrderDetail = async () => {
            setLoading(true);
            try {
                // 3. ★★★ แก้ไข: ใช้ getPurchaseOrder จาก api.js ★★★
                const data = await getPurchaseOrder(orderId);
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
            payment: { Paid: "bg-green-100 text-green-800", Unpaid: "bg-red-100 text-red-800" },
            stock: { Completed: "bg-blue-100 text-blue-800", Pending: "bg-yellow-100 text-yellow-800", 'Not Received': "bg-gray-100 text-gray-800" }
        };
        const text = { 'Not Received': 'ยังไม่ได้รับ', Pending: 'รอรับเข้าคลัง', Completed: 'รับเข้าคลังแล้ว', Paid: 'จ่ายแล้ว', Unpaid: 'ยังไม่จ่าย' };
        return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colors[type][status]}`}>{text[status] || status}</span>;
    };

    return (
        // ★★★ Dark Mode FIX: Modal Overlay Background ★★★
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 z-40 flex justify-center items-center" onClick={onClose}>
            {/* ★★★ Dark Mode FIX: Modal Container Background ★★★ */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl m-4" onClick={(e) => e.stopPropagation()}>
                {loading || !order ? (
                    // ★★★ Dark Mode FIX: Loading State ★★★
                    <div className="h-96 flex justify-center items-center text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={40} /></div>
                ) : (
                    <div className="p-8 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                            <div>
                                {/* ★★★ Dark Mode FIX: Title Text Color and Icon ★★★ */}
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                                    <Hash className="mr-2 text-purple-600 dark:text-purple-400" />ใบสั่งซื้อ: {order.purchase_order_number}
                                </h2>
                                {/* ★★★ Dark Mode FIX: Subtitle Text Color ★★★ */}
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">วันที่สร้าง: {new Date(order.created_date + 'Z').toLocaleString('th-TH', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                                </p>
                            </div>
                            {/* ★★★ Dark Mode FIX: Close Button Color ★★★ */}
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"><X size={28} /></button>
                        </div>

                        {/* Body using the new layout */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    {/* ★★★ Dark Mode FIX: Section Header Text Color ★★★ */}
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center"><User className="mr-2" />ข้อมูลเกษตรกร</h3>
                                    {/* ★★★ Dark Mode FIX: Customer Info Text Color ★★★ */}
                                    <div className="text-gray-800 dark:text-gray-100 pl-8"><p>{order.farmer_name}</p></div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg">
                                    {/* ★★★ Dark Mode FIX: Section Header Text Color ★★★ */}
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center"><ShoppingCart className="mr-2" />รายการสินค้า</h3>
                                    {/* ★★★ Dark Mode FIX: Table Border and Divider ★★★ */}
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            {/* ★★★ Dark Mode FIX: Table Header Background and Text ★★★ */}
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">สินค้า</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">จำนวน</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ราคา</th>
                                                </tr>
                                            </thead>
                                            {/* ★★★ Dark Mode FIX: Table Body Background and Divider ★★★ */}
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {order.items.map(item => (
                                                    <tr key={item.p_id}>
                                                        {/* ★★★ Dark Mode FIX: Item Text Colors ★★★ */}
                                                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">{item.p_name}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 text-right">{item.quantity.toLocaleString()} kg</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 text-right font-semibold">{(item.quantity * item.price_per_unit).toLocaleString('th-TH')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* ★★★ Dark Mode FIX: Info Card Background and Border ★★★ */}
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {getStatusChip(order.payment_status, 'payment')}
                                            {getStatusChip(order.stock_status, 'stock')}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {/* ★★★ Dark Mode FIX: Total Price Text Color ★★★ */}
                                            <span className="text-sm text-gray-600 dark:text-gray-400">ยอดรวมทั้งสิ้น</span>
                                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{parseFloat(order.b_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* ★★★ Dark Mode FIX: Divider Color ★★★ */}
                            <hr className="border-gray-200 dark:border-gray-700" />
                            {/* ★★★ Dark Mode FIX: Action History Card Background ★★★ */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-100 dark:border-gray-600">
                                {/* ★★★ Dark Mode FIX: Section Header Text Color ★★★ */}
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center"><Calendar className="mr-2" />ประวัติการดำเนินการ</h3>
                                {/* ★★★ Dark Mode FIX: Timeline Border Color ★★★ */}
                                <div className="space-y-2 pl-8 border-l-2 border-gray-200 dark:border-gray-600">
                                    <ActionDetail icon={<User size={16} className="mr-3 text-blue-500" />} label="สร้างโดย" person={order.created_by_name} date={order.created_date} />
                                    <ActionDetail icon={<DollarSign size={16} className="mr-3 text-green-500" />} label="จ่ายเงินโดย" person={order.paid_by_name} date={order.paid_date} />
                                    <ActionDetail icon={<Package size={16} className="mr-3 text-orange-500" />} label="รับเข้าคลังโดย" person={order.received_by_name} date={order.received_date} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StorageDetail;