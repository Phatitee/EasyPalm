import React, { useState, useEffect } from "react";
import axios from "axios";

const StockLevel = () => {
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true); // เพิ่มเพื่อให้โหลดใหม่ได้ถูกต้อง
      try {
        const response = await axios.get("http://127.0.0.1:5000/stock");
        setStockLevels(response.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลสต็อกได้");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  if (loading) return <p>กำลังโหลดข้อมูลสต็อก...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-6">
        {/* --- 1. หัวข้อแบบใหม่ --- */}
        <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">รายการสต็อกสินค้า</h1>
            <p className="text-sm text-gray-500 mt-1">ตรวจสอบจำนวนสินค้าคงคลังในสต็อก</p>
        </div>
        
        {/* --- 2. การ์ดหลัก --- */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                {/* --- 3. ตารางดีไซน์ใหม่ --- */}
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คลังสินค้า</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนคงเหลือ (กก.)</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stockLevels.map((stock, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {stock.product_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {stock.warehouse_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                    {stock.quantity.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    {stock.quantity > 0 ? (
                                    <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                                        In Stock
                                    </span>
                                    ) : (
                                    <span className="bg-red-100 text-red-600 text-sm font-medium px-3 py-1 rounded-full">
                                        Out of Stock
                                    </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default StockLevel;