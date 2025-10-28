import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Archive, PlusCircle, Trash2, CheckCircle, Loader, ServerCrash, TrendingUp, Search, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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

    const farmerSearchRef = useRef(null);

    // Fetch initial data (farmers and products)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [farmerRes, productRes] = await Promise.all([
                    fetch('http://localhost:5000/farmers'),
                    fetch('http://localhost:5000/products')
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
            return alert('สินค้านี้ถูกเพิ่มในรายการแล้ว');
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
            return alert('กรุณาเลือกเกษตรกรและเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
        }
        if (orderItems.some(item => parseFloat(item.quantity || 0) <= 0 || parseFloat(item.price_per_unit || 0) < 0)) {
            return alert('กรุณากรอกจำนวนและราคาของสินค้าทุกรายการให้ถูกต้อง');
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
            const response = await fetch('http://localhost:5000/purchaseorders', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(orderData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาด');
            
            alert(`สร้างใบสั่งซื้อ ${result.purchase_order_number} สำเร็จ!`);
            setSelectedFarmer('');
            setOrderItems([]);
            setFarmerSearch('');
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredFarmers = farmers.filter(f => f.f_name.toLowerCase().includes(farmerSearch.toLowerCase()));
    const totalPurchasePrice = calculateTotal();

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-500" size={48} /> <span className="ml-4 text-lg">กำลังโหลดข้อมูล...</span></div>;
    if (error) return <div className="flex flex-col justify-center items-center h-screen text-red-600 bg-red-50 p-10 rounded-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">สร้างใบสั่งซื้อ (Purchase Order)</h1>
                <p className="text-lg text-gray-500 mt-2">บันทึกรายการสั่งซื้อวัตถุดิบจากเกษตรกร</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Main Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">ข้อมูลหลัก</h2>
                        <div ref={farmerSearchRef}>
                            <label className="flex items-center text-sm font-medium text-gray-600 mb-1"><User size={16} className="mr-2"/>ค้นหาเกษตรกร</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" placeholder="พิมพ์เพื่อค้นหาเกษตรกร..." value={farmerSearch} 
                                    onFocus={() => setIsFarmerListOpen(true)}
                                    onChange={(e) => {
                                        setFarmerSearch(e.target.value);
                                        setSelectedFarmer('');
                                        setIsFarmerListOpen(true);
                                    }} 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                />
                                {isFarmerListOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredFarmers.length > 0 ? filteredFarmers.map(f => (
                                            <div key={f.f_id} onClick={() => handleSelectFarmer(f)} className="p-2 cursor-pointer hover:bg-blue-100">
                                                {f.f_name}
                                            </div>
                                        )) : <div className="p-2 text-gray-500">ไม่พบเกษตรกร</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Available Products */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                         <h2 className="text-xl font-semibold text-gray-700 mb-4">รายการสินค้าทั้งหมด</h2>
                        <div className="max-h-64 overflow-y-auto pr-2">
                            <ul className="divide-y divide-gray-200">
                                {products.map(p => (
                                    <li key={p.p_id} className="flex justify-between items-center py-3">
                                        <div>
                                            <p className="font-semibold text-gray-800">{p.p_name}</p>
                                            <p className="text-sm text-gray-500 flex items-center"><Tag size={14} className="mr-1"/>ราคาล่าสุด: <span className="font-mono text-blue-600 ml-1">{p.price_per_unit.toFixed(2)} บ.</span></p>
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
                    <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"><ShoppingCart/>สรุปรายการสั่งซื้อ</h2>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                             {orderItems.length === 0 ? <p className="text-center text-gray-500 py-12">ยังไม่มีสินค้าในรายการ</p>
                            : orderItems.map(item => (
                                <div key={item.p_id} className="border-b pb-3">
                                    <div className="flex justify-between items-start"><p className="font-semibold">{item.p_name}</p><button onClick={() => handleRemoveItem(item.p_id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button></div>
                                    <div className="flex gap-2 mt-2">
                                        <input type="text" inputMode="decimal" placeholder="จำนวน" value={item.quantity}
                                            onChange={(e) => handleItemChange(item.p_id, 'quantity', e.target.value)}
                                            onBlur={(e) => handleItemBlur(item.p_id, 'quantity', e.target.value)}
                                            className="w-1/2 p-1.5 border rounded-md" />
                                        <input type="text" inputMode="decimal" placeholder="ราคา/หน่วย" value={item.price_per_unit}
                                            onChange={(e) => handleItemChange(item.p_id, 'price_per_unit', e.target.value)}
                                            onBlur={(e) => handleItemBlur(item.p_id, 'price_per_unit', e.target.value)}
                                            className="w-1/2 p-1.5 border rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {orderItems.length > 0 && (
                            <div className="mt-6 pt-4 border-t-2 border-dashed">
                                <div className="flex justify-between items-center text-xl font-bold mb-4"><span className="text-gray-700">ยอดรวม</span><span>{totalPurchasePrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span></div>
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