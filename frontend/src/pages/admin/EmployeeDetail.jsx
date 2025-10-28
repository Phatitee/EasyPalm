import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Mail, Phone, Briefcase, Key, MapPin, Calendar, CheckCircle, XCircle, BadgeInfo, CalendarClock } from 'lucide-react';

const EmployeeDetail = () => {
    const { e_id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEmployeeDetail = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://127.0.0.1:5000/employees/${e_id}`);
                setEmployee(response.data);
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลพนักงานได้');
            } finally {
                setLoading(false);
            }
        };
        fetchEmployeeDetail();
    }, [e_id]);

    // --- Helper Function to Format Date & Time ---
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        try {
            // ★★★ FIX: Use toLocaleString to handle both date and time ★★★
            return new Date(dateString).toLocaleString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // Use 24-hour format
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // --- Detail Item Component ---
    const DetailItem = ({ icon: Icon, label, value, iconColor = "text-gray-500" }) => (
        <div className="flex items-start mb-4">
            {Icon && <Icon className={`w-5 h-5 ${iconColor} mr-4 mt-1 flex-shrink-0`} />}
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-base text-gray-800 break-words">{value || '-'}</p>
            </div>
        </div>
    );
    
    // --- Gender Icon Component ---
    const GenderIcon = ({ gender }) => {
        const iconClass = "w-5 h-5 mr-4 mt-1 flex-shrink-0";
        if (gender === 'Male') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconClass} text-blue-500`}><circle cx="12" cy="5" r="3"/><path d="M12 8v11"/><path d="m19 15-3-3"/><path d="m19 12-3 3"/></svg>;
        if (gender === 'Female') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconClass} text-pink-500`}><circle cx="12" cy="12" r="4"/><path d="M12 16v6"/><path d="M9 19h6"/></svg>;
        return <div className={iconClass}>🚻</div>;
    };

    if (loading) return <div className="text-center p-10">กำลังโหลด...</div>;
    if (error) return <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg">{error}</div>;
    if (!employee) return <div className="text-center p-10 text-gray-500">ไม่พบข้อมูลพนักงาน</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-700 mb-6 font-semibold transition-colors">
                <ArrowLeft size={18} /> กลับไปหน้าจัดการพนักงาน
            </button>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-6 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{employee.e_name}</h1>
                        <p className="text-lg text-gray-600 mt-1">{employee.position} ({employee.e_role})</p>
                    </div>
                    <div className={`px-4 py-1.5 mt-2 sm:mt-0 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 shadow-sm ${employee.is_active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                        {employee.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {employee.is_active ? 'Active' : 'Suspended'}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {/* Personal Info Column */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-5 border-b pb-2">ข้อมูลส่วนตัว</h2>
                        <DetailItem icon={User} label="รหัสพนักงาน" value={employee.e_id} />
                        <DetailItem icon={BadgeInfo} label="เลขบัตรประชาชน" value={employee.e_citizen_id_card} />
                        <div className="flex items-start mb-4">
                           <GenderIcon gender={employee.e_gender} />
                            <div>
                                <p className="text-sm font-medium text-gray-500">เพศ</p>
                                <p className="text-base text-gray-800 break-words">{employee.e_gender || '-'}</p>
                            </div>
                        </div>
                        <DetailItem icon={Mail} label="อีเมล" value={employee.e_email} />
                        <DetailItem icon={Phone} label="เบอร์โทรศัพท์" value={employee.e_tel} />
                    </div>

                    {/* Work Info Column */}
                     <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-5 border-b pb-2">ข้อมูลการทำงาน</h2>
                        <DetailItem icon={Briefcase} label="ตำแหน่ง" value={employee.position} />
                        <DetailItem icon={Key} label="สิทธิ์ (Role)" value={employee.e_role} />
                        <DetailItem icon={MapPin} label="ที่อยู่ปัจจุบัน" value={employee.e_address} />
                        {!employee.is_active && employee.suspension_date && (
                             <div className="mt-6 pt-4 border-t border-gray-200">
                                <DetailItem
                                    icon={CalendarClock}
                                    label="วันที่ระงับสิทธิ์"
                                    value={formatDateTime(employee.suspension_date)} // Use the corrected function here
                                    iconColor="text-red-500"
                                />
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetail;