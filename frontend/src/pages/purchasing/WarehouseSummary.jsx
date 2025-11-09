import React, { useState, useEffect } from 'react';
import { Warehouse, Archive, Loader, Package } from 'lucide-react'; // (เพิ่ม Package icon)

// --- Component: Progress Bar (เหมือนเดิม) ---
const ProgressBar = ({ value, capacity }) => {
    const percentage = capacity > 0 ? Math.min((value / capacity) * 100, 100) : 0;
    
    let colorClass = 'bg-green-500';
    if (percentage > 75) colorClass = 'bg-yellow-500';
    if (percentage > 90) colorClass = 'bg-red-500';

    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {value.toLocaleString('th-TH')} kg
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {capacity.toLocaleString('th-TH')} kg
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="text-right mt-1">
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
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">สรุปภาพรวมคลังสินค้า</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">ตรวจสอบปริมาณสินค้าคงคลังในแต่ละคลัง</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center p-16 text-gray-800 dark:text-gray-200">
                    <Loader className="animate-spin text-blue-500" size={48} />
                </div>
            ) : error ? (
                <div className="text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <p>{error}</p>
                </div>
            ) : summary.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg transition-colors duration-300">
                    <Archive size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold dark:text-gray-200">ไม่พบข้อมูลคลังสินค้า</h3>
                    <p>ยังไม่มีข้อมูลคลังสินค้าในระบบ</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {summary.map(warehouse => (
                        <div key={warehouse.warehouse_id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                            {/* --- ส่วนหัวการ์ด (Header) --- */}
                            <div className="p-6 border-b-4 border-blue-500 rounded-t-2xl">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                                    <Warehouse className="text-blue-600 dark:text-blue-400"/>
                                    <span>{warehouse.warehouse_name}</span>
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{warehouse.location || 'ไม่ระบุที่ตั้ง'}</p>
                            </div>
                            
                            {/* --- ส่วนสรุปความจุ (Capacity Summary) --- */}
                            <div className="p-6">
                                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">สถานะความจุ:</h3>
                                <ProgressBar value={warehouse.current_stock} capacity={warehouse.capacity} />
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">ปริมาณสินค้าปัจจุบัน:</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-100">{warehouse.current_stock.toLocaleString('th-TH', { maximumFractionDigits: 2 })} kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">ความจุที่เหลือ:</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">{warehouse.remaining_capacity.toLocaleString('th-TH', { maximumFractionDigits: 2 })} kg</span>
                                    </div>
                                </div>
                            </div>

                            {/* --- ( ★★★ ส่วนที่เพิ่มเข้ามา: รายการสินค้า ★★★ ) --- */}
                            <div className="p-6 pt-0 flex-grow">
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <Package size={18} className="text-gray-500 dark:text-gray-400" />
                                        สินค้าในคลัง:
                                    </h4>
                                    
                                    {/* ตรวจสอบว่ามีรายการสินค้าหรือไม่ */}
                                    {warehouse.product_breakdown && warehouse.product_breakdown.length > 0 ? (
                                        // (เพิ่ม max-h-40 และ overflow-y-auto เพื่อให้ scroll ได้ถ้ารายการยาว)
                                        <ul className="text-sm space-y-2 max-h-40 overflow-y-auto pr-2">
                                            {/* วน Loop แสดงรายการสินค้า */}
                                            {warehouse.product_breakdown.map((item, index) => (
                                                <li key={index} className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400 truncate pr-2" title={item.product_name}>
                                                        {item.product_name}
                                                    </span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
                                                        {item.quantity.toLocaleString('th-TH', { maximumFractionDigits: 2 })} kg
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        // กรณีไม่มีสินค้าในคลัง
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
                                            (ไม่มีสินค้าในคลังนี้)
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* --- ( ★★★ จบส่วนที่เพิ่มเข้ามา ★★★ ) --- */}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WarehouseSummary;