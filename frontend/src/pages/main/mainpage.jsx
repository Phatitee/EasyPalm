// frontend/src/pages/mainpage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

// --- สร้าง Component สำหรับการ์ดแสดงราคาแต่ละใบ (แบบโชว์อย่างเดียว) ---
const PriceCard = ({ product }) => {
    // กำหนดสีของการ์ดตามชื่อสินค้า
    const cardStyles = {
        "เกรด A": { color: "green", label: "คุณภาพสูงสุด" },
        "เกรด B": { color: "orange", label: "คุณภาพดี" },
        "เกรด C": { color: "yellow", label: "คุณภาพมาตรฐาน" },
        "ปาล์มร่วง": { color: "red", label: "เกรดรอง" },
        "ปาล์มทะลาย": { color: "green", label: "คุณภาพสูงสุด" },
        "เมล็ดปาล์ม": { color: "orange", label: "คุณภาพดี" },
        "น้ำมันปาล์มดิบ": { color: "yellow", label: "คุณภาพมาตรฐาน" },
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
            <p className="mt-4 text-sm text-gray-600">
                📦 ปริมาณรับซื้อ <span className="font-semibold text-gray-800">N/A</span>
            </p>
        </div>
    );
};


// --- Component หลักของ MainPage ---
const MainPage = ({ products, error, user }) => {
    const navigate = useNavigate();

    const handlelogin = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 p-6">
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">eP</div>
                    <span className="font-bold text-lg text-gray-800">easyPalm</span>
                </div>
                    <button className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-1" onClick={handlelogin}>
                        <span>👤</span> พนักงาน
                    </button>
            </header>

            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">ราคารับซื้อปาล์มวันนี้</h1>
                <p className="text-gray-500 text-sm">อัพเดตราคาและปริมาณรับซื้อล่าสุดสำหรับแต่ละเกรด</p>
            </div>

            {/* ส่วนแสดงผล Price Cards */}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {(!products || products.length === 0) && !error && <p className="text-center">กำลังโหลดราคาสินค้า...</p>}
            {products && products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {products.map(product => (
                        <PriceCard key={product.p_id} product={product} />
                    ))}
                </div>
            )}

            {/* ส่วนสรุปท้ายหน้า (ยังเป็นข้อมูล Static) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="font-bold text-gray-800 mb-4">สรุปยอดวันนี้</h3>
                    <div className="flex justify-between text-gray-700 mb-2">
                        <span>ยอดรับซื้อรวม</span>
                        <span className="font-semibold">N/A</span>
                    </div>
                    <div className="flex justify-between text-gray-700 mb-6">
                        <span>ยอดจ่ายโดยประมาณ</span>
                        <span className="font-semibold">N/A</span>
                    </div>
                    <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
                        📞 ติดต่อสอบถาม
                    </button>
                </div>
                <div className="bg-orange-50 rounded-2xl shadow p-6 border border-orange-200">
                    <h3 className="font-bold text-orange-700 mb-2">⚠️ แจ้งเตือน</h3>
                    <p className="text-gray-700 text-sm">
                        พรุ่งนี้ราคาการเกรด A อาจมีการปรับขึ้นเล็กน้อย โปรดติดตาม
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MainPage;