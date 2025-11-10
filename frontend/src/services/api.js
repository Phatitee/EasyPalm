// frontend/src/services/api.js

// 1. ดึง URL หลักมาแค่ "ที่นี่" ที่เดียว
// ถ้าไม่เจอใน .env (ตอน dev) ให้ใช้ localhost เป็นค่าสำรอง
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * ฟังก์ชันกลางสำหรับเรียก API
 * @param {string} endpoint - Path ของ API เช่น '/api/products'
 * @param {object} options - Options มาตรฐานของ fetch (method, body, headers)
 */
export const apiFetch = async (endpoint, options = {}) => {
  // 2. ประกอบร่าง URL เต็ม
  const url = `${API_URL}${endpoint}`;

  // 3. ตั้งค่า Default Headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // (เผื่ออนาคต) ถ้าคุณมีระบบ Login และใช้ Token
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   defaultHeaders['Authorization'] = `Bearer ${token}`;
  // }

  const config = {
    ...options,
    headers: defaultHeaders,
  };

  try {
    const response = await fetch(url, config);

    // 4. จัดการ Error อัตโนมัติ
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // 5. คืนค่าเป็น JSON
    if (response.status === 204) { // 204 No Content (เช่น การ Delete)
      return null;
    }
    return response.json();

  } catch (error) {
    console.error(`API Fetch Error (${endpoint}):`, error);
    throw error; // ส่ง Error ต่อให้ Component จัดการ
  }
};

/* -----------------------------------------------------------------
   COMMON & UTILITY
  -----------------------------------------------------------------
*/
export const login = (username, password) => apiFetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ username, password }),
});

export const getProducts = () => apiFetch('/api/products');

export const getFarmers = () => apiFetch('/api/farmers');

export const getFoodIndustries = () => apiFetch('/api/food-industries');

export const getWarehouses = () => apiFetch('/api/warehouses');

export const createWarehouse = (warehouseData) => apiFetch('/api/warehouses', {
  method: 'POST',
  body: JSON.stringify(warehouseData),
});

export const getStorageHistory = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/warehouse/storage-history?${query}`);
};

/* -----------------------------------------------------------------
   PRODUCT MANAGEMENT
  -----------------------------------------------------------------
*/
// (getProducts อยู่ด้านบนแล้ว)
export const createProduct = (productData) => apiFetch('/api/products', {
  method: 'POST',
  body: JSON.stringify(productData),
});

export const getProductById = (p_id) => apiFetch(`/api/products/${p_id}`);

export const updateProduct = (p_id, productData) => apiFetch(`/api/products/${p_id}`, {
  method: 'PUT',
  body: JSON.stringify(productData),
});

export const deleteProduct = (p_id) => apiFetch(`/api/products/${p_id}`, {
  method: 'DELETE',
});

/* -----------------------------------------------------------------
   EMPLOYEE MANAGEMENT
  -----------------------------------------------------------------
*/
export const getEmployees = () => apiFetch('/api/employees');

export const createEmployee = (employeeData) => apiFetch('/api/employees', {
  method: 'POST',
  body: JSON.stringify(employeeData),
});

export const getEmployeeById = (e_id) => apiFetch(`/api/employees/${e_id}`);

export const updateEmployee = (e_id, employeeData) => apiFetch(`/api/employees/${e_id}`, {
  method: 'PUT',
  body: JSON.stringify(employeeData),
});

export const deleteEmployee = (e_id) => apiFetch(`/api/employees/${e_id}`, {
  method: 'DELETE',
});

export const suspendEmployee = (e_id) => apiFetch(`/api/employees/${e_id}/suspend`, {
  method: 'PUT',
  body: JSON.stringify({}), // ส่ง body ว่างเปล่าสำหรับ PUT ที่ไม่มีข้อมูล
});

export const unsuspendEmployee = (e_id) => apiFetch(`/api/employees/${e_id}/unsuspend`, {
  method: 'PUT',
  body: JSON.stringify({}),
});

/* -----------------------------------------------------------------
   FARMER MANAGEMENT
  -----------------------------------------------------------------
*/
// (getFarmers อยู่ด้านบนแล้ว)
export const createFarmer = (farmerData) => apiFetch('/api/farmers', {
  method: 'POST',
  body: JSON.stringify(farmerData),
});

export const getFarmerById = (f_id) => apiFetch(`/api/farmers/${f_id}`);

export const updateFarmer = (f_id, farmerData) => apiFetch(`/api/farmers/${f_id}`, {
  method: 'PUT',
  body: JSON.stringify(farmerData),
});

export const deleteFarmer = (f_id) => apiFetch(`/api/farmers/${f_id}`, {
  method: 'DELETE',
});

/* -----------------------------------------------------------------
   CUSTOMER (FOOD INDUSTRY) MANAGEMENT
  -----------------------------------------------------------------
*/
// (getFoodIndustries อยู่ด้านบนแล้ว)
export const createFoodIndustry = (industryData) => apiFetch('/api/food-industries', {
  method: 'POST',
  body: JSON.stringify(industryData),
});

export const getFoodIndustryById = (f_id) => apiFetch(`/api/food-industries/${f_id}`);

export const updateFoodIndustry = (f_id, industryData) => apiFetch(`/api/food-industries/${f_id}`, {
  method: 'PUT',
  body: JSON.stringify(industryData),
});

export const deleteFoodIndustry = (f_id) => apiFetch(`/api/food-industries/${f_id}`, {
  method: 'DELETE',
});

/* -----------------------------------------------------------------
   WAREHOUSE MANAGEMENT (Specific)
  -----------------------------------------------------------------
*/
export const updateWarehouse = (warehouse_id, warehouseData) => apiFetch(`/api/warehouses/${warehouse_id}`, {
  method: 'PUT',
  body: JSON.stringify(warehouseData),
});

export const deleteWarehouse = (warehouse_id) => apiFetch(`/api/warehouses/${warehouse_id}`, {
  method: 'DELETE',
});

/* -----------------------------------------------------------------
   PURCHASE & STOCK
  -----------------------------------------------------------------
*/
export const getPurchaseOrder = (order_number) => apiFetch(`/api/purchaseorders/${order_number}`);

export const getPurchaseOrders = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/purchaseorders?${query}`);
};

export const createPurchaseOrder = (orderData) => apiFetch('/api/purchaseorders', {
  method: 'POST',
  body: JSON.stringify(orderData),
});

export const markOrderAsPaid = (order_number, employee_id) => apiFetch(`/api/purchaseorders/${order_number}/pay`, {
  method: 'PUT',
  body: JSON.stringify({ employee_id }),
});

export const getStockLevels = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/stock?${query}`);
};

/* -----------------------------------------------------------------
   WAREHOUSE (Operations)
  -----------------------------------------------------------------
*/
export const confirmReturn = (returnData) => apiFetch('/api/warehouse/confirm-return', {
  method: 'POST',
  body: JSON.stringify(returnData),
});

export const getPendingReceipts = () => apiFetch('/api/warehouse/pending-receipts');

export const receiveItemsIntoStock = (receiveData) => apiFetch('/api/warehouse/receive-items', {
  method: 'POST',
  body: JSON.stringify(receiveData),
});

export const getStockInHistory = () => apiFetch('/api/warehouse/stock-in-history');

export const getPendingShipments = () => apiFetch('/api/warehouse/pending-shipments');

export const shipSalesOrder = (order_number, employee_id) => apiFetch(`/api/warehouse/ship-order/${order_number}`, {
  method: 'POST',
  body: JSON.stringify({ employee_id }),
});

export const getWarehouseSummary = () => apiFetch('/api/purchasing/warehouse-summary');

export const getShipmentHistory = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/warehouse/shipment-history?${query}`);
};

export const getPendingStorageItems = () => apiFetch('/api/warehouse/pending-storage-items');

/* -----------------------------------------------------------------
   SALES MANAGEMENT
  -----------------------------------------------------------------
*/
export const getSalesOrders = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/salesorders?${query}`);
};

export const createSalesOrder = (orderData) => apiFetch('/api/salesorders', {
  method: 'POST',
  body: JSON.stringify(orderData),
});

export const getSalesOrder = (order_number) => apiFetch(`/api/salesorders/${order_number}`);

export const requestSalesOrderReturn = (order_number, employee_id) => apiFetch(`/api/salesorders/${order_number}/request-return`, {
  method: 'PUT',
  body: JSON.stringify({ employee_id }),
});

export const getPendingDeliveryOrders = () => apiFetch('/api/salesorders/pending-delivery');

export const confirmDelivery = (order_number, employee_id) => apiFetch(`/api/salesorders/${order_number}/confirm-delivery`, {
  method: 'PUT',
  body: JSON.stringify({ employee_id }),
});

export const getPendingPaymentOrders = () => apiFetch('/api/salesorders/pending-payment');

export const confirmPayment = (order_number, employee_id) => apiFetch(`/api/salesorders/${order_number}/confirm-payment`, {
  method: 'PUT',
  body: JSON.stringify({ employee_id }),
});

/* -----------------------------------------------------------------
   DASHBOARDS & REPORTS
  -----------------------------------------------------------------
*/
export const getAdminDashboardSummary = () => apiFetch('/api/admin/dashboard-summary');

export const getProfitLossReport = (start_date, end_date) => {
  const query = new URLSearchParams({ start_date, end_date }).toString();
  return apiFetch(`/api/reports/profit-loss?${query}`);
};

export const getExecutiveDashboardSummary = () => apiFetch('/api/executive/dashboard-summary');

export const getPalmPriceHistory = () => apiFetch('/api/palm-price-history');