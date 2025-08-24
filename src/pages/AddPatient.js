// src/pages/AddPatient.js

import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import PatientForm from '../components/Form/PatientForm';
import { Menu, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // เพิ่ม import นี้

const AddPatient = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate(); // เพิ่มบรรทัดนี้

  // ฟังก์ชันสำหรับย้อนกลับ
  const handleGoBack = () => {
    // วิธีที่ 1: ย้อนกลับไปหน้าก่อนหน้า
    navigate(-1);
    
    // วิธีที่ 2: ไปหน้าผู้รับบริการโดยตรง (ถ้าต้องการ)
    // navigate('/patients');
    
    // วิธีที่ 3: ถ้าไม่ใช้ React Router
    // window.history.back();
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <div className="flex-1 p-8">
        {/* Header Section with Back Button */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>ย้อนกลับ</span>
            </button>
          </div>
       
        </div>

        {/* Patient Form */}
        <PatientForm />
      </div>
    </div>
  );
};

export default AddPatient;