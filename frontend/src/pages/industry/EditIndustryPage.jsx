// frontend/src/pages/EditIndustryPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditIndustryPage = () => {
    const [name, setName] = useState('');
    const [tel, setTel] = useState('');
    const [address, setAddress] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchIndustry = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/food-industries/${id}`);
                const industry = response.data;
                setName(industry.F_name);
                setTel(industry.F_tel);
                setAddress(industry.F_address);
            } catch (error) {
                console.error('ไม่สามารถโหลดข้อมูลโรงงานได้:', error);
                alert('ไม่สามารถโหลดข้อมูลโรงงานได้');
            }
        };
        fetchIndustry();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://127.0.0.1:5000/food-industries/${id}`, {
                F_name: name,
                F_tel: tel,
                F_address: address,
            });
            alert('แก้ไขข้อมูลโรงงานสำเร็จ');
            navigate('/industry');
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error.response);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">แก้ไขข้อมูลโรงงาน</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">ชื่อโรงงาน</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded w-full" required />
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
                        บันทึกการเปลี่ยนแปลง
                    </button>
                    <button type="button" onClick={() => navigate('/industry')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                        ยกเลิก
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditIndustryPage;