// frontend/src/pages/employee/StockLevel.jsx
import React, { useState, useEffect } from 'react';

const StockLevel = () => {
    const [stockByWarehouse, setStockByWarehouse] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStockLevels = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5000/stock');
                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลสต็อกได้');
                }
                const data = await response.json();

                // --- (หัวใจของการแก้ไข) จัดกลุ่มข้อมูลตาม Warehouse ---
                const groupedStock = data.reduce((acc, current) => {
                    const { warehouse_name, warehouse_id } = current;
                    const groupName = `${warehouse_name} (${warehouse_id})`;

                    // ถ้ายังไม่มีกลุ่มของ warehouse นี้ ให้สร้าง array ใหม่
                    if (!acc[groupName]) {
                        acc[groupName] = [];
                    }

                    // เพิ่มรายการสินค้าเข้าไปในกลุ่มของ warehouse นั้นๆ
                    acc[groupName].push(current);
                    return acc;
                }, {});

                setStockByWarehouse(groupedStock);

            } catch (error) {
                console.error('Error fetching stock levels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStockLevels();
    }, []);

    if (loading) {
        return <div className="p-6 text-center">กำลังโหลดข้อมูลสต็อก...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">ภาพรวมสต็อกสินค้าคงคลัง</h1>
            
            {Object.keys(stockByWarehouse).length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
                    <p>ไม่พบข้อมูลสต็อกในระบบ</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* วนลูปแสดงผลข้อมูลที่จัดกลุ่มแล้ว */}
                    {Object.entries(stockByWarehouse).map(([warehouseName, stockItems]) => (
                        <div key={warehouseName} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <h2 className="text-xl font-semibold p-4 bg-gray-100 border-b">
                                🏭 {warehouseName}
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสสินค้า</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อสินค้า</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จำนวนคงเหลือ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {stockItems.map(item => (
                                            <tr key={`${item.warehouse_id}-${item.product_id}`}>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">{item.product_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.product_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-lg text-blue-600">
                                                    {item.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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