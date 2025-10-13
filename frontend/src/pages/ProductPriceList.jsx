// frontend/src/pages/ProductPriceList.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Edit, Save, XCircle } from 'lucide-react';

// รับ props 4 ตัวจาก App.js
const ProductPriceList = ({ user, products, onPriceUpdate, error }) => {
    const [editingId, setEditingId] = useState(null);
    const [newPrice, setNewPrice] = useState('');

    const handleEditClick = (product) => {
        setEditingId(product.p_id);
        setNewPrice(product.price_per_unit);
    };

    const handleCancelClick = () => setEditingId(null);

    const handleSaveClick = async (productId) => {
        try {
            await axios.put(`http://127.0.0.1:5000/products/${productId}`, { price_per_unit: newPrice });
            alert('อัปเดตราคาสำเร็จ!');
            setEditingId(null);
            onPriceUpdate(); // <--- ตะโกนบอกแม่ (App.js) ให้ไปดึงข้อมูลใหม่!
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการอัปเดตราคา');
        }
    };

    const canEdit = user && user.e_role === 'Admin';

    if (error) return <p className="text-red-500">{error}</p>;
    if (!products) return <p>กำลังโหลด...</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">จัดการราคารับซื้อสินค้า</h1>
            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full leading-normal">
                    {/* ... ส่วน aารางเหมือนเดิมเป๊ะ ... */}
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อสินค้า</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">ราคา/หน่วย (บาท)</th>
                            {canEdit && <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center">จัดการ</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.p_id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{product.p_name}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                                    {editingId === product.p_id ? (
                                        <input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="text-right p-1 border rounded w-24"/>
                                    ) : (
                                        <span>{product.price_per_unit.toFixed(2)}</span>
                                    )}
                                </td>
                                {canEdit && (
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        {editingId === product.p_id ? (
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleSaveClick(product.p_id)} className="text-green-600 hover:text-green-900"><Save size={20}/></button>
                                                <button onClick={handleCancelClick} className="text-gray-600 hover:text-gray-900"><XCircle size={20}/></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-900"><Edit size={20}/></button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductPriceList;