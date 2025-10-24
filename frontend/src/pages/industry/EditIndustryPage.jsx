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
                setAddress(industry.F_address || ''); // ป้องกันค่า null
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
        <div className="max-w-3xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">แก้ไขข้อมูลโรงงาน</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">ชื่อโรงงาน</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">เบอร์โทรศัพท์</label>
                    <input 
                        type="text" 
                        value={tel} 
                        onChange={e => setTel(e.target.value)} 
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                        required 
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">ที่อยู่</label>
                    <textarea
                        rows="3"
                        value={address} 
                        onChange={e => setAddress(e.target.value)} 
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                    ></textarea>
                </div>
                <div className="flex items-center justify-end gap-4">
                    <button 
                        type="button" 
                        onClick={() => navigate('/industry')} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-5 rounded-lg transition duration-150 ease-in-out"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-150 ease-in-out"
                    >
                        บันทึกการเปลี่ยนแปลง
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditIndustryPage;