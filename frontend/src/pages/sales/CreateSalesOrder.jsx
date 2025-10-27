// frontend/src/pages/employee/CreateSalesOrder.jsx
import React, { useState, useEffect } from 'react';
import EntitySelector from '../../components/common/EntitySelector';
import OrderItemList from '../../components/common/OrderItemList';
import ResultModal from '../../components/modals/ResultModal';

const CreateSalesOrder = () => {
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    
    // --- (แก้ไข) State สำหรับคลังสินค้า ---
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(''); 
    
    const [modalState, setModalState] = useState({ isOpen: false, success: false, message: '' });

    // --- (แก้ไข) ดึงข้อมูล Products และ Warehouses พร้อมกัน ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products
                const productResponse = await fetch('http://localhost:5000/products');
                const productData = await productResponse.json();
                setProducts(productData);

                // Fetch Warehouses
                const warehouseResponse = await fetch('http://localhost:5000/warehouses');
                const warehouseData = await warehouseResponse.json();
                setWarehouses(warehouseData);
                
                // ตั้งค่า default warehouse เป็นอันแรกที่เจอ
                if (warehouseData.length > 0) {
                    setSelectedWarehouse(warehouseData[0].warehouse_id);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedIndustry || items.length === 0 || !selectedWarehouse) {
            setModalState({ isOpen: true, success: false, message: 'กรุณากรอกข้อมูลให้ครบ: ลูกค้า, คลังสินค้า, และรายการสินค้า' });
            return;
        }

        const orderData = {
            f_id: selectedIndustry.value,
            items: items.map(item => ({
                p_id: item.p_id,
                quantity: parseFloat(item.quantity),
                price_per_unit: parseFloat(item.price_per_unit)
            })),
            warehouse_id: selectedWarehouse 
        };

        try {
            const response = await fetch('http://localhost:5000/salesorders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'เกิดข้อผิดพลาดในการสร้างใบสั่งขาย');
            }
            
            setModalState({ isOpen: true, success: true, message: `สร้างใบสั่งขาย ${result.sale_order_number} สำเร็จ!` });
            // Reset form
            setSelectedIndustry(null);
            setItems([]);
        } catch (error) {
            setModalState({ isOpen: true, success: false, message: error.message });
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">สร้างใบสั่งขาย</h1>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">เลือกโรงงาน (ลูกค้า)</label>
                        <EntitySelector
                            fetchUrl="http://localhost:5000/food-industries"
                            value={selectedIndustry}
                            onChange={setSelectedIndustry}
                            getOptionLabel={(opt) => opt.F_name}
                            getOptionValue={(opt) => opt.F_id}
                            placeholder="ค้นหาชื่อโรงงาน..."
                        />
                    </div>
                    {/* --- (แก้ไข) UI สำหรับเลือกคลังสินค้าแบบ Dynamic --- */}
                    <div>
                        <label htmlFor="warehouse" className="block text-gray-700 font-medium mb-2">
                            ขายจากคลังสินค้า
                        </label>
                        <select
                            id="warehouse"
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>-- กรุณาเลือกคลังสินค้า --</option>
                            {warehouses.map(w => (
                                <option key={w.warehouse_id} value={w.warehouse_id}>
                                    {w.warehouse_name} ({w.warehouse_id})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <OrderItemList items={items} setItems={setItems} products={products} />

                <div className="flex justify-end mt-8">
                    <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
                        สร้างใบสั่งขาย
                    </button>
                </div>
            </form>
            <ResultModal {...modalState} onClose={() => setModalState({ ...modalState, isOpen: false })} />
        </div>
    );
};

export default CreateSalesOrder;