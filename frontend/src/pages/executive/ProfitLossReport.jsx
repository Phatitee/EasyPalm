import React, { useState } from 'react';
import { BarChart, DollarSign, TrendingUp, TrendingDown, ArrowRight, Loader, ServerCrash } from 'lucide-react';

const ReportCard = ({ title, value, icon, color }) => {
    const Icon = icon;
    const isProfit = title === 'กำไรขั้นต้น';
    // กำหนดสีตามผลกำไร/ขาดทุน
    const profitColor = value >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        // ★★★ FIX 1: กำหนดสีพื้นหลัง Card ใน Dark Mode ★★★
        <div className="bg-white p-6 rounded-2xl shadow-lg dark:bg-gray-800 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="text-white" size={24} />
                </div>
                <div>
                    {/* ★★★ FIX 2: กำหนดสี Text ทั่วไปใน Dark Mode ★★★ */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p> 
                    {/* ★★★ FIX 3: กำหนดสี Text ตัวหนาหลักใน Dark Mode (ใช้ text-gray-100 ยกเว้นกรณีเป็นกำไร/ขาดทุน) ★★★ */}
                    <p className={`text-2xl font-bold ${isProfit ? profitColor : 'text-gray-800 dark:text-gray-100'}`}>
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

        // ★★★ เพิ่ม: ตรวจสอบว่าวันที่เริ่มต้นไม่ได้อยู่หลังวันที่สิ้นสุด
        if (new Date(startDate) > new Date(endDate)) {
            setError('วันที่เริ่มต้นต้องมาก่อนหรือเป็นวันเดียวกับวันที่สิ้นสุด');
            return;
        }
        // ★★★ สิ้นสุดการเพิ่ม

        setLoading(true);
        setError('');
        setReportData(null);
        try {
            const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
            const response = await fetch(`/api/reports/profit-loss?${params.toString()}`);
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
        // ★★★ FIX 4: พื้นหลังหน้าหลักและสี Text Default ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center dark:text-gray-100">
                {/* ★★★ FIX 5: ปรับสี Icon ใน Dark Mode ★★★ */}
                <BarChart className="mr-3 text-blue-600 dark:text-blue-400"/>
                รายงานกำไร-ขาดทุน
            </h1>

            {/* Date Picker Section */}
            {/* ★★★ FIX 6: พื้นหลังและเงาของ Date Picker Panel ★★★ */}
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg dark:bg-gray-800 transition-colors duration-300">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 dark:text-gray-200">เลือกช่วงวันที่</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={endDate || ''} // ★★★ เพิ่ม: วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด
                        // ★★★ FIX 7: ปรับ Input Fields ให้รองรับ Dark Mode ★★★
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 
                                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                    {/* ★★★ FIX 8: ปรับสี Arrow Icon ★★★ */}
                    <ArrowRight className="text-gray-400 hidden md:block dark:text-gray-500" />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || ''} // ★★★ เพิ่ม: วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น
                        // ★★★ FIX 7: ปรับ Input Fields ให้รองรับ Dark Mode ★★★
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500
                                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
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
                     {/* ★★★ FIX 9: ปรับสี Text ของ Date Range ★★★ */}
                     <p className="text-center text-gray-600 mb-4 dark:text-gray-300">
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
                 // ★★★ FIX 10: พื้นหลังและสี Text ของ Empty State ★★★
                 <div className="text-center py-20 bg-white rounded-2xl shadow-lg dark:bg-gray-800 transition-colors duration-300">
                    <p className="text-gray-500 dark:text-gray-400">กรุณาเลือกช่วงวันที่ที่ต้องการเพื่อดูรายงาน</p>
                </div>
            )}
        </div>
    );
};

export default ProfitLossReport;