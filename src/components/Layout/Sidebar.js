
import React from 'react';
import {
  Home,
  Users,
  Settings,
  Bell,
  HelpCircle
} from 'lucide-react';

// ในการทำให้ลิงก์มีสถานะ 'active' และ 'inactive'
// เราต้องทราบว่าหน้าปัจจุบันคือหน้าไหน
// วิธีที่ง่ายที่สุดคือการใช้ window.location.pathname
// ซึ่งจะบอกเราว่า URL ของหน้าปัจจุบันคืออะไร
const Sidebar = ({ isSidebarOpen }) => {
  const currentPath = window.location.pathname;

  const getLinkClass = (path) => {
    // ตรวจสอบว่า path ที่รับมาตรงกับ URL ปัจจุบันหรือไม่
    const isActive = currentPath === path;
    
    // คลาสพื้นฐานสำหรับทุกๆ ลิงก์
    const baseClasses = 'flex items-center space-x-3 p-2 rounded-lg transition-colors';
    
    // คลาสที่จะถูกเพิ่มเข้ามาเมื่อเป็น 'active' หรือ 'inactive'
    const activeClass = 'bg-slate-700';
    const inactiveClass = 'hover:bg-slate-700';
    
    // ใช้ Template literals เพื่อรวมคลาสเข้าด้วยกัน
    return `${baseClasses} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-slate-800 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-slate-800 font-bold text-sm">S</span>
          </div>
          {isSidebarOpen && <span className="font-semibold">SENIZENS</span>}
        </div>
      </div>

      {/* Quick Access */}
      <div className="p-4">
        {isSidebarOpen && <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Quick Access</h3>}
        <nav className="space-y-2">
          {/* ใช้ฟังก์ชัน getLinkClass() ในการกำหนด className */}
          <a href="/dashboard" className={getLinkClass('/dashboard')}>
            <Home size={20} />
            {isSidebarOpen && <span>Dashboard</span>}
          </a>
          <a href="/Patient" className={getLinkClass('/Patient')}>
            <Users size={20} />
            {isSidebarOpen && <span>Patient</span>}
          </a>
          <a href="/Settings" className={getLinkClass('/Settings')}>
            <Settings size={20} />
            {isSidebarOpen && <span>System Setting</span>}
          </a>
        </nav>
      </div>

      {/* Account Section */}
      <div className="mt-auto p-4 border-t border-slate-700">
        {isSidebarOpen && <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Account</h3>}
        <nav className="space-y-2">
          <a href="#" className={getLinkClass('/notifications')}>
            <Bell size={20} />
            {isSidebarOpen && <span>Notifications</span>}
          </a>
          <a href="#" className={getLinkClass('/account-settings')}>
            <Settings size={20} />
            {isSidebarOpen && <span>Settings</span>}
          </a>
          <a href="#" className={getLinkClass('/faq')}>
            <HelpCircle size={20} />
            {isSidebarOpen && <span>FAQ</span>}
          </a>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;