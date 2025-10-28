// frontend/src/pages/shared/StockLevel.jsx
import React, { useState, useEffect } from 'react';
import { Archive, Loader } from 'lucide-react';

const StockLevel = () => {
    const [stockByWarehouse, setStockByWarehouse] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStockLevels = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:5000/stock');
                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลสต็อกได้');
                }
                const data = await response.json();

                // จัดกลุ่มข้อมูลตามชื่อคลังสินค้า
                const groupedStock = data.reduce((acc, current) => {
                    const groupName = `${current.warehouse_name} (${current.warehouse_id})`;
                    if (!acc[groupName]) {
                        acc[groupName] = [];
                    }
                    acc[groupName].push(current);
                    return acc;
                }, {});

                setStockByWarehouse(groupedStock);

            } catch (error) {
                console.error('Error fetching stock levels:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStockLevels();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">สต็อกสินค้าคงคลัง</h1>
                <p className="text-lg text-gray-500 mt-2">ภาพรวมจำนวนสินค้าในแต่ละคลัง</p>
            </div>

            {loading ? (
                 <div className="flex justify-center items-center p-16">
                    <Loader className="animate-spin text-blue-500" size={48} />
                </div>
            ) : error ? (
                <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg">
                    <p>{error}</p>
                </div>
            ) : Object.keys(stockByWarehouse).length === 0 ? (
                <div className="text-center text-gray-500 bg-gray-50 p-10 rounded-lg">
                    <Archive size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold">ไม่พบข้อมูลสต็อก</h3>
                    <p>ยังไม่มีสินค้าในคลังขณะนี้</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(stockByWarehouse).map(([warehouseName, stockItems]) => (
                        <div key={warehouseName} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <h2 className="text-xl font-semibold p-5 bg-gray-50 border-b border-gray-200">
                                🏭 {warehouseName}
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-white">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสสินค้า</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสินค้า</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนคงเหลือ (กก.)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {stockItems.map(item => (
                                            <tr key={`${item.warehouse_id}-${item.product_id}`} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">{item.product_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.product_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-lg text-blue-600">
                                                    {item.quantity.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StockLevel;