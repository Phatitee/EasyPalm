import React from 'react';
import { X, User, Home, Calendar, ShoppingCart, Hash, DollarSign, Package, Truck, CheckSquare } from 'lucide-react';

// Component ย่อยสำหรับแสดงข้อมูลแต่ละขั้นตอน
const ActionDetail = ({ icon, label, person, date }) => {
    if (!person) return null;
    return (
        <div className="flex items-center text-sm text-gray-600">
            {icon}
            <span className="font-semibold w-32">{label}:</span>
            <span className="text-gray-800">{person}</span>
            {date && <span className="text-gray-500 text-xs ml-auto">({new Date(date).toLocaleString('th-TH')})</span>}
        </div>
    );
};

const ReceiptDetail = ({ order, onClose }) => {
    if (!order) return null;

    return (
        // Backdrop
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 my-8 p-8 transform transition-all animate-fade-in-down"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Hash className="mr-2 text-blue-600"/>
                        รายละเอียดใบสั่งขาย: {order.sale_order_number}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center"><User className="mr-2"/>ข้อมูลลูกค้า</h3>
                        <div className="text-gray-600 pl-8">
                            <p><strong>ชื่อ:</strong> {order.customer_name}</p>
                            {/* Assuming address is available in a future update */}
                            {/* <p><strong>ที่อยู่:</strong> {order.customer_address || 'N/A'}</p> */}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center"><ShoppingCart className="mr-2"/>รายการสินค้า</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">สินค้า</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">ราคา/หน่วย</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">รวม</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {order.items.map(item => (
                                        <tr key={item.p_id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.p_name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity.toLocaleString()}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{parseFloat(item.price_per_unit).toFixed(2)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">{(item.quantity * item.price_per_unit).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-2 text-right font-bold text-gray-700">ยอดรวมทั้งสิ้น</td>
                                        <td className="px-4 py-2 text-right font-bold text-gray-900 text-lg">
                                            {parseFloat(order.s_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center"><Calendar className="mr-2"/>ประวัติการดำเนินการ</h3>
                        <div className="space-y-2 pl-8">
                            <ActionDetail icon={<User size={16} className="mr-2 text-blue-500"/>} label="สร้างรายการโดย" person={order.created_by_name} date={order.created_date} />
                            <ActionDetail icon={<Package size={16} className="mr-2 text-purple-500"/>} label="เบิกสินค้าโดย" person={order.shipped_by_name} date={order.shipped_date} />
                            <ActionDetail icon={<Truck size={16} className="mr-2 text-orange-500"/>} label="ยืนยันจัดส่งโดย" person={order.delivered_by_name} date={order.delivered_date} />
                            <ActionDetail icon={<CheckSquare size={16} className="mr-2 text-green-500"/>} label="ยืนยันรับเงินโดย" person={order.paid_by_name} date={order.paid_date} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptDetail;