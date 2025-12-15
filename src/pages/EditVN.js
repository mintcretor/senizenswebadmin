import React, { useState, useEffect } from 'react';
import { Upload, ChevronDown, Plus, Edit, Trash2, X, RefreshCw, Package, Search, Printer } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import '../fonts/SarabunNew.js';
import '../fonts/SarabunNewBold.js';
import JsBarcode from 'jsbarcode';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { FileText } from 'lucide-react';
import { calculateMonthsAndDays } from '../utils/dateCalculator.js';
import { generateBarcode } from '../utils/barcodeGenerator.js';
import ImageModule from 'docxtemplater-image-module-free';
import { processPatientName } from '../utils/prenameUtils.js';

const formatThaiDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = (date.getFullYear() + 543).toString();
  return `${day}/${month}/${year}`;
};

const formatWesternDate = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatThaiTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export default function EditVN() {
  const navigate = useNavigate();
  const { vnId } = useParams();
  const location = useLocation();
  const vnFromState = location.state?.vnId || vnId;

  const [currentDate, setCurrentDate] = useState(formatThaiDate(new Date()));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    hn: '',
    an: '',
    prename: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    clinicType: 'STROKE',
    date: '',
    toDate: '',
    building: '',
    floor: 'รายวัน',
    price: '',
    birth_date: '',
    age: '',
    address: '',
    village: '',
    subDistrict: '',
    district: '',
    province: '',
    phone: '',
    email: '',
    lineId: '',
    relationship: '',
    authorizedPerson: '',
    authorizedIdCard: '',
    patientName: '',
    patientAge: '',
    patientIdCard: '',
    startDate: '',
    endDate: '',
    totalMonths: '',
    totalDays: '',
    roomType: '',
    roomNumber: '',
    serviceRate: '',
    nursingRate: '',
    medicalSupplies: '',
    doctorVisitRate: '',
    initialExamFee: '',
    totalServiceFee: '',
    extraDoctorVisitFee: '',
    gender: '',
    finalGender: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patient_id, setPatient_id] = useState(null);
  const [service_id, setService_id] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [generatingAnVn, setGeneratingAnVn] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  // Table data
  const [packageData, setPackageData] = useState([]);
  const [medicalData, setMedicalData] = useState([]);
  const [contractData, setContractData] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [modalForm, setModalForm] = useState({
    name: '',
    category: '',
    price: ''
  });

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Package/Medical/Contract modals
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [selectedPackageForPatient, setSelectedPackageForPatient] = useState(null);
  const [packageDiscount, setPackageDiscount] = useState({ type: 'percent', value: 0 });

  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [availableMedical, setAvailableMedical] = useState([]);
  const [availableContracts, setAvailableContracts] = useState([]);
  const [selectedMedical, setSelectedMedical] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [medicalDiscount, setMedicalDiscount] = useState({ type: 'percent', value: 0 });
  const [contractDiscount, setContractDiscount] = useState({ type: 'percent', value: 0 });

  // ✅ Fetch VN/Service Registration Data - แก้ให้รองรับ flat structure
  const fetchServiceRegistration = async (vnId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/service-registrations/${vnId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch service registration: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch service registration');
      }

      console.log('Fetched service registration:', result.data);

      const serviceReg = result.data;
      setService_id(serviceReg.registration_id);
      setPatient_id(serviceReg.patient_id);

      // ✅ เปลี่ยน structure เพราะ API ส่งมาแบบ flat (ไม่มี patient object)
      setFormData(prev => ({
        ...prev,
        hn: serviceReg.hn || '',
        prename: serviceReg.prename || '',
        firstName: serviceReg.first_name || '',
        lastName: serviceReg.last_name || '',
        idNumber: serviceReg.id_card || '',
        an: serviceReg.service_number || '',
        gender: serviceReg.gender || '',
        date: serviceReg.contract_start_date ? serviceReg.contract_start_date.split('T')[0] : '',
        toDate: serviceReg.contract_end_date ? serviceReg.contract_end_date.split('T')[0] : '',
        building: serviceReg.room_number || '',
        floor: serviceReg.billing_type || 'รายสัปดาห์',
        price: serviceReg.base_price?.toString() || '',
      }));

    } catch (err) {
      console.error('Fetch service registration error:', err);
      setError(`ไม่สามารถโหลดข้อมูล VN ได้: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUniversalSearch = async () => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setError('กรุณากรอกข้อมูลอย่างน้อย 2 ตัวอักษร');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/patients/search?q=${encodeURIComponent(searchQuery.trim())}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const results = await response.json();
      if (results.data && results.data.length > 0) {
        setSearchResults(results.data);
        setShowSearchModal(true);
      } else {
        setSearchResults([]);
        setError('ไม่พบข้อมูลผู้ป่วย');
      }
    } catch (err) {
      console.error('Error searching patients:', err);
      setError('เกิดข้อผิดพลาดในการค้นหา');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPatientFromSearch = (patient) => {
    setFormData(prev => ({
      ...prev,
      hn: patient.hn || '',
      firstName: patient.first_name || patient.firstName || '',
      lastName: patient.last_name || patient.lastName || '',
      idNumber: patient.id_card || patient.idNumber || '',
    }));
    setPatient_id(patient.id);
    if (patient.profile_image) {
      setPreviewUrl(patient.profile_image);
    }

    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success && data.data) {
        const activeDepartments = data.data.filter(dept => dept.is_active);
        setDepartments(activeDepartments);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลแผนก: ${err.message}`);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);
      const response = await fetch(`${API_BASE_URL}/room?active=true`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success && data.data) {
        const sortedRooms = data.data.sort((a, b) =>
          (a.display_order || 0) - (b.display_order || 0)
        );
        setRooms(sortedRooms);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลห้อง: ${err.message}`);
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchAvailablePackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages?active=true`);
      const result = await response.json();
      if (result.success) setAvailablePackages(result.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchAvailableMedical = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medical?active=true`);
      const result = await response.json();
      if (result.success) setAvailableMedical(result.data);
    } catch (error) {
      console.error('Error fetching medical:', error);
    }
  };

  const fetchAvailableContracts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts?active=true`);
      const result = await response.json();
      if (result.success) setAvailableContracts(result.data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchRooms();
    fetchAvailablePackages();
    fetchAvailableMedical();
    fetchAvailableContracts();
  }, []);

  useEffect(() => {
    if (vnFromState) {
      fetchServiceRegistration(vnFromState);
    }
  }, [vnFromState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    const room = rooms.find(r => r.id === parseInt(roomId));

    if (room) {
      setSelectedRoom(room);
      const defaultBillingType = 'รายวัน';
      const defaultPrice = room.daily_price || 0;

      setFormData(prev => ({
        ...prev,
        building: room.room_number,
        roomTypeId: room.id,
        floor: defaultBillingType,
        price: defaultPrice.toString()
      }));
    } else {
      setSelectedRoom(null);
      setFormData(prev => ({
        ...prev,
        building: '',
        roomTypeId: null,
        floor: 'รายวัน',
        price: ''
      }));
    }
  };

  const handleBillingTypeChange = (e) => {
    const billingType = e.target.value;
    setFormData(prev => ({ ...prev, floor: billingType }));

    if (selectedRoom) {
      let price = 0;
      switch (billingType) {
        case 'รายวัน':
          price = selectedRoom.daily_price || 0;
          break;
        case 'รายสัปดาห์':
          price = selectedRoom.weekly_price || 0;
          break;
        case 'รายเดือน':
          price = selectedRoom.monthly_price || 0;
          break;
        default:
          price = 0;
      }
      setFormData(prev => ({ ...prev, price: price.toString() }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const calculatePackagePrice = () => {
    if (!selectedPackageForPatient) return 0;
    const basePrice = selectedPackageForPatient.price;
    const discountAmount = packageDiscount.type === 'percent'
      ? (basePrice * packageDiscount.value) / 100
      : packageDiscount.value;
    return Math.max(0, basePrice - discountAmount);
  };

  const calculateMedicalPrice = () => {
    if (!selectedMedical) return 0;
    const basePrice = selectedMedical.price;
    const discountAmount = medicalDiscount.type === 'percent'
      ? (basePrice * medicalDiscount.value) / 100
      : medicalDiscount.value;
    return Math.max(0, basePrice - discountAmount);
  };

  const calculateContractPrice = () => {
    if (!selectedContract) return 0;
    const basePrice = selectedContract.price;
    const discountAmount = contractDiscount.type === 'percent'
      ? (basePrice * contractDiscount.value) / 100
      : contractDiscount.value;
    return Math.max(0, basePrice - discountAmount);
  };

  const calculateTotalPrice = () => {
    const basePrice = parseInt(formData.price) || 0;
    const packageTotal = packageData.reduce((sum, item) => sum + item.price, 0);
    const medicalTotal = medicalData.reduce((sum, item) => sum + item.price, 0);
    const contractTotal = contractData.reduce((sum, item) => sum + item.price, 0);
    return basePrice + packageTotal + medicalTotal + contractTotal;
  };

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
    setModalForm(prev => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      name: modalForm.name,
      ...(modalType === 'contract' && { category: modalForm.category }),
      price: parseInt(modalForm.price)
    };

    if (editingIndex !== null) {
      if (modalType === 'package') setPackageData(prev => prev.map((item, i) => i === editingIndex ? { ...item, ...newItem } : item));
      else if (modalType === 'medical') setMedicalData(prev => prev.map((item, i) => i === editingIndex ? { ...item, ...newItem } : item));
      else if (modalType === 'contract') setContractData(prev => prev.map((item, i) => i === editingIndex ? { ...item, ...newItem } : item));
    } else {
      if (modalType === 'package') setPackageData(prev => [...prev, newItem]);
      else if (modalType === 'medical') setMedicalData(prev => [...prev, newItem]);
      else if (modalType === 'contract') setContractData(prev => [...prev, newItem]);
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
    setModalForm({ name: item.name, category: item.category || '', price: item.price.toString() });
    setShowModal(true);
  };

  const handleDelete = (type, index) => {
    if (type === 'package') setPackageData(prev => prev.filter((_, i) => i !== index));
    else if (type === 'medical') setMedicalData(prev => prev.filter((_, i) => i !== index));
    else if (type === 'contract') setContractData(prev => prev.filter((_, i) => i !== index));
  };

  const handleMainSaveClick = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.hn) throw new Error('กรุณากรอก HN');
      if (!formData.an) throw new Error('กรุณากรอก AN');

      const payload = {
        patientId: patient_id,
        departmentId: departments.find(d => d.code === 'STROKE')?.id,
        patientType: 'AN',
        profileImage: previewUrl,
        contractData: {
          startDate: formData.date,
          endDate: formData.toDate,
          roomType: formData.building,
          billingType: formData.floor,
          basePrice: parseInt(formData.price) || 0,
          totalPrice: calculateTotalPrice(),
          notes: null,
          packages: packageData.map(pkg => ({
            id: pkg.id,
            name: pkg.name,
            originalPrice: pkg.originalPrice || pkg.price,
            discountType: pkg.discount?.type || null,
            discountValue: pkg.discount?.value || 0,
            finalPrice: pkg.price
          })),
          medicalSupplies: medicalData.map(med => ({
            id: med.id,
            name: med.name,
            originalPrice: med.originalPrice || med.price,
            discountType: med.discount?.type || null,
            discountValue: med.discount?.value || 0,
            finalPrice: med.price
          })),
          contractItems: contractData.map(con => ({
            id: con.id,
            name: con.name,
            category: con.category,
            originalPrice: con.originalPrice || con.price,
            discountType: con.discount?.type || null,
            discountValue: con.discount?.value || 0,
            finalPrice: con.price
          }))
        }
      };

      const response = await fetch(`${API_BASE_URL}/service-registrations/${service_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      alert('แก้ไขข้อมูลสำเร็จ!');
      setShowConfirmationModal(false);
      navigate('/stroke-center');
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || (departmentsLoading && !formData.hn)) {
    return (
      <div className="flex min-h-screen bg-slate-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'กำลังโหลดข้อมูล VN...' : 'กำลังโหลดข้อมูลแผนก...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex-1 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mr-auto">
              แก้ไขข้อมูลผู้รับบริการ (VN)
            </h1>
            <div className="flex items-center space-x-4">
              <button
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <FileText className="w-4 h-4" />
                <span>สัญญาจ้างทางการแพทย์</span>
              </button>
              <button
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                📄 เอกสาร Admit
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ค้นหาผู้ป่วย (HN หรือ ชื่อ-นามสกุล)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUniversalSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="พิมพ์ HN, ชื่อ หรือ นามสกุล..."
              />
              <button
                onClick={handleUniversalSearch}
                disabled={isSearching || !searchQuery || searchQuery.trim().length < 2}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังค้นหา...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>ค้นหา</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * สามารถค้นหาด้วย HN, ชื่อ หรือ นามสกุล (อย่างน้อย 2 ตัวอักษร)
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
              <button onClick={() => setError(null)} className="mt-2 text-sm text-red-500 hover:text-red-700">
                ปิดข้อความ
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg h-full">
              <input type="file" id="imageUpload" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-blue-500 hover:text-blue-600 font-medium">Click to upload</p>
                    <p className="text-sm text-gray-500">or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-2">JPG, JPEG, PNG</p>
                  </>
                )}
              </label>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">HN</label>
                <input
                  type="text"
                  name="hn"
                  value={formData.hn}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  readOnly
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">AN</label>
                <input
                  type="text"
                  name="an"
                  value={formData.an}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  readOnly
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">เลขบัตรประชาชน</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">คลินิก</label>
                <div className="relative">
                  <input
                    type="text"
                    value="ศูนย์ฟื้นฟูผู้ป่วยโรคหลอดเลือดสมองและระบบประสาท"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">ถึงวันที่</label>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">ห้อง</label>
                <div className="relative">
                  <select
                    name="building"
                    value={selectedRoom?.id || ''}
                    onChange={handleRoomChange}
                    disabled={roomsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="">เลือกห้อง</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.room_number} - {room.room_type}
                      </option>
                    ))}
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
                    onChange={handleBillingTypeChange}
                    disabled={!selectedRoom}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="รายวัน">รายวัน</option>
                    {selectedRoom?.weekly_price && (
                      <option value="รายสัปดาห์">รายสัปดาห์</option>
                    )}
                    {selectedRoom?.monthly_price && (
                      <option value="รายเดือน">รายเดือน</option>
                    )}
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
                  disabled={!selectedRoom}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0"
                />
              </div>
            </div>

            {selectedRoom && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">ข้อมูลห้องที่เลือก</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">หมายเลขห้อง:</span>
                    <p className="font-medium">{selectedRoom.room_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">ประเภทห้อง:</span>
                    <p className="font-medium">{selectedRoom.room_type}</p>
                  </div>
                  {selectedRoom.daily_price && (
                    <div>
                      <span className="text-gray-600">รายวัน:</span>
                      <p className="font-medium text-green-600">
                        {selectedRoom.daily_price.toLocaleString()} บาท
                      </p>
                    </div>
                  )}
                  {selectedRoom.monthly_price && (
                    <div>
                      <span className="text-gray-600">รายเดือน:</span>
                      <p className="font-medium text-green-600">
                        {selectedRoom.monthly_price.toLocaleString()} บาท
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">คอร์สแพ็คเกจกายภาพ</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPackageModal(true)}
                    className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    เลือกจากแพ็คเกจ
                  </button>
                  <button
                    onClick={() => openModal('package')}
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มเอง
                  </button>
                </div>
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
                              <button onClick={() => handleEdit('package', index)} className="text-blue-600 hover:text-blue-800">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete('package', index)} className="text-red-600 hover:text-red-800">
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

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">รายการเหมาเวชภัณฑ์</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowMedicalModal(true)}
                    className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    เลือกจากรายการ
                  </button>
                  <button
                    onClick={() => openModal('medical')}
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มเอง
                  </button>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ลำดับ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ชื่อรายการ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ราคา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalData.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500 bg-gray-50">ไม่มีข้อมูล</td>
                      </tr>
                    ) : (
                      medicalData.map((item, index) => (
                        <tr key={item.id} className="border-t border-gray-300">
                          <td className="px-4 py-3 border-r border-gray-300">{index + 1}</td>
                          <td className="px-4 py-3 border-r border-gray-300">{item.name}</td>
                          <td className="px-4 py-3 border-r border-gray-300">{item.price.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit('medical', index)} className="text-blue-600 hover:text-blue-800">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete('medical', index)} className="text-red-600 hover:text-red-800">
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

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">รายการเหมา</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowContractModal(true)}
                    className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    เลือกจากรายการ
                  </button>
                  <button
                    onClick={() => openModal('contract')}
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มเอง
                  </button>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ลำดับ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ชื่อรายการ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">หมายเหตุ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ราคา</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500 bg-gray-50">ไม่มีข้อมูล</td>
                      </tr>
                    ) : (
                      contractData.map((item, index) => (
                        <tr key={item.id} className="border-t border-gray-300">
                          <td className="px-4 py-3 border-r border-gray-300">{index + 1}</td>
                          <td className="px-4 py-3 border-r border-gray-300">{item.name}</td>
                          <td className="px-4 py-3 border-r border-gray-300">{item.category}</td>
                          <td className="px-4 py-3 border-r border-gray-300">{item.price.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit('contract', index)} className="text-blue-600 hover:text-blue-800">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete('contract', index)} className="text-red-600 hover:text-red-800">
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
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={handleMainSaveClick}
              disabled={loading}
              className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
            <button
              className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => navigate(-1)}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>

      {/* Search Results Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">ผลการค้นหาผู้ป่วย</h2>
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchResults([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">ไม่พบผู้ป่วยที่ค้นหา</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    พบผู้ป่วย {searchResults.length} รายการ
                  </p>
                  {searchResults.map((patient, index) => (
                    <div
                      key={patient.id || index}
                      onClick={() => selectPatientFromSearch(patient)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {patient.profile_image && (
                              <img
                                src={patient.profile_image}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {patient.first_name} {patient.last_name}
                              </h3>
                              <p className="text-sm text-blue-600">HN: {patient.hn}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                            <div>
                              <span className="text-gray-500">เลขบัตรประชาชน:</span>
                              <p className="font-medium">{patient.id_card || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">เพศ:</span>
                              <p className="font-medium">{patient.gender || '-'}</p>
                            </div>
                          </div>
                        </div>

                        <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
                          เลือก
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end">
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchResults([]);
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Selection Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">เลือกแพ็คเกจ</h2>
              <button onClick={() => setShowPackageModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-lg font-semibold mb-4">เลือกแพ็คเกจ</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePackages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageForPatient(pkg)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPackageForPatient?.id === pkg.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                    <div className="mt-3 text-lg font-bold text-green-600">
                      {pkg.price?.toLocaleString()} บาท
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4">
              <button onClick={() => setShowPackageModal(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50">
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (selectedPackageForPatient) {
                    const newPackage = {
                      id: Date.now(),
                      name: selectedPackageForPatient.name,
                      price: selectedPackageForPatient.price,
                      originalPrice: selectedPackageForPatient.price,
                      packageId: selectedPackageForPatient.id
                    };
                    setPackageData(prev => [...prev, newPackage]);
                    setShowPackageModal(false);
                    setSelectedPackageForPatient(null);
                  }
                }}
                disabled={!selectedPackageForPatient}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                เพิ่มแพ็คเกจ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medical Selection Modal */}
      {showMedicalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">เลือกเวชภัณฑ์</h2>
              <button onClick={() => setShowMedicalModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-lg font-semibold mb-4">เลือกเวชภัณฑ์</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableMedical.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedical(item)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedMedical?.id === item.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <div className="mt-3 text-lg font-bold text-green-600">
                      {item.price?.toLocaleString()} บาท
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4">
              <button onClick={() => setShowMedicalModal(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50">
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (selectedMedical) {
                    const newItem = {
                      id: Date.now(),
                      name: selectedMedical.name,
                      price: selectedMedical.price,
                      originalPrice: selectedMedical.price,
                      medicalId: selectedMedical.id
                    };
                    setMedicalData(prev => [...prev, newItem]);
                    setShowMedicalModal(false);
                    setSelectedMedical(null);
                  }
                }}
                disabled={!selectedMedical}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                เพิ่มรายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Selection Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">เลือกรายการเหมา</h2>
              <button onClick={() => setShowContractModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-lg font-semibold mb-4">เลือกรายการเหมา</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableContracts.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedContract(item)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedContract?.id === item.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <div className="mt-3 text-lg font-bold text-purple-600">
                      {item.price?.toLocaleString()} บาท
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4">
              <button onClick={() => setShowContractModal(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50">
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (selectedContract) {
                    const newItem = {
                      id: Date.now(),
                      name: selectedContract.name,
                      category: selectedContract.category || selectedContract.billing,
                      price: selectedContract.price,
                      originalPrice: selectedContract.price,
                      contractId: selectedContract.id
                    };
                    setContractData(prev => [...prev, newItem]);
                    setShowContractModal(false);
                    setSelectedContract(null);
                  }
                }}
                disabled={!selectedContract}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                เพิ่มรายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit item */}
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
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อรายการ</label>
                  <input
                    type="text"
                    name="name"
                    value={modalForm.name}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingIndex !== null ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-bold text-gray-800">โปรดตรวจสอบข้อมูลก่อนบันทึก</h3>
              <button onClick={() => setShowConfirmationModal(false)} className="text-gray-500 hover:text-gray-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <h4 className="font-semibold text-lg text-blue-700">ข้อมูลผู้รับบริการ</h4>
              <p><strong>HN:</strong> {formData.hn}</p>
              <p><strong>AN:</strong> {formData.an}</p>
              <p><strong>ชื่อ-นามสกุล:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>คลินิก:</strong> ศูนย์ฟื้นฟูผู้ป่วยโรคหลอดเลือดสมองและระบบประสาท</p>

              <h4 className="font-semibold text-lg text-blue-700 mt-4 pt-4 border-t">ข้อมูลสัญญา</h4>
              <p><strong>วันที่:</strong> {formData.date} <strong>ถึงวันที่:</strong> {formData.toDate}</p>
              <p><strong>ห้อง:</strong> {formData.building} <strong>ประเภท:</strong> {formData.floor}</p>
              <p><strong>ราคาฐาน:</strong> {(parseInt(formData.price) || 0).toLocaleString()} บาท</p>

              <h4 className="font-semibold text-lg text-blue-700 mt-4 pt-4 border-t">คอร์สแพ็คเกจ</h4>
              {packageData.length > 0 ? (
                <ul className="list-disc pl-5">
                  {packageData.map(item => <li key={item.id}>{item.name} - {item.price.toLocaleString()} บาท</li>)}
                </ul>
              ) : <p className="text-gray-500">ไม่มีรายการ</p>}

              <div className="mt-4 pt-4 border-t">
                <p className="font-semibold text-lg text-green-700">
                  รวมทั้งหมด: {calculateTotalPrice().toLocaleString()} บาท
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowConfirmationModal(false)}
                className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                แก้ไข
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'กำลังบันทึก...' : 'ยืนยันการบันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}