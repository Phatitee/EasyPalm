import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Archive, PlusCircle, Trash2, CheckCircle, Loader, ServerCrash, TrendingUp, Search, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';



const API_URL = process.env.REACT_APP_API_URL;
// Helper Modal (ResultDialog) - (ไม่มีการแก้ไข)
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

// --- Modal for order confirmation (ไม่มีการแก้ไข) ---
const ConfirmOrderDialog = ({ isOpen, onClose, onConfirm, customer, warehouse, items, totalRevenue, totalProfit }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-lg text-center transform transition-all animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">ตรวจสอบรายละเอียดใบสั่งขาย</h3>
                <div className="mb-4 text-left">
                    <div className="mb-2"><span className="font-semibold">ลูกค้า:</span> {customer?.F_name || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">คลังสินค้า:</span> {warehouse?.warehouse_name || '-'}</div>
                    <table className="w-full text-sm border-collapse mb-2">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-2 border">#</th>
                                <th className="p-2 border">สินค้า</th>
                                <th className="p-2 border text-right">จำนวน (กก.)</th>
                                <th className="p-2 border text-right">ราคา/หน่วย</th>
                                <th className="p-2 border text-right">ราคารวม</th>
                                <th className="p-2 border text-right">กำไร</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const lineRevenue = parseFloat(item.quantity || 0) * parseFloat(item.price_per_unit || 0);
                                const lineProfit = lineRevenue - (parseFloat(item.quantity || 0) * item.average_cost);
                                return (
                                    <tr key={item.p_id}>
                                        <td className="p-2 border">{idx + 1}</td>
                                        <td className="p-2 border">{item.p_name}</td>
                                        {/* ★★★★★ จุดแก้ไข ★★★★★ */}
                                        <td className="p-2 border text-right">{parseFloat(item.quantity || 0).toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                                        {/* ★★★★★ สิ้นสุดจุดแก้ไข ★★★★★ */}
                                        <td className="p-2 border text-right">{parseFloat(item.price_per_unit || 0).toFixed(2)}</td>
                                        <td className="p-2 border text-right">{lineRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className={`p-2 border text-right ${lineProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>{lineProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold">
                                <td colSpan="4" className="p-2 border text-right">ยอดรวม</td>
                                <td className="p-2 border text-right text-lg">{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className={`p-2 border text-right text-lg ${totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button onClick={onClose} className="w-full px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">ตรวจสอบ/แก้ไข</button>
                    <button onClick={onConfirm} className="w-full px-4 py-2.5 text-white rounded-lg font-semibold bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"><CheckCircle size={18} />ยืนยันสร้างใบสั่งขาย</button>
                </div>
            </div>
        </div>
    );
};

// ★★★ 1. กำหนดค่าสูงสุดสำหรับ "ราคา" ★★★
const MAX_ALLOWED_PRICE = 9999999.99; // เช่น 10 ล้าน (ลบ 0.01)

const CreateSalesOrder = () => {
    // Data states
    const [customers, setCustomers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [stockLevels, setStockLevels] = useState([]);
    const { user } = useAuth();

    // Form states
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' }); // Modal State
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const customerSearchRef = useRef(null);

    // Fetch initial data (ไม่มีการแก้ไข)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [custRes, whRes, stockRes] = await Promise.all([
                    fetch('${API_URL}/food-industries'),
                    fetch('${API_URL}/warehouses'),
                    fetch('${API_URL}/stock')
                ]);

                if (!custRes.ok || !whRes.ok || !stockRes.ok) {
                    const custErr = !custRes.ok ? `Customer: ${custRes.statusText}` : '';
                    const whErr = !whRes.ok ? `Warehouse: ${whRes.statusText}` : '';
                    const stockErr = !stockRes.ok ? `Stock: ${stockRes.statusText}` : '';
                    throw new Error(`ไม่สามารถโหลดข้อมูลเริ่มต้นได้: ${custErr} ${whErr} ${stockErr}`.trim());
                }

                const whData = await whRes.json();
                setCustomers(await custRes.json());
                setWarehouses(whData);
                setStockLevels(await stockRes.json());

                if (whData.length > 0) {
                    setSelectedWarehouse(whData[0].warehouse_id);
                }

            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // Effect to close dropdown (ไม่มีการแก้ไข)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (customerSearchRef.current && !customerSearchRef.current.contains(event.target)) {
                setIsCustomerListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const availableProducts = selectedWarehouse
        ? stockLevels.filter(stock => stock.warehouse_id === selectedWarehouse && stock.quantity > 0)
        : [];

    // (handleAddItem, handleItemBlur, handleRemoveItem, ... ไม่มีการแก้ไข)
    const handleAddItem = (product) => {
        if (!product || !product.product_id) {
            setResultDialog({ isOpen: true, type: 'error', message: "เกิดข้อผิดพลาด: ข้อมูลสินค้าจาก API ไม่ถูกต้อง" });
            return;
        }

        if (orderItems.find(item => item.p_id === product.product_id)) {
            setResultDialog({ isOpen: true, type: 'error', message: 'สินค้านี้ถูกเพิ่มในรายการแล้ว' });
            return;
        }

        const newItem = {
            p_id: product.product_id,
            p_name: product.product_name,
            quantity: '1',
            price_per_unit: '0', // ตั้งเป็น 0 เพื่อให้ผู้ใช้กรอก
            max_quantity: product.quantity,
            average_cost: product.average_cost || 0,
        };

        setOrderItems(prevItems => [...prevItems, newItem]);
    };

    // ★★★ 2. แทนที่ handleItemChange ทั้งหมดด้วยฟังก์ชันนี้ ★★★
    const handleItemChange = (productId, field, value) => {
        // 1. อนุญาตให้เป็นค่าว่าง
        if (value === "") {
            setOrderItems(prevItems => prevItems.map(item =>
                item.p_id === productId ? { ...item, [field]: "" } : item
            ));
            return;
        }

        // ★★★★★ จุดแก้ไขที่ 1: สร้าง Regex แยกกัน ★★★★★
        // Regex สำหรับราคา (2 ตำแหน่ง)
        const decimalRegexPrice = /^\d*(\.\d{0,2})?$/;
        // Regex สำหรับจำนวน (3 ตำแหน่ง)
        const decimalRegexQuantity = /^\d*(\.\d{0,3})?$/;

        // เลือก Regex ที่ถูกต้องตาม field ที่กำลังแก้
        const currentRegex = (field === 'quantity') ? decimalRegexQuantity : decimalRegexPrice;
        // ★★★★★ สิ้นสุดจุดแก้ไข ★★★★★

        if (currentRegex.test(value)) { // ★★★ แก้ไขมาใช้ currentRegex ★★★
            // 3. ถ้าผ่าน Regex, อัปเดต state แต่ต้องตรวจสอบเงื่อนไข
            setOrderItems(prevItems => prevItems.map(item => {
                if (item.p_id === productId) {
                    const numericValue = parseFloat(value);

                    // --- Logic for 'quantity' (คง logic เดิมไว้) ---
                    if (field === 'quantity') {
                        if (!isNaN(numericValue) && numericValue > item.max_quantity) {
                            return { ...item, quantity: item.max_quantity.toString() }; // ตั้งเป็นค่า max
                        }
                    }

                    // --- Logic for 'price_per_unit' (คง logic เดิมไว้) ---
                    if (field === 'price_per_unit') {
                        if (numericValue > MAX_ALLOWED_PRICE) {
                            return item; // ไม่ต้องอัปเดต state (ค่าเกิน)
                        }
                    }

                    // ถ้าผ่านหมด
                    return { ...item, [field]: value };
                }
                return item;
            }));
        }
        // ถ้าไม่ตรง regex (เช่น 1.2345) state จะไม่อัปเดต
    };

    const handleItemBlur = (productId, field, value) => {
        setOrderItems(prevItems => prevItems.map(item => {
            if (item.p_id === productId) {
                if (value.trim() === '' || value.trim() === '.') {
                    // ถ้าเป็น "จำนวน" แล้วเบลอ ให้เป็น '1' (หรือ '0' ตาม logic เดิม)
                    if (field === 'quantity') {
                        return { ...item, [field]: '1' };
                    }
                    // ถ้าเป็น "ราคา" แล้วเบลอ ให้เป็น '0'
                    if (field === 'price_per_unit') {
                        return { ...item, [field]: '0' };
                    }
                }
            }
            return item;
        }));
    };


    const handleRemoveItem = (productId) => {
        setOrderItems(prevItems => prevItems.filter(item => item.p_id !== productId));
    };

    const calculateTotals = () => {
        const totalRevenue = orderItems.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.price_per_unit || 0)), 0);
        const totalCost = orderItems.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * item.average_cost), 0);
        const totalProfit = totalRevenue - totalCost;
        return { totalRevenue, totalProfit };
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer.F_id);
        setCustomerSearch(customer.F_name);
        setIsCustomerListOpen(false);
    };

    // ★★★ 3. แก้ไข handleConfirmOrder ให้ตรวจสอบละเอียดขึ้น ★★★
    const handleConfirmOrder = () => {
        if (!selectedWarehouse || !selectedCustomer || orderItems.length === 0) {
            setResultDialog({ isOpen: true, type: 'error', message: 'กรุณากรอกข้อมูลให้ครบ' });
            return;
        }

        // --- NEW VALIDATION LOOP ---
        for (const item of orderItems) {
            const quantity = parseFloat(item.quantity);
            const price = parseFloat(item.price_per_unit);

            // ตรวจสอบจำนวน (Quantity)
            if (item.quantity === "" || isNaN(quantity) || quantity <= 0) {
                setResultDialog({ isOpen: true, type: 'error', message: `กรุณากรอกจำนวนของ "${item.p_name}" ให้ถูกต้อง (ต้องมากกว่า 0)` });
                return;
            }
            if (quantity > item.max_quantity) {
                setResultDialog({ isOpen: true, type: 'error', message: `จำนวนของ "${item.p_name}" เกินสต็อก (สูงสุด ${item.max_quantity.toLocaleString()})` });
                return;
            }

            // ตรวจสอบราคา (Price)
            if (item.price_per_unit === "" || isNaN(price) || price <= 0) {
                setResultDialog({ isOpen: true, type: 'error', message: `กรุณากรอกราคาของ "${item.p_name}" ให้ถูกต้อง (ต้องมากกว่า 0)` });
                return;
            }
            if (price > MAX_ALLOWED_PRICE) {
                setResultDialog({ isOpen: true, type: 'error', message: `ราคาของ "${item.p_name}" เกินกำหนด (สูงสุด ${MAX_ALLOWED_PRICE.toLocaleString()})` });
                return;
            }
        }
        // --- END NEW VALIDATION ---

        setIsConfirmDialogOpen(true);
    };

    // Actual submit after confirmation (ไม่มีการแก้ไข)
    const handleSubmitOrder = async () => {
        setIsConfirmDialogOpen(false);
        setIsSubmitting(true);
        const orderData = {
            f_id: selectedCustomer,
            warehouse_id: selectedWarehouse,
            employee_id: user.e_id,
            items: orderItems.map(({ p_id, quantity, price_per_unit }) => ({
                p_id,
                quantity: parseFloat(quantity),
                price_per_unit: parseFloat(price_per_unit),
            })),
        };
        try {
            const response = await fetch('${API_URL}/salesorders', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาดที่ไม่รู้จัก');

            setResultDialog({ isOpen: true, type: 'success', message: `สร้างใบสั่งขาย ${result.sale_order_number} สำเร็จ!` });

            const stockRes = await fetch('${API_URL}/stock');
            setStockLevels(await stockRes.json());

            // Reset form
            setSelectedCustomer('');
            setOrderItems([]);
            setCustomerSearch('');

        } catch (error) {
            setResultDialog({ isOpen: true, type: 'error', message: `เกิดข้อผิดพลาด: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCustomers = customers.filter(c => c.F_name.toLowerCase().includes(customerSearch.toLowerCase()));
    const { totalRevenue, totalProfit } = calculateTotals();

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /> <span className="ml-4 text-lg">กำลังโหลดข้อมูล...</span></div>;
    if (error) return <div className="flex flex-col justify-center items-center h-screen text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 rounded-lg p-10 shadow-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <ResultDialog isOpen={resultDialog.isOpen} onClose={() => setResultDialog({ ...resultDialog, isOpen: false })} type={resultDialog.type} message={resultDialog.message} />

            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">สร้างใบสั่งขาย (Sales Order)</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">กระบวนการสร้างใบสั่งขายสำหรับลูกค้า</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Main Info: Warehouse and Customer */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">ข้อมูลหลัก</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"><Archive size={16} className="mr-2 text-gray-500" />เลือกคลังสินค้าต้นทาง</label>
                                <select value={selectedWarehouse} onChange={(e) => { setSelectedWarehouse(e.target.value); setOrderItems([]); }} className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                                    <option value="">-- กรุณาเลือกคลังสินค้า --</option>
                                    {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                                </select>
                            </div>
                            <div ref={customerSearchRef}>
                                <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"><User size={16} className="mr-2 text-gray-500" />ค้นหาลูกค้า</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                    <input type="text" placeholder="พิมพ์เพื่อค้นหาลูกค้า..." value={customerSearch}
                                        onFocus={() => setIsCustomerListOpen(true)}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setSelectedCustomer('');
                                            setIsCustomerListOpen(true);
                                        }}
                                        disabled={!selectedWarehouse}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:disabled:bg-gray-600 dark:placeholder-gray-400"
                                    />
                                    {isCustomerListOpen && selectedWarehouse && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                                            {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                                < div key={c.F_id} onClick={() => handleSelectCustomer(c)} className="p-2 cursor-pointer hover:bg-blue-100 dark:text-gray-100 dark:hover:bg-gray-600">
                                                    {c.F_name}
                                                </div>
                                            )) : <div className="p-2 text-gray-500 dark:text-gray-400">ไม่พบลูกค้า</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Available Products List */}
                    <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-opacity duration-500 ${!selectedWarehouse ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">รายการสินค้าที่ขายได้</h2>
                        <div className="max-h-64 overflow-y-auto pr-2">
                            {!selectedWarehouse ? <p className="text-center text-gray-500 dark:text-gray-400 py-10">กรุณาเลือกคลังสินค้าเพื่อดูสต็อก</p>
                                : availableProducts.length === 0 ? <p className="text-center text-gray-500 dark:text-gray-400 py-10">ไม่พบสินค้าในคลังนี้</p>
                                    : (
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {availableProducts.map(p => (
                                                <li key={p.product_id} className="flex justify-between items-center py-3">
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-gray-100">{p.product_name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">คงเหลือ: <span className="font-mono text-blue-600">{p.quantity.toLocaleString()} kg</span></p>
                                                    </div>
                                                    <button onClick={() => handleAddItem(p)} disabled={orderItems.some(item => item.p_id === p.product_id)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-1 px-3 rounded-full text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-100">
                                                        <PlusCircle size={14} /> {orderItems.some(item => item.p_id === p.product_id) ? 'เพิ่มแล้ว' : 'เพิ่ม'}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg sticky top-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-3"><ShoppingCart />สรุปรายการขาย</h2>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                            {orderItems.length === 0 ? <p className="text-center text-gray-500 dark:text-gray-400 py-12">ยังไม่มีสินค้าในรายการ</p>
                                : orderItems.map(item => {
                                    const lineRevenue = parseFloat(item.quantity || 0) * parseFloat(item.price_per_unit || 0);
                                    const lineProfit = lineRevenue - (parseFloat(item.quantity || 0) * item.average_cost);
                                    return (
                                        <div key={item.p_id} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold dark:text-gray-100">{item.p_name}</p>
                                                <button onClick={() => handleRemoveItem(item.p_id)} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"><Trash2 size={16} /></button>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">สูงสุด: {item.max_quantity.toLocaleString()} kg | ต้นทุน: {item.average_cost.toFixed(2)} บ.</p>
                                            <div className="flex gap-2 mb-1">
                                                <span className="w-1/2 text-xs text-gray-500 dark:text-gray-400">จำนวน (กก.)</span>
                                                <span className="w-1/2 text-xs text-gray-500 dark:text-gray-400">ราคา/หน่วย</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {/* ★★★ 4. เพิ่ม max attribute ให้ Input ★★★ */}
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="จำนวน"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(item.p_id, 'quantity', e.target.value)}
                                                    onBlur={(e) => handleItemBlur(item.p_id, 'quantity', e.target.value)}
                                                    className="w-1/2 p-1.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                                    max={item.max_quantity}
                                                />
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="ราคา/หน่วย"
                                                    value={item.price_per_unit}
                                                    onChange={(e) => handleItemChange(item.p_id, 'price_per_unit', e.target.value)}
                                                    onBlur={(e) => handleItemBlur(item.p_id, 'price_per_unit', e.target.value)}
                                                    _ className="w-1/2 p-1.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                                    max={MAX_ALLOWED_PRICE}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm mt-1">
                                                <span className={`font-semibold ${lineProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>กำไร: {lineProfit.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                                                <span className="font-semibold dark:text-gray-200">รวม: {lineRevenue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                        {orderItems.length > 0 && (
                            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center text-lg mb-2"><span className="font-semibold text-gray-700 dark:text-gray-300">ยอดรวม</span><span className="dark:text-gray-100">{totalRevenue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span></div>
                                <div className={`flex justify-between items-center text-xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}><span className="flex items-center gap-2"><TrendingUp />กำไรโดยประมาณ</span><span>{totalProfit.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span></div>
                                <button onClick={handleConfirmOrder} disabled={isSubmitting || !selectedCustomer} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isSubmitting ? <Loader className="animate-spin" /> : <CheckCircle />}
                                    {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการสร้างใบสั่งขาย'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for order confirmation */}
            <ConfirmOrderDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={handleSubmitOrder}
                T customer={customers.find(c => c.F_id === selectedCustomer)}
                warehouse={warehouses.find(w => w.warehouse_id === selectedWarehouse)}
                items={orderItems}
                totalRevenue={totalRevenue}
                totalProfit={totalProfit}
            />
        </div >
    );
};

export default CreateSalesOrder;