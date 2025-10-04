import React, { useState, useEffect } from 'react';
import { Upload, ChevronDown, Plus, Edit, Trash2, X, RefreshCw, Package } from 'lucide-react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';


const formatThaiDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = (date.getFullYear() + 543).toString(); // แปลงเป็นปี พ.ศ.
  return `${day}/${month}/${year}`;
};
export default function ThaiServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // จาก URL parameter
  const [searchParams] = useSearchParams(); // จาก query parameter
  const location = useLocation(); // จาก state
  const patientId = id ||
    searchParams.get('patientId') ||
    location.state?.patientId;
  const [currentDate, setCurrentDate] = useState(formatThaiDate(new Date()));
  const [formData, setFormData] = useState({
    hn: '',
    an: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    clinicType: '',
    date: '',
    toDate: '',
    building: '',
    floor: 'รายวัน',
    price: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // เพิ่ม state สำหรับเก็บข้อมูลแผนก
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  // เพิ่ม state สำหรับ AN/VN generation
  const [generatingAnVn, setGeneratingAnVn] = useState(false);

  // Modal and table data states
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  // Table data
  const [packageData, setPackageData] = useState([]);
  const [medicalData, setMedicalData] = useState([]);
  const [contractData, setContractData] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [selectedPackageForPatient, setSelectedPackageForPatient] = useState(null);
  const [packageDiscount, setPackageDiscount] = useState({
    type: 'percent', // 'percent' or 'amount'
    value: 0
  });
  // เพิ่มใน state declarations
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [availableMedical, setAvailableMedical] = useState([]);
  const [availableContracts, setAvailableContracts] = useState([]);
  const [selectedMedical, setSelectedMedical] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [medicalDiscount, setMedicalDiscount] = useState({ type: 'percent', value: 0 });
  const [contractDiscount, setContractDiscount] = useState({ type: 'percent', value: 0 });
  // API Helper functions
  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Request Error:', error);
      return { success: false, error: error.message };
    }
  };

  // ใน ThaiServiceForm.jsx
  const generateAnVn = async (type, departmentCode = null) => {
    try {
      console.log(`Generating ${type} for department:`, departmentCode);
      setGeneratingAnVn(true);
      setError(null);

      let endpoint = '';

      if (type === 'AN') {
        endpoint = '/service-registrations/generate-an';
      } else if (type === 'VN') {
        // ✅ ถูกต้อง - ส่ง departmentCode เป็น query parameter
        endpoint = `/service-registrations/generate-vn?departmentCode=${encodeURIComponent(departmentCode)}`;
      }

      console.log('Calling endpoint:', `${API_BASE_URL}${endpoint}`); // Debug

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate ${type}`);
      }

      const result = await response.json();
      console.log(`Generated ${type}:`, result);

      return result.data.number;

    } catch (err) {
      console.error(`Error generating ${type}:`, err);
      setError(`ไม่สามารถ generate ${type} ได้: ${err.message}`);
      return '';
    } finally {
      setGeneratingAnVn(false);
    }
  };
  // ปุ่ม Generate ใหม่
  const handleGenerateAnVn = async () => {
    if (!formData.clinicType) {
      setError('กรุณาเลือกคลินิกก่อน');
      return;
    }

    const selectedDept = departments.find(dept => dept.code === formData.clinicType);
    if (!selectedDept) {
      setError('ไม่พบข้อมูลแผนกที่เลือก');
      return;
    }

    let generatedNumber = '';

    if (isStrokeCenter()) {
      generatedNumber = await generateAnVn('AN');
    } else {
      generatedNumber = await generateAnVn('VN', selectedDept.code);
    }

    if (generatedNumber) {
      setFormData(prev => ({
        ...prev,
        an: generatedNumber
      }));
    }
  };

  // ฟังก์ชันสำหรับดึงข้อมูลแผนก
  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      setError(null);

      const apiUrl = `${API_BASE_URL}/departments`;
      console.log('Fetching departments from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Departments data received:', data);

      if (data.success && data.data) {
        const activeDepartments = data.data.filter(dept => dept.is_active);

        console.log('Active departments:', activeDepartments);
        setDepartments(activeDepartments);

        if (!formData.clinicType && activeDepartments.length > 0) {
          setFormData(prev => ({
            ...prev,
            clinicType: activeDepartments[0].code
          }));
        }
      } else {
        console.error('Invalid data structure:', data);
        setError('ข้อมูลแผนกไม่ถูกต้อง');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลแผนก: ${err.message}`);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // API Functions
  const fetchPatientById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patient: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch patient');
      }

      const patientData = result.data;
      console.log('Patient data received:', patientData);

      setFormData(prev => ({
        ...prev,
        hn: patientData.hn || '',
        firstName: patientData.first_name || '',
        lastName: patientData.last_name || '',
        idNumber: patientData.id_card || '',
      }));

      setPreviewUrl(patientData.profile_image);

    } catch (err) {
      console.error('Fetch patient error:', err);
      setError(`ไม่สามารถโหลดข้อมูลผู้ป่วยได้: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (query, field) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/search?${field}=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const results = await response.json();
      return results;
    } catch (err) {
      console.error('Error searching patients:', err);
      return [];
    }
  };

  // Load departments และ patient data when component mounts
  useEffect(() => {
    fetchDepartments();
    fetchAvailablePackages();
    fetchAvailableMedical();     // เพิ่ม
    fetchAvailableContracts();   // เพิ่ม
  }, []);

  useEffect(() => {
    if (patientId) {
      console.log('Patient ID received:', patientId);
      fetchPatientById(patientId);
    }
  }, [patientId]);
  const calculatePackagePrice = () => {
    if (!selectedPackageForPatient) return 0;

    const basePrice = selectedPackageForPatient.price;
    let discountAmount = 0;

    if (packageDiscount.type === 'percent') {
      discountAmount = (basePrice * packageDiscount.value) / 100;
    } else {
      discountAmount = packageDiscount.value;
    }

    return Math.max(0, basePrice - discountAmount);
  };
  // Auto-generate AN/VN เมื่อเลือกคลินิก
  useEffect(() => {
    const autoGenerateAnVn = async () => {
      // เพิ่มการตรวจสอบให้ครบถ้วนมากขึ้น
      if (
        formData.clinicType &&
        departments.length > 0 &&
        !formData.an &&
        !patientId &&
        !departmentsLoading &&
        !generatingAnVn
      ) {
        const selectedDept = departments.find(dept => dept.code === formData.clinicType);

        if (selectedDept) {
          let generatedNumber = '';

          try {
            if (isStrokeCenter()) {
              generatedNumber = await generateAnVn('AN');
            } else {
              generatedNumber = await generateAnVn('VN', selectedDept.code);
            }

            if (generatedNumber) {
              setFormData(prev => ({
                ...prev,
                an: generatedNumber
              }));
            }
          } catch (error) {
            console.error('Auto-generate failed:', error);
            // ไม่ต้อง set error ที่นี่ เพราะ generateAnVn จะจัดการเองแล้ว
          }
        }
      }
    };

    // ใช้ timeout เพื่อให้แน่ใจว่า departments โหลดเสร็จแล้ว
    const timeoutId = setTimeout(autoGenerateAnVn, 100);

    return () => clearTimeout(timeoutId);
  }, [formData.clinicType, departments, departmentsLoading, generatingAnVn]);

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
    setModalForm(prev => ({ ...prev, [name]: value }));
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

  // Save and confirmation functions
  const handleMainSaveClick = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const selectedDept = departments.find(dept => dept.code === formData.clinicType);

      if (!selectedDept) {
        throw new Error('กรุณาเลือกคลินิก');
      }

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!formData.hn) {
        throw new Error('กรุณากรอก HN');
      }

      if (!formData.an) {
        throw new Error('กรุณา generate AN/VN');
      }

      // กำหนด patient type
      const patientType = isStrokeCenter() ? 'AN' : 'VN';

      // สร้าง payload สำหรับ Service Registration
      const payload = {
        patientId: patientId, // จาก URL หรือ state
        departmentId: selectedDept.id,
        patientType: patientType,
        admissionId: null, // ถ้ามีให้ใส่
        drugIntolerance: null, // ถ้ามีให้ใส่
        profileImage: previewUrl,
        registrationDate: new Date().toISOString().split('T')[0],
        registrationTime: new Date().toTimeString().slice(0, 8),
        createdBy: 1 // ใช้ user ID จริง
      };

      // ถ้าเป็น Stroke Center (AN) ต้องมี contract data
      if (isStrokeCenter()) {
        payload.contractData = {
          startDate: formData.date,
          endDate: formData.toDate,
          roomType: formData.building,
          billingType: formData.floor,
          basePrice: parseInt(formData.price) || 0,
          totalPrice: calculateTotalPrice(),
          notes: null,

          // Packages
          packages: packageData.map(pkg => ({
            id: pkg.packageId || pkg.id,
            name: pkg.name,
            originalPrice: pkg.originalPrice || pkg.price,
            discountType: pkg.discount?.type || null,
            discountValue: pkg.discount?.value || 0,
            finalPrice: pkg.price
          })),

          // Medical Supplies
          medicalSupplies: medicalData.map(med => ({
            id: med.medicalId || med.id,
            name: med.name,
            originalPrice: med.originalPrice || med.price,
            discountType: med.discount?.type || null,
            discountValue: med.discount?.value || 0,
            finalPrice: med.price
          })),

          // Contract Items
          contractItems: contractData.map(con => ({
            id: con.contractId || con.id,
            name: con.name,
            category: con.category,
            originalPrice: con.originalPrice || con.price,
            discountType: con.discount?.type || null,
            discountValue: con.discount?.value || 0,
            finalPrice: con.price
          }))
        };
      }

      console.log('Payload to send:', payload);

      // เรียก API
      const response = await fetch(`${API_BASE_URL}/service-registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // ถ้ามี auth
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Save successful:', result);

      // แสดงข้อความสำเร็จ
      alert(`บันทึกสำเร็จ! ${result.data.serviceNumber}`);

      setShowConfirmationModal(false);

      // Navigate กลับไปหน้าคลินิก
      const clinicPath = selectedDept?.code.toLowerCase() || 'general-clinic';
      navigate(`/${clinicPath}`);

    } catch (err) {
      console.error('Error saving data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
  };

  const calculateTotalPrice = () => {
    const basePrice = parseInt(formData.price) || 0;
    const packageTotal = packageData.reduce((sum, item) => sum + item.price, 0);
    const medicalTotal = medicalData.reduce((sum, item) => sum + item.price, 0);
    const contractTotal = contractData.reduce((sum, item) => sum + item.price, 0);

    return basePrice + packageTotal + medicalTotal + contractTotal;
  };

  const populateFromPatient = (selectedPatient) => {
    setFormData(prev => ({
      ...prev,
      hn: selectedPatient.hn,
      firstName: selectedPatient.firstName,
      lastName: selectedPatient.lastName,
      idNumber: selectedPatient.idNumber
    }));
  };

  // ตรวจสอบเงื่อนไขการแสดง AN/VN และส่วนอื่นๆ
  const isStrokeCenter = () => {
    const selectedDept = departments.find(dept => dept.code === formData.clinicType);
    return selectedDept?.code === 'STROKE';
  };

  useEffect(() => {
    if (!isStrokeCenter()) {
      console.log('Clinic type changed - AN should become VN');
    }
  }, [formData.clinicType, departments]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    console.log(`Input changed: ${name} = ${value}`);

    // Auto-clear AN/VN when clinic changes
    if (name === 'clinicType' && value !== formData.clinicType) {
      setFormData(prev => ({ ...prev, an: '' }));
    }

    // Only search if value has at least 2 characters and we're not currently loading
    if (value.length >= 2 && !loading) {
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
      setShowHnSuggestions(false);
      setShowFirstNameSuggestions(false);
      setShowLastNameSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion, field) => {
    populateFromPatient(suggestion);
    if (field === 'hn') setShowHnSuggestions(false);
    if (field === 'firstName') setShowFirstNameSuggestions(false);
    if (field === 'lastName') setShowLastNameSuggestions(false);
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


  const fetchAvailablePackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages?active=true`);
      const result = await response.json();

      if (result.success) {
        setAvailablePackages(result.data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };
  const fetchAvailableMedical = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medical?active=true`);
      const result = await response.json();
      if (result.success) {
        setAvailableMedical(result.data);
      }
    } catch (error) {
      console.error('Error fetching medical supplies:', error);
    }
  };

  const fetchAvailableContracts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts?active=true`);
      const result = await response.json();
      if (result.success) {
        setAvailableContracts(result.data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };
  const calculateMedicalPrice = () => {
    if (!selectedMedical) return 0;
    const basePrice = selectedMedical.price;
    let discountAmount = 0;

    if (medicalDiscount.type === 'percent') {
      discountAmount = (basePrice * medicalDiscount.value) / 100;
    } else {
      discountAmount = medicalDiscount.value;
    }

    return Math.max(0, basePrice - discountAmount);
  };

  const calculateContractPrice = () => {
    if (!selectedContract) return 0;
    const basePrice = selectedContract.price;
    let discountAmount = 0;

    if (contractDiscount.type === 'percent') {
      discountAmount = (basePrice * contractDiscount.value) / 100;
    } else {
      discountAmount = contractDiscount.value;
    }

    return Math.max(0, basePrice - discountAmount);
  };

  // Show loading state
  if ((loading && patientId && !formData.hn) || departmentsLoading) {
    return (
      <div className="flex min-h-screen bg-slate-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {departmentsLoading ? 'กำลังโหลดข้อมูลแผนก...' : 'กำลังโหลดข้อมูลผู้ป่วย...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex-1 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">ผู้รับบริการวันที่ {currentDate}</h1>

          {/* Show error message if any */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                ปิดข้อความ
              </button>
            </div>
          )}

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
                        key={suggestion.id || index}
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

              {/* AN/VN Field พร้อมปุ่ม Generate */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  {isStrokeCenter() ? 'AN' : 'VN'}
                </label>

                {/* Mobile: Stack vertically, Desktop: Side by side */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    name="an"
                    value={formData.an}
                    onChange={handleInputChange}
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={isStrokeCenter() ? 'AN จะถูก generate อัตโนมัติ' : 'VN จะถูก generate อัตโนมัติ'}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAnVn}
                    className="flex-shrink-0 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed sm:w-auto w-full justify-center flex items-center"
                    disabled={!formData.clinicType || generatingAnVn}
                    title="Generate ใหม่"
                  >
                    {generatingAnVn ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span className="sm:hidden">กำลัง Generate...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Generate ใหม่</span>
                      </>
                    )}
                  </button>
                </div>

                {formData.an && (
                  <p className="text-xs text-green-600 mt-1 break-all">
                    {isStrokeCenter() ?
                      `AN: ${formData.an} (Format: IPD + YYMMDD + NNNN)` :
                      `VN: ${formData.an} (Format: VN + YYMMDD + DeptCode + NNN)`
                    }
                  </p>
                )}

                {generatingAnVn && (
                  <p className="text-xs text-blue-600 mt-1">กำลัง generate เลข...</p>
                )}
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
                        key={suggestion.id || index}
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
                        key={suggestion.id || index}
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

              {/* Department/Clinic Selection - ใช้ข้อมูลจาก API */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">คลินิก</label>
                <div className="relative">
                  <select
                    name="clinicType"
                    value={formData.clinicType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    disabled={departmentsLoading}
                  >
                    {departmentsLoading ? (
                      <option value="">กำลังโหลด...</option>
                    ) : departments.length === 0 ? (
                      <option value="">ไม่มีข้อมูลแผนก</option>
                    ) : (
                      <>
                        <option value="">-- เลือกคลินิก --</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.code}>
                            {dept.name}
                            {dept.description && ` (${dept.description})`}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
                {departmentsLoading && (
                  <p className="text-xs text-gray-500 mt-1">กำลังโหลดข้อมูลแผนก...</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section - Only show for stroke rehabilitation center */}
          {isStrokeCenter() && (
            <>
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
                              <td className="px-4 py-3 border-r border-blue-300">
                                <div>
                                  <div>{item.name}</div>
                                  {item.discount && item.discount.value > 0 && (
                                    <div className="text-xs text-red-600 mt-1">
                                      ส่วนลด: {item.discount.type === 'percent'
                                        ? `${item.discount.value}%`
                                        : `${item.discount.value.toLocaleString()} บาท`}
                                      {item.originalPrice && (
                                        <span className="line-through text-gray-400 ml-2">
                                          {item.originalPrice.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 border-r border-blue-300">
                                {item.price.toLocaleString()}
                              </td>
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
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ชื่อแพคเกจ</th>
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
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* รายการเหมา Table */}
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
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-300">ชื่อแพคเกจ</th>
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
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-start space-x-4 mt-8">
            <button
              onClick={handleMainSaveClick}
              disabled={loading}
              className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
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
      {/* Package Selection Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">เลือกแพ็คเกจ</h2>
              <button
                onClick={() => {
                  setShowPackageModal(false);
                  setSelectedPackageForPatient(null);
                  setPackageDiscount({ type: 'percent', value: 0 });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Package List */}
              <div>
                <label className="block text-lg font-semibold mb-4">เลือกแพ็คเกจ</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePackages.map(pkg => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageForPatient(pkg)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPackageForPatient?.id === pkg.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                        }`}
                    >
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-gray-500">{pkg.duration}</span>
                        <span className="text-lg font-bold text-green-600">
                          {pkg.price?.toLocaleString()} บาท
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Section */}
              {selectedPackageForPatient && (
                <div className="border-t pt-6">
                  <label className="block text-lg font-semibold mb-4">ส่วนลด</label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ประเภทส่วนลด
                      </label>
                      <select
                        value={packageDiscount.type}
                        onChange={(e) => setPackageDiscount({ type: e.target.value, value: 0 })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="percent">เปอร์เซ็นต์ (%)</option>
                        <option value="amount">จำนวนเงิน (บาท)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {packageDiscount.type === 'percent' ? 'ส่วนลด (%)' : 'ส่วนลด (บาท)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={packageDiscount.type === 'percent' ? 100 : selectedPackageForPatient.price}
                        value={packageDiscount.value}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (packageDiscount.type === 'percent') {
                            setPackageDiscount(prev => ({ ...prev, value: Math.min(100, Math.max(0, value)) }));
                          } else {
                            setPackageDiscount(prev => ({ ...prev, value: Math.min(selectedPackageForPatient.price, Math.max(0, value)) }));
                          }
                        }}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Quick Discount Buttons */}
                  {packageDiscount.type === 'percent' && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">ส่วนลดด่วน:</p>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 20, 25, 30].map(percent => (
                          <button
                            key={percent}
                            onClick={() => setPackageDiscount(prev => ({ ...prev, value: percent }))}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium"
                          >
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold mb-4">สรุปราคา</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>ราคาเต็ม:</span>
                        <span className="font-medium">{selectedPackageForPatient.price?.toLocaleString()} บาท</span>
                      </div>

                      {packageDiscount.value > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>ส่วนลด:</span>
                          <span className="font-medium">
                            - {packageDiscount.type === 'percent'
                              ? `${packageDiscount.value}% (${((selectedPackageForPatient.price * packageDiscount.value) / 100).toLocaleString()} บาท)`
                              : `${packageDiscount.value.toLocaleString()} บาท`
                            }
                          </span>
                        </div>
                      )}

                      <div className="border-t pt-3 flex justify-between text-xl font-bold text-purple-900">
                        <span>ราคาสุทธิ:</span>
                        <span>{calculatePackagePrice().toLocaleString()} บาท</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowPackageModal(false);
                  setSelectedPackageForPatient(null);
                  setPackageDiscount({ type: 'percent', value: 0 });
                }}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (selectedPackageForPatient) {
                    const newPackage = {
                      id: Date.now(),
                      name: selectedPackageForPatient.name,
                      price: calculatePackagePrice(),
                      originalPrice: selectedPackageForPatient.price,
                      discount: packageDiscount,
                      packageId: selectedPackageForPatient.id
                    };
                    setPackageData(prev => [...prev, newPackage]);
                    setShowPackageModal(false);
                    setSelectedPackageForPatient(null);
                    setPackageDiscount({ type: 'percent', value: 0 });
                  }
                }}
                disabled={!selectedPackageForPatient}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h2 className="text-2xl font-bold">เลือกรายการเวชภัณฑ์</h2>
              <button
                onClick={() => {
                  setShowMedicalModal(false);
                  setSelectedMedical(null);
                  setMedicalDiscount({ type: 'percent', value: 0 });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Medical List */}
              <div>
                <label className="block text-lg font-semibold mb-4">เลือกเวชภัณฑ์</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableMedical.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedical(item)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedMedical?.id === item.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                        }`}
                    >
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-gray-500">{item.unit}</span>
                        <span className="text-lg font-bold text-green-600">
                          {item.price?.toLocaleString()} บาท
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Section - เหมือนกับ Package */}
              {selectedMedical && (
                <div className="border-t pt-6">
                  <label className="block text-lg font-semibold mb-4">ส่วนลด</label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทส่วนลด</label>
                      <select
                        value={medicalDiscount.type}
                        onChange={(e) => setMedicalDiscount({ type: e.target.value, value: 0 })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="percent">เปอร์เซ็นต์ (%)</option>
                        <option value="amount">จำนวนเงิน (บาท)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {medicalDiscount.type === 'percent' ? 'ส่วนลด (%)' : 'ส่วนลด (บาท)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={medicalDiscount.type === 'percent' ? 100 : selectedMedical.price}
                        value={medicalDiscount.value}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (medicalDiscount.type === 'percent') {
                            setMedicalDiscount(prev => ({ ...prev, value: Math.min(100, Math.max(0, value)) }));
                          } else {
                            setMedicalDiscount(prev => ({ ...prev, value: Math.min(selectedMedical.price, Math.max(0, value)) }));
                          }
                        }}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {medicalDiscount.type === 'percent' && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">ส่วนลดด่วน:</p>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 20, 25, 30].map(percent => (
                          <button
                            key={percent}
                            onClick={() => setMedicalDiscount(prev => ({ ...prev, value: percent }))}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium"
                          >
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold mb-4">สรุปราคา</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>ราคาเต็ม:</span>
                        <span className="font-medium">{selectedMedical.price?.toLocaleString()} บาท</span>
                      </div>

                      {medicalDiscount.value > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>ส่วนลด:</span>
                          <span className="font-medium">
                            - {medicalDiscount.type === 'percent'
                              ? `${medicalDiscount.value}% (${((selectedMedical.price * medicalDiscount.value) / 100).toLocaleString()} บาท)`
                              : `${medicalDiscount.value.toLocaleString()} บาท`
                            }
                          </span>
                        </div>
                      )}

                      <div className="border-t pt-3 flex justify-between text-xl font-bold text-green-900">
                        <span>ราคาสุทธิ:</span>
                        <span>{calculateMedicalPrice().toLocaleString()} บาท</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowMedicalModal(false);
                  setSelectedMedical(null);
                  setMedicalDiscount({ type: 'percent', value: 0 });
                }}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (selectedMedical) {
                    const newItem = {
                      id: Date.now(),
                      name: selectedMedical.name,
                      price: calculateMedicalPrice(),
                      originalPrice: selectedMedical.price,
                      discount: medicalDiscount,
                      medicalId: selectedMedical.id
                    };
                    setMedicalData(prev => [...prev, newItem]);
                    setShowMedicalModal(false);
                    setSelectedMedical(null);
                    setMedicalDiscount({ type: 'percent', value: 0 });
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
              <button
                onClick={() => {
                  setShowContractModal(false);
                  setSelectedContract(null);
                  setContractDiscount({ type: 'percent', value: 0 });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contract List */}
              <div>
                <label className="block text-lg font-semibold mb-4">เลือกรายการเหมา</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableContracts.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedContract(item)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedContract?.id === item.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                        }`}
                    >
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {item.billing || item.category}
                        </span>
                        <span className="text-lg font-bold text-purple-600">
                          {item.price?.toLocaleString()} บาท
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Section - เหมือนกันกับ Medical แต่เปลี่ยนสีเป็น purple */}
              {selectedContract && (
                <div className="border-t pt-6">
                  <label className="block text-lg font-semibold mb-4">ส่วนลด</label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทส่วนลด</label>
                      <select
                        value={contractDiscount.type}
                        onChange={(e) => setContractDiscount({ type: e.target.value, value: 0 })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="percent">เปอร์เซ็นต์ (%)</option>
                        <option value="amount">จำนวนเงิน (บาท)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {contractDiscount.type === 'percent' ? 'ส่วนลด (%)' : 'ส่วนลด (บาท)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={contractDiscount.type === 'percent' ? 100 : selectedContract.price}
                        value={contractDiscount.value}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (contractDiscount.type === 'percent') {
                            setContractDiscount(prev => ({ ...prev, value: Math.min(100, Math.max(0, value)) }));
                          } else {
                            setContractDiscount(prev => ({ ...prev, value: Math.min(selectedContract.price, Math.max(0, value)) }));
                          }
                        }}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {contractDiscount.type === 'percent' && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">ส่วนลดด่วน:</p>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 20, 25, 30].map(percent => (
                          <button
                            key={percent}
                            onClick={() => setContractDiscount(prev => ({ ...prev, value: percent }))}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium"
                          >
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold mb-4">สรุปราคา</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>ราคาเต็ม:</span>
                        <span className="font-medium">{selectedContract.price?.toLocaleString()} บาท</span>
                      </div>

                      {contractDiscount.value > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>ส่วนลด:</span>
                          <span className="font-medium">
                            - {contractDiscount.type === 'percent'
                              ? `${contractDiscount.value}% (${((selectedContract.price * contractDiscount.value) / 100).toLocaleString()} บาท)`
                              : `${contractDiscount.value.toLocaleString()} บาท`
                            }
                          </span>
                        </div>
                      )}

                      <div className="border-t pt-3 flex justify-between text-xl font-bold text-purple-900">
                        <span>ราคาสุทธิ:</span>
                        <span>{calculateContractPrice().toLocaleString()} บาท</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowContractModal(false);
                  setSelectedContract(null);
                  setContractDiscount({ type: 'percent', value: 0 });
                }}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (selectedContract) {
                    const newItem = {
                      id: Date.now(),
                      name: selectedContract.name,
                      category: selectedContract.category || selectedContract.billing,
                      price: calculateContractPrice(),
                      originalPrice: selectedContract.price,
                      discount: contractDiscount,
                      contractId: selectedContract.id
                    };
                    setContractData(prev => [...prev, newItem]);
                    setShowContractModal(false);
                    setSelectedContract(null);
                    setContractDiscount({ type: 'percent', value: 0 });
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

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-bold text-gray-800">โปรดตรวจสอบข้อมูลก่อนบันทึก</h3>
              <button
                onClick={handleCancelConfirmation}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <h4 className="font-semibold text-lg text-blue-700">ข้อมูลผู้รับบริการ</h4>
              <p><strong>HN:</strong> {formData.hn || '-'}</p>
              <p><strong>{isStrokeCenter() ? 'AN' : 'VN'}:</strong> {formData.an || '-'}</p>
              <p><strong>ชื่อ-นามสกุล:</strong> {formData.firstName || '-'} {formData.lastName || '-'}</p>
              <p><strong>คลินิก:</strong> {departments.find(d => d.code === formData.clinicType)?.name || formData.clinicType || '-'}</p>

              {isStrokeCenter() && (
                <>
                  <h4 className="font-semibold text-lg text-blue-700 mt-4 pt-4 border-t">ข้อมูลสัญญา</h4>
                  <p><strong>วันที่:</strong> {formData.date || '-'} <strong>ถึงวันที่:</strong> {formData.toDate || '-'}</p>
                  <p><strong>ห้อง:</strong> {formData.building || '-'} <strong>ประเภท:</strong> {formData.floor || '-'}</p>
                  <p><strong>ราคาฐาน:</strong> {formData.price ? parseInt(formData.price).toLocaleString() + ' บาท' : '-'}</p>

                  <h4 className="font-semibold text-lg text-blue-700 mt-4 pt-4 border-t">คอร์สแพ็คเกจกายภาพ</h4>
                  {packageData.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {packageData.map(item => <li key={item.id}>{item.name} - {item.price.toLocaleString()} บาท</li>)}
                    </ul>
                  ) : <p className="text-gray-500">ไม่มีรายการ</p>}

                  <h4 className="font-semibold text-lg text-blue-700 mt-4 pt-4 border-t">รายการเหมาเวชภัณฑ์</h4>
                  {medicalData.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {medicalData.map(item => <li key={item.id}>{item.name} - {item.price.toLocaleString()} บาท</li>)}
                    </ul>
                  ) : <p className="text-gray-500">ไม่มีรายการ</p>}

                  <h4 className="font-semibold text-lg text-blue-700 mt-4 pt-4 border-t">รายการเหมาอื่นๆ</h4>
                  {contractData.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {contractData.map(item => <li key={item.id}>{item.name} ({item.category}) - {item.price.toLocaleString()} บาท</li>)}
                    </ul>
                  ) : <p className="text-gray-500">ไม่มีรายการ</p>}

                  <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold text-lg text-green-700">
                      รวมทั้งหมด: {(
                        (parseInt(formData.price) || 0) +
                        packageData.reduce((sum, item) => sum + item.price, 0) +
                        medicalData.reduce((sum, item) => sum + item.price, 0) +
                        contractData.reduce((sum, item) => sum + item.price, 0)
                      ).toLocaleString()} บาท
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancelConfirmation}
                disabled={loading}
                className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                แก้ไข
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
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