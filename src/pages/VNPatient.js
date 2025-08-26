import React, { useState, useEffect } from 'react';
import { Upload, ChevronDown, Plus, Edit, Trash2, X } from 'lucide-react';

export default function ThaiServiceForm() {
  const [formData, setFormData] = useState({
    hn: '',
    an: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    clinicType: 'ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง',
    date: '',
    toDate: '',
    building: '',
    floor: 'รายวัน',
    price: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Modal and table data states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Table data
  const [packageData, setPackageData] = useState([]);
  const [medicalData, setMedicalData] = useState([
    { id: 1, name: 'SET เวชภัณฑ์ Suction (ดูดเสมหะ)', price: 8000 },
    { id: 2, name: 'SET เวชภัณฑ์ ให้อาหารทางสายยาง', price: 6000 }
  ]);
  const [contractData, setContractData] = useState([
    { id: 1, name: 'ค่าบริการหัตถการ เครื่องดูดเสมหะ (เดือน)', category: 'หัตถการ (ดูดเสมหะหล่อนพิด)', price: 7000 },
    { id: 2, name: 'ค่าบริการค่าไฟ เครื่องผลิตออกซิเจน (เดือน)', category: 'น้ำเครื่องนาเอง', price: 6000 }
  ]);
  
  // Modal form data
  const [modalForm, setModalForm] = useState({
    name: '',
    category: '',
    price: ''
  });
  
  // Autocomplete states
  const [hnSuggestions, setHnSuggestions] = useState([]);
  const [firstNameSuggestions, setFirstNameSuggestions] = useState([]);
  const [lastNameSuggestions, setLastNameSuggestions] = useState([]);
  const [showHnSuggestions, setShowHnSuggestions] = useState(false);
  const [showFirstNameSuggestions, setShowFirstNameSuggestions] = useState(false);
  const [showLastNameSuggestions, setShowLastNameSuggestions] = useState(false);

  // Mock database data
  const mockPatientData = [
    { hn: 'HN001234', firstName: 'สมชาย', lastName: 'ใจดี', idNumber: '1234567890123' },
    { hn: 'HN001235', firstName: 'สมหญิง', lastName: 'ใจดี', idNumber: '1234567890124' },
    { hn: 'HN001236', firstName: 'สมศักดิ์', lastName: 'เจริญสุข', idNumber: '1234567890125' },
    { hn: 'HN001237', firstName: 'สมใส', lastName: 'มีสุข', idNumber: '1234567890126' },
    { hn: 'HN001238', firstName: 'สมพร', lastName: 'ศรีสุข', idNumber: '1234567890127' },
    { hn: 'HN001239', firstName: 'สมหมาย', lastName: 'วรรณา', idNumber: '1234567890128' },
    { hn: 'HN001240', firstName: 'สมบัติ', lastName: 'เจริญ', idNumber: '1234567890129' },
    { hn: 'HN001241', firstName: 'สมบูรณ์', lastName: 'ใจแก้ว', idNumber: '1234567890130' },
  ];

  // Modal functions
  const openModal = (type) => {
    setModalType(type);
    setModalForm({ name: '', category: '', price: '' });
    setEditingIndex(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalForm({ name: '', category: '', price: '' });
    setEditingIndex(null);
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(),
      name: modalForm.name,
      ...(modalType === 'contract' && { category: modalForm.category }),
      price: parseInt(modalForm.price)
    };

    if (editingIndex !== null) {
      // Edit existing item
      if (modalType === 'package') {
        const updated = [...packageData];
        updated[editingIndex] = { ...updated[editingIndex], ...newItem };
        setPackageData(updated);
      } else if (modalType === 'medical') {
        const updated = [...medicalData];
        updated[editingIndex] = { ...updated[editingIndex], ...newItem };
        setMedicalData(updated);
      } else if (modalType === 'contract') {
        const updated = [...contractData];
        updated[editingIndex] = { ...updated[editingIndex], ...newItem };
        setContractData(updated);
      }
    } else {
      // Add new item
      if (modalType === 'package') {
        setPackageData(prev => [...prev, newItem]);
      } else if (modalType === 'medical') {
        setMedicalData(prev => [...prev, newItem]);
      } else if (modalType === 'contract') {
        setContractData(prev => [...prev, newItem]);
      }
    }
    closeModal();
  };

  const handleEdit = (type, index) => {
    let item;
    if (type === 'package') item = packageData[index];
    else if (type === 'medical') item = medicalData[index];
    else if (type === 'contract') item = contractData[index];

    setModalType(type);
    setEditingIndex(index);
    setModalForm({
      name: item.name,
      category: item.category || '',
      price: item.price.toString()
    });
    setShowModal(true);
  };

  const handleDelete = (type, index) => {
    if (type === 'package') {
      setPackageData(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'medical') {
      setMedicalData(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'contract') {
      setContractData(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Mock API call function
  const searchPatients = async (query, field) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return mockPatientData.filter(patient => {
      if (field === 'hn') {
        return patient.hn.toLowerCase().includes(query.toLowerCase());
      } else if (field === 'firstName') {
        return patient.firstName.toLowerCase().includes(query.toLowerCase());
      } else if (field === 'lastName') {
        return patient.lastName.toLowerCase().includes(query.toLowerCase());
      }
      return false;
    });
  };

  const populateFromHN = (selectedPatient) => {
    setFormData(prev => ({
      ...prev,
      hn: selectedPatient.hn,
      firstName: selectedPatient.firstName,
      lastName: selectedPatient.lastName,
      idNumber: selectedPatient.idNumber
    }));
  };

  useEffect(() => {
    if (formData.clinicType !== 'ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง') {
      console.log('Clinic type changed - AN should become VN');
    }
  }, [formData.clinicType]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (value.length >= 2) {
      if (name === 'hn') {
        const suggestions = await searchPatients(value, 'hn');
        setHnSuggestions(suggestions);
        setShowHnSuggestions(true);
      } else if (name === 'firstName') {
        const suggestions = await searchPatients(value, 'firstName');
        setFirstNameSuggestions(suggestions);
        setShowFirstNameSuggestions(true);
      } else if (name === 'lastName') {
        const suggestions = await searchPatients(value, 'lastName');
        setLastNameSuggestions(suggestions);
        setShowLastNameSuggestions(true);
      }
    } else {
      if (name === 'hn') setShowHnSuggestions(false);
      if (name === 'firstName') setShowFirstNameSuggestions(false);
      if (name === 'lastName') setShowLastNameSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion, field) => {
    if (field === 'hn') {
      populateFromHN(suggestion);
      setShowHnSuggestions(false);
    } else if (field === 'firstName') {
      populateFromHN(suggestion);
      setShowFirstNameSuggestions(false);
    } else if (field === 'lastName') {
      populateFromHN(suggestion);
      setShowLastNameSuggestions(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleInputBlur = (field) => {
    setTimeout(() => {
      if (field === 'hn') setShowHnSuggestions(false);
      if (field === 'firstName') setShowFirstNameSuggestions(false);
      if (field === 'lastName') setShowLastNameSuggestions(false);
    }, 200);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex-1 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">ผู้รับบริการวันที่ 21/07/2568</h1>
      
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg h-full">
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
                    <p className="text-sm text-blue-500 hover:text-blue-600 font-medium">Click to upload</p>
                    <p className="text-sm text-gray-500"> or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-2">JPG, JPEG, PNG</p>
                  </>
                )}
              </label>
            </div>

            {/* Form Fields Section */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* HN Field with Autocomplete */}
              <div className="flex flex-col relative">
                <label className="text-sm font-medium text-gray-700 mb-2">Hn</label>
                <input
                  type="text"
                  name="hn"
                  value={formData.hn}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur('hn')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ค้นหา HN..."
                />
                {showHnSuggestions && hnSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {hnSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion, 'hn')}
                      >
                        <div className="font-medium text-blue-600">{suggestion.hn}</div>
                        <div className="text-sm text-gray-600">{suggestion.firstName} {suggestion.lastName}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AN/VN Field */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  {formData.clinicType === 'ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง' ? 'AN' : 'VN'}
                </label>
                <input
                  type="text"
                  name="an"
                  value={formData.an}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.clinicType === 'ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง' ? 'AN' : 'VN'}
                />
              </div>

              {/* First Name Field with Autocomplete */}
              <div className="flex flex-col relative">
                <label className="text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur('firstName')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ค้นหาชื่อ..."
                />
                {showFirstNameSuggestions && firstNameSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {firstNameSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion, 'firstName')}
                      >
                        <div className="font-medium text-blue-600">{suggestion.firstName} {suggestion.lastName}</div>
                        <div className="text-sm text-gray-600">HN: {suggestion.hn}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Last Name Field with Autocomplete */}
              <div className="flex flex-col relative">
                <label className="text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur('lastName')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ค้นหานามสกุล..."
                />
                {showLastNameSuggestions && lastNameSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {lastNameSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion, 'lastName')}
                      >
                        <div className="font-medium text-blue-600">{suggestion.firstName} {suggestion.lastName}</div>
                        <div className="text-sm text-gray-600">HN: {suggestion.hn}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">เลขบัตรประชาชน</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">คลินิก</label>
                <div className="relative">
                  <select
                    name="clinicType"
                    value={formData.clinicType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง">ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง</option>
                    <option value="คลินิกทั่วไป">คลินิกทั่วไป</option>
                    <option value="คลินิกพิเศษ">คลินิกพิเศษ</option>
                    <option value="คลินิกเด็ก">คลินิกเด็ก</option>
                    <option value="คลินิกอื่นๆ">คลินิกอื่นๆ</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">ระยะเวลาของสัญญา</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">วันที่</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">ถึงวันที่</label>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">ห้อง</label>
                <div className="relative">
                  <select
                    name="building"
                    value={formData.building}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">เลือกห้อง</option>
                    <option value="ห้อง 1">ห้อง 1</option>
                    <option value="ห้อง 2">ห้อง 2</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">ประเภท</label>
                <div className="relative">
                  <select
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="รายวัน">รายวัน</option>
                    <option value="รายเดือน">รายเดือน</option>
                    <option value="รายปี">รายปี</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">ราคา</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="mt-8 space-y-8">
            {/* คอร์สแพ็คเกจกายภาพ Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">คอร์สแพ็คเกจกายภาพ</h2>
                <button
                  onClick={() => openModal('package')}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม
                </button>
              </div>
              
              <div className="border border-blue-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-blue-300">ลำดับ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-blue-300">ชื่อแพคเกจ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-blue-300">ราคา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packageData.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500 bg-gray-50">ไม่มีข้อมูล</td>
                      </tr>
                    ) : (
                      packageData.map((item, index) => (
                        <tr key={item.id} className="border-t border-blue-300">
                          <td className="px-4 py-3 border-r border-blue-300">{index + 1}</td>
                          <td className="px-4 py-3 border-r border-blue-300">{item.name}</td>
                          <td className="px-4 py-3 border-r border-blue-300">{item.price.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit('package', index)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete('package', index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* รายการเหมาเวชภัณฑ์ Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">รายการเหมาเวชภัณฑ์</h2>
                <button
                  onClick={() => openModal('medical')}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม
                </button>
              </div>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ลำดับ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ชื่อแพคเกจ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ราคา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalData.map((item, index) => (
                      <tr key={item.id} className="border-t border-gray-300">
                        <td className="px-4 py-3 border-r border-gray-300">{index + 1}</td>
                        <td className="px-4 py-3 border-r border-gray-300">{item.name}</td>
                        <td className="px-4 py-3 border-r border-gray-300">{item.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit('medical', index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('medical', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* รายการเหมา Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">รายการเหมา</h2>
                <button
                  onClick={() => openModal('contract')}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม
                </button>
              </div>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ลำดับ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ชื่อแพคเกจ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">หมายเหตุ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ราคา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractData.map((item, index) => (
                      <tr key={item.id} className="border-t border-gray-300">
                        <td className="px-4 py-3 border-r border-gray-300">{index + 1}</td>
                        <td className="px-4 py-3 border-r border-gray-300">{item.name}</td>
                        <td className="px-4 py-3 border-r border-gray-300">{item.category}</td>
                        <td className="px-4 py-3 border-r border-gray-300">{item.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit('contract', index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('contract', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingIndex !== null ? 'แก้ไข' : 'เพิ่ม'}
                {modalType === 'package' && 'คอร์สแพ็คเกจกายภาพ'}
                {modalType === 'medical' && 'รายการเหมาเวชภัณฑ์'}
                {modalType === 'contract' && 'รายการเหมา'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {modalType === 'package' && 'ชื่อแพคเกจ'}
                    {modalType === 'medical' && 'ชื่อแพคเกจ'}
                    {modalType === 'contract' && 'ชื่อแพคเกจ'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={modalForm.name}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="กรอกชื่อ..."
                    required
                  />
                </div>

                {modalType === 'contract' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
                    <input
                      type="text"
                      name="category"
                      value={modalForm.category}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="กรอกหมายเหตุ..."
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ราคา</label>
                  <input
                    type="number"
                    name="price"
                    value={modalForm.price}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingIndex !== null ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}