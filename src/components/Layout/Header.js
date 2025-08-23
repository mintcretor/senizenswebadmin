import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

// 1. รับ prop 'toggleSidebar' มาจาก MainLayout เพื่อใช้ในการกดปุ่ม
const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between z-10">
      {/* ===== ส่วนซ้าย: ปุ่มเมนู และชื่อหน้า ===== */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="text-slate-600 hover:text-slate-900 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
          Dashboard
        </h1>
      </div>

      {/* ===== ส่วนกลาง: ช่องค้นหา (แสดงผลบนจอขนาดกลางขึ้นไป) ===== */}
      <div className="hidden md:block w-1/3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search for patient..."
            className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* ===== ส่วนขวา: ไอคอนและการแจ้งเตือน ===== */}
      <div className="flex items-center space-x-5">
        <button className="text-slate-600 hover:text-slate-900 relative">
          <Bell size={22} />
          {/* จุดแดงแจ้งเตือน (ตัวอย่าง) */}
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center space-x-3">
          {/* รูปโปรไฟล์ (ตัวอย่าง) */}
          <div className="w-9 h-9 bg-yellow-500 rounded-full flex items-center justify-center">
             <span className="text-sm font-bold text-slate-800">A</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-800">Admin</p>
            <p className="text-xs text-slate-500">System Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;