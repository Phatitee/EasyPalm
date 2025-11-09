import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, ShoppingCart, Archive, Loader, ServerCrash, List } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => {
    const Icon = icon;
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 dark:bg-gray-800">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="text-white" size={32} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {typeof value === 'number' ? value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : value}
                </p>
            </div>
        </div>
    );
};

const ExecutiveDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('/api/executive/dashboard-summary', { cache: 'no-cache' });
                if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลสรุปได้');
                const data = await response.json();
                setSummary(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-500" size={48} /></div>;
    if (error) return <div className="flex flex-col justify-center items-center h-screen text-red-600 bg-red-50 p-10"><ServerCrash size={48} className="mb-4" /><h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>;

    const formattedChartData = summary.chart_data.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
    }));

    return (
        // ★★★ FIX: เพิ่ม dark:bg-gray-900 เพื่อให้พื้นหลังของหน้านี้เป็นสีเข้ม (Dark Mode) ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen dark:bg-gray-900">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">Executive Dashboard</h1>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="ยอดขายทั้งหมด" value={summary.kpis.total_revenue} icon={DollarSign} color="bg-green-500" />
                <StatCard title="กำไรขั้นต้น" value={summary.kpis.gross_profit} icon={TrendingUp} color="bg-blue-500" />
                <StatCard title="ยอดซื้อทั้งหมด" value={summary.kpis.total_purchase_cost} icon={ShoppingCart} color="bg-purple-500" />
                <StatCard title="มูลค่าสต็อกปัจจุบัน" value={summary.kpis.current_stock_value} icon={Archive} color="bg-orange-500" />
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 dark:bg-gray-800">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 dark:text-gray-200">ภาพรวมยอดขายและยอดซื้อ (30 วันล่าสุด)</h2>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <AreaChart data={formattedChartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} />
                            <Tooltip formatter={(value) => `${value.toLocaleString()} บาท`} />
                            <Legend />
                            <Area type="monotone" dataKey="sales" name="ยอดขาย" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                            <Area type="monotone" dataKey="purchases" name="ยอดซื้อ" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg dark:bg-gray-800">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center dark:text-gray-200"><List className="mr-2"/>รายการขายล่าสุด</h2>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {summary.recent_sales.map(order => (
                            <li key={order.sale_order_number} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold dark:text-gray-100">{order.sale_order_number} - <span className="font-normal text-gray-600 dark:text-gray-400">{order.customer_name}</span></p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">{new Date(order.s_date).toLocaleDateString('th-TH')}</p>
                                </div>
                                <p className="font-semibold text-green-600">{parseFloat(order.s_total_price).toLocaleString('th-TH')} บ.</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg dark:bg-gray-800">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center dark:text-gray-200"><List className="mr-2"/>รายการซื้อล่าสุด</h2>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {summary.recent_purchases.map(order => (
                            <li key={order.purchase_order_number} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold dark:text-gray-100">{order.purchase_order_number} - <span className="font-normal text-gray-600 dark:text-gray-400">{order.farmer_name}</span></p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">{new Date(order.b_date).toLocaleDateString('th-TH')}</p>
                                </div>
                                <p className="font-semibold text-purple-600">{parseFloat(order.b_total_price).toLocaleString('th-TH')} บ.</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;