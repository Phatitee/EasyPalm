import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Archive, PlusCircle, Trash2, CheckCircle, Loader, ServerCrash, TrendingUp, Search } from 'lucide-react';

const CreateSalesOrder = () => {
    // Data states
    const [customers, setCustomers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [stockLevels, setStockLevels] = useState([]);

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

    const customerSearchRef = useRef(null);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [custRes, whRes, stockRes] = await Promise.all([
                    fetch('http://localhost:5000/food-industries'),
                    fetch('http://localhost:5000/warehouses'),
                    fetch('http://localhost:5000/stock')
                ]);

                if (!custRes.ok || !whRes.ok || !stockRes.ok) throw new Error('ไม่สามารถโหลดข้อมูลเริ่มต้นได้');

                setCustomers(await custRes.json());
                setWarehouses(await whRes.json());
                setStockLevels(await stockRes.json());

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
    }, [customerSearchRef]);


    const availableProducts = selectedWarehouse
        ? stockLevels.filter(stock => stock.warehouse_id === selectedWarehouse && stock.quantity > 0)
        : [];
    
    // --- ฟังก์ชันจัดการรายการสินค้า (แก้ไขแล้ว) ---
    const handleAddItem = (product) => {
        if (!product || !product.product_id) {
            alert("เกิดข้อผิดพลาด: ข้อมูลสินค้าจาก API ไม่ถูกต้อง");
            return;
        }

        if (orderItems.find(item => item.p_id === product.product_id)) {
            return alert('สินค้านี้ถูกเพิ่มในรายการแล้ว');
        }

        const newItem = {
            p_id: product.product_id,
            p_name: product.product_name,
            // ★★★ FIX: เปลี่ยน State เป็น String เพื่อรองรับช่องว่าง ★★★
            quantity: '1',
            price_per_unit: '0',
            max_quantity: product.quantity,
            average_cost: product.average_cost || 0,
        };
        
        setOrderItems(prevItems => [...prevItems, newItem]);
    };

    // ★★★ FIX: แก้ไข handleItemChange ให้รองรับ String ★★★
    const handleItemChange = (productId, field, value) => {
        // อนุญาตให้กรอกเฉพาะตัวเลขและจุดทศนิยม
        if (value && !/^\d*\.?\d*$/.test(value)) {
            return;
        }

        setOrderItems(prevItems => prevItems.map(item => {
            if (item.p_id === productId) {
                let updatedValue = value;
                // ตรวจสอบจำนวนไม่ให้เกินสต็อก
                if (field === 'quantity') {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue > item.max_quantity) {
                        updatedValue = item.max_quantity.toString();
                    }
                }
                return { ...item, [field]: updatedValue };
            }
            return item;
        }));
    };

    // ★★★ NEW: เพิ่ม handleItemBlur เพื่อตั้งค่า 0 เมื่อช่องว่าง ★★★
    const handleItemBlur = (productId, field, value) => {
        setOrderItems(prevItems => prevItems.map(item => {
            if (item.p_id === productId) {
                // ถ้าช่องว่าง หรือมีแค่จุด ให้ตั้งค่าเป็น '0'
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
    
    // ★★★ FIX: แก้ไขการคำนวณให้แปลง String เป็น Float ★★★
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
        if (!selectedWarehouse || !selectedCustomer || orderItems.length === 0) return alert('กรุณากรอกข้อมูลให้ครบ');
        
        // ★★★ FIX: ตรวจสอบค่าก่อนส่งข้อมูล ★★★
        if (orderItems.some(item => parseFloat(item.quantity || 0) <= 0 || parseFloat(item.price_per_unit || 0) <= 0)) {
            return alert('กรุณากรอกจำนวนและราคาของสินค้าทุกรายการให้ถูกต้อง (ต้องมากกว่า 0)');
        }

        setIsSubmitting(true);
        const orderData = {
            f_id: selectedCustomer,
            warehouse_id: selectedWarehouse,
            // ★★★ FIX: แปลงค่าเป็นตัวเลขก่อนส่งไป Backend ★★★
            items: orderItems.map(({ p_id, quantity, price_per_unit }) => ({ 
                p_id, 
                quantity: parseFloat(quantity), 
                price_per_unit: parseFloat(price_per_unit) 
            })),
        };
        
        try {
            const response = await fetch('http://localhost:5000/salesorders', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
            
            alert(`สร้างใบสั่งขาย ${result.sale_order_number} สำเร็จ!`);
            setSelectedWarehouse(''); setSelectedCustomer(''); setOrderItems([]); setCustomerSearch('');
            const stockRes = await fetch('http://localhost:5000/stock');
            setStockLevels(await stockRes.json());
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCustomers = customers.filter(c => c.F_name.toLowerCase().includes(customerSearch.toLowerCase()));
    const { totalRevenue, totalProfit } = calculateTotals();

    if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
    if (error) return <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg"><ServerCrash className="mx-auto mb-2" />{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">สร้างใบสั่งขาย (Sales Order)</h1>
                <p className="text-lg text-gray-500 mt-2">กระบวนการสร้างใบสั่งขายสำหรับลูกค้า</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* ข้อมูลหลัก: คลังและลูกค้า */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">ข้อมูลหลัก</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="flex items-center text-sm font-medium text-gray-600 mb-1"><Archive size={16} className="mr-2"/>เลือกคลังสินค้าต้นทาง</label>
                                <select value={selectedWarehouse} onChange={(e) => { setSelectedWarehouse(e.target.value); setOrderItems([]); }} className="w-full px-4 py-2 border rounded-lg bg-gray-50">
                                    <option value="">-- กรุณาเลือกคลังสินค้า --</option>
                                    {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                                </select>
                            </div>
                            <div ref={customerSearchRef}>
                                <label className="flex items-center text-sm font-medium text-gray-600 mb-1"><User size={16} className="mr-2"/>ค้นหาลูกค้า</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" placeholder="พิมพ์เพื่อค้นหาลูกค้า..." value={customerSearch} 
                                        onFocus={() => setIsCustomerListOpen(true)}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setSelectedCustomer('');
                                            setIsCustomerListOpen(true);
                                        }} 
                                        disabled={!selectedWarehouse} 
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                    />
                                    {isCustomerListOpen && selectedWarehouse && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                                <div key={c.F_id} onClick={() => handleSelectCustomer(c)} className="p-2 cursor-pointer hover:bg-blue-100">
                                                    {c.F_name}
                                                </div>
                                            )) : <div className="p-2 text-gray-500">ไม่พบลูกค้า</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* รายการสินค้าที่ขายได้ */}
                    <div className={`bg-white p-6 rounded-2xl shadow-lg transition-opacity duration-500 ${!selectedWarehouse ? 'opacity-50 cursor-not-allowed' : ''}`}>
                         <h2 className="text-xl font-semibold text-gray-700 mb-4">รายการสินค้าที่ขายได้</h2>
                        <div className="max-h-64 overflow-y-auto pr-2">
                             {!selectedWarehouse ? <p className="text-center text-gray-500 py-10">กรุณาเลือกคลังสินค้าเพื่อดูสต็อก</p>
                            : availableProducts.length === 0 ? <p className="text-center text-gray-500 py-10">ไม่พบสินค้าในคลังนี้</p>
                            : (
                                <ul className="divide-y divide-gray-200">
                                    {availableProducts.map(p => (
                                        <li key={p.product_id} className="flex justify-between items-center py-3">
                                            <div>
                                                <p className="font-semibold text-gray-800">{p.product_name}</p>
                                                <p className="text-sm text-gray-500">คงเหลือ: <span className="font-mono text-blue-600">{p.quantity.toLocaleString()} kg</span></p>
                                            </div>
                                            <button onClick={() => handleAddItem(p)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-1 px-3 rounded-full text-sm flex items-center gap-1">
                                                <PlusCircle size={14} /> เพิ่ม
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* สรุปรายการขาย */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"><ShoppingCart/>สรุปรายการขาย</h2>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                             {orderItems.length === 0 ? <p className="text-center text-gray-500 py-12">ยังไม่มีสินค้าในรายการ</p>
                            : orderItems.map(item => {
                                const lineRevenue = parseFloat(item.quantity || 0) * parseFloat(item.price_per_unit || 0);
                                const lineProfit = lineRevenue - (parseFloat(item.quantity || 0) * item.average_cost);
                                return (
                                <div key={item.p_id} className="border-b pb-3">
                                    <div className="flex justify-between items-start"><p className="font-semibold">{item.p_name}</p><button onClick={() => handleRemoveItem(item.p_id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button></div>
                                    <p className="text-xs text-gray-500 mb-2">สูงสุด: {item.max_quantity.toLocaleString()} kg | ต้นทุน: {item.average_cost.toFixed(2)} บ.</p>
                                    <div className="flex gap-2">
                                        {/* ★★★ FIX: เพิ่ม onBlur และเปลี่ยน type="text" ★★★ */}
                                        <input type="text" inputMode="decimal" placeholder="จำนวน" value={item.quantity}
                                            onChange={(e) => handleItemChange(item.p_id, 'quantity', e.target.value)}
                                            onBlur={(e) => handleItemBlur(item.p_id, 'quantity', e.target.value)}
                                            className="w-1/2 p-1.5 border rounded-md" />
                                        <input type="text" inputMode="decimal" placeholder="ราคา/หน่วย" value={item.price_per_unit}
                                            onChange={(e) => handleItemChange(item.p_id, 'price_per_unit', e.target.value)}
                                            onBlur={(e) => handleItemBlur(item.p_id, 'price_per_unit', e.target.value)}
                                            className="w-1/2 p-1.5 border rounded-md" />
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className={`font-semibold ${lineProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>กำไร: {lineProfit.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                                        <span className="font-semibold">รวม: {lineRevenue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                                    </div>
                                </div>
                            )})}
                        </div>
                        {orderItems.length > 0 && (
                            <div className="mt-6 pt-4 border-t-2 border-dashed">
                                <div className="flex justify-between items-center text-lg mb-2"><span className="font-semibold text-gray-700">ยอดรวม</span><span>{totalRevenue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span></div>
                                 <div className={`flex justify-between items-center text-xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}><span className="flex items-center gap-2"><TrendingUp/>กำไรโดยประมาณ</span><span>{totalProfit.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span></div>
                                <button onClick={handleSubmitOrder} disabled={isSubmitting} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
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