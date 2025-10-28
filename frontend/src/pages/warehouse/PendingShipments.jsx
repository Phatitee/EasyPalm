import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, ServerCrash, CheckCircle, PackageSearch, ClipboardList } from 'lucide-react';

const PendingShipments = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchPendingOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/warehouse/pending-shipments');
            if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลคำขอเบิกสินค้าได้');
            const data = await response.json();
            setPendingOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingOrders();
    }, [fetchPendingOrders]);

    const handleConfirmShipment = async (e, orderNumber) => {
        e.stopPropagation(); // หยุดไม่ให้ event ลามไปถึง Double Click
        if (!window.confirm(`คุณต้องการยืนยันการเบิกสินค้าสำหรับ SO ${orderNumber} ใช่หรือไม่?`)) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/warehouse/ship-order/${orderNumber}`, { method: 'POST' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            alert(result.message);
            fetchPendingOrders();
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    const handleViewDetails = (orderNumber) => {
        navigate(`/warehouse/shipment-details/${orderNumber}`);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-orange-500" size={48} /></div>;
    if (error) return <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg"><ServerCrash className="mx-auto mb-2" />{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">สินค้าที่รอเบิก</h1>
                <p className="text-lg text-gray-500 mt-2">ดับเบิ้ลคลิกที่รายการเพื่อดูรายละเอียด</p>
            </div>

            {pendingOrders.length === 0 ? (
                <div className="text-center text-gray-500 bg-gray-50 p-10 rounded-lg">
                    <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold">ไม่มีคำขอเบิกสินค้า</h3>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เลขที่ SO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อลูกค้า</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่สั่ง</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingOrders.map(order => (
                                    <tr key={order.sale_order_number} onDoubleClick={() => handleViewDetails(order.sale_order_number)} className="hover:bg-orange-50/50 cursor-pointer" title="ดับเบิ้ลคลิกเพื่อดูรายละเอียด">
                                        <td className="px-6 py-4 font-mono">{order.sale_order_number}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{order.customer_name}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(order.s_date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                <PackageSearch className="mr-1.5" size={14}/>
                                                {order.shipment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={(e) => handleConfirmShipment(e, order.sale_order_number)}
                                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 mx-auto text-sm"
                                            >
                                                <CheckCircle size={16} />
                                                ยืนยันการเบิก
                                            </button>
                                        </td>
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

export default PendingShipments;