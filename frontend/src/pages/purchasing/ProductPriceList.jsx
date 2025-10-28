import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Save, XCircle, DollarSign, Loader } from "lucide-react";

const ProductPriceList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [newPrice, setNewPrice] = useState("");

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:5000/products");
            setProducts(response.data);
            setError(null);
        } catch (err) {
            setError("ไม่สามารถโหลดข้อมูลราคาสินค้าได้");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEditClick = (product) => {
        setEditingId(product.p_id);
        setNewPrice(product.price_per_unit);
    };

    const handleCancelClick = () => setEditingId(null);

    const handleSaveClick = async (productId) => {
        if (newPrice === "" || parseFloat(newPrice) < 0) {
            alert("กรุณากรอกราคาที่ถูกต้อง");
            return;
        }
        try {
            await axios.put(`http://127.0.0.1:5000/products/${productId}`, {
                price_per_unit: parseFloat(newPrice),
            });
            alert("อัปเดตราคาสำเร็จ!");
            setEditingId(null);
            fetchProducts(); // Refresh data
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการอัปเดตราคา");
        }
    };

    // สมมติว่า user role มาจากการเรียกใช้ useAuth()
    // const { user } = useAuth();
    // const canEdit = user && user.e_role === "Admin";
    const canEdit = true; // Hardcoded for demonstration

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">จัดการราคารับซื้อ</h1>
                <p className="text-lg text-gray-500 mt-2">อัปเดตราคารับซื้อผลผลิตจากเกษตรกร</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="text-green-500" />
                        <span>รายการราคาสินค้า</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center p-16">
                        <Loader className="animate-spin text-green-500" size={48} />
                    </div>
                ) : error ? (
                    <p className="text-center py-10 text-red-500">{error}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสสินค้า</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสินค้า</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา/หน่วย (บาท)</th>
                                    {canEdit && <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.p_id} className={`transition-colors duration-200 ${editingId === product.p_id ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{product.p_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.p_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            {editingId === product.p_id ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newPrice}
                                                    onChange={(e) => setNewPrice(e.target.value)}
                                                    className="block w-28 ml-auto p-2 text-right text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="font-semibold text-lg text-gray-800">{product.price_per_unit.toFixed(2)}</span>
                                            )}
                                        </td>
                                        {canEdit && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                {editingId === product.p_id ? (
                                                    <div className="flex justify-center gap-4">
                                                        <button onClick={() => handleSaveClick(product.p_id)} className="text-green-600 hover:text-green-800 transition-transform transform hover:scale-110" title="บันทึก">
                                                            <Save size={20} />
                                                        </button>
                                                        <button onClick={handleCancelClick} className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-110" title="ยกเลิก">
                                                            <XCircle size={20} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => handleEditClick(product)} className="text-yellow-600 hover:text-yellow-800 transition-transform transform hover:scale-110" title="แก้ไข">
                                                        <Edit size={20} />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {products.length === 0 && !loading && !error && (
                    <p className="text-center py-10 text-gray-500">-- ไม่พบข้อมูลสินค้า --</p>
                )}
            </div>
        </div>
    );
};

export default ProductPriceList;