import React, { useState } from 'react';
import FileUpload from './FileUpload';
import InputField from './InputField';
import SelectField from './SelectField';
import { X, Plus, Trash2 } from 'lucide-react';

const PatientForm = () => {
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  // ข้อมูลทดสอบการแพ้
  const [allergies, setAllergies] = useState([
    {
      id: 1,
      type: 'drug',
      name: 'Penicillin',
      severity: 'severe',
      symptoms: 'ผื่นคันทั่วตัว, บวมที่ใบหน้าและลิ้น, หายใจลำบาก',
      notes: 'เกิดอาการทันทีหลังฉีดยา ต้องหลีกเลี่ยงยากลุ่ม Beta-lactam ทั้งหมด'
    },
    {
      id: 2,
      type: 'food',
      name: 'ถั่วลิสง',
      severity: 'moderate',
      symptoms: 'ผื่นแดง, คลื่นไส้, ปวดท้อง',
      notes: 'เกิดอาการภายใน 30 นาทีหลังรับประทาน'
    },
    {
      id: 3,
      type: 'drug',
      name: 'Aspirin',
      severity: 'mild',
      symptoms: 'ผื่นคัน, แสบคอ',
      notes: 'สามารถใช้ Paracetamol แทนได้'
    },
    {
      id: 4,
      type: 'food',
      name: 'กุ้ง',
      severity: 'severe',
      symptoms: 'บวมใบหน้า, คลื่นไส้, ถ่ายเหลว, หายใจลำบาก',
      notes: 'แพ้อาหารทะเลทุกชนิด ต้องหลีกเลี่ยงอาหารที่มีส่วนผสมของอาหารทะเล'
    },
    {
      id: 5,
      type: 'drug',
      name: 'Iodine (สารทึบแสง)',
      severity: 'moderate',
      symptoms: 'ผื่นแดง, คันตัว, ใจสั่น',
      notes: 'เกิดขึ้นตอนเอ็กซ์เรย์ CT Scan ต้องแจ้งแพทย์ก่อนทำภาพวินิจฉัย'
    },
    {
      id: 6,
      type: 'food',
      name: 'นม',
      severity: 'mild',
      symptoms: 'ปวดท้อง, ถ่ายเหลว, แก๊สในท้อง',
      notes: 'Lactose Intolerance สามารถดื่มนมถั่วเหลืองแทนได้'
    }
  ]);
  const [newAllergy, setNewAllergy] = useState({
    type: 'drug', // 'drug' or 'food'
    name: '',
    severity: 'mild', // 'mild', 'moderate', 'severe'
    symptoms: '',
    notes: ''
  });

  // ฟังก์ชันเปิด/ปิด modal
  const openAllergyModal = () => setIsAllergyModalOpen(true);
  const closeAllergyModal = () => {
    setIsAllergyModalOpen(false);
    setNewAllergy({
      type: 'drug',
      name: '',
      severity: 'mild',
      symptoms: '',
      notes: ''
    });
  };

  // ฟังก์ชันเพิ่มข้อมูลการแพ้
  const addAllergy = () => {
    if (newAllergy.name.trim()) {
      setAllergies([...allergies, { ...newAllergy, id: Date.now() }]);
      closeAllergyModal();
    }
  };

  // ฟังก์ชันลบข้อมูลการแพ้
  const removeAllergy = (id) => {
    setAllergies(allergies.filter(allergy => allergy.id !== id));
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      {/* Form Sections Container */}
      <div className="bg-white p-8 rounded-lg shadow-md">

        <div className="mb-6"> 
          <h1 className="text-2xl font-bold text-gray-800">
            เพิ่มผู้รับบริการใหม่
          </h1>
        </div>
        
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
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={openAllergyModal}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>เพิ่มข้อมูลแพ้</span>
              </button>
            </div>

            {/* Allergy Table */}
            {allergies.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสิ่งที่แพ้</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ระดับความรุนแรง</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อาการ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมายเหตุ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allergies.map((allergy) => (
                      <tr key={allergy.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            allergy.type === 'drug' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {allergy.type === 'drug' ? 'แพ้ยา' : 'แพ้อาหาร'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{allergy.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            allergy.severity === 'severe' ? 'bg-red-100 text-red-800' :
                            allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {allergy.severity === 'severe' ? 'รุนแรง' :
                             allergy.severity === 'moderate' ? 'ปานกลาง' : 'เล็กน้อย'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{allergy.symptoms}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{allergy.notes}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            onClick={() => removeAllergy(allergy.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

      {/* Allergy Modal */}
      {isAllergyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">เพิ่มข้อมูลการแพ้</h3>
              <button 
                onClick={closeAllergyModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทการแพ้</label>
                <select 
                  value={newAllergy.type}
                  onChange={(e) => setNewAllergy({...newAllergy, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="drug">แพ้ยา</option>
                  <option value="food">แพ้อาหาร</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ{newAllergy.type === 'drug' ? 'ยา' : 'อาหาร'}ที่แพ้
                </label>
                <input 
                  type="text"
                  value={newAllergy.name}
                  onChange={(e) => setNewAllergy({...newAllergy, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`กรอกชื่อ${newAllergy.type === 'drug' ? 'ยา' : 'อาหาร'}ที่แพ้`}
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ระดับความรุนแรง</label>
                <select 
                  value={newAllergy.severity}
                  onChange={(e) => setNewAllergy({...newAllergy, severity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mild">เล็กน้อย</option>
                  <option value="moderate">ปานกลาง</option>
                  <option value="severe">รุนแรง</option>
                </select>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">อาการที่เกิดขึ้น</label>
                <textarea 
                  value={newAllergy.symptoms}
                  onChange={(e) => setNewAllergy({...newAllergy, symptoms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="อธิบายอาการที่เกิดขึ้น เช่น ผื่นคัน, บวม, หายใจลำบาก"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
                <textarea 
                  value={newAllergy.notes}
                  onChange={(e) => setNewAllergy({...newAllergy, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={closeAllergyModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={addAllergy}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                เพิ่มข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForm;