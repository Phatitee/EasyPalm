import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Save, XCircle, DollarSign, Loader, ServerCrash, CheckCircle, AlertTriangle } from "lucide-react";

// --- Helper Modal: Result Dialog (สำหรับแจ้งผลลัพธ์) ---
const ResultDialog = ({ isOpen, onClose, type, message }) => {
    if (!isOpen) return null;
    const isSuccess = type === 'success';
    return (
        // ★★★ Dark Mode FIX: Overlay and Modal Container ★★★
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm text-center transform transition-all animate-fade-in-up">
                 <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isSuccess ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                </div>
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{isSuccess ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="mt-6">
                    <button onClick={onClose} type="button" className={`w-full px-4 py-2 text-white rounded-lg font-semibold ${isSuccess ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>ตกลง</button>
                </div>
            </div>
        </div>
    );
}

const ProductPriceList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [newPrice, setNewPrice] = useState("");
    // ★★★ ADDED: Modal State ★★★
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' }); 

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
            // ★★★ FIX: Replace alert() with Modal ★★★
            setResultDialog({ isOpen: true, type: 'error', message: "กรุณากรอกราคาที่ถูกต้อง" });
            return;
        }
        try {
            await axios.put(`http://127.0.0.1:5000/products/${productId}`, {
                price_per_unit: parseFloat(newPrice),
            });
            // ★★★ FIX: Replace alert() with Modal ★★★
            setResultDialog({ isOpen: true, type: 'success', message: "อัปเดตราคาสำเร็จ!" });
            setEditingId(null);
            fetchProducts(); // Refresh data
        } catch (err) {
            // ★★★ FIX: Replace alert() with Modal ★★★
            setResultDialog({ isOpen: true, type: 'error', message: "เกิดข้อผิดพลาดในการอัปเดตราคา" });
        }
    };

    // สมมติว่า user role มาจากการเรียกใช้ useAuth()
    // const { user } = useAuth();
    // const canEdit = user && user.e_role === "Admin";
    const canEdit = true; // Hardcoded for demonstration

    return (
        // ★★★ Dark Mode FIX: Main Page Background ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            {/* ★★★ ADDED: Result Dialog Component ★★★ */}
            <ResultDialog isOpen={resultDialog.isOpen} onClose={() => setResultDialog({ ...resultDialog, isOpen: false })} type={resultDialog.type} message={resultDialog.message} />

            <div className="text-center mb-8">
                {/* ★★★ Dark Mode FIX: Header Text Colors ★★★ */}
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">จัดการราคารับซื้อ</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">อัปเดตราคารับซื้อผลผลิตจากเกษตรกร</p>
            </div>

            {/* ★★★ Dark Mode FIX: Card Container Background and Shadow ★★★ */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
                {/* ★★★ Dark Mode FIX: Section Header Border and Text Colors ★★★ */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <DollarSign className="text-green-500" />
                        <span>รายการราคาสินค้า</span>
                    </h2>
                </div>

                {loading ? (
                    // ★★★ Dark Mode FIX: Loading State ★★★
                    <div className="flex justify-center items-center p-16 text-gray-800 dark:text-gray-200">
                        <Loader className="animate-spin text-green-500" size={48} />
                    </div>
                ) : error ? (
                    // ★★★ Dark Mode FIX: Error State ★★★
                    <div className="text-center py-10 text-red-500 dark:text-red-400">
                        <ServerCrash className="mx-auto" size={48} />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* ★★★ Dark Mode FIX: Table Header Background and Text Colors ★★★ */}
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">รหัสสินค้า</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ชื่อสินค้า</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ราคา/หน่วย (บาท)</th>
                                    {canEdit && <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">จัดการ</th>}
                                </tr>
                            </thead>
                            {/* ★★★ Dark Mode FIX: Table Body Background and Divider ★★★ */}
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {products.map((product) => (
                                    <tr key={product.p_id} className={`transition-colors duration-200 ${editingId === product.p_id ? 'bg-green-100 dark:bg-gray-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                        {/* ★★★ Dark Mode FIX: Cell Text Colors ★★★ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-300">{product.p_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{product.p_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            {editingId === product.p_id ? (
                                                // ★★★ Dark Mode FIX: Input Field Styling ★★★
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={newPrice}
                                                    onChange={(e) => setNewPrice(e.target.value)}
                                                    className="block w-28 ml-auto p-2 text-right text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500
                                                               dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-green-400 dark:focus:border-green-400"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="font-semibold text-lg text-gray-800 dark:text-green-400">{product.price_per_unit.toFixed(2)}</span>
                                            )}
                                        </td>
                                        {canEdit && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                {editingId === product.p_id ? (
                                                    <div className="flex justify-center gap-4">
                                                        <button onClick={() => handleSaveClick(product.p_id)} className="text-green-600 hover:text-green-800 transition-transform transform hover:scale-110 dark:text-green-400 dark:hover:text-green-200" title="บันทึก">
                                                            <Save size={20} />
                                                        </button>
                                                        <button onClick={handleCancelClick} className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-110 dark:text-gray-400 dark:hover:text-gray-200" title="ยกเลิก">
                                                            <XCircle size={20} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => handleEditClick(product)} className="text-yellow-600 hover:text-yellow-800 transition-transform transform hover:scale-110 dark:text-yellow-400 dark:hover:text-yellow-200" title="แก้ไข">
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
                    // ★★★ Dark Mode FIX: Empty State Text Color ★★★
                    <p className="text-center py-10 text-gray-500 dark:text-gray-400">-- ไม่พบข้อมูลสินค้า --</p>
                )}
            </div>
        </div>
    );
};

export default ProductPriceList;