// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import Layouts และ Pages ทั้งหมด
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout'; // <-- Import Layout ใหม่
import MainPage from './pages/main/mainpage';
import EasyPlamLogin from './pages/main/EasyPlamLogin';
import EmployeeDashboard from './pages/employee/EmployeeMangement';
import PurchaseProduct from './pages/employee/PurchaseProduct';
import PaymentManagement from './pages/employee/PaymentManagement';
import FarmerManagement from './pages/farmer/FarmerManagement';
import PurchaseHistory from './pages/employee/PurchaseHistory';
import ProductPriceList from './pages/employee/ProductPriceList';
import AdminDashboard from './pages/admin/AdminDashboard';
import StockLevel from './pages/employee/StockLevel';
import CreateSalesOrder from './pages/employee/CreateSalesOrder';
import IndustryManagement from './pages/industry/IndustryManagement';
import AddIndustryPage from './pages/industry/AddIndustryPage';
import AddFarmerPage from './pages/farmer/AddFarmerPage';
import EditFarmerPage from './pages/farmer/EditFarmerPage';
import EditIndustryPage from './pages/industry/EditIndustryPage';


// สร้าง Admin Dashboard เปล่าๆ ไว้ก่อน

// Component ป้องกันเส้นทาง (เวอร์ชันอัปเกรด!)
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // --- Logic การเลือก Layout ตาม Role ---
  if (user.e_role === 'Admin') {
    return <AdminLayout user={user}>{children}</AdminLayout>;
  }
  // Role อื่นๆ ใช้ Layout ปกติ
  return <Layout user={user}>{children}</Layout>;
};

function App() {
    // ... (ส่วน state และ fetchProducts เหมือนเดิมเป๊ะ) ...
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [productsError, setProductsError] = useState(null);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/products');
            setProducts(response.data);
            setProductsError(null);
        } catch (err) {
            setProductsError('ไม่สามารถโหลดข้อมูลราคาสินค้าได้');
        }
    }, []);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
        fetchProducts();
    }, [fetchProducts]);


  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={<MainPage products={products} error={productsError} user={user} onPriceUpdate={fetchProducts} />} 
        />
        <Route path="/login" element={<EasyPlamLogin setUser={setUser} />} />

        {/* --- Admin Routes --- */}
        <Route path="/admin/dashboard" element={<ProtectedRoute user={user}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute user={user}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute user={user}><AdminDashboard /></ProtectedRoute>} />
        

        {/* --- Employee Routes --- */}
        <Route path="/purchase" element={<ProtectedRoute user={user}><PurchaseProduct /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute user={user}><PaymentManagement /></ProtectedRoute>} />
        <Route path="/farmers" element={<ProtectedRoute user={user}><FarmerManagement /></ProtectedRoute>} />
        <Route path="/purchase-history" element={<ProtectedRoute user={user}><PurchaseHistory /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute user={user}><ProductPriceList user={user} products={products} onPriceUpdate={fetchProducts} error={productsError} /></ProtectedRoute>} />
        <Route path="/stock" element={<ProtectedRoute user={user}><StockLevel /></ProtectedRoute>} />
        <Route path="/sell" element={<ProtectedRoute user={user}><CreateSalesOrder /></ProtectedRoute>} />
        <Route path="/industry" element={<ProtectedRoute user={user}><IndustryManagement /></ProtectedRoute>} />
        <Route path="/industry/add" element={<ProtectedRoute user={user}><AddIndustryPage /></ProtectedRoute>} />
        <Route path="/industry/edit/:id" element={<ProtectedRoute user={user}><EditIndustryPage /></ProtectedRoute>} />
        <Route path="/farmer/add" element={<ProtectedRoute user={user}><AddFarmerPage /></ProtectedRoute>} />
        <Route path="/farmer/edit/:id" element={<ProtectedRoute user={user}><EditFarmerPage /></ProtectedRoute>} />

      </Routes>
    </Router>
  );
}

export default App;