import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Archive, PlusCircle, Trash2, CheckCircle, Loader, ServerCrash, TrendingUp, Search, XCircle, AlertTriangle, Printer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Tag } from 'antd';
import { useReactToPrint } from 'react-to-print';

// --- Dialog แจ้งผลสำเร็จ (ไม่มีการแก้ไข) ---
const SuccessPrintDialog = ({ isOpen, onClose, onPrint, orderNumber }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md text-center transform transition-all animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100"><CheckCircle className="h-10 w-10 text-green-600" /></div>
                <div className="mt-4 text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">สร้างใบสั่งซื้อสำเร็จ!</h3>
                    <p className="mt-2 text-md text-gray-600 dark:text-gray-300">ใบสั่งซื้อหมายเลข <span className="font-bold text-green-600">{orderNumber}</span> ถูกสร้างเรียบร้อยแล้ว</p>
                    <p className="mt-1 text-sm text-gray-500">คุณต้องการทำอะไรต่อ?</p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} type="button" className="w-full px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">สร้างรายการใหม่</button>
                    <button onClick={onPrint} type="button" className="w-full px-4 py-2.5 text-white rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"><Printer size={18} />พิมพ์ใบเสร็จ</button>
                </div>
            </div>
        </div>
    );
};

// --- Component ใบเสร็จ (ไม่มีการแก้ไข) ---
const PrintableReceipt = React.forwardRef(({ order }, ref) => {
    if (!order) return null;
    const today = new Date();
    return (
        <div ref={ref} className="p-8 font-sans">
            <header className="flex justify-between items-center pb-4 border-b-2 border-black"><h1 className="text-3xl font-bold">EasyPalm Co., Ltd.</h1><h2 className="text-4xl font-bold text-gray-800">ใบเสร็จรับซื้อ</h2></header>
            <section className="my-6 grid grid-cols-2 gap-4">
                <div><h3 className="text-md font-semibold mb-1">ข้อมูลเกษตรกร:</h3><p><strong>ชื่อ:</strong> {order?.farmer_name ?? 'N/A'}</p></div>
                <div className="text-right"><p><strong>เลขที่ใบสั่งซื้อ:</strong> {order?.purchase_order_number ?? 'N/A'}</p><p><strong>วันที่/เวลา:</strong> {new Date((order?.b_date || order?.created_date) + 'Z').toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
            </section>
            <table className="w-full text-left border-collapse my-8">
                <thead><tr className="bg-gray-100"><th className="p-2 border">#</th><th className="p-2 border">รายการ</th><th className="p-2 border text-right">จำนวน (กก.)</th><th className="p-2 border text-right">ราคา/หน่วย</th><th className="p-2 border text-right">ราคารวม</th></tr></thead>
                <tbody>
                    {order?.items?.map((item, index) => (
                        <tr key={item?.p_id || index}><td className="p-2 border">{index + 1}</td><td className="p-2 border">{item?.p_name ?? 'N/A'}</td><td className="p-2 border text-right">{Number(item?.quantity ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 })}</td></tr>
                    ))}
                </tbody>
                <tfoot><tr className="font-bold"><td colSpan="4" className="p-2 border text-right">ยอดรวมทั้งสิ้น</td><td className="p-2 border text-right text-lg">{order?.b_total_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</td></tr></tfoot>
            </table>
            <footer className="mt-12 pt-4 border-t text-xs text-gray-500">
                <div className="grid grid-cols-2 gap-4 mt-8 text-center">
                    <div><p>_________________________</p><p>( {order?.created_by_name || '..............................'} )</p><p>ผู้จัดทำ</p></div>
                    <div><p>_________________________</p><p>( {order?.farmer_name} )</p><p>ผู้ขาย</p></div>
                </div>
                <p className="text-center mt-8">พิมพ์เมื่อ: {today.toLocaleString('th-TH')}</p>
            </footer>
        </div>
    );
});

// --- Helper Modal (ไม่มีการแก้ไข) ---
const ResultDialog = ({ isOpen, onClose, type, message }) => { /* ... โค้ดส่วนนี้เหมือนเดิม ... */
    if (!isOpen) return null;
    const isSuccess = type === 'success';
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm text-center transform transition-all animate-fade-in-up">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>{isSuccess ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}</div>
                <div className="mt-3 text-center"><h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{isSuccess ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}</h3><p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p></div>
                <div className="mt-6"><button onClick={onClose} type="button" className={`w-full px-4 py-2 text-white rounded-lg font-semibold ${isSuccess ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>ตกลง</button></div>
            </div>
        </div>
    );
};

// --- Modal for order confirmation ---
const ConfirmOrderDialog = ({ isOpen, onClose, onConfirm, farmer, items, total }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-lg text-center transform transition-all animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">ตรวจสอบรายละเอียดใบสั่งซื้อ</h3>
                <div className="mb-4 text-left">
                    <div className="mb-2"><span className="font-semibold">เกษตรกร:</span> {farmer?.f_name || '-'} </div>
                    <table className="w-full text-sm border-collapse mb-2">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-2 border">#</th>
                                <th className="p-2 border">สินค้า</th>
                                <th className="p-2 border text-right">จำนวน (กก.)</th>
                                <th className="p-2 border text-right">ราคา/หน่วย</th>
                                <th className="p-2 border text-right">ราคารวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={item.p_id}>
                                    <td className="p-2 border">{idx + 1}</td>
                                    <td className="p-2 border">{item.p_name}</td>
                                    <td className="p-2 border text-right">{Number(item?.quantity ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                                    <td className="p-2 border text-right">{parseFloat(item.price_per_unit || 0).toFixed(2)}</td>
                                    <td className="p-2 border text-right">{(parseFloat(item.quantity || 0) * parseFloat(item.price_per_unit || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold">
                                <td colSpan="4" className="p-2 border text-right">ยอดรวม</td>
                                <td className="p-2 border text-right text-lg">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button onClick={onClose} className="w-full px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">ตรวจสอบ/แก้ไข</button>
                    <button onClick={onConfirm} className="w-full px-4 py-2.5 text-white rounded-lg font-semibold bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"><CheckCircle size={18} />ยืนยันสร้างใบสั่งซื้อ</button>
                </div>
            </div>
        </div>
    );
};

const PurchaseProduct = () => {
    // ... (States ส่วนใหญ่เหมือนเดิม) ...
    const [farmers, setFarmers] = useState([]);
    const [products, setProducts] = useState([]);
    const { user } = useAuth();
    const [selectedFarmer, setSelectedFarmer] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [farmerSearch, setFarmerSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFarmerListOpen, setIsFarmerListOpen] = useState(false);
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'error', message: '' });
    const [completedOrder, setCompletedOrder] = useState(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const receiptRef = useRef(null); // ★★★★★ จุดแก้ไขที่ 1: กำหนดค่าเริ่มต้นเป็น null ★★★★★
    const farmerSearchRef = useRef(null);

    const handleCloseSuccessDialog = () => setCompletedOrder(null);

    // ★★★★★ แก้ไข: ใช้ useReactToPrint แบบ hook ที่ส่งคืน function ★★★★★
    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `ใบเสร็จรับซื้อ-${completedOrder?.purchase_order_number || 'unknown'}`,
        onAfterPrint: () => {
            console.log('Print completed successfully');
            handleCloseSuccessDialog();
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

    // ฟังก์ชันสำหรับเรียกใช้การพิมพ์
    const triggerPrint = () => {
        if (receiptRef.current && completedOrder) {
            console.log('Triggering print...');
            handlePrint();
        } else {
            console.error("Print Error: Missing ref or order data");
            setResultDialog({
                isOpen: true,
                type: 'error',
                message: 'ไม่สามารถพิมพ์ได้: ไม่พบข้อมูลใบเสร็จ'
            });
        }
    };

    useEffect(() => { /* ... fetchData เหมือนเดิม ... */
        const fetchData = async () => {
            setLoading(true); setError('');
            try {
                const [farmerRes, productRes] = await Promise.all([
                    fetch('http://127.0.0.1:5000/farmers'),
                    fetch('http://127.0.0.1:5000/products')
                ]);
                if (!farmerRes.ok || !productRes.ok) throw new Error('ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
                setFarmers(await farmerRes.json());
                setProducts(await productRes.json());
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    useEffect(() => { /* ... handleClickOutside เหมือนเดิม ... */
        const handleClickOutside = (event) => {
            if (farmerSearchRef.current && !farmerSearchRef.current.contains(event.target)) {
                setIsFarmerListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAddItem = (product) => { /* ... โค้ดส่วนนี้เหมือนเดิม ... */
        if (orderItems.find(item => item.p_id === product.p_id)) {
            setResultDialog({ isOpen: true, type: 'error', message: 'สินค้านี้ถูกเพิ่มในรายการแล้ว' });
            return;
        }
        setOrderItems(prev => [...prev, {
            p_id: product.p_id, p_name: product.p_name, quantity: '1',
            price_per_unit: product.price_per_unit.toString(),
        }]);
    };
    const handleItemChange = (p_id, field, value) => {

        // ★★★★★ จุดแก้ไขที่ 1: สร้าง Regex แยกกัน ★★★★★
        // Regex สำหรับราคา (2 ตำแหน่ง)
        const decimalRegexPrice = /^\d*(\.\d{0,2})?$/;
        // Regex สำหรับจำนวน (3 ตำแหน่ง)
        const decimalRegexQuantity = /^\d*(\.\d{0,3})?$/;

        // ★★★★★ จุดแก้ไขที่ 2: ใช้ Regex ให้ถูก field ★★★★★
        if (field === 'quantity') {
            if (value && !decimalRegexQuantity.test(value)) {
                return; // ถ้าไม่ตรง format 3 ตำแหน่ง ให้ออก
            }
        } else if (field === 'price_per_unit') {
            if (value && !decimalRegexPrice.test(value)) {
                return; // ถ้าไม่ตรง format 2 ตำแหน่ง ให้ออก
            }
        }
        // ★★★★★ สิ้นสุดจุดแก้ไข ★★★★★

        const MAX_PRICE = 9999999.999;

        // ★★★★★ จุดแก้ไขที่ 3: ปรับ MAX_QUANTITY ให้รองรับ .999 ★★★★★
        const MAX_QUANTITY = 999999.999;
        // ★★★★★ สิ้นสุดจุดแก้ไข ★★★★★

        const numericValue = parseFloat(value);

        if (field === 'price_per_unit') {
            if (numericValue > MAX_PRICE) return;
            if (numericValue === 0 && value.trim() !== '') return;
        }

        if (field === 'quantity') {
            // ถ้าค่าตัวเลขเกินกำหนด ให้หยุด
            if (numericValue > MAX_QUANTITY) return;
        }

        // ถ้าผ่านทุกเงื่อนไข ให้อัปเดต state
        setOrderItems(prev => prev.map(item => item.p_id === p_id ? { ...item, [field]: value } : item));
    };

    const handleItemBlur = (p_id, field, value) => { /* ... โค้ดส่วนนี้เหมือนเดิม ... */
        setOrderItems(prev => prev.map(item => {
            if (item.p_id === p_id) {
                // Prevent price_per_unit from being 0 or blank
                if (field === 'price_per_unit' && (value.trim() === '' || value.trim() === '.' || parseFloat(value) === 0)) {
                    return { ...item, [field]: item.price_per_unit || '1' };
                }
                if ((value.trim() === '' || value.trim() === '.')) {
                    return { ...item, [field]: '0' };
                }
            }
            return item;
        }));
    };
    const handleRemoveItem = (p_id) => setOrderItems(prev => prev.filter(item => item.p_id !== p_id));
    const calculateTotal = () => orderItems.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.price_per_unit || 0)), 0);
    const handleSelectFarmer = (farmer) => { /* ... โค้ดส่วนนี้เหมือนเดิม ... */
        setSelectedFarmer(farmer.f_id);
        setFarmerSearch(farmer.f_name);
        setIsFarmerListOpen(false);
    };

    // Show confirm dialog before actual submit
    const handleConfirmOrder = () => {
        if (!selectedFarmer || orderItems.length === 0) {
            setResultDialog({ isOpen: true, type: 'error', message: 'กรุณาเลือกเกษตรกรและเพิ่มสินค้า' }); return;
        }
        if (orderItems.some(item => parseFloat(item.quantity || 0) <= 0)) {
            setResultDialog({ isOpen: true, type: 'error', message: 'จำนวนสินค้าต้องมากกว่า 0' }); return;
        }
        setIsConfirmDialogOpen(true);
    };

    // Actual submit after confirmation
    const handleSubmitOrder = async () => {
        setIsConfirmDialogOpen(false);
        setIsSubmitting(true);
        const orderData = {
            f_id: selectedFarmer,
            employee_id: user.e_id,
            items: orderItems.map(({ p_id, quantity, price_per_unit }) => ({
                p_id, quantity: parseFloat(quantity), price_per_unit: parseFloat(price_per_unit),
            })),
        };
        try {
            const response = await fetch('http://127.0.0.1:5000/purchaseorders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            const resultData = await response.json();
            if (!response.ok) {
                throw new Error(resultData.message || 'เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ');
            }
            setCompletedOrder(resultData);
            setSelectedFarmer('');
            setOrderItems([]);
            setFarmerSearch('');
        } catch (error) {
            setResultDialog({ isOpen: true, type: 'error', message: `เกิดข้อผิดพลาด: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredFarmers = farmers.filter(f => f.f_name.toLowerCase().includes(farmerSearch.toLowerCase()));
    const totalPurchasePrice = calculateTotal();

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-500" size={48} /> <span className="ml-4 text-lg">กำลังโหลด...</span></div>;
    if (error) return <div className="flex flex-col justify-center items-center h-screen text-red-600"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;

    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-200">
            <ResultDialog isOpen={resultDialog.isOpen} onClose={() => setResultDialog({ ...resultDialog, isOpen: false })} type={resultDialog.type} message={resultDialog.message} />

            <SuccessPrintDialog
                isOpen={!!completedOrder}
                onClose={handleCloseSuccessDialog}
                onPrint={triggerPrint}
                orderNumber={completedOrder?.purchase_order_number}
            />

            <div className="text-center mb-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transform hover:scale-[1.02] transition-all duration-300">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">สร้างใบสั่งซื้อ</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">บันทึกรายการสั่งซื้อวัตถุดิบจากเกษตรกร</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* ส่วนข้อมูลหลัก */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-3">
                            <User size={24} className="text-blue-500" />
                            <span>ข้อมูลหลัก</span>
                        </h2>
                        <div ref={farmerSearchRef}>
                            <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                <User size={16} className="mr-2 text-blue-500" />
                                ค้นหาเกษตรกร
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="พิมพ์เพื่อค้นหา..." 
                                    value={farmerSearch} 
                                    onFocus={() => setIsFarmerListOpen(true)} 
                                    onChange={(e) => { 
                                        setFarmerSearch(e.target.value); 
                                        setSelectedFarmer(''); 
                                        setIsFarmerListOpen(true); 
                                    }} 
                                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-200" 
                                />
                                {isFarmerListOpen && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border-2 rounded-xl shadow-2xl max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                                        {filteredFarmers.length > 0 ? 
                                            filteredFarmers.map(f => (
                                                <div 
                                                    key={f.f_id} 
                                                    onClick={() => handleSelectFarmer(f)} 
                                                    className="p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                                                >
                                                    {f.f_name}
                                                </div>
                                            )) : 
                                            <div className="p-3 text-gray-500">ไม่พบเกษตรกร</div>
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ส่วนรายการสินค้า */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-3">
                            <Archive size={24} className="text-green-500" />
                            <span>รายการสินค้าทั้งหมด</span>
                        </h2>
                        <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                            <ul className="grid grid-cols-1 gap-4">
                                {products.map(p => (
                                    <li key={p.p_id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all duration-200">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{p.p_name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                ราคาล่าสุด: 
                                                <span className="font-mono text-green-600 dark:text-green-400 ml-2 text-lg">
                                                    {p.price_per_unit.toFixed(2)} บ.
                                                </span>
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => handleAddItem(p)} 
                                            disabled={orderItems.some(item => item.p_id === p.p_id)} 
                                            className="bg-blue-500 text-white hover:bg-blue-600 font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            <PlusCircle size={16} />
                                            {orderItems.some(item => item.p_id === p.p_id) ? 'เพิ่มแล้ว' : 'เพิ่มสินค้า'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 sticky top-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
                            <ShoppingCart className="text-purple-500" size={24} />
                            <span>สรุปรายการ</span>
                        </h2>
                        <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                            {orderItems.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                    <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">ยังไม่มีสินค้า</p>
                                </div>
                            ) : (
                                orderItems.map(item => (
                                    <div key={item.p_id} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 transition-all duration-200 hover:shadow-md">
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{item.p_name}</p>
                                            <button 
                                                onClick={() => handleRemoveItem(item.p_id)} 
                                                className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    จำนวน (กก.)
                                                </label>
                                                <input 
                                                    type="text" 
                                                    inputMode="decimal" 
                                                    placeholder="จำนวน" 
                                                    value={item.quantity} 
                                                    onChange={(e) => handleItemChange(item.p_id, 'quantity', e.target.value)} 
                                                    onBlur={(e) => handleItemBlur(item.p_id, 'quantity', e.target.value)} 
                                                    className="w-full p-2.5 border-2 rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-200" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    ราคา/หน่วย
                                                </label>
                                                <input 
                                                    type="text" 
                                                    inputMode="decimal" 
                                                    placeholder="ราคา/หน่วย" 
                                                    value={item.price_per_unit} 
                                                    onChange={(e) => handleItemChange(item.p_id, 'price_per_unit', e.target.value)} 
                                                    onBlur={(e) => handleItemBlur(item.p_id, 'price_per_unit', e.target.value)} 
                                                    className="w-full p-2.5 border-2 rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-200" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {orderItems.length > 0 && (
                            <div className="mt-6 pt-4 border-t-2 border-dashed dark:border-gray-700">
                                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-2xl p-4 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">ยอดรวม</span>
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {totalPurchasePrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleConfirmOrder} 
                                    disabled={isSubmitting || !selectedFarmer} 
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-[1.02]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            <span>กำลังบันทึก...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            <span>ยืนยันการสร้างใบสั่งซื้อ</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ส่วนที่ซ่อนไว้สำหรับพิมพ์ (ref จะถูกผูกกับ div นี้เมื่อ completedOrder มีค่า) */}
            {completedOrder && <div style={{ display: "none" }}><PrintableReceipt ref={receiptRef} order={completedOrder} /></div>}

            {/* Modal for order confirmation */}
            <ConfirmOrderDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={handleSubmitOrder}
                farmer={farmers.find(f => f.f_id === selectedFarmer)}
                items={orderItems}
                total={totalPurchasePrice}
            />
        </div>
    );
};

export default PurchaseProduct;