import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, CheckCircle, Loader, ServerCrash, Inbox, AlertTriangle, XCircle, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PurchaseOrderDetail from './PurchaseOrderDetail';

// --- Helper Modal: Confirm Dialog ---
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm transform transition-all animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    <button onClick={onClose} type="button" className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">ยกเลิก</button>
                    <button onClick={onConfirm} type="button" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">ยืนยัน</button>
                </div>
            </div>
        </div>
    );
};

// --- Helper Modal: Result Dialog ---
const ResultDialog = ({ isOpen, onClose, type, message }) => {
    if (!isOpen) return null;
    const isSuccess = type === 'success';
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm text-center transform transition-all animate-fade-in-up">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isSuccess ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                </div>
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{isSuccess ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="mt-6">
                    <button onClick={onClose} type="button" className={`w-full px-4 py-2 text-white rounded-lg font-semibold ${isSuccess ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>ตกลง</button>
                </div>
            </div>
        </div>
    );
}

// ★★★★★ Dialog แจ้งสำเร็จพร้อมปุ่มพิมพ์ ★★★★★
const SuccessPrintDialog = ({ isOpen, onClose, onPrint, orderNumber }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md text-center transform transition-all animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div className="mt-4 text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">ยืนยันการจ่ายเงินสำเร็จ!</h3>
                    <p className="mt-2 text-md text-gray-600 dark:text-gray-300">
                        ใบสั่งซื้อหมายเลข <span className="font-bold text-green-600">{orderNumber}</span> ถูกทำเครื่องหมายว่าจ่ายเงินแล้ว
                    </p>
                    <p className="mt-1 text-sm text-gray-500">คุณต้องการพิมพ์ใบเสร็จหรือไม่?</p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        type="button"
                        className="w-full px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        ปิด
                    </button>
                    <button
                        onClick={onPrint}
                        type="button"
                        className="w-full px-4 py-2.5 text-white rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        <Printer size={18} />
                        พิมพ์ใบเสร็จจ่ายเงิน
                    </button>
                </div>
            </div>
        </div>
    );
};

// ★★★★★ Component ใบเสร็จจ่ายเงิน (Payment Receipt) ★★★★★
const PrintablePaymentReceipt = React.forwardRef(({ order }, ref) => {
    if (!order) return null;
    const today = new Date();

    return (
        <div ref={ref} className="p-8 font-sans">
            <header className="flex justify-between items-center pb-4 border-b-2 border-black">
                <h1 className="text-3xl font-bold">EasyPalm Co., Ltd.</h1>
                <h2 className="text-4xl font-bold text-gray-800">ใบเสร็จจ่ายเงิน</h2>
            </header>

            <section className="my-6 grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-md font-semibold mb-1">ชำระเงินให้:</h3>
                    <p><strong>ชื่อ:</strong> {order?.farmer_name ?? 'N/A'}</p>
                </div>
                <div className="text-right">
                    <p><strong>เลขที่ใบสั่งซื้อ:</strong> {order?.purchase_order_number ?? 'N/A'}</p>
                    <p><strong>วันที่สั่งซื้อ:</strong> {new Date((order?.b_date || order?.created_date) + 'Z').toLocaleString('th-TH', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })}</p>
                    {/* <p><strong>วันที่สั่งซื้อ:</strong> {new Date((order?.b_date || order?.created_date) + 'Z').toLocaleString('th-TH', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })}</p> */}
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
                        <td colSpan="4" className="p-2 border text-right">ยอดเงินที่จ่าย</td>
                        <td className="p-2 border text-right text-lg">
                            {order?.b_total_price?.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }) ?? '0.00'} บาท
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div className="my-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm"><strong>สถานะ:</strong> <span className="text-green-600 font-semibold">✓ จ่ายเงินแล้ว</span></p>
                <p className="text-sm mt-1"><strong>ผู้ยืนยันการจ่ายเงิน:</strong> {order?.paid_by_name || 'N/A'}</p>
            </div>

            <footer className="mt-12 pt-4 border-t text-xs text-gray-500">
                <div className="grid grid-cols-2 gap-4 mt-8 text-center">
                    <div>
                        <p>_________________________</p>
                        <p>( {order?.paid_by_name || '..............................'} )</p>
                        <p>ผู้จ่ายเงิน</p>
                    </div>
                    <div>
                        <p>_________________________</p>
                        <p>( {order?.farmer_name} )</p>
                        <p>ผู้รับเงิน</p>
                    </div>
                </div>
                <p className="text-center mt-8">พิมพ์เมื่อ: {today.toLocaleString('th-TH')}</p>
                <p className="text-center mt-2 text-gray-400">ใบเสร็จนี้ออกโดยระบบ EasyPalm</p>
            </footer>
        </div>
    );
});

const PaymentManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payingOrderId, setPayingOrderId] = useState(null);
    const { user } = useAuth();

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, orderNumber: null, title: '', message: '' });
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' });

    // ★★★★★ States และ Refs สำหรับการพิมพ์ ★★★★★
    const [completedPayment, setCompletedPayment] = useState(null);
    const receiptRef = useRef(null);

    const fetchUnpaidOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:5000/purchaseorders?status=unpaid', {
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลรายการที่ยังไม่จ่ายได้');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnpaidOrders();
    }, [fetchUnpaidOrders]);

    // ★★★★★ ฟังก์ชันสำหรับพิมพ์ ★★★★★
    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `ใบเสร็จจ่ายเงิน-${completedPayment?.purchase_order_number || 'unknown'}`,
        onAfterPrint: () => {
            console.log('Print completed successfully');
            setCompletedPayment(null);
        },
        onPrintError: (errorLocation, error) => {
            console.error('Print error:', errorLocation, error);
            setResultDialog({
                isOpen: true,
                type: 'error',
                message: 'เกิดข้อผิดพลาดในการพิมพ์ กรุณาลองใหม่อีกครั้ง'
            });
        }
    });

    const triggerPrint = () => {
        if (receiptRef.current && completedPayment) {
            console.log('Triggering print...');
            handlePrint();
        } else {
            console.error("Print Error: Missing ref or payment data");
            setResultDialog({
                isOpen: true,
                type: 'error',
                message: 'ไม่สามารถพิมพ์ได้: ไม่พบข้อมูลใบเสร็จ'
            });
        }
    };

    const handleMarkAsPaid = (e, orderNumber) => {
        e.stopPropagation();
        setConfirmDialog({
            isOpen: true,
            orderNumber: orderNumber,
            title: 'ยืนยันการจ่ายเงิน',
            message: `คุณต้องการยืนยันการจ่ายเงินสำหรับใบสั่งซื้อเลขที่ ${orderNumber} ใช่หรือไม่?`
        });
    };

    const handleExecuteMarkAsPaid = async () => {
        const orderNumber = confirmDialog.orderNumber;
        setPayingOrderId(orderNumber);
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        try {
            const response = await fetch(`http://127.0.0.1:5000/purchaseorders/${orderNumber}/pay`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: user.e_id }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
            }

            // ★★★★★ ดึงข้อมูลใบสั่งซื้อที่สมบูรณ์เพื่อพิมพ์ ★★★★★
            const detailResponse = await fetch(`http://127.0.0.1:5000/purchaseorders/${orderNumber}`);
            if (detailResponse.ok) {
                const orderDetail = await detailResponse.json();
                setCompletedPayment(orderDetail);
            }

            fetchUnpaidOrders();
        } catch (err) {
            setResultDialog({ isOpen: true, type: 'error', message: `เกิดข้อผิดพลาด: ${err.message}` });
        } finally {
            setPayingOrderId(null);
        }
    };

    const handleRowDoubleClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailModalOpen(true);
    };

    const handleCloseSuccessDialog = () => {
        setCompletedPayment(null);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /> <span className="ml-4 text-lg">กำลังโหลดข้อมูล...</span></div>;
    }

    if (error) {
        return <div className="flex flex-col justify-center items-center h-screen text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={handleExecuteMarkAsPaid}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />
            <ResultDialog
                isOpen={resultDialog.isOpen}
                onClose={() => setResultDialog({ ...resultDialog, isOpen: false })}
                type={resultDialog.type}
                message={resultDialog.message}
            />

            {/* ★★★★★ Dialog สำหรับพิมพ์ใบเสร็จ ★★★★★ */}
            <SuccessPrintDialog
                isOpen={!!completedPayment}
                onClose={handleCloseSuccessDialog}
                onPrint={triggerPrint}
                orderNumber={completedPayment?.purchase_order_number}
            />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <FileText className="inline-block mr-3 text-purple-600 dark:text-purple-400" />
                    จัดการการจ่ายเงิน (Purchase Orders)
                </h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                    <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">ไม่มีรายการที่ต้องดำเนินการ</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">ไม่มีรายการสั่งซื้อที่รอการจ่ายเงินในขณะนี้</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">เลขที่ PO</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ชื่อเกษตรกร</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">วันที่สั่งซื้อ</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ยอดรวม</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map((order) => (
                                    <tr
                                        key={order.purchase_order_number}
                                        onDoubleClick={() => handleRowDoubleClick(order.purchase_order_number)}
                                        className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{order.purchase_order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.farmer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.b_date + 'Z').toLocaleString('th-TH', {
                                            year: '2-digit', month: '2-digit', day: '2-digit',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold text-right dark:text-gray-200">
                                            {parseFloat(order.b_total_price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={(e) => handleMarkAsPaid(e, order.purchase_order_number)}
                                                disabled={payingOrderId === order.purchase_order_number}
                                                className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-gray-400"
                                            >
                                                {payingOrderId === order.purchase_order_number ? (
                                                    <Loader className="animate-spin mr-2" size={16} />
                                                ) : (
                                                    <CheckCircle className="mr-2" size={16} />
                                                )}
                                                {payingOrderId === order.purchase_order_number ? 'กำลังบันทึก...' : 'ทำเครื่องหมายว่าจ่ายแล้ว'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isDetailModalOpen && (
                <PurchaseOrderDetail
                    orderId={selectedOrderId}
                    onClose={() => setIsDetailModalOpen(false)}
                />
            )}

            {/* ★★★★★ Component ใบเสร็จที่ซ่อนไว้สำหรับพิมพ์ ★★★★★ */}
            {completedPayment && (
                <div style={{
                    position: "absolute",
                    left: "-9999px",
                    top: 0
                }}>
                    <PrintablePaymentReceipt ref={receiptRef} order={completedPayment} />
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;