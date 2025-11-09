import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, UserX, UserCheck, Search, ShieldCheck, ShieldX, MoreVertical, Building, UserCircle, Mail, Phone, AlertTriangle,XCircle, CheckCircle as CheckCircleIcon } from 'lucide-react';

//================================================================================
//  1. Reusable UI Components (DARK MODE FIXES)
//================================================================================

const StatCard = ({ title, value, icon }) => (
    // ★★★ Dark Mode FIX: Card Background, Border, and Text ★★★
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg dark:bg-blue-800 dark:text-blue-200">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

// ConfirmDialog (Modal)
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        // Dark Mode FIX: Overlay
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
            {/* Dark Mode FIX: Modal Container Background and Text */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm transform transition-all animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                    {/* Dark Mode FIX: Cancel Button Styling */}
                    <button onClick={onClose} type="button" className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">ยกเลิก</button>
                    <button onClick={onConfirm} type="button" className="w-full px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700">ยืนยัน</button>
                </div>
            </div>
        </div>
    );
};

// ResultDialog (Modal)
const ResultDialog = ({ isOpen, onClose, type, message }) => {
    if (!isOpen) return null;
    const isSuccess = type === 'success';
    return (
        // Dark Mode FIX: Overlay
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
             {/* Dark Mode FIX: Modal Container Background and Text */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm text-center transform transition-all animate-fade-in-up">
                 <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isSuccess ? <CheckCircleIcon className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                </div>
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{isSuccess ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="mt-6">
                    <button onClick={onClose} type="button" className={`w-full px-4 py-2 text-white rounded-md font-semibold ${isSuccess ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>ตกลง</button>
                </div>
            </div>
        </div>
    );
}


const EmployeeFormModal = ({ employee, onClose, onSubmit }) => {
    // ... (This component's code remains the same as before) ...
    const isEditMode = !!employee;
    const [formData, setFormData] = useState({
        e_name: employee?.e_name || '',
        position: employee?.position || '',
        e_role: employee?.e_role || 'sales',
        e_email: employee?.e_email || '',
        e_tel: employee?.e_tel || '',
        username: employee?.username || '',
        password: '',
        e_citizen_id_card: employee?.e_citizen_id_card || '',
        e_gender: employee?.e_gender || 'Male',
        e_address: employee?.e_address || '',
    });

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSend = { ...formData };
        if (isEditMode && !dataToSend.password) delete dataToSend.password;
        onSubmit(dataToSend);
    };

    return (
        // Dark Mode FIX: Overlay
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-start z-40 p-4 overflow-y-auto">
            {/* Dark Mode FIX: Modal Container Background */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl my-8">
                {/* Dark Mode FIX: Modal Title Text Color */}
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{isEditMode ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="ชื่อ-นามสกุล" name="e_name" value={formData.e_name} onChange={handleChange} required />
                        <InputField label="ตำแหน่ง" name="position" value={formData.position} onChange={handleChange} required />
                        <InputField label="เลขบัตรประชาชน" name="e_citizen_id_card" value={formData.e_citizen_id_card} onChange={handleChange} required disabled={isEditMode} />
                        <SelectField label="เพศ" name="e_gender" value={formData.e_gender} onChange={handleChange}>
                            <option value="Male">ชาย</option>
                            <option value="Female">หญิง</option>
                        </SelectField>
                        <InputField label="อีเมล" name="e_email" type="email" value={formData.e_email} onChange={handleChange} />
                        <InputField label="เบอร์โทร" name="e_tel" value={formData.e_tel} onChange={handleChange} />
                    </div>
                    {/* Dark Mode FIX: Horizontal Rule Color */}
                    <hr className="my-4 border-gray-200 dark:border-gray-700"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <SelectField label="สิทธิ์ (Role)" name="e_role" value={formData.e_role} onChange={handleChange} required>
                            <option value="admin">Admin</option>
                            <option value="purchasing">Purchasing</option>
                            <option value="warehouse">Warehouse</option>
                            <option value="sales">Sales</option>
                            <option value="accountant">Accountant</option>
                            <option value="executive">Executive</option>
                        </SelectField>
                        <InputField label="Username" name="username" value={formData.username} onChange={handleChange} required disabled={isEditMode} />
                        <InputField label={isEditMode ? "ตั้งรหัสผ่านใหม่" : "รหัสผ่าน"} name="password" type="password" value={formData.password} onChange={handleChange} required={!isEditMode} placeholder={isEditMode ? "เว้นว่างไว้หากไม่ต้องการเปลี่ยน" : ""} />
                    </div>
                     <div className="mt-8 flex justify-end space-x-3">
                        {/* Dark Mode FIX: Cancel Button Styling */}
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">ยกเลิก</button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">{isEditMode ? 'บันทึก' : 'สร้างพนักงาน'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Helper Input Components ---
const InputField = ({ label, ...props }) => (
    <div>
        {/* Dark Mode FIX: Label Text Color */}
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}{props.required && ' *'}</label>
        {/* Dark Mode FIX: Input Field Styling */}
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100
                                       dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:disabled:bg-gray-600 dark:disabled:text-gray-400" />
    </div>
);
const SelectField = ({ label, children, ...props }) => (
     <div>
         {/* Dark Mode FIX: Label Text Color */}
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}{props.required && ' *'}</label>
         {/* Dark Mode FIX: Select Field Styling */}
        <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
                                      dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
            {children}
        </select>
    </div>
);

// --- FilterButton Component ---
const FilterButton = ({ active, children, ...props }) => (
    // ★★★ Dark Mode FIX: Filter Button Styling ★★★
    <button {...props} className={`px-4 py-2 rounded-lg text-sm font-semibold w-full transition ${active ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>
        {children}
    </button>
);

// --- EmployeeCard Component ---
const EmployeeCard = ({ emp, onDoubleClick, onEdit, onAction }) => {
     const [menuOpen, setMenuOpen] = useState(false);
    return (
        // ★★★ Dark Mode FIX: Card Background, Border, and Hover State ★★★
        <div onDoubleClick={onDoubleClick} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer" title="ดับเบิลคลิกเพื่อดูรายละเอียด">
            <div>
                <div className="flex justify-between items-start">
                    {/* Status Chip uses fixed light colors - OK */}
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${emp.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {emp.is_active ? 'Active' : 'Suspended'}
                    </span>
                    <div className="relative">
                         {/* Dark Mode FIX: Menu Button Color and Hover */}
                         <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} onBlur={() => setTimeout(() => setMenuOpen(false), 150)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 dark:hover:bg-gray-700 dark:text-gray-400">
                            <MoreVertical size={20} />
                        </button>
                        {menuOpen && (
                            // Dark Mode FIX: Dropdown Menu Background and Border
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                                {/* Dark Mode FIX: Dropdown Item Text and Hover */}
                                <a onClick={(e) => { e.stopPropagation(); onEdit(); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer dark:text-gray-200 dark:hover:bg-gray-600"><Edit size={16}/> แก้ไข</a>
                                <a onClick={(e) => { e.stopPropagation(); onAction('suspend', emp); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer dark:text-gray-200 dark:hover:bg-gray-600">
                                    {emp.is_active ? <UserX size={16}/> : <UserCheck size={16}/>} {emp.is_active ? 'ระงับสิทธิ์' : 'ยกเลิกการระงับ'}
                                </a>
                                {/* Dark Mode FIX: Delete Item Color and Hover */}
                                <a onClick={(e) => { e.stopPropagation(); onAction('delete', emp); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer dark:hover:bg-red-900/50"><Trash2 size={16}/> ลบ</a>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-center my-4">
                    {/* Dark Mode FIX: Name Text Color */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{emp.e_name}</h3>
                    {/* Dark Mode FIX: ID Text Color */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">{emp.e_id}</p>
                </div>
                 {/* Dark Mode FIX: Info Text Color and Icon Color */}
                 <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p className="flex items-center gap-2"><Building size={16} className="text-gray-400 dark:text-gray-500"/> {emp.position}</p>
                    <p className="flex items-center gap-2"><Mail size={16} className="text-gray-400 dark:text-gray-500"/> {emp.e_email || '-'}</p>
                    <p className="flex items-center gap-2"><Phone size={16} className="text-gray-400 dark:text-gray-500"/> {emp.e_tel || '-'}</p>
                </div>
            </div>
        </div>
    );
};

//================================================================================
//  2. Main Employee Management Component
//================================================================================

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    // ★★★ State for Dialogs ★★★
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [resultDialog, setResultDialog] = useState({ isOpen: false, type: 'success', message: '' });


    // --- Data Fetching ---
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:5000/employees');
            setEmployees(response.data);
            setError('');
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลพนักงานได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchEmployees(); }, []);

    // --- Filtering and Memoization ---
    const filteredEmployees = useMemo(() => {
        return employees
            .filter(emp => {
                if (statusFilter === 'all') return true;
                return statusFilter === 'active' ? emp.is_active : !emp.is_active;
            })
            .filter(emp =>
                emp.e_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.e_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.position.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [employees, searchTerm, statusFilter]);

    // ★★★ UPDATED: Uses ConfirmDialog instead of window.confirm ★★★
    const handleAction = (action, employee) => {
        const { e_id, e_name, is_active } = employee;
        let config = {};

        switch (action) {
            case 'suspend':
                const actionText = is_active ? 'ระงับสิทธิ์' : 'ยกเลิกการระงับ';
                config = {
                    title: `ยืนยันการ${actionText}`,
                    message: `คุณต้องการ${actionText}พนักงาน "${e_name}" ใช่หรือไม่?`,
                    onConfirm: async () => {
                        const url = `http://127.0.0.1:5000/employees/${e_id}/${is_active ? 'suspend' : 'unsuspend'}`;
                        await axios.put(url);
                        setResultDialog({ isOpen: true, type: 'success', message: `${actionText}สำเร็จ!` });
                        fetchEmployees();
                    }
                };
                break;
            case 'delete':
                config = {
                    title: 'ยืนยันการลบ',
                    message: `คุณต้องการลบพนักงาน "${e_name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
                    onConfirm: async () => {
                        await axios.delete(`http://127.0.0.1:5000/employees/${e_id}`);
                        setResultDialog({ isOpen: true, type: 'success', message: 'ลบพนักงานสำเร็จ!' });
                        fetchEmployees();
                    }
                };
                break;
            default: return;
        }

        setConfirmDialog({
            isOpen: true,
            ...config,
            onClose: () => setConfirmDialog({ isOpen: false })
        });
    };
    
    // ★★★ UPDATED: Uses ResultDialog instead of alert ★★★
    const handleFormSubmit = async (data) => {
        
        // --- ★★★ START: เพิ่มส่วนการตรวจสอบข้อมูล (Validation) ★★★ ---
        try {
            // 1. ชื่อ-นามสกุล: ต้องไม่มีตัวเลข
            if (/\d/.test(data.e_name)) {
                throw new Error("ชื่อ-นามสกุล ต้องไม่มีตัวเลข");
            }
            // 2. ตำแหน่ง: ต้องไม่มีตัวเลข
            if (/\d/.test(data.position)) {
                throw new Error("ตำแหน่ง ต้องไม่มีตัวเลข");
            }

            // 3. เลขบัตรประชาชน: ต้องเป็นตัวเลข 13 หลัก (ตรวจสอบเฉพาะตอน "สร้างใหม่" เพราะตอนแก้ไขจะ disable ช่องนี้)
            if (!editingEmployee && !/^[0-9]{13}$/.test(data.e_citizen_id_card)) {
                throw new Error("เลขบัตรประชาชน ต้องเป็นตัวเลข 13 หลักพอดี");
            }

            // 4. เบอร์โทร: ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0 (อนุญาตให้เว้นว่างได้)
            if (data.e_tel && !/^0[0-9]{9}$/.test(data.e_tel)) {
                throw new Error("เบอร์โทร (หากป้อน) ต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0");
            }

            // 5. Username: ต้องเป็นภาษาอังกฤษ/ตัวเลข (ตรวจสอบเฉพาะตอน "สร้างใหม่")
            if (!editingEmployee && !/^[a-zA-Z0-9_]+$/.test(data.username)) {
                throw new Error("Username ต้องเป็นภาษาอังกฤษ, ตัวเลข หรือเครื่องหมาย _ เท่านั้น");
            }

            // 6. รหัสผ่าน: ต้องมี 8 ตัวอักษรพอดี
            if (editingEmployee) {
                // โหมดแก้ไข: ถ้าป้อนรหัสใหม่ (ไม่เว้นว่าง) ต้องมี 8 ตัว
                if (data.password && data.password.length !== 8) {
                    throw new Error("รหัสผ่านใหม่ (หากป้อน) ต้องมี 8 ตัวอักษรพอดี");
                }
            } else {
                // โหมดสร้างใหม่: รหัสผ่านจำเป็นต้องมี 8 ตัว
                if (!data.password || data.password.length !== 8) {
                    throw new Error("รหัสผ่าน ต้องมี 8 ตัวอักษรพอดี");
                }
            }

        } catch (validationError) {
            // หากมีข้อผิดพลาด, ให้แสดงใน ResultDialog และหยุดการทำงาน
            setResultDialog({ isOpen: true, type: 'error', message: validationError.message });
            return; 
        }
        // --- ★★★ END: สิ้นสุดส่วนการตรวจสอบข้อมูล ★★★ ---


        const method = editingEmployee ? 'put' : 'post';
        const url = editingEmployee ? `http://127.0.0.1:5000/employees/${editingEmployee.e_id}` : 'http://127.0.0.1:5000/employees';
        try {
            await axios({ method, url, data });
            setIsModalOpen(false);
            setResultDialog({ isOpen: true, type: 'success', message: editingEmployee ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มพนักงานใหม่สำเร็จ!' });
            fetchEmployees();
        } catch (err) {
            // Don't close the form on error
            setResultDialog({ isOpen: true, type: 'error', message: err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้' });
        }
    };
    
    const openModal = (employee = null) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    if (loading) return (
        // Dark Mode FIX: Loading State
        <div className="text-center p-10 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">กำลังโหลดข้อมูล...</div>
    );
    if (error) return (
        // Dark Mode FIX: Error State
        <div className="text-center p-10 text-red-500 dark:text-red-400 bg-red-50 dark:bg-gray-800 rounded-lg min-h-screen">{error}</div>
    );

    const activeCount = employees.filter(e => e.is_active).length;

    return (
        // ★★★ Dark Mode FIX: Main Page Background ★★★
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <ConfirmDialog {...confirmDialog} onConfirm={() => {
                confirmDialog.onConfirm().catch(err => {
                     setResultDialog({ isOpen: true, type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
                });
                setConfirmDialog({ isOpen: false });
            }}/>
            <ResultDialog {...resultDialog} onClose={() => setResultDialog({ isOpen: false })} />

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    {/* ★★★ Dark Mode FIX: Header Text Colors ★★★ */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">จัดการพนักงาน</h1>
                    <p className="mt-1 text-md text-gray-600 dark:text-gray-400">เพิ่ม, แก้ไข, และจัดการข้อมูลพนักงานในระบบ</p>
                </div>
                <button onClick={() => openModal()} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg inline-flex items-center justify-center gap-2 shadow hover:shadow-md transition">
                    <Plus size={20} /> เพิ่มพนักงานใหม่
                </button>
            </header>

            {/* Stat Cards - Handled by component styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard title="พนักงานทั้งหมด" value={employees.length} icon={<UserCircle size={24} />} />
                <StatCard title="พนักงานที่ใช้งาน" value={activeCount} icon={<ShieldCheck size={24} />} />
                <StatCard title="พนักงานที่ถูกระงับ" value={employees.length - activeCount} icon={<ShieldX size={24} />} />
            </div>

            {/* ★★★ Dark Mode FIX: Search/Filter Panel Background ★★★ */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:w-2/3 lg:w-1/2">
                    {/* Dark Mode FIX: Search Icon Color */}
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20}/>
                    <input type="text" placeholder="ค้นหาพนักงาน (ชื่อ, รหัส, ตำแหน่ง)..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        // ★★★ Dark Mode FIX: Search Input Styling ★★★
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"/>
                </div>
                 <div className="flex w-full sm:w-auto gap-2">
                    {/* Filter Buttons - Handled by component styling */}
                    <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>ทั้งหมด</FilterButton>
                    <FilterButton active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>Active</FilterButton>
                    <FilterButton active={statusFilter === 'suspended'} onClick={() => setStatusFilter('suspended')}>Suspended</FilterButton>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {filteredEmployees.length > 0 ? (
                    // Employee Card is handled by the component styling
                    filteredEmployees.map(emp => (
                        <EmployeeCard key={emp.e_id} emp={emp} onDoubleClick={() => navigate(`/admin/employees/${emp.e_id}`)}
                            onEdit={() => openModal(emp)}
                            onAction={handleAction}
                        />
                    ))
                ) : (
                    // ★★★ Dark Mode FIX: No Data Text Color ★★★
                    (
                        <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                            <p className="text-lg">ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไข</p>
                        </div>
                    )
                )}
            </div>
            {/* Modals are styled in their respective component definitions */}
            {isModalOpen && <EmployeeFormModal employee={editingEmployee} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} />}
        </div>
    );
};

export default EmployeeManagement;