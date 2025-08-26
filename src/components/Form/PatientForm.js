import React, { useState } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// FileUpload Component
const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        id="imageUpload"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <label
        htmlFor="imageUpload"
        className="cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">คลิกเพื่ออัพโหลดรูปภาพ</p>
          </>
        )}
      </label>
    </div>
  );
};

// InputField Component
const InputField = ({ label, placeholder, type = "text", value, onChange }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

// SelectField Component
const SelectField = ({ label, options, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const PatientForm = () => {
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isVNModalOpen, setIsVNModalOpen] = useState(false);

  // ข้อมูลผู้ป่วย
  const [patientData, setPatientData] = useState({
    hn: '',
    idCard: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    age: '',
    gender: '',
    religion: '',
    nationality: '',
    race: '',
    bloodGroup: '',
    houseNumber: '',
    village: '',
    subDistrict: '',
    district: '',
    province: '',
    chronicDisease: '',
    contactPhone: ''
  });

  const navigate = useNavigate();
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

  // ข้อมูลผู้ติดต่อฉุกเฉิน
  const [emergencyContacts, setEmergencyContacts] = useState([
    {
      id: 1,
      name: 'นางสาววรรณา ใจดี',
      relationship: 'มารดา',
      phone: '081-234-5678',
      address: '123 หมู่ 5 ตำบลบ้านใหม่ อำเภอเมือง จังหวัดเชียงใหม่'
    },
    {
      id: 2,
      name: 'นายสมชาย ใจดี',
      relationship: 'บิดา',
      phone: '089-876-5432',
      address: '123 หมู่ 5 ตำบลบ้านใหม่ อำเภอเมือง จังหวัดเชียงใหม่'
    }
  ]);

  const [newAllergy, setNewAllergy] = useState({
    type: 'drug', // 'drug' or 'food'
    name: '',
    severity: 'mild', // 'mild', 'moderate', 'severe'
    symptoms: '',
    notes: ''
  });

  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    address: ''
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

  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => {
    setIsContactModalOpen(false);
    setNewContact({
      name: '',
      relationship: '',
      phone: '',
      address: ''
    });
  };

  const openConfirmModal = () => setIsConfirmModalOpen(true);
  const closeConfirmModal = () => setIsConfirmModalOpen(false);

  const openVNModal = () => setIsVNModalOpen(true);
  const closeVNModal = () => setIsVNModalOpen(false);

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

  // ฟังก์ชันเพิ่มผู้ติดต่อฉุกเฉิน
  const addContact = () => {
    if (newContact.name.trim() && newContact.relationship.trim() && newContact.phone.trim()) {
      setEmergencyContacts([...emergencyContacts, { ...newContact, id: Date.now() }]);
      closeContactModal();
    }
  };

  // ฟังก์ชันลบผู้ติดต่อฉุกเฉิน
  const removeContact = (id) => {
    setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id));
  };

  // ฟังก์ชันบันทึกข้อมูล
  const handleSaveData = () => {
    openConfirmModal();
  };

  // ฟังก์ชันยืนยันการบันทึก
  const confirmSave = () => {
    // จำลองการบันทึกข้อมูล
    console.log('บันทึกข้อมูลผู้ป่วย:', {
      patientData,
      allergies,
      emergencyContacts
    });

    closeConfirmModal();
    openVNModal();
  };

  // ฟังก์ชันไปหน้า AddPatientVN
  const goToAddPatientVN = () => {
    closeVNModal();
    // จำลองการนำทางไปหน้า AddPatientVN
    alert('นำทางไปหน้า AddPatientVN');
  };

  // ฟังก์ชันกลับไปหน้า Patient
  const goToPatientPage = () => {

    navigate('/Patient');
    closeVNModal();
    // จำลองการนำทางกลับไปหน้า Patient
    //  alert('นำทางกลับไปหน้า Patient');
  };

  // ฟังก์ชันอัพเดตข้อมูลผู้ป่วย
  const updatePatientData = (field, value) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen p-6">
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
            <InputField
              label="Hn"
              placeholder="Hn"
              value={patientData.hn}
              onChange={(e) => updatePatientData('hn', e.target.value)}
            />
            <InputField
              label="เลขบัตรประชาชน"
              placeholder="เลขบัตรประชาชน"
              value={patientData.idCard}
              onChange={(e) => updatePatientData('idCard', e.target.value)}
            />
            <InputField
              label="ชื่อ"
              placeholder="ชื่อ"
              value={patientData.firstName}
              onChange={(e) => updatePatientData('firstName', e.target.value)}
            />
            <InputField
              label="นามสกุล"
              placeholder="นามสกุล"
              value={patientData.lastName}
              onChange={(e) => updatePatientData('lastName', e.target.value)}
            />
            <InputField
              label="วัน / เดือน / ปีเกิด"
              placeholder="วัน / เดือน / ปีเกิด"
              value={patientData.birthDate}
              onChange={(e) => updatePatientData('birthDate', e.target.value)}
            />
            <InputField
              label="อายุ"
              placeholder="อายุ"
              value={patientData.age}
              onChange={(e) => updatePatientData('age', e.target.value)}
            />
            <InputField
              label="เพศ"
              placeholder="เพศ"
              value={patientData.gender}
              onChange={(e) => updatePatientData('gender', e.target.value)}
            />
            <InputField
              label="ศาสนา"
              placeholder="ศาสนา"
              value={patientData.religion}
              onChange={(e) => updatePatientData('religion', e.target.value)}
            />
            <InputField
              label="สัญชาติ"
              placeholder="สัญชาติ"
              value={patientData.nationality}
              onChange={(e) => updatePatientData('nationality', e.target.value)}
            />
            <InputField
              label="เชื้อชาติ"
              placeholder="เชื้อชาติ"
              value={patientData.race}
              onChange={(e) => updatePatientData('race', e.target.value)}
            />
            <InputField
              label="กรุ๊ปเลือด"
              placeholder="กรุ๊ปเลือด"
              value={patientData.bloodGroup}
              onChange={(e) => updatePatientData('bloodGroup', e.target.value)}
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ที่อยู่ที่สามารถติดต่อได้ / Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <InputField
              label="บ้านเลขที่"
              placeholder="บ้านเลขที่"
              value={patientData.houseNumber}
              onChange={(e) => updatePatientData('houseNumber', e.target.value)}
            />
            <InputField
              label="หมู่"
              placeholder="หมู่"
              value={patientData.village}
              onChange={(e) => updatePatientData('village', e.target.value)}
            />
            <InputField
              label="ตำบล"
              placeholder="ตำบล"
              value={patientData.subDistrict}
              onChange={(e) => updatePatientData('subDistrict', e.target.value)}
            />
            <InputField
              label="อำเภอ"
              placeholder="อำเภอ"
              value={patientData.district}
              onChange={(e) => updatePatientData('district', e.target.value)}
            />
            <InputField
              label="จังหวัด"
              placeholder="จังหวัด"
              value={patientData.province}
              onChange={(e) => updatePatientData('province', e.target.value)}
            />
          </div>
        </div>

        {/* Allergy and Disease Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ข้อมูลการแพ้</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InputField
              label="โรคประจำตัว"
              placeholder="โรคประจำตัว"
              value={patientData.chronicDisease}
              onChange={(e) => updatePatientData('chronicDisease', e.target.value)}
            />
            <InputField
              label="เบอร์โทรศัพท์ติดต่อ"
              placeholder="เบอร์โทรศัพท์ติดต่อ"
              value={patientData.contactPhone}
              onChange={(e) => updatePatientData('contactPhone', e.target.value)}
            />
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
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${allergy.type === 'drug' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                            {allergy.type === 'drug' ? 'แพ้ยา' : 'แพ้อาหาร'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{allergy.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${allergy.severity === 'severe' ? 'bg-red-100 text-red-800' :
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

        {/* Emergency Contact Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ข้อมูลญาติหรือผู้ติดต่อฉุกเฉิน</h2>

          <div className="mb-4">
            <button
              onClick={openContactModal}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่มผู้ติดต่อฉุกเฉิน</span>
            </button>
          </div>

          {/* Emergency Contacts Table */}
          {emergencyContacts.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความสัมพันธ์</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เบอร์โทรศัพท์</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ที่อยู่</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การกระทำ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emergencyContacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{contact.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {contact.relationship}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{contact.phone}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{contact.address}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => removeContact(contact.id)}
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

      {/* Action Buttons */}
      <div className="flex justify-start space-x-4 mt-8">
        <button
          onClick={handleSaveData}
          className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
        >
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
                  onChange={(e) => setNewAllergy({ ...newAllergy, type: e.target.value })}
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
                  onChange={(e) => setNewAllergy({ ...newAllergy, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`กรอกชื่อ${newAllergy.type === 'drug' ? 'ยา' : 'อาหาร'}ที่แพ้`}
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ระดับความรุนแรง</label>
                <select
                  value={newAllergy.severity}
                  onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
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
                  onChange={(e) => setNewAllergy({ ...newAllergy, symptoms: e.target.value })}
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
                  onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })}
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

      {/* Emergency Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">เพิ่มผู้ติดต่อฉุกเฉิน</h3>
              <button
                onClick={closeContactModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ความสัมพันธ์</label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือกความสัมพันธ์</option>
                  <option value="บิดา">บิดา</option>
                  <option value="มารดา">มารดา</option>
                  <option value="สามี">สามี</option>
                  <option value="ภรรยา">ภรรยา</option>
                  <option value="บุตร">บุตร</option>
                  <option value="บุตรสาว">บุตรสาว</option>
                  <option value="พี่ชาย">พี่ชาย</option>
                  <option value="พี่สาว">พี่สาว</option>
                  <option value="น้องชาย">น้องชาย</option>
                  <option value="น้องสาว">น้องสาว</option>
                  <option value="ปู่">ปู่</option>
                  <option value="ย่า">ย่า</option>
                  <option value="ตา">ตา</option>
                  <option value="ยาย">ยาย</option>
                  <option value="เพื่อน">เพื่อน</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                <textarea
                  value={newContact.address}
                  onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="กรอกที่อยู่"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeContactModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={addContact}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                เพิ่มข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Data Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">ตรวจสอบข้อมูลก่อนบันทึก</h3>
              <button
                onClick={closeConfirmModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* ข้อมูลส่วนตัว */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">ข้อมูลส่วนตัว</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="font-medium">HN:</span> {patientData.hn}</div>
                  <div><span className="font-medium">เลขบัตรประชาชน:</span> {patientData.idCard}</div>
                  <div><span className="font-medium">ชื่อ:</span> {patientData.firstName}</div>
                  <div><span className="font-medium">นามสกุล:</span> {patientData.lastName}</div>
                  <div><span className="font-medium">วันเกิด:</span> {patientData.birthDate}</div>
                  <div><span className="font-medium">อายุ:</span> {patientData.age}</div>
                  <div><span className="font-medium">เพศ:</span> {patientData.gender}</div>
                  <div><span className="font-medium">ศาสนา:</span> {patientData.religion}</div>
                  <div><span className="font-medium">สัญชาติ:</span> {patientData.nationality}</div>
                  <div><span className="font-medium">เชื้อชาติ:</span> {patientData.race}</div>
                  <div><span className="font-medium">กรุ๊ปเลือด:</span> {patientData.bloodGroup}</div>
                </div>
              </div>

              {/* ที่อยู่ */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">ที่อยู่</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                  <div><span className="font-medium">บ้านเลขที่:</span> {patientData.houseNumber}</div>
                  <div><span className="font-medium">หมู่:</span> {patientData.village}</div>
                  <div><span className="font-medium">ตำบล:</span> {patientData.subDistrict}</div>
                  <div><span className="font-medium">อำเภอ:</span> {patientData.district}</div>
                  <div><span className="font-medium">จังหวัด:</span> {patientData.province}</div>
                </div>
              </div>

              {/* ข้อมูลการแพ้ */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">ข้อมูลการแพ้และโรค</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div><span className="font-medium">โรคประจำตัว:</span> {patientData.chronicDisease}</div>
                  <div><span className="font-medium">เบอร์โทรศัพท์:</span> {patientData.contactPhone}</div>
                </div>

                {allergies.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-600 mb-2">รายการสิ่งที่แพ้:</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">ประเภท</th>
                            <th className="px-3 py-2 text-left">ชื่อ</th>
                            <th className="px-3 py-2 text-left">ความรุนแรง</th>
                            <th className="px-3 py-2 text-left">อาการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allergies.map((allergy, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-3 py-2">{allergy.type === 'drug' ? 'แพ้ยา' : 'แพ้อาหาร'}</td>
                              <td className="px-3 py-2">{allergy.name}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${allergy.severity === 'severe' ? 'bg-red-100 text-red-800' :
                                  allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                  {allergy.severity === 'severe' ? 'รุนแรง' :
                                    allergy.severity === 'moderate' ? 'ปานกลาง' : 'เล็กน้อย'}
                                </span>
                              </td>
                              <td className="px-3 py-2">{allergy.symptoms}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* ผู้ติดต่อฉุกเฉิน */}
              {emergencyContacts.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">ผู้ติดต่อฉุกเฉิน</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">ชื่อ-นามสกุล</th>
                          <th className="px-3 py-2 text-left">ความสัมพันธ์</th>
                          <th className="px-3 py-2 text-left">เบอร์โทร</th>
                          <th className="px-3 py-2 text-left">ที่อยู่</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emergencyContacts.map((contact, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-3 py-2 font-medium">{contact.name}</td>
                            <td className="px-3 py-2">{contact.relationship}</td>
                            <td className="px-3 py-2">{contact.phone}</td>
                            <td className="px-3 py-2">{contact.address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end space-x-3 mt-6 border-t pt-4">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                แก้ไข
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ยืนยันบันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VN/AN Modal */}
      {isVNModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">บันทึกข้อมูลสำเร็จ!</h3>
              <p className="text-gray-600 mb-6">ต้องการเปิดเลข VN/AN ให้กับผู้ป่วยรายนี้หรือไม่?</p>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={goToPatientPage}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ไม่เปิด
                </button>
                <button
                  onClick={goToAddPatientVN}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  เปิดเลข VN/AN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForm;