import React, { useState, useEffect } from 'react';
import { Upload, ChevronDown, Plus, Edit, Trash2, X, RefreshCw, Package, Search, Printer } from 'lucide-react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
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

export default function ThaiServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const patientId = id || searchParams.get('patientId') || location.state?.patientId;


  const [currentDate, setCurrentDate] = useState(formatThaiDate(new Date()));

  const [formData, setFormData] = useState({
    hn: '',
    an: '',
    prename: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    clinicType: '',
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
    gender: '',  // ✅ เพิ่มบรรทัดนี้
    finalGender: '',  // ✅ เพิ่มบรรทัดนี้

  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [generatingAnVn, setGeneratingAnVn] = useState(false);
  const [patient_id, setPatient_id] = useState(null);
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

  // Universal search function
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
      console.log('Search response:', results);
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

  const generateAnVn = async (type, departmentCode = null) => {
    try {
      setGeneratingAnVn(true);
      setError(null);

      let endpoint = type === 'AN'
        ? '/service-registrations/generate-an'
        : `/service-registrations/generate-vn?departmentCode=${encodeURIComponent(departmentCode)}`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate ${type}`);
      }

      const result = await response.json();
      return result.data.number;
    } catch (err) {
      console.error(`Error generating ${type}:`, err);
      setError(`ไม่สามารถ generate ${type} ได้: ${err.message}`);
      return '';
    } finally {
      setGeneratingAnVn(false);
    }
  };
  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
  };
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

    const generatedNumber = isStrokeCenter()
      ? await generateAnVn('AN')
      : await generateAnVn('VN', selectedDept.code);

    if (generatedNumber) {
      setFormData(prev => ({ ...prev, an: generatedNumber }));
    }
  };

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        const activeDepartments = data.data.filter(dept => dept.is_active);
        setDepartments(activeDepartments);

        if (!formData.clinicType && activeDepartments.length > 0) {
          setFormData(prev => ({ ...prev, clinicType: activeDepartments[0].code }));
        }
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลแผนก: ${err.message}`);
    } finally {
      setDepartmentsLoading(false);
    }
  };
  const exportToWord = async (formData, templatePath, setError) => {
    try {
      console.log('Starting Word export...');
      console.log('Form data:', formData);

      // 🔹 เพิ่มตรงนี้ - สร้าง barcode จาก HN (บรรทัด 8-20)
      let barcodeData = null;
      if (formData.hn) {
        const base64 = await generateBarcode(formData.hn);
        if (base64) {
          barcodeData = {
            data: base64,
            opts: {
              width: 100,
              height: 50
            }
          };
        }
        console.log('Barcode generated');
      }

      // 🆕 คำนวณเดือนและวัน (ใช้ฟังก์ชันที่ import มา)
      let totalMonths = '';
      let totalDays = '';
      if (formData.date && formData.toDate) {
        const result = calculateMonthsAndDays(formData.date, formData.toDate);
        // ❌ FIX: ผลลัพธ์มีแค่ months, days (ไม่มี year)
        totalMonths = result.months.toString();
        totalDays = result.days.toString();
        console.log('Calculated months:', result.months, 'days:', result.days);
      }
      // Fetch the template
      const response = await fetch(templatePath);

      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('Template loaded, size:', arrayBuffer.byteLength);

      // Create PizZip instance
      const zip = new PizZip(arrayBuffer);
      console.log('PizZip created');

      // Create Docxtemplater instance
      const doc = new Docxtemplater(zip, {
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}'
        }
      });
      console.log('Docxtemplater initialized');

      const patientInfo = processPatientName({
        prename: formData.prename,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender
      });

      // Prepare data for template
      const data = {
        hn: formData.hn || '',
        prename: formData.prename || '',
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        birthDate: formData.birth_date || '..........................................',
        age: formData.age || '................................................',
        idCard: formData.idNumber || '.............',
        address: formData.address || '...................',
        village: formData.village || '....................',
        subDistrict: formData.subDistrict || '....................',
        district: formData.district || '....................',
        province: formData.province || '....................',
        phone: formData.phone || '....................',
        email: formData.email || '....................',
        lineId: formData.lineId || '....................',
        relationship: formData.relationship || '....................',
        patientName: formData.patientName || '....................',
        patientAge: formData.patientAge || '....................',
        patientIdCard: formData.patientIdCard || '...............................................................',
        startDate: formData.date || '',
        endDate: formData.toDate || '',
        totalMonths: totalMonths || '',
        totalDays: totalDays || '',
        roomType: formData.floor || '',
        roomNumber: formData.building || '',
        serviceRate: formData.serviceRate || '....................',
        nursingRate: formData.nursingRate || '....................',
        medicalSupplies: formData.medicalSupplies || '...........................................................................................................................................................',
        doctorVisitRate: formData.doctorVisitRate || '........................',
        initialExamFee: formData.initialExamFee || '........................',
        totalServiceFee: formData.totalServiceFee || '........................',
        extraDoctorVisitFee: formData.extraDoctorVisitFee || '........................',
        finalGender: formData.gender || formData.finalGender || '',  // ✅ แก้บรรทัดนี้
        finalGender: patientInfo.finalGender,
      };

      console.log('Data prepared:', data);

      // Set data in template
      doc.setData(data);
      console.log('Data set in template');

      // Render the template
      doc.render();
      console.log('Template rendered');

      // Generate the document
      const blob = doc.getZip().generate({ type: 'blob' });
      console.log('Blob generated, size:', blob.size);

      // Save the file
      const fileName = `สัญญา_${formData.firstName || 'contract'}_${formData.lastName || 'document'}.docx`;
      saveAs(blob, fileName);
      console.log('File saved:', fileName);

      setError(null);
      alert('Export Word สำเร็จ!');
    } catch (error) {
      console.error('Error exporting to Word:', error);
      console.error('Error stack:', error.stack);
      console.error('Error properties:', error.properties);
      setError(`เกิดข้อผิดพลาดในการ export Word: ${error.message}`);
      alert(`Error: ${error.message}`);
    }
  };


  const fetchPatientById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patient: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch patient');
      }

      console.log('Fetched patient data:', result.data);


      const patientData = result.data;

      console.log('Patient data to set in form:', patientData);

      setFormData(prev => ({
        ...prev,
        hn: patientData.hn,
        prename: patientData.prename,
        firstName: patientData.first_name,
        lastName: patientData.last_name,
        idNumber: patientData.id_card,
      }));




      setPreviewUrl(patientData.profile_image);
    } catch (err) {
      console.error('Fetch patient error:', err);
      setError(`ไม่สามารถโหลดข้อมูลผู้ป่วยได้: ${err.message}`);
    } finally {
      setLoading(false);
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

  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/room?active=true`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        // เรียงตาม display_order
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

  useEffect(() => {
    fetchDepartments();
    fetchAvailablePackages();
    fetchAvailableMedical();
    fetchAvailableContracts();
    fetchRooms(); // เพิ่มบรรทัดนี้
  }, []);

  useEffect(() => {

    if (patientId) {
      setPatient_id(patientId);
      fetchPatientById(patientId);
    }
  }, [patientId]);

  useEffect(() => {
    const autoGenerateAnVn = async () => {
      if (formData.clinicType && departments.length > 0 && !formData.an && !patientId && !departmentsLoading && !generatingAnVn) {
        const selectedDept = departments.find(dept => dept.code === formData.clinicType);
        if (selectedDept) {
          try {
            const generatedNumber = isStrokeCenter()
              ? await generateAnVn('AN')
              : await generateAnVn('VN', selectedDept.code);

            if (generatedNumber) {
              setFormData(prev => ({ ...prev, an: generatedNumber }));
            }
          } catch (error) {
            console.error('Auto-generate failed:', error);
          }
        }
      }
    };

    const timeoutId = setTimeout(autoGenerateAnVn, 100);
    return () => clearTimeout(timeoutId);
  }, [formData.clinicType, departments, departmentsLoading, generatingAnVn]);

  const isStrokeCenter = () => {
    const selectedDept = departments.find(dept => dept.code === formData.clinicType);
    return selectedDept?.code === 'STROKE';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'clinicType' && value !== formData.clinicType) {
      setFormData(prev => ({ ...prev, an: '' }));
    }
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    const room = rooms.find(r => r.id === parseInt(roomId));

    if (room) {
      setSelectedRoom(room);

      // --- ส่วนที่เพิ่มเข้ามา ---
      // 1. กำหนดประเภทเริ่มต้นเป็น 'รายวัน'
      const defaultBillingType = 'รายวัน';
      // 2. ดึงราคาตามประเภทเริ่มต้น (หรือ 0 ถ้าไม่มี)
      const defaultPrice = room.daily_price || 0;
      // --- จบส่วนที่เพิ่มเข้ามา ---

      setFormData(prev => ({
        ...prev,
        building: room.room_number,
        roomTypeId: room.id,
        // --- อัปเดต state ด้วยค่าเริ่มต้น ---
        floor: defaultBillingType,
        price: defaultPrice.toString()
      }));

    } else {
      // ส่วนนี้ถูกต้องอยู่แล้ว (รีเซ็ตค่าเมื่อไม่ได้เลือกห้อง)
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

    // อัพเดทราคาตามประเภทที่เลือก
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

      const selectedDept = departments.find(dept => dept.code === formData.clinicType);
      if (!selectedDept) throw new Error('กรุณาเลือกคลินิก');
      if (!formData.hn) throw new Error('กรุณากรอก HN');
      if (!formData.an) throw new Error('กรุณา generate AN/VN');

      const patientType = isStrokeCenter() ? 'AN' : 'VN';

      const payload = {
        patientId: patient_id,
        departmentId: selectedDept.id,
        patientType: patientType,
        admissionId: null,
        drugIntolerance: null,
        profileImage: previewUrl,
        registrationDate: new Date().toISOString().split('T')[0],
        registrationTime: new Date().toTimeString().slice(0, 8),
        createdBy: 1
      };

      if (isStrokeCenter()) {
        payload.contractData = {
          startDate: formData.date,
          endDate: formData.toDate,
          roomType: formData.building,
          billingType: formData.floor,
          basePrice: parseInt(formData.price) || 0,
          totalPrice: calculateTotalPrice(),
          notes: null,
          packages: packageData.map(pkg => ({
            id: pkg.packageId || pkg.id,
            name: pkg.name,
            originalPrice: pkg.originalPrice || pkg.price,
            discountType: pkg.discount?.type || null,
            discountValue: pkg.discount?.value || 0,
            finalPrice: pkg.price
          })),
          medicalSupplies: medicalData.map(med => ({
            id: med.medicalId || med.id,
            name: med.name,
            originalPrice: med.originalPrice || med.price,
            discountType: med.discount?.type || null,
            discountValue: med.discount?.value || 0,
            finalPrice: med.price
          })),
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

      const response = await fetch(`${API_BASE_URL}/service-registrations`, {
        method: 'POST',
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

      alert(`บันทึกสำเร็จ! ${result.data.serviceNumber}`);
      setShowConfirmationModal(false);

      const clinicPath = selectedDept?.code.toLowerCase() || 'general-clinic';
      navigate(`/${clinicPath}`);
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex justify-end items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mr-auto">
              ผู้รับบริการวันที่ {currentDate}
            </h1>

            {isStrokeCenter() && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => exportToWord(formData, '/templates/CODE.docx', setError)}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <FileText className="w-4 h-4" />
                  <span>สัญญาจ้างทางการแพทย์</span>
                </button>
                <button
                  onClick={() => exportToWord(formData, '/templates/เอกสารAdmit.docx', setError)}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  📄 เอกสาร Admit
                </button>
              </div>

            )}


          </div>

          {/* Universal Search Section */}
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  {isStrokeCenter() ? 'AN' : 'VN'}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    name="an"
                    value={formData.an}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={isStrokeCenter() ? 'AN จะถูก generate อัตโนมัติ' : 'VN จะถูก generate อัตโนมัติ'}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAnVn}
                    className="flex-shrink-0 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={!formData.clinicType || generatingAnVn}
                  >
                    {generatingAnVn ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                </div>
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
                  <select
                    name="clinicType"
                    value={formData.clinicType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
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
              </div>
            </div>
          </div>

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
                    {roomsLoading && (
                      <p className="text-xs text-gray-500 mt-1">กำลังโหลดข้อมูลห้อง...</p>
                    )}
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
                    {!selectedRoom && (
                      <p className="text-xs text-gray-500 mt-1">เลือกห้องก่อน</p>
                    )}
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
                    {selectedRoom && (
                      <div className="text-xs text-gray-600 mt-1">
                        {formData.floor === 'รายวัน' && selectedRoom.daily_price && (
                          <span>รายวัน: {selectedRoom.daily_price.toLocaleString()} บาท</span>
                        )}
                        {formData.floor === 'รายสัปดาห์' && selectedRoom.weekly_price && (
                          <span>รายสัปดาห์: {selectedRoom.weekly_price.toLocaleString()} บาท</span>
                        )}
                        {formData.floor === 'รายเดือน' && selectedRoom.monthly_price && (
                          <span>รายเดือน: {selectedRoom.monthly_price.toLocaleString()} บาท</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* แสดงข้อมูลห้องที่เลือก */}
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
                      {selectedRoom.weekly_price && (
                        <div>
                          <span className="text-gray-600">รายสัปดาห์:</span>
                          <p className="font-medium text-green-600">
                            {selectedRoom.weekly_price.toLocaleString()} บาท
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
                      {selectedRoom.floor && (
                        <div>
                          <span className="text-gray-600">ชั้น:</span>
                          <p className="font-medium">{selectedRoom.floor}</p>
                        </div>
                      )}
                    </div>
                    {selectedRoom.description && (
                      <div className="mt-2">
                        <span className="text-gray-600">รายละเอียด:</span>
                        <p className="text-sm">{selectedRoom.description}</p>
                      </div>
                    )}
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
            </>
          )}

          <div className="flex justify-end space-x-4 mt-8 ">
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
                                {patient.first_name || patient.firstName} {patient.last_name || patient.lastName}
                              </h3>
                              <p className="text-sm text-blue-600">HN: {patient.hn}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                            <div>
                              <span className="text-gray-500">เลขบัตรประชาชน:</span>
                              <p className="font-medium">{patient.id_card || patient.idNumber || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">เพศ:</span>
                              <p className="font-medium">{patient.gender || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">วันเกิด:</span>
                              <p className="font-medium">{patient.date_of_birth || patient.dateOfBirth || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">เบอร์โทร:</span>
                              <p className="font-medium">{patient.phone || '-'}</p>
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