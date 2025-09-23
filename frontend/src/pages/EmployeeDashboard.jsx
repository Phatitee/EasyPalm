import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Package, FileText, Building, BarChart2, LogOut } from "lucide-react";



export default function EmployeeDashboard() {
  const [active, setActive] = useState("stock");
  const navigate = useNavigate();

  const handleLogout = () => {
    // ตรงนี้ยังไม่ต้องมี backend แค่เด้งกลับไป login
    navigate("/");
  };


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-6 font-bold text-2xl">🌴 EasyPalm</div>
        <nav className="flex-1 space-y-2 px-4">
          <button
            className={`flex items-center gap-2 p-2 rounded-md w-full text-left ${active === "stock" ? "bg-green-600" : "hover:bg-green-700"}`}
            onClick={() => setActive("stock")}
          >
            <Package size={18}/> ดู Stock
          </button>
          <button
            className={`flex items-center gap-2 p-2 rounded-md w-full text-left ${active === "orders" ? "bg-green-600" : "hover:bg-green-700"}`}
            onClick={() => setActive("orders")}
          >
            <FileText size={18}/> ใบคำสั่งซื้อ
          </button>
          <button
            className={`flex items-center gap-2 p-2 rounded-md w-full text-left ${active === "companies" ? "bg-green-600" : "hover:bg-green-700"}`}
            onClick={() => setActive("companies")}
          >
            <Building size={18}/> บริษัทเสนอขาย
          </button>
          <button
            className={`flex items-center gap-2 p-2 rounded-md w-full text-left ${active === "summary" ? "bg-green-600" : "hover:bg-green-700"}`}
            onClick={() => setActive("summary")}
          >
            <BarChart2 size={18}/> สรุปการซื้อขาย
          </button>
        </nav>
        <button 
          onClick={handleLogout}
          className="p-4 flex items-center gap-2 border-t border-green-700 hover:bg-green-700">
          <LogOut size={18}/> Logout
         
          
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">📊 Dashboard พนักงาน</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow-md rounded-xl p-6">
            <p className="text-gray-500">สต็อกคงเหลือ</p>
            <h2 className="text-3xl font-bold">2,350 ตัน</h2>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6">
            <p className="text-gray-500">คำสั่งซื้อที่รอดำเนินการ</p>
            <h2 className="text-3xl font-bold">14 ใบ</h2>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6">
            <p className="text-gray-500">บริษัทเสนอขาย</p>
            <h2 className="text-3xl font-bold">6 บริษัท</h2>
          </div>
        </div>

        {/* Dynamic Content */}
        {active === "stock" && (
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">📦 รายการสต็อก</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">สินค้า</th>
                  <th className="p-2">คงเหลือ (ตัน)</th>
                  <th className="p-2">อัพเดทล่าสุด</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">ปาล์มน้ำมันสด</td>
                  <td className="p-2">1,200</td>
                  <td className="p-2">20/09/2025</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">น้ำมันปาล์มดิบ</td>
                  <td className="p-2">1,150</td>
                  <td className="p-2">20/09/2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {active === "orders" && (
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">📑 ใบคำสั่งซื้อ</h2>
            <p>ตารางคำสั่งซื้อจะแสดงที่นี่...</p>
          </div>
        )}

        {active === "companies" && (
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">🏢 บริษัทเสนอขาย</h2>
            <p>ข้อมูลบริษัทเสนอขายจะแสดงที่นี่...</p>
          </div>
        )}

        {active === "summary" && (
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">📊 สรุปการซื้อขาย</h2>
            <p>กราฟและรายงานการซื้อขายจะแสดงที่นี่...</p>
          </div>
        )}
      </main>
    </div>
  );
}
