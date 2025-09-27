import React, { useState } from 'react';
import PatientForm from '../components/Form/PatientForm'; // ใช้ PatientForm เดียวกัน
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EditPatient = () => {
  const navigate = useNavigate();

  // ฟังก์ชันสำหรับย้อนกลับ
  const handleGoBack = () => {
    navigate('/Patient');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Header Section with Back Button - Responsive */}
          <div className="mb-4 sm:mb-6">
            {/* Page Title - Responsive */}
            <div className="px-2 sm:px-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                แก้ไขข้อมูลผู้รับบริการ
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                แก้ไขข้อมูลผู้รับบริการในระบบ
              </p>
            </div>
          </div>

          {/* Patient Form - ใช้ PatientForm เดียวกันกับ AddPatient */}
          <div className="w-full">
            <PatientForm mode="edit" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPatient;