// frontend/src/pages/AddFarmerPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddFarmerPage = () => {
    const [name, setName] = useState('');
    const [citizenId, setCitizenId] = useState('');
    const [tel, setTel] = useState('');
    const [address, setAddress] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:5000/farmers', {
                f_name: name,
                f_citizen_id_card: citizenId,
                f_tel: tel,
                f_address: address,
            });
            alert('เพิ่มข้อมูลเกษตรกรสำเร็จ');
            navigate('/farmers');
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error.response);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">ลงทะเบียนเกษตรกรใหม่</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">ชื่อ-นามสกุล</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded w-full" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">เลขบัตรประชาชน</label>
                    <input type="text" value={citizenId} onChange={e => setCitizenId(e.target.value)} className="p-2 border rounded w-full" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">เบอร์โทรศัพท์</label>
                    <input type="text" value={tel} onChange={e => setTel(e.target.value)} className="p-2 border rounded w-full" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">ที่อยู่</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="p-2 border rounded w-full" />
                </div>
                <div className="flex items-center justify-between">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        บันทึกข้อมูล
                    </button>
                    <button type="button" onClick={() => navigate('/farmers')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                        ยกเลิก
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddFarmerPage;