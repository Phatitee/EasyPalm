// frontend/src/pages/FarmerManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle,
  Trash2,
  Pencil,
  User,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import ResultModal from "../../components/modals/ResultModal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import FarmerForm from "../../components/forms/FarmerForm";

const FarmerManagement = () => {
  // ... (State declarations remain the same) ...
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalInfo, setModalInfo] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [confirmInfo, setConfirmInfo] = useState({
    show: false,
    message: "",
    onConfirm: () => {},
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState({
    f_id: null,
    f_name: "",
    f_citizen_id_card: "",
    f_tel: "",
    f_address: "",
  });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newFarmerData, setNewFarmerData] = useState({
    f_name: "",
    f_citizen_id_card: "",
    f_tel: "",
    f_address: "",
  });
  const [addFormErrors, setAddFormErrors] = useState({}); // --- (เพิ่มใหม่) State สำหรับ Error ของหน้า Edit ---

  const [editFormErrors, setEditFormErrors] = useState({}); // --- ดึงข้อมูล --- // Ensure fetchFarmers is defined within the component scope

  const fetchFarmers = async () => {
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const response = await axios.get("http://127.0.0.1:5000/farmers");
      setFarmers(response.data);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลเกษตรกรได้");
      console.error("Error fetching farmers:", err); // Log the error for debugging
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []); // --- ฟังก์ชันสำหรับปิด MODAL ---

  const handleCloseResultModal = () =>
    setModalInfo({ ...modalInfo, show: false });
  const handleCloseConfirmModal = () =>
    setConfirmInfo({ ...confirmInfo, show: false });
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingFarmer({
      f_id: null,
      f_name: "",
      f_citizen_id_card: "",
      f_tel: "",
      f_address: "",
    });
    setEditFormErrors({}); // --- (เพิ่มใหม่) เคลียร์ Error เมื่อปิด
  };
  const handleCloseAddModal = () => {
    setAddModalOpen(false); // No need to clear form here if cleared on open
  }; // --- Logic การลบ ---

  const handleDelete = (id, name) => {
    setConfirmInfo({
      show: true,
      message: `คุณแน่ใจหรือไม่?ว่าต้องการลบ "${name}" ?`,
      onConfirm: () => executeDelete(id),
    });
  }; // Ensure fetchFarmers is accessible here

  const executeDelete = async (id) => {
    handleCloseConfirmModal();
    try {
      await axios.delete(`http://127.0.0.1:5000/farmers/${id}`);
      setModalInfo({ show: true, type: "success", message: "ลบข้อมูลสำเร็จ" });
      fetchFarmers(); // <<< PROBLEM WAS LIKELY HERE (Line 99 in previous version) - This call should work now.
    } catch (err) {
      console.error("Error deleting farmer:", err);
      setModalInfo({
        show: true,
        type: "error",
        message:
          "เกิดข้อผิดพลาดในการลบข้อมูลเนื่องเกษตรกรมีประวัติการขายอยู่ในระบบ",
      });
    }
  }; // --- Logic การแก้ไข ---

  const handleEditClick = (farmer) => {
    // Ensure you pass the correct data structure
    setEditingFarmer({
      f_id: farmer.f_id,
      f_name: farmer.f_name || "",
      f_citizen_id_card: farmer.f_citizen_id_card || "",
      f_tel: farmer.f_tel || "",
      f_address: farmer.f_address || "",
    });
    setEditFormErrors({}); // --- (เพิ่มใหม่) เคลียร์ Error เมื่อเปิด
    setEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target; // Apply similar input filtering as Add modal if needed
    let processedValue = value;
    if (name === "f_citizen_id_card" || name === "f_tel") {
      processedValue = value.replace(/\D/g, "");
      if (name === "f_citizen_id_card" && processedValue.length > 13) {
        processedValue = processedValue.slice(0, 13);
      } else if (name === "f_tel" && processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10);
      }
    }
    setEditingFarmer((prev) => ({ ...prev, [name]: processedValue })); // --- (เพิ่มใหม่) เคลียร์ Error ทันทีที่แก้ไข ---
    if (editFormErrors[name]) {
      setEditFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  }; // Ensure fetchFarmers is accessible here

  const handleEditSubmit = async (e) => {
    e.preventDefault(); // --- (แก้ไข) เพิ่มการตรวจสอบ Validation ---

    setEditFormErrors({});
    let errors = {};
    const citizenIdPattern = /^[0-9]{13}$/;
    const telPattern = /^0[0-9]{9}$/;

    if (!editingFarmer.f_name.trim()) {
      errors.f_name = "กรุณากรอกชื่อ-นามสกุล";
    }
    if (!citizenIdPattern.test(editingFarmer.f_citizen_id_card)) {
      errors.f_citizen_id_card = "กรุณากรอกเลขบัตรประชาชน 13 หลักให้ถูกต้อง";
    }
    if (!telPattern.test(editingFarmer.f_tel)) {
      errors.f_tel =
        "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก ที่ขึ้นต้นด้วย 0 ให้ถูกต้อง";
    }

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    } // --- (สิ้นสุดการแก้ไข) ---
    try {
      // Send only the necessary fields, f_id is in the URL
      const dataToUpdate = {
        f_name: editingFarmer.f_name,
        f_citizen_id_card: editingFarmer.f_citizen_id_card,
        f_tel: editingFarmer.f_tel,
        f_address: editingFarmer.f_address,
      };
      await axios.put(
        `http://127.0.0.1:5000/farmers/${editingFarmer.f_id}`,
        dataToUpdate
      );
      handleCloseEditModal();
      setModalInfo({
        show: true,
        type: "success",
        message: "แก้ไขข้อมูลเกษตรกรสำเร็จ",
      });
      fetchFarmers();
    } catch (error) {
      console.error("Error updating farmer:", error.response);
      handleCloseEditModal(); // ปิด Edit Modal ก่อนแสดง Error Modal
      setModalInfo({
        show: true,
        type: "error",
        message: error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก",
      });
    }
  }; // --- LOGIC "ADD" ---

  const handleOpenAddModal = () => {
    setNewFarmerData({
      f_name: "",
      f_citizen_id_card: "",
      f_tel: "",
      f_address: "",
    });
    setAddFormErrors({});
    setAddModalOpen(true);
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "f_citizen_id_card" || name === "f_tel") {
      processedValue = value.replace(/\D/g, "");
      if (name === "f_citizen_id_card" && processedValue.length > 13) {
        processedValue = processedValue.slice(0, 13);
      } else if (name === "f_tel" && processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10);
      }
    }
    setNewFarmerData((prev) => ({ ...prev, [name]: processedValue }));
    if (addFormErrors[name]) {
      setAddFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  }; // Ensure fetchFarmers is accessible here

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddFormErrors({});
    let errors = {};
    const citizenIdPattern = /^[0-9]{13}$/;
    const telPattern = /^0[0-9]{9}$/;

    if (!newFarmerData.f_name.trim()) {
      errors.f_name = "กรุณากรอกชื่อ-นามสกุล";
    }
    if (!citizenIdPattern.test(newFarmerData.f_citizen_id_card)) {
      errors.f_citizen_id_card = "กรุณากรอกเลขบัตรประชาชน 13 หลักให้ถูกต้อง";
    }
    if (!telPattern.test(newFarmerData.f_tel)) {
      errors.f_tel =
        "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก ที่ขึ้นต้นด้วย 0 ให้ถูกต้อง";
    }

    if (Object.keys(errors).length > 0) {
      setAddFormErrors(errors);
      return;
    }

    try {
      await axios.post("http://127.0.0.1:5000/farmers", newFarmerData);
      handleCloseAddModal();
      setModalInfo({
        show: true,
        type: "success",
        message: "เพิ่มข้อมูลเกษตรกรสำเร็จ",
      });
      fetchFarmers();
    } catch (error) {
      console.error("Error adding farmer:", error.response); // ★★★ แก้ไข: ปิด Modal "เพิ่มเกษตรกร" ก่อน ★★★

      handleCloseAddModal(); // ★★★ แล้วจึงแสดง Modal "ข้อผิดพลาด" ★★★

      setModalInfo({
        show: true,
        type: "error",
        message: error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก",
      });
    }
  }; // --- กรองข้อมูล ---

  const filteredFarmers = farmers.filter(
    (farmer) =>
      (farmer.f_name &&
        farmer.f_name.toLowerCase().includes(searchTerm.toLowerCase())) || // Check if f_name exists
      (farmer.f_tel &&
        farmer.f_tel.toLowerCase().includes(searchTerm.toLowerCase())) // Check if f_tel exists
  );

  if (loading && farmers.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <p className="text-xl">กำลังโหลด...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-0 flex flex-col items-center transition-colors duration-300">
      <ResultModal
        show={modalInfo.show}
        type={modalInfo.type}
        message={modalInfo.message}
        onClose={handleCloseResultModal}
      />
      <ConfirmModal
        show={confirmInfo.show}
        message={confirmInfo.message}
        onConfirm={confirmInfo.onConfirm}
        onClose={handleCloseConfirmModal}
        confirmText="ยืนยันการลบ"
        confirmColor="red"
      />
      {/* Edit Modal */}
      {editModalOpen && editingFarmer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              แก้ไขข้อมูลเกษตรกร (ID: {editingFarmer.f_id})
            </h3>
            <FarmerForm
              formData={editingFarmer}
              errors={editFormErrors}
              onChange={handleEditFormChange}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseEditModal}
              isEditMode={true}
            />
          </div>
        </div>
      )}
      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              ลงทะเบียนเกษตรกรใหม่
            </h3>
            <FarmerForm
              formData={newFarmerData}
              errors={addFormErrors}
              onChange={handleAddFormChange}
              onSubmit={handleAddSubmit}
              onCancel={handleCloseAddModal}
              isEditMode={false}
            />
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          จัดการข้อมูลเกษตรกร
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          เพิ่ม ลบ และแก้ไขข้อมูลเกษตรกรในระบบ
        </p>
        {error && !loading && (
          <p className="text-red-500 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 w-full max-w-6xl">
        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 md:p-6">
          <div className="w-full sm:w-1/2">
            <label
              htmlFor="farmer-search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              ค้นหาเกษตรกร
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                id="farmer-search"
                placeholder="ค้นหาด้วยชื่อ หรือ เบอร์โทรศัพท์..."
                className="block w-full p-3 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 bg-green-100 text-green-700 font-medium py-2 px-4 rounded-lg hover:bg-green-200 transition-colors dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
          >
            <PlusCircle size={20} />
            เพิ่มเกษตรกร
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  รหัส
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  ชื่อ-นามสกุล
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  ที่อยู่
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading && farmers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    กำลังโหลด...
                  </td>
                </tr>
              ) : filteredFarmers.length > 0 ? (
                filteredFarmers.map((farmer) => (
                  <tr
                    key={farmer.f_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                    onDoubleClick={() => handleEditClick(farmer)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {farmer.f_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {farmer.f_name}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate"
                      title={farmer.f_address}
                    >
                      {farmer.f_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleEditClick(farmer)}
                          className="text-yellow-600 hover:text-yellow-900 transition dark:text-yellow-400 dark:hover:text-yellow-200"
                          title="แก้ไข"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(farmer.f_id, farmer.f_name)}
                          className="text-red-600 hover:text-red-900 transition dark:text-red-400 dark:hover:text-red-200"
                          title="ลบ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    -- ไม่พบข้อมูล --
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FarmerManagement;
