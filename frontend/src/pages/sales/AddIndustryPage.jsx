// frontend/src/pages/sales/AddIndustryPage.jsx (FIXED)

import React, { useState } from 'react';
// 1. ★★★ ลบ axios ออก ★★★
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Factory, ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react';

// 2. ★★★ Import ฟังก์ชันจาก api.js ★★★
import { createFoodIndustry } from '../../services/api';

// 3. ★★★ ลบ API_URL ทิ้งไป ★★★
// const API_URL = process.env.REACT_APP_API_URL;

// Helper Modal (ResultDialog) - สำหรับแจ้งผลลัพธ์
const ResultDialog = ({ isOpen, onClose, type, message }) => {
    if (!isOpen) return null;
    const isSuccess = type === 'success';
    return (
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

const AddIndustryPage = () => {
    const [formData, setFormData] = useState({
        F_name: '',
        F_tel: '',
        F_address: ''
    });
    const [error, setError] = useState('');
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '', navigate: false });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.F_name || !formData.F_tel) {
            setError('กรุณากรอกชื่อและเบอร์โทรศัพท์');
            return;
        }

        try {
            // 4. ★★★ แก้ไข: ใช้ createFoodIndustry จาก api.js ★★★
            const response = await createFoodIndustry(formData);
            setResultDialog({
                isOpen: true,
                type: 'success',
                message: `เพิ่มข้อมูลลูกค้า "${response.F_name}" สำเร็จ!`, // (api.js จะ return data กลับมา)
                navigate: true
            });

        } catch (err) {
            setResultDialog({
                isOpen: true,
                type: 'error',
                message: 'เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้'),
                navigate: false
            });
        }
    };

    const handleCloseResultDialog = () => {
        setResultDialog({ ...resultDialog, isOpen: false });
        if (resultDialog.navigate) {
            navigate('/sales/customers'); // (แก้ไข: ไปที่ /customers)
        }
    };

    return (
        // ★★★ Dark Mode FIX: Main Container Background ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <button onClick={() => navigate('/sales/customers')} className="flex items-center gap-2 text-gray-600 hover:text-blue-700 mb-6 font-semibold transition-colors dark:text-gray-400 dark:hover:text-blue-500">
                <ArrowLeft size={18} /> กลับสู่หน้าจัดการลูกค้า
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <Factory className="mr-3 text-blue-600 dark:text-blue-400"/>
                เพิ่มรายชื่อโรงงานลูกค้า
            </h1>

            {/* ★★★ Dark Mode FIX: Form Container Background ★★★ */}
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
                <div className="mb-4">
                    {/* ★★★ Dark Mode FIX: Label Text Color ★★★ */}
                    <label htmlFor="F_name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">ชื่อโรงงาน/บริษัท *</label>
                    <input
                        type="text"
                        name="F_name"
                        id="F_name"
                        value={formData.F_name}
                        onChange={handleChange}
                        // ★★★ Dark Mode FIX: Input Field Styling ★★★
                        className="block w-full p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        required
                    />
                </div>
                <div className="mb-4">
                    {/* ★★★ Dark Mode FIX: Label Text Color ★★★ */}
                    <label htmlFor="F_tel" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">เบอร์โทรศัพท์ *</label>
                    <input
                        type="text"
                        name="F_tel"
                        id="F_tel"
                        value={formData.F_tel}
                        onChange={handleChange}
                        // ★★★ Dark Mode FIX: Input Field Styling ★★★
                        className="block w-full p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        required
                    />
                </div>
                <div className="mb-6">
                    {/* ★★★ Dark Mode FIX: Label Text Color ★★★ */}
                    <label htmlFor="F_address" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">ที่อยู่</label>
                    <textarea
                        name="F_address"
                        id="F_address"
                        rows="3"
                        value={formData.F_address}
                        onChange={handleChange}
                        // ★★★ Dark Mode FIX: Textarea Styling ★★★
                        className="block w-full p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    ></textarea>
                </div>
                
                {/* ★★★ Dark Mode FIX: Error Text Color ★★★ */}
                {error && <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">{error}</p>}
                {resultDialog.isOpen && resultDialog.type === 'success' && <p className="text-green-500 text-sm text-center mb-4">{resultDialog.message}</p>}

                <div className="flex items-center justify-end gap-4">
                    {/* ★★★ Dark Mode FIX: Cancel Button Styling ★★★ */}
                    <button 
                        type="button" 
                        onClick={() => navigate('/sales/customers')} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded-lg transition duration-150 ease-in-out dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition duration-150 ease-in-out"
                    >
                        <Save className="inline mr-2" size={20}/> บันทึกข้อมูล
                    </button>
                </div>
            </form>
            <ResultDialog {...resultDialog} onClose={handleCloseResultDialog} />
        </div>
    );
};

export default AddIndustryPage;