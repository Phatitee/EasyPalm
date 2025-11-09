import React, { useState, useEffect } from 'react';
import { Warehouse, Archive, Loader, Package } from 'lucide-react'; // (เพิ่ม Package icon)

// --- Component: Progress Bar (เหมือนเดิม) ---
const ProgressBar = ({ value, capacity }) => {
    const percentage = capacity > 0 ? Math.min((value / capacity) * 100, 100) : 0;
    
    let progressClasses = 'bg-gradient-to-r from-green-400 to-green-500';
    let statusClasses = 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    
    if (percentage > 75) {
        progressClasses = 'bg-gradient-to-r from-yellow-400 to-yellow-500';
        statusClasses = 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
    if (percentage > 90) {
        progressClasses = 'bg-gradient-to-r from-red-400 to-red-500';
        statusClasses = 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }

    return (
        <div className="relative">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 px-3 py-1 rounded-lg">
                    {value.toLocaleString('th-TH')} kg
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 px-3 py-1 rounded-lg">
                    {capacity.toLocaleString('th-TH')} kg
                </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                <div
                    className={`h-3 rounded-full ${progressClasses} transition-all duration-500 ease-out shadow-sm`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-end mt-2">
                <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${statusClasses}`}>
                    {percentage.toFixed(1)}% เต็ม
                </span>
            </div>
        </div>
    );
};


const WarehouseSummary = () => {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                // Endpoint นี้จะดึงข้อมูล (รวมถึง product_breakdown ที่เราเพิ่มใน backend)
                const response = await fetch('http://127.0.0.1:5000/purchasing/warehouse-summary');
                if (!response.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลสรุปคลังสินค้าได้');
                }
                const data = await response.json();
                setSummary(data);
                setError(null);
            } catch (error) {
                console.error("Error fetching warehouse summary:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-300">
            <div className="text-center mb-12">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transform hover:scale-[1.02] transition-all duration-300 mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                        สรุปภาพรวมคลังสินค้า
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-3">
                        ตรวจสอบปริมาณสินค้าคงคลังในแต่ละคลัง
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center p-16 bg-white dark:bg-gray-800 rounded-3xl shadow-lg">
                    <Loader className="animate-spin text-blue-500 mb-4" size={48} />
                    <p className="text-lg text-gray-600 dark:text-gray-300">กำลังโหลดข้อมูล...</p>
                </div>
            ) : error ? (
                <div className="text-center bg-red-50 dark:bg-gray-800 p-8 rounded-3xl shadow-lg border-2 border-red-200 dark:border-red-800">
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-2xl p-6">
                        <p className="text-red-600 dark:text-red-400 text-lg font-medium">{error}</p>
                    </div>
                </div>
            ) : summary.length === 0 ? (
                <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-8">
                        <Archive size={64} className="mx-auto text-gray-400 dark:text-gray-500 mb-6" />
                        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">ไม่พบข้อมูลคลังสินค้า</h3>
                        <p className="text-gray-500 dark:text-gray-400">ยังไม่มีข้อมูลคลังสินค้าในระบบ</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {summary.map(warehouse => (
                        <div key={warehouse.warehouse_id} 
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col transform hover:scale-[1.02] border border-gray-100 dark:border-gray-700">
                            {/* --- ส่วนหัวการ์ด (Header) --- */}
                            <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-t-3xl border-b border-blue-200 dark:border-blue-800">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                                    <Warehouse className="text-blue-600 dark:text-blue-400" size={28}/>
                                    <span>{warehouse.warehouse_name}</span>
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                    {warehouse.location || 'ไม่ระบุที่ตั้ง'}
                                </p>
                            </div>
                            
                            {/* --- ส่วนสรุปความจุ (Capacity Summary) --- */}
                            <div className="p-8">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                    <Archive className="text-blue-500" size={20} />
                                    สถานะความจุ
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                                    <ProgressBar value={warehouse.current_stock} capacity={warehouse.capacity} />
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-sm space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">ปริมาณสินค้าปัจจุบัน:</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 px-3 py-1 rounded-lg">
                                                {warehouse.current_stock.toLocaleString('th-TH', { maximumFractionDigits: 2 })} kg
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">ความจุที่เหลือ:</span>
                                            <span className="font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-lg">
                                                {warehouse.remaining_capacity.toLocaleString('th-TH', { maximumFractionDigits: 2 })} kg
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- ส่วนรายการสินค้า --- */}
                            <div className="p-8 pt-0 flex-grow">
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                        <Package size={20} className="text-blue-500" />
                                        สินค้าในคลัง
                                    </h4>
                                    
                                    {warehouse.product_breakdown && warehouse.product_breakdown.length > 0 ? (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                                            <ul className="text-sm space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                                {warehouse.product_breakdown.map((item, index) => (
                                                    <li key={index} className="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded-xl hover:shadow-md transition-shadow duration-200">
                                                        <span className="text-gray-700 dark:text-gray-300 truncate pr-2 font-medium" title={item.product_name}>
                                                            {item.product_name}
                                                        </span>
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg whitespace-nowrap">
                                                            {item.quantity.toLocaleString('th-TH', { maximumFractionDigits: 2 })} kg
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 text-center">
                                            <Package size={32} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                ไม่มีสินค้าในคลังนี้
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WarehouseSummary;