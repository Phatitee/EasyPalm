// frontend/src/pages/purchasing/EditFarmerPage.jsx (FIXED)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Save, Loader, ArrowLeft, ServerCrash } from 'lucide-react';
import FarmerForm from '../../components/forms/FarmerForm';
import ResultModal from '../../components/modals/ResultModal';

// 1. ★★★ Import ฟังก์ชันจาก api.js ★★★
import { getFarmerById, updateFarmer } from '../../services/api';

// 2. ★★★ ลบ API_URL ทิ้งไป ★★★
// const API_URL = process.env.REACT_APP_API_URL;

const EditFarmerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, success: false, message: '' });

    useEffect(() => {
        const fetchFarmer = async () => {
            setLoading(true);
            setError('');
            try {
                // 3. ★★★ แก้ไข: ใช้ getFarmerById จาก api.js ★★★
                const data = await getFarmerById(id);
                setInitialData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFarmer();
    }, [id]);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            // 4. ★★★ แก้ไข: ใช้ updateFarmer จาก api.js ★★★
            // (api.js จะจัดการ .json() และ error message ให้เอง)
            await updateFarmer(id, formData);

            setModal({
                isOpen: true,
                success: true,
                message: 'แก้ไขข้อมูลเกษตรกรสำเร็จ',
            });
        } catch (error) {
            setModal({
                isOpen: true,
                success: false,
                message: error.message, // (error.message จะมาจาก api.js)
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setModal({ isOpen: false, success: false, message: '' });
        if (modal.success) {
            navigate('/purchasing/farmer-management'); // (สันนิษฐานว่านี่คือหน้า List)
        }
    };

    if (loading) return (
        // ★★★ FIX: Loading State Text Color ★★★
        <div className="flex justify-center items-center h-screen dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Loader className="animate-spin text-blue-500" size={48} />
        </div>
    );
    if (error) return (
        // ★★★ FIX: Error State Background and Text ★★★
        <div className="flex flex-col justify-center items-center h-screen dark:bg-gray-900 text-red-600 dark:text-red-400">
            <ServerCrash size={48} className="mb-4" />
            <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2>
            <p className="dark:text-gray-300">{error}</p>
        </div>
    );

    return (
        // ★★★ FIX: พื้นหลังหน้าหลักและสี Text Default ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/purchasing/farmers')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition mr-4">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <User className="mr-3 text-blue-600 dark:text-blue-400" />
                    แก้ไขข้อมูลเกษตรกร: {initialData.f_name}
                </h1>
            </div>

            {/* ★★★ FIX: Form Container Background and Shadow ★★★ */}
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                <FarmerForm initialData={initialData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                        type="submit"
                        form="farmer-form"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {isSubmitting ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                    </button>
                </div>
            </div>

            <ResultModal 
                isOpen={modal.isOpen}
                onClose={closeModal}
                success={modal.success} // (ResultModal component น่าจะใช้ prop ชื่อ success)
                type={modal.success ? 'success' : 'error'} // (หรืออาจจะใช้ type)
                message={modal.message}
            />
        </div>
    );
};

export default EditFarmerPage;