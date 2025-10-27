import React, { useState } from "react";
import axios from "axios";
import { Edit, Save, XCircle } from "lucide-react";

const ProductPriceList = ({ user, products, onPriceUpdate, error }) => {
  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  const handleEditClick = (product) => {
    setEditingId(product.p_id);
    setNewPrice(product.price_per_unit);
  };

  const handleCancelClick = () => setEditingId(null);

  const handleSaveClick = async (productId) => {
    try {
      await axios.put(`http://127.0.0.1:5000/products/${productId}`, {
        price_per_unit: newPrice,
      });
      alert("อัปเดตราคาสำเร็จ!");
      setEditingId(null);
      onPriceUpdate();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปเดตราคา");
    }
  };

  const canEdit = user && user.e_role === "Admin";

  if (error) return <p className="text-red-500">{error}</p>;
  if (!products) return <p>กำลังโหลด...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
        {/* --- 1. หัวข้อแบบใหม่ --- */}
        <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">จัดการราคารับซื้อสินค้า</h1>
            <p className="text-sm text-gray-500 mt-1">อัปเดตราคาซื้อขายสินค้าจากเกษตรกร</p>
        </div>
        
        {/* --- 2. การ์ดหลัก --- */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                {/* --- 3. ตารางดีไซน์ใหม่ --- */}
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสินค้า</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา/หน่วย (บาท)</th>
                            {canEdit && <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.p_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {product.p_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                    {editingId === product.p_id ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        // --- 4. ปรับสไตล์ Input ---
                                        className="block w-24 p-2 text-sm text-right text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    ) : (
                                    <span>{product.price_per_unit.toFixed(2)}</span>
                                    )}
                                </td>
                                {canEdit && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        {editingId === product.p_id ? (
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => handleSaveClick(product.p_id)}
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    <Save size={18} />
                                                </button>
                                                <button
                                                    onClick={handleCancelClick}
                                                    className="text-gray-600 hover:text-gray-800"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEditClick(product)}
                                                // --- 5. เปลี่ยนสีปุ่ม Edit ให้เหมือนหน้าอื่น ---
                                                className="text-yellow-600 hover:text-yellow-900 transition duration-150 ease-in-out"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default ProductPriceList;