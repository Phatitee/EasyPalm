// src/components/forms/FarmerForm.jsx
import React from 'react';

const FarmerForm = ({ formData, errors, onChange, onSubmit, onCancel, isEditMode }) => {
    return (
        <form onSubmit={onSubmit}>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">ชื่อ-นามสกุล *</label>
                <input
                    type="text"
                    name="f_name"
                    value={formData.f_name}
                    onChange={onChange}
                    className={`block w-full p-3 text-sm text-gray-900 border ${errors?.f_name ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500`}
                    required
                />
                {errors?.f_name && <p className="text-red-500 text-xs mt-1">{errors.f_name}</p>}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">เลขบัตรประชาชน *</label>
                <input
                    type="text"
                    inputMode="numeric"
                    name="f_citizen_id_card"
                    value={formData.f_citizen_id_card}
                    onChange={onChange}
                    maxLength="13"
                    className={`block w-full p-3 text-sm text-gray-900 border ${errors?.f_citizen_id_card ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500`}
                    required
                />
                {errors?.f_citizen_id_card && <p className="text-red-500 text-xs mt-1">{errors.f_citizen_id_card}</p>}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">เบอร์โทรศัพท์ *</label>
                <input
                    type="tel"
                    inputMode="tel"
                    name="f_tel"
                    value={formData.f_tel}
                    onChange={onChange}
                    maxLength="10"
                    className={`block w-full p-3 text-sm text-gray-900 border ${errors?.f_tel ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500`}
                    required
                />
                {errors?.f_tel && <p className="text-red-500 text-xs mt-1">{errors.f_tel}</p>}
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">ที่อยู่</label>
                <input
                    type="text"
                    name="f_address"
                    value={formData.f_address}
                    onChange={onChange}
                    className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500"
                />
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
                    className={`${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white font-medium py-2 px-5 rounded-lg transition`}
                >
                    {isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกข้อมูล'}
                </button>
            </div>
        </form>
    );
};

export default FarmerForm;