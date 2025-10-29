import React, { useState, useEffect } from 'react';
import { Warehouse, Archive, Loader } from 'lucide-react';

// --- Component ใหม่: Progress Bar ที่สวยขึ้น ---
const ProgressBar = ({ value, capacity }) => {
    const percentage = capacity > 0 ? Math.min((value / capacity) * 100, 100) : 0;
    
    let colorClass = 'bg-green-500';
    if (percentage > 75) colorClass = 'bg-yellow-500';
    if (percentage > 90) colorClass = 'bg-red-500';

    return (
        <div>
            <div className="flex justify-between mb-1">
                {/* ★★★ FIX 1: Text Color for Quantity/Capacity ★★★ */}
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {value.toLocaleString('th-TH')} kg
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {capacity.toLocaleString('th-TH')} kg
                </span>
            </div>
            {/* ★★★ FIX 2: Progress Bar Track Color ★★★ */}
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="text-right mt-1">
                {/* ★★★ FIX 3: Percentage Text Color ★★★ */}
                <span className={`text-sm font-semibold ${percentage > 90 ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}>
                    {percentage.toFixed(1)}% full
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
                // Endpoint นี้ถูกสร้างขึ้นใหม่ใน routes.py เพื่อสรุปข้อมูล
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
        // ★★★ FIX 4: Main Page Background ★★★
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="text-center mb-8">
                {/* ★★★ FIX 5: Header Text Colors ★★★ */}
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">สรุปภาพรวมคลังสินค้า</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">ตรวจสอบปริมาณสินค้าคงคลังในแต่ละคลัง</p>
            </div>

            {loading ? (
                // ★★★ FIX 6: Loading State ★★★
                <div className="flex justify-center items-center p-16 text-gray-800 dark:text-gray-200">
                    <Loader className="animate-spin text-blue-500" size={48} />
                </div>
            ) : error ? (
                // ★★★ FIX 7: Error State Background and Text ★★★
                <div className="text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <p>{error}</p>
                </div>
            ) : summary.length === 0 ? (
                // ★★★ FIX 8: Empty State Background and Text ★★★
                <div className="text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg transition-colors duration-300">
                    <Archive size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold dark:text-gray-200">ไม่พบข้อมูลคลังสินค้า</h3>
                    <p>ยังไม่มีข้อมูลคลังสินค้าในระบบ</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {summary.map(warehouse => (
                        // ★★★ FIX 9: Warehouse Card Background and Shadow ★★★
                        <div key={warehouse.warehouse_id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="p-6 border-b-4 border-blue-500 rounded-t-2xl">
                                {/* ★★★ FIX 10: Card Title Text Color ★★★ */}
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                                    {/* ★★★ FIX 11: Icon Color ★★★ */}
                                    <Warehouse className="text-blue-600 dark:text-blue-400"/>
                                    <span>{warehouse.warehouse_name}</span>
                                </h2>
                                {/* ★★★ FIX 12: Location Text Color ★★★ */}
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{warehouse.location || 'ไม่ระบุที่ตั้ง'}</p>
                            </div>
                            <div className="p-6">
                                {/* ★★★ FIX 13: Sub-heading Text Color ★★★ */}
                                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">สถานะความจุ:</h3>
                                <ProgressBar value={warehouse.current_stock} capacity={warehouse.capacity} />
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm space-y-2">
                                     {/* ★★★ FIX 14: Info Text Colors ★★★ */}
                                     <div className="flex justify-between">
                                         <span className="text-gray-600 dark:text-gray-400">ปริมาณสินค้าปัจจุบัน:</span>
                                         <span className="font-semibold text-gray-800 dark:text-gray-100">{warehouse.current_stock.toLocaleString('th-TH', { maximumFractionDigits: 2 })} kg</span>
                                     </div>
                                     <div className="flex justify-between">
                                         <span className="text-gray-600 dark:text-gray-400">ความจุที่เหลือ:</span>
                                         {/* ★★★ FIX 15: Remaining Capacity Text Color ★★★ */}
                                         <span className="font-semibold text-green-600 dark:text-green-400">{warehouse.remaining_capacity.toLocaleString('th-TH', { maximumFractionDigits: 2 })} kg</span>
                                     </div>
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