import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Archive, PlusCircle, Trash2, CheckCircle, Loader, ServerCrash, TrendingUp, Search, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Helper Modal (ResultDialog) - สำหรับแจ้งผลลัพธ์
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

    const customerSearchRef = useRef(null);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [custRes, whRes, stockRes] = await Promise.all([
                    fetch('http://127.0.0.1:5000/food-industries'),
                    fetch('http://127.0.0.1:5000/warehouses'),
                    fetch('http://127.0.0.1:5000/stock')
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

    // Effect to close dropdown when clicking outside
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
            price_per_unit: '0',
            max_quantity: product.quantity,
            average_cost: product.average_cost || 0,
        };
        
        setOrderItems(prevItems => [...prevItems, newItem]);
    };

    const handleItemChange = (productId, field, value) => {
        if (value && !/^\d*\.?\d*$/.test(value)) {
            return;
        }

        setOrderItems(prevItems => prevItems.map(item => {
            if (item.p_id === productId) {
                let updatedValue = value;
                if (field === 'quantity') {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue > item.max_quantity) {
                        // ไม่ต้องแจ้ง alert แต่จำกัดค่า
                        updatedValue = item.max_quantity.toString(); 
                    }
                }
                return { ...item, [field]: updatedValue };
            }
            return item;
        }));
    };

    const handleItemBlur = (productId, field, value) => {
        setOrderItems(prevItems => prevItems.map(item => {
            if (item.p_id === productId) {
                if (value.trim() === '' || value.trim() === '.') {
                    return { ...item, [field]: '0' };
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

    const handleSubmitOrder = async () => {
        if (!selectedWarehouse || !selectedCustomer || orderItems.length === 0) {
            setResultDialog({ isOpen: true, type: 'error', message: 'กรุณากรอกข้อมูลให้ครบ' });
            return;
        }
        
        if (orderItems.some(item => parseFloat(item.quantity || 0) <= 0 || parseFloat(item.price_per_unit || 0) <= 0)) {
            setResultDialog({ isOpen: true, type: 'error', message: 'กรุณากรอกจำนวนและราคาของสินค้าทุกรายการให้ถูกต้อง (ต้องมากกว่า 0)' });
            return;
        }

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
            const response = await fetch('http://127.0.0.1:5000/salesorders', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
            
            setResultDialog({ isOpen: true, type: 'success', message: `สร้างใบสั่งขาย ${result.sale_order_number} สำเร็จ!` });
            
            const stockRes = await fetch('http://127.0.0.1:5000/stock');
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
        // ★★★ Dark Mode FIX: Main Container Background ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <ResultDialog isOpen={resultDialog.isOpen} onClose={() => setResultDialog({ ...resultDialog, isOpen: false })} type={resultDialog.type} message={resultDialog.message} />

            <div className="text-center mb-8">
                {/* ★★★ Dark Mode FIX: Header Text Colors ★★★ */}
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">สร้างใบสั่งขาย (Sales Order)</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">กระบวนการสร้างใบสั่งขายสำหรับลูกค้า</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Main Info: Warehouse and Customer */}
                    {/* ★★★ Dark Mode FIX: Card Background ★★★ */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
                        {/* ★★★ Dark Mode FIX: Card Header Text Color ★★★ */}
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">ข้อมูลหลัก</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    {/* ★★★ Dark Mode FIX: Label Text Color and Icon ★★★ */}
                                    <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"><Archive size={16} className="mr-2 text-gray-500"/>เลือกคลังสินค้าต้นทาง</label>
                                    {/* ★★★ Dark Mode FIX: Select Input Styling ★★★ */}
                                    <select value={selectedWarehouse} onChange={(e) => { setSelectedWarehouse(e.target.value); setOrderItems([]); }} className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                                        <option value="">-- กรุณาเลือกคลังสินค้า --</option>
                                        {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                                    </select>
                                </div>
                            <div ref={customerSearchRef}>
                                {/* ★★★ Dark Mode FIX: Label Text Color and Icon ★★★ */}
                                <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"><User size={16} className="mr-2 text-gray-500"/>ค้นหาลูกค้า</label>
                                <div className="relative">
                                    {/* ★★★ Dark Mode FIX: Search Icon Color ★★★ */}
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                    <input type="text" placeholder="พิมพ์เพื่อค้นหาลูกค้า..." value={customerSearch} 
                                        onFocus={() => setIsCustomerListOpen(true)}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setSelectedCustomer('');
                                            setIsCustomerListOpen(true);
                                        }} 
                                        disabled={!selectedWarehouse} 
                                        // ★★★ Dark Mode FIX: Search Input Styling ★★★
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:disabled:bg-gray-600 dark:placeholder-gray-400"
                                    />
                                    {isCustomerListOpen && selectedWarehouse && (
                                        // ★★★ Dark Mode FIX: Dropdown List Styling ★★★
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                                            {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                                <div key={c.F_id} onClick={() => handleSelectCustomer(c)} className="p-2 cursor-pointer hover:bg-blue-100 dark:text-gray-100 dark:hover:bg-gray-600">
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
                    {/* ★★★ Dark Mode FIX: Card Background ★★★ */}
                    <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-opacity duration-500 ${!selectedWarehouse ? 'opacity-50 cursor-not-allowed' : ''}`}>
                         {/* ★★★ Dark Mode FIX: Card Header Text Color ★★★ */}
                         <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">รายการสินค้าที่ขายได้</h2>
                        <div className="max-h-64 overflow-y-auto pr-2">
                             {/* ★★★ Dark Mode FIX: Empty State Text Colors ★★★ */}
                             {!selectedWarehouse ? <p className="text-center text-gray-500 dark:text-gray-400 py-10">กรุณาเลือกคลังสินค้าเพื่อดูสต็อก</p>
                            : availableProducts.length === 0 ? <p className="text-center text-gray-500 dark:text-gray-400 py-10">ไม่พบสินค้าในคลังนี้</p>
                            : (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {availableProducts.map(p => (
                                        <li key={p.product_id} className="flex justify-between items-center py-3">
                                            <div>
                                                {/* ★★★ Dark Mode FIX: Product Text Colors ★★★ */}
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
                    {/* ★★★ Dark Mode FIX: Summary Card Background ★★★ */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg sticky top-8">
                        {/* ★★★ Dark Mode FIX: Card Header Text Color ★★★ */}
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-3"><ShoppingCart/>สรุปรายการขาย</h2>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                             {/* ★★★ Dark Mode FIX: Empty State Text Color ★★★ */}
                             {orderItems.length === 0 ? <p className="text-center text-gray-500 dark:text-gray-400 py-12">ยังไม่มีสินค้าในรายการ</p>
                            : orderItems.map(item => {
                                const lineRevenue = parseFloat(item.quantity || 0) * parseFloat(item.price_per_unit || 0);
                                const lineProfit = lineRevenue - (parseFloat(item.quantity || 0) * item.average_cost);
                                return (
                                <div key={item.p_id} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold dark:text-gray-100">{item.p_name}</p>
                                        {/* ★★★ Dark Mode FIX: Remove Button Color ★★★ */}
                                        <button onClick={() => handleRemoveItem(item.p_id)} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"><Trash2 size={16}/></button>
                                    </div>
                                    {/* ★★★ Dark Mode FIX: Item Info Text Color ★★★ */}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">สูงสุด: {item.max_quantity.toLocaleString()} kg | ต้นทุน: {item.average_cost.toFixed(2)} บ.</p>
                                    <div className="flex gap-2">
                                        <input type="text" inputMode="decimal" placeholder="จำนวน" value={item.quantity}
                                            onChange={(e) => handleItemChange(item.p_id, 'quantity', e.target.value)}
                                            onBlur={(e) => handleItemBlur(item.p_id, 'quantity', e.target.value)}
                                            // ★★★ Dark Mode FIX: Input Field Styling ★★★
                                            className="w-1/2 p-1.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                                        <input type="text" inputMode="decimal" placeholder="ราคา/หน่วย" value={item.price_per_unit}
                                            onChange={(e) => handleItemChange(item.p_id, 'price_per_unit', e.target.value)}
                                            onBlur={(e) => handleItemBlur(item.p_id, 'price_per_unit', e.target.value)}
                                            // ★★★ Dark Mode FIX: Input Field Styling ★★★
                                            className="w-1/2 p-1.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        {/* ★★★ Dark Mode FIX: Profit Text Color ★★★ */}
                                        <span className={`font-semibold ${lineProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>กำไร: {lineProfit.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                                        {/* ★★★ Dark Mode FIX: Total Revenue Text Color ★★★ */}
                                        <span className="font-semibold dark:text-gray-200">รวม: {lineRevenue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                                    </div>
                                </div>
                            )})}
                        </div>
                        {orderItems.length > 0 && (
                            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                                {/* ★★★ Dark Mode FIX: Total Revenue Text Color ★★★ */}
                                <div className="flex justify-between items-center text-lg mb-2"><span className="font-semibold text-gray-700 dark:text-gray-300">ยอดรวม</span><span className="dark:text-gray-100">{totalRevenue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span></div>
                                 {/* ★★★ Dark Mode FIX: Profit Text Color ★★★ */}
                                 <div className={`flex justify-between items-center text-xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}><span className="flex items-center gap-2"><TrendingUp/>กำไรโดยประมาณ</span><span>{totalProfit.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span></div>
                                <button onClick={handleSubmitOrder} disabled={isSubmitting || !selectedCustomer} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isSubmitting ? <Loader className="animate-spin"/> : <CheckCircle/>}
                                    {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการสร้างใบสั่งขาย'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSalesOrder;