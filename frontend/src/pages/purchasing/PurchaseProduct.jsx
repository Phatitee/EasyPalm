import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Archive, PlusCircle, Trash2, CheckCircle, Loader, ServerCrash, TrendingUp, Search, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Tag } from 'antd';



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


const PurchaseProduct = () => {
    // Data states
    const [farmers, setFarmers] = useState([]);
    const [products, setProducts] = useState([]);
    const { user } = useAuth();

    // Form states
    const [selectedFarmer, setSelectedFarmer] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [farmerSearch, setFarmerSearch] = useState('');

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFarmerListOpen, setIsFarmerListOpen] = useState(false);
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' }); // Modal State

    const farmerSearchRef = useRef(null);

    // Fetch initial data (farmers and products)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
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

    // Effect to close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (farmerSearchRef.current && !farmerSearchRef.current.contains(event.target)) {
                setIsFarmerListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAddItem = (product) => {
        if (orderItems.find(item => item.p_id === product.p_id)) {
            setResultDialog({ isOpen: true, type: 'error', message: 'สินค้านี้ถูกเพิ่มในรายการแล้ว' });
            return;
        }
        const newItem = {
            p_id: product.p_id,
            p_name: product.p_name,
            quantity: '1',
            price_per_unit: product.price_per_unit.toString(), // Use default price
        };
        setOrderItems(prevItems => [...prevItems, newItem]);
    };

    const handleItemChange = (productId, field, value) => {
        if (value && !/^\d*\.?\d*$/.test(value)) {
            return;
        }
        setOrderItems(prevItems => prevItems.map(item => 
            item.p_id === productId ? { ...item, [field]: value } : item
        ));
    };
    
    const handleItemBlur = (productId, field, value) => {
        setOrderItems(prevItems => prevItems.map(item => {
            if (item.p_id === productId && (value.trim() === '' || value.trim() === '.')) {
                return { ...item, [field]: '0' };
            }
            return item;
        }));
    };

    const handleRemoveItem = (productId) => {
        setOrderItems(prevItems => prevItems.filter(item => item.p_id !== productId));
    };
    
    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.price_per_unit || 0)), 0);
    };

    const handleSelectFarmer = (farmer) => {
        setSelectedFarmer(farmer.f_id);
        setFarmerSearch(farmer.f_name);
        setIsFarmerListOpen(false);
    };

    const handleSubmitOrder = async () => {
        if (!selectedFarmer || orderItems.length === 0) {
            setResultDialog({ isOpen: true, type: 'error', message: 'กรุณาเลือกเกษตรกรและเพิ่มรายการสินค้าอย่างน้อย 1 รายการ' });
            return;
        }
        if (orderItems.some(item => parseFloat(item.quantity || 0) <= 0 || parseFloat(item.price_per_unit || 0) < 0)) {
            setResultDialog({ isOpen: true, type: 'error', message: 'กรุณากรอกจำนวนและราคาของสินค้าทุกรายการให้ถูกต้อง' });
            return;
        }

        setIsSubmitting(true);
        const orderData = {
            f_id: selectedFarmer,
            employee_id: user.e_id, // Add employee ID
            items: orderItems.map(({ p_id, quantity, price_per_unit }) => ({ 
                p_id, 
                quantity: parseFloat(quantity), 
                price_per_unit: parseFloat(price_per_unit),
            })),
        };
        
        try {
            const response = await fetch('http://127.0.0.1:5000/purchaseorders', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(orderData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาด');
            
            setResultDialog({ isOpen: true, type: 'success', message: `สร้างใบสั่งซื้อ ${result.purchase_order_number} สำเร็จ!` });
            
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

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /> <span className="ml-4 text-lg">กำลังโหลดข้อมูล...</span></div>;
    if (error) return <div className="flex flex-col justify-center items-center h-screen text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;

    return (
        // ★★★ Dark Mode FIX: Main Container Background ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <ResultDialog isOpen={resultDialog.isOpen} onClose={() => setResultDialog({ ...resultDialog, isOpen: false })} type={resultDialog.type} message={resultDialog.message} />

            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">สร้างใบสั่งซื้อ (Purchase Order)</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">บันทึกรายการสั่งซื้อวัตถุดิบจากเกษตรกร</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Main Info */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">ข้อมูลหลัก</h2>
                        <div ref={farmerSearchRef}>
                            <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"><User size={16} className="mr-2"/>ค้นหาเกษตรกร</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input type="text" placeholder="พิมพ์เพื่อค้นหาเกษตรกร..." value={farmerSearch} 
                                    onFocus={() => setIsFarmerListOpen(true)}
                                    onChange={(e) => {
                                        setFarmerSearch(e.target.value);
                                        setSelectedFarmer('');
                                        setIsFarmerListOpen(true);
                                    }} 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                                {isFarmerListOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                                        {filteredFarmers.length > 0 ? filteredFarmers.map(f => (
                                            <div key={f.f_id} onClick={() => handleSelectFarmer(f)} className="p-2 cursor-pointer hover:bg-blue-100 dark:text-gray-100 dark:hover:bg-gray-600">
                                                {f.f_name}
                                            </div>
                                        )) : <div className="p-2 text-gray-500 dark:text-gray-400">ไม่พบเกษตรกร</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Available Products */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                         <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">รายการสินค้าทั้งหมด</h2>
                        <div className="max-h-64 overflow-y-auto pr-2">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {products.map(p => (
                                    <li key={p.p_id} className="flex justify-between items-center py-3">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{p.p_name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Tag size={14} className="mr-1"/>ราคาล่าสุด: <span className="font-mono text-blue-600 ml-1">{p.price_per_unit.toFixed(2)} บ.</span></p>
                                        </div>
                                        <button onClick={() => handleAddItem(p)} disabled={orderItems.some(item => item.p_id === p.p_id)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-1 px-3 rounded-full text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-100">
                                            <PlusCircle size={14} /> {orderItems.some(item => item.p_id === p.p_id) ? 'เพิ่มแล้ว' : 'เพิ่ม'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                
                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg sticky top-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-3"><ShoppingCart/>สรุปรายการสั่งซื้อ</h2>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                             {orderItems.length === 0 ? <p className="text-center text-gray-500 dark:text-gray-400 py-12">ยังไม่มีสินค้าในรายการ</p>
                            : orderItems.map(item => (
                                <div key={item.p_id} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                                    <div className="flex justify-between items-start"><p className="font-semibold dark:text-gray-100">{item.p_name}</p><button onClick={() => handleRemoveItem(item.p_id)} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"><Trash2 size={16}/></button></div>
                                    <div className="flex gap-2 mt-2">
                                        <input type="text" inputMode="decimal" placeholder="จำนวน" value={item.quantity}
                                            onChange={(e) => handleItemChange(item.p_id, 'quantity', e.target.value)}
                                            onBlur={(e) => handleItemBlur(item.p_id, 'quantity', e.target.value)}
                                            className="w-1/2 p-1.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                                        <input type="text" inputMode="decimal" placeholder="ราคา/หน่วย" value={item.price_per_unit}
                                            onChange={(e) => handleItemChange(item.p_id, 'price_per_unit', e.target.value)}
                                            onBlur={(e) => handleItemBlur(item.p_id, 'price_per_unit', e.target.value)}
                                            className="w-1/2 p-1.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {orderItems.length > 0 && (
                            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center text-xl font-bold mb-4"><span className="text-gray-700 dark:text-gray-300">ยอดรวม</span><span className="dark:text-gray-100">{totalPurchasePrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span></div>
                                <button onClick={handleSubmitOrder} disabled={isSubmitting || !selectedFarmer} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isSubmitting ? <Loader className="animate-spin"/> : <CheckCircle/>}
                                    {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการสร้างใบสั่งซื้อ'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseProduct;