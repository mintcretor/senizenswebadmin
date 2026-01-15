import React, { useState, useEffect } from 'react';
import { Upload, ChevronDown, Plus, Edit, Trash2, X, Package, Search, FileText, LogOut } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api/baseapi';
import { generateBarcode } from '../utils/barcodeGenerator.js';
import { calculateMonthsAndDays } from '../utils/dateCalculator.js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { processPatientName } from '../utils/prenameUtils.js';
import { saveAs } from 'file-saver';

const formatThaiDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = (date.getFullYear() + 543).toString();
  return `${day}/${month}/${year}`;
};

export default function EditVN() {
  const navigate = useNavigate();
  const { vnId } = useParams();
  const location = useLocation();
  const vnFromState = location.state?.vnId || vnId;

  const [error, setError] = useState(null);

  // Discharge states
  const [discharged, setDischarged] = useState(false);
  const [dischargeLoading, setDischargeLoading] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischargeDate, setDischargeDate] = useState('');
  const [dischargeNotes, setDischargeNotes] = useState('');

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

  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patient_id, setPatient_id] = useState(null);
  const [service_id, setService_id] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  // Table data
  const [packageData, setPackageData] = useState([]);
  const [medicalData, setMedicalData] = useState([]);
  const [contractData, setContractData] = useState([]);


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

  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [availableMedical, setAvailableMedical] = useState([]);
  const [availableContracts, setAvailableContracts] = useState([]);
  const [selectedMedical, setSelectedMedical] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);

  // ✅ STEP 3: Fetch VN/Service Registration Data - ใช้ baseAPI + โหลด contract data
  const fetchServiceRegistration = async (vnId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/service-registrations/${vnId}`);

      console.log('✅ Fetched service registration:', response.data);

      const result = response.data;
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch service registration');
      }

      const serviceReg = result.data;
      setService_id(serviceReg.registration_id);
      setPatient_id(serviceReg.patient_id);
      const isDischargedStatus = serviceReg.status === 'discharged';
      setDischarged(isDischargedStatus);

      console.log('📋 Service Registration Data:', serviceReg);
      console.log('🔍 DEBUG serviceReg.age:', serviceReg.age, 'serviceReg.birth_date:', serviceReg.birth_date);

      // 🆕 ดึง patient data เพื่อได้ age
      let patientAge = '';
      let patientBirthDate = '';
      if (serviceReg.patient_id) {
        try {
          const patientResult = await api.get(`/patients/${serviceReg.patient_id}`);
          if (patientResult.data.success && patientResult.data.data) {
            patientAge = patientResult.data.data.age ? patientResult.data.data.age.toString() : '';
            patientBirthDate = patientResult.data.data.birth_date ? patientResult.data.data.birth_date.split('T')[0] : '';
            console.log('✅ Got patient data - age:', patientAge, 'birth_date:', patientBirthDate);
          }
        } catch (err) {
          console.error('Error fetching patient for age:', err);
        }
      }
      console.log('🔍 DEBUG before setFormData:');
      console.log('  serviceReg.service_number:', serviceReg.service_number);
      console.log('  typeof serviceReg.service_number:', typeof serviceReg.service_number);

      setFormData(prev => ({
        ...prev,
        hn: serviceReg.hn || '',
        prename: serviceReg.prename || '',
        firstName: serviceReg.first_name || '',
        lastName: serviceReg.last_name || '',
        idNumber: serviceReg.id_card || '',
        an: serviceReg.service_number || '',
        gender: serviceReg.gender || '',
        birth_date: patientBirthDate || serviceReg.birth_date ? serviceReg.birth_date.split('T')[0] : '',
        age: patientAge || (serviceReg.age ? serviceReg.age.toString() : ''),
        date: serviceReg.contract_start_date ? serviceReg.contract_start_date.split('T')[0] : '',
        toDate: serviceReg.contract_end_date ? serviceReg.contract_end_date.split('T')[0] : '',
        building: serviceReg.room_number || '',
        type: serviceReg.room_type || '',
        floor: serviceReg.billing_type || 'รายสัปดาห์',
        price: serviceReg.base_price?.toString() || '',
      }));

      setSelectedRoom({
        room_number: serviceReg.room_number || '',
        room_type: serviceReg.room_type || '',
      });

      // ============================================
      // ✅ โหลด packages/medical/contracts จาก contract object
      // ============================================
      if (serviceReg.contract) {
        console.log('📦 Processing contract data...');

        // ✅ Set packages
        if (serviceReg.contract.packages && Array.isArray(serviceReg.contract.packages)) {
          const formattedPackages = serviceReg.contract.packages.map(pkg => ({
            id: Date.now() + Math.random(),
            packageId: pkg.package_id || pkg.id,
            name: pkg.package_name || pkg.name,
            price: parseInt(pkg.final_price) || 0,
            originalPrice: parseInt(pkg.original_price) || 0,
            discount: {
              type: pkg.discount_type || null,
              value: parseInt(pkg.discount_value) || 0
            }
          }));
          setPackageData(formattedPackages);
          console.log('✅ Packages loaded:', formattedPackages);
        }

        // ✅ Set medical supplies
        if (serviceReg.contract.medical_supplies && Array.isArray(serviceReg.contract.medical_supplies)) {
          const formattedMedical = serviceReg.contract.medical_supplies.map(med => ({
            id: Date.now() + Math.random(),
            medicalId: med.medical_supply_id || med.id,
            name: med.item_name || med.name,
            price: parseInt(med.final_price) || 0,
            originalPrice: parseInt(med.original_price) || 0,
            discount: {
              type: med.discount_type || null,
              value: parseInt(med.discount_value) || 0
            }
          }));
          setMedicalData(formattedMedical);
          console.log('✅ Medical supplies loaded:', formattedMedical);
        }

        // ✅ Set contract items
        if (serviceReg.contract.contract_items && Array.isArray(serviceReg.contract.contract_items)) {
          const formattedContracts = serviceReg.contract.contract_items.map(con => ({
            id: Date.now() + Math.random(),
            contractId: con.contract_item_id || con.id,
            name: con.item_name || con.name,
            category: con.category || '',
            price: parseInt(con.final_price) || 0,
            originalPrice: parseInt(con.original_price) || 0,
            discount: {
              type: con.discount_type || null,
              value: parseInt(con.discount_value) || 0
            }
          }));
          setContractData(formattedContracts);
          console.log('✅ Contract items loaded:', formattedContracts);
        }
      } else {
        console.warn('⚠️ No contract data found');
        setPackageData([]);
        setMedicalData([]);
        setContractData([]);
      }

    } catch (err) {
      console.error('❌ Fetch service registration error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'ไม่สามารถโหลดข้อมูล VN ได้';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Discharge - Mock Function
  const handleDischarge = async () => {
    try {
      setDischargeLoading(true);
      setError(null);

      if (!dischargeDate) {
        setError('กรุณาเลือกวันที่จำหน่าย');
        return;
      }

      console.log('📤 Discharging patient:', {
        service_id,
        discharge_date: dischargeDate,
        discharge_notes: dischargeNotes
      });

      // ✅ เรียก API
      const response = await api.patch(
        `/service-registrations/${service_id}/discharge`,
        {
          discharge_date: dischargeDate,
          discharge_notes: dischargeNotes || null
        }
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'ไม่สามารถจำหน่ายผู้ป่วยได้');
      }

      console.log('✅ Discharge success:', result);

      // Update UI
      setDischarged(true);
      setFormData(prev => ({
        ...prev,
        toDate: dischargeDate
      }));

      // Close modal
      setShowDischargeModal(false);
      setDischargeDate('');
      setDischargeNotes('');

      alert('✅ จำหน่ายผู้ป่วยสำเร็จ!');

      // (Optional) Refresh ข้อมูล
      await fetchServiceRegistration(vnFromState);

    } catch (err) {
      console.error('❌ Discharge error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'เกิดข้อผิดพลาดในการจำหน่ายผู้ป่วย';
      setError(errorMsg);
    } finally {
      setDischargeLoading(false);
    }
  };

  const handleUndischarge = async () => {
    try {
      setDischargeLoading(true);
      setError(null);

      console.log('📤 Un-discharging patient:', { service_id });

      // ✅ เรียก API
      const response = await api.patch(
        `/service-registrations/${service_id}/undischarge`
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'ไม่สามารถยกเลิกการจำหน่ายได้');
      }

      console.log('✅ Un-discharge success:', result);

      // Update UI
      setDischarged(false);
      setFormData(prev => ({
        ...prev,
        toDate: '' // Clear discharge date
      }));

      alert('✅ ยกเลิกการจำหน่ายสำเร็จ!');

      // (Optional) Refresh ข้อมูล
      await fetchServiceRegistration(vnFromState);

    } catch (err) {
      console.error('❌ Un-discharge error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'เกิดข้อผิดพลาดในการยกเลิกการจำหน่าย';
      setError(errorMsg);
    } finally {
      setDischargeLoading(false);
    }
  };

  // ✅ STEP 4: Handle Universal Search - ใช้ baseAPI
  const handleUniversalSearch = async () => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setError('กรุณากรอกข้อมูลอย่างน้อย 2 ตัวอักษร');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const response = await api.get(`/patients/search`, {
        params: { q: searchQuery.trim() }
      });

      const results = response.data;
      if (results.data && results.data.length > 0) {
        setSearchResults(results.data);
        setShowSearchModal(true);
      } else {
        setSearchResults([]);
        setError('ไม่พบข้อมูลผู้ป่วย');
      }
    } catch (err) {
      console.error('❌ Error searching patients:', err);
      const errorMsg = err.response?.data?.error || 'เกิดข้อผิดพลาดในการค้นหา';
      setError(errorMsg);
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
      birth_date: patient.birth_date ? patient.birth_date.split('T')[0] : '',
      age: patient.age ? patient.age.toString() : '',
      gender: patient.gender || '',
    }));
    setPatient_id(patient.id);
    if (patient.profile_image) {
      setPreviewUrl(patient.profile_image);
    }

    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // ✅ STEP 5: Fetch Departments - ใช้ baseAPI
  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);

      const response = await api.get(`/departments`);

      const data = response.data;
      if (data.success && data.data) {
        const activeDepartments = data.data.filter(dept => dept.is_active);
        setDepartments(activeDepartments);
      }
    } catch (err) {
      console.error('❌ Error fetching departments:', err);
      const errorMsg = err.response?.data?.error || err.message;
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลแผนก: ${errorMsg}`);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // ✅ STEP 6: Fetch Rooms - ใช้ baseAPI
  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);

      const response = await api.get(`/room`, {
        params: { active: true }
      });

      const data = response.data;
      if (data.success && data.data) {
        const sortedRooms = data.data.sort((a, b) =>
          (a.display_order || 0) - (b.display_order || 0)
        );
        setRooms(sortedRooms);
      }
    } catch (err) {
      console.error('❌ Error fetching rooms:', err);
      const errorMsg = err.response?.data?.error || err.message;
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลห้อง: ${errorMsg}`);
    } finally {
      setRoomsLoading(false);
    }
  };

  // ✅ STEP 7: Fetch Available Packages - ใช้ baseAPI
  const fetchAvailablePackages = async () => {
    try {
      const response = await api.get(`/packages`, {
        params: { active: true }
      });

      const result = response.data;
      if (result.success) {
        setAvailablePackages(result.data);
      }
    } catch (error) {
      console.error('❌ Error fetching packages:', error);
    }
  };

  // ✅ STEP 8: Fetch Available Medical - ใช้ baseAPI
  const fetchAvailableMedical = async () => {
    try {
      const response = await api.get(`/medical`, {
        params: { active: true }
      });

      const result = response.data;
      if (result.success) {
        setAvailableMedical(result.data);
      }
    } catch (error) {
      console.error('❌ Error fetching medical:', error);
    }
  };

  // ✅ STEP 9: Fetch Available Contracts - ใช้ baseAPI
  const fetchAvailableContracts = async () => {
    try {
      const response = await api.get(`/contracts`, {
        params: { active: true }
      });

      const result = response.data;
      if (result.success) {
        setAvailableContracts(result.data);
      }
    } catch (error) {
      console.error('❌ Error fetching contracts:', error);
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
    console.log('🏠 Room changed to:', e.target.value);
    console.log('Available rooms:', rooms);
    const roomId = e.target.value;
    const room = rooms.find(r => r.room_number === roomId);
    console.log('Selected room object:', room);

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
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // ✅ STEP 2: Calculate Total Price - ใช้ parseInt()
  const calculateTotalPrice = () => {
    const basePrice = parseInt(formData.price) || 0;
    const packageTotal = packageData.reduce((sum, item) => {
      return sum + (parseInt(item.price) || 0);
    }, 0);
    const medicalTotal = medicalData.reduce((sum, item) => {
      return sum + (parseInt(item.price) || 0);
    }, 0);
    const contractTotal = contractData.reduce((sum, item) => {
      return sum + (parseInt(item.price) || 0);
    }, 0);

    const total = basePrice + packageTotal + medicalTotal + contractTotal;
    console.log(`✅ calculateTotalPrice: ${basePrice} + ${packageTotal} + ${medicalTotal} + ${contractTotal} = ${total}`);
    return total;
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

  const exportToWord = async (formData, templatePath, setError) => {
    try {
      console.log('Starting Word export...');
      console.log('Form data:', formData);

      // 👇 เพิ่มตรงนี้
      const now = new Date();
      const dateNow = formatThaiDate(now);        // "05/12/2568"
      const timeNow = formatThaiTime(now);        // "15:30:45"
      const effectiveDate = formatWesternDate(now); // "5 Dec 2024"

      console.log('Effective Date:', effectiveDate);
      // 👆 จบ

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

      console.log('🔍 DEBUG - formData.age:', formData.age, 'type:', typeof formData.age);

      // Prepare data for template
      const data = {
        hn: formData.hn || '',
        an: formData.an || '',
        prename: formData.prename || '',
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        birthDate: formData.birth_date || '..........................................',
        age: formData.age ? formData.age.toString() : '................................................',
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
        finalGender: patientInfo.finalGender,
        // ✅ แล้วเพิ่มต่อด้วย:
        dateNow: dateNow,                          // "05/12/2568"
        timeNow: timeNow,                          // "15:30:45"
        dateTimeNow: `${dateNow} ${timeNow}`,      // "05/12/2568 15:30:45"
        effectiveDate: effectiveDate,               // "5 Dec 2024"

      };

      console.log('Data prepared:', data);
      console.log('🔍 DEBUG - data.age:', data.age, 'type:', typeof data.age);

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
    console.log('🔍 Current formData before export:', formData);
    console.log('🔍 formData.age:', formData.age);
    setShowConfirmationModal(true);
  };

  // ✅ STEP 10: Handle Confirm Save - ใช้ baseAPI + snake_case + parseInt
  const handleConfirmSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // ============ VALIDATION ============
      if (!patient_id) {
        throw new Error('❌ กรุณาเลือกผู้ป่วยก่อน');
      }
      if (!formData.hn) {
        throw new Error('❌ กรุณากรอก HN');
      }
      if (!formData.an) {
        throw new Error('❌ กรุณากรอก AN');
      }
      if (!formData.date) {
        throw new Error('❌ กรุณาเลือกวันที่เริ่มต้น');
      }
      if (!formData.toDate) {
        throw new Error('❌ กรุณาเลือกวันที่สิ้นสุด');
      }
      if (!formData.building) {
        throw new Error('❌ กรุณาเลือกห้อง');
      }
      if (!formData.price || parseInt(formData.price) <= 0) {
        throw new Error('❌ กรุณากรอกราคาที่มากกว่า 0');
      }

      // ============ FIND DEPARTMENT ============
      const strokeDept = departments.find(d => d.code === 'STROKE');
      if (!strokeDept) {
        console.error('Available departments:', departments);
        throw new Error('❌ ไม่พบแผนก STROKE ในระบบ');
      }

      // ============ CONVERT TO NUMBER ============
      const basePrice = parseInt(formData.price) || 0;
      const totalPrice = calculateTotalPrice();

      console.log('📋 DEBUG INFO:');
      console.log('  patient_id:', patient_id);
      console.log('  service_id:', service_id);
      console.log('  basePrice:', basePrice, '(type:', typeof basePrice + ')');
      console.log('  totalPrice:', totalPrice, '(type:', typeof totalPrice + ')');
      console.log('  packageData items:', packageData.length);
      console.log('  medicalData items:', medicalData.length);
      console.log('  contractData items:', contractData.length);

      // ============ BUILD PAYLOAD (snake_case) ============
      const payload = {
        patient_id: patient_id,
        department_id: strokeDept.id,
        patient_type: 'AN',
        profile_image: previewUrl || null,
        contract_data: {
          start_date: formData.date,
          end_date: formData.toDate,
          room_number: formData.building,
          billing_type: formData.floor,
          base_price: basePrice,
          total_price: totalPrice,
          notes: null,
          packages: packageData.map(pkg => ({
            id: pkg.packageId || pkg.id,
            name: pkg.name,
            original_price: parseInt(pkg.originalPrice || pkg.price) || 0,
            discount_type: pkg.discount?.type || null,
            discount_value: parseInt(pkg.discount?.value) || 0,
            final_price: parseInt(pkg.price) || 0
          })),
          medical_supplies: medicalData.map(med => ({
            id: med.medicalId || med.id,
            name: med.name,
            original_price: parseInt(med.originalPrice || med.price) || 0,
            discount_type: med.discount?.type || null,
            discount_value: parseInt(med.discount?.value) || 0,
            final_price: parseInt(med.price) || 0
          })),
          contract_items: contractData.map(con => ({
            id: con.contractId || con.id,
            name: con.name,
            category: con.category || '',
            original_price: parseInt(con.originalPrice || con.price) || 0,
            discount_type: con.discount?.type || null,
            discount_value: parseInt(con.discount?.value) || 0,
            final_price: parseInt(con.price) || 0
          }))
        }
      };

      console.log('📤 SENDING PAYLOAD:', JSON.stringify(payload, null, 2));

      // ============ SEND REQUEST (ใช้ baseAPI) ============
      const response = await api.put(`/service-registrations/${service_id}`, payload);

      console.log('✅ SUCCESS RESPONSE:', response.data);

      alert('✅ แก้ไขข้อมูลสำเร็จ!');
      setShowConfirmationModal(false);

      setTimeout(() => {
        navigate('/stroke-center');
      }, 1000);

    } catch (err) {
      console.error('❌ ERROR:', err.message);
      console.error('Full error:', err);

      const errorMsg = err.response?.data?.error
        || err.response?.data?.message
        || err.message
        || 'เกิดข้อผิดพลาดในการบันทึก';

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if ((departmentsLoading && !formData.hn)) {
    return (
      <div className="flex min-h-screen bg-slate-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            กำลังโหลดข้อมูลแผนก...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex-1 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Header + Export Buttons */}
          <div className="flex justify-between items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mr-auto">
              แก้ไขข้อมูลผู้รับบริการ (VN)
            </h1>

            <div className="flex items-center space-x-4">

              <button
                onClick={() => exportToWord(formData, '/templates/CODE1.docx', setError)}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <FileText className="w-4 h-4" />
                <span>สัญญาจ้างทางการแพทย์</span>
              </button>
              <button
                onClick={() => exportToWord(formData, '/templates/สัญญาเงื่อนไขและข้อตกลงการซื้อคอร์ส.docx', setError)}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <FileText className="w-4 h-4" />
                <span>สัญญาเงื่อนไขและข้อตกลงการซื้อคอร์ส</span>
              </button>
              <button
                onClick={() => exportToWord(formData, '/templates/เอกสารAdmitnoan.docx', setError)}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                📄 เอกสาร Admit
              </button>
              <button
                onClick={() => exportToWord(formData, '/templates/เอกสารแนบสัญญา.docx', setError)}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                📄 เอกสารแนบสัญญา
              </button>
              <button
                onClick={() => exportToWord(formData, '/templates/เอกสารผู้ป่วยโรคหลอดเลือดสมอง.docx', setError)}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                📄 เอกสารผู้ป่วยโรคหลอดเลือดสมอง
              </button>

              


            </div>
          </div>

          {/* Search Section */}
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

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
              <button onClick={() => setError(null)} className="mt-2 text-sm text-red-500 hover:text-red-700">
                ปิดข้อความ
              </button>
            </div>
          )}

          {/* Discharge Status Section */}
          <div className="mb-6 p-4 border-2 rounded-lg" style={{
            borderColor: discharged ? '#dc2626' : '#10b981',
            backgroundColor: discharged ? '#fee2e2' : '#f0fdf4'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogOut className={`w-6 h-6 ${discharged ? 'text-red-600' : 'text-green-600'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-700">สถานะผู้ป่วย</p>
                  <p className={`text-lg font-bold ${discharged ? 'text-red-600' : 'text-green-600'}`}>
                    {discharged ? '❌ ออกจากศูนย์แล้ว' : '✅ อยู่ในศูนย์'}
                  </p>
                  {discharged && formData.toDate && (
                    <p className="text-sm text-gray-600 mt-1">วันจำหน่าย: {formData.toDate}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (!discharged) {
                    setShowDischargeModal(true);
                  } else {
                    if (window.confirm('ต้องการยกเลิกการจำหน่ายผู้ป่วยหรือไม่?')) {
                      handleUndischarge();
                    }
                  }
                }}
                disabled={dischargeLoading}
                className={`px-6 py-3 font-semibold rounded-lg text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${discharged
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                <LogOut className="w-4 h-4" />
                {discharged ? 'ยกเลิกการจำหน่าย' : 'จำหน่ายผู้ป่วย'}
              </button>
            </div>
          </div>

          {/* Patient Info Section */}
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
                <label className="text-sm font-medium text-gray-700 mb-2">วันเกิด</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">อายุ</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
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
                    value={selectedRoom?.room_number || ''}
                    onChange={handleRoomChange}
                    disabled={roomsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="">เลือกห้อง</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.room_number}>
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

          {/* Tables Section (Packages, Medical, Contracts) */}
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

          {/* Save/Cancel Buttons */}
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

      {/* All Modals... */}
      {/* Discharge Modal */}
      {showDischargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">จำหน่ายผู้ป่วย</h3>
              <button onClick={() => setShowDischargeModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">วันที่จำหน่าย</label>
                <input
                  type="date"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ (ไม่จำเป็น)</label>
                <textarea
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="กรอกหมายเหตุเพิ่มเติม..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDischargeModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDischarge}
                disabled={dischargeLoading || !dischargeDate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dischargeLoading ? 'กำลังบันทึก...' : 'ยืนยันการจำหน่าย'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPackageForPatient?.id === pkg.id
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
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedMedical?.id === item.id
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
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedContract?.id === item.id
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
                {modalType === 'package' && ' คอร์สแพ็คเกจกายภาพ'}
                {modalType === 'medical' && ' รายการเหมาเวชภัณฑ์'}
                {modalType === 'contract' && ' รายการเหมา'}
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
              <p><strong>วันเกิด:</strong> {formData.birth_date}</p>
              <p><strong>อายุ:</strong> {formData.age} ปี</p>
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