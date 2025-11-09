import React from 'react';
import { X, User, Calendar, ShoppingCart, Hash, Package, Truck, CheckSquare } from 'lucide-react';

// Component ย่อยสำหรับแสดงข้อมูลแต่ละขั้นตอน
const ActionDetail = ({ icon, label, person, date }) => {
    if (!person) return null;
    return (
        // ★★★ Dark Mode FIX: Container Text Color ★★★
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            {icon}
            <span className="font-semibold w-32">{label}:</span>
            {/* ★★★ Dark Mode FIX: Person Name Color ★★★ */}
            <span className="text-gray-800 dark:text-gray-100">{person}</span>
            {/* ★★★ Dark Mode FIX: Date Text Color ★★★ */}
            {date && <span className="text-gray-500 dark:text-gray-400 text-xs ml-auto">({new Date(date + 'Z').toLocaleString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })})
            </span>}
        </div>
    );
};

const ReceiptDetail = ({ order, onClose }) => {
    if (!order) return null;

    return (
        // ★★★ Dark Mode FIX: Modal Overlay Background ★★★
        <div
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 z-40 flex justify-center items-center"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div
                // ★★★ Dark Mode FIX: Modal Container Background ★★★
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl mx-4 my-8 p-8 transform transition-all animate-fade-in-down"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                        <Hash className="mr-2 text-blue-600 dark:text-blue-400" />
                        รายละเอียดใบสั่งขาย: {order.sale_order_number}
                    </h2>
                    {/* ★★★ Dark Mode FIX: Close Button Color ★★★ */}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div>
                        {/* ★★★ Dark Mode FIX: Section Header Text Color ★★★ */}
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center"><User className="mr-2" />ข้อมูลลูกค้า</h3>
                        <div className="text-gray-600 dark:text-gray-300 pl-8">
                            <p><strong>ชื่อ:</strong> {order.customer_name}</p>
                            {/* Assuming address is available in a future update */}
                            {/* <p><strong>ที่อยู่:</strong> {order.customer_address || 'N/A'}</p> */}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
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
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ราคา/หน่วย</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">รวม</th>
                                    </tr>
                                </thead>
                                {/* ★★★ Dark Mode FIX: Table Body Background and Divider ★★★ */}
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {order.items.map(item => (
                                        <tr key={item.p_id}>
                                            {/* ★★★ Dark Mode FIX: Item Text Colors ★★★ */}
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.p_name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{item.quantity.toLocaleString()}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{parseFloat(item.price_per_unit).toFixed(2)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 font-semibold text-right">{(item.quantity * item.price_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* ★★★ Dark Mode FIX: Table Footer Background and Text ★★★ */}
                                <tfoot className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-2 text-right font-bold text-gray-700 dark:text-gray-300">ยอดรวมทั้งสิ้น</td>
                                        <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-gray-100 text-lg">
                                            {parseFloat(order.s_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        {/* ★★★ Dark Mode FIX: Section Header Text Color ★★★ */}
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center"><Calendar className="mr-2" />ประวัติการดำเนินการ</h3>
                        <div className="space-y-2 pl-8">
                            <ActionDetail icon={<User size={16} className="mr-2 text-blue-500" />} label="สร้างรายการโดย" person={order.created_by_name} date={order.created_date} />
                            <ActionDetail icon={<Package size={16} className="mr-2 text-purple-500" />} label="เบิกสินค้าโดย" person={order.shipped_by_name} date={order.shipped_date} />
                            <ActionDetail icon={<Truck size={16} className="mr-2 text-orange-500" />} label="ยืนยันจัดส่งโดย" person={order.delivered_by_name} date={order.delivered_date} />
                            <ActionDetail icon={<CheckSquare size={16} className="mr-2 text-green-500" />} label="ยืนยันรับเงินโดย" person={order.paid_by_name} date={order.paid_date} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptDetail;