import React from 'react';
import FileUpload from './FileUpload';
import InputField from './InputField';
import SelectField from './SelectField';

const PatientForm = () => {
  return (
    <div className="flex flex-col p-8 bg-gray-100 min-h-screen">
      {/* Form Sections Container */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* Personal Info Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">ข้อมูลส่วนตัว</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Upload Column */}
          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg h-full">
            <FileUpload />
          </div>

          {/* Form Fields Column */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Hn" placeholder="Hn" />
            <InputField label="เลขบัตรประชาชน" placeholder="เลขบัตรประชาชน" />
            <InputField label="ชื่อ" placeholder="ชื่อ" />
            <InputField label="นามสกุล" placeholder="นามสกุล" />
            <InputField label="วัน / เดือน / ปีเกิด" placeholder="วัน / เดือน / ปีเกิด" />
            <InputField label="อายุ" placeholder="อายุ" />
            <InputField label="เพศ" placeholder="เพศ" />
            <InputField label="ศาสนา" placeholder="ศาสนา" />
            <InputField label="สัญชาติ" placeholder="สัญชาติ" />
            <InputField label="เชื้อชาติ" placeholder="เชื้อชาติ" />
            <InputField label="กรุ๊ปเลือด" placeholder="กรุ๊ปเลือด" />
          </div>
        </div>
        
        {/* Address Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ที่อยู่ที่สามารถติดต่อได้ / Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <InputField label="บ้านเลขที่" placeholder="บ้านเลขที่" />
            <InputField label="หมู่" placeholder="หมู่" />
            <InputField label="ตำบล" placeholder="ตำบล" />
            <InputField label="อำเภอ" placeholder="อำเภอ" />
            <InputField label="จังหวัด" placeholder="จังหวัด" />
          </div>
        </div>

        {/* Allergy and Disease Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ข้อมูลการแพ้</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InputField label="โรคประจำตัว" placeholder="โรคประจำตัว" />
            <InputField label="เบอร์โทรศัพท์ติดต่อ" placeholder="เบอร์โทรศัพท์ติดต่อ" />
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="flex-1">
              <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                เพิ่มข้อมูลแพ้
              </button>
            </div>
            <div className="flex-1">
              {/* This is a placeholder for the table, since the provided components don't create it directly */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-start space-x-4 mt-8">
        <button className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
          บันทึกข้อมูล
        </button>
        <button className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors">
          ยกเลิก
        </button>
      </div>
    </div>
  );
};

export default PatientForm;