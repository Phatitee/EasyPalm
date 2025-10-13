import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, PlusCircle, Trash2 } from 'lucide-react';

const CreateSalesOrder = () => {
    const [allCustomers, setAllCustomers] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [stockLevels, setStockLevels] = useState({});

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [items, setItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [customersRes, productsRes, stockRes] = await Promise.all([
                axios.get('http://127.0.0.1:5000/farmers'),
                axios.get('http://127.0.0.1:5000/products'),
                axios.get('http://127.0.0.1:5000/stock')
            ]);
            setAllCustomers(customersRes.data);
            setAllProducts(productsRes.data);
            const stockMap = stockRes.data.reduce((acc, stock) => {
                acc[stock.product_id] = stock.quantity;
                return acc;
            }, {});
            setStockLevels(stockMap);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredCustomers = searchTerm
        ? allCustomers.filter(c => c.f_name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];
    
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setSearchTerm('');
    };

    const handleAddItem = () => {
        setItems([...items, { p_id: '', quantity: 1, price_per_unit: 0, total: 0 }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        const currentItem = newItems[index];
        currentItem[field] = value;

        const qty = parseFloat(currentItem.quantity) || 0;
        const price = parseFloat(currentItem.price_per_unit) || 0;
        currentItem.total = qty * price;

        setItems(newItems);
    };

    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCustomer || items.length === 0 || items.some(item => !item.p_id || item.quantity <= 0)) {
            alert('กรุณาเลือกลูกค้าและกรอกข้อมูลสินค้าให้ครบถ้วน');
            return;
        }
        
        const salesData = {
            f_id: selectedCustomer.f_id,
            items: items.map(item => ({
                p_id: item.p_id,
                quantity: parseFloat(item.quantity),
                price_per_unit: parseFloat(item.price_per_unit)
            }))
        };

        try {
            const response = await axios.post('http://127.0.0.1:5000/salesorders', salesData);
            alert(`บันทึกการขายสำเร็จ! เลขที่ใบเสร็จ: ${response.data.sale_order_number}`);
            setSelectedCustomer(null);
            setItems([]);
            fetchData(); // โหลดข้อมูลสต็อกใหม่
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <p>กำลังเตรียมหน้าขายสินค้า...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">สร้างรายการขายสินค้า</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <div>
                    <label className="block text-gray-700 font-bold mb-2">ลูกค้า:</label>
                    {selectedCustomer ? (
                        <div className="flex items-center justify-between p-3 bg-blue-100 border border-blue-300 rounded">
                            <p className="font-semibold">{selectedCustomer.f_name}</p>
                            <button type="button" onClick={() => setSelectedCustomer(null)} className="text-red-500 hover:text-red-700">เปลี่ยน</button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="text" placeholder="ค้นหาชื่อลูกค้า..." className="p-2 pl-10 border rounded w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            {searchTerm && (
                                <ul className="absolute z-10 w-full bg-white border mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
                                    {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                        <li key={c.f_id} onClick={() => handleSelectCustomer(c)} className="p-2 hover:bg-gray-100 cursor-pointer">{c.f_name}</li>
                                    )) : <li className="p-2 text-gray-500">ไม่พบข้อมูล</li>}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                <div className="border-t pt-4">
                    <h2 className="text-xl font-semibold mb-2">รายการสินค้าที่ขาย</h2>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <select value={item.p_id} onChange={e => handleItemChange(index, 'p_id', e.target.value)} className="col-span-5 p-2 border rounded" required>
                                    <option value="">-- เลือกสินค้า --</option>
                                    {allProducts.map(p => (
                                        <option key={p.p_id} value={p.p_id} disabled={!stockLevels[p.p_id] || stockLevels[p.p_id] <= 0}>
                                            {p.p_name} (คงเหลือ: {stockLevels[p.p_id] || 0} กก.)
                                        </option>
                                    ))}
                                </select>
                                <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} placeholder="จำนวน (กก.)" className="col-span-2 p-2 border rounded" required />
                                <input type="number" step="0.01" value={item.price_per_unit} onChange={e => handleItemChange(index, 'price_per_unit', e.target.value)} placeholder="ราคาขาย/หน่วย" className="col-span-2 p-2 border rounded" required />
                                <p className="col-span-2 text-right font-semibold">{item.total.toFixed(2)}</p>
                                <button type="button" onClick={() => handleRemoveItem(index)} className="col-span-1 flex justify-center items-center text-red-500 hover:text-red-700">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddItem} className="mt-4 flex items-center gap-2 text-blue-500 hover:text-blue-700 font-semibold">
                        <PlusCircle size={20} /> เพิ่มรายการ
                    </button>
                </div>

                <div className="border-t pt-4 mt-4 text-right">
                    <h3 className="text-2xl font-bold">ยอดรวมสุทธิ: <span className="text-green-600">{grandTotal.toFixed(2)}</span> บาท</h3>
                    <button type="submit" className="mt-4 w-full md:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-lg">
                        บันทึกการขายและตัดสต็อก
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateSalesOrder;