import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar'; // สมมติว่า Sidebar อยู่ที่นี่
import Header from '../components/Layout/Header';   // อาจจะมี Header ด้วย

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* อาจจะมี Header ที่มีปุ่มกดเปิด/ปิด Sidebar */}
        <Header toggleSidebar={toggleSidebar} /> 
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* Outlet คือที่ที่ Component ของ Route (เช่น Dashboard, Patient) จะถูกแสดงผล */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;