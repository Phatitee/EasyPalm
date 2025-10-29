import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
    show,
    message,
    onConfirm,
    onClose,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    confirmColor = 'green'
}) => {
    if (!show) return null;

    // --- Map สีของปุ่มยืนยันให้ Tailwind เห็นตอน build ---
    const colorClasses = {
        green: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400',
        red: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400',
        blue: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400',
        yellow: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-400',
    };

    const buttonClass = colorClasses[confirmColor] || colorClasses.green;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4 transition-colors">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-5" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    ยืนยันการดำเนินการ
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg whitespace-pre-line">
                    {message}
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-6 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors
                                   dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`w-full py-3 px-6 rounded-lg font-medium text-white ${buttonClass} transition-colors`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
