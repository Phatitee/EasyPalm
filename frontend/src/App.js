// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import Layouts และ Pages ทั้งหมด
import Layout from './components/layouts/Layout'; // Layout สำหรับ Employee
import AdminLayout from './components/layouts/AdminLayout'; // Layout สำหรับ Admin
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


// --- Component จัดการ Layout และการยืนยันตัวตนสำหรับ Employee ---
const EmployeeLayoutWrapper = ({ user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // ถ้าเป็น Admin ให้ redirect ไปหน้า admin dashboard แทน
  if (user.e_role === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  // ถ้าเป็น Role อื่นๆ ที่ถูกต้อง ให้แสดง Layout ปกติ
  return (
    <Layout user={user}>
      <Outlet /> {/* <-- จุดสำคัญ: หน้าลูก (Nested Route) จะถูก render ตรงนี้ */}
    </Layout>
  );
};

// --- Component จัดการ Layout และการยืนยันตัวตนสำหรับ Admin ---
const AdminLayoutWrapper = ({ user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // ถ้าไม่ใช่ Admin ให้ redirect ไปหน้าหลักของ employee
  if (user.e_role !== 'Admin') {
    return <Navigate to="/purchase" replace />;
  }
  return (
    <AdminLayout user={user}>
      <Outlet /> {/* <-- หน้าลูกของ Admin จะถูก render ตรงนี้ */}
    </AdminLayout>
  );
};


function App() {
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
        {/* === Public Routes (ไม่มี Layout) === */}
        <Route 
          path="/" 
          element={<MainPage products={products} error={productsError} user={user} onPriceUpdate={fetchProducts} />} 
        />
        <Route path="/login" element={<EasyPlamLogin setUser={setUser} />} />

        {/* === Admin Routes (ทั้งหมดจะอยู่ภายใต้ AdminLayout) === */}
        <Route element={<AdminLayoutWrapper user={user} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<EmployeeDashboard />} />
          {/* สามารถเพิ่ม Route ของ Admin อื่นๆ ที่นี่ได้ */}
        </Route>

        {/* === Employee Routes (ทั้งหมดจะอยู่ภายใต้ Layout ปกติ) === */}
        <Route element={<EmployeeLayoutWrapper user={user} />}>
          <Route path="/purchase" element={<PurchaseProduct />} />
          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/farmers" element={<FarmerManagement />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
          <Route path="/products" element={<ProductPriceList user={user} products={products} onPriceUpdate={fetchProducts} error={productsError} />} />
          <Route path="/stock" element={<StockLevel />} />
          <Route path="/sell" element={<CreateSalesOrder />} />
          <Route path="/industry" element={<IndustryManagement />} />
          <Route path="/industry/add" element={<AddIndustryPage />} />
          <Route path="/industry/edit/:id" element={<EditIndustryPage />} />
          <Route path="/farmer/add" element={<AddFarmerPage />} />
          <Route path="/farmer/edit/:id" element={<EditFarmerPage />} />
        </Route>
        
        {/* Optional: Route สำหรับหน้าที่ไม่พบ */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;