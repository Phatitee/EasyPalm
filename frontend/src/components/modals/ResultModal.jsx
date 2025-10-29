import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const ResultModal = ({
    show,
    type,
    message,
    onClose,
    successColor = 'green',
    errorColor = 'red'
}) => {
    if (!show) return null;

    const Icon = type === 'success' ? CheckCircle : XCircle;
    const color = type === 'success' ? successColor : errorColor;
    const title = type === 'success' ? 'ดำเนินการสำเร็จ' : 'เกิดข้อผิดพลาด';

    // --- Map สีของ icon และปุ่มให้ Tailwind เห็นตอน build ---
    const colorClasses = {
        green: {
            icon: 'text-green-500',
            button: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400'
        },
        red: {
            icon: 'text-red-500',
            button: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400'
        },
        blue: {
            icon: 'text-blue-500',
            button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400'
        },
        yellow: {
            icon: 'text-yellow-500',
            button: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-400'
        },
    };

    const selected = colorClasses[color] || colorClasses.green;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4 transition-colors">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <Icon className={`w-16 h-16 mx-auto mb-5 ${selected.icon}`} />
                <h3
                    className={`text-2xl font-bold mb-4 ${
                        type === 'success'
                            ? 'text-gray-900 dark:text-gray-100'
                            : `text-${errorColor}-600 dark:text-${errorColor}-400`
                    }`}
                >
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">{message}</p>
                <button
                    onClick={onClose}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${selected.button}`}
                >
                    ตกลง
                </button>
            </div>
        </div>
    );
};

export default ResultModal;
