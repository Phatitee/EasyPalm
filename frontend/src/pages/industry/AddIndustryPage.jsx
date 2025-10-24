import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddIndustryPage = () => {
    const [formData, setFormData] = useState({
        F_name: '',
        F_tel: '',
        F_address: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.F_name || !formData.F_tel) {
            setError('กรุณากรอกชื่อและเบอร์โทรศัพท์');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/food-industries', formData);
            setSuccess(`เพิ่มข้อมูลลูกค้า "${response.data.F_name}" สำเร็จ!`);
            setFormData({ F_name: '', F_tel: '', F_address: '' }); // Clear form

            setTimeout(() => {
                navigate('/industry');
            }, 1500);

        } catch (err) {
            setError('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">เพิ่มรายชื่อโรงงานลูกค้า</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label htmlFor="F_name" className="block text-gray-700 text-sm font-bold mb-2">ชื่อโรงงาน/บริษัท *</label>
                    <input
                        type="text"
                        name="F_name"
                        id="F_name"
                        value={formData.F_name}
                        onChange={handleChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="F_tel" className="block text-gray-700 text-sm font-bold mb-2">เบอร์โทรศัพท์ *</label>
                    <input
                        type="text"
                        name="F_tel"
                        id="F_tel"
                        value={formData.F_tel}
                        onChange={handleChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="F_address" className="block text-gray-700 text-sm font-bold mb-2">ที่อยู่</label>
                    <textarea
                        name="F_address"
                        id="F_address"
                        rows="3"
                        value={formData.F_address}
                        onChange={handleChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                </div>
                
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}

                <div className="flex items-center justify-end gap-4">
                    <button 
                        type="button" 
                        onClick={() => navigate('/industry')} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded-lg transition duration-150 ease-in-out"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition duration-150 ease-in-out"
                    >
                        บันทึกข้อมูล
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddIndustryPage;