// src/components/forms/IndustryForm.jsx
import React from 'react';

const IndustryForm = ({ formData, errors, onChange, onSubmit, onCancel, isEditMode }) => {
    return (
        <form onSubmit={onSubmit}>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">ชื่อโรงงาน/บริษัท *</label>
                <input
                    type="text"
                    name="F_name"
                    value={formData.F_name}
                    onChange={onChange}
                    className={`block w-full p-3 text-sm text-gray-900 border ${errors?.F_name ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500`}
                    required
                />
                {errors?.F_name && <p className="text-red-500 text-xs mt-1">{errors.F_name}</p>}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">เบอร์โทรศัพท์ *</label>
                <input
                    type="text"
                    name="F_tel"
                    value={formData.F_tel}
                    onChange={onChange}
                    className={`block w-full p-3 text-sm text-gray-900 border ${errors?.F_tel ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500`}
                    required
                />
                 {errors?.F_tel && <p className="text-red-500 text-xs mt-1">{errors.F_tel}</p>}
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">ที่อยู่</label>
                <textarea
                    rows="3"
                    name="F_address"
                    value={formData.F_address || ''}
                    onChange={onChange}
                    className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
            </div>
            <div className="flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded-lg transition"
                >
                    ยกเลิก
                </button>
                <button
                    type="submit"
                    className={`${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-5 rounded-lg transition`} // ใช้สีฟ้าทั้งคู่
                >
                    {isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกข้อมูล'}
                </button>
            </div>
        </form>
    );
};

export default IndustryForm;