// frontend/src/pages/warehouse/StorageHistory.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const StorageHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/warehouse/stock-in-history');
                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลประวัติได้');
                }
                const data = await response.json();
                setHistory(data);
            } catch (error) {
                console.error('Error fetching storage history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Logic สำหรับกรองข้อมูลตาม searchTerm
    const filteredHistory = useMemo(() => {
        if (!searchTerm) {
            return history;
        }
        return history.filter(item =>
            item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [history, searchTerm]);

    if (loading) {
        return <div className="p-6 text-center">กำลังโหลดประวัติ...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">ประวัติการจัดเก็บสินค้า</h1>

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ค้นหาตามชื่อสินค้า, เลขที่ PO, หรือชื่อคลัง..."
                    className="w-full max-w-lg px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {history.length === 0 ? (
                 <div className="flex flex-col items-center justify-center text-center text-gray-500 bg-white p-10 rounded-lg shadow">
                    <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold">ยังไม่มีประวัติการจัดเก็บ</h2>
                    <p>เมื่อมีการบันทึกการจัดเก็บสินค้า ข้อมูลจะแสดงที่นี่</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left">วันที่</th>
                                    <th className="px-6 py-3 text-left">ชื่อสินค้า</th>
                                    <th className="px-6 py-3 text-right">จำนวน</th>
                                    <th className="px-6 py-3 text-right">ต้นทุน/หน่วย</th>
                                    <th className="px-6 py-3 text-left">คลังสินค้า</th>
                                    <th className="px-6 py-3 text-left">อ้างอิง PO</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredHistory.map(item => (
                                    <tr key={item.transaction_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{format(new Date(item.date), 'dd/MM/yyyy HH:mm')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{item.product_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-blue-600">{item.quantity.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{item.unit_cost.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.warehouse_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono">{item.po_number}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StorageHistory;