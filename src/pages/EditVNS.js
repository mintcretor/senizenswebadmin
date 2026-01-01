import React, { useState, useEffect } from 'react';
import { Upload, ChevronDown, Plus, Edit, Trash2, X, Package, Search, FileText, LogOut, Printer } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api/baseapi';

const formatThaiDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = (date.getFullYear() + 543).toString();
  return `${day}/${month}/${year}`;
};

const formatDateToThai = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return formatThaiDate(date);
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

  // Print states
  const [isPrinting, setIsPrinting] = useState(false);

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

  // ✅ Print VN Document to PDF
  const handlePrintVN = async () => {
    try {
      setIsPrinting(true);
      setError(null);

      // สร้าง HTML สำหรับพิมพ์
      const printContent = generatePrintHTML();

      // เปิดหน้าต่างใหม่สำหรับพิมพ์
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();

      // รอให้โหลดเสร็จแล้วพิมพ์
      printWindow.onload = () => {
        printWindow.print();
        setIsPrinting(false);
      };

    } catch (err) {
      console.error('❌ Print error:', err);
      setError('เกิดข้อผิดพลาดในการพิมพ์เอกสาร');
      setIsPrinting(false);
    }
  };

  // ✅ Generate HTML for printing - แบบฟอร์ม VN จริง
  const generatePrintHTML = () => {
    const today = new Date();
    const thaiDate = formatThaiDate(today);
    const totalPrice = calculateTotalPrice();

    // แปลงวันเกิดเป็นภาษาไทย
    const birthDate = formData.birth_date ? new Date(formData.birth_date) : null;
    const birthDateThai = birthDate ? formatThaiDate(birthDate) : '-';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>VN: ${formData.an}</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        body {
          font-family: 'Sarabun', 'TH SarabunPSK', sans-serif;
          padding: 15px;
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .logo {
          width: 60px;
          height: 60px;
        }
        
        .hospital-name {
          font-size: 20px;
          font-weight: bold;
        }
        
        .vn-box {
          text-align: center;
        }
        
        .vn-label {
          font-size: 12px;
          margin-bottom: 5px;
        }
        
        .vn-number-box {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: bold;
        }
        
        .vn-number {
          border: 2px solid #000;
          padding: 5px 15px;
          min-width: 100px;
          text-align: center;
        }
        
        .print-date {
          font-size: 11px;
          margin-top: 5px;
        }
        
        .contract-label {
          font-size: 12px;
          margin-bottom: 3px;
        }
        
        .patient-info {
          margin-bottom: 15px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .info-row strong {
          min-width: 60px;
          font-weight: bold;
        }
        
        .info-field {
          border-bottom: 1px dotted #666;
          flex: 1;
          padding: 0 5px;
        }
        
        .flex-row {
          display: flex;
          gap: 30px;
          margin-bottom: 8px;
        }
        
        .flex-item {
          flex: 1;
        }
        
        .section-header {
          background: #f0f0f0;
          padding: 5px 10px;
          font-weight: bold;
          margin: 15px 0 10px 0;
          border-left: 4px solid #333;
          font-size: 14px;
        }
        
        .doctor-section {
          margin: 15px 0;
        }
        
        .doctor-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 5px;
        }
        
        .doctor-table th {
          background: #f5f5f5;
          border: 1px solid #ccc;
          padding: 5px;
          font-size: 12px;
          text-align: center;
        }
        
        .doctor-table td {
          border: 1px solid #ccc;
          padding: 5px;
          height: 25px;
        }
        
        .checkbox-section {
          margin: 15px 0;
        }
        
        .checkbox-title {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
        }
        
        .checkbox {
          width: 15px;
          height: 15px;
          border: 1px solid #333;
          display: inline-block;
        }
        
        .checkbox.checked::before {
          content: '✓';
          font-weight: bold;
          display: block;
          text-align: center;
          line-height: 15px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 12px;
        }
        
        table th {
          background: #e8e8e8;
          border: 1px solid #999;
          padding: 6px;
          text-align: left;
          font-weight: bold;
        }
        
        table td {
          border: 1px solid #ccc;
          padding: 5px;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .total-section {
          margin-top: 15px;
          border: 2px solid #333;
          padding: 10px;
          background: #f9f9f9;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 13px;
        }
        
        .total-row.grand-total {
          border-top: 2px solid #333;
          margin-top: 8px;
          padding-top: 8px;
          font-size: 16px;
          font-weight: bold;
        }
        
        .contact-section {
          margin: 15px 0;
          border: 1px solid #ccc;
          padding: 10px;
        }
        
        .contact-title {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .signature-section {
          margin-top: 30px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-line {
          border-top: 1px solid #333;
          margin: 50px 20px 8px 20px;
          padding-top: 5px;
          font-size: 12px;
        }
        
        .barcode-section {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 11px;
        }
        
        .barcode {
          text-align: left;
        }
        
        .entry-info {
          text-align: right;
        }
        
        .footer-note {
          margin-top: 15px;
          font-size: 11px;
          color: #666;
          text-align: center;
        }
        
        .status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
          margin-left: 10px;
        }
        
        .status-active {
          background: #c6f6d5;
          color: #22543d;
          border: 1px solid #22543d;
        }
        
        .status-discharged {
          background: #fed7d7;
          color: #742a2a;
          border: 1px solid #742a2a;
        }

        .underline {
          border-bottom: 1px dotted #999;
          display: inline-block;
          min-width: 200px;
          padding: 0 5px;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          <div class="logo">
  <img src="/images/logo.png" alt="SENIZENS Logo" style="width: 60px; height: 60px; object-fit: contain;" />
</div>
          <div>
            <div class="hospital-name">SENIZENS</div>
            <div class="contract-label">Contract ผู้ป่วยทั่วไป</div>
          </div>
        </div>
        
        <div class="vn-box">
          <div class="vn-label">ใบนำส่งผู้ป่วย (VN Slip)</div>
          <div class="vn-number-box">
            <strong>VN :</strong>
            <div class="vn-number">${formData.an || '-'}</div>
          </div>
          <div class="print-date">วันที่พิมพ์ ${thaiDate}</div>
        </div>
      </div>

      <!-- Patient Info -->
      <div class="patient-info">
        <div class="info-row">
          <strong>HN</strong>
          <div class="info-field">${formData.hn || '-'}</div>
          <strong style="margin-left: 20px;">ID / Passport No. :</strong>
          <div class="info-field">${formData.idNumber || '-'}</div>
        </div>
        
        <div class="info-row">
          <strong>ชื่อ</strong>
          <div class="info-field">${formData.prename || ''} ${formData.firstName || ''} ${formData.lastName || ''}</div>
        </div>
        
        <div class="flex-row">
          <div class="flex-item">
            <strong>วันเกิด</strong> <span class="underline">${birthDateThai}</span>
          </div>
          <div class="flex-item">
            <strong>เพศ</strong> <span class="underline">${formData.gender || '-'}</span>
          </div>
          <div class="flex-item">
            <strong>อายุ</strong> <span class="underline">${formData.age || '-'} ปี</span>
          </div>
          <div class="flex-item">
            <strong>กรุ๊ปเลือด</strong> <span class="underline">-</span>
          </div>
        </div>
        
        <div class="info-row">
          <strong>ที่อยู่</strong>
          <div class="info-field">${formData.address || '-'}</div>
        </div>
      </div>

      <!-- Doctor Section -->
      <div class="doctor-section">
        <div class="section-header">แพทย์ผู้รักษา</div>
        <table class="doctor-table">
          <thead>
            <tr>
              <th style="width: 40%;">Doctor Name</th>
              <th style="width: 30%;">Doctor Code</th>
              <th style="width: 30%;">Clinic</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>-</td>
              <td class="text-center">-</td>
              <td class="text-center">-</td>
            </tr>
            <tr>
              <td>-</td>
              <td class="text-center">-</td>
              <td class="text-center">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Checkbox Sections -->
      <div class="checkbox-section">
        <div class="checkbox-title">สำหรับ</div>
        <div class="checkbox-grid">
          <div class="checkbox-item">
            <span class="checkbox"></span> LAB
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span> X-ray
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span> กายภาพ
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span> Hemodialysis
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span> Injection
          </div>
          <div class="checkbox-item">
            <span class="checkbox"></span> Dressing
          </div>
           <div class="checkbox-item">
            <span class="checkbox"></span> Wellness
          </div>
        </div>
      </div>

      
      <!-- Contact Section -->
      <div class="contact-section">
        <div class="contact-title">ข้อมูลการติดต่อ</div>
        <div>
          <strong>ที่อยู่:</strong> <span class="underline" style="min-width: 400px;">${formData.address || '-'}</span>
        </div>
        <div class="flex-row" style="margin-top: 5px;">
          <div><strong>โทร:</strong> <span class="underline">${formData.phone || '-'}</span></div>
          <div><strong>Email:</strong> <span class="underline">${formData.email || '-'}</span></div>
        </div>
      </div>

      <!-- Signatures -->
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line">
            ผู้บันทึก
          </div>
          <div style="font-size: 11px;">วันที่ ....../....../......</div>
        </div>
        <div class="signature-box">
          <div class="signature-line">
            ผู้ตรวจสอบ
          </div>
          <div style="font-size: 11px;">วันที่ ....../....../......</div>
        </div>
      </div>

      <!-- Barcode & Entry Info -->
      <div class="barcode-section">
        <div class="barcode">
         
          
        </div>
        <div class="entry-info">
          <div>Entry by: -</div>
          <div>CODE: OPDLOG</div>
          <div>PROG: OPD</div>
        </div>
      </div>

      <div class="footer-note">
        เอกสารนี้พิมพ์จากระบบ SENIZENS | VN: ${formData.an} | พิมพ์เมื่อ: ${thaiDate}
      </div>
    </body>
    </html>
  `;
  };
  // ... (rest of the existing code remains the same until the return statement)

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
      setDischarged(serviceReg.discharged || false);

      console.log('📋 Service Registration Data:', serviceReg);
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
        type: serviceReg.room_type || '',
        description: serviceReg.description || '',
        floor: serviceReg.billing_type || 'รายสัปดาห์',
        price: serviceReg.base_price?.toString() || '',
      }));
      setSelectedRoom({
        room_number: serviceReg.room_number || '',
        room_type: serviceReg.room_type || '',
      });

      if (serviceReg.contract) {
        console.log('📦 Processing contract data...');

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

  const handleDischarge = async () => {
    try {
      setDischargeLoading(true);
      setError(null);

      if (!dischargeDate) {
        setError('กรุณาเลือกวันที่จำหน่าย');
        return;
      }

      console.log('📤 Mock: Discharge patient', {
        service_id,
        discharge_date: dischargeDate,
        discharge_notes: dischargeNotes
      });

      setDischarged(true);
      setFormData(prev => ({
        ...prev,
        toDate: dischargeDate
      }));

      setShowDischargeModal(false);
      setDischargeDate('');
      setDischargeNotes('');

      alert('✅ จำหน่ายผู้ป่วยสำเร็จ!');

    } catch (err) {
      console.error('❌ Discharge error:', err);
      setError('เกิดข้อผิดพลาดในการจำหน่ายผู้ป่วย');
    } finally {
      setDischargeLoading(false);
    }
  };

  const handleUndischarge = async () => {
    try {
      setDischargeLoading(true);
      setError(null);

      console.log('📤 Mock: Un-discharge patient', {
        service_id
      });

      setDischarged(false);

      alert('✅ ยกเลิกการจำหน่ายสำเร็จ!');

    } catch (err) {
      console.error('❌ Un-discharge error:', err);
      setError('เกิดข้อผิดพลาดในการยกเลิกการจำหน่าย');
    } finally {
      setDischargeLoading(false);
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

      if (!patient_id) {
        throw new Error('❌ กรุณาเลือกผู้ป่วยก่อน');
      }
      if (!formData.hn) {
        throw new Error('❌ กรุณากรอก HN');
      }
      if (!formData.an) {
        throw new Error('❌ กรุณากรอก VN');
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

      const strokeDept = departments.find(d => d.code === 'STROKE');
      if (!strokeDept) {
        console.error('Available departments:', departments);
        throw new Error('❌ ไม่พบแผนก STROKE ในระบบ');
      }

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

      const payload = {
        patient_id: patient_id,
        department_id: strokeDept.id,
        patient_type: 'VN',
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
          <div className="flex justify-between items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mr-auto">
              แก้ไขข้อมูลผู้รับบริการ (VN)
            </h1>

            {/* ✅ Print Button */}
            <button
              onClick={handlePrintVN}
              disabled={isPrinting || !formData.an}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPrinting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>กำลังเตรียม...</span>
                </>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  <span>พิมพ์เอกสาร VN</span>
                </>
              )}
            </button>
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
                    {discharged ? '❌ ออกจากโรงพยาบาลแล้ว' : '✅ อยู่ในโรงพยาบาล'}
                  </p>
                  {discharged && formData.toDate && (
                    <p className="text-sm text-gray-600 mt-1">วันจำหน่าย: {formatDateToThai(formData.toDate)}</p>
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
                    value={formData.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* All modals remain the same... */}
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




    </div>
  );
}