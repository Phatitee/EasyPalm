// src/components/forms/FarmerForm.jsx
import React from 'react';

const FarmerForm = ({ formData, errors, onChange, onSubmit, onCancel, isEditMode }) => {
    // กำหนด Dark Mode Styling สำหรับ Input Fields
    const inputClasses = (fieldName) => {
        const hasError = errors?.[fieldName];
        return `
            block w-full p-3 text-sm rounded-lg transition-colors
            text-gray-900 dark:text-gray-100 
            border
            bg-gray-50 dark:bg-gray-700 
            focus:ring-green-500 focus:border-green-500
            ${hasError 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-gray-300 dark:border-gray-600'}
        `.replace(/\s+/g, ' ').trim(); // ลบช่องว่างที่ไม่จำเป็น
    };
    
    // กำหนด Dark Mode Styling สำหรับ Buttons
    const submitButtonClasses = isEditMode 
        ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' 
        : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600';

    return (
        <form onSubmit={onSubmit}>
            {/* --- NAME --- */}
            <div className="mb-4">
                {/* ★★★ FIX 1: Label Text Color ★★★ */}
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">ชื่อ-นามสกุล *</label>
                <input
                    type="text"
                    name="f_name"
                    value={formData.f_name}
                    onChange={onChange}
                    // ★★★ FIX 2: Input Field Styling ★★★
                    className={inputClasses('f_name')}
                    required
                />
                {/* ★★★ FIX 3: Error Text Color ★★★ */}
                {errors?.f_name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.f_name}</p>}
            </div>

            {/* --- CITIZEN ID --- */}
            <div className="mb-4">
                {/* ★★★ FIX 4: Label Text Color ★★★ */}
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">เลขบัตรประชาชน *</label>
                <input
                    type="text"
                    inputMode="numeric"
                    name="f_citizen_id_card"
                    value={formData.f_citizen_id_card}
                    onChange={onChange}
                    maxLength="13"
                    // ★★★ FIX 5: Input Field Styling ★★★
                    className={inputClasses('f_citizen_id_card')}
                    required
                />
                {/* ★★★ FIX 6: Error Text Color ★★★ */}
                {errors?.f_citizen_id_card && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.f_citizen_id_card}</p>}
            </div>

            {/* --- TEL --- */}
            <div className="mb-4">
                {/* ★★★ FIX 7: Label Text Color ★★★ */}
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">เบอร์โทรศัพท์ *</label>
                <input
                    type="tel"
                    inputMode="tel"
                    name="f_tel"
                    value={formData.f_tel}
                    onChange={onChange}
                    maxLength="10"
                    // ★★★ FIX 8: Input Field Styling ★★★
                    className={inputClasses('f_tel')}
                    required
                />
                {/* ★★★ FIX 9: Error Text Color ★★★ */}
                {errors?.f_tel && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.f_tel}</p>}
            </div>

            {/* --- ADDRESS --- */}
            <div className="mb-6">
                {/* ★★★ FIX 10: Label Text Color ★★★ */}
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">ที่อยู่</label>
                <input
                    type="text"
                    name="f_address"
                    value={formData.f_address}
                    onChange={onChange}
                    // ★★★ FIX 11: Input Field Styling (ไม่มี error state) ★★★
                    className={inputClasses('f_address')}
                />
            </div>

            {/* --- BUTTONS --- */}
            <div className="flex items-center justify-end gap-4">
                {/* ★★★ FIX 12: Cancel Button Styling ★★★ */}
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
                    // ★★★ FIX 13: Submit Button Styling ★★★
                    className={`${submitButtonClasses} text-white font-medium py-2 px-5 rounded-lg transition`}
                >
                    {isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกข้อมูล'}
                </button>
            </div>
        </form>
    );
};

export default FarmerForm;