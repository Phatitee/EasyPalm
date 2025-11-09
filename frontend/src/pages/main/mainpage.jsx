// frontend/src/pages/main/mainpage.jsx (PREMIUM VERSION)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    User, Package, Phone, TrendingUp, Loader, Sparkles, 
    ArrowRight, CheckCircle, Award, Zap, ShieldCheck,
    Calendar, DollarSign, BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Premium Price Card Component ---
const PriceCard = ({ product, index }) => {
    const cardStyles = {
        "น้ำมันปาล์มดิบ": { 
            color: "emerald", 
            gradient: "from-emerald-500 to-teal-600",
            label: "คุณภาพสูงสุด",
            icon: "💎",
            bgPattern: "from-emerald-50/50 to-teal-50/50"
        },
        "ปาล์มทะลาย": { 
            color: "amber", 
            gradient: "from-amber-500 to-orange-600",
            label: "คุณภาพสูงสุด",
            icon: "⭐",
            bgPattern: "from-amber-50/50 to-orange-50/50"
        },
        "เมล็ดในปาล์ม": { 
            color: "blue", 
            gradient: "from-blue-500 to-cyan-600",
            label: "คุณภาพสูงสุด",
            icon: "🌟",
            bgPattern: "from-blue-50/50 to-cyan-50/50"
        },
    };
    const style = cardStyles[product.p_name] || { 
        color: "gray", 
        gradient: "from-gray-500 to-gray-600",
        label: "ทั่วไป",
        icon: "📦",
        bgPattern: "from-gray-50/50 to-gray-100/50"
    };

    return (
        <div 
            className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:scale-[1.02]"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${style.bgPattern} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Decorative Corner */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${style.gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />

            {/* Content */}
            <div className="relative p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${style.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-2xl">{style.icon}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-600 transition-all">
                                {product.p_name}
                            </h3>
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-${style.color}-100 text-${style.color}-700`}>
                                <Award className="w-3 h-3" />
                                {style.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Price Display */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-5xl font-bold bg-gradient-to-br ${style.gradient} bg-clip-text text-transparent`}>
                            {product.price_per_unit.toFixed(2)}
                        </span>
                        <span className="text-gray-500 text-lg font-medium">฿</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">ต่อกิโลกรัม</p>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>ราคาล่าสุด</span>
                    </div>
                    <button className={`px-4 py-2 bg-gradient-to-r ${style.gradient} text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 group-hover:scale-105`}>
                        ดูรายละเอียด
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Glow Effect on Hover */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${style.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
        </div>
    );
};

// --- Premium Price Chart Component ---
const PriceChart = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-full py-20">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 animate-pulse" />
                </div>
                <p className="mt-4 text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-semibold">{error}</p>
            </div>
        );
    }
    
    const formattedData = data.slice(-12).map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('th-TH', {
            month: 'short', 
            year: 'numeric' 
        }),
    }));
    
    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                        dataKey="date" 
                        interval="preserveStartEnd" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#d1d5db"
                    />
                    <YAxis 
                        domain={['dataMin - 1', 'dataMax + 1']} 
                        tickFormatter={(value) => `฿${value.toFixed(1)}`}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#d1d5db"
                    />
                    <Tooltip 
                        formatter={(value) => [`${value.toFixed(2)} บาท`, "ราคา"]}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '2px solid #10b981',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    <Area 
                        type="monotone" 
                        dataKey="price" 
                        name="ราคาน้ำมันปาล์มดิบ" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fill="url(#colorPrice)"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Main Page Component ---
const MainPage = ({ products, error: productsError }) => {
    const navigate = useNavigate();
    
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(true);
    const [chartError, setChartError] = useState(null);

    useEffect(() => {
        const fetchChartData = async () => {
            setChartLoading(true);
            setChartError(null);
            try {
                const response = await fetch('http://127.0.0.1:5000/palm-price-history');
                if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลกราฟราคาได้');
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

    const handleLogin = () => navigate("/login");

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
            </div>

            {/* Header */}
            <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-110 transition-transform">
                                <img src={process.env.PUBLIC_URL + '/Gemini_Generated_Image_y930e8y930e8y930-removebg-preview.png'} alt="EasyPalm Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    EasyPalm
                                </span>
                                <div className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                    <span className="text-xs text-gray-500 font-medium">Premium Edition</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogin}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-300 flex items-center gap-2 group"
                        >
                            <User className="w-5 h-5" />
                            <span>เข้าสู่ระบบพนักงาน</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-6 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-emerald-200/50">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-gray-700">อัพเดทแบบเรียลไทม์</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                        ราคารับซื้อปาล์ม
                        <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            วันนี้
                        </span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        อัพเดทราคาและปริมาณรับซื้อล่าสุด พร้อมระบบวิเคราะห์แนวโน้มราคา
                    </p>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap justify-center gap-8 pt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500">อัพเดทล่าสุด</p>
                                <p className="text-lg font-bold text-gray-900">เมื่อสักครู่</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500">ความน่าเชื่อถือ</p>
                                <p className="text-lg font-bold text-gray-900">100%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price Cards Grid */}
                {productsError && (
                    <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                        <p className="text-red-600 text-center font-semibold">{productsError}</p>
                    </div>
                )}

                {(!products || products.length === 0) && !productsError ? (
                    <div className="text-center py-20">
                        <Loader className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">กำลังโหลดราคาสินค้า...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 animate-fade-in">
                        {products
                            .slice()
                            .sort((a, b) => {
                                const order = ["น้ำมันปาล์มดิบ", "ปาล์มทะลาย", "เมล็ดในปาล์ม"];
                                return order.indexOf(a.p_name) - order.indexOf(b.p_name);
                            })
                            .map((product, idx) => (
                                <PriceCard key={product.p_id} product={product} index={idx} />
                            ))}
                    </div>
                )}

                {/* Important Notice */}
                <div className="mb-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-2xl shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900 mb-2">หมายเหตุสำคัญ</h3>
                            <p className="text-amber-800 leading-relaxed">
                                ราคาสินค้าอาจมีการปรับเปลี่ยนตามคุณภาพของสินค้า กรุณาตรวจสอบคุณภาพก่อนทำรายการซื้อขาย
                            </p>
                        </div>
                    </div>
                </div>

                {/* Price Chart Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                แนวโน้มราคาน้ำมันปาล์มดิบ
                            </h3>
                            <p className="text-gray-500 ml-13">ข้อมูลย้อนหลัง 12 เดือน</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-semibold text-emerald-700">ประจำปี 2024</span>
                        </div>
                    </div>
                    
                    <PriceChart data={chartData} loading={chartLoading} error={chartError} />
                </div>

                {/* Call to Action */}
                <div className="mt-12 text-center space-y-4 animate-fade-in">
                    <p className="text-gray-600">ต้องการข้อมูลเพิ่มเติม?</p>
                    <button 
                        onClick={handleLogin}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
                    >
                        <User className="w-5 h-5" />
                        เข้าสู่ระบบเพื่อดูข้อมูลเพิ่มเติม
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-8 text-center">
                    <p className="text-gray-600 font-medium">
                        © 2024 EasyPalm Premium Edition. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;