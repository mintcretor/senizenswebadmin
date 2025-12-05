import React from 'react';
import { Search, Filter, X } from 'lucide-react';

function FilterSection({ filters, setFilters, uniqueRooms, uniqueWards }) {
  const handleReset = () => {
    setFilters({ room: '', ward: '', search: '' });
  };

  const hasActiveFilter = filters.room || filters.ward || filters.search;

  return (
    <div className="bg-white border-b border-gray-200 p-6 ">
      <div className="max-w-7xl mx-auto">
        {/* FILTER TITLE */}
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-blue-600" />
          <h3 className="font-bold text-gray-900">ค้นหาและกรอง</h3>
        </div>

        {/* FILTER INPUTS */}
        <div className="flex gap-4 items-end flex-wrap">
          {/* ROOM FILTER */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">ห้อง (Room)</label>
            <select 
              value={filters.room}
              onChange={(e) => setFilters({...filters, room: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">ทั้งหมด</option>
              {uniqueRooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          {/* WARD FILTER */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
            <select 
              value={filters.ward}
              onChange={(e) => setFilters({...filters, ward: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">ทั้งหมด</option>
              {uniqueWards.map(ward => (
                <option key={ward} value={ward}>Ward {ward}</option>
              ))}
            </select>
          </div>

          {/* SEARCH FILTER */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหาชื่อผู้ป่วย</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="ค้นหาชื่อ นามสกุล..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* RESET BUTTON */}
          {hasActiveFilter && (
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition flex items-center gap-2"
            >
              <X size={18} />
              รีเซ็ต
            </button>
          )}
        </div>

        {/* ACTIVE FILTERS DISPLAY */}
        {hasActiveFilter && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">ตัวกรองที่ใช้:</span>
            {filters.room && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                ห้อง: {filters.room}
              </span>
            )}
            {filters.ward && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Ward: {filters.ward}
              </span>
            )}
            {filters.search && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                ค้นหา: "{filters.search}"
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterSection;
