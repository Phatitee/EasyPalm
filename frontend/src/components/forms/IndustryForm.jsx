// src/components/forms/IndustryForm.jsx
import React from 'react';

const IndustryForm = ({ formData, errors, onChange, onSubmit, onCancel, isEditMode }) => {
    // Helper function สำหรับกำหนด Input/Textarea Styling ใน Dark Mode
    const inputClasses = (fieldName) => {
        const hasError = errors?.[fieldName];
        return `
            block w-full p-3 text-sm rounded-lg transition-colors
            text-gray-900 dark:text-gray-100 
            border
            bg-gray-50 dark:bg-gray-700 
            focus:ring-blue-500 focus:border-blue-500
            ${hasError 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-gray-300 dark:border-gray-600'}
        `.replace(/\s+/g, ' ').trim();
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="mb-4">
                {/* ★★★ FIX 1: Label Text Color ★★★ */}
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">ชื่อโรงงาน/บริษัท *</label>
                <input
                    type="text"
                    name="F_name"
                    value={formData.F_name}
                    onChange={onChange}
                    // ★★★ FIX 2: Input Field Styling ★★★
                    className={inputClasses('F_name')}
                    required
                />
                {/* ★★★ FIX 3: Error Text Color ★★★ */}
                {errors?.F_name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.F_name}</p>}
            </div>
            <div className="mb-4">
                {/* ★★★ FIX 4: Label Text Color ★★★ */}
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">เบอร์โทรศัพท์ *</label>
                <input
                    type="text"
                    name="F_tel"
                    value={formData.F_tel}
                    onChange={onChange}
                    // ★★★ FIX 5: Input Field Styling ★★★
                    className={inputClasses('F_tel')}
                    required
                />
                 {/* ★★★ FIX 6: Error Text Color ★★★ */}
                 {errors?.F_tel && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.F_tel}</p>}
            </div>
            <div className="mb-6">
                {/* ★★★ FIX 7: Label Text Color ★★★ */}
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">ที่อยู่</label>
                <textarea
                    rows="3"
                    name="F_address"
                    value={formData.F_address || ''}
                    onChange={onChange}
                    // ★★★ FIX 8: Textarea Styling ★★★
                    className={inputClasses('F_address')}
                ></textarea>
            </div>
            <div className="flex items-center justify-end gap-4">
                {/* ★★★ FIX 9: Cancel Button Styling ★★★ */}
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded-lg transition
                               dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100"
                >
                    ยกเลิก
                </button>
                <button
                    type="submit"
                    // ★★★ FIX 10: Submit Button Styling (เพิ่ม dark:hover) ★★★
                    className={`${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-5 rounded-lg transition`} // ใช้สีฟ้าทั้งคู่
                >
                    {isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกข้อมูล'}
                </button>
            </div>
        </form>
    );
};

export default IndustryForm;