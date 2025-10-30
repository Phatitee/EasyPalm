// frontend/src/pages/accountant/PurchaseOrderDetail.jsx

import React, { useState, useEffect, useRef } from 'react';
import { X, User, Calendar, ShoppingCart, Hash, Loader, Package, DollarSign, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

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

// ★★★★★ Component สำหรับพิมพ์ใบสั่งซื้อ ★★★★★
const PrintablePurchaseOrder = React.forwardRef(({ order }, ref) => {
    if (!order) return null;
    const today = new Date();
    
    return (
        <div ref={ref} className="p-8 font-sans">
            <header className="flex justify-between items-center pb-4 border-b-2 border-black">
                <h1 className="text-3xl font-bold">EasyPalm Co., Ltd.</h1>
                <h2 className="text-4xl font-bold text-gray-800">ใบสั่งซื้อ</h2>
            </header>
            
            <section className="my-6 grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-md font-semibold mb-1">ข้อมูลเกษตรกร:</h3>
                    <p><strong>ชื่อ:</strong> {order?.farmer_name ?? 'N/A'}</p>
                </div>
                <div className="text-right">
                    <p><strong>เลขที่ใบสั่งซื้อ:</strong> {order?.purchase_order_number ?? 'N/A'}</p>
                    <p><strong>วันที่:</strong> {new Date(order?.b_date || order?.created_date).toLocaleDateString('th-TH', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</p>
                    <p><strong>สถานะการชำระเงิน:</strong> 
                        <span className={`ml-2 ${order?.payment_status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                            {order?.payment_status === 'Paid' ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                        </span>
                    </p>
                </div>
            </section>
            
            <table className="w-full text-left border-collapse my-8">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">#</th>
                        <th className="p-2 border">รายการ</th>
                        <th className="p-2 border text-right">จำนวน (กก.)</th>
                        <th className="p-2 border text-right">ราคา/หน่วย</th>
                        <th className="p-2 border text-right">ราคารวม</th>
                    </tr>
                </thead>
                <tbody>
                    {order?.items?.map((item, index) => (
                        <tr key={item?.p_id || index}>
                            <td className="p-2 border">{index + 1}</td>
                            <td className="p-2 border">{item?.p_name ?? 'N/A'}</td>
                            <td className="p-2 border text-right">{item?.quantity?.toLocaleString() ?? 0}</td>
                            <td className="p-2 border text-right">{item?.price_per_unit?.toFixed(2) ?? '0.00'}</td>
                            <td className="p-2 border text-right">
                                {(item?.quantity * item?.price_per_unit)?.toLocaleString(undefined, { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 2 
                                }) ?? '0.00'}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-bold">
                        <td colSpan="4" className="p-2 border text-right">ยอดรวมทั้งสิ้น</td>
                        <td className="p-2 border text-right text-lg">
                            {order?.b_total_price?.toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                            }) ?? '0.00'}
                        </td>
                    </tr>
                </tfoot>
            </table>
            
            <footer className="mt-12 pt-4 border-t text-xs text-gray-500">
                <div className="grid grid-cols-2 gap-4 mt-8 text-center">
                    <div>
                        <p>_________________________</p>
                        <p>( {order?.created_by_name || '..............................'} )</p>
                        <p>ผู้จัดทำ</p>
                    </div>
                    <div>
                        <p>_________________________</p>
                        <p>( {order?.farmer_name} )</p>
                        <p>ผู้ขาย</p>
                    </div>
                </div>
                <p className="text-center mt-8">พิมพ์เมื่อ: {today.toLocaleString('th-TH')}</p>
            </footer>
        </div>
    );
});

const PurchaseOrderDetail = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef(null);

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

    // ★★★★★ ฟังก์ชันสำหรับพิมพ์ ★★★★★
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `ใบสั่งซื้อ-${order?.purchase_order_number || 'unknown'}`,
        onAfterPrint: () => {
            console.log('Print completed successfully');
        },
        onPrintError: (errorLocation, error) => {
            console.error('Print error:', errorLocation, error);
            alert('เกิดข้อผิดพลาดในการพิมพ์ กรุณาลองใหม่อีกครั้ง');
        }
    });

    const triggerPrint = () => {
        if (printRef.current && order) {
            handlePrint();
        } else {
            console.error("Print Error: Missing ref or order data");
            alert('ไม่สามารถพิมพ์ได้: ไม่พบข้อมูลใบสั่งซื้อ');
        }
    };

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
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl m-4" onClick={(e) => e.stopPropagation()}>
                {loading || !order ? (
                    <div className="h-96 flex justify-center items-center text-gray-800 dark:text-gray-200">
                        <Loader className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : (
                    <div className="p-8 max-h-[90vh] overflow-y-auto">
                        {/* Header with Print Button */}
                        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                                    <Hash className="mr-2 text-purple-600 dark:text-purple-400"/>
                                    ใบสั่งซื้อ: {order.purchase_order_number}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    วันที่: {new Date(order.b_date).toLocaleDateString('th-TH', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* ★★★★★ ปุ่มพิมพ์ ★★★★★ */}
                                <button 
                                    onClick={triggerPrint}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    <Printer size={18} />
                                    พิมพ์
                                </button>
                                <button 
                                    onClick={onClose} 
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <X size={28} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Basic Info Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                                    <User className="mr-2"/>ข้อมูลเกษตรกร
                                </h3>
                                <p className="text-gray-800 dark:text-gray-100 pl-8">{order.farmer_name}</p>
                            </div>

                            {/* Order Items & Total Section */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
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
                                                    <td className="px-4 py-2 text-sm text-right text-gray-600 dark:text-gray-300">{item.quantity.toLocaleString()}</td>
                                                    <td className="px-4 py-2 text-sm text-right font-semibold text-gray-800 dark:text-gray-100">
                                                        {(item.quantity * item.price_per_unit).toLocaleString('th-TH')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Status and Total */}
                                <div className="mt-4 flex justify-between items-center gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        {getStatusChip(order.payment_status, 'payment')}
                                        {getStatusChip(order.stock_status, 'stock')}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">ยอดรวมทั้งสิ้น</span>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {parseFloat(order.b_total_price).toLocaleString('th-TH', { 
                                                style: 'currency', 
                                                currency: 'THB' 
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-700" />

                            {/* Action History Section */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                                    <Calendar className="mr-2"/>ประวัติการดำเนินการ
                                </h3>
                                <div className="space-y-2 pl-8 border-l-2 border-gray-200 dark:border-gray-600">
                                    <ActionDetail 
                                        icon={<User size={16} className="mr-3 text-blue-500"/>} 
                                        label="สร้างรายการโดย" 
                                        person={order.created_by_name} 
                                        date={order.created_date} 
                                    />
                                    <ActionDetail 
                                        icon={<DollarSign size={16} className="mr-3 text-green-500"/>} 
                                        label="ยืนยันจ่ายเงินโดย" 
                                        person={order.paid_by_name} 
                                        date={order.paid_date} 
                                    />
                                    <ActionDetail 
                                        icon={<Package size={16} className="mr-3 text-orange-500"/>} 
                                        label="รับเข้าคลังโดย" 
                                        person={order.received_by_name} 
                                        date={order.received_date} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ★★★★★ Component สำหรับพิมพ์ (ซ่อนไว้) ★★★★★ */}
            {order && (
                <div style={{ 
                    position: "absolute", 
                    left: "-9999px",
                    top: 0
                }}>
                    <PrintablePurchaseOrder ref={printRef} order={order} />
                </div>
            )}
        </div>
    );
};

export default PurchaseOrderDetail;