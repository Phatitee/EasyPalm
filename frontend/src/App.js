import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import axios from 'axios';

// Context & Protected Route Wrapper
import { useAuth } from './contexts/AuthContext';

// Layout
import AppLayout from './components/layouts/AppLayout';

// Pages
import EasyPlamLogin from './pages/main/EasyPlamLogin';
import MainPage from './pages/main/Mainpage';

// Admin
import EmployeeMangement from './pages/admin/EmployeeManagement';
import EmployeeDetail from './pages/admin/EmployeeDetail';

// Purchasing
import PurchaseProduct from './pages/purchasing/PurchaseProduct';
import PurchaseHistory from './pages/purchasing/PurchaseHistory';
import ProductPriceList from './pages/purchasing/ProductPriceList';
import FarmerManagement from './pages/purchasing/FarmerManagement';
import WarehouseSummary from './pages/purchasing/WarehouseSummary';

// Sales
import CreateSalesOrder from './pages/sales/CreateSalesOrder';
import SalesHistory from './pages/sales/SalesHistory';
import ConfirmDelivery from './pages/sales/ConfirmDelivery';
import CustomerManagement from './pages/sales/CustomerManagement';
import SalesHistoryDetail from './pages/sales/SalesHistoryDetail';

// Warehouse
import PendingStorage from './pages/warehouse/PendingStorage';
import StorageHistory from './pages/warehouse/StorageHistory';
import PendingRequests from './pages/warehouse/ShipmentHistory';
import PendingShipments from './pages/warehouse/PendingShipments';
import WarehouseManagement from './pages/warehouse/WarehouseManagement';
import ShipmentDetails from './pages/warehouse/ShipmentDetails';

// Accountant
// ★★★ แก้ไขบรรทัดนี้: เปลี่ยนการ import ให้ถูกต้อง ★★★
import PaymentManagement from './pages/accountant/PaymentManagement'; 
import SoReceipts from './pages/accountant/SoReceipts';

// Executive
import ExecutiveDashboard from './pages/executive/ExecutiveDashboard';
import ProfitLossReport from './pages/executive/ProfitLossReport';

// Shared
import StockLevel from './pages/shared/StockLevel';
import ShipmentHistory from './pages/warehouse/ShipmentHistory';


// Component for protecting routes based on Role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.e_role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/products');
        setProducts(response.data);
      } catch (err) {
        setError('ไม่สามารถเชื่อมต่อกับ Server เพื่อโหลดราคาได้');
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Router>
      <Routes>
        {/* === Public Routes === */}
        <Route path="/" element={<MainPage products={products} error={error} />} />
        <Route path="/login" element={<EasyPlamLogin />} />

        {/* === Protected Routes (All roles now use the single AppLayout) === */}
        <Route element={
            <ProtectedRoute allowedRoles={['admin', 'purchasing', 'sales', 'warehouse', 'accountant', 'executive']}>
              <AppLayout><Outlet /></AppLayout>
            </ProtectedRoute>
          }>
          
          {/* --- Admin Routes --- */}
          <Route path="/admin/employees" element={<EmployeeMangement />} />
          <Route path="/admin/employees/:e_id" element={<EmployeeDetail />} /> {/* <-- เพิ่ม Route นี้ */}
          
          {/* --- Purchasing Routes --- */}
          <Route path="/purchasing/create-po" element={<PurchaseProduct />} />
          <Route path="/purchasing/history" element={<PurchaseHistory />} />
          <Route path="/purchasing/prices" element={<ProductPriceList />} />
          <Route path="/purchasing/farmers" element={<FarmerManagement />} />
          <Route path="/purchasing/stock-summary" element={<WarehouseSummary />} />
          
          {/* --- Sales Routes --- */}
          <Route path="/sales/create-so" element={<CreateSalesOrder />} />
          <Route path="/sales/history" element={<SalesHistory />} />
          <Route path="/sales/confirm-delivery" element={<ConfirmDelivery />} />
          <Route path="/sales/customers" element={<CustomerManagement />} />
          <Route path="/sales/stock" element={<StockLevel />} />
          <Route path="/sales/history/:orderNumber" element={<SalesHistoryDetail />} />
          

          {/* --- Warehouse Routes --- */}
          <Route path="/warehouse/pending-storage" element={<PendingStorage />} />
          <Route path="/warehouse/storage-history" element={<StorageHistory />} />
          <Route path="/warehouse/shipment-history" element={<ShipmentHistory />} />
          <Route path="/warehouse/pending-shipments" element={<PendingShipments />} />
          <Route path="/warehouse/stock" element={<StockLevel />} />
          <Route path="/warehouse/management" element={<WarehouseManagement />} />
          <Route path="/warehouse/shipment-details/:orderNumber" element={<ShipmentDetails />} />

          {/* --- Accountant Routes --- */}
          {/* ★★★ แก้ไขบรรทัดนี้: ใช้ Component ที่ถูกต้อง ★★★ */}
          <Route path="/accountant/po-payments" element={<PaymentManagement />} /> 
          <Route path="/accountant/so-receipts" element={<SoReceipts />} />
          <Route path="/accountant/purchase-history" element={<PurchaseHistory />} />
          <Route path="/accountant/sales-history" element={<SalesHistory />} />
            
          {/* --- Executive Routes --- */}
          <Route path="/executive/dashboard" element={<ExecutiveDashboard />} />
          <Route path="/executive/profit-loss" element={<ProfitLossReport />} />
        </Route>
        
        {/* --- Fallback Route --- */}
        <Route path="*" element={<Navigate to={
            !user ? "/login" :
            user.e_role === 'admin' ? '/admin/employees' :
            user.e_role === 'purchasing' ? '/purchasing/create-po' :
            user.e_role === 'sales' ? '/sales/create-so' :
            user.e_role === 'warehouse' ? '/warehouse/pending-storage' :
            user.e_role === 'accountant' ? '/accountant/po-payments' :
            user.e_role === 'executive' ? '/executive/dashboard' :
            '/login'
          } replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;