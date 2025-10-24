// frontend/src/pages/PurchaseProduct.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// อัปเดต imports: เพิ่ม User, X, Info
import { Search, PlusCircle, Trash2, UserCheck, CheckCircle, XCircle, User, X, Info } from 'lucide-react';
import ResultModal from '../../components/modals/ResultModal';
import ConfirmModal from '../../components/modals/ConfirmModal';

const PurchaseProduct = () => {
    // --- State และ Logic (เหมือนเดิม) ---
    const [allFarmers, setAllFarmers] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalInfo, setModalInfo] = useState({
        show: false,
        type: 'success',
        message: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // *** หมายเหตุ: ตรวจสอบให้แน่ใจว่า API /farmers คืนค่า f_address มาด้วย ***
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

    // --- Logic การ Filter และจัดการ Item (เหมือนเดิม) ---
    const filteredFarmers = searchTerm
        ? allFarmers.filter(farmer => farmer.f_name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const handleSelectFarmer = (farmer) => {
        setSelectedFarmer(farmer);
        setSearchTerm('');
    };

    const handleAddItem = () => {
        setItems([...items, { p_id: '', p_name: '', quantity: 1, price_per_unit: 0, total: 0 }]);
    };

    const handleClearItems = () => {
        setItems([]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        const currentItem = newItems[index];

        if (field === 'p_id') {
            const product = allProducts.find(p => p.p_id === parseInt(value, 10));
            currentItem.p_id = value;
            currentItem.p_name = product ? product.p_name : '';
            currentItem.price_per_unit = product ? product.price_per_unit : 0;
        } else {
            currentItem[field] = value;
        }

        const qty = parseFloat(currentItem.quantity) || 0;
        const price = parseFloat(currentItem.price_per_unit) || 0;
        currentItem.total = qty * price;

        setItems(newItems);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

    const handleCloseModal = () => {
        setModalInfo({ show: false, type: 'success', message: '' });
    };

    // --- (★ ★ ★ แก้ไขส่วนนี้ ★ ★ ★) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFarmer || items.length === 0) {
            setModalInfo({
                show: true,
                type: 'error',
                message: 'กรุณาเลือกเกษตรกรและเพิ่มรายการสินค้าอย่างน้อย 1 รายการ'
            });
            return;
        }

        // --- (เพิ่มเงื่อนไขตรวจสอบ) ---
        for (const item of items) {
            const quantity = parseFloat(item.quantity);
            const price = parseFloat(item.price_per_unit);

            if (!item.p_id) {
                setModalInfo({ show: true, type: 'error', message: 'มีบางรายการที่ยังไม่ได้เลือกสินค้า' });
                return;
            }
            if (isNaN(quantity) || quantity <= 0) {
                setModalInfo({ show: true, type: 'error', message: `กรุณากรอก "จำนวน" สินค้า (ต้องมากกว่า 0)` });
                return;
            }
            if (isNaN(price) || price <= 0) {
                setModalInfo({ show: true, type: 'error', message: `กรุณากรอก "ราคา/หน่วย" (ต้องมากกว่า 0)` });
                return;
            }
        }
        // --- (สิ้นสุดการตรวจสอบ) ---

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
            setModalInfo({
                show: true,
                type: 'success',
                message: `บันทึกสำเร็จ! เลขที่ใบเสร็จ: ${response.data.purchase_order_number}`
            });
            setSelectedFarmer(null);
            setItems([]);
        } catch (err) {
            setModalInfo({
                show: true,
                type: 'error',
                message: 'เกิดข้อผิดพลาดในการบันทึก: ' + (err.response?.data?.message || err.message)
            });
        }
    };
    // --- (สิ้นสุดการแก้ไข) ---

    if (loading) return <p className="text-center p-8">กำลังโหลด...</p>;
    if (error) return <p className="text-center p-8 text-red-500">{error}</p>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            {/* --- ส่วน JSX ของ MODAL (ไม่มีการเปลี่ยนแปลง) --- */}
            <ResultModal
                show={modalInfo.show}
                type={modalInfo.type}
                message={modalInfo.message}
                onClose={handleCloseModal} // ใช้ handleCloseModal ที่มีอยู่แล้ว
                successColor="green"
            />

            {/* Header - แก้ไขให้ตรงตามรูปที่ 2 */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#0A2540' }}>
                    บันทึกการรับซื้อสินค้า
                </h1>
                <p className="mt-2 text-gray-500 text-lg">
                    บันทึกข้อมูลการรับซื้อผลผลิตจากเกษตรกร
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Card 1: Farmer Selection - แก้ไข (ลบส่วนขวาบน) */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 bg-green-100 text-green-600 p-2 rounded-lg">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-700">เกษตรกรผู้ขาย</h2>
                                <p className="text-sm text-gray-500">ค้นหาและเลือกเกษตรกรที่จะทำรายการ</p>
                            </div>
                        </div>
                        {/* --- ส่วนที่ถูกลบ (ตามกากบาท) --- */}
                    </div>

                    {/* Card Content: Show search or selected box */}
                    {selectedFarmer ? (
                        // กล่องสีเขียวเมื่อเลือกแล้ว - แก้ไขตามวงกลม
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-700">{selectedFarmer.f_id}</p>
                                <p className="font-semibold text-lg text-gray-900">{selectedFarmer.f_name}</p>
                                <p className="text-sm text-gray-500">{selectedFarmer.f_address || 'ไม่มีข้อมูลที่อยู่'}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedFarmer(null)} className="font-semibold text-red-500 hover:text-red-700 transition-colors">
                                เปลี่ยน
                            </button>
                        </div>
                    ) : (
                        // ช่องค้นหา (เหมือนเดิม)
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อเกษตรกร..."
                                className="w-full p-3 pl-10 text-base border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {filteredFarmers.length > 0 ? filteredFarmers.map(farmer => (
                                        <li key={farmer.f_id} onClick={() => handleSelectFarmer(farmer)} className="p-3 hover:bg-gray-100 cursor-pointer">
                                            {farmer.f_name}
                                        </li>
                                    )) : <li className="p-3 text-gray-500">ไม่พบข้อมูล</li>}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Card 2: Items List (ไม่มีการเปลี่ยนแปลง) */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-5 gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700">รายการสินค้ารับซื้อ</h2>
                            <p className="text-sm text-gray-500 mt-1">เพิ่มรายการสินค้าและระบุจำนวน / ราคาต่อหน่วย</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={handleAddItem} className="flex items-center justify-center gap-2 bg-green-100 text-green-700 font-medium py-2 px-4 rounded-lg hover:bg-green-200 transition-colors">
                                <PlusCircle size={20} /> เพิ่มรายการ
                            </button>
                            <button type="button" onClick={handleClearItems} className="flex items-center justify-center gap-2 bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg hover:bg-red-200 transition-colors">
                                <X size={20} /> ล้างรายการ
                            </button>
                        </div>
                    </div>

                    {items.length > 0 ? (
                        <div className="space-y-2">
                            <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-regular text-gray-500 px-2">
                                <div className="col-span-5">ชื่อสินค้า</div>
                                <div className="col-span-2">จำนวน (กก.)</div>
                                <div className="col-span-2">ราคา/หน่วย</div>
                                <div className="col-span-2 text-right">ราคารวม</div>
                                <div className="col-span-1"></div>
                            </div>
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-center py-2 border-b border-gray-100 last:border-b-0">
                                    <select value={item.p_id} onChange={e => handleItemChange(index, 'p_id', e.target.value)} className="col-span-12 md:col-span-5 p-2 border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" required>
                                        <option value="">-- เลือกสินค้า --</option>
                                        {allProducts.map(p => <option key={p.p_id} value={p.p_id}>{p.p_name}</option>)}
                                    </select>
                                    <input type="number" step="any" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} placeholder="จำนวน" className="col-span-6 md:col-span-2 p-2 border-gray-300 rounded-md" required />
                                    <input type="number" step="any" value={item.price_per_unit} onChange={e => handleItemChange(index, 'price_per_unit', e.target.value)} placeholder="ราคา/หน่วย" className="col-span-6 md:col-span-2 p-2 border-gray-300 rounded-md" required />
                                    <p className="col-span-10 md:col-span-2 text-right font-medium text-gray-800 pr-2">{(item.total || 0).toFixed(2)}</p>
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="col-span-2 md:col-span-1 flex justify-center items-center text-red-500 hover:text-red-700">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-10">ยังไม่มีรายการสินค้า</p>
                    )}
                </div>

                {/* Card 3: Summary and Action (ไม่มีการเปลี่ยนแปลง) */}
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                        <div className="flex-shrink-0">
                            <Info className="w-10 h-10 text-green-500" />
                        </div>
                        <div>
                            <span className="text-gray-600 text-sm">ยอดรวมสุทธิ</span>
                            <div>
                                <span className="text-green-600 font-bold text-3xl">{grandTotal.toFixed(2)}</span>
                                <span className="text-gray-500 ml-1">บาท</span>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-12 bg-gray-200 mx-4"></div>
                        <div className="text-gray-700 text-sm space-y-1 text-center md:text-left">
                            <p>จำนวนรายการ: <span className="font-semibold">{items.length}</span></p>
                            <p>เกษตรกร: <span className="font-semibold">{selectedFarmer ? selectedFarmer.f_name : '-'}</span></p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto text-center md:text-right flex-shrink-0">
                        <p className="text-xs text-gray-500 mb-2">เมื่อพร้อม ให้กดยืนยันบันทึกใบรับซื้อ</p>
                        <button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-base transition-colors">
                            <div className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>ยืนยันใบรับซื้อ</span>
                            </div>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PurchaseProduct;