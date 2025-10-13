// frontend/src/pages/PurchaseProduct.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, PlusCircle, Trash2 } from 'lucide-react'; // ไอคอนสวยๆ

const PurchaseProduct = () => {
    // --- State สำหรับ Master Data ---
    const [allFarmers, setAllFarmers] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    
    // --- State สำหรับ Header ของฟอร์ม ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmer, setSelectedFarmer] = useState(null);

    // --- State สำหรับรายการสินค้าในใบเสร็จ (หัวใจหลัก) ---
    const [items, setItems] = useState([]); // [{ p_id, p_name, quantity, price_per_unit, total }]

    // --- State สำหรับการโหลดและ Error ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [farmersRes, productsRes] = await Promise.all([
                    axios.get('http://127.0.0.1:5000/farmers'),
                    axios.get('http://127.0.0.1:5000/products')
                ]);
                setAllFarmers(farmersRes.data);
                setAllProducts(productsRes.data);
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredFarmers = searchTerm
        ? allFarmers.filter(farmer => farmer.f_name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];
    
    const handleSelectFarmer = (farmer) => {
        setSelectedFarmer(farmer);
        setSearchTerm(''); // เคลียร์ช่องค้นหา
    };

    const handleAddItem = () => {
        // เพิ่มรายการสินค้าเปล่าๆ 1 แถว
        setItems([...items, { p_id: '', p_name: '', quantity: 1, price_per_unit: 0, total: 0 }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        const currentItem = newItems[index];
        
        if (field === 'p_id') {
            const product = allProducts.find(p => p.p_id === value);
            currentItem.p_id = value;
            currentItem.p_name = product ? product.p_name : '';
        } else {
            currentItem[field] = value;
        }

        // คำนวณราคารวมของแถวนั้น
        const qty = parseFloat(currentItem.quantity) || 0;
        const price = parseFloat(currentItem.price_per_unit) || 0;
        currentItem.total = qty * price;

        setItems(newItems);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFarmer || items.length === 0) {
            alert('กรุณาเลือกเกษตรกรและเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
            return;
        }
        
        const purchaseData = {
            f_id: selectedFarmer.f_id,
            items: items.map(item => ({
                p_id: item.p_id,
                quantity: parseFloat(item.quantity),
                price_per_unit: parseFloat(item.price_per_unit)
            }))
        };

        try {
            const response = await axios.post('http://127.0.0.1:5000/purchaseorders', purchaseData);
            alert(`บันทึกสำเร็จ! เลขที่ใบเสร็จ: ${response.data.purchase_order_number}`);
            // ล้างฟอร์ม
            setSelectedFarmer(null);
            setItems([]);
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + (err.response?.data?.message || err.message));
        }
    };


    if (loading) return <p>กำลังโหลด...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">บันทึกการรับซื้อสินค้า</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
                
                {/* --- ส่วนหัว: เลือกเกษตรกร --- */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2">เกษตรกรผู้ขาย:</label>
                    {selectedFarmer ? (
                        <div className="flex items-center justify-between p-3 bg-green-100 border border-green-300 rounded">
                            <p className="font-semibold">{selectedFarmer.f_name} (ID: {selectedFarmer.f_id})</p>
                            <button type="button" onClick={() => setSelectedFarmer(null)} className="text-red-500 hover:text-red-700">เปลี่ยน</button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="ค้นหาชื่อเกษตรกร..."
                                className="p-2 pl-10 border rounded w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <ul className="absolute z-10 w-full bg-white border mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
                                    {filteredFarmers.length > 0 ? filteredFarmers.map(farmer => (
                                        <li key={farmer.f_id} onClick={() => handleSelectFarmer(farmer)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                            {farmer.f_name}
                                        </li>
                                    )) : <li className="p-2 text-gray-500">ไม่พบข้อมูล</li>}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* --- ส่วนรายการสินค้า --- */}
                <div className="border-t pt-4">
                    <h2 className="text-xl font-semibold mb-2">รายการสินค้า</h2>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <select value={item.p_id} onChange={e => handleItemChange(index, 'p_id', e.target.value)} className="col-span-5 p-2 border rounded" required>
                                    <option value="">-- เลือกสินค้า --</option>
                                    {allProducts.map(p => <option key={p.p_id} value={p.p_id}>{p.p_name}</option>)}
                                </select>
                                <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} placeholder="จำนวน (กก.)" className="col-span-2 p-2 border rounded" required />
                                <input type="number" value={item.price_per_unit} onChange={e => handleItemChange(index, 'price_per_unit', e.target.value)} placeholder="ราคา/หน่วย" className="col-span-2 p-2 border rounded" required />
                                <p className="col-span-2 text-right font-semibold">{item.total.toFixed(2)}</p>
                                <button type="button" onClick={() => handleRemoveItem(index)} className="col-span-1 flex justify-center items-center text-red-500 hover:text-red-700">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddItem} className="mt-4 flex items-center gap-2 text-blue-500 hover:text-blue-700 font-semibold">
                        <PlusCircle size={20} /> เพิ่มรายการสินค้า
                    </button>
                </div>

                {/* --- ส่วนสรุปท้ายบิล --- */}
                <div className="border-t pt-4 mt-4 text-right">
                    <h3 className="text-2xl font-bold">ยอดรวมสุทธิ: <span className="text-green-600">{grandTotal.toFixed(2)}</span> บาท</h3>
                    <button type="submit" className="mt-4 w-full md:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-lg">
                        บันทึกใบรับซื้อ
                    </button>
                </div>

            </form>
        </div>
    );
};

export default PurchaseProduct;