// frontend/src/pages/FarmerManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Pencil } from 'lucide-react';

const FarmerManagement = () => {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchFarmers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:5000/farmers');
            setFarmers(response.data);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลเกษตรกรได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarmers();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${name}" ?`)) {
            try {
                await axios.delete(`http://127.0.0.1:5000/farmers/${id}`);
                alert(`ลบข้อมูล ${name} สำเร็จ`);
                fetchFarmers();
            } catch (err) {
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };
    
    const filteredFarmers = farmers.filter(farmer =>
        farmer.f_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.f_tel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p>กำลังโหลด...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">จัดการข้อมูลเกษตรกร</h1>
                <Link
                    to="/farmer/add"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                    <Plus size={20} />
                    เพิ่มเกษตรกร
                </Link>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="ค้นหาชื่อเกษตรกรหรือเบอร์โทร..."
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
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                             <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เลขบัตรประชาชน</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เบอร์โทรศัพท์</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ที่อยู่</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFarmers.length > 0 ? filteredFarmers.map((farmer) => (
                            <tr key={farmer.f_id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{farmer.f_id}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{farmer.f_name}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{farmer.f_citizen_id_card}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{farmer.f_tel}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{farmer.f_address}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <Link to={`/farmer/edit/${farmer.f_id}`} className="text-yellow-500 hover:text-yellow-700 mr-2">
                                        <Pencil size={20} />
                                    </Link>
                                    <button onClick={() => handleDelete(farmer.f_id, farmer.f_name)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500">-- ไม่มีข้อมูล --</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FarmerManagement;