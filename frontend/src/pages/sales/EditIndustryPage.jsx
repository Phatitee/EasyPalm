import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Factory, ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react';

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

const EditIndustryPage = () => {
    const [name, setName] = useState('');
    const [tel, setTel] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '', navigate: false });
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchIndustry = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/food-industries/${id}`);
                const industry = response.data;
                setName(industry.F_name);
                setTel(industry.F_tel);
                setAddress(industry.F_address || '');
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลโรงงานได้');
                setResultDialog({ isOpen: true, type: 'error', message: 'ไม่สามารถโหลดข้อมูลโรงงานได้', navigate: true });
            } finally {
                setLoading(false);
            }
        };
        fetchIndustry();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/food-industries/${id}`, {
                F_name: name,
                F_tel: tel,
                F_address: address,
            });
            setResultDialog({ isOpen: true, type: 'success', message: 'แก้ไขข้อมูลโรงงานสำเร็จ', navigate: true });
        } catch (err) {
            setResultDialog({ isOpen: true, type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก', navigate: false });
        }
    };

    const handleCloseResultDialog = () => {
        setResultDialog({ ...resultDialog, isOpen: false });
        if (resultDialog.navigate) {
            navigate('/sales/customer-management');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">กำลังโหลด...</div>;
    if (error) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-red-500 dark:text-red-400">{error}</div>;


    return (
        // ★★★ Dark Mode FIX: Main Container Background ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <button onClick={() => navigate('/sales/customer-management')} className="flex items-center gap-2 text-gray-600 hover:text-blue-700 mb-6 font-semibold transition-colors dark:text-gray-400 dark:hover:text-blue-500">
                <ArrowLeft size={18} /> กลับสู่หน้าจัดการลูกค้า
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <Factory className="mr-3 text-blue-600 dark:text-blue-400"/>
                แก้ไขข้อมูลโรงงาน
            </h1>
            
            {/* ★★★ Dark Mode FIX: Form Container Background ★★★ */}
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
                <div className="mb-4">
                    {/* ★★★ Dark Mode FIX: Label Text Color ★★★ */}
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">ชื่อโรงงาน</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        // ★★★ Dark Mode FIX: Input Field Styling ★★★
                        className="block w-full p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        required 
                    />
                </div>
                <div className="mb-4">
                    {/* ★★★ Dark Mode FIX: Label Text Color ★★★ */}
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">เบอร์โทรศัพท์</label>
                    <input 
                        type="text" 
                        value={tel} 
                        onChange={e => setTel(e.target.value)} 
                        // ★★★ Dark Mode FIX: Input Field Styling ★★★
                        className="block w-full p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" 
                        required 
                    />
                </div>
                <div className="mb-6">
                    {/* ★★★ Dark Mode FIX: Label Text Color ★★★ */}
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">ที่อยู่</label>
                    <textarea
                        rows="3"
                        value={address} 
                        onChange={e => setAddress(e.target.value)} 
                        // ★★★ Dark Mode FIX: Textarea Styling ★★★
                        className="block w-full p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" 
                    ></textarea>
                </div>
                <div className="flex items-center justify-end gap-4">
                    {/* ★★★ Dark Mode FIX: Cancel Button Styling ★★★ */}
                    <button 
                        type="button" 
                        onClick={() => navigate('/sales/customer-management')} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-5 rounded-lg transition duration-150 ease-in-out dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-150 ease-in-out"
                    >
                        <Save className="inline mr-2" size={20}/> บันทึกการเปลี่ยนแปลง
                    </button>
                </div>
            </form>
            <ResultDialog {...resultDialog} onClose={handleCloseResultDialog} />
        </div>
    );
};

export default EditIndustryPage;