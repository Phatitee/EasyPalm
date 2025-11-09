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

const MAX_ALLOWED_PRICE = 9999999.99;

const ProductPriceList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [newPrice, setNewPrice] = useState("");
    // ★★★ ADDED: Modal State ★★★
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' }); 

    const handlePriceChange = (e) => {
        const value = e.target.value;

        // 1. อนุญาตให้เป็นค่าว่าง (ถ้าผู้ใช้ลบหมด)
        if (value === "") {
            setNewPrice("");
            return;
        }

        // 2. ใช้ Regular Expression ตรวจสอบ
        //    - อนุญาตเฉพาะตัวเลข
        //    - อนุญาตให้มีจุดทศนิยม 1 จุด
        //    - อนุญาตให้มีตัวเลขหลังจุดทศนิยมไม่เกิน 2 ตัว
        const regex = /^\d*(\.\d{0,2})?$/;

        if (regex.test(value)) {
            // 3. ถ้า-v' regex, ตรวจสอบค่าสูงสุด (Overflow)
            const numericValue = parseFloat(value);

            if (numericValue > MAX_ALLOWED_PRICE) {
                // ถ้าค่าเกิน max, ไม่ต้องอัปเดต state (ทำให้พิมพ์ต่อไม่ได้)
                // หรือจะกำหนดเป็นค่า max ไปเลยก็ได้
                // setNewPrice(String(MAX_ALLOWED_PRICE));
                return;
            }

            // 4. ถ้าผ่านทุกเงื่อนไข, อัปเดต state
            setNewPrice(value);
        }
        // ถ้าไม่ตรง regex (เช่น 1.234 หรือ 'abc')
        // state จะไม่อัปเดต ทำให้ค่าในช่อง input ไม่เปลี่ยนแปลง
    };


    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/products");
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
        // ★★★ แก้ไข: เปลี่ยนจาก < 0 เป็น <= 0 และปรับปรุงข้อความ
        const priceToSave = parseFloat(newPrice);

        if (newPrice === "" || isNaN(priceToSave) || priceToSave <= 0) {
            setResultDialog({ isOpen: true, type: 'error', message: "กรุณากรอกราคาที่ถูกต้อง (ราคาต้องมากกว่า 0)" });
            return;
        }

        if (priceToSave > MAX_ALLOWED_PRICE) {
            setResultDialog({ isOpen: true, type: 'error', message: `ราคาสูงสุดที่กรอกได้คือ ${MAX_ALLOWED_PRICE.toLocaleString()}` });
            return;
        }

        try {
            await axios.put(`/api/products/${productId}`, {
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
        <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-all duration-300">
            <ResultDialog isOpen={resultDialog.isOpen} onClose={() => setResultDialog({ ...resultDialog, isOpen: false })} type={resultDialog.type} message={resultDialog.message} />

            <div className="text-center mb-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transform hover:scale-[1.01] transition-all duration-300">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    จัดการราคารับซื้อ
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-3">
                    อัปเดตราคารับซื้อผลผลิตจากเกษตรกร
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700">
                {/* ★★★ Dark Mode FIX: Section Header Border and Text Colors ★★★ */}
                <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-3">
                        <DollarSign className="text-green-500 h-8 w-8" />
                        <span>รายการราคาสินค้า</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center p-16">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-green-100 dark:border-green-900 animate-pulse"></div>
                            <Loader className="animate-spin text-green-500 dark:text-green-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={32} />
                        </div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 mx-8">
                            <ServerCrash className="mx-auto mb-4 text-red-500 dark:text-red-400" size={48} />
                            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">เกิดข้อผิดพลาด</h3>
                            <p className="text-gray-600 dark:text-gray-400">{error}</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                                <tr>
                                    <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                                        รหัสสินค้า
                                    </th>
                                    <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                                        ชื่อสินค้า
                                    </th>
                                    <th scope="col" className="px-8 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                                        ราคา/หน่วย (บาท)
                                    </th>
                                    {canEdit && <th scope="col" className="px-8 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                                        จัดการ
                                    </th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                {products.map((product) => (
                                    <tr key={product.p_id} 
                                        className={`transition-all duration-200 ${
                                            editingId === product.p_id 
                                            ? 'bg-green-50 dark:bg-green-900/20' 
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}>
                                        {/* ★★★ Dark Mode FIX: Cell Text Colors ★★★ */}
                                        <td className="px-8 py-4">
                                            <span className="font-mono text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                                {product.p_id}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                {product.p_name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            {editingId === product.p_id ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    max={MAX_ALLOWED_PRICE} 
                                                    value={newPrice}
                                                    onChange={handlePriceChange}
                                                    className="block w-32 ml-auto p-2.5 text-right text-sm font-medium text-gray-900 border-2 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500
                                                             dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-green-400 dark:focus:border-green-400 transition-all duration-200"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="font-semibold text-lg text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-1.5 rounded-xl inline-block">
                                                    {product.price_per_unit.toFixed(2)}
                                                </span>
                                            )}
                                        </td>
                                        {canEdit && (
                                            <td className="px-8 py-4 text-center">
                                                {editingId === product.p_id ? (
                                                    <div className="flex justify-center gap-3">
                                                        <button 
                                                            onClick={() => handleSaveClick(product.p_id)} 
                                                            className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-xl transition-all duration-200 hover:scale-105"
                                                            title="บันทึก"
                                                        >
                                                            <Save size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={handleCancelClick} 
                                                            className="p-2 text-white bg-gray-400 hover:bg-gray-500 rounded-xl transition-all duration-200 hover:scale-105"
                                                            title="ยกเลิก"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleEditClick(product)} 
                                                        className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-xl transition-all duration-200 hover:scale-105 dark:text-yellow-500 dark:hover:text-yellow-400 dark:hover:bg-yellow-900/20"
                                                        title="แก้ไข"
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