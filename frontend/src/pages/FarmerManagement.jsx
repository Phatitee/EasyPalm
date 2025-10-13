// frontend/src/pages/FarmerManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FarmerManagement = () => {
    // State สำหรับเก็บรายชื่อเกษตรกรทั้งหมด
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State สำหรับฟอร์มเพิ่มเกษตรกรใหม่
    const [newName, setNewName] = useState('');
    const [newIdCard, setNewIdCard] = useState('');
    const [newTel, setNewTel] = useState('');
    const [newAddress, setNewAddress] = useState('');

    // ฟังก์ชันสำหรับดึงข้อมูลเกษตรกรทั้งหมด
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

    // เรียกใช้ฟังก์ชัน fetchFarmers ตอนเปิดหน้าครั้งแรก
    useEffect(() => {
        fetchFarmers();
    }, []);

    // ฟังก์ชันสำหรับบันทึกเกษตรกรใหม่
    const handleAddFarmer = async (e) => {
        e.preventDefault();
        if (!newName || !newIdCard || !newTel) {
            alert('กรุณากรอกชื่อ, เลขบัตรประชาชน และเบอร์โทร');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/farmers', {
                f_name: newName,
                f_citizen_id_card: newIdCard,
                f_tel: newTel,
                f_address: newAddress,
            });

            alert(`เพิ่มเกษตรกร "${response.data.f_name}" สำเร็จ!`);
            // ล้างฟอร์ม
            setNewName('');
            setNewIdCard('');
            setNewTel('');
            setNewAddress('');
            // โหลดรายชื่อใหม่
            fetchFarmers();

        } catch (err) {
            console.error("เกิดข้อผิดพลาด:", err.response);
            alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
        }
    };


    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">จัดการข้อมูลเกษตรกร</h1>

            {/* ฟอร์มเพิ่มเกษตรกร */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">ลงทะเบียนเกษตรกรใหม่</h2>
                <form onSubmit={handleAddFarmer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="ชื่อ-นามสกุล" className="p-2 border rounded" required />
                    <input type="text" value={newIdCard} onChange={e => setNewIdCard(e.target.value)} placeholder="เลขบัตรประชาชน" className="p-2 border rounded" required />
                    <input type="text" value={newTel} onChange={e => setNewTel(e.target.value)} placeholder="เบอร์โทรศัพท์" className="p-2 border rounded" required />
                    <input type="text" value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="ที่อยู่ (ถ้ามี)" className="p-2 border rounded" />
                    <button type="submit" className="md:col-span-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        + เพิ่มเกษตรกร
                    </button>
                </form>
            </div>

            {/* ตารางแสดงรายชื่อเกษตรกร */}
            <h2 className="text-xl font-semibold mb-4">รายชื่อเกษตรกรในระบบ</h2>
            {loading && <p>กำลังโหลด...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <div className="bg-white shadow-md rounded-lg">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">รหัส</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เบอร์โทรศัพท์</th>
                            </tr>
                        </thead>
                        <tbody>
                            {farmers.map((farmer) => (
                                <tr key={farmer.f_id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{farmer.f_id}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{farmer.f_name}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{farmer.f_tel}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FarmerManagement;