import React, { useState } from 'react';
import { UserPlus, Save, Loader, ArrowLeft } from 'lucide-react';
import FarmerForm from '../../components/forms/FarmerForm';
import ResultModal from '../../components/modals/ResultModal';
import { useNavigate } from 'react-router-dom';

const AddFarmerPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, success: false, message: '' });
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/farmers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'ไม่สามารถเพิ่มข้อมูลเกษตรกรได้');
            }

            setModal({
                isOpen: true,
                success: true,
                message: 'เพิ่มข้อมูลเกษตรกรสำเร็จ',
            });
        } catch (error) {
            setModal({
                isOpen: true,
                success: false,
                message: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setModal({ isOpen: false, success: false, message: '' });
        if (modal.success) {
            navigate('/purchasing/farmer-management');
        }
    };

    return (
        // ★★★ FIX: พื้นหลังหน้าหลักและสี Text Default ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/purchasing/farmer-management')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition mr-4">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <UserPlus className="mr-3 text-green-600 dark:text-green-400" />
                    เพิ่มข้อมูลเกษตรกรใหม่
                </h1>
            </div>

            {/* ★★★ FIX: Form Container Background and Shadow ★★★ */}
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                <FarmerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                        type="submit"
                        form="farmer-form"
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {isSubmitting ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                </div>
            </div>

            <ResultModal 
                isOpen={modal.isOpen}
                onClose={closeModal}
                success={modal.success}
                message={modal.message}
            />
        </div>
    );
};

export default AddFarmerPage;