// src/components/modals/ResultModal.jsx
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const ResultModal = ({ show, type, message, onClose, successColor = 'green', errorColor = 'red' }) => {
    if (!show) return null;

    const Icon = type === 'success' ? CheckCircle : XCircle;
    const color = type === 'success' ? successColor : errorColor;
    const title = type === 'success' ? 'ดำเนินการสำเร็จ' : 'เกิดข้อผิดพลาด';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                <Icon className={`w-16 h-16 text-${color}-500 mx-auto mb-5`} />
                <h3 className={`text-2xl font-bold mb-4 ${type === 'success' ? 'text-gray-900' : `text-${errorColor}-600`}`}>
                    {title}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">{message}</p>
                <button
                    onClick={onClose}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors bg-${color}-600 hover:bg-${color}-700`}
                >
                    ตกลง
                </button>
            </div>
        </div>
    );
};

export default ResultModal;