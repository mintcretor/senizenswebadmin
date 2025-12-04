import React, { useState } from 'react';
import { FileText } from 'lucide-react';

const AdmitDocumentWord = () => {
  const [formData, setFormData] = useState({
    // ข้อมูลส่วนตัว
    prename: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    age: '',
    gender: '',
    idCard: '',
    hn: '',
    phone: '',
    email: '',
    
    // ข้อมูลการเข้าพัก
    startDate: '',
    endDate: '',
    roomType: '',
    roomNumber: '',
    duration: '',
    deposit: '',
    checkInTime: '',
    
    // กรณีฉุกเฉิน
    emergencyContact1: '',
    emergencyRelation1: '',
    emergencyPhone1: '',
    emergencyContact2: '',
    emergencyRelation2: '',
    emergencyPhone2: '',
    
    // ประวัติทางการแพทย์
    underlyingDisease: '',
    pastMedicalHistory: '',
    allergy: '',
    currentMedication: '',
    
    // ข้อกำหนด (8 ข้อ)
    requirement1: false,
    requirement2: false,
    requirement3: false,
    requirement4: false,
    requirement5: false,
    requirement6: false,
    requirement7: false,
    requirement8: false,
    
    // เป้าหมาย
    caregiverTraining: false,
    palliativeCare: false,
    ambulationTraining: false,
    improvingNutrition: false,
    socialization: false,
    relievePain: false,
    otherGoal: '',
    
    // ผลการประเมิน
    canAdmit: '',
    admitDateResult: '',
    floor: '',
    room: '',
    estimateDuration: '',
    longTerm: false,
    assessor: '',
    assessDate: '',
    roomBooker: '',
    bookDate: '',
  });

  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleExportToWord = () => {
    const fileName = `เอกสาร_Admit_${formData.firstName}_${formData.hn || 'HN'}.docx`;
    // ✅ ใช้ exportToWord จาก VNPatient.js หรือ wordExportUtils
    alert('ขณะนี้ยังไม่มี export function - กรุณาเพิ่มปุ่มใน VNPatient.js แล้วใช้ exportToWord ที่มีอยู่');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        แบบคัดกรองผู้สูงอายุเพื่อเข้าพัก The Senizens
      </h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          📋 กรอกข้อมูลในแบบฟอร์มด้านล่าง
        </p>
      </div>

      {/* ฟอร์มกรอกข้อมูล */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form className="space-y-6">
          {/* ข้อมูลทั่วไป */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">👤 ข้อมูลทั่วไป</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">คำนำหน้า</label>
                <input
                  type="text"
                  name="prename"
                  placeholder="เช่น นาง, นาย, ด.ญ."
                  value={formData.prename}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อจริง</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">นามสกุล</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">วันเกิด</label>
                <input
                  type="text"
                  name="birthDate"
                  placeholder="26/01/2536"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">อายุ</label>
                <input
                  type="text"
                  name="age"
                  placeholder="32 ปี 5 เดือน 8 วัน"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">เพศ</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">เลือก</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">เลขบัตรประชาชน</label>
                <input
                  type="text"
                  name="idCard"
                  value={formData.idCard}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">HN</label>
                <input
                  type="text"
                  name="hn"
                  value={formData.hn}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          {/* ข้อมูลการเข้าพัก */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">🏥 ข้อมูลการเข้าพัก</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">วันที่เข้าพัก</label>
                <input
                  type="text"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">วันที่สิ้นสุด</label>
                <input
                  type="text"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">เวลา</label>
                <input
                  type="text"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ประเภทห้อง</label>
                <input
                  type="text"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">หมายเลขห้อง</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ระยะเวลา</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">เงินประกัน</label>
                <input
                  type="text"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          {/* กรณีฉุกเฉิน */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">🚨 กรณีฉุกเฉิน</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ผู้ติดต่อ 1</label>
                <input
                  type="text"
                  name="emergencyContact1"
                  value={formData.emergencyContact1}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ความสัมพันธ์</label>
                <input
                  type="text"
                  name="emergencyRelation1"
                  value={formData.emergencyRelation1}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">โทร</label>
                <input
                  type="text"
                  name="emergencyPhone1"
                  value={formData.emergencyPhone1}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ผู้ติดต่อ 2</label>
                <input
                  type="text"
                  name="emergencyContact2"
                  value={formData.emergencyContact2}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ความสัมพันธ์</label>
                <input
                  type="text"
                  name="emergencyRelation2"
                  value={formData.emergencyRelation2}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">โทร</label>
                <input
                  type="text"
                  name="emergencyPhone2"
                  value={formData.emergencyPhone2}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          {/* ประวัติทางการแพทย์ */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">💊 ประวัติทางการแพทย์</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">โรคประจำตัว</label>
                <textarea
                  name="underlyingDisease"
                  rows="2"
                  value={formData.underlyingDisease}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ประวัติการผ่าตัด</label>
                <textarea
                  name="pastMedicalHistory"
                  rows="2"
                  value={formData.pastMedicalHistory}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ประวัติการแพ้ยา & อาหาร</label>
                <textarea
                  name="allergy"
                  rows="2"
                  value={formData.allergy}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ยาที่ใช้ประจำ</label>
                <textarea
                  name="currentMedication"
                  rows="2"
                  value={formData.currentMedication}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          {/* ข้อกำหนดการรับผู้สูงอายุ */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">✅ ข้อกำหนดการรับผู้สูงอายุ</h2>
            <p className="text-sm text-red-600 mb-3">หากมีความผิดปกติข้อใดข้อหนึ่ง ให้พิจารณาไม่สมควรรับเข้าพัก</p>
            <div className="space-y-3">
              {[
                'ไม่มีสภาวะทางอายุรกรรมที่ต้องการการพยาบาลต่อเนื่อง',
                'สัญญาณชีพอยู่ในเกณฑ์',
                'ทำตามคำสั่งอย่างน้อย 3 ขั้นตอน',
                'ไม่มีภาวะ Uncontrolled infection',
                'ไม่มีภาวะ Uncontrolled DM',
                'ไม่มีภาวะ Uncontrolled seizure',
                'ไม่มีภาวะ Uncontrolled psychological symptoms',
                'ไม่มีภาวะ Pressure Ulcer grade >= 3'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    name={`requirement${index + 1}`}
                    checked={formData[`requirement${index + 1}`]}
                    onChange={handleInputChange}
                    className="w-5 h-5"
                  />
                  <label className="text-sm">{index + 1}. {item}</label>
                </div>
              ))}
            </div>
          </div>

          {/* เป้าประสงค์ */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">🎯 เป้าประสงค์ในการเข้าพัก</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'caregiverTraining', label: 'Caregiver Training' },
                { name: 'palliativeCare', label: 'Palliative Care' },
                { name: 'ambulationTraining', label: 'Ambulation Training' },
                { name: 'improvingNutrition', label: 'Improving Nutrition' },
                { name: 'socialization', label: 'Socialization' },
                { name: 'relievePain', label: 'Relieve Pain' }
              ].map((goal) => (
                <div key={goal.name} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    name={goal.name}
                    checked={formData[goal.name]}
                    onChange={handleInputChange}
                    className="w-5 h-5"
                  />
                  <label className="text-sm">{goal.label}</label>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">อื่นๆ</label>
              <input
                type="text"
                name="otherGoal"
                value={formData.otherGoal}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          {/* ผลการประเมิน */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-600">📋 ผลการประเมิน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ผลการประเมิน</label>
                <select
                  name="canAdmit"
                  value={formData.canAdmit}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">เลือก</option>
                  <option value="สามารถเข้าพักได้">สามารถเข้าพักได้</option>
                  <option value="ไม่สามารถเข้าพักได้">ไม่สามารถเข้าพักได้</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">วันที่เข้าพัก</label>
                <input
                  type="text"
                  name="admitDateResult"
                  value={formData.admitDateResult}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ชั้น</label>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ห้อง</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ประมาณระยะเวลา</label>
                <input
                  type="text"
                  name="estimateDuration"
                  value={formData.estimateDuration}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="longTerm"
                  checked={formData.longTerm}
                  onChange={handleInputChange}
                  className="w-5 h-5 mr-2"
                />
                <label className="text-sm font-medium">Long Term</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ผู้ประเมิน</label>
                <input
                  type="text"
                  name="assessor"
                  value={formData.assessor}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">วันที่ประเมิน</label>
                <input
                  type="text"
                  name="assessDate"
                  value={formData.assessDate}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleExportToWord}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
          >
            <FileText size={24} />
            📄 Export เป็น Word
          </button>
        </div>
      </div>

      {/* คำแนะนำ */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2 text-yellow-800">⚠️ หมายเหตุ:</h3>
        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
          <li>ปุ่ม Export อยู่ใน VNPatient.js เท่านั้น</li>
          <li>ไฟล์นี้แค่เป็น Form ตัวอย่าง</li>
        </ul>
      </div>
    </div>
  );
};

export default AdmitDocumentWord;