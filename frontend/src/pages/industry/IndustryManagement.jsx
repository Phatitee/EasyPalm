// frontend/src/pages/IndustryManagement.jsx
import React, { useState, useEffect } from 'react';
// ลบ Link ออก
import axios from 'axios';
import { PlusCircle, Trash2, Pencil, Factory, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ResultModal from '../../components/modals/ResultModal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import IndustryForm from '../../components/forms/IndustryForm';

const IndustryManagement = () => {
    // --- State เดิม (Edit/Delete/List) ---
    const [industries, setIndustries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalInfo, setModalInfo] = useState({ show: false, type: 'success', message: '' });
    const [confirmInfo, setConfirmInfo] = useState({ show: false, message: '', onConfirm: () => { } });
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingIndustry, setEditingIndustry] = useState({ F_id: null, F_name: '', F_tel: '', F_address: '' });

    // --- (เพิ่มใหม่) State สำหรับ Error ของหน้า Edit ---
    const [editFormErrors, setEditFormErrors] = useState({});

    // --- STATE ใหม่สำหรับ "ADD" MODAL ---
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newIndustryData, setNewIndustryData] = useState({
        F_name: '',
        F_tel: '',
        F_address: ''
    });
    // --- (เพิ่มใหม่) State สำหรับ Error ของหน้า Add ---
    const [addFormErrors, setAddFormErrors] = useState({});

    // --- ดึงข้อมูล (เหมือนเดิม) ---
    const fetchIndustries = async () => {
        setLoading(true);
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

    // --- ฟังก์ชันสำหรับปิด MODAL (เพิ่ม handleCloseAddModal) ---
    const handleCloseResultModal = () => setModalInfo({ ...modalInfo, show: false });
    const handleCloseConfirmModal = () => setConfirmInfo({ ...confirmInfo, show: false });
    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setEditingIndustry({ F_id: null, F_name: '', F_tel: '', F_address: '' });
        setEditFormErrors({}); // --- (เพิ่มใหม่) เคลียร์ Error
    };
    const handleCloseAddModal = () => {
        setAddModalOpen(false);
        setNewIndustryData({ F_name: '', F_tel: '', F_address: '' }); // เคลียร์ฟอร์ม
        setAddFormErrors({}); // --- (เพิ่มใหม่) เคลียร์ Error
    };

    // --- Logic การลบ (เหมือนเดิม) ---
    const handleDelete = (id, name) => {
        setConfirmInfo({
            show: true,
            message: `คุณแน่ใจหรือไม่ว่าต้องการลบ "${name}" ?`,
            onConfirm: () => executeDelete(id)
        });
    };
    const executeDelete = async (id) => {
        handleCloseConfirmModal();
        try {
            await axios.delete(`http://127.0.0.1:5000/food-industries/${id}`);
            setModalInfo({ show: true, type: 'success', message: 'ลบข้อมูลสำเร็จ' });
            fetchIndustries();
        } catch (err) {
            setModalInfo({ show: true, type: 'error', message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
        }
    };

    // --- Logic การแก้ไข ---
    const handleEditClick = (industry) => {
        setEditingIndustry(industry);
        setEditFormErrors({}); // --- (เพิ่มใหม่) เคลียร์ Error
        setEditModalOpen(true);
    };
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditingIndustry(prev => ({ ...prev, [name]: value }));
        // --- (เพิ่มใหม่) เคลียร์ Error ทันทีที่แก้ไข ---
        if (editFormErrors[name]) {
            setEditFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // --- (แก้ไข) เพิ่มการตรวจสอบ Validation ---
        setEditFormErrors({});
        let errors = {};

        if (!editingIndustry.F_name.trim()) {
            errors.F_name = 'กรุณากรอกชื่อโรงงาน';
        }
        if (!editingIndustry.F_tel.trim()) {
            errors.F_tel = 'กรุณากรอกเบอร์โทรศัพท์';
        }
        // (ทางเลือก) ตรวจสอบเบอร์โทร 10 หลัก
        const telPattern = /^0[0-9]{8,9}$/; // อนุญาต 9-10 หลัก
        if (editingIndustry.F_tel.trim() && !telPattern.test(editingIndustry.F_tel.replace(/\D/g, ''))) {
            errors.F_tel = 'กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก ให้ถูกต้อง';
        }

        if (Object.keys(errors).length > 0) {
            setEditFormErrors(errors);
            return;
        }
        // --- (สิ้นสุดการแก้ไข) ---

        try {
            await axios.put(`http://127.0.0.1:5000/food-industries/${editingIndustry.F_id}`, editingIndustry);
            handleCloseEditModal();
            setModalInfo({ show: true, type: 'success', message: 'แก้ไขข้อมูลโรงงานสำเร็จ' });
            fetchIndustries();
        } catch (error) {
            handleCloseEditModal();
            setModalInfo({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก'
            });
        }
    };

    // --- LOGIC ใหม่สำหรับ "ADD" ---
    const handleOpenAddModal = () => {
        setNewIndustryData({ F_name: '', F_tel: '', F_address: '' });
        setAddFormErrors({});
        setAddModalOpen(true);
    };

    const handleAddFormChange = (e) => {
        const { name, value } = e.target;
        setNewIndustryData(prev => ({ ...prev, [name]: value }));
        // --- (เพิ่มใหม่) เคลียร์ Error ทันทีที่แก้ไข ---
        if (addFormErrors[name]) {
            setAddFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();

        // --- (แก้ไข) เพิ่มการตรวจสอบ Validation ---
        setAddFormErrors({});
        let errors = {};

        if (!newIndustryData.F_name.trim()) {
            errors.F_name = 'กรุณากรอกชื่อโรงงาน';
        }
        if (!newIndustryData.F_tel.trim()) {
            errors.F_tel = 'กรุณากรอกเบอร์โทรศัพท์';
        }
        // (ทางเลือก) ตรวจสอบเบอร์โทร 10 หลัก
        const telPattern = /^0[0-9]{8,9}$/; // อนุญาต 9-10 หลัก
        if (newIndustryData.F_tel.trim() && !telPattern.test(newIndustryData.F_tel.replace(/\D/g, ''))) {
            errors.F_tel = 'กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก ให้ถูกต้อง';
        }

        if (Object.keys(errors).length > 0) {
            setAddFormErrors(errors);
            return;
        }
        // --- (สิ้นสุดการแก้ไข) ---

        try {
            await axios.post('http://127.0.0.1:5000/food-industries', newIndustryData);
            handleCloseAddModal();
            setModalInfo({ show: true, type: 'success', message: 'เพิ่มข้อมูลโรงงานสำเร็จ' });
            fetchIndustries(); // โหลดข้อมูลใหม่
        } catch (error) {
            handleCloseAddModal();
            setModalInfo({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก'
            });
        }
    };

    // --- กรองข้อมูล (เหมือนเดิม) ---
    const filteredIndustries = industries.filter(industry =>
        industry.F_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        industry.F_tel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p>กำลังโหลด...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto px-4 py-6">

            <ResultModal
                show={modalInfo.show}
                type={modalInfo.type}
                message={modalInfo.message}
                onClose={handleCloseResultModal}
                successColor="blue" // กำหนดสีฟ้าสำหรับ Success
            />

            <ConfirmModal
                show={confirmInfo.show}
                message={confirmInfo.message}
                onConfirm={confirmInfo.onConfirm}
                onClose={handleCloseConfirmModal}
                confirmText="ยืนยันการลบ"
                confirmColor="red"
            />

            {/* --- JSX: Edit Modal (Form) --- */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">
                            แก้ไขข้อมูลโรงงาน (ID: {editingIndustry.F_id})
                        </h3>
                        {/* --- (★ ใช้ IndustryForm) --- */}
                        <IndustryForm
                            formData={editingIndustry}
                            errors={editFormErrors}
                            onChange={handleEditFormChange}
                            onSubmit={handleEditSubmit} // ส่ง Handler เดิมไป
                            onCancel={handleCloseEditModal}
                            isEditMode={true}
                        />
                    </div>
                </div>
            )}


            {/* --- JSX: "ADD" MODAL --- */}
            {addModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">
                            เพิ่มรายชื่อโรงงานลูกค้า
                        </h3>
                        {/* --- (★ ใช้ IndustryForm) --- */}
                        <IndustryForm
                            formData={newIndustryData}
                            errors={addFormErrors}
                            onChange={handleAddFormChange}
                            onSubmit={handleAddSubmit} // ส่ง Handler เดิมไป
                            onCancel={handleCloseAddModal}
                            isEditMode={false}
                        />
                    </div>
                </div>
            )}

            {/* --- Header (เหมือนเดิม) --- */}
            <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">จัดการข้อมูลโรงงานลูกค้า</h1>
                <p className="text-sm text-gray-500 mt-1">เพิ่ม ลบ และแก้ไขข้อมูลโรงงานลูกค้าในระบบ</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">

                {/* --- Search & Add Button (แก้ไข <Link> เป็น <button>) --- */}
                <div className="p-4 md:p-6 flex justify-between items-end">
                    <div className="w-full md:w-1/3">
                        <label htmlFor="industry-search" className="block text-sm font-medium text-gray-700 mb-1">
                            ค้นหาโรงงาน
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="industry-search"
                                placeholder="ค้นหาด้วยชื่อหรือเบอร์โทรศัพท์..."
                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* --- เปลี่ยนจาก <Link> เป็น <button> --- */}
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                        <PlusCircle size={20} />
                        เพิ่มรายชื่อโรงงาน
                    </button>
                </div>

                {/* --- Table (เหมือนเดิม) --- */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อโรงงาน</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เบอร์โทร</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ที่อยู่</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredIndustries.length > 0 ? filteredIndustries.map((ind) => (
                                <tr key={ind.F_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ind.F_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ind.F_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ind.F_tel}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ind.F_address}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => handleEditClick(ind)}
                                                className="text-yellow-600 hover:text-yellow-900 transition"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ind.F_id, ind.F_name)}
                                                className="text-red-600 hover:text-red-900 transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        -- ไม่มีข้อมูล --
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IndustryManagement;