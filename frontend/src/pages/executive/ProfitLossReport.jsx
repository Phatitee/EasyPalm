import React, { useState } from 'react';
import { BarChart, DollarSign, TrendingUp, TrendingDown, ArrowRight, Loader, ServerCrash } from 'lucide-react';

const ReportCard = ({ title, value, icon, color }) => {
    const Icon = icon;
    const isProfit = title === 'กำไรขั้นต้น';
    const profitColor = value >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="text-white" size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className={`text-2xl font-bold ${isProfit ? profitColor : 'text-gray-800'}`}>
                        {value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                    </p>
                </div>
            </div>
        </div>
    );
};


const ProfitLossReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            setError('กรุณาเลือกทั้งวันที่เริ่มต้นและวันที่สิ้นสุด');
            return;
        }
        setLoading(true);
        setError('');
        setReportData(null);
        try {
            const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
            const response = await fetch(`http://localhost:5000/reports/profit-loss?${params.toString()}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'ไม่สามารถสร้างรายงานได้');
            }
            setReportData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <BarChart className="mr-3 text-blue-600"/>
                รายงานกำไร-ขาดทุน
            </h1>

            {/* Date Picker Section */}
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">เลือกช่วงวันที่</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ArrowRight className="text-gray-400 hidden md:block" />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        onClick={handleGenerateReport}
                        disabled={loading}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                        {loading ? <Loader className="animate-spin" size={20}/> : 'สร้างรายงาน'}
                    </button>
                </div>
            </div>

            {/* Report Display Section */}
            {loading && (
                <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>
            )}
            
            {reportData && (
                <div className="animate-fade-in-down">
                     <p className="text-center text-gray-600 mb-4">
                        ผลประกอบการระหว่างวันที่ {new Date(reportData.start_date).toLocaleDateString('th-TH')} ถึง {new Date(reportData.end_date).toLocaleDateString('th-TH')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ReportCard title="รายรับรวม" value={reportData.total_revenue} icon={DollarSign} color="bg-green-500" />
                        <ReportCard title="ต้นทุนขาย (COGS)" value={reportData.total_cogs} icon={TrendingDown} color="bg-orange-500" />
                        <ReportCard title="กำไรขั้นต้น" value={reportData.gross_profit} icon={TrendingUp} color="bg-blue-500" />
                    </div>
                </div>
            )}

            {!loading && !reportData && (
                 <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <p className="text-gray-500">กรุณาเลือกช่วงวันที่ที่ต้องการเพื่อดูรายงาน</p>
                </div>
            )}
        </div>
    );
};

export default ProfitLossReport;