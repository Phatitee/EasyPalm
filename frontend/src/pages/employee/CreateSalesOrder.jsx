import React, { useState, useEffect } from 'react';
import axios from 'axios';
// (1) เปลี่ยนธีมสี: ไอคอนยังใช้ Factory แต่เปลี่ยนเป็นสีเขียว
import { Search, PlusCircle, Trash2, CheckCircle, XCircle, Factory, X, Info } from 'lucide-react';
import ResultModal from '../../components/modals/ResultModal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import EntitySelector from '../../components/common/EntitySelector';
import OrderItemList from '../../components/common/OrderItemList';

const CreateSalesOrder = () => {
    // --- State and Logic (เหมือนเดิม) ---
    const [allIndustries, setAllIndustries] = useState([]);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [stockLevels, setStockLevels] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalInfo, setModalInfo] = useState({
        show: false,
        type: 'success',
        message: ''
    });

    // --- Logic (เหมือนเดิม) ---
    const fetchData = async () => {
        try {
            const [industriesRes, productsRes, stockRes] = await Promise.all([
                axios.get('http://127.0.0.1:5000/food-industries'),
                axios.get('http://127.0.0.1:5000/products'),
                axios.get('http://127.0.0.1:5000/stock')
            ]);
            setAllIndustries(industriesRes.data);
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

    const filteredIndustries = searchTerm
        ? allIndustries.filter(c => c.F_name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const handleSelectIndustry = (industry) => {
        setSelectedIndustry(industry);
        setSearchTerm('');
    };

    const handleAddItem = () => {
        setItems([...items, { p_id: '', quantity: 1, price_per_unit: 0, total: 0 }]);
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
            currentItem.price_per_unit = product ? product.default_sale_price || 0 : 0;
        } else {
            currentItem[field] = value;
        }

        const qty = parseFloat(currentItem.quantity) || 0;
        const price = parseFloat(currentItem.price_per_unit) || 0;
        currentItem.total = qty * price;

        setItems(newItems);
    };

    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

    const isSubmitDisabled = !selectedIndustry || items.length === 0;

    const handleCloseModal = () => {
        setModalInfo({ show: false, type: 'success', message: '' });
    };

    // --- (★ ★ ★ แก้ไขส่วนนี้ ★ ★ ★) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitDisabled) {
            setModalInfo({
                show: true,
                type: 'error',
                message: 'กรุณาเลือกลูกค้าและเพิ่มรายการสินค้าอย่างน้อย 1 รายการ'
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

        const salesData = {
            f_id: selectedIndustry.F_id,
            items: items.map(item => ({
                p_id: item.p_id,
                quantity: parseFloat(item.quantity),
                price_per_unit: parseFloat(item.price_per_unit)
            }))
        };

        try {
            const response = await axios.post('http://127.0.0.1:5000/salesorders', salesData);
            setModalInfo({
                show: true,
                type: 'success',
                message: `บันทึกการขายสำเร็จ! เลขที่ใบเสร็จ: ${response.data.sale_order_number}`
            });
            setSelectedIndustry(null);
            setItems([]);
            fetchData();
        } catch (err) {
            setModalInfo({
                show: true,
                type: 'error',
                message: 'เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message)
            });
        }
    };
    // --- (สิ้นสุดการแก้ไข) ---

    if (loading) return <p className="text-center p-8">กำลังเตรียมหน้าขายสินค้า...</p>;
    if (error) return <p className="text-center p-8 text-red-500">{error}</p>;

    return (
        // (1) เปลี่ยน padding ให้เหมือนกัน
        <div className="max-w-5xl mx-auto p-4 md:p-8">

            <ResultModal
                show={modalInfo.show}
                type={modalInfo.type}
                message={modalInfo.message}
                onClose={handleCloseModal} // ใช้ handleCloseModal ที่มีอยู่แล้ว
                successColor="blue" // กำหนดสีฟ้าสำหรับ Success
            />

            {/* Header (2) - ปรับ Style ให้เหมือนกัน */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#0A2540' }}>
                    สร้างรายการขายสินค้า
                </h1>
                <p className="mt-2 text-gray-500 text-lg">
                    บันทึกข้อมูลการขายสินค้าให้กับโรงงานอุตสาหกรรม
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* --- (★ ใช้ EntitySelector) --- */}
                <EntitySelector
                    entityType="industry" // เปลี่ยน type
                    entities={allIndustries} // ส่ง list โรงงาน
                    selectedEntity={selectedIndustry} // state โรงงานที่เลือก
                    onSelect={handleSelectIndustry} // Handler เดิม
                    onClear={() => setSelectedIndustry(null)}
                    loading={loading} // ใช้ loading รวม
                />

                {/* --- (★ ใช้ OrderItemList) --- */}
                <OrderItemList
                    items={items}
                    products={allProducts || []}
                    stockLevels={stockLevels} // << ส่งข้อมูลสต็อกไปด้วย
                    onItemChange={handleItemChange}
                    onRemoveItem={handleRemoveItem}
                    onAddItem={handleAddItem}
                    onClearItems={handleClearItems}
                    isSalesOrder={true} // << ระบุว่าเป็นหน้า Sales
                />

                {/* --- (5) Card 3: Summary and Action (เปลี่ยน Layout + ธีมสีเขียว) --- */}
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <Info className="w-10 h-10 text-blue-500" /> {/* สีเขียว */}
                        </div>
                        {/* Total */}
                        <div>
                            <span className="text-gray-600 text-sm">ยอดรวมสุทธิ</span>
                            <div>
                                <span className="text-blue-600 font-bold text-3xl">{grandTotal.toFixed(2)}</span> {/* สีเขียว */}
                                <span className="text-gray-500 ml-1">บาท</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px h-12 bg-gray-200 mx-4"></div>

                        {/* Details */}
                        <div className="text-gray-700 text-sm space-y-1 text-center md:text-left">
                            <p>จำนวนรายการ: <span className="font-semibold">{items.length}</span></p>
                            {selectedIndustry ? (
                                <p>ลูกค้า: <span className="font-semibold">{selectedIndustry.F_name}</span></p>
                            ) : (
                                <p className="text-gray-500">ยังไม่ได้เลือกลูกค้า</p>
                            )}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="w-full md:w-auto text-center md:text-right flex-shrink-0">
                        <p className="text-xs text-gray-500 mb-2">เมื่อพร้อม ให้กดยืนยันเพื่อบันทึกและตัดสต็อก</p>
                        <button
                            type="submit"
                            // (1) เปลี่ยนสี และเพิ่ม class/logic สำหรับ disabled
                            className={`w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-base transition-colors flex items-center justify-center gap-2
                                ${isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : 'transform transition-transform hover:scale-105'}
                            `}
                            disabled={isSubmitDisabled}
                        >
                            <CheckCircle size={20} />
                            บันทึกการขายและตัดสต็อก
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default CreateSalesOrder;