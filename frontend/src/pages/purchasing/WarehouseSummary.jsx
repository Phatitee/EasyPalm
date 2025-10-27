import React, { useState, useEffect } from 'react';
import { CircleStackIcon } from '@heroicons/react/24/outline';

// Component สำหรับแสดงแถบสถานะ (Progress Bar)
const ProgressBar = ({ value, capacity }) => {
    const percentage = capacity > 0 ? (value / capacity) * 100 : 0;
    let bgColor = 'bg-green-500';
    if (percentage > 75) bgColor = 'bg-yellow-500';
    if (percentage > 90) bgColor = 'bg-red-500';

    return (
        <div className="w-full bg-gray-200 rounded-full h-6">
            <div 
                className={`h-6 rounded-full ${bgColor} transition-all duration-500`} 
                style={{ width: `${percentage}%` }}
            >
                <span className="text-xs font-medium text-white px-2">{percentage.toFixed(1)}%</span>
            </div>
        </div>
    );
};

const WarehouseSummary = () => {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/purchasing/warehouse-summary');
                const data = await response.json();
                setSummary(data);
            } catch (error) {
                console.error("Error fetching warehouse summary:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) {
        return <div className="p-6 text-center">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">สรุปภาพรวมคลังสินค้า</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summary.length === 0 ? (
                    <p className="text-gray-500">ไม่พบข้อมูลคลังสินค้า</p>
                ) : (
                    summary.map(warehouse => (
                        <div key={warehouse.warehouse_id} className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <CircleStackIcon className="w-6 h-6 mr-2 text-blue-600"/>
                                {warehouse.warehouse_name} ({warehouse.warehouse_id})
                            </h2>
                            <div className="space-y-3">
                                <ProgressBar value={warehouse.current_stock} capacity={warehouse.capacity} />
                                <div className="text-sm text-gray-600">
                                    <p>
                                        <span className="font-medium">ปริมาณปัจจุบัน:</span> 
                                        {warehouse.current_stock.toLocaleString()} / {warehouse.capacity.toLocaleString()} kg
                                    </p>
                                    <p>
                                        <span className="font-medium">ความจุที่เหลือ:</span> 
                                        {warehouse.remaining_capacity.toLocaleString()} kg
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WarehouseSummary;