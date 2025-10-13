// frontend/src/pages/AddIndustryPage.jsx
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

            // หลังจากบันทึกสำเร็จ ให้เด้งกลับไปหน้า list
            setTimeout(() => {
                navigate('/industry');
            }, 1500); //หน่วงเวลา 1.5 วินาทีเพื่อให้เห็นข้อความ success

        } catch (err) {
            setError('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">เพิ่มรายชื่อโรงงานลูกค้า</h1>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md space-y-4">
                <div>
                    <label htmlFor="F_name" className="block text-sm font-medium text-gray-700">ชื่อโรงงาน/บริษัท *</label>
                    <input
                        type="text"
                        name="F_name"
                        id="F_name"
                        value={formData.F_name}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="F_tel" className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์ *</label>
                    <input
                        type="text"
                        name="F_tel"
                        id="F_tel"
                        value={formData.F_tel}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="F_address" className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                    <textarea
                        name="F_address"
                        id="F_address"
                        rows="3"
                        value={formData.F_address}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                </div>
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center">{success}</p>}

                <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => navigate('/industry')} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">
                        ยกเลิก
                    </button>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                        บันทึกข้อมูล
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddIndustryPage;