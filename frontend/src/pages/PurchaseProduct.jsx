import { useState } from "react";

export default function PurchaseForm() {
  const [receiptNo] = useState("INV0005"); // หมายเลขใบเสร็จ mock
  const [dateTime] = useState(new Date().toLocaleString());
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    type: "ปาล์มทลาย",
    qty: "",
    price: "",
  });

  const totalPrice = items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const addItem = () => {
    if (!form.qty || !form.price) return;
    setItems([
      ...items,
      { ...form, qty: Number(form.qty), price: Number(form.price) },
    ]);
    setForm({ type: "ปาล์มทลาย", qty: "", price: "" });
    setOpen(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto mt-6 border rounded-xl shadow bg-white">
      <h1 className="text-2xl font-bold mb-4">บันทึกการซื้อจากเกษตรกร</h1>

      {/* ข้อมูลใบเสร็จ */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="font-medium">หมายเลขใบเสร็จ</label>
          <p className="border rounded p-2 bg-gray-50">{receiptNo}</p>
        </div>
        <div>
          <label className="font-medium">วันที่/เวลา</label>
          <p className="border rounded p-2 bg-gray-50">{dateTime}</p>
        </div>
      </div>

      {/* รายการสินค้า */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">รายการสินค้า</h2>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => setOpen(true)}
          >
            + เพิ่มสินค้า
          </button>
        </div>

        {items.length > 0 ? (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">สินค้า</th>
                <th className="p-2 border">จำนวน (kg)</th>
                <th className="p-2 border">ราคาต่อกิโล</th>
                <th className="p-2 border">ราคารวม</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="border p-2">{it.type}</td>
                  <td className="border p-2 text-right">{it.qty}</td>
                  <td className="border p-2 text-right">{it.price}</td>
                  <td className="border p-2 text-right">
                    {(it.qty * it.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">ยังไม่มีการเพิ่มสินค้า</p>
        )}
      </div>

      {/* ราคารวม */}
      <div className="text-right font-bold text-lg mb-6">
        ราคารวม: {totalPrice.toLocaleString()} บาท
      </div>

      {/* Modal เพิ่มสินค้า */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow w-96">
            <h3 className="text-lg font-semibold mb-4">เพิ่มสินค้า</h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-1">ประเภทสินค้า</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                  className="border rounded p-2 w-full"
                >
                  <option>ปาล์มทลาย</option>
                  <option>ปาล์มร่วง</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">จำนวน (kg)</label>
                <input
                  type="number"
                  value={form.qty}
                  onChange={(e) =>
                    setForm({ ...form, qty: e.target.value })
                  }
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block mb-1">ราคาต่อกิโล (บาท)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  className="border rounded p-2 w-full"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  onClick={addItem}
                >
                  บันทึกสินค้า
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
