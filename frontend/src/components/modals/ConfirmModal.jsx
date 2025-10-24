// src/components/modals/ConfirmModal.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ show, message, onConfirm, onClose, confirmText = 'ยืนยัน', cancelText = 'ยกเลิก', confirmColor = 'green' }) => {
    if (!show) return null;

    // --- ★ เพิ่มส่วนนี้ ---
    // สร้าง object เพื่อ map สีกับคลาสของ Tailwind
    // วิธีนี้ช่วยให้ Tailwind "มองเห็น" คลาสเต็มๆ ตอน build
    const colorClasses = {
        green: 'bg-green-600 hover:bg-green-700',
        red: 'bg-red-600 hover:bg-red-700',
        blue: 'bg-blue-600 hover:bg-blue-700',
        yellow: 'bg-yellow-600 hover:bg-yellow-700',
    };

    // เลือกคลาสที่ถูกต้อง หรือใช้ green เป็น default
    const buttonClass = colorClasses[confirmColor] || colorClasses.green;
    // --- ★ สิ้นสุดส่วนที่เพิ่ม ---

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-5" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    ยืนยันการดำเนินการ
                </h3>
                <p className="text-gray-600 mb-8 text-lg whitespace-pre-line">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-6 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        // --- ★ แก้ไขบรรทัดนี้ ---
                        // ใช้ตัวแปร buttonClass แทนการต่อ string
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