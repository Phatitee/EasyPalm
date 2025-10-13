// frontend/src/pages/StockLevel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockLevel = () => {
    const [stockLevels, setStockLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/stock');
                setStockLevels(response.data);
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลสต็อกได้');
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, []);

    if (loading) return <p>กำลังโหลดข้อมูลสต็อก...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">ยอดสินค้าคงคลัง (แยกตามรายการ)</h1>
            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">สินค้า</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">คลังสินค้า</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">จำนวนคงเหลือ (กก.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockLevels.map((stock, index) => (
                            <tr key={index}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{stock.product_name}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{stock.warehouse_name}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right font-bold">{stock.quantity.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockLevel;