// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, Tractor, DollarSign } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Component การ์ดแสดงผล ---
const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
        <div className="flex items-center">
            <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
);


// --- Component หลัก ---
const AdminDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/admin/dashboard-summary');
                setSummary(response.data);
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลภาพรวมได้');
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    // --- เตรียมข้อมูลสำหรับกราฟ ---
    const chartLabels = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = {
        labels: chartLabels.map(d => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })),
        datasets: [
            {
                label: 'ยอดซื้อ (บาท)',
                data: chartLabels.map(date => summary?.purchase_chart_data[date] || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
        ],
    };

    if (loading) return <p>กำลังโหลดภาพรวม...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!summary) return <p>ไม่พบข้อมูล</p>;

    const { key_metrics, recent_purchases } = summary;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">ภาพรวมระบบ</h1>

            {/* การ์ดสรุปข้อมูล */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="ยอดซื้อวันนี้" value={`${key_metrics.purchase_today.toFixed(2)} ฿`} icon={<DollarSign />} color="green" />
                <StatCard title="รายการรอจ่ายเงิน" value={key_metrics.pending_payments} icon={<FileText />} color="orange" />
                <StatCard title="จำนวนพนักงาน" value={key_metrics.employee_count} icon={<Users />} color="blue" />
                <StatCard title="จำนวนเกษตรกร" value={key_metrics.farmer_count} icon={<Tractor />} color="teal" />
            </div>

            {/* กราฟ และ รายการล่าสุด */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="font-bold mb-4">ยอดซื้อ 7 วันล่าสุด</h2>
                    <Bar data={chartData} options={{ responsive: true }} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="font-bold mb-4">รายการรับซื้อล่าสุด</h2>
                    <ul className="space-y-3">
                        {recent_purchases.map(order => (
                            <li key={order.purchase_order_number} className="flex justify-between text-sm border-b pb-2">
                                <div>
                                    <p className="font-semibold">{order.purchase_order_number}</p>
                                    <p className="text-xs text-gray-500">{order.farmer_name}</p>
                                </div>
                                <p className="font-bold">{order.b_total_price.toFixed(2)} ฿</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;