// frontend/src/pages/main/mainpage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    TreePalm, User, Package, Phone, AlertTriangle, TrendingUp, Loader
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- PriceCard Component (ไม่มีการเปลี่ยนแปลง) ---
const PriceCard = ({ product }) => {
    const cardStyles = {
        "เมล็ดในปาล์ม": { color: "orange", label: "คุณภาพสูงสุด" },
        "ปาล์มทะลาย": { color: "green", label: "คุณภาพสูงสุด" },
        "น้ำมันปาล์มดิบ": { color: "yellow", label: "คุณภาพสูงสุด" },
    };
    const style = cardStyles[product.p_name] || { color: "gray", label: "ทั่วไป" };

    return (
        <div className={`bg-white rounded-2xl shadow p-6 border-t-4 border-${style.color}-600`}>
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg text-gray-800">{product.p_name}</h2>
                <span className={`text-xs bg-${style.color}-100 text-${style.color}-600 px-2 py-1 rounded`}>
                    {style.label}
                </span>
            </div>
            <div>
                <p className={`text-4xl font-extrabold text-${style.color}-700`}>
                    {product.price_per_unit.toFixed(2)}
                </p>
                <p className="text-gray-500">฿ / กก.</p>
            </div>

        </div>
    );
};

// +++ (เพิ่มใหม่) Component สำหรับกราฟราคา +++
const PriceChart = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader className="animate-spin text-green-500" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }
    
const formattedData = data.slice(-12).map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('th-TH', {
            month: 'short', 
            year: 'numeric' 
        }),
    }));
    
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart data={formattedData} /* ... props อื่นๆ เหมือนเดิม ... */ >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" interval="preserveStartEnd" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(value) => `฿${value.toFixed(1)}`} />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)} บาท`, "ราคา"]} />
                    <Legend />
                    <Area type="monotone" dataKey="price" name="ราคาน้ำมันปาล์มดิบ" stroke="#16a34a" fill="#4ade80" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};


// --- MainPage Component (แก้ไข) ---
const MainPage = ({ products, error: productsError }) => {
    const navigate = useNavigate();
    
    // +++ (เพิ่มใหม่) State สำหรับข้อมูลกราฟ +++
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(true);
    const [chartError, setChartError] = useState(null);

    // +++ (เพิ่มใหม่) useEffect สำหรับดึงข้อมูลกราฟ +++
    useEffect(() => {
        const fetchChartData = async () => {
            setChartLoading(true);
            setChartError(null);
            try {
                const response = await fetch('http://127.0.0.1:5000/palm-price-history');
                if (!response.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลกราฟราคาได้');
                }
                const data = await response.json();
                setChartData(data);
            } catch (err) {
                setChartError(err.message);
            } finally {
                setChartLoading(false);
            }
        };

        fetchChartData();
    }, []);


    const handlelogin = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-orange-50 p-6">
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                    <TreePalm size={28} className="text-green-600" />
                    <span className="font-bold text-xl text-gray-800">EasyPalm</span>
                </div>
                <button className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-1" onClick={handlelogin}>
                    <User size={20} /> พนักงาน
                </button>
            </header>

            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">ราคารับซื้อปาล์มวันนี้</h1>
                <p className="text-gray-500 text-sm">อัพเดตราคาและปริมาณรับซื้อล่าสุดสำหรับแต่ละเกรด</p>
            </div>

            {productsError && <p className="text-red-500 text-center">{productsError}</p>}
            {(!products || products.length === 0) && !productsError && <p className="text-center">กำลังโหลดราคาสินค้า...</p>}
            {products && products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {products
                        .slice() // copy array
                        .sort((a, b) => {
                            const order = ["น้ำมันปาล์มดิบ", "ปาล์มทะลาย", "เมล็ดในปาล์ม"];
                            return order.indexOf(a.p_name) - order.indexOf(b.p_name);
                        })
                        .map((product, idx) => (
                            <React.Fragment key={product.p_id}>
                                <PriceCard product={product} />
                                {product.p_name === "เมล็ดในปาล์ม" && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-2xl shadow p-4 flex items-center mt-2">
                                        <AlertTriangle size={20} className="text-yellow-600 mr-2" />
                                        <span className="text-gray-700 text-sm">
                                            หมายเหตุ: ราคาสินค้าอาจมีการปรับเปลี่ยนตามคุณภาพของสินค้า กรุณาตรวจสอบคุณภาพก่อนทำรายการซื้อขาย
                                        </span>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                </div>
            )}

            {/* +++ (เพิ่มใหม่) ส่วนแสดงผลกราฟ +++ */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-600" />
                    แนวโน้มราคาน้ำมันปาล์มดิบ (ย้อนหลัง 1 ปี)
                </h3>
                <PriceChart data={chartData} loading={chartLoading} error={chartError} />
            </div>

            {/* ส่วนสรุปท้ายหน้า */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 rounded-2xl shadow p-6 border border-orange-200">
                    <div className="flex items-center mb-2">
                         <AlertTriangle size={30} className="text-orange-700 mr-2" />
                         <h3 className="font-bold text-orange-700">แจ้งเตือน</h3>
                    </div>
                    <p className="text-gray-700 text-sm pl-7">
                        พรุ่งนี้ราคาการเกรด A อาจมีการปรับขึ้นเล็กน้อย โปรดติดตาม
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MainPage;