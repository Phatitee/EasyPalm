import { useState } from "react";
import { User, Lock, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
    const [remember, setRemember] = useState(false);
    const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-orange-50">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-2xl">🌴</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-2xl font-semibold text-gray-800">
          easyPalm
        </h1>
        <p className="text-center text-gray-500 mb-6">
          เข้าสู่ระบบสำหรับพนักงาน
        </p>

        {/* Form */}
        <form className="space-y-4">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <span className="text-gray-600">จดจำฉันไว้ในระบบ</span>
            </label>
            <a href="#" className="text-orange-500 hover:underline">
              ลืมรหัสผ่าน?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md shadow-md transition"
          >
            <LogIn size={18} />
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
