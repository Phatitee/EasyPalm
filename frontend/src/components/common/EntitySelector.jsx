// src/components/common/EntitySelector.jsx
import React, { useState, useMemo } from 'react';
import { Search, User, Factory } from 'lucide-react'; // เพิ่ม Factory Icon

const EntitySelector = ({
    entityType = 'farmer', // 'farmer' or 'industry'
    entities, // array of all entities (farmers or industries)
    selectedEntity, // the currently selected entity object
    onSelect, // function to call when an entity is selected
    onClear, // function to call when clearing selection
    loading = false,
    error = null
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEntities = useMemo(() => {
        if (!entities || searchTerm === '') return [];
        const term = searchTerm.toLowerCase();
        return entities.filter(entity =>
            (entity.f_name && entity.f_name.toLowerCase().includes(term)) || // Farmer name
            (entity.F_name && entity.F_name.toLowerCase().includes(term))    // Industry name
        );
    }, [entities, searchTerm]);

    const Icon = entityType === 'farmer' ? User : Factory;
    const label = entityType === 'farmer' ? 'เกษตรกรผู้ขาย' : 'ลูกค้า (โรงงาน)';
    const placeholder = entityType === 'farmer' ? 'ค้นหาชื่อเกษตรกร...' : 'ค้นหาชื่อลูกค้าโรงงาน...';
    const idField = entityType === 'farmer' ? 'f_id' : 'F_id';
    const nameField = entityType === 'farmer' ? 'f_name' : 'F_name';
    const addressField = entityType === 'farmer' ? 'f_address' : 'F_address';
    const bgColor = entityType === 'farmer' ? 'green' : 'blue';

    const handleSelect = (entity) => {
        onSelect(entity);
        setSearchTerm('');
    };

    if (loading) return <p>กำลังโหลดข้อมูล {label}...</p>;
    if (error) return <p className={`text-red-500`}>เกิดข้อผิดพลาดในการโหลด {label}</p>;

    return (
        <div className={`bg-white p-6 rounded-xl shadow-md`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`flex-shrink-0 bg-${bgColor}-100 text-${bgColor}-600 p-2 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-700">{label}</h2>
                    <p className="text-sm text-gray-500">ค้นหาและเลือก{label}ที่จะทำรายการ</p>
                </div>
            </div>

            {selectedEntity ? (
                <div className={`flex items-center justify-between p-4 bg-${bgColor}-50 border border-${bgColor}-200 rounded-lg`}>
                    <div>
                        <p className="text-sm font-medium text-gray-700">{selectedEntity[idField]}</p>
                        <p className="font-semibold text-lg text-gray-900">{selectedEntity[nameField]}</p>
                        <p className="text-sm text-gray-500">{selectedEntity[addressField] || 'ไม่มีข้อมูลที่อยู่'}</p>
                    </div>
                    <button type="button" onClick={onClear} className="font-semibold text-red-500 hover:text-red-700 transition-colors">
                        เปลี่ยน
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        className={`w-full p-3 pl-10 text-base border-gray-300 rounded-lg focus:ring-${bgColor}-500 focus:border-${bgColor}-500 transition`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {filteredEntities.length > 0 ? (
                                filteredEntities.map(entity => (
                                    <li key={entity[idField]} onClick={() => handleSelect(entity)} className="p-3 hover:bg-gray-100 cursor-pointer">
                                        {entity[nameField]}
                                    </li>
                                ))
                            ) : (
                                <li className="p-3 text-gray-500">ไม่พบข้อมูล</li>
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default EntitySelector;