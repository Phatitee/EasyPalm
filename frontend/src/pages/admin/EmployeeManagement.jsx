// frontend/src/pages/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';

// --- Component สำหรับฟอร์มใน Modal (แยกออกมาเพื่อความสะอาด) ---
const EmployeeFormModal = ({ employee, onClose, onSubmit }) => {
    // ถ้ามี employee ส่งเข้ามา = โหมดแก้ไข, ถ้าเป็น null = โหมดเพิ่มใหม่
    const isEditMode = !!employee; 
    
    const [formData, setFormData] = useState({
        e_name: employee?.e_name || '',
        position: employee?.position || '',
        e_role: employee?.e_role || 'Sales',
        e_email: employee?.e_email || '',
        e_tel: employee?.e_tel || '',
        username: employee?.username || '',
        password: '', // ไม่แสดงรหัสผ่านเก่า
        e_citizen_id_card: employee?.e_citizen_id_card || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // ในโหมดแก้ไข ถ้าไม่กรอกรหัสผ่าน ก็ไม่ต้องส่งไป
        const dataToSend = { ...formData };
        if (isEditMode && !dataToSend.password) {
            delete dataToSend.password;
        }
        onSubmit(dataToSend);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{isEditMode ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="e_name" value={formData.e_name} onChange={handleChange} placeholder="ชื่อ-นามสกุล" required className="p-2 border rounded" />
                        <input name="position" value={formData.position} onChange={handleChange} placeholder="ตำแหน่ง" required className="p-2 border rounded" />
                        <select name="e_role" value={formData.e_role} onChange={handleChange} className="p-2 border rounded">
                            <option value="Sales">Sales</option>
                            <option value="Finance">Finance</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <input name="e_email" value={formData.e_email} type="email" onChange={handleChange} placeholder="อีเมล" className="p-2 border rounded" />
                        <input name="e_tel" value={formData.e_tel} onChange={handleChange} placeholder="เบอร์โทร" className="p-2 border rounded" />
                        <input name="e_citizen_id_card" value={formData.e_citizen_id_card} onChange={handleChange} placeholder="เลขบัตรประชาชน" required className="p-2 border rounded" disabled={isEditMode} />
                        <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required className="p-2 border rounded" disabled={isEditMode} />
                        <input name="password" value={formData.password} type="password" onChange={handleChange} placeholder={isEditMode ? "รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)" : "รหัสผ่าน"} required={!isEditMode} className="p-2 border rounded" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                            ยกเลิก
                        </button>
                        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Component หลักของหน้า Dashboard ---
const EmployeeDashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:5000/employees');
            setEmployees(response.data);
            setError('');
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลพนักงานได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const openModalForNew = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };
    
    const closeModal = () => setIsModalOpen(false);
    
    const handleDelete = async (employeeId, employeeName) => {
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบพนักงาน "${employeeName}" (รหัส: ${employeeId})?`)) {
            try {
                await axios.delete(`http://127.0.0.1:5000/employees/${employeeId}`);
                alert('ลบพนักงานสำเร็จ!');
                fetchEmployees();
            } catch (err) {
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    const handleFormSubmit = async (employeeData) => {
        try {
            if (editingEmployee) {
                await axios.put(`http://127.0.0.1:5000/employees/${editingEmployee.e_id}`, employeeData);
                alert('อัปเดตข้อมูลสำเร็จ!');
            } else {
                await axios.post('http://127.0.0.1:5000/employees', employeeData);
                alert('เพิ่มพนักงานใหม่สำเร็จ!');
            }
            closeModal();
            fetchEmployees();
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้'));
        }
    };

    if (loading) return <p>กำลังโหลดข้อมูลพนักงาน...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">จัดการพนักงาน</h1>
                <button onClick={openModalForNew} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2">
                    <Plus size={18} /> เพิ่มพนักงานใหม่
                </button>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">รหัส</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ตำแหน่ง</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">อีเมล</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">สิทธิ์ (Role)</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.e_id} className="hover:bg-gray-50">
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{emp.e_id}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{emp.e_name}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{emp.position}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{emp.e_email}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{emp.e_role}</td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center space-x-3">
                                    <button onClick={() => openModalForEdit(emp)} className="text-yellow-600 hover:text-yellow-900" title="แก้ไข">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(emp.e_id, emp.e_name)} className="text-red-600 hover:text-red-900" title="ลบ">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <EmployeeFormModal 
                    employee={editingEmployee}
                    onClose={closeModal}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
};

export default EmployeeDashboard;