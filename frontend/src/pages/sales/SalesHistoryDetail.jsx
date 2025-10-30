import React, { useState, useEffect } from 'react';
// (เพิ่ม) Import ไอคอน RefreshCw สำหรับสถานะขอคืน
import { X, User, Calendar, ShoppingCart, Hash, DollarSign, Package, Truck, CheckSquare, Loader, RefreshCw } from 'lucide-react';

// Component ย่อยสำหรับแสดงประวัติ (ไม่มีการเปลี่ยนแปลง)
const ActionDetail = ({ icon, label, person, date }) => {
    if (!person) return null;

    const formattedDate = date 
        ? new Date(date).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';

    return (
        <div className="flex justify-between items-center text-sm py-1 text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
                {icon}
                <span className="font-semibold w-32 flex-shrink-0">{label}:</span>
                <span className="text-gray-800 dark:text-gray-100 whitespace-nowrap">{person}</span>
            </div>
            {date && <span className="text-gray-500 dark:text-gray-400 text-xs text-right whitespace-nowrap ml-4">({formattedDate})</span>}
        </div>
    );
};

const SalesHistoryDetail = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;
        const fetchOrderDetail = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:5000/salesorders/${orderId}`);
                if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
                const data = await response.json();
                setOrder(data);
            } catch (error) {
                console.error("Failed to fetch order details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [orderId]);

    const getStatusChip = (status) => {
        // (ปรับปรุง) เพิ่ม Chip สำหรับสถานะ "ขอคืน"
        switch (status) {
            case 'Paid': return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">ชำระเงินแล้ว</span>;
            case 'Unpaid': return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">ยังไม่ชำระ</span>;
            case 'ขอคืน': return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">ขอคืน</span>;
            default: return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    // (★★★ จุดที่แก้ไข ★★★) สร้างฟังก์ชันสำหรับแสดงประวัติการจัดส่ง/ขอคืนโดยเฉพาะ
    const renderDeliveryAction = () => {
        // ถ้าสถานะเป็น "ขอคืน"
        if (order.delivery_status === 'ขอคืน') {
            return (
                <ActionDetail 
                    icon={<RefreshCw size={16} className="mr-3 text-red-500"/>} 
                    label="ยืนยันขอคืนโดย" 
                    person={order.delivered_by_name} 
                    date={order.delivered_date} 
                />
            );
        }
        // มิฉะนั้น (สถานะเป็น Delivered หรืออื่น ๆ)
        return (
            <ActionDetail 
                icon={<Truck size={16} className="mr-3 text-orange-500"/>} 
                label="ยืนยันจัดส่งโดย" 
                person={order.delivered_by_name} 
                date={order.delivered_date} 
            />
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl m-4" onClick={(e) => e.stopPropagation()}>
                {loading || !order ? (
                    <div className="h-96 flex justify-center items-center text-gray-800 dark:text-gray-200">
                        <Loader className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : (
                    <div className="p-8 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                                    <Hash className="mr-2 text-blue-600 dark:text-blue-400"/>
                                    ใบสั่งขาย: {order.sale_order_number}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    วันที่สร้าง: {new Date(order.created_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'})}
                                </p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"><X size={28} /></button>
                        </div>

                        {/* Body */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                {/* Customer Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                                        <User className="mr-2"/>ข้อมูลลูกค้า
                                    </h3>
                                    <div className="text-gray-800 dark:text-gray-100 pl-8">
                                        <p>{order.customer_name}</p>
                                    </div>
                                </div>

                                {/* Order Items Section */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                                        <ShoppingCart className="mr-2"/>รายการสินค้า
                                    </h3>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">สินค้า</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">จำนวน</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ราคา</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {order.items.map(item => (
                                                    <tr key={item.p_id}>
                                                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">{item.p_name}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 text-right">{item.quantity.toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 text-right">{(item.quantity * item.price_per_unit).toLocaleString('th-TH')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Status and Total Price Section */}
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-center gap-4">
                                        {/* (ปรับปรุง) แสดงสถานะการจัดส่ง/ขอคืน */}
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">สถานะการจัดส่ง</span>
                                            {getStatusChip(order.delivery_status)}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">สถานะชำระเงิน</span>
                                                {getStatusChip(order.payment_status)}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">ยอดรวมทั้งสิ้น</span>
                                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                    {parseFloat(order.s_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-700" />

                            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-100 dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                                    <Calendar className="mr-2"/>ประวัติการดำเนินการ
                                </h3>
                                <div className="space-y-2 pl-8 border-l-2 border-gray-200 dark:border-gray-600">
                                    <ActionDetail icon={<User size={16} className="mr-3 text-blue-500"/>} 
                                        label="สร้างรายการโดย" 
                                        person={order.created_by_name} 
                                        date={order.created_date} />
                                    <ActionDetail icon={<Package size={16} className="mr-3 text-purple-500"/>} label="เบิกสินค้าโดย" person={order.shipped_by_name} date={order.shipped_date} />
                                    
                                    {/* (★★★ จุดที่แก้ไข ★★★) เรียกใช้ฟังก์ชันใหม่ที่นี่ */}
                                    {renderDeliveryAction()}

                                    <ActionDetail icon={<CheckSquare size={16} className="mr-3 text-green-500"/>} label="ยืนยันรับเงินโดย" person={order.paid_by_name} date={order.paid_date} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesHistoryDetail;