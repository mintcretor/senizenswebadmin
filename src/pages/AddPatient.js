// src/pages/AddPatient.js

import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import PatientForm from '../components/Form/PatientForm';
import { Menu, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddPatient = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // ฟังก์ชันสำหรับย้อนกลับ
  const handleGoBack = () => {
    // วิธีที่ 1: ย้อนกลับไปหน้าก่อนหน้า
    navigate(-1);
  };

  // ฟังก์ชันสำหรับเปิด/ปิด sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar - Hidden on mobile, visible on desktop */}


      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
  

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Header Section with Back Button - Responsive */}
          <div className="mb-4 sm:mb-6">
            

            {/* Page Title - Responsive */}
            <div className="px-2 sm:px-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                เพิ่มผู้รับบริการใหม่
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                กรอกข้อมูลผู้รับบริการใหม่ในระบบ
              </p>
            </div>
          </div>

          {/* Patient Form - The form itself should handle its own responsiveness */}
          <div className="w-full">
            <PatientForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;