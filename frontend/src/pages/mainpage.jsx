import { useNavigate } from "react-router-dom";

export default function EasyPalm() {
    const navigate = useNavigate();
    const handlelogin = () => {
    // ตรงนี้ยังไม่ต้องมี backend แค่เด้งกลับไป login
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
            eP
          </div>
          <span className="font-bold text-lg text-gray-800">easyPalm</span>
        </div>
        <button className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-1"
        onClick={handlelogin}>
          <span>👤</span> พนักงาน
        </button>
      </header>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          ราคารับซื้อปาล์มวันนี้
        </h1>
        <p className="text-gray-500 text-sm">
          อัพเดตราคาและปริมาณรับซื้อล่าสุดสำหรับแต่ละเกรด
        </p>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* เกรด A */}
        <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-green-600">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg text-gray-800">เกรด A</h2>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
              คุณภาพสูงสุด
            </span>
          </div>
          <p className="text-4xl font-extrabold text-green-700">5.20</p>
          <p className="text-gray-500">฿ / กก.</p>
          <p className="mt-4 text-sm text-gray-600">
            📦 ปริมาณรับซื้อ{" "}
            <span className="font-semibold text-gray-800">1,200 กก.</span>
          </p>
        </div>

        {/* เกรด B */}
        <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-orange-500">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg text-gray-800">เกรด B</h2>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
              คุณภาพดี
            </span>
          </div>
          <p className="text-4xl font-extrabold text-orange-600">4.80</p>
          <p className="text-gray-500">฿ / กก.</p>
          <p className="mt-4 text-sm text-gray-600">
            🛒 ปริมาณรับซื้อ{" "}
            <span className="font-semibold text-gray-800">800 กก.</span>
          </p>
        </div>

        {/* เกรด C */}
        <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-yellow-600">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg text-gray-800">เกรด C</h2>
            <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
              คุณภาพมาตรฐาน
            </span>
          </div>
          <p className="text-4xl font-extrabold text-yellow-700">4.50</p>
          <p className="text-gray-500">฿ / กก.</p>
          <p className="mt-4 text-sm text-gray-600">
            🏷️ ปริมาณรับซื้อ{" "}
            <span className="font-semibold text-gray-800">500 กก.</span>
          </p>
        </div>

        {/* ปาล์มร่วง */}
        <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-red-600">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg text-gray-800">ปาล์มร่วง</h2>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
              เกรดรอง
            </span>
          </div>
          <p className="text-4xl font-extrabold text-red-700">3.90</p>
          <p className="text-gray-500">฿ / กก.</p>
          <p className="mt-4 text-sm text-gray-600">
            ⚙️ ปริมาณรับซื้อ{" "}
            <span className="font-semibold text-gray-800">ไม่จำกัด</span>
          </p>
        </div>
      </div>

      {/* Summary + Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-gray-800 mb-4">สรุปยอดวันนี้</h3>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>ยอดรับซื้อรวม</span>
            <span className="font-semibold">2,500 kg</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-6">
            <span>ยอดจ่ายโดยประมาณ</span>
            <span className="font-semibold">12,290 ฿</span>
          </div>
          <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
            📞 ติดต่อสอบถาม
          </button>
        </div>

        {/* Alert */}
        <div className="bg-orange-50 rounded-2xl shadow p-6 border border-orange-200">
          <h3 className="font-bold text-orange-700 mb-2">⚠️ แจ้งเตือน</h3>
          <p className="text-gray-700 text-sm">
            พรุ่งนี้ราคาการเกรด A อาจมีการปรับขึ้นเล็กน้อย โปรดติดตาม
          </p>
        </div>
      </div>
    </div>
  );
}
