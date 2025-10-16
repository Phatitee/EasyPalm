// frontend/src/pages/IndustryManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Pencil } from 'lucide-react';

const IndustryManagement = () => {
    const [industries, setIndustries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchIndustries = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/food-industries');
            setIndustries(response.data);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลโรงงานได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIndustries();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${name}" ?`)) {
            try {
                await axios.delete(`http://127.0.0.1:5000/food-industries/${id}`);
                alert(`ลบข้อมูล ${name} สำเร็จ`);
                fetchIndustries(); // โหลดข้อมูลใหม่หลังลบ
            } catch (err) {
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    const filteredIndustries = industries.filter(industry =>
        industry.F_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        industry.F_tel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p>กำลังโหลด...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">ข้อมูลโรงงานลูกค้า</h1>
                <Link
                    to="/industry/add"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                    <Plus size={20} />
                    เพิ่มรายชื่อโรงงาน
                </Link>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="ค้นหาชื่อโรงงานหรือเบอร์โทร..."
                    className="p-2 border rounded w-full md:w-1/3"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">รหัส</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อโรงงาน</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เบอร์โทร</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ที่อยู่</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIndustries.length > 0 ? filteredIndustries.map((ind) => (
                            <tr key={ind.F_id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{ind.F_id}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{ind.F_name}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{ind.F_tel}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{ind.F_address}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <Link to={`/industry/edit/${ind.F_id}`} className="text-yellow-500 hover:text-yellow-700 mr-2">
                                        <Pencil size={20} />
                                    </Link>
                                    <button onClick={() => handleDelete(ind.F_id, ind.F_name)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center py-10 text-gray-500">-- ไม่มีข้อมูล --</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IndustryManagement;