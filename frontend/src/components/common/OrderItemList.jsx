// src/components/common/OrderItemList.jsx
import React from 'react';
import { PlusCircle, Trash2, X } from 'lucide-react';

const OrderItemList = ({
    items,
    products, // List of available products for dropdown
    stockLevels = {}, // Optional: Stock levels map for sales order { p_id: quantity }
    onItemChange, // (index, field, value) => void
    onRemoveItem, // (index) => void
    onAddItem,
    onClearItems,
    isSalesOrder = false // Flag to determine display logic (stock vs default price)
}) => {

    const getProductOptions = () => {
        return products.map(p => {
            const stockInfo = isSalesOrder
                ? `(คงเหลือ: ${stockLevels[p.p_id] || 0} กก.)`
                : '';
            const isDisabled = isSalesOrder && (!stockLevels[p.p_id] || stockLevels[p.p_id] <= 0);
            return (
                <option key={p.p_id} value={p.p_id} disabled={isDisabled}>
                    {p.p_name} {stockInfo}
                </option>
            );
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            {/* Header and Buttons */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-5 gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-700">
                        {isSalesOrder ? 'รายการสินค้าที่ขาย' : 'รายการสินค้ารับซื้อ'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">เพิ่มรายการสินค้าและระบุจำนวน / ราคาต่อหน่วย</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button type="button" onClick={onAddItem} className={`flex items-center justify-center gap-2 bg-${isSalesOrder ? 'blue' : 'green'}-100 text-${isSalesOrder ? 'blue' : 'green'}-700 font-medium py-2 px-4 rounded-lg hover:bg-${isSalesOrder ? 'blue' : 'green'}-200 transition-colors`}>
                        <PlusCircle size={20} /> เพิ่มรายการ
                    </button>
                    {items.length > 0 && (
                         <button type="button" onClick={onClearItems} className="flex items-center justify-center gap-2 bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg hover:bg-red-200 transition-colors">
                            <X size={20} /> ล้างรายการ
                        </button>
                    )}
                </div>
            </div>

            {/* Items Table/List */}
            {items.length > 0 ? (
                <div className="space-y-2">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-regular text-gray-500 px-2">
                        <div className="col-span-5">ชื่อสินค้า</div>
                        <div className="col-span-2">จำนวน (กก.)</div>
                        <div className="col-span-2">ราคา/หน่วย</div>
                        <div className="col-span-2 text-right">ราคารวม</div>
                        <div className="col-span-1"></div>
                    </div>
                    {/* Item Rows */}
                    {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-center py-2 border-b border-gray-100 last:border-b-0">
                            <select
                                value={item.p_id}
                                onChange={e => onItemChange(index, 'p_id', e.target.value)}
                                className={`col-span-12 md:col-span-5 p-2 border-gray-300 rounded-md focus:ring-${isSalesOrder ? 'blue' : 'green'}-500 focus:border-${isSalesOrder ? 'blue' : 'green'}-500`}
                                required
                            >
                                <option value="">-- เลือกสินค้า --</option>
                                {getProductOptions()}
                            </select>
                            <input
                                type="number"
                                step="any"
                                value={item.quantity}
                                onChange={e => onItemChange(index, 'quantity', e.target.value)}
                                placeholder="จำนวน"
                                className={`col-span-6 md:col-span-2 p-2 border-gray-300 rounded-md focus:ring-${isSalesOrder ? 'blue' : 'green'}-500 focus:border-${isSalesOrder ? 'blue' : 'green'}-500`}
                                required
                            />
                            <input
                                type="number"
                                step="any"
                                value={item.price_per_unit}
                                onChange={e => onItemChange(index, 'price_per_unit', e.target.value)}
                                placeholder={isSalesOrder ? "ราคาขาย" : "ราคา/หน่วย"}
                                className={`col-span-6 md:col-span-2 p-2 border-gray-300 rounded-md focus:ring-${isSalesOrder ? 'blue' : 'green'}-500 focus:border-${isSalesOrder ? 'blue' : 'green'}-500`}
                                required
                            />
                            <p className="col-span-10 md:col-span-2 text-right font-medium text-gray-800 pr-2">
                                {(item.total || 0).toFixed(2)}
                            </p>
                            <button
                                type="button"
                                onClick={() => onRemoveItem(index)}
                                className="col-span-2 md:col-span-1 flex justify-center items-center text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">ยังไม่มีรายการสินค้า</p>
            )}
        </div>
    );
};

export default OrderItemList;