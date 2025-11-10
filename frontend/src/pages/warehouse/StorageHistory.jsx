// frontend/src/pages/warehouse/StorageHistory.jsx (FIXED)

import React, { useState, useEffect, useCallback } from 'react';
import { Search, List, Loader, ServerCrash, Inbox, Users, Truck } from 'lucide-react';
import StorageDetail from './StorageDetail'; 
import SalesHistoryDetail from '../sales/SalesHistoryDetail'; // (เพิ่ม) Import Modal ของ Sales

// 1. ★★★ Import ฟังก์ชันจาก api.js ★★★
import { getStorageHistory, getWarehouses } from '../../services/api';

// 2. ★★★ ลบ API_URL ทิ้งไป ★★★
// const API_URL = process.env.REACT_APP_API_URL;

const StorageHistory = () => {
    const [items, setItems] = useState([]); // (ปรับปรุง) เปลี่ยนชื่อเป็น items
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');

    // (ปรับปรุง) State ของ Modal ให้เก็บ cả id และ type
    const [selectedItem, setSelectedItem] = useState({ id: null, type: null });
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchStorageHistory = useCallback(async () => {
        setLoading(true);
        try {
            // (ปรับปรุง) เรียก API เส้นใหม่
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (warehouseFilter) params.warehouse_id = warehouseFilter;
            
            // 3. ★★★ แก้ไข: นี่คือบรรทัดที่ 44 ที่ Error ★★★
            const data = await getStorageHistory(params);
            setItems(data); // (ปรับปรุง) ตั้งค่า state ด้วยข้อมูลใหม่
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, warehouseFilter]);
    
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                // 4. ★★★ แก้ไข: ใช้ api.js ★★★
                const data = await getWarehouses();
                setWarehouses(data);
            } catch (err) { console.error(err); }
        };
        fetchWarehouses();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStorageHistory();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchStorageHistory]);

    // (ปรับปรุง) handler ให้รับ item ทั้ง object
    const handleRowClick = (item) => {
        setSelectedItem({ id: item.order_number, type: item.type });
        setIsDetailModalOpen(true);
    };

    // (เพิ่ม) ฟังก์ชัน render modal ตามประเภท
    const renderDetailModal = () => {
        if (!isDetailModalOpen) return null;
        if (selectedItem.type === 'PO') return <StorageDetail orderId={selectedItem.id} onClose={() => setIsDetailModalOpen(false)} />;
        if (selectedItem.type === 'SO_Return') return <SalesHistoryDetail orderId={selectedItem.id} onClose={() => setIsDetailModalOpen(false)} />;
        return null;
    };


    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <List className="mr-3 text-orange-600 dark:text-orange-400"/>
                ประวัติการจัดเก็บ
            </h1>

            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center transition-colors duration-300">
                <div className="relative w-full md:w-2/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                        type="text"
                        // (ปรับปรุง) Placeholder text
                        placeholder="ค้นหาตามเลขที่เอกสาร, ชื่อเกษตรกร, หรือลูกค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                </div>
                <div className="w-full md:w-1/3 flex items-center">
                    <label htmlFor="warehouse-filter" className="sr-only">คลังสินค้า</label>
                    <select
                        id="warehouse-filter"
                        value={warehouseFilter}
                        onChange={(e) => setWarehouseFilter(e.target.value)}
                        className="w-full md:w-60 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="">ทั้งหมด (ทุกคลัง)</option>
                        {warehouses.map(w => (
                            <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option> 
                            // (แก้ไข) เปลี่ยน .name เป็น .warehouse_name
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
               <div className="flex justify-center items-center h-64 text-gray-800 dark:text-gray-200"><Loader className="animate-spin text-blue-500" size={48} /></div>
            ) : error ? (
               <div className="flex flex-col justify-center items-center h-64 text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 p-10 rounded-lg shadow-lg"><ServerCrash size={48} className="mb-4" /> <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2><p>{error}</p></div>
            ) : items.length === 0 ? (
               <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                    <Inbox size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">ไม่พบข้อมูล</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">ไม่พบประวัติการจัดเก็บที่ตรงกับเงื่อนไข</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {/* (ปรับปรุง) แก้ไข Header ทั้งหมด */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ประเภท</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">เลขที่เอกสาร</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ที่มา</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">วันที่ดำเนินการ</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ยอดรวม</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ผู้ดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {items.map(item => (
                                    <tr key={`${item.type}-${item.order_number}`} onClick={() => handleRowClick(item)} className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150">
                                        {/* (ปรับปรุง) Render ข้อมูลตามโครงสร้างใหม่ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {item.type === 'PO' ? (
                                                <span className="flex items-center text-blue-600 dark:text-blue-400 font-semibold"><Users className="mr-2" size={16}/> รับเข้า</span>
                                            ) : (
                                                <span className="flex items-center text-red-600 dark:text-red-400 font-semibold"><Truck className="mr-2" size={16}/> รับคืน</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{item.order_number}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.source_name}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(item.completed_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-gray-200">{parseFloat(item.total_price).toLocaleString('th-TH')} บาท</td>
                                        <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">{item.responsible_person || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* (ปรับปรุง) เรียกใช้ฟังก์ชัน render modal */}
            {renderDetailModal()}
        </div>
    );
};

export default StorageHistory;